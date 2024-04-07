const express = require('express');
const productsController = require('../controllers/Products_Controller');
const router = express.Router();

// Routes for Products
router.post('/products', productsController.createProduct);
router.get('/products', productsController.getAllProducts);
router.patch('/products/:id', productsController.updateProduct);
router.delete('/products/:id', productsController.deleteProduct);

module.exports = router;
