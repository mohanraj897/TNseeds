const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dealer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seed: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seed',
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Processing', 'Quality Check', 'Packaging', 'Dispatched', 'Delivered'],
    default: 'Processing'
  },
  trackingHistory: [
    {
      status: String,
      timestamp: { type: Date, default: Date.now },
      note: String
    }
  ],
  deliveryAddress: String
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
