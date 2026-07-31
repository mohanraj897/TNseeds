import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, User, Phone, Store, MapPin, Eye, EyeOff, UserPlus, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import AgriLogo from '../components/AgriLogo'
import './Auth.css'

export default function Register() {
  const { register } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

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
      return toast.error('Key must be at least 6 characters')
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
      toast.success('Entity Registered Successfully')
      navigate('/')
    } catch (err) {
      toast.error('Registration Protocol Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="futuristic-auth">
      <div className="auth-bg-pattern">
        <div className="leaf-lines" />
        <div className="gradient-sphere" />
      </div>

      <motion.div 
        className="auth-card auth-card-wide glass-panel"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="auth-header">
          <AgriLogo size="md" />
          <h2 className="auth-title-futuristic">New Entity Registration</h2>
          <p className="auth-sub-futuristic">Join the global agricultural network</p>
        </div>

        <div className="role-toggle-futuristic">
          <button 
            className={form.role === 'dealer' ? 'active' : ''} 
            onClick={() => set('role', 'dealer')}
          >🏪 Dealer Node</button>
          <button 
            className={form.role === 'farmer' ? 'active' : ''} 
            onClick={() => set('role', 'farmer')}
          >👨‍🌾 Farmer Node</button>
        </div>

        <form onSubmit={handleSubmit} className="futuristic-form register-grid">
          <div className="form-group-futuristic">
            <div className="input-wrap-futuristic">
              <User size={18} />
              <input required placeholder="Full Name" value={form.name} onChange={e => set('name', e.target.value)}/>
            </div>
          </div>

          <div className="form-group-futuristic">
            <div className="input-wrap-futuristic">
              <Phone size={18} />
              <input required placeholder="Contact Number" value={form.phone} onChange={e => set('phone', e.target.value)}/>
            </div>
          </div>

          <div className="form-group-futuristic span-2">
            <div className="input-wrap-futuristic">
              <Mail size={18} />
              <input type="email" required placeholder="Network Email" value={form.email} onChange={e => set('email', e.target.value)}/>
            </div>
          </div>

          <div className="form-group-futuristic span-2">
            <div className="input-wrap-futuristic">
              <Lock size={18} />
              <input type={showPw ? 'text' : 'password'} required placeholder="Secure Key" value={form.password} onChange={e => set('password', e.target.value)}/>
            </div>
          </div>

          {form.role === 'dealer' && (
            <div className="form-group-futuristic span-2">
              <div className="input-wrap-futuristic">
                <Store size={18} />
                <input placeholder="Store / Shop Name" value={form.storeName} onChange={e => set('storeName', e.target.value)}/>
              </div>
            </div>
          )}

          <div className="form-group-futuristic">
            <div className="input-wrap-futuristic">
              <MapPin size={18} />
              <input placeholder="City" value={form.city} onChange={e => set('city', e.target.value)}/>
            </div>
          </div>

          <div className="form-group-futuristic">
            <div className="input-wrap-futuristic">
              <input placeholder="State" value={form.state} onChange={e => set('state', e.target.value)}/>
            </div>
          </div>

          <div className="span-2">
            <button type="submit" className={`btn-futuristic-primary ${loading ? 'loading' : ''}`} disabled={loading}>
              {loading ? <span className="spinner"/> : <>Register Entity <ArrowRight size={20}/></>}
            </button>
          </div>
        </form>

        <p className="auth-footer-futuristic">
          Existing entity? <Link to="/login">Access Portal</Link>
        </p>
      </motion.div>
    </div>
  )
}
