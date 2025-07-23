const express = require("express");
const { protect } = require("../middlewares/auth.middleware");
const {
  createProduct,
  fetchAllProduct,
  fetchProductById,
  sendPaymentOtpController,
  verifyPaymentOtpController,
} = require("../controllers/product.controller");
const router = express.Router();

// Protected routes - require authentication
router.post("/create-product", protect, createProduct);
router.get("/all-products", protect, fetchAllProduct);
router.get("/:id", protect, fetchProductById);
router.post("/send-payment-otp", protect, sendPaymentOtpController);
router.post("/verify-payment-otp", protect, verifyPaymentOtpController);
// router.get("/my-products", protect, fetchMyproducts);
// router.get("/get-applied-jobs", protect, fetchUserAppliedproducts);
// router.post("/:productId/apply", protect, applyToproductById);

module.exports = router;
