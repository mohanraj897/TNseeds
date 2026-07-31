const mongoose = require('mongoose');

const seedRequestSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    seedStock: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SeedStock',
      required: true,
    },
    requestedQuantity: {
      type: Number, // e.g. 1 (ton)
      required: true,
      min: 0.01,
    },

    // Land document (patta certificate) proof
    pattaDocument: {
      fileUrl: { type: String, required: true }, // where the uploaded file is stored
      originalName: String,
      uploadedAt: { type: Date, default: Date.now },
    },

    // Verification of the land document, done by dealer/admin
    verificationStatus: {
      type: String,
      enum: ['Pending', 'Verified', 'Rejected'],
      default: 'Pending',
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    verificationNote: String, // reason, especially useful if rejected

    // Overall order status - only moves to Approved once verified AND stock deducted
    orderStatus: {
      type: String,
      enum: ['Requested', 'Approved', 'Rejected', 'Cancelled'],
      default: 'Requested',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('SeedRequest', seedRequestSchema);