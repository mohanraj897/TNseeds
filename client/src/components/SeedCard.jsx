import { useState } from 'react'
import {
  Leaf, Phone, MapPin, Package, Tag, Layers,
  ToggleLeft, ToggleRight, Edit2, Trash2, Sun, Wheat
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import './SeedCard.css'

const CROP_ICONS = {
  Rice: '🌾', Wheat: '🌿', Corn: '🌽', Soybean: '🫘', Cotton: '🌸',
  Sugarcane: '🎋', Mustard: '🌼', Sunflower: '🌻', Groundnut: '🥜',
  Millet: '🌾', Barley: '🌱', Pulses: '🫘', Vegetables: '🥦',
  Fruits: '🍎', Spices: '🌶️', Oilseeds: '🌿', Flowers: '💐',
  Fodder: '🌿', Other: '🌱'
}

const SEASON_COLORS = {
  Kharif: 'amber', Rabi: 'badge-blue', Zaid: 'badge-purple', 'All Season': 'green'
}

export default function SeedCard({ seed, onEdit, onDelete, onToggleAvail, onUpdateQty }) {
  const { isDealer, user } = useAuth()
  const isOwner = isDealer && seed.dealer?._id === user?.id
  const [qtyEdit, setQtyEdit] = useState(false)
  const [newQty, setNewQty]   = useState(seed.quantity)

  const handleCall = () => {
    const phone = seed.dealer?.phone
    if (phone) window.location.href = `tel:${phone}`
  }

  const handleQtySubmit = (e) => {
    e.preventDefault()
    onUpdateQty(seed._id, Number(newQty))
    setQtyEdit(false)
  }

  const icon = CROP_ICONS[seed.cropType] || '🌱'
  const seasonBadge = SEASON_COLORS[seed.season] || 'green'

  return (
    <div className={`seed-card card ${!seed.isAvailable ? 'unavailable' : ''}`}>
      {/* Header */}
      <div className="seed-card-header">
        <div className="crop-icon-wrap">{icon}</div>
        <div className="seed-meta">
          <span className={`badge badge-${seasonBadge}`}>{seed.season}</span>
          <span className={`badge ${seed.isAvailable ? 'badge-green' : 'badge-red'}`}>
            {seed.isAvailable ? '● In Stock' : '● Out of Stock'}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="seed-card-body">
        <h3 className="seed-name">{seed.name}</h3>
        {seed.variety && <p className="seed-variety">{seed.variety}</p>}

        <div className="seed-info-row">
          <div className="info-item">
            <Layers size={14} />
            <span>{seed.cropType}</span>
          </div>
          {seed.brand && (
            <div className="info-item">
              <Tag size={14} />
              <span>{seed.brand}</span>
            </div>
          )}
        </div>

        {/* Quantity */}
        <div className="qty-row">
          <Package size={15} />
          {qtyEdit && isOwner ? (
            <form className="qty-edit-form" onSubmit={handleQtySubmit}>
              <input
                type="number" min="0"
                className="form-input qty-input"
                value={newQty}
                onChange={e => setNewQty(e.target.value)}
                autoFocus
              />
              <button className="btn btn-primary btn-sm" type="submit">Save</button>
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => setQtyEdit(false)}>✕</button>
            </form>
          ) : (
            <span className="qty-value">
              {seed.quantity} {seed.unit}
              {isOwner && (
                <button className="qty-edit-btn" onClick={() => setQtyEdit(true)} title="Edit quantity">
                  <Edit2 size={12} />
                </button>
              )}
            </span>
          )}
        </div>

        {/* Price */}
        {seed.price > 0 && (
          <div className="price-tag">
            ₹{seed.price.toLocaleString('en-IN')} / {seed.unit}
          </div>
        )}

        {/* Dealer info */}
        <div className="dealer-info">
          <div className="dealer-name">
            <Leaf size={13} />
            <span>{seed.dealer?.storeName || seed.dealer?.name || 'Unknown Store'}</span>
          </div>
          {(seed.location?.city || seed.dealer?.location?.city) && (
            <div className="info-item">
              <MapPin size={13} />
              <span>{seed.location?.city || seed.dealer?.location?.city}</span>
            </div>
          )}
        </div>

        {seed.description && (
          <p className="seed-desc">{seed.description}</p>
        )}
      </div>

      {/* Footer */}
      <div className="seed-card-footer">
        {/* Farmer: Call button */}
        {!isOwner && (
          <button className="btn btn-primary btn-full" onClick={handleCall}>
            <Phone size={16} />
            Call Dealer
          </button>
        )}

        {/* Dealer: Manage controls */}
        {isOwner && (
          <div className="dealer-controls">
            <button
              className={`btn btn-sm ${seed.isAvailable ? 'btn-secondary' : 'btn-primary'}`}
              onClick={() => onToggleAvail(seed._id)}
              title="Toggle availability"
            >
              {seed.isAvailable
                ? <><ToggleRight size={15} /> Available</>
                : <><ToggleLeft size={15} /> Unavailable</>
              }
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => onEdit(seed)}>
              <Edit2 size={14} />
            </button>
            <button className="btn btn-danger btn-sm" onClick={() => onDelete(seed._id)}>
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
