const { postCreateProduct } = require("../services/product.service");

const createProduct = async(req, res) => {
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

module.exports = {
    createProduct,
};