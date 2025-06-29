import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import setupRoutes from "./routes/index.route.js";

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware setup
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Log environment variables for debugging (remove in production)
console.log("VNPay Config:", {
  vnp_TmnCode: process.env.VNPAY_TMN_CODE ? "✓ Set" : "✗ Missing",
  vnp_HashSecret: process.env.VNPAY_HASH_SECRET ? "✓ Set" : "✗ Missing",
  vnp_Url: process.env.VNPAY_URL ? "✓ Set" : "✗ Missing",
  vnp_Api: process.env.VNPAY_API_URL ? "✓ Set" : "✗ Missing",
  vnp_ReturnUrl: process.env.VNPAY_RETURN_URL ? "✓ Set" : "✗ Missing",
});

// Setup routes
setupRoutes(app);

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    message: "SGR Payment Server is running!",
    timestamp: new Date().toISOString(),
    endpoints: {
      "POST /api/v1/create_payment_url": "Create VNPay payment URL (legacy)",
      "POST /api/v1/create-qr": "Create VNPay QR payment URL",
      "GET /api/v1/vnpay-return": "Handle VNPay return callback",
      "GET /api/v1/vnpay-ipn": "Handle VNPay IPN notification",
    },
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 SGR Payment Server is running on http://localhost:${PORT}`);
  console.log(`📋 API Documentation: http://localhost:${PORT}`);
  console.log(`💳 Payment endpoints ready!`);
});
