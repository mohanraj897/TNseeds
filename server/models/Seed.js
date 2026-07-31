const mongoose = require('mongoose');

const seedSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Seed name is required'],
    trim: true,
    maxlength: 200
  },
  cropType: {
    type: String,
    required: [true, 'Crop type is required'],
    trim: true,
    enum: [
      'Rice', 'Wheat', 'Corn', 'Soybean', 'Cotton',
      'Sugarcane', 'Mustard', 'Sunflower', 'Groundnut', 'Millet',
      'Barley', 'Pulses', 'Vegetables', 'Fruits', 'Spices',
      'Oilseeds', 'Flowers', 'Fodder', 'Other'
    ]
  },
  variety: {
    type: String,
    trim: true,
    default: ''
  },
  brand: {
    type: String,
    trim: true,
    default: ''
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: 0
  },
  unit: {
    type: String,
    enum: ['kg', 'g', 'packets', 'bags', 'quintals'],
    default: 'kg'
  },
  price: {
    type: Number,
    min: 0,
    default: 0
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500,
    default: ''
  },
  season: {
    type: String,
    enum: ['Kharif', 'Rabi', 'Zaid', 'All Season'],
    default: 'All Season'
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  dealer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    },
    city: {
      type: String,
      default: ''
    },
    state: {
      type: String,
      default: ''
    }
  },
  images: [{
    type: String
  }]
}, {
  timestamps: true
});

// Geospatial index for location-based queries
seedSchema.index({ 'location': '2dsphere' });

// Text index for search
seedSchema.index({ name: 'text', cropType: 'text', variety: 'text', brand: 'text' });

module.exports = mongoose.model('Seed', seedSchema);
