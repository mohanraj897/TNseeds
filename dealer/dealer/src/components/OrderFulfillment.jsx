import { useState } from 'react'
import { ShoppingBag, Truck, CheckCircle2, Clock, RefreshCw, User, ShieldAlert } from 'lucide-react'

const STATUS_STEPS = ['Processing', 'Quality Check', 'Packaging', 'Dispatched', 'Delivered', 'Cancelled']

export default function OrderFulfillment({ orders = [], onUpdateStatus, loading }) {
  const [updatingId, setUpdatingId] = useState(null)

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId)
    await onUpdateStatus(orderId, newStatus)
    setUpdatingId(null)
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Delivered': return 'badge-success'
      case 'Dispatched': return 'badge-info'
      case 'Packaging':
      case 'Quality Check':
      case 'Processing': return 'badge-warning'
      case 'Cancelled': return 'badge-danger'
      default: return 'badge-info'
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FFF' }}>Farmer Order Fulfillment</h2>
        <p style={{ fontSize: '0.85rem', color: '#94A3B8' }}>Track incoming seed requests and update order status for live farmer tracking.</p>
      </div>

      <div className="card-table">
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Order ID & Date</th>
                <th>Farmer Info</th>
                <th>Seed Details</th>
                <th>Qty & Total</th>
                <th>Current Status</th>
                <th>Update Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#94A3B8' }}>
                    <RefreshCw className="spin" size={24} style={{ marginBottom: '0.5rem' }} />
                    <div>Loading order requests...</div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3.5rem', color: '#94A3B8' }}>
                    <ShoppingBag size={40} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#FFF' }}>No active orders</div>
                    <div style={{ fontSize: '0.85rem', marginTop: '0.2rem' }}>When farmers order seeds from your catalog, they will appear here.</div>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#FFF', fontSize: '0.88rem' }}>
                        #{order._id.substring(order._id.length - 8).toUpperCase()}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                        {new Date(order.createdAt || Date.now()).toLocaleDateString()}
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <User size={14} color="#3B82F6" />
                        <span style={{ fontWeight: 600, color: '#FFF' }}>{order.farmer?.name || 'Farmer Client'}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{order.shippingAddress?.city || 'Local Delivery'}</div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 700, color: '#10B981' }}>{order.seed?.name || 'Seed Order'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{order.seed?.cropType || ''}</div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 700, color: '#FFF' }}>{order.quantity || 1} kg/bags</div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#34D399' }}>
                        ₹{(order.totalAmount || 0).toLocaleString()}
                      </div>
                    </td>

                    <td>
                      <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                        {order.status === 'Delivered' ? <CheckCircle2 size={12}/> : <Clock size={12}/>}
                        {order.status || 'Processing'}
                      </span>
                    </td>

                    <td>
                      <select 
                        className="form-select"
                        value={order.status || 'Processing'}
                        disabled={updatingId === order._id || order.status === 'Delivered' || order.status === 'Cancelled'}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        style={{ width: 'auto', padding: '0.4rem 0.6rem', fontSize: '0.82rem' }}
                      >
                        {STATUS_STEPS.map(step => (
                          <option key={step} value={step}>{step}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
