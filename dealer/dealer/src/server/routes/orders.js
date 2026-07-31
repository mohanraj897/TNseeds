const express = require("express");
const Order = require("../models/Order");
const Product = require("../models/Product");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/", protect, async (req, res) => {
  try {
    const { productId, quantity, shippingAddress } = req.body;

    const product = await Product.findById(productId);

    if (!product || !product.isAvailable) {
      return res.status(404).json({ message: "Product is not available" });
    }

    if (product.type === "produce" && req.user.role !== "buyer") {
      return res.status(403).json({
        message: "Only buyers can order produce",
      });
    }

    if (product.type === "seed" && req.user.role !== "farmer") {
      return res.status(403).json({
        message: "Only farmers can order seeds",
      });
    }

    if (Number(quantity) > product.quantity) {
      return res.status(400).json({ message: "Not enough stock available" });
    }

    const order = await Order.create({
      buyer: req.user._id,
      product: product._id,
      quantity: Number(quantity),
      totalPrice: product.price * Number(quantity),
      shippingAddress,
      orderType: product.type,
    });

    product.quantity -= Number(quantity);

    if (product.quantity === 0) {
      product.isAvailable = false;
    }

    await product.save();

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/my", protect, async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user._id })
      .populate("product")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/sold", protect, async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id }).select("_id");

    const orders = await Order.find({
      product: { $in: products.map((product) => product._id) },
    })
      .populate("product")
      .populate("buyer", "name email phone location")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id/status", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("product");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "This is not your order" });
    }

    order.status = req.body.status;
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;