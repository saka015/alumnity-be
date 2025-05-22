const {
    postCreateProduct,
    getAllProduct,
} = require("../services/product.service");

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

const fetchAllProduct = async(req, res) => {
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




module.exports = {
    createProduct,
    fetchAllProduct,
};