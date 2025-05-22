const express = require("express");
const { protect } = require("../middlewares/auth.middleware");
const { createProduct, fetchAllProduct } = require("../controllers/product.controller");
const router = express.Router();

// Protected routes - require authentication
router.post("/create-product", protect, createProduct);
router.get("/all-products", protect, fetchAllProduct);
// router.get("/my-products", protect, fetchMyproducts);
// router.get("/get-applied-jobs", protect, fetchUserAppliedproducts);
// router.get("/:id", protect, fetchproductById);
// router.post("/:productId/apply", protect, applyToproductById);

module.exports = router;