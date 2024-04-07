const Category = require('../models/Categories');

// Create a new category
exports.createCategory = async (req, res) => {
    try {
        const category = new Category(req.body);
        await category.save();
        res.status(201).send(category);
    } catch (error) {
        res.status(400).send(error);
    }
};

// Get all categories
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find({});
        res.send(categories);
    } catch (error) {
        res.status(500).send(error);
    }
};

// Update a category by ID
exports.updateCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!category) {
            return res.status(404).send();
        }
        res.send(category);
    } catch (error) {
        res.status(400).send(error);
    }
};

// Delete a category by ID
exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).send();
        }
        res.send(category);
    } catch (error) {
        res.status(500).send(error);
    }
};
