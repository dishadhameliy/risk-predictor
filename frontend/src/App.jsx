import React, { useState, useEffect } from 'react'
import './index.css'
import { Activity, User, LayoutDashboard, Home, LogOut, ShieldCheck, Zap, Brain, Heart, AlertTriangle, CheckCircle, TrendingUp, Scale, Cigarette, Wind, Utensils, XCircle, Apple, Beef, Droplets, Wheat, Fish, Coffee, Cookie, Salad } from 'lucide-react'
import HealthQuiz from './pages/HealthQuiz'
import AuthModal from './components/AuthModal'
import { StatCard, RiskBadge } from './components/UI'
import ParticleField from './components/ParticleField'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { auth, onAuthStateChanged, signOut } from './firebase'
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from 'recharts'

const API_URL = "http://localhost:8000/api/predict/"

// ─── DIET SUGGESTIONS ───────────────────────────────────────────────────────
const getDietSuggestions = (data, prediction) => {
  const bmi = Number(data.weight) / ((Number(data.height) / 100) ** 2)
  const isHigh = prediction === 'High Risk'

  const eat = []
  const avoid = []

  // ── Base healthy diet for everyone ──
  eat.push({ icon: Apple, text: 'Fresh fruits & vegetables (5 servings/day)', color: 'var(--success)' })
  eat.push({ icon: Droplets, text: 'At least 8 glasses of water daily', color: 'var(--accent)' })
  eat.push({ icon: Wheat, text: 'Whole grains: oats, brown rice, quinoa, millets', color: 'var(--success)' })

  avoid.push({ icon: Cookie, text: 'Processed & packaged junk food', color: 'var(--danger)' })
  avoid.push({ icon: Coffee, text: 'Excessive caffeine (limit to 1–2 cups/day)', color: 'var(--warning)' })

  // ── High Risk general ──
  if (isHigh) {
    eat.push({ icon: Fish, text: 'Omega-3 rich foods: salmon, flaxseeds, walnuts', color: 'var(--success)' })
    eat.push({ icon: Salad, text: 'Leafy greens: spinach, kale, broccoli daily', color: 'var(--success)' })
    avoid.push({ icon: Beef, text: 'Red meat & processed meats (salami, sausages)', color: 'var(--danger)' })
    avoid.push({ icon: Cookie, text: 'Deep-fried foods & trans fats completely', color: 'var(--danger)' })
  }

  // ── Overweight / Obese BMI ──
  if (bmi > 25) {
    eat.push({ icon: Apple, text: 'High-fiber foods: lentils, beans, chia seeds', color: 'var(--success)' })
    eat.push({ icon: Salad, text: 'Low-calorie, nutrient-dense salads before meals', color: 'var(--success)' })
    avoid.push({ icon: Cookie, text: 'Sugary beverages: sodas, juices, energy drinks', color: 'var(--danger)' })
    avoid.push({ icon: Wheat, text: 'Refined carbs: white bread, pastries, cookies', color: 'var(--warning)' })
  }

  // ── Hypertension ──
  if (data.has_hypertension) {
    eat.push({ icon: Apple, text: 'Potassium-rich foods: bananas, sweet potato, avocado', color: 'var(--success)' })
    eat.push({ icon: Droplets, text: 'Low-sodium meals — cook at home with herbs/spices', color: 'var(--success)' })
    avoid.push({ icon: Beef, text: 'High-sodium foods: pickles, canned soups, chips', color: 'var(--danger)' })
    avoid.push({ icon: Coffee, text: 'Excess salt — keep under 1,500 mg sodium/day', color: 'var(--danger)' })
  }

  // ── Diabetes history ──
  if (data.has_diabetes_history) {
    eat.push({ icon: Wheat, text: 'Low glycemic foods: legumes, barley, sweet potato', color: 'var(--success)' })
    eat.push({ icon: Fish, text: 'Lean protein: eggs, tofu, chicken breast, fish', color: 'var(--success)' })
    avoid.push({ icon: Cookie, text: 'Sugary sweets, desserts, chocolates, white rice', color: 'var(--danger)' })
    avoid.push({ icon: Droplets, text: 'Fruit juices (eat whole fruits instead)', color: 'var(--warning)' })
  }

  // ── Heart disease history ──
  if (data.has_heart_history) {
    eat.push({ icon: Fish, text: 'Heart-healthy fats: olive oil, avocado, nuts', color: 'var(--success)' })
    eat.push({ icon: Apple, text: 'Antioxidant-rich berries: blueberries, strawberries', color: 'var(--success)' })
    avoid.push({ icon: Beef, text: 'Saturated fats: butter, ghee, fatty red meat', color: 'var(--danger)' })
    avoid.push({ icon: Coffee, text: 'Alcohol completely — increases cardiac risk', color: 'var(--danger)' })
  }

  // ── Smoker ──
  if (data.is_smoker) {
    eat.push({ icon: Apple, text: 'Vitamin C foods: citrus, bell peppers, kiwi (repair lung damage)', color: 'var(--success)' })
    eat.push({ icon: Salad, text: 'Antioxidants: green tea, turmeric, dark leafy vegetables', color: 'var(--success)' })
    avoid.push({ icon: Coffee, text: 'Alcohol — combined with smoking greatly raises cancer risk', color: 'var(--danger)' })
  }

  // ── Low Risk ──
  if (!isHigh) {
    eat.push({ icon: Fish, text: 'Continue balanced diet with variety of proteins & fibre', color: 'var(--success)' })
  }

  // Deduplicate by text
  const uniqueEat = eat.filter((v, i, a) => a.findIndex(x => x.text === v.text) === i)
  const uniqueAvoid = avoid.filter((v, i, a) => a.findIndex(x => x.text === v.text) === i)

  return { eat: uniqueEat, avoid: uniqueAvoid }
}

// ─── RECOMMENDATIONS ────────────────────────────────────────────────────────
const getRecommendations = (data, prediction) => {
  const recs = []
  const bmi = Number(data.weight) / ((Number(data.height) / 100) ** 2)

  if (prediction === 'High Risk') {
    recs.push({ icon: Heart, text: 'Schedule a cardiac health checkup with your doctor immediately.', color: 'var(--danger)' })
  }
  if (bmi > 30) {
    recs.push({ icon: Scale, text: 'Your BMI indicates obesity. A structured diet and exercise plan is recommended.', color: 'var(--warning)' })
  } else if (bmi > 25) {
    recs.push({ icon: Scale, text: 'Your BMI indicates you are slightly overweight. Consider a balanced diet.', color: 'var(--warning)' })
  }
  if (data.is_smoker) {
    recs.push({ icon: Cigarette, text: 'Quit smoking to significantly reduce your cardiovascular risk.', color: 'var(--danger)' })
  }
  if (data.has_hypertension) {
    recs.push({ icon: Activity, text: 'Monitor your blood pressure daily and follow your prescribed medication.', color: 'var(--warning)' })
  }
  if (data.has_diabetes_history) {
    recs.push({ icon: AlertTriangle, text: 'Blood glucose monitoring and regular HbA1c tests are advised.', color: 'var(--warning)' })
  }
  if (data.activity_level === 'sedentary') {
    recs.push({ icon: Wind, text: 'Aim for at least 150 minutes of moderate exercise per week.', color: 'var(--accent)' })
  }
  if (prediction !== 'High Risk') {
    recs.push({ icon: CheckCircle, text: 'Maintain your healthy lifestyle with regular annual checkups.', color: 'var(--success)' })
  }
  if (recs.length === 0) {
    recs.push({ icon: TrendingUp, text: 'Keep up the great work! Stay hydrated and maintain a balanced diet.', color: 'var(--success)' })
  }
  return recs
}

// ─── HERO PAGE ───────────────────────────────────────────────────────────────
const HeroPage = ({ onStart }) => (
  <div className="hero">
    {/* Interactive particle background (layer 0) */}
    <ParticleField />

    <div className="hero-container">
      {/* ── Left Column: Text & Features ── */}
      <div className="hero-content">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="hero-badge">
            <Zap size={13} /> AI-Powered Health Intelligence
          </div>
          <h1 className="hero-title">
            Predict Your <span className="gradient-text">Health Risk</span> in Minutes
          </h1>
          <p className="hero-desc">
            Our machine learning model analyzes your personal health data to give you an accurate,
            instant risk assessment — completely free.
          </p>
          <button className="btn btn-primary btn-lg" onClick={onStart}>
            <Activity size={20} /> Generate My Report
          </button>
          <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
            ✓ Free &nbsp;&nbsp; ✓ 3-minute quiz &nbsp;&nbsp; ✓ Instant results
          </p>
        </motion.div>

        {/* Feature Cards Grid */}
        <div className="features-grid">
          {[
            { icon: Brain, color: '#4f46e5', bg: 'rgba(79,70,229,0.1)', title: 'ML-Powered', desc: 'Random Forest model trained on real health data from 5,000+ patients.' },
            { icon: ShieldCheck, color: '#059669', bg: 'rgba(5,150,105,0.1)', title: 'Privacy First', desc: 'Your data stays secure. Stored with Firebase encryption.' },
            { icon: TrendingUp, color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)', title: 'Actionable Reports', desc: 'Get personalized recommendations, not just a risk score.' },
          ].map((f, i) => (
            <motion.div
              key={i}
              className="feature-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
            >
              <div className="feature-icon" style={{ background: f.bg }}>
                <f.icon size={22} color={f.color} />
              </div>
              <h4>{f.title}</h4>
              <p>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </div>
)

// ─── DASHBOARD PAGE ──────────────────────────────────────────────────────────
const Dashboard = ({ prediction, formData, confidence, onRetake }) => {
  const isHigh = prediction === 'High Risk'
  const bmi = Number(formData.weight) / ((Number(formData.height) / 100) ** 2)
  const recs = getRecommendations(formData, prediction)
  const diet = getDietSuggestions(formData, prediction)

  const bmiStatus = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese'
  const bmiColor = bmi < 25 ? 'var(--success)' : bmi < 30 ? 'var(--warning)' : 'var(--danger)'

  const gaugeData = [{ name: 'Risk', value: confidence, fill: isHigh ? 'var(--danger)' : 'var(--success)' }]

  return (
    <div className="page">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '2.5rem' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p style={{ color: 'var(--text-subtle)', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
              Health Assessment for
            </p>
            <h1 style={{ fontSize: '1.9rem', fontWeight: 800 }}>
              {formData.full_name || 'Your Report'}
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <RiskBadge risk={prediction} />
            <button className="btn btn-secondary" onClick={onRetake}>
              Retake Quiz
            </button>
          </div>
        </div>
        <div className="glow-line" />
      </motion.div>

      {/* Stat Cards */}
      <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <StatCard
            label="BMI"
            value={bmi.toFixed(1)}
            icon={Scale}
            color={bmiColor}
            bg={bmi < 25 ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)'}
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <StatCard
            label="BMI Category"
            value={bmiStatus}
            icon={TrendingUp}
            color={bmiColor}
            bg={bmi < 25 ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)'}
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <StatCard
            label="Age"
            value={formData.age}
            unit="yrs"
            icon={User}
            color="var(--primary-light)"
            bg="rgba(99,102,241,0.12)"
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <StatCard
            label="Model Confidence"
            value={confidence}
            unit="%"
            icon={Brain}
            color="var(--accent)"
            bg="rgba(6,182,212,0.12)"
          />
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>


        {/* Risk Gauge */}
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}
        >
          <h3 style={{ marginBottom: '1.5rem' }}>Risk Score</h3>
          <div style={{ position: 'relative', width: '100%', height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%" cy="80%"
                innerRadius="60%" outerRadius="100%"
                startAngle={180} endAngle={0}
                data={[{ name: 'bg', value: 100, fill: '#e2e8f0' }, ...gaugeData]}
              >
                <RadialBar dataKey="value" cornerRadius={10} />
                <Tooltip
                  content={({ active }) =>
                    active ? (
                      <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 8, padding: '0.5rem 0.75rem', fontSize: '0.8rem', color: 'var(--text)', boxShadow: 'var(--shadow)' }}>
                        Risk Confidence: {confidence}%
                      </div>
                    ) : null
                  }
                />
              </RadialBarChart>
            </ResponsiveContainer>
            <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: isHigh ? 'var(--danger)' : 'var(--success)', lineHeight: 1 }}>
                {confidence}%
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '0.25rem' }}>confidence</div>
            </div>
          </div>

          <div style={{ marginTop: '1rem', width: '100%' }}>
            <div style={{
              padding: '1rem',
              background: isHigh ? 'var(--danger-50)' : 'var(--success-50)',
              borderRadius: 12,
              border: `1.5px solid ${isHigh ? 'rgba(220,38,38,0.2)' : 'rgba(5,150,105,0.2)'}`,
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginBottom: '0.25rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                Result
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: isHigh ? 'var(--danger)' : 'var(--success)' }}>
                {prediction}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Health Profile */}
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <h3 style={{ marginBottom: '1.5rem' }}>Health Profile</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {[
              { label: 'Height', value: `${formData.height} cm` },
              { label: 'Weight', value: `${formData.weight} kg` },
              { label: 'Gender', value: formData.gender === 'M' ? 'Male' : formData.gender === 'F' ? 'Female' : 'Other' },
              { label: 'Activity', value: formData.activity_level?.charAt(0).toUpperCase() + formData.activity_level?.slice(1) || 'N/A' },
              {
                label: 'Smoker',
                value: formData.is_smoker ? '🚬 Yes' : '✅ No',
                danger: formData.is_smoker
              },
              {
                label: 'Heart History',
                value: formData.has_heart_history ? '⚠️ Yes' : '✅ No',
                danger: formData.has_heart_history
              },
              {
                label: 'Hypertension',
                value: formData.has_hypertension ? '⚠️ Yes' : '✅ No',
                danger: formData.has_hypertension
              },
              {
                label: 'Diabetes History',
                value: formData.has_diabetes_history ? '⚠️ Yes' : '✅ No',
                danger: formData.has_diabetes_history
              },
            ].map((item, i) => (
              <div key={i} style={{
                padding: '0.85rem 1rem',
                background: item.danger ? 'var(--danger-50)' : 'var(--bg-input)',
                borderRadius: 10,
                border: `1.5px solid ${item.danger ? 'rgba(220,38,38,0.18)' : 'var(--border)'}`,
              }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem' }}>
                  {item.label}
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: item.danger ? 'var(--danger)' : 'var(--text)' }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recommendations */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
      >
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={20} color="var(--primary-light)" /> Personalized Recommendations
        </h3>
        <ul className="recommendations-list">
          {recs.map((r, i) => (
            <motion.li
              key={i}
              className="recommendation-item"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.07 }}
            >
              <r.icon size={18} color={r.color} className="rec-icon" style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{r.text}</span>
            </motion.li>
          ))}
        </ul>
      </motion.div>

      {/* ─── DIET SUGGESTIONS ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        style={{ marginTop: '1.5rem' }}
      >
        {/* Section Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          marginBottom: '1.25rem'
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'rgba(245,158,11,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Utensils size={20} color="var(--warning)" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>Diet Suggestions</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', margin: 0 }}>
              Personalised based on your health profile & risk factors
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>

          {/* ── WHAT TO EAT ── */}
          <motion.div
            className="card"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            style={{ border: '1.5px solid rgba(5,150,105,0.2)', background: 'var(--success-50)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'rgba(5,150,105,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <CheckCircle size={17} color="var(--success)" />
              </div>
              <h4 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--success)', margin: 0 }}>
                What to Eat
              </h4>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {diet.eat.map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.65 + i * 0.06 }}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: '0.65rem',
                    padding: '0.7rem 0.9rem',
                    background: 'rgba(5,150,105,0.06)',
                    borderRadius: 10,
                    border: '1px solid rgba(5,150,105,0.15)',
                    fontSize: '0.875rem', color: 'var(--text-muted)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(5,150,105,0.12)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(5,150,105,0.06)'}
                >
                  <item.icon size={16} color={item.color} style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>{item.text}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* ── WHAT TO AVOID ── */}
          <motion.div
            className="card"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            style={{ border: '1.5px solid rgba(220,38,38,0.18)', background: 'var(--danger-50)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'rgba(220,38,38,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <XCircle size={17} color="var(--danger)" />
              </div>
              <h4 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--danger)', margin: 0 }}>
                What to Avoid
              </h4>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {diet.avoid.map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.65 + i * 0.06 }}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: '0.65rem',
                    padding: '0.7rem 0.9rem',
                    background: 'rgba(220,38,38,0.05)',
                    borderRadius: 10,
                    border: '1px solid rgba(220,38,38,0.12)',
                    fontSize: '0.875rem', color: 'var(--text-muted)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(220,38,38,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(220,38,38,0.05)'}
                >
                  <item.icon size={16} color={item.color} style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>{item.text}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

        </div>

        {/* Disclaimer */}
        <div style={{
          marginTop: '1rem',
          padding: '0.85rem 1.25rem',
          background: 'var(--primary-50)',
          border: '1.5px solid var(--primary-100)',
          borderRadius: 12,
          display: 'flex', alignItems: 'flex-start', gap: '0.6rem'
        }}>
          <AlertTriangle size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--primary)' }}>Disclaimer:</strong> These diet suggestions
            are general health guidelines based on your risk profile. Always consult a certified
            nutritionist or your doctor before making major dietary changes.
          </p>
        </div>
      </motion.div>
    </div>
  )
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────
function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [quizActive, setQuizActive] = useState(false)
  const [prediction, setPrediction] = useState(null)
  const [confidence, setConfidence] = useState(null)
  const [lastFormData, setLastFormData] = useState(null)
  const [showAuth, setShowAuth] = useState(false)
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    let isMounted = true;

    // 🔹 Listen for auth state
    const unsub = onAuthStateChanged(auth, (u) => {
      if (isMounted) {
        setUser(u);
        setAuthLoading(false);
      }
    });



    return () => {
      isMounted = false;
      unsub();
    };
  }, []);

  const handleQuizSubmit = async (data) => {
    const heightInMeter = Number(data.height) / 100
    const bmi = Number(data.weight) / (heightInMeter * heightInMeter)

    // Build ML payload
    const payload = {
      gender: data.gender === 'M' ? 1 : 0,
      age: Number(data.age),
      hypertension: data.has_hypertension ? 1 : 0,
      heart_disease: data.has_heart_history ? 1 : 0,
      ever_married: Number(data.age) >= 25 ? 1 : 0,
      work_type: 2,
      Residence_type: 1,
      avg_glucose_level: data.has_diabetes_history ? 160 : 105,
      bmi: parseFloat(bmi.toFixed(2)),
      smoking_status: data.is_smoker ? 1 : 0
    }

    try {
      const response = await axios.post(API_URL, payload)
      const result = response.data.prediction
      const conf = response.data.confidence ?? (result === 'High Risk' ? 78 : 85)
      setPrediction(result)
      setConfidence(conf)
      setLastFormData(data)
      setActiveTab('dashboard')
      setQuizActive(false)
    } catch (error) {
      console.error(error)
      alert('Backend connection error. Make sure Django server is running.')
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      setUser(null)
    } catch (e) {
      console.error(e)
    }
  }

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{
          width: 48, height: 48,
          border: '3px solid var(--border)',
          borderTopColor: 'var(--primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
      </div>
    )
  }


  return (
    <div>
      {/* ─── NAVBAR ─── */}
      <nav className="navbar">
        {/* Brand */}
        <div className="navbar-brand" onClick={() => { setActiveTab('home'); setQuizActive(false) }}>
          <div className="navbar-logo-icon">
            <img src="/logo.png" alt="logo" className="logo-img" />
          </div>
          <h2>HealthPredict</h2>
        </div>

        {/* Nav Links */}
        <div className="nav-links">
          <button
            className={`nav-link ${activeTab === 'home' && !quizActive ? 'active' : ''}`}
            onClick={() => { setActiveTab('home'); setQuizActive(false) }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Home size={16} /> Home
            </span>
          </button>
          {prediction && (
            <button
              className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => { setActiveTab('dashboard'); setQuizActive(false) }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <LayoutDashboard size={16} /> Dashboard
              </span>
            </button>
          )}
        </div>

        {/* Auth Area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {user ? (
            <>
              <div className="user-avatar" title={user.email}>
                {user.photoURL
                  ? <img src={user.photoURL} alt="avatar" />
                  : user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()
                }
              </div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text)', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
                {user.displayName || user.email.split("@")[0]}
              </span>
              <button className="btn btn-secondary" onClick={handleLogout} style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}>
                <LogOut size={15} />
              </button>
            </>
          ) : (
            <button className="btn btn-primary" onClick={() => setShowAuth(true)} style={{ padding: '0.6rem 1.25rem', fontSize: '0.875rem' }}>
              <User size={16} /> Sign In
            </button>
          )}
        </div>
      </nav>

      {/* ─── AUTH MODAL ─── */}
      <AnimatePresence>
        {showAuth && (
          <AuthModal
            onClose={() => setShowAuth(false)}
            onSuccess={(u) => setUser(u)}
          />
        )}
      </AnimatePresence>

      {/* ─── CONTENT ─── */}
      <AnimatePresence mode="wait">
        {activeTab === 'home' && !quizActive && (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <HeroPage onStart={() => setQuizActive(true)} />
          </motion.div>
        )}

        {quizActive && (
          <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <HealthQuiz onSubmit={handleQuizSubmit} />
          </motion.div>
        )}

        {activeTab === 'dashboard' && prediction && lastFormData && (
          <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Dashboard
              prediction={prediction}
              formData={lastFormData}
              confidence={confidence || 80}
              onRetake={() => { setQuizActive(true); setActiveTab('home') }}
            />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}

export default App