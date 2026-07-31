"use client"

import { Search, Filter, ChevronDown, X, Locate } from 'lucide-react'
import './FilterBar.css'

const CROP_TYPES = [
  'All','Rice','Wheat','Corn','Soybean','Cotton','Sugarcane','Mustard',
  'Sunflower','Groundnut','Millet','Barley','Pulses','Vegetables',
  'Fruits','Spices','Oilseeds','Flowers','Fodder','Other'
]
const SEASONS = ['All','Kharif','Rabi','Zaid','All Season']

export default function FilterBar({ filters, onChange, onLocate, locating }) {
  const set = (k, v) => onChange({ ...filters, [k]: v })

  return (
    <div className="filter-bar">
      {/* Search */}
      <div className="search-wrap">
        <Search size={17} className="search-icon" />
        <input
          className="search-input"
          placeholder="Search seeds, crops, brands…"
          value={filters.search}
          onChange={e => set('search', e.target.value)}
        />
        {filters.search && (
          <button className="clear-btn" onClick={() => set('search', '')}>
            <X size={15}/>
          </button>
        )}
      </div>

      {/* Crop Type */}
      <div className="filter-select-wrap">
        <Filter size={15} className="filter-icon" />
        <select className="filter-select"
          value={filters.cropType} onChange={e => set('cropType', e.target.value)}>
          {CROP_TYPES.map(c => <option key={c} value={c === 'All' ? '' : c}>{c}</option>)}
        </select>
        <ChevronDown size={14} className="chevron-icon"/>
      </div>

      {/* Season */}
      <div className="filter-select-wrap">
        <select className="filter-select"
          value={filters.season} onChange={e => set('season', e.target.value)}>
          {SEASONS.map(s => <option key={s} value={s === 'All' ? '' : s}>{s}</option>)}
        </select>
        <ChevronDown size={14} className="chevron-icon"/>
      </div>

      {/* Availability */}
      <div className="filter-select-wrap">
        <select className="filter-select"
          value={filters.available} onChange={e => set('available', e.target.value)}>
          <option value="">All Stock</option>
          <option value="true">In Stock</option>
          <option value="false">Out of Stock</option>
        </select>
        <ChevronDown size={14} className="chevron-icon"/>
      </div>

      {/* Locate Me */}
      <button
        className={`btn btn-secondary btn-sm locate-btn ${locating ? 'locating' : ''}`}
        onClick={onLocate}
        disabled={locating}
        title="Find seeds near me"
      >
        <Locate size={16} className={locating ? 'spin-icon' : ''} />
        {locating ? 'Locating…' : 'Near Me'}
      </button>
    </div>
  )
}
