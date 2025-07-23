const {
  postCreateProduct,
  getAllProduct,
  getProductById,
  sendPaymentOtp,
  verifyPaymentOtp,
} = require("../services/product.service");

const createProduct = async (req, res) => {
  try {
    const userId = req.user.id;
    const userName = req.user.username;

    const productData = req.body;
    const newProduct = await postCreateProduct(userId, userName, productData);
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const fetchAllProduct = async (req, res) => {
  try {
    const userId = req.user.id;
    const { search = "", page = 1, limit = 10 } = req.query;
    const allProducts = await getAllProduct(
      userId,
      search,
      parseInt(page),
      parseInt(limit)
    );
    res.status(200).json(allProducts);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(400).json({ message: error.message });
  }
};

const fetchProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await getProductById(id);

    if (!product) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const sendPaymentOtpController = async (req, res) => {
  try {
    console.log("req.user", req.user);
    const email = req.user.email;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    const result = await sendPaymentOtp(email);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const verifyPaymentOtpController = async (req, res) => {
  try {
    const { otp, productId, bookedDate, bookedTime } = req.body;
    const email = req.user.email;
    const userId = req.user._id;

    if (!otp || !productId || !bookedDate || bookedTime === undefined) {
      return res.status(400).json({
        message: "OTP, productId, bookedDate and bookedTime are required",
      });
    }
    const result = await verifyPaymentOtp(
      email,
      otp,
      productId,
      bookedDate,
      bookedTime,
      userId
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createProduct,
  fetchAllProduct,
  fetchProductById,
  sendPaymentOtpController,
  verifyPaymentOtpController,
};
