import React from 'react'
import { Card, Button } from '../components/UI'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
import { Download, AlertTriangle, CheckCircle, Activity, Utensils, Info } from 'lucide-react'

const Dashboard = ({ profile, recommendations, onDownload }) => {
    const riskData = [
        { name: 'Risk', value: profile.risk_score },
        { name: 'Safe', value: 100 - profile.risk_score }
    ]

    const COLORS = [profile.risk_score > 60 ? 'var(--danger)' : profile.risk_score > 30 ? 'var(--warning)' : 'var(--success)', '#f1f5f9']

    const mockHistory = [
        { name: 'Jan', risk: 45 },
        { name: 'Feb', risk: 42 },
        { name: 'Today', risk: profile.risk_score },
    ]

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', paddingBottom: '4rem' }}>
            {/* Risk Overview */}
            <Card title="Your Health Risk" icon={Activity}>
                <div style={{ height: '220px', position: 'relative' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={riskData}
                                innerRadius={65}
                                outerRadius={85}
                                paddingAngle={0}
                                dataKey="value"
                                startAngle={210}
                                endAngle={-30}
                            >
                                {riskData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                        <span style={{ fontSize: '2.5rem', fontWeight: '800', color: COLORS[0] }}>{profile.risk_score}%</span>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '600' }}>RISK SCORE</p>
                    </div>
                </div>
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    {profile.risk_score > 60 ? (
                        <div style={{ background: '#fef2f2', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #fee2e2' }}>
                            <p style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: '700' }}>
                                <AlertTriangle size={20} /> HIGH RISK LEVEL
                            </p>
                        </div>
                    ) : (
                        <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #dcfce7' }}>
                            <p style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: '700' }}>
                                <CheckCircle size={20} /> HEALTHY STANDING
                            </p>
                        </div>
                    )}
                    <Button onClick={onDownload} icon={Download} style={{ marginTop: '1.5rem', width: '100%', justifyContent: 'center' }}>
                        Download PDF Health Report
                    </Button>
                </div>
            </Card>

            {/* Risk Trends */}
            <Card title="Improvement Trend" icon={Info}>
                <div style={{ height: '220px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={mockHistory}>
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis hide />
                            <Tooltip
                                cursor={{ fill: '#f8fafc' }}
                                contentStyle={{ background: 'white', border: '1px solid var(--border)', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                            />
                            <Bar dataKey="risk" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#eff6ff', borderRadius: '0.5rem', border: '1px solid #dbeafe' }}>
                    <p style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: '600' }}>
                        Clinical Note: Your risk has decreased by 3% following your recent activity updates.
                    </p>
                </div>
            </Card>

            {/* Recommendations */}
            <Card title="Personalized Care Plan" icon={Utensils} className="span-2" style={{ gridColumn: '1 / -1' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                    <div style={{ borderRight: '1px solid var(--border)', paddingRight: '1rem' }}>
                        <h4 style={{ marginBottom: '1.25rem', color: 'var(--text)', fontSize: '1.1rem' }}>Nutrition Guide</h4>
                        <ul style={{ listStyle: 'none' }}>
                            {recommendations.diet.map((item, i) => (
                                <li key={i} style={{ marginBottom: '0.75rem', display: 'flex', gap: '0.75rem', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                                    <CheckCircle size={18} color="var(--success)" style={{ flexShrink: 0 }} /> {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 style={{ marginBottom: '1.25rem', color: 'var(--text)', fontSize: '1.1rem' }}>Activity Targets</h4>
                        <h2>Risk Level: {result.risk_level}</h2>
                        <h3>Risk Percentage: {result.risk_percentage}%</h3>

                        <ul style={{ listStyle: 'none' }}>
                            {recommendations.exercise.map((item, i) => (
                                <li key={i} style={{ marginBottom: '0.75rem', display: 'flex', gap: '0.75rem', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                                    <Activity size={18} color="var(--primary)" style={{ flexShrink: 0 }} /> {item}
                                </li>

                            ))}
                        </ul>
                    </div>
                </div>
            </Card>
        </div>
    )
}

export default Dashboard
