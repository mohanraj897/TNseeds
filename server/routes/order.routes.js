const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

// @desc    Get user orders
// @route   GET /api/orders
router.get('/', protect, async (req, res) => {
  try {
    const filter = req.user.role === 'dealer' ? { dealer: req.user.id } : { farmer: req.user.id };
    const orders = await Order.find(filter)
      .populate('seed', 'name cropType variety')
      .populate('dealer', 'storeName name')
      .populate('farmer', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    
    // Only dealer can update status
    if (order.dealer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    order.status = status;
    order.trackingHistory.push({ status, note });
    await order.save();

    // Emit socket event for real-time update
    const io = req.app.get('io');
    io.emit('order:updated', order);

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
