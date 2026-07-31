import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, LogIn, Chrome, MessageSquare, ArrowRight, Leaf } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import AgriLogo from '../components/AgriLogo'
import './Auth.css'

export default function Login() {
  const { login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [form, setForm]       = useState({ email: '', password: '' })
  const [showPw, setShowPw]   = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    // Initial delay for "futuristic" feel
    const timer = setTimeout(() => setShowForm(true), 1500)
    return () => clearTimeout(timer)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsAuthenticating(true)
    try {
      await login(form.email, form.password)
      toast.success('Access Granted')
      navigate('/')
    } catch (err) {
      toast.error('Authentication Failed')
      setIsAuthenticating(false)
    }
  }

  const demoLogin = async (email, password) => {
    setIsAuthenticating(true)
    try {
      await login(email, password)
      navigate('/')
    } catch {
      toast.error('Demo node unavailable')
      setIsAuthenticating(false)
    }
  }

  return (
    <div className="futuristic-auth">
      {/* Background Patterns */}
      <div className="auth-bg-pattern">
        <div className="leaf-lines" />
        <div className="gradient-sphere" />
      </div>

      <AnimatePresence mode="wait">
        {!showForm || isAuthenticating ? (
          <motion.div 
            key="loader"
            className="futuristic-loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="logo-leaf-spinner">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                <Leaf size={60} className="leaf-icon-spinning" />
              </motion.div>
            </div>
            <div className="seed-ring">
              {[...Array(12)].map((_, i) => (
                <motion.div 
                  key={i}
                  className="seed-dot"
                  animate={{ 
                    scale: [1, 1.5, 1],
                    backgroundColor: ['#e2e8f0', '#22c55e', '#e2e8f0']
                  }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity, 
                    delay: i * 0.1 
                  }}
                  style={{ 
                    transform: `rotate(${i * 30}deg) translateY(-50px)` 
                  }}
                />
              ))}
            </div>
            <motion.p 
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="loading-text"
            >
              Initializing Secure Link...
            </motion.p>
          </motion.div>
        ) : (
          <motion.div 
            key="form"
            className="auth-card glass-panel"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", damping: 20 }}
          >
            <div className="auth-header">
              <AgriLogo size="md" />
              <h2 className="auth-title-futuristic">Authentication Portal</h2>
              <p className="auth-sub-futuristic">Enter your credentials to sync with AgriCart</p>
            </div>

            <form onSubmit={handleSubmit} className="futuristic-form">
              <div className="form-group-futuristic">
                <label className="form-label">Email Address</label>
                <div className="input-wrap-futuristic">
                  <Mail size={18} />
                  <input 
                    type="email" required placeholder="name@example.com"
                    value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group-futuristic">
                <label className="form-label">Password</label>
                <div className="input-wrap-futuristic">
                  <Lock size={18} />
                  <input 
                    type={showPw ? 'text' : 'password'} required placeholder="Enter your password"
                    value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}>
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn-futuristic-primary">
                <span>Secure Login</span>
                <ArrowRight size={20} />
              </button>
            </form>

            <div className="auth-divider">
              <span>Third-party Auth</span>
            </div>

            <div className="social-auth-grid">
              <button className="social-btn"><Chrome size={20} /> Google</button>
              <button className="social-btn"><MessageSquare size={20} /> OTP</button>
            </div>

            <div className="demo-shortcuts">
               <button onClick={() => demoLogin('dealer@demo.com', 'demo123')}>Dealer Node</button>
               <button onClick={() => demoLogin('farmer@demo.com', 'demo123')}>Farmer Node</button>
            </div>

            <div className="auth-footer-futuristic">
              <Link to="/register">Create New Entity</Link>
              <span className="dot-sep" />
              <a href="#">Recover Key</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
