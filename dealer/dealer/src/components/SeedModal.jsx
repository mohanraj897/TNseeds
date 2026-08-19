import { useState, useEffect } from 'react'
import { X, Sprout, Save } from 'lucide-react'

const CROP_TYPES = [
  'Rice', 'Wheat', 'Corn', 'Soybean', 'Cotton',
  'Sugarcane', 'Mustard', 'Sunflower', 'Groundnut', 'Millet',
  'Barley', 'Pulses', 'Vegetables', 'Fruits', 'Spices',
  'Oilseeds', 'Flowers', 'Fodder', 'Other'
]

const SEASONS = ['Kharif', 'Rabi', 'Zaid', 'All Season']

export default function SeedModal({ seed, isOpen, onClose, onSubmit, loading }) {
  const [form, setForm] = useState({
    name: '',
    cropType: 'Rice',
    variety: '',
    brand: '',
    season: 'Kharif',
    price: '',
    quantity: '',
    germinationRate: 90,
    purity: 98,
    description: '',
    image: '',
    isAvailable: true
  })

  useEffect(() => {
    if (seed) {
      setForm({
        name: seed.name || '',
        cropType: seed.cropType || 'Rice',
        variety: seed.variety || '',
        brand: seed.brand || '',
        season: seed.season || 'Kharif',
        price: seed.price || '',
        quantity: seed.quantity || '',
        germinationRate: seed.germinationRate || 90,
        purity: seed.purity || 98,
        description: seed.description || '',
        image: seed.image || '',
        isAvailable: seed.isAvailable !== undefined ? seed.isAvailable : true
      })
    } else {
      setForm({
        name: '',
        cropType: 'Rice',
        variety: '',
        brand: '',
        season: 'Kharif',
        price: '',
        quantity: '',
        germinationRate: 90,
        purity: 98,
        description: '',
        image: '',
        isAvailable: true
      })
    }
  }, [seed, isOpen])

  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sprout color="#10B981" size={22} />
            {seed ? 'Edit Seed Stock' : 'Add New Seed Stock'}
          </h3>
          <button className="btn-ghost" onClick={onClose} style={{ padding: '0.4rem', borderRadius: '50%' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Seed / Crop Name *</label>
            <input
              type="text"
              name="name"
              required
              className="form-input"
              placeholder="e.g. Sona Masoori Paddy Seed"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Crop Category *</label>
              <select name="cropType" className="form-select" value={form.cropType} onChange={handleChange}>
                {CROP_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Season *</label>
              <select name="season" className="form-select" value={form.season} onChange={handleChange}>
                {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Variety / Hybrid Code</label>
              <input
                type="text"
                name="variety"
                className="form-input"
                placeholder="e.g. BPT 5204"
                value={form.variety}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Brand / Manufacturer</label>
              <input
                type="text"
                name="brand"
                className="form-input"
                placeholder="e.g. Kaveri / Syngenta"
                value={form.brand}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Price (₹ per kg/bag) *</label>
              <input
                type="number"
                name="price"
                required
                min="0"
                className="form-input"
                placeholder="450"
                value={form.price}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Available Quantity (kg) *</label>
              <input
                type="number"
                name="quantity"
                required
                min="0"
                className="form-input"
                placeholder="500"
                value={form.quantity}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Germination Rate (%)</label>
              <input
                type="number"
                name="germinationRate"
                min="0"
                max="100"
                className="form-input"
                value={form.germinationRate}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Purity (%)</label>
              <input
                type="number"
                name="purity"
                min="0"
                max="100"
                className="form-input"
                value={form.purity}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Image URL (Optional)</label>
            <input
              type="url"
              name="image"
              className="form-input"
              placeholder="https://images.unsplash.com/photo-..."
              value={form.image}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Description & Usage Notes</label>
            <textarea
              name="description"
              rows="3"
              className="form-textarea"
              placeholder="High yield variety suitable for well-drained soil..."
              value={form.description}
              onChange={handleChange}
            />
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <input
              type="checkbox"
              id="isAvailable"
              name="isAvailable"
              checked={form.isAvailable}
              onChange={handleChange}
              style={{ width: '18px', height: '18px', accentColor: '#10B981' }}
            />
            <label htmlFor="isAvailable" style={{ margin: 0, cursor: 'pointer', color: '#FFF', fontWeight: 600 }}>
              Mark active for immediate farmer ordering
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Save size={16} /> {loading ? 'Saving...' : (seed ? 'Update Seed' : 'Publish Seed')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
