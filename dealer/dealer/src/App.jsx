import { useState, useEffect, useCallback } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import DealerNavbar from './components/DealerNavbar'
import DealerAnalytics from './components/DealerAnalytics'
import InventoryManager from './components/InventoryManager'
import OrderFulfillment from './components/OrderFulfillment'
import SeedModal from './components/SeedModal'
import { getSocket } from './services/socket'
import api from './services/api'
import { Package, ShoppingBag, Store, CheckCircle, AlertCircle } from 'lucide-react'

function DealerDashboard() {
  const { user, login, register, isDealer } = useAuth()

  const [activeTab, setActiveTab] = useState('inventory') // 'inventory' | 'orders'
  const [seeds, setSeeds] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [connected, setConnected] = useState(true)

  // Seed modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editSeed, setEditSeed] = useState(null)
  const [modalLoading, setModalLoading] = useState(false)

  // Toast banner
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  /* ── Fetch dealer seeds ── */
  const fetchDealerSeeds = useCallback(async () => {
    setLoading(true)
    try {
      if (user && isDealer) {
        const { data } = await api.get('/seeds/dealer/my-seeds')
        setSeeds(data.data || [])
      } else {
        const { data } = await api.get('/seeds')
        setSeeds(data.data || [])
      }
    } catch (err) {
      console.error(err)
      showToast('Failed to load dealer inventory', 'error')
    } finally {
      setLoading(false)
    }
  }, [user, isDealer])

  /* ── Fetch orders ── */
  const fetchOrders = useCallback(async () => {
    if (!user) return
    setOrdersLoading(true)
    try {
      const { data } = await api.get('/orders')
      setOrders(data.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setOrdersLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchDealerSeeds()
    fetchOrders()
  }, [fetchDealerSeeds, fetchOrders])

  /* ── Socket setup ── */
  useEffect(() => {
    const socket = getSocket()

    socket.on('connect', () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))

    socket.on('seed:created', (newSeed) => {
      setSeeds(prev => [newSeed, ...prev])
      showToast(`🌱 Seed listing created: ${newSeed.name}`)
    })

    socket.on('seed:updated', (updated) => {
      setSeeds(prev => prev.map(s => s._id === updated._id ? updated : s))
    })

    socket.on('seed:deleted', (id) => {
      setSeeds(prev => prev.filter(s => s._id !== id))
      showToast('🗑️ Seed listing removed')
    })

    socket.on('order:updated', (updatedOrder) => {
      setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o))
      showToast(`📦 Order status updated: ${updatedOrder.status}`)
    })

    return () => {
      socket.off('connect')
      socket.off('disconnect')
      socket.off('seed:created')
      socket.off('seed:updated')
      socket.off('seed:deleted')
      socket.off('order:updated')
    }
  }, [])

  /* ── Quick Demo Login Handler ── */
  const handleQuickDemoLogin = async () => {
    try {
      await login('dealer@demo.com', 'demo123')
      showToast('Logged in as Demo Dealer!')
    } catch (err) {
      // Try registering demo dealer if not existing
      try {
        await register({
          name: 'Green Field Seeds Dealer',
          email: 'dealer@demo.com',
          password: 'demo123',
          phone: '9876543210',
          storeName: 'TN Agriculture & Seed Center'
        })
        showToast('Registered & Logged in as Demo Dealer!')
      } catch (regErr) {
        showToast('Demo login error: ' + (regErr.response?.data?.message || regErr.message), 'error')
      }
    }
  }

  /* ── Seed Modal handlers ── */
  const handleAddSeed = () => {
    if (!user) {
      handleQuickDemoLogin()
      return
    }
    setEditSeed(null)
    setIsModalOpen(true)
  }

  const handleEditSeed = (seed) => {
    setEditSeed(seed)
    setIsModalOpen(true)
  }

  const handleModalSubmit = async (formData) => {
    setModalLoading(true)
    try {
      if (editSeed) {
        const { data } = await api.put(`/seeds/${editSeed._id}`, formData)
        setSeeds(prev => prev.map(s => s._id === editSeed._id ? data.data : s))
        showToast('Seed listing updated!')
      } else {
        const { data } = await api.post('/seeds', formData)
        setSeeds(prev => [data.data, ...prev])
        showToast('New seed published to catalog!')
      }
      setIsModalOpen(false)
    } catch (err) {
      showToast(err.response?.data?.message || 'Error saving seed', 'error')
    } finally {
      setModalLoading(false)
    }
  }

  const handleDeleteSeed = async (id) => {
    if (!window.confirm('Are you sure you want to delete this seed listing?')) return
    try {
      await api.delete(`/seeds/${id}`)
      setSeeds(prev => prev.filter(s => s._id !== id))
      showToast('Seed listing deleted')
    } catch (err) {
      showToast('Failed to delete seed', 'error')
    }
  }

  const handleToggleAvail = async (id) => {
    try {
      const { data } = await api.patch(`/seeds/${id}/availability`)
      setSeeds(prev => prev.map(s => s._id === id ? data.data : s))
      showToast(`Stock availability toggled!`)
    } catch (err) {
      showToast('Failed to toggle status', 'error')
    }
  }

  const handleUpdateQty = async (id, qty) => {
    try {
      const { data } = await api.patch(`/seeds/${id}/quantity`, { quantity: qty })
      setSeeds(prev => prev.map(s => s._id === id ? data.data : s))
      showToast('Stock quantity updated!')
    } catch (err) {
      showToast('Failed to update quantity', 'error')
    }
  }

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const { data } = await api.patch(`/orders/${orderId}/status`, { status: newStatus })
      setOrders(prev => prev.map(o => o._id === orderId ? data.data : o))
      showToast(`Order status updated to: ${newStatus}`)
    } catch (err) {
      showToast('Failed to update order status', 'error')
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <DealerNavbar connected={connected} onQuickLogin={handleQuickDemoLogin} />

      <main className="container" style={{ flex: 1, paddingBottom: '3rem' }}>
        {/* Banner if not logged in */}
        {!user && (
          <div style={{ 
            marginTop: '1.5rem', 
            background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(59,130,246,0.15))',
            border: '1px solid rgba(16,185,129,0.3)',
            borderRadius: '16px',
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFF', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Store color="#10B981" /> Dealer Portal Mode
              </div>
              <div style={{ fontSize: '0.9rem', color: '#94A3B8', marginTop: '0.2rem' }}>
                Login as a verified Dealer to list seeds, edit quantities, and fulfill farmer orders.
              </div>
            </div>
            <button className="btn btn-primary" onClick={handleQuickDemoLogin}>
              Click Here to Login as Demo Dealer
            </button>
          </div>
        )}

        {/* Dashboard Header */}
        <div className="dashboard-header">
          <h1 className="dashboard-title">
            <span>🏪 Dealer Portal</span>
            {user?.storeName && <span style={{ fontSize: '1rem', fontWeight: 600, color: '#10B981', background: 'rgba(16,185,129,0.15)', padding: '0.2rem 0.75rem', borderRadius: '50px' }}>{user.storeName}</span>}
          </h1>
          <p className="dashboard-subtitle">
            Manage your seed inventory catalog, update prices, adjust stock levels, and process farmer orders.
          </p>
        </div>

        {/* Analytics Grid */}
        <DealerAnalytics seeds={seeds} orders={orders} />

        {/* Tabs */}
        <div className="tab-container">
          <button 
            className={`tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => setActiveTab('inventory')}
          >
            <Package size={18} /> Seed Catalog & Stock ({seeds.length})
          </button>
          
          <button 
            className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <ShoppingBag size={18} /> Order Fulfillment ({orders.length})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'inventory' ? (
          <InventoryManager
            seeds={seeds}
            onAddSeed={handleAddSeed}
            onEditSeed={handleEditSeed}
            onDeleteSeed={handleDeleteSeed}
            onToggleAvail={handleToggleAvail}
            onUpdateQty={handleUpdateQty}
            loading={loading}
          />
        ) : (
          <OrderFulfillment
            orders={orders}
            onUpdateStatus={handleUpdateOrderStatus}
            loading={ordersLoading}
          />
        )}
      </main>

      {/* Seed Edit/Create Modal */}
      <SeedModal
        seed={editSeed}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        loading={modalLoading}
      />

      {/* Notification Toast */}
      {toast && (
        <div className="toast-banner" style={{ background: toast.type === 'error' ? '#EF4444' : '#10B981' }}>
          {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
          <span>{toast.msg}</span>
        </div>
      )}
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <DealerDashboard />
    </AuthProvider>
  )
}
