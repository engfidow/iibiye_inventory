// routes/categoryRouter.js
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/Category');

router.post('/categories', categoryController.upload, categoryController.createCategory);
router.put('/categories/:id', categoryController.upload, categoryController.updateCategory);
router.get('/categories', categoryController.getAllCategories);
router.get('/categories/:id', categoryController.getCategory);
router.delete('/categories/:id', categoryController.deleteCategory);

module.exports = router;
