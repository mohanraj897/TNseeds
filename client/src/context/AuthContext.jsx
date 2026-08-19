import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

// Where each role lands after login. Farmer/admin share the app on 5173,
// dealer has its own app on 5174 — adjust these for your deployed domains.
const ROLE_REDIRECTS = {
  farmer: 'http://localhost:5173/home',
  dealer: 'http://localhost:5174/dashboard',
  admin: 'http://localhost:5173/admin'
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Rehydrate session on load — also catches a token handed off via URL
  // from the other app (see redirectForRole).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const incomingToken = params.get('authToken')

    if (incomingToken) {
      // Strip it from the URL immediately so it never sits in browser
      // history or gets shared accidentally.
      params.delete('authToken')
      const cleanUrl =
        window.location.pathname + (params.toString() ? `?${params}` : '')
      window.history.replaceState({}, '', cleanUrl)

      fetchAndStoreUser(incomingToken)
      return
    }

    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    if (token && storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  // Handed a bare token (no user object) via URL — fetch /auth/me to get
  // the user details, then persist locally same as a normal login.
  async function fetchAndStoreUser(token) {
    try {
      localStorage.setItem('token', token)
      const { data } = await api.get('/auth/me')
      localStorage.setItem('user', JSON.stringify(data.user))
      setUser(data.user)
    } catch (err) {
      console.error('Failed to hydrate session from handoff token', err)
      localStorage.removeItem('token')
    } finally {
      setLoading(false)
    }
  }

  function persistSession({ token, user }) {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    setUser(user)
  }

  function redirectForRole(role, token) {
    const url = ROLE_REDIRECTS[role]
    if (!url) return
    // localStorage is per-origin — localhost:5173 and :5174 (or two prod
    // domains) can't see each other's storage. Pass the token once via
    // URL so the destination app can pick it up and store it itself.
    const dest = new URL(url)
    dest.searchParams.set('authToken', token)
    window.location.href = dest.toString()
  }

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password })
    persistSession(data)
    redirectForRole(data.user.role, data.token)
    return data
  }

  async function googleLogin(credential) {
    const { data } = await api.post('/auth/google', { credential })
    persistSession(data)
    redirectForRole(data.user.role, data.token)
    return data
  }

  async function otpLogin(idToken) {
    const { data } = await api.post('/auth/otp', { idToken })
    persistSession(data)
    redirectForRole(data.user.role, data.token)
    return data
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    window.location.href = 'http://localhost:5173/login'
  }

  const value = {
    user,
    loading,
    isFarmer: user?.role === 'farmer',
    isDealer: user?.role === 'dealer',
    isAdmin: user?.role === 'admin',
    login,
    googleLogin,
    otpLogin,
    logout
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}