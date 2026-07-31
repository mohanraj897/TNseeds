"use client"

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null)
  const [token, setToken]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('agricart_token')
    const storedUser  = localStorage.getItem('agricart_user')
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('agricart_token', data.token)
    localStorage.setItem('agricart_user', JSON.stringify(data.user))
    setToken(data.token)
    setUser(data.user)
    return data
  }, [])

  const register = useCallback(async (payload) => {
    const { data } = await api.post('/auth/register', payload)
    localStorage.setItem('agricart_token', data.token)
    localStorage.setItem('agricart_user', JSON.stringify(data.user))
    setToken(data.token)
    setUser(data.user)
    return data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('agricart_token')
    localStorage.removeItem('agricart_user')
    setToken(null)
    setUser(null)
  }, [])

  const isDealer = user?.role === 'dealer'
  const isFarmer = user?.role === 'farmer'

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isDealer, isFarmer }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
