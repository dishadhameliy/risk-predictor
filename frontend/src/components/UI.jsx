import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle } from 'lucide-react'

// ─── CARD ───────────────────────────────────────────────────────────────────
export const Card = ({ children, title, icon: Icon, className = "", style = {} }) => (
    <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className={`card ${className}`}
        style={style}
    >
        {title && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
                {Icon && (
                    <div style={{
                        width: 38, height: 38, borderRadius: 10,
                        background: 'rgba(99,102,241,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Icon size={20} color="var(--primary-light)" />
                    </div>
                )}
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)' }}>{title}</h3>
            </div>
        )}
        {children}
    </motion.div>
)

// ─── BUTTON ─────────────────────────────────────────────────────────────────
export const Button = ({ children, variant = 'primary', icon: Icon, size, ...props }) => (
    <button
        className={`btn btn-${variant}${size ? ` btn-${size}` : ''}`}
        {...props}
    >
        {Icon && <Icon size={18} />}
        {children}
    </button>
)

// ─── INPUT ──────────────────────────────────────────────────────────────────
export const Input = ({ label, icon: Icon, ...props }) => (
    <div className="form-group">
        {label && <label className="form-label">{label}</label>}
        <div className="input-wrapper">
            {Icon && <Icon size={17} className="input-icon" style={{ position: 'absolute', left: '1rem', color: 'var(--text-subtle)' }} />}
            <input
                className={`form-input${Icon ? ' has-icon' : ''}`}
                style={Icon ? { paddingLeft: '2.75rem' } : {}}
                {...props}
            />
        </div>
    </div>
)

// ─── SELECT ─────────────────────────────────────────────────────────────────
export const Select = ({ label, icon: Icon, children, ...props }) => (
    <div className="form-group">
        {label && <label className="form-label">{label}</label>}
        <div className="input-wrapper">
            {Icon && <Icon size={17} style={{ position: 'absolute', left: '1rem', zIndex: 1, color: 'var(--text-subtle)' }} />}
            <select
                className={`form-select${Icon ? ' has-icon' : ''}`}
                style={Icon ? { paddingLeft: '2.75rem' } : {}}
                {...props}
            >
                {children}
            </select>
        </div>
    </div>
)

// ─── CHECKBOX OPTION ────────────────────────────────────────────────────────
export const CheckboxOption = ({ label, icon: Icon, checked, onChange, name }) => (
    <label className="checkbox-group">
        <input
            type="checkbox"
            name={name}
            checked={checked}
            onChange={onChange}
        />
        {Icon && <Icon size={18} color={checked ? 'var(--primary-light)' : 'var(--text-subtle)'} />}
        <span style={{ flex: 1, color: checked ? 'var(--text)' : 'var(--text-muted)', fontWeight: 500, fontSize: '0.95rem' }}>
            {label}
        </span>
        {checked && <CheckCircle size={16} color="var(--primary-light)" />}
    </label>
)

// ─── STEPS PROGRESS BAR ─────────────────────────────────────────────────────
export const StepsBar = ({ steps, current }) => (
    <div className="steps-bar">
        {steps.map((s, i) => (
            <div
                key={i}
                className={`step-item ${i + 1 === current ? 'active' : i + 1 < current ? 'done' : ''}`}
            >
                <div className="step-circle">
                    {i + 1 < current
                        ? <CheckCircle size={16} />
                        : <span>{i + 1}</span>
                    }
                </div>
                <span className="step-label">{s}</span>
            </div>
        ))}
    </div>
)

// ─── STAT CARD ──────────────────────────────────────────────────────────────
export const StatCard = ({ label, value, unit, icon: Icon, color = 'var(--primary)', bg = 'rgba(99,102,241,0.12)' }) => (
    <div className="stat-card">
        <div className="stat-icon" style={{ background: bg }}>
            {Icon && <Icon size={22} color={color} />}
        </div>
        <div className="stat-value" style={{ color }}>{value}{unit && <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-subtle)', marginLeft: '0.25rem' }}>{unit}</span>}</div>
        <div className="stat-label">{label}</div>
    </div>
)

// ─── RISK RESULT BADGE ──────────────────────────────────────────────────────
export const RiskBadge = ({ risk }) => {
    const isHigh = risk === 'High Risk'
    return (
        <span className={`risk-badge ${isHigh ? 'high' : 'low'}`}>
            <span style={{
                width: 8, height: 8, borderRadius: '50%',
                background: isHigh ? 'var(--danger)' : 'var(--success)',
                display: 'inline-block'
            }} />
            {risk}
        </span>
    )
}
