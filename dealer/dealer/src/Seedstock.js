const mongoose = require('mongoose');

const seedStockSchema = new mongoose.Schema(
  {
    dealer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    seedType: {
      type: String, // e.g. "Corn"
      required: true,
      trim: true,
    },
    location: {
      type: String, // e.g. "Coimbatore"
      required: true,
      trim: true,
    },
    unit: {
      type: String,
      enum: ['ton', 'kg', 'bag'],
      default: 'ton',
    },
    totalQuantity: {
      type: Number, // total stock ever added, e.g. 4
      required: true,
      min: 0,
    },
    availableQuantity: {
      type: Number, // what's left to allocate, e.g. starts at 4, drops as requests are approved
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

// availableQuantity should never exceed totalQuantity
seedStockSchema.pre('save', function (next) {
  if (this.availableQuantity > this.totalQuantity) {
    return next(new Error('Available quantity cannot exceed total quantity'));
  }
  next();
});

module.exports = mongoose.model('SeedStock', seedStockSchema);