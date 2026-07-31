"use client"

import { useState, useEffect } from 'react'
import { X, Leaf } from 'lucide-react'
import './SeedForm.css'

const CROP_TYPES = [
  'Rice','Wheat','Corn','Soybean','Cotton','Sugarcane','Mustard',
  'Sunflower','Groundnut','Millet','Barley','Pulses','Vegetables',
  'Fruits','Spices','Oilseeds','Flowers','Fodder','Other'
]
const SEASONS = ['Kharif','Rabi','Zaid','All Season']
const UNITS   = ['kg','g','packets','bags','quintals']

const EMPTY = {
  name:'', cropType:'Rice', variety:'', brand:'', quantity:'',
  unit:'kg', price:'', description:'', season:'All Season',
  isAvailable: true,
  location: { city:'', state:'' }
}

export default function SeedForm({ seed, onSubmit, onClose, loading }) {
  const [form, setForm] = useState(EMPTY)

  useEffect(() => {
    if (seed) {
      setForm({
        ...EMPTY, ...seed,
        location: { city: seed.location?.city||'', state: seed.location?.state||'' }
      })
    } else {
      setForm(EMPTY)
    }
  }, [seed])

  const set = (field, val) => setForm(p => ({ ...p, [field]: val }))
  const setLoc = (field, val) => setForm(p => ({ ...p, location: { ...p.location, [field]: val } }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      ...form,
      quantity: Number(form.quantity),
      price:    Number(form.price) || 0,
      location: {
        type: 'Point',
        coordinates: [0, 0],
        city:  form.location.city,
        state: form.location.state
      }
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal seed-form-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">
            <div className="modal-title-icon"><Leaf size={18}/></div>
            <h2>{seed ? 'Edit Seed' : 'Add New Seed'}</h2>
          </div>
          <button className="btn btn-ghost btn-sm icon-btn" onClick={onClose}>
            <X size={20}/>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body seed-form-grid">

            {/* Seed Name */}
            <div className="form-group span-2">
              <label className="form-label">Seed Name *</label>
              <input className="form-input" required placeholder="e.g. Pusa Basmati 1121"
                value={form.name} onChange={e => set('name', e.target.value)} />
            </div>

            {/* Crop Type */}
            <div className="form-group">
              <label className="form-label">Crop Type *</label>
              <select className="form-select" required
                value={form.cropType} onChange={e => set('cropType', e.target.value)}>
                {CROP_TYPES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            {/* Season */}
            <div className="form-group">
              <label className="form-label">Season</label>
              <select className="form-select"
                value={form.season} onChange={e => set('season', e.target.value)}>
                {SEASONS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            {/* Variety */}
            <div className="form-group">
              <label className="form-label">Variety</label>
              <input className="form-input" placeholder="e.g. Hybrid, Desi"
                value={form.variety} onChange={e => set('variety', e.target.value)} />
            </div>

            {/* Brand */}
            <div className="form-group">
              <label className="form-label">Brand</label>
              <input className="form-input" placeholder="e.g. Mahyco"
                value={form.brand} onChange={e => set('brand', e.target.value)} />
            </div>

            {/* Quantity */}
            <div className="form-group">
              <label className="form-label">Quantity *</label>
              <input className="form-input" type="number" min="0" required placeholder="0"
                value={form.quantity} onChange={e => set('quantity', e.target.value)} />
            </div>

            {/* Unit */}
            <div className="form-group">
              <label className="form-label">Unit</label>
              <select className="form-select"
                value={form.unit} onChange={e => set('unit', e.target.value)}>
                {UNITS.map(u => <option key={u}>{u}</option>)}
              </select>
            </div>

            {/* Price */}
            <div className="form-group">
              <label className="form-label">Price (₹)</label>
              <input className="form-input" type="number" min="0" placeholder="per unit"
                value={form.price} onChange={e => set('price', e.target.value)} />
            </div>

            {/* City */}
            <div className="form-group">
              <label className="form-label">City</label>
              <input className="form-input" placeholder="e.g. Pune"
                value={form.location.city} onChange={e => setLoc('city', e.target.value)} />
            </div>

            {/* State */}
            <div className="form-group">
              <label className="form-label">State</label>
              <input className="form-input" placeholder="e.g. Maharashtra"
                value={form.location.state} onChange={e => setLoc('state', e.target.value)} />
            </div>

            {/* Description */}
            <div className="form-group span-2">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" placeholder="Additional notes about the seed..."
                value={form.description} onChange={e => set('description', e.target.value)} />
            </div>

            {/* Availability Toggle */}
            <div className="form-group span-2">
              <label className="avail-toggle">
                <input type="checkbox" className="hidden-checkbox" checked={form.isAvailable}
                  onChange={e => set('isAvailable', e.target.checked)} />
                <span className="avail-track">
                  <span className="avail-thumb" />
                </span>
                <span className="avail-label">
                  {form.isAvailable ? '✅ Available for sale' : '❌ Not available'}
                </span>
              </label>
            </div>

          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner"/> : (seed ? 'Update Seed' : 'Add Seed')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
