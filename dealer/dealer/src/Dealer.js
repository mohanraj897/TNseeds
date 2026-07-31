/**
 * dealer.js
 * ---------------------------------------------------------
 * Everything for the dealer seed-stock + patta verification
 * flow in one file: models, file upload, and routes.
 *
 * Example flow:
 *   Dealer lists 4 ton corn seed in Coimbatore.
 *   Farmer requests 1 ton and uploads patta (land document).
 *   Dealer verifies the patta.
 *   Dealer approves -> 4 ton - 1 ton = 3 ton remaining.
 *
 * SETUP:
 *   1. npm install multer   (if not already installed)
 *   2. Place this file in your server folder, e.g. routes/dealer.js
 *   3. In server.js add:
 *        app.use('/api/dealer', require('./routes/dealer'));
 *        app.use('/uploads', express.static('uploads'));
 *   4. Make sure your existing auth middleware exports
 *      { protect, authorize } the same way as below.
 *      (Adjust the require path if yours is different.)
 * ---------------------------------------------------------
 */
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

/* ===========================================================
   MODELS
   =========================================================== */

// --- Seed stock owned by a dealer ---
const seedStockSchema = new mongoose.Schema(
  {
    dealer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    seedType: { type: String, required: true, trim: true },     // e.g. "Corn"
    location: { type: String, required: true, trim: true },     // e.g. "Coimbatore"
    unit: { type: String, enum: ['ton', 'kg', 'bag'], default: 'ton' },
    totalQuantity: { type: Number, required: true, min: 0 },     // e.g. 4
    availableQuantity: { type: Number, required: true, min: 0 }, // drops as requests are approved
  },
  { timestamps: true }
);

// --- A farmer's request for some of that stock, gated by patta verification ---
const seedRequestSchema = new mongoose.Schema(
  {
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    seedStock: { type: mongoose.Schema.Types.ObjectId, ref: 'SeedStock', required: true },
    requestedQuantity: { type: Number, required: true, min: 0.01 }, // e.g. 1

    pattaDocument: {
      fileUrl: { type: String, required: true },
      originalName: String,
      uploadedAt: { type: Date, default: Date.now },
    },

    verificationStatus: {
      type: String,
      enum: ['Pending', 'Verified', 'Rejected'],
      default: 'Pending',
    },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verificationNote: String,

    orderStatus: {
      type: String,
      enum: ['Requested', 'Approved', 'Rejected', 'Cancelled'],
      default: 'Requested',
    },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: Date,
  },
  { timestamps: true }
);

// Reuse existing models if this file gets required twice (common with nodemon)
const SeedStock = mongoose.models.SeedStock || mongoose.model('SeedStock', seedStockSchema);
const SeedRequest = mongoose.models.SeedRequest || mongoose.model('SeedRequest', seedRequestSchema);

/* ===========================================================
   FILE UPLOAD (patta / land document)
   =========================================================== */

const uploadDir = path.join(__dirname, '..', 'uploads', 'patta-documents');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png'];
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.includes(ext)) cb(null, true);
  else cb(new Error('Only PDF, JPG, or PNG files are allowed for the land document'));
};

const uploadPatta = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

/* ===========================================================
   ROUTES
   =========================================================== */

// 1) Dealer creates a seed stock listing
// POST /api/dealer/stock   { seedType, location, unit, totalQuantity }
router.post('/stock', protect, authorize('dealer', 'supplier'), async (req, res) => {
  try {
    const { seedType, location, unit, totalQuantity } = req.body;
    const stock = await SeedStock.create({
      dealer: req.user._id,
      seedType,
      location,
      unit: unit || 'ton',
      totalQuantity,
      availableQuantity: totalQuantity,
    });
    res.status(201).json(stock);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2) Browse seed stock (farmers searching by type/location)
// GET /api/dealer/stock?seedType=Corn&location=Coimbatore
router.get('/stock', async (req, res) => {
  try {
    const { seedType, location } = req.query;
    const query = {};
    if (seedType) query.seedType = { $regex: seedType, $options: 'i' };
    if (location) query.location = { $regex: location, $options: 'i' };

    const stocks = await SeedStock.find(query)
      .populate('dealer', 'name phone location')
      .sort({ createdAt: -1 });
    res.json(stocks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3) Farmer requests seed + uploads patta (land document)
// POST /api/dealer/requests   multipart/form-data: seedStockId, requestedQuantity, pattaDocument (file)
router.post(
  '/requests',
  protect,
  authorize('farmer'),
  uploadPatta.single('pattaDocument'),
  async (req, res) => {
    try {
      const { seedStockId, requestedQuantity } = req.body;

      if (!req.file) {
        return res.status(400).json({ message: 'Land document (patta) is required' });
      }

      const stock = await SeedStock.findById(seedStockId);
      if (!stock) return res.status(404).json({ message: 'Seed stock not found' });

      const qty = Number(requestedQuantity);
      if (!qty || qty <= 0) {
        return res.status(400).json({ message: 'Requested quantity must be greater than 0' });
      }
      if (qty > stock.availableQuantity) {
        return res.status(400).json({
          message: `Only ${stock.availableQuantity} ${stock.unit} available right now`,
        });
      }

      const request = await SeedRequest.create({
        farmer: req.user._id,
        seedStock: stock._id,
        requestedQuantity: qty,
        pattaDocument: {
          fileUrl: `/uploads/patta-documents/${req.file.filename}`,
          originalName: req.file.originalname,
        },
      });

      res.status(201).json(request);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// 4) Dealer views requests waiting on document verification
// GET /api/dealer/requests/pending
router.get('/requests/pending', protect, authorize('dealer', 'supplier', 'admin'), async (req, res) => {
  try {
    const requests = await SeedRequest.find({ verificationStatus: 'Pending' })
      .populate('farmer', 'name phone location')
      .populate('seedStock')
      .sort({ createdAt: 1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 5) Dealer verifies (or rejects) the patta document — stock is NOT touched here
// PUT /api/dealer/requests/:id/verify   { decision: "Verified" | "Rejected", note }
router.put('/requests/:id/verify', protect, authorize('dealer', 'supplier', 'admin'), async (req, res) => {
  try {
    const { decision, note } = req.body;
    if (!['Verified', 'Rejected'].includes(decision)) {
      return res.status(400).json({ message: 'Decision must be Verified or Rejected' });
    }

    const request = await SeedRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    request.verificationStatus = decision;
    request.verifiedBy = req.user._id;
    request.verificationNote = note || '';
    if (decision === 'Rejected') request.orderStatus = 'Rejected';

    await request.save();
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 6) Dealer approves the request — THIS is the only step that deducts stock
// PUT /api/dealer/requests/:id/approve
// Example: 4 ton available, approve 1 ton request -> 3 ton remaining
router.put('/requests/:id/approve', protect, authorize('dealer', 'supplier', 'admin'), async (req, res) => {
  try {
    const request = await SeedRequest.findById(req.params.id).populate('seedStock');
    if (!request) return res.status(404).json({ message: 'Request not found' });

    if (request.verificationStatus !== 'Verified') {
      return res.status(400).json({
        message: 'The land document must be verified before this request can be approved',
      });
    }
    if (request.orderStatus === 'Approved') {
      return res.status(400).json({ message: 'This request has already been approved' });
    }

    // Atomic, race-safe deduction — only succeeds if enough stock is still available
    const updatedStock = await SeedStock.findOneAndUpdate(
      { _id: request.seedStock._id, availableQuantity: { $gte: request.requestedQuantity } },
      { $inc: { availableQuantity: -request.requestedQuantity } },
      { new: true }
    );

    if (!updatedStock) {
      return res.status(400).json({ message: 'Not enough seed stock remaining to approve this request' });
    }

    request.orderStatus = 'Approved';
    request.approvedBy = req.user._id;
    request.approvedAt = new Date();
    await request.save();

    res.json({
      message: `Approved ${request.requestedQuantity} ${updatedStock.unit} of ${updatedStock.seedType}. ${updatedStock.availableQuantity} ${updatedStock.unit} remaining.`,
      request,
      remainingStock: updatedStock.availableQuantity,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 7) A farmer's own requests, to track status
// GET /api/dealer/requests/my
router.get('/requests/my', protect, authorize('farmer'), async (req, res) => {
  try {
    const requests = await SeedRequest.find({ farmer: req.user._id })
      .populate('seedStock')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;