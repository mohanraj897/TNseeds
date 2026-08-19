import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('dealer_token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setLoading(false)
        return
      }
      try {
        const { data } = await api.get('/auth/me')
        setUser(data.user)
      } catch (err) {
        console.error('Failed to authenticate dealer:', err)
        localStorage.removeItem('dealer_token')
        setToken(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    fetchMe()
  }, [token])

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('dealer_token', data.token)
    localStorage.setItem('agricart_token', data.token)
    setToken(data.token)
    setUser(data.user)
    return data
  }

  const register = async (formData) => {
    const { data } = await api.post('/auth/register', { ...formData, role: 'dealer' })
    localStorage.setItem('dealer_token', data.token)
    localStorage.setItem('agricart_token', data.token)
    setToken(data.token)
    setUser(data.user)
    return data
  }

  const logout = () => {
    localStorage.removeItem('dealer_token')
    localStorage.removeItem('agricart_token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isDealer: user?.role === 'dealer' }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
