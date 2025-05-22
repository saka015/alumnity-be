const productModel = require("../models/product.model");
const { NotFoundError } = require("../utils/AppErrror");

const postCreateProduct = async(userId, userName, productData) => {
    if (!userId || !productData) {
        throw new NotFoundError("User ID and product data are required.");
    }

    const newProduct = new productModel({
        ...productData,
        createdBy: userId,
        createdUsername: userName,
    });

    await newProduct.save();
    return newProduct;
};

module.exports = { postCreateProduct };