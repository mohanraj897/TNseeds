import { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle, XCircle, Info } from 'lucide-react'

const ToastContext = createContext(null)

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }, [])

  const success = useCallback((msg) => addToast(msg, 'success'), [addToast])
  const error   = useCallback((msg) => addToast(msg, 'error'),   [addToast])
  const info    = useCallback((msg) => addToast(msg, 'info'),    [addToast])

  const icons = { success: CheckCircle, error: XCircle, info: Info }

  return (
    <ToastContext.Provider value={{ success, error, info }}>
      {children}
      <div className="toast-container">
        {toasts.map(t => {
          const Icon = icons[t.type]
          return (
            <div key={t.id} className={`toast toast-${t.type}`}>
              <Icon size={18} />
              <span>{t.message}</span>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}
