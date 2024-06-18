// controllers/productController.js

const Product = require('../models/Products');
const multer = require('multer');
const path = require('path');

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/products/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Append the original file extension
  }
});

const upload = multer({ storage: storage });

// Create a new product
const createProduct = async (req, res) => {
  try {
    const { uid, name, price, sellingPrice, category, status } = req.body;
    const image = req.file.path; // File path from multer

    const newProduct = new Product({ uid, name, price, sellingPrice, category, status, image });
    await newProduct.save();

    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('category');
    res.status(200).json(products);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get a product by ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category');
    if (!product) return res.status(404).json({ error: 'Product not found' });

    res.status(200).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update a product
const updateProduct = async (req, res) => {
  try {
    const { uid, name, price, sellingPrice, category, status } = req.body;
    const image = req.file ? req.file.path : req.body.image; // Update image if new file uploaded

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { uid, name, price, sellingPrice, category, status, image },
      { new: true }
    );

    if (!updatedProduct) return res.status(404).json({ error: 'Product not found' });

    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a product
const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) return res.status(404).json({ error: 'Product not found' });

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getUidsProduct = async (req, res) => {
  try {
    // Get UIDs from query parameters
    const { uids } = req.query;

    // Convert comma-separated UIDs string to array
   

    // Fetch products by UIDs
    const products = await Product.find({ uid: { $in: uids } });

    // If products found, return them
    if (products.length > 0) {
      res.status(200).json(products);
    } else {
      res.status(404).json({ error: "Products not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports = {
  upload,
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getUidsProduct
};
