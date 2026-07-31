"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Leaf, Mail, Lock, User, Phone, Store, MapPin, Eye, EyeOff, UserPlus } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import '../Auth.css'

export default function Register() {
  const { register } = useAuth()
  const toast = useToast()
  const router = useRouter()

  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'dealer',
    phone: '', storeName: '', city: '', state: ''
  })
  const [showPw, setShowPw]   = useState(false)
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) {
      return toast.error('Password must be at least 6 characters')
    }
    setLoading(true)
    try {
      await register({
        name:      form.name,
        email:     form.email,
        password:  form.password,
        role:      form.role,
        phone:     form.phone,
        storeName: form.role === 'dealer' ? form.storeName : '',
        location: {
          type: 'Point',
          coordinates: [0, 0],
          city:  form.city,
          state: form.state
        }
      })
      toast.success('Account created! Welcome to AgriCart 🌱')
      router.push('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon"><Leaf size={24}/></div>
          <span>AgriCart</span>
        </div>

        <h1 className="auth-title">Create Account</h1>
        <p className="auth-sub">Join as a dealer to list your seed stock, or as a farmer to browse</p>

        {/* Role Toggle */}
        <div className="role-toggle">
          <button type="button"
            className={`role-btn ${form.role === 'dealer' ? 'active' : ''}`}
            onClick={() => set('role', 'dealer')}>
            🏪 Dealer
          </button>
          <button type="button"
            className={`role-btn ${form.role === 'farmer' ? 'active' : ''}`}
            onClick={() => set('role', 'farmer')}>
            👨‍🌾 Farmer
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form register-grid">

          <style jsx>{`
            .register-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 1.25rem;
            }
            .span-2 { grid-column: span 2; }
            @media (max-width: 480px) {
              .register-grid { grid-template-columns: 1fr; }
              .register-grid .span-2 { grid-column: span 1; }
            }
          `}</style>

          {/* Full Name */}
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <div className="input-icon-wrap">
              <User size={16} className="input-icon"/>
              <input className="form-input padded" required placeholder="Your name"
                value={form.name} onChange={e => set('name', e.target.value)}/>
            </div>
          </div>

          {/* Phone */}
          <div className="form-group">
            <label className="form-label">Phone *</label>
            <div className="input-icon-wrap">
              <Phone size={16} className="input-icon"/>
              <input className="form-input padded" required placeholder="+91 98765 43210"
                value={form.phone} onChange={e => set('phone', e.target.value)}/>
            </div>
          </div>

          {/* Email */}
          <div className="form-group span-2">
            <label className="form-label">Email *</label>
            <div className="input-icon-wrap">
              <Mail size={16} className="input-icon"/>
              <input className="form-input padded" type="email" required placeholder="you@example.com"
                value={form.email} onChange={e => set('email', e.target.value)}/>
            </div>
          </div>

          {/* Password */}
          <div className="form-group span-2">
            <label className="form-label">Password *</label>
            <div className="input-icon-wrap">
              <Lock size={16} className="input-icon"/>
              <input className="form-input padded"
                type={showPw ? 'text' : 'password'} required placeholder="Min 6 characters"
                value={form.password} onChange={e => set('password', e.target.value)}/>
              <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)}>
                {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
          </div>

          {/* Store Name — dealers only */}
          {form.role === 'dealer' && (
            <div className="form-group span-2">
              <label className="form-label">Store / Shop Name</label>
              <div className="input-icon-wrap">
                <Store size={16} className="input-icon"/>
                <input className="form-input padded" placeholder="e.g. Kisaan Seeds Pvt Ltd"
                  value={form.storeName} onChange={e => set('storeName', e.target.value)}/>
              </div>
            </div>
          )}

          {/* City */}
          <div className="form-group">
            <label className="form-label">City</label>
            <div className="input-icon-wrap">
              <MapPin size={16} className="input-icon"/>
              <input className="form-input padded" placeholder="Pune"
                value={form.city} onChange={e => set('city', e.target.value)}/>
            </div>
          </div>

          {/* State */}
          <div className="form-group">
            <label className="form-label">State</label>
            <input className="form-input" placeholder="Maharashtra"
              value={form.state} onChange={e => set('state', e.target.value)}/>
          </div>

          <div className="span-2">
            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? <span className="spinner"/> : <><UserPlus size={18}/> Create Account</>}
            </button>
          </div>

        </form>

        <p className="auth-footer">
          Already have an account? <Link href="/login" className="auth-link">Login</Link>
        </p>
      </div>
    </div>
  )
}
