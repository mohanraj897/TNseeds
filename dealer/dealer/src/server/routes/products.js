const express = require("express");
const Product = require("../models/Product");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { type, category, location, search } = req.query;

    const query = { isAvailable: true };

    if (type) query.type = type;
    if (category) query.category = category;

    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const products = await Product.find(query)
      .populate("seller", "name location phone")
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/my/listings", protect, async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id })
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("seller", "name location phone");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(400).json({ message: "Invalid product ID" });
  }
});

router.post("/", protect, async (req, res) => {
  try {
    const { type } = req.body;

    if (type === "produce" && req.user.role !== "farmer") {
      return res.status(403).json({
        message: "Only farmers can list produce",
      });
    }

    if (type === "seed" && req.user.role !== "supplier") {
      return res.status(403).json({
        message: "Only suppliers can list seeds",
      });
    }

    const product = await Product.create({
      ...req.body,
      seller: req.user._id,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id", protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "This is not your product" });
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "This is not your product" });
    }

    await product.deleteOne();

    res.json({ message: "Product removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;