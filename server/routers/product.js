// routes/productRoutes.js

const express = require('express');
const router = express.Router();
const productController = require('../controllers/product');

// Upload middleware for product image
const upload = productController.upload;

router.post('/products', upload.single('image'), productController.createProduct);
router.get('/products', productController.getProducts);
router.get('/products/:id', productController.getProductById);
router.put('/products/:id', upload.single('image'), productController.updateProduct);
router.delete('/products/:id', productController.deleteProduct);

//get products of UIds 
router.get('/products/info/uids', productController.getUidsProduct);

// Ensure this route is correctly set
router.get('/products/data/getwithstatus', productController.getProductsWithstatus);

module.exports = router;
