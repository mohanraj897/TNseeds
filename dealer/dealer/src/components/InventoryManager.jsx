import { useState } from 'react'
import { Plus, Edit2, Trash2, CheckCircle, XCircle, RefreshCw } from 'lucide-react'

export default function InventoryManager({ 
  seeds = [], 
  onAddSeed, 
  onEditSeed, 
  onDeleteSeed, 
  onToggleAvail, 
  onUpdateQty,
  loading 
}) {
  const [editingQtyId, setEditingQtyId] = useState(null)
  const [tempQty, setTempQty] = useState('')

  const startEditQty = (seed) => {
    setEditingQtyId(seed._id)
    setTempQty(seed.quantity)
  }

  const saveQty = (id) => {
    if (tempQty !== '') {
      onUpdateQty(id, parseInt(tempQty, 10))
    }
    setEditingQtyId(null)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FFF' }}>Inventory Stock Management</h2>
          <p style={{ fontSize: '0.85rem', color: '#94A3B8' }}>Control availability, edit prices, and manage listed seeds in real time.</p>
        </div>
        <button className="btn btn-primary" onClick={onAddSeed}>
          <Plus size={18} /> Add New Seed Stock
        </button>
      </div>

      <div className="card-table">
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Seed Info</th>
                <th>Category / Season</th>
                <th>Price (₹)</th>
                <th>Warehouse Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#94A3B8' }}>
                    <RefreshCw className="spin" size={24} style={{ marginBottom: '0.5rem' }} />
                    <div>Loading inventory details...</div>
                  </td>
                </tr>
              ) : seeds.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3.5rem', color: '#94A3B8' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🌾</div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#FFF' }}>No seed listings found</div>
                    <div style={{ fontSize: '0.85rem', marginTop: '0.2rem' }}>Click "Add New Seed Stock" above to create your first listing!</div>
                  </td>
                </tr>
              ) : (
                seeds.map((seed) => {
                  const isOut = !seed.isAvailable || seed.quantity <= 0
                  return (
                    <tr key={seed._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          {seed.image ? (
                            <img 
                              src={seed.image} 
                              alt={seed.name} 
                              style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }} 
                            />
                          ) : (
                            <div style={{ width: 44, height: 44, borderRadius: 8, background: 'rgba(16,185,129,0.15)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                              🌾
                            </div>
                          )}
                          <div>
                            <div style={{ fontWeight: 700, color: '#FFF', fontSize: '0.95rem' }}>{seed.name}</div>
                            <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                              {seed.variety ? `Var: ${seed.variety}` : ''} {seed.brand ? `• ${seed.brand}` : ''}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 600, color: '#FFF' }}>{seed.cropType}</div>
                        <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>{seed.season}</div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 800, color: '#10B981', fontSize: '1rem' }}>
                          ₹{seed.price} <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 400 }}>/kg</span>
                        </div>
                      </td>

                      <td>
                        {editingQtyId === seed._id ? (
                          <div className="stock-inline-edit">
                            <input 
                              type="number" 
                              value={tempQty} 
                              onChange={(e) => setTempQty(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && saveQty(seed._id)}
                              autoFocus 
                            />
                            <button className="btn btn-primary btn-sm" onClick={() => saveQty(seed._id)}>Save</button>
                          </div>
                        ) : (
                          <div 
                            style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                            onClick={() => startEditQty(seed)}
                            title="Click to edit quantity"
                          >
                            <span style={{ fontWeight: 700, color: seed.quantity < 50 ? '#F87171' : '#FFF' }}>
                              {seed.quantity} kg
                            </span>
                            <Edit2 size={12} color="#94A3B8" />
                          </div>
                        )}
                      </td>

                      <td>
                        <button 
                          className={`badge ${seed.isAvailable ? 'badge-success' : 'badge-danger'}`}
                          onClick={() => onToggleAvail(seed._id)}
                          style={{ cursor: 'pointer', border: 'none' }}
                          title="Click to toggle availability"
                        >
                          {seed.isAvailable ? <><CheckCircle size={12} /> Active</> : <><XCircle size={12} /> Disabled</>}
                        </button>
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <button 
                            className="btn btn-secondary btn-sm" 
                            onClick={() => onEditSeed(seed)}
                            title="Edit details"
                          >
                            <Edit2 size={14} /> Edit
                          </button>

                          <button 
                            className="btn btn-danger btn-sm" 
                            onClick={() => onDeleteSeed(seed._id)}
                            title="Delete seed"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
