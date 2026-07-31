import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'

// Protected route wrapper (redirect if not logged in)
function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh'}}><span className="spinner"/></div>
  return user ? children : <Navigate to="/login" replace />
}

import LandingPage from './pages/LandingPage'
import SeedBackground from './components/SeedBackground'

function AppInner() {
  const [showForm, setShowForm] = useState(false)
  const { user, loading } = useAuth()

  if (loading) return null

  return (
    <BrowserRouter>
      <SeedBackground />
      {user && <Navbar onAddSeed={() => setShowForm(true)} />}
      <Routes>
        <Route path="/" element={
          user ? <Home showForm={showForm} setShowForm={setShowForm} /> : <Navigate to="/welcome" replace />
        } />
        <Route path="/welcome"  element={<LandingPage />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*"         element={<Navigate to={user ? "/" : "/welcome"} replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppInner />
      </ToastProvider>
    </AuthProvider>
  )
}
