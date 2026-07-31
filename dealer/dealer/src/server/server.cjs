const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Makes uploaded patta files available at:
// http://localhost:5000/uploads/patta-documents/file-name.pdf
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/dealer", require("./routes/dealer"));

app.get("/", (req, res) => {
  res.json({
    message: "AgriMart API is running",
    endpoints: {
      auth: "/api/auth",
      products: "/api/products",
      orders: "/api/orders",
      dealer: "/api/dealer",
    },
  });
});

app.use((req, res) => {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

app.use((error, req, res, next) => {
  console.error(error);

  res.status(error.status || 500).json({
    message: error.message || "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`AgriMart API running at http://localhost:${PORT}`);
});