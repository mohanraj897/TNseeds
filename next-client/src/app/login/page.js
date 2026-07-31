"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Leaf, Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import '../Auth.css'

export default function Login() {
  const { login } = useAuth()
  const toast = useToast()
  const router = useRouter()

  const [form, setForm]       = useState({ email: '', password: '' })
  const [showPw, setShowPw]   = useState(false)
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back! 🌱')
      router.push('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Check credentials.')
    } finally {
      setLoading(false)
    }
  }

  // Demo login helper
  const demoLogin = async (email, password) => {
    setForm({ email, password })
    setLoading(true)
    try {
      await login(email, password)
      toast.success('Demo login successful!')
      router.push('/')
    } catch {
      toast.error('Demo account not found. Please register first.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon"><Leaf size={24}/></div>
          <span>AgriCart</span>
        </div>

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-sub">Login to manage your seed listings or browse availability</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email</label>
            <div className="input-icon-wrap">
              <Mail size={16} className="input-icon"/>
              <input className="form-input padded" type="email" required
                placeholder="you@example.com"
                value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-icon-wrap">
              <Lock size={16} className="input-icon"/>
              <input className="form-input padded"
                type={showPw ? 'text' : 'password'} required
                placeholder="••••••••"
                value={form.password} onChange={e => set('password', e.target.value)} />
              <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)}>
                {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? <span className="spinner"/> : <><LogIn size={18}/> Login</>}
          </button>
        </form>

        <div className="divider">or try a demo</div>

        <div className="demo-btns">
          <button className="btn btn-secondary btn-sm demo-btn"
            onClick={() => demoLogin('dealer@demo.com', 'demo123')}
            disabled={loading}>
            🏪 Dealer Demo
          </button>
          <button className="btn btn-secondary btn-sm demo-btn"
            onClick={() => demoLogin('farmer@demo.com', 'demo123')}
            disabled={loading}>
            👨‍🌾 Farmer Demo
          </button>
        </div>

        <p className="auth-footer">
          Don't have an account?{' '}
          <Link href="/register" className="auth-link">Register as Dealer</Link>
        </p>
      </div>
    </div>
  )
}
