const express = require('express');
const Seed = require('../models/Seed');
const { protect, dealerOnly } = require('../middleware/auth');

const router = express.Router();

// GET /api/seeds - Get all seeds with filters, search, pagination
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      cropType,
      season,
      available,
      lat,
      lng,
      radius = 50, // km
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const query = {};

    // Text search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { cropType: { $regex: search, $options: 'i' } },
        { variety: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by crop type
    if (cropType) {
      query.cropType = cropType;
    }

    // Filter by season
    if (season) {
      query.season = season;
    }

    // Filter by availability
    if (available !== undefined) {
      query.isAvailable = available === 'true';
    }

    // Geospatial query - find seeds near a location
    if (lat && lng) {
      query['location'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(radius) * 1000 // Convert km to meters
        }
      };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortObj = {};
    sortObj[sortBy] = order === 'desc' ? -1 : 1;

    const [seeds, total] = await Promise.all([
      Seed.find(query)
        .populate('dealer', 'name phone storeName location email')
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Seed.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: seeds,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/seeds/crop-types - Get all crop types
router.get('/crop-types', async (req, res) => {
  const cropTypes = [
    'Rice', 'Wheat', 'Corn', 'Soybean', 'Cotton',
    'Sugarcane', 'Mustard', 'Sunflower', 'Groundnut', 'Millet',
    'Barley', 'Pulses', 'Vegetables', 'Fruits', 'Spices',
    'Oilseeds', 'Flowers', 'Fodder', 'Other'
  ];
  res.json({ success: true, data: cropTypes });
});

// GET /api/seeds/:id - Get single seed
router.get('/:id', async (req, res) => {
  try {
    const seed = await Seed.findById(req.params.id)
      .populate('dealer', 'name phone storeName location email');

    if (!seed) {
      return res.status(404).json({ success: false, message: 'Seed not found' });
    }

    res.json({ success: true, data: seed });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/seeds - Create seed (dealer only)
router.post('/', protect, dealerOnly, async (req, res) => {
  try {
    const seedData = {
      ...req.body,
      dealer: req.user._id,
      location: req.body.location || req.user.location
    };

    const seed = await Seed.create(seedData);
    const populated = await Seed.findById(seed._id)
      .populate('dealer', 'name phone storeName location email');

    // Emit real-time event
    const io = req.app.get('io');
    if (io) {
      io.emit('seed:created', populated);
    }

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/seeds/:id - Update seed (dealer only, own seeds)
router.put('/:id', protect, dealerOnly, async (req, res) => {
  try {
    let seed = await Seed.findById(req.params.id);

    if (!seed) {
      return res.status(404).json({ success: false, message: 'Seed not found' });
    }

    if (seed.dealer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this seed' });
    }

    seed = await Seed.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('dealer', 'name phone storeName location email');

    // Emit real-time event
    const io = req.app.get('io');
    if (io) {
      io.emit('seed:updated', seed);
    }

    res.json({ success: true, data: seed });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/seeds/:id/availability - Toggle availability
router.patch('/:id/availability', protect, dealerOnly, async (req, res) => {
  try {
    let seed = await Seed.findById(req.params.id);

    if (!seed) {
      return res.status(404).json({ success: false, message: 'Seed not found' });
    }

    if (seed.dealer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    seed.isAvailable = !seed.isAvailable;
    await seed.save();

    seed = await Seed.findById(seed._id)
      .populate('dealer', 'name phone storeName location email');

    const io = req.app.get('io');
    if (io) {
      io.emit('seed:updated', seed);
    }

    res.json({ success: true, data: seed });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/seeds/:id/quantity - Update quantity
router.patch('/:id/quantity', protect, dealerOnly, async (req, res) => {
  try {
    const { quantity } = req.body;
    let seed = await Seed.findById(req.params.id);

    if (!seed) {
      return res.status(404).json({ success: false, message: 'Seed not found' });
    }

    if (seed.dealer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    seed.quantity = quantity;
    if (quantity <= 0) seed.isAvailable = false;
    await seed.save();

    seed = await Seed.findById(seed._id)
      .populate('dealer', 'name phone storeName location email');

    const io = req.app.get('io');
    if (io) {
      io.emit('seed:updated', seed);
    }

    res.json({ success: true, data: seed });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/seeds/:id - Delete seed (dealer only, own seeds)
router.delete('/:id', protect, dealerOnly, async (req, res) => {
  try {
    const seed = await Seed.findById(req.params.id);

    if (!seed) {
      return res.status(404).json({ success: false, message: 'Seed not found' });
    }

    if (seed.dealer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await seed.deleteOne();

    const io = req.app.get('io');
    if (io) {
      io.emit('seed:deleted', req.params.id);
    }

    res.json({ success: true, message: 'Seed deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/seeds/dealer/my-seeds - Get dealer's own seeds
router.get('/dealer/my-seeds', protect, dealerOnly, async (req, res) => {
  try {
    const seeds = await Seed.find({ dealer: req.user._id })
      .populate('dealer', 'name phone storeName location email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: seeds });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
