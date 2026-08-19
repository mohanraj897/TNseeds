import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, ArrowRight, Leaf, MessageSquare, X, Phone } from 'lucide-react'
import { GoogleLogin } from '@react-oauth/google'
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'
import { auth } from '../../firebase'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import AgriLogo from '../../components/AgriLogo'
import '../Auth.css'

const RESEND_COOLDOWN = 30 // seconds

export default function Login() {
  const { login, googleLogin, otpLogin } = useAuth()
  const toast = useToast()
  const emailRef = useRef(null)

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const [emailError, setEmailError] = useState('')
  const [emailValid, setEmailValid] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  // ---------- OTP modal state ----------
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [phone, setPhone] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [confirmationResult, setConfirmationResult] = useState(null)
  const [sendingOtp, setSendingOtp] = useState(false)
  const [verifyingOtp, setVerifyingOtp] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const recaptchaVerifierRef = useRef(null)

  useEffect(() => {
    const timer = setTimeout(() => setShowForm(true), 1400)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (showForm && !isAuthenticating) {
      setTimeout(() => emailRef.current?.focus(), 300)
    }
  }, [showForm, isAuthenticating])

  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = setTimeout(() => setResendCooldown((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [resendCooldown])

  useEffect(() => {
    if (!showOtpModal) return
    recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible'
    })
    return () => {
      recaptchaVerifierRef.current?.clear()
      recaptchaVerifierRef.current = null
    }
  }, [showOtpModal])

  // ---------- Validation ----------
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/
    if (!email.trim()) return setEmailError('Email is required'), setEmailValid(false), false
    if (email.includes(' ')) return setEmailError('Spaces are not allowed'), setEmailValid(false), false
    if (!emailRegex.test(email)) return setEmailError('Enter a valid email address'), setEmailValid(false), false
    setEmailError('')
    setEmailValid(true)
    return true
  }

  const validatePassword = (password) => {
    if (!password) return setPasswordError('Password is required'), false
    if (password.length < 6) return setPasswordError('Password must be at least 6 characters'), false
    setPasswordError('')
    return true
  }

  const validatePhone = (value) => {
    const phoneRegex = /^[6-9]\d{9}$/
    if (!value) return setPhoneError('Mobile number is required'), false
    if (!phoneRegex.test(value)) return setPhoneError('Enter a valid 10-digit mobile number'), false
    setPhoneError('')
    return true
  }

  // ---------- Google Auth ----------
  const handleGoogleSuccess = async (credentialResponse) => {
    setIsAuthenticating(true)
    try {
      await googleLogin(credentialResponse.credential)
      toast.success('Login Successful')
      // AuthContext redirects based on the role the backend returns
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || 'Google authentication failed')
      setIsAuthenticating(false)
    }
  }

  // ---------- OTP Auth ----------
  const sendOtp = async () => {
    if (!validatePhone(phone)) return
    setSendingOtp(true)
    try {
      const result = await signInWithPhoneNumber(auth, `+91${phone}`, recaptchaVerifierRef.current)
      setConfirmationResult(result)
      setOtpSent(true)
      setResendCooldown(RESEND_COOLDOWN)
      toast.success('OTP sent successfully')
    } catch (error) {
      console.error(error)
      toast.error('Failed to send OTP. Please try again.')
    } finally {
      setSendingOtp(false)
    }
  }

  const verifyOtp = async () => {
    if (!otp || otp.length < 6) {
      toast.error('Enter the 6-digit OTP')
      return
    }
    setVerifyingOtp(true)
    try {
      const result = await confirmationResult.confirm(otp)
      const idToken = await result.user.getIdToken()
      await otpLogin(idToken) // exchanges Firebase token for our JWT + redirects by role
      toast.success('Mobile number verified')
      closeOtpModal()
    } catch (error) {
      console.error(error)
      toast.error('Invalid OTP. Please try again.')
    } finally {
      setVerifyingOtp(false)
    }
  }

  const closeOtpModal = () => {
    setShowOtpModal(false)
    setPhone('')
    setPhoneError('')
    setOtp('')
    setOtpSent(false)
    setConfirmationResult(null)
    setResendCooldown(0)
  }

  // ---------- Form Submit ----------
  const handleSubmit = async (e) => {
    e.preventDefault()
    const isEmailOk = validateEmail(form.email)
    const isPasswordOk = validatePassword(form.password)
    if (!isEmailOk || !isPasswordOk) {
      toast.error('Please fix the validation errors')
      return
    }
    setIsAuthenticating(true)
    try {
      await login(form.email, form.password)
      toast.success('Access Granted')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Authentication Failed')
      setIsAuthenticating(false)
    }
  }

  const handleChange = (field) => (e) => {
    const value = field === 'email' ? e.target.value.toLowerCase() : e.target.value
    setForm((prev) => ({ ...prev, [field]: value }))
    if (field === 'email' && emailError) setEmailError('')
    if (field === 'password' && passwordError) setPasswordError('')
  }

  return (
    <div className="futuristic-auth">
      <div className="auth-bg-pattern">
        <div className="leaf-lines" />
        <div className="gradient-sphere" />
      </div>

      <AnimatePresence mode="wait">
        {!showForm || isAuthenticating ? (
          <motion.div key="loader" className="futuristic-loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}>
              <Leaf size={60} className="leaf-icon-spinning" />
            </motion.div>
            <motion.p animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="loading-text">
              {isAuthenticating ? 'Authenticating...' : 'Initializing Secure Link...'}
            </motion.p>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            className="auth-card glass-panel"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          >
            <div className="auth-header">
              <AgriLogo size="md" />
              <h2 className="auth-title-futuristic">Farmer Login</h2>
              <p className="auth-sub-futuristic">Sign in to browse and order seeds</p>
            </div>

            <form onSubmit={handleSubmit} className="futuristic-form" noValidate>
              <div className="form-group-futuristic">
                <label className="form-label" htmlFor="login-email">Email Address</label>
                <div className={`input-wrap-futuristic ${emailError ? 'input-error' : emailValid ? 'input-success' : ''}`}>
                  <Mail size={18} aria-hidden="true" />
                  <input
                    id="login-email"
                    ref={emailRef}
                    type="email"
                    autoComplete="email"
                    placeholder="name@example.com"
                    value={form.email}
                    onChange={handleChange('email')}
                    onBlur={(e) => validateEmail(e.target.value)}
                    disabled={isAuthenticating}
                  />
                </div>
                {emailError && <small className="error-text" role="alert">{emailError}</small>}
              </div>

              <div className="form-group-futuristic">
                <label className="form-label" htmlFor="login-password">Password</label>
                <div className={`input-wrap-futuristic ${passwordError ? 'input-error' : ''}`}>
                  <Lock size={18} aria-hidden="true" />
                  <input
                    id="login-password"
                    type={showPw ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange('password')}
                    onBlur={(e) => validatePassword(e.target.value)}
                    disabled={isAuthenticating}
                  />
                  <button type="button" className="pw-toggle-btn" onClick={() => setShowPw((s) => !s)} tabIndex={-1}>
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {passwordError && <small className="error-text" role="alert">{passwordError}</small>}
              </div>

              <button type="submit" className="btn-futuristic-primary" disabled={isAuthenticating}>
                <span>Secure Login</span>
                <ArrowRight size={20} />
              </button>
            </form>

            <div className="auth-divider"><span>Third-party Auth</span></div>

            <div className="social-auth-grid">
              <div className="google-login">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => toast.error('Google Login Failed')}
                  useOneTap={false}
                  theme="outline"
                  size="large"
                  text="continue_with"
                  shape="rectangular"
                />
              </div>
              <button type="button" className="social-btn" onClick={() => setShowOtpModal(true)} disabled={isAuthenticating}>
                <MessageSquare size={20} />
                Mobile OTP Login
              </button>
            </div>

            <div className="auth-footer-futuristic">
              <Link to="/register">Create New Entity</Link>
              <span className="dot-sep" />
              <Link to="/forgot-password">Recover Key</Link>
              <span className="dot-sep" />
              <a href="http://localhost:5174/login">Login as Dealer</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------- OTP Modal ---------- */}
      <AnimatePresence>
        {showOtpModal && (
          <motion.div className="otp-modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeOtpModal}>
            <motion.div
              className="otp-modal-card glass-panel"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button type="button" className="otp-modal-close" onClick={closeOtpModal} aria-label="Close">
                <X size={18} />
              </button>

              <div className="otp-modal-header">
                <Phone size={24} />
                <h4>Mobile OTP Login</h4>
              </div>

              <div className="form-group-futuristic">
                <label className="form-label" htmlFor="otp-phone">Mobile Number</label>
                <div className={`input-wrap-futuristic ${phoneError ? 'input-error' : ''}`}>
                  <span className="phone-prefix">+91</span>
                  <input
                    id="otp-phone"
                    type="tel"
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value.replace(/\D/g, ''))
                      if (phoneError) setPhoneError('')
                    }}
                    disabled={otpSent || sendingOtp}
                  />
                </div>
                {phoneError && <small className="error-text" role="alert">{phoneError}</small>}
              </div>

              {!otpSent ? (
                <button type="button" className="btn-futuristic-primary" onClick={sendOtp} disabled={sendingOtp}>
                  {sendingOtp ? 'Sending...' : 'Send OTP'}
                </button>
              ) : (
                <>
                  <div className="form-group-futuristic">
                    <label className="form-label" htmlFor="otp-code">Enter OTP</label>
                    <div className="input-wrap-futuristic">
                      <input
                        id="otp-code"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="6-digit code"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        disabled={verifyingOtp}
                      />
                    </div>
                  </div>
                  <button type="button" className="btn-futuristic-primary" onClick={verifyOtp} disabled={verifyingOtp}>
                    {verifyingOtp ? 'Verifying...' : 'Verify OTP'}
                  </button>
                  <button type="button" className="otp-resend-btn" onClick={sendOtp} disabled={resendCooldown > 0 || sendingOtp}>
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {showOtpModal && <div id="recaptcha-container" />}
    </div>
  )
}