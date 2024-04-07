const express = require('express');
const categoriesController = require('../controllers/Categories_Controller');
const router = express.Router();

// Routes for Categories
router.post('/categories', categoriesController.createCategory);
router.get('/categories', categoriesController.getAllCategories);
router.patch('/categories/:id', categoriesController.updateCategory);
router.delete('/categories/:id', categoriesController.deleteCategory);

module.exports = router;
