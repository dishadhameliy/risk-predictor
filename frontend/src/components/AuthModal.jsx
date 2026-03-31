import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react'
import { Button, Input } from './UI'
import {
    auth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from '../firebase'
import { signInWithRedirect } from "firebase/auth";

const AuthModal = ({ onClose, onSuccess }) => {
    const [mode, setMode] = useState('login') // 'login' | 'register'
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleEmailAuth = async (e) => {
        e.preventDefault()
        if (!email || !password) { setError('Please fill in all fields.'); return }
        setLoading(true)
        setError('')
        try {
            let result
            if (mode === 'login') {
                result = await signInWithEmailAndPassword(auth, email, password)
            } else {
                result = await createUserWithEmailAndPassword(auth, email, password)
            }
            onSuccess(result.user)
            onClose()
        } catch (e) {
            setError(e.message.replace('Firebase: ', '').replace(/\(auth\/.*\)/, '').trim())
        } finally {
            setLoading(false)
        }
    }

    return (
        <AnimatePresence>
            <motion.div
                className="modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={(e) => e.target === e.currentTarget && onClose()}
            >
                <motion.div
                    className="modal"
                    initial={{ opacity: 0, scale: 0.92, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, y: 20 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                >
                    <button className="modal-close" onClick={onClose}>
                        <X size={16} />
                    </button>

                    {/* Brand */}
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{
                            width: 52, height: 52, borderRadius: 14, margin: '0 auto 1rem',
                            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 0 30px var(--primary-glow)'
                        }}>
                            <LogIn size={24} color="white" />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>
                            {mode === 'login' ? 'Welcome back' : 'Create account'}
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            {mode === 'login' ? 'Sign in to your HealthPredict account' : 'Start your health journey today'}
                        </p>
                    </div>

                    {/* Email Form */}
                    <form onSubmit={handleEmailAuth}>
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <div className="input-wrapper">
                                <Mail size={17} style={{ position: 'absolute', left: '1rem', color: 'var(--text-subtle)' }} />
                                <input
                                    className="form-input has-icon"
                                    style={{ paddingLeft: '2.75rem' }}
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div className="input-wrapper">
                                <Lock size={17} style={{ position: 'absolute', left: '1rem', color: 'var(--text-subtle)' }} />
                                <input
                                    className="form-input has-icon"
                                    style={{ paddingLeft: '2.75rem', paddingRight: '3rem' }}
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Min. 6 characters"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(p => !p)}
                                    style={{
                                        position: 'absolute', right: '1rem', color: 'var(--text-subtle)',
                                        background: 'none', border: 'none', cursor: 'pointer', padding: 0
                                    }}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div style={{
                                padding: '0.75rem 1rem',
                                background: 'var(--danger-light)',
                                border: '1px solid rgba(239,68,68,0.3)',
                                borderRadius: 10,
                                color: 'var(--danger)',
                                fontSize: '0.85rem',
                                marginBottom: '1rem'
                            }}>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                            style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
                        >
                            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: '1.25rem', color: 'var(--text-subtle)', fontSize: '0.875rem' }}>
                        {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                        <button
                            onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError('') }}
                            style={{ background: 'none', border: 'none', color: 'var(--primary-light)', fontWeight: 600, cursor: 'pointer', padding: 0, fontSize: '0.875rem' }}
                        >
                            {mode === 'login' ? 'Sign up' : 'Sign in'}
                        </button>
                    </p>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}

export default AuthModal
