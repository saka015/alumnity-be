const { NotFoundError } = require("../utils/AppErrror");
const Product = require("../models/product.model");

const postCreateProduct = async (userId, userName, productData) => {
  if (!userId || !productData) {
    throw new NotFoundError("User ID and product data are required.");
  }

  const newProduct = new Product({
    ...productData,
    createdBy: userId,
    createdUsername: userName,
  });

  await newProduct.save();
  return newProduct;
};

const getAllProduct = async (userId, searchTerm = "", page = 1, limit = 10) => {
  if (!userId) {
    throw new NotFoundError("User ID is required.");
  }

  const query = {};

  if (searchTerm) {
    query.title = { $regex: searchTerm, $options: "i" };
  }

  const totalProducts = await Product.countDocuments(query);
  const totalPages = Math.ceil(totalProducts / limit);
  const skip = (page - 1) * limit;

  const products = await Product.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return {
    products,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: totalProducts,
      itemsPerPage: limit,
    },
  };
};

module.exports = { postCreateProduct, getAllProduct };
