// controllers/productController.js

const Transaction = require("../models/Transactions");
const Product = require("../models/Products");
const Category = require("../models/Categories");
const multer = require("multer");
const path = require("path");

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/products/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Append the original file extension
  },
});

const upload = multer({ storage: storage });

// Create a new product
const createProduct = async (req, res) => {
  try {
    const { uid, name, price, sellingPrice, category, status } = req.body;
    const image = req.file.path; // File path from multer

    const newProduct = new Product({
      uid,
      name,
      price,
      sellingPrice,
      category,
      status,
      image,
    });
    await newProduct.save();

    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Handle bulk import of products
const bulkImportProducts = async (req, res) => {
  try {
    const products = req.body; // Expecting an array of products

    // Validate the format and required fields
    const existingUids = [];

    for (const product of products) {
      // Check for missing fields
      if (
        !product.uid ||
        !product.name ||
        !product.price ||
        !product.sellingPrice ||
        !product.category
      ) {
        return res
          .status(400)
          .json({
            error:
              "Invalid product format. All fields are required (uid, name, price, sellingPrice, category name).",
          });
      }

      // Validate UID (only numbers)
      if (!/^\d+$/.test(product.uid)) {
        return res
          .status(400)
          .json({ error: "UID must contain only numbers." });
      }

      // Validate Product Name (letters, numbers, and spaces)
      if (!/^[a-zA-Z0-9 ]+$/.test(product.name)) {
        return res
          .status(400)
          .json({
            error:
              "Product name can contain only letters, numbers, and spaces.",
          });
      }

      // Validate Price and Selling Price (only numbers and doubles)
      if (!/^\d+(\.\d+)?$/.test(product.price)) {
        return res.status(400).json({ error: "Price must be a valid number." });
      }

      if (!/^\d+(\.\d+)?$/.test(product.sellingPrice)) {
        return res
          .status(400)
          .json({ error: "Selling Price must be a valid number." });
      }

      if (parseFloat(product.sellingPrice) < parseFloat(product.price)) {
        return res
          .status(400)
          .json({
            error:
              "Valid selling price is required and must be greater than or equal to price.",
          });
      }

      // Validate Category Name (only letters)
      if (!/^[a-zA-Z]+$/.test(product.category)) {
        return res
          .status(400)
          .json({ error: "Category name can contain only letters." });
      }

      // Check for existing UID
      const existingProduct = await Product.findOne({ uid: product.uid });
      if (existingProduct) {
        existingUids.push(product.uid);
      }

      // Convert category name to ObjectId
      const category = await Category.findOne({ name: product.category });
      if (!category) {
        return res
          .status(400)
          .json({ error: `Category ${product.category} not found.` });
      }
      product.category = category._id;
    }

    // After looping through all products, check if any UIDs already exist
    if (existingUids.length > 0) {
      return res.status(400).json({
        error: `Products with the following UIDs already exist: ${existingUids.join(
          ", "
        )}. Please use unique UIDs.`,
      });
    }

    await Product.insertMany(products);

    res.status(201).json({ message: "Products imported successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
// Get all products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("category");
    res.status(200).json(products);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get a product by ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category");
    if (!product) return res.status(404).json({ error: "Product not found" });

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

    if (!updatedProduct)
      return res.status(404).json({ error: "Product not found" });

    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a product
const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct)
      return res.status(404).json({ error: "Product not found" });

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getUidsProduct = async (req, res) => {
  try {
    // Get UIDs from query parameters
    const { uids } = req.query;

    // Ensure uids is an array
    const uidArray = Array.isArray(uids) ? uids : uids.split(",");

    // Fetch products by UIDs
    const products = await Product.find({ uid: { $in: uidArray } });

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

// Get all products
const getProductsWithstatus = async (req, res) => {
  try {
    const products = await Product.find({ status: "active" }).populate(
      "category"
    );
    res.status(200).json(products);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get total number of active products
const getTotalActiveProducts = async (req, res) => {
  try {
    const totalActiveProducts = await Product.countDocuments({
      status: "active",
    });
    res.status(200).json({ total: totalActiveProducts });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get last 4 products
const getLastProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 }).limit(4);
    res.status(200).json(products);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get profit for the current month
const getMonthlyProfit = async (req, res) => {
  try {
    const startOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    );
    const endOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      0
    );

    const transactions = await Transaction.find({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
    });

    let profit = 0;

    transactions.forEach((transaction) => {
      transaction.productsList.forEach((product) => {
        profit += product.productUid.sellingPrice - product.productUid.price;
      });
    });

    res.status(200).json({ profit });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  upload,
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getUidsProduct,
  getProductsWithstatus,
  getTotalActiveProducts,
  getLastProducts,
  getMonthlyProfit,
  bulkImportProducts,
};
