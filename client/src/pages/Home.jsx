import { useState, useEffect, useCallback, useRef } from 'react'
import { Leaf, Sprout, RefreshCw, ChevronLeft, ChevronRight, Wifi, WifiOff } from 'lucide-react'
import FilterBar from '../components/FilterBar'
import SeedCard from '../components/SeedCard'
import SeedForm from '../components/SeedForm'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getSocket } from '../services/socket'
import api from '../services/api'
import TrackingAnimation from '../components/TrackingAnimation'
import './Home.css'

const DEFAULT_FILTERS = { search: '', cropType: '', season: '', available: '' }

export default function Home({ showForm, setShowForm }) {
  const { user, isDealer } = useAuth()
  const toast = useToast()

  const [seeds, setSeeds]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [formLoading, setFormLoad] = useState(false)
  const [editSeed, setEditSeed]   = useState(null)
  const [filters, setFilters]     = useState(DEFAULT_FILTERS)
  const [page, setPage]           = useState(1)
  const [pagination, setPagination] = useState({ total:0, pages:1 })
  const [locating, setLocating]   = useState(false)
  const [coords, setCoords]       = useState(null)
  const [connected, setConnected] = useState(true)
  const [activeOrder, setActiveOrder] = useState(null)
  const searchTimeout = useRef(null)

  /* ── Fetch seeds ── */
  const fetchSeeds = useCallback(async (pg = 1, fil = filters, loc = coords) => {
    setLoading(true)
    try {
      const params = { page: pg, limit: 12, ...fil }
      if (loc) { params.lat = loc.lat; params.lng = loc.lng; params.radius = 80 }
      // Remove empty keys
      Object.keys(params).forEach(k => !params[k] && delete params[k])
      const { data } = await api.get('/seeds', { params })
      setSeeds(data.data)
      setPagination(data.pagination)
      setPage(pg)
    } catch (e) {
      toast.error('Failed to load seeds')
    } finally {
      setLoading(false)
    }
  }, [filters, coords])

  /* ── Debounced search ── */
  useEffect(() => {
    clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => fetchSeeds(1, filters, coords), 350)
    return () => clearTimeout(searchTimeout.current)
  }, [filters, coords])

  /* ── Socket.io real-time ── */
  useEffect(() => {
    const socket = getSocket()

    socket.on('connect',    () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))

    socket.on('seed:created', (newSeed) => {
      setSeeds(prev => [newSeed, ...prev.slice(0, 11)])
      toast.info(`🌱 New seed added: ${newSeed.name}`)
    })
    socket.on('seed:updated', (updated) => {
      setSeeds(prev => prev.map(s => s._id === updated._id ? updated : s))
    })
    socket.on('seed:deleted', (id) => {
      setSeeds(prev => prev.filter(s => s._id !== id))
    })

    socket.on('order:updated', (updated) => {
      if (user && (updated.farmer === user.id || updated.dealer === user.id)) {
        setActiveOrder(updated)
        toast.info(`📦 Order Status: ${updated.status}`)
      }
    })

    return () => {
      socket.off('seed:created')
      socket.off('seed:updated')
      socket.off('seed:deleted')
      socket.off('order:updated')
      socket.off('connect')
      socket.off('disconnect')
    }
  }, [])

  /* ── GPS locate ── */
  const handleLocate = () => {
    if (!navigator.geolocation) return toast.error('Geolocation not supported')
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        toast.success('📍 Showing seeds near you')
        setLocating(false)
      },
      () => { toast.error('Location access denied'); setLocating(false) }
    )
  }

  /* ── Dealer: Add / Edit ── */
  const handleFormSubmit = async (formData) => {
    setFormLoad(true)
    try {
      if (editSeed) {
        await api.put(`/seeds/${editSeed._id}`, formData)
        toast.success('Seed updated!')
      } else {
        await api.post('/seeds', formData)
        toast.success('Seed added!')
      }
      setShowForm(false)
      setEditSeed(null)
      fetchSeeds(page)
    } catch (e) {
      toast.error(e.response?.data?.message || 'Error saving seed')
    } finally {
      setFormLoad(false)
    }
  }

  const handleEdit = (seed) => { setEditSeed(seed); setShowForm(true) }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this seed listing?')) return
    try {
      await api.delete(`/seeds/${id}`)
      toast.success('Seed deleted')
      setSeeds(prev => prev.filter(s => s._id !== id))
    } catch (e) {
      toast.error('Failed to delete seed')
    }
  }

  const handleToggleAvail = async (id) => {
    try {
      const { data } = await api.patch(`/seeds/${id}/availability`)
      setSeeds(prev => prev.map(s => s._id === id ? data.data : s))
    } catch (e) {
      toast.error('Failed to update availability')
    }
  }

  const handleUpdateQty = async (id, qty) => {
    try {
      const { data } = await api.patch(`/seeds/${id}/quantity`, { quantity: qty })
      setSeeds(prev => prev.map(s => s._id === id ? data.data : s))
      toast.success('Quantity updated')
    } catch (e) {
      toast.error('Failed to update quantity')
    }
  }

  const fetchLatestOrder = useCallback(async () => {
    if (!user) return setActiveOrder(null)
    try {
      const { data } = await api.get('/orders')
      if (data.data && data.data.length > 0) {
        setActiveOrder(data.data[0])
      }
    } catch (e) {
      console.error('Order fetch failed')
    }
  }, [user])

  useEffect(() => {
    fetchLatestOrder()
  }, [fetchLatestOrder])

  const handleCloseForm = () => { setShowForm(false); setEditSeed(null) }

  const getStatusStep = (status) => {
    const steps = { 'Processing': 1, 'Quality Check': 2, 'Packaging': 3, 'Dispatched': 4, 'Delivered': 5 }
    return steps[status] || 1
  }

  return (
    <div className="home-page">
      {/* Real-time Status Bar */}
      <div className="live-status-bar">
        <div className="container status-inner">
          <div className="status-item">
            <span className={`status-dot ${connected ? 'online' : 'offline'}`} />
            {connected ? 'Live Network Connected' : 'Attempting Reconnection...'}
          </div>
          <div className="status-item">
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            Auto-Sync Active
          </div>
          <div className="status-item desktop-only">
            <RefreshCw size={14} />
            Local Node: India-West-01
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="hero">
        <div className="container">
          <div className="hero-badge">
            <Sprout size={14}/> Connecting Farmers &amp; Dealers
          </div>
          <h1 className="hero-title">
            Find Seeds <span>Near You</span>
          </h1>
          <p className="hero-sub">
            Real-time seed availability from verified dealers across India.
            {user ? ` Welcome back, ${user.name}!` : ' Browse or login as a dealer to list your stock.'}
          </p>
        </div>
      </section>

      {/* Tracking Visualization */}
      {user && activeOrder && (
        <section className="tracking-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Your Seed <span>Journey</span></h2>
              <p className="section-desc">Tracking order for <strong>{activeOrder.seed?.name}</strong></p>
            </div>
            <TrackingAnimation currentStep={getStatusStep(activeOrder.status)} />
          </div>
        </section>
      )}
      <div className="container main-content">
        {/* Filter Bar */}
        <FilterBar
          filters={filters}
          onChange={(f) => { setFilters(f); setCoords(null) }}
          onLocate={handleLocate}
          locating={locating}
        />

        {/* Results Header */}
        <div className="results-header">
          <p className="results-count">
            {loading ? 'Loading…' : `${pagination.total} seed${pagination.total !== 1 ? 's' : ''} found`}
            {coords && <span className="nearby-badge">📍 Nearby</span>}
          </p>
          <button className="btn btn-ghost btn-sm" onClick={() => fetchSeeds(page)}>
            <RefreshCw size={14}/> Refresh
          </button>
        </div>

        {/* Seeds Grid */}
        {loading ? (
          <div className="loading-grid">
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton-card"/>)}
          </div>
        ) : seeds.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🌾</div>
            <h3>No seeds found</h3>
            <p>Try adjusting your filters or search term</p>
            {isDealer && (
              <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                <Leaf size={16}/> Add First Seed
              </button>
            )}
          </div>
        ) : (
          <div className="seeds-grid">
            {seeds.map(seed => (
              <SeedCard
                key={seed._id}
                seed={seed}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleAvail={handleToggleAvail}
                onUpdateQty={handleUpdateQty}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="pagination">
            <button className="btn btn-secondary btn-sm"
              disabled={page <= 1} onClick={() => fetchSeeds(page - 1)}>
              <ChevronLeft size={16}/> Prev
            </button>
            <div className="page-numbers">
              {[...Array(pagination.pages)].map((_, i) => (
                <button
                  key={i}
                  className={`page-btn ${page === i+1 ? 'active' : ''}`}
                  onClick={() => fetchSeeds(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button className="btn btn-secondary btn-sm"
              disabled={page >= pagination.pages} onClick={() => fetchSeeds(page + 1)}>
              Next <ChevronRight size={16}/>
            </button>
          </div>
        )}
      </div>

      {/* Seed Form Modal */}
      {showForm && (
        <SeedForm
          seed={editSeed}
          onSubmit={handleFormSubmit}
          onClose={handleCloseForm}
          loading={formLoading}
        />
      )}
    </div>
  )
}
