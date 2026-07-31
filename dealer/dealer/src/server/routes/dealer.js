const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

const seedStockSchema = new mongoose.Schema(
  {
    dealer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    seedType: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    unit: {
      type: String,
      enum: ["ton", "kg", "bag"],
      default: "ton",
    },
    totalQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
    availableQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

const seedRequestSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    seedStock: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SeedStock",
      required: true,
    },
    requestedQuantity: {
      type: Number,
      required: true,
      min: 0.01,
    },
    pattaDocument: {
      fileUrl: {
        type: String,
        required: true,
      },
      originalName: String,
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    },
    verificationStatus: {
      type: String,
      enum: ["Pending", "Verified", "Rejected"],
      default: "Pending",
    },
    verificationNote: String,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    orderStatus: {
      type: String,
      enum: ["Requested", "Approved", "Rejected", "Cancelled"],
      default: "Requested",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvedAt: Date,
  },
  { timestamps: true }
);

const SeedStock =
  mongoose.models.SeedStock ||
  mongoose.model("SeedStock", seedStockSchema);

const SeedRequest =
  mongoose.models.SeedRequest ||
  mongoose.model("SeedRequest", seedRequestSchema);

const uploadDirectory = path.join(
  __dirname,
  "..",
  "uploads",
  "patta-documents"
);

fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, callback) => callback(null, uploadDirectory),

  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();

    callback(
      null,
      `${Date.now()}-${Math.round(Math.random() * 1000000000)}${extension}`
    );
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, callback) => {
    const validExtensions = [".pdf", ".jpg", ".jpeg", ".png"];
    const extension = path.extname(file.originalname).toLowerCase();

    if (!validExtensions.includes(extension)) {
      return callback(
        new Error("Only PDF, JPG, JPEG, and PNG documents are allowed")
      );
    }

    callback(null, true);
  },
});

const canManageStock = authorize("dealer", "supplier", "admin");

async function ensureOwnRequest(request, user) {
  if (user.role === "admin") return true;

  const stock = await SeedStock.findById(request.seedStock);

  return stock && stock.dealer.toString() === user._id.toString();
}

// Create dealer seed stock.
router.post("/stock", protect, canManageStock, async (req, res) => {
  try {
    const { seedType, location, unit, totalQuantity } = req.body;

    const stock = await SeedStock.create({
      dealer: req.user._id,
      seedType,
      location,
      unit: unit || "ton",
      totalQuantity: Number(totalQuantity),
      availableQuantity: Number(totalQuantity),
    });

    res.status(201).json(stock);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Browse dealer seed stock.
router.get("/stock", async (req, res) => {
  try {
    const { seedType, location } = req.query;
    const query = { availableQuantity: { $gt: 0 } };

    if (seedType) {
      query.seedType = { $regex: seedType, $options: "i" };
    }

    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    const stocks = await SeedStock.find(query)
      .populate("dealer", "name phone location")
      .sort({ createdAt: -1 });

    res.json(stocks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Farmer creates a request and uploads a patta document.
router.post(
  "/requests",
  protect,
  authorize("farmer"),
  upload.single("pattaDocument"),
  async (req, res) => {
    try {
      const { seedStockId, requestedQuantity } = req.body;

      if (!req.file) {
        return res.status(400).json({
          message: "Patta document is required",
        });
      }

      const stock = await SeedStock.findById(seedStockId);

      if (!stock) {
        return res.status(404).json({ message: "Seed stock not found" });
      }

      const quantity = Number(requestedQuantity);

      if (!quantity || quantity <= 0) {
        return res.status(400).json({
          message: "Requested quantity must be greater than zero",
        });
      }

      if (quantity > stock.availableQuantity) {
        return res.status(400).json({
          message: `Only ${stock.availableQuantity} ${stock.unit} available`,
        });
      }

      const request = await SeedRequest.create({
        farmer: req.user._id,
        seedStock: stock._id,
        requestedQuantity: quantity,
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

// Dealer sees only requests for their own seed stock.
router.get("/requests/pending", protect, canManageStock, async (req, res) => {
  try {
    const stockQuery = req.user.role === "admin"
      ? {}
      : { dealer: req.user._id };

    const stocks = await SeedStock.find(stockQuery).select("_id");

    const requests = await SeedRequest.find({
      seedStock: { $in: stocks.map((stock) => stock._id) },
      verificationStatus: "Pending",
    })
      .populate("farmer", "name phone location")
      .populate("seedStock")
      .sort({ createdAt: 1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Dealer verifies or rejects the patta.
router.put(
  "/requests/:id/verify",
  protect,
  canManageStock,
  async (req, res) => {
    try {
      const { decision, note } = req.body;

      if (!["Verified", "Rejected"].includes(decision)) {
        return res.status(400).json({
          message: "Decision must be Verified or Rejected",
        });
      }

      const request = await SeedRequest.findById(req.params.id);

      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }

      if (!(await ensureOwnRequest(request, req.user))) {
        return res.status(403).json({
          message: "This request does not belong to your stock",
        });
      }

      request.verificationStatus = decision;
      request.verificationNote = note || "";
      request.verifiedBy = req.user._id;

      if (decision === "Rejected") {
        request.orderStatus = "Rejected";
      }

      await request.save();

      res.json(request);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Approving deducts stock only after verification.
router.put(
  "/requests/:id/approve",
  protect,
  canManageStock,
  async (req, res) => {
    try {
      const request = await SeedRequest.findById(req.params.id)
        .populate("seedStock");

      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }

      if (!(await ensureOwnRequest(request, req.user))) {
        return res.status(403).json({
          message: "This request does not belong to your stock",
        });
      }

      if (request.verificationStatus !== "Verified") {
        return res.status(400).json({
          message: "Verify the patta document before approval",
        });
      }

      if (request.orderStatus === "Approved") {
        return res.status(400).json({
          message: "This request is already approved",
        });
      }

      const stock = await SeedStock.findOneAndUpdate(
        {
          _id: request.seedStock._id,
          availableQuantity: { $gte: request.requestedQuantity },
        },
        {
          $inc: { availableQuantity: -request.requestedQuantity },
        },
        { new: true }
      );

      if (!stock) {
        return res.status(400).json({
          message: "Not enough seed stock remaining",
        });
      }

      request.orderStatus = "Approved";
      request.approvedBy = req.user._id;
      request.approvedAt = new Date();

      await request.save();

      res.json({
        message: `Approved ${request.requestedQuantity} ${stock.unit}. ${stock.availableQuantity} ${stock.unit} remaining.`,
        request,
        remainingStock: stock.availableQuantity,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Farmer checks their own requests.
router.get("/requests/my", protect, authorize("farmer"), async (req, res) => {
  try {
    const requests = await SeedRequest.find({
      farmer: req.user._id,
    })
      .populate("seedStock")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;