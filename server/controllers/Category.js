// controllers/categoryController.js
const Category = require('../models/Categories');
const multer = require('multer');
const path = require('path');

// Configure multer for file storage
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/categories/');  // Ensure this directory exists or is automatically created
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });
exports.upload = upload.single('icon');  // Configure multer to handle single icon file under the 'icon' field name

exports.createCategory = async (req, res) => {
    try {
        const categoryData = {
            ...req.body,
            icon: req.file ? req.file.path : undefined  // Save the path of the uploaded icon
        };
        const category = new Category(categoryData);
        await category.save();
        res.status(201).send(category);
    } catch (error) {
        res.status(400).send(error);
    }
};

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find({});
        res.status(200).send(categories);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.getCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).send();
        }
        res.status(200).send(category);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const categoryUpdateData = {
            ...req.body,
        };
        if (req.file) {
            categoryUpdateData.icon = req.file.path;  // Update the icon path if a new icon was uploaded
        }
        const category = await Category.findByIdAndUpdate(req.params.id, categoryUpdateData, { new: true, runValidators: true });
        if (!category) {
            return res.status(404).send();
        }
        res.status(200).send(category);
    } catch (error) {
        res.status(400).send(error);
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).send();
        }
        res.status(200).send({ message: "Category deleted successfully!" });
    } catch (error) {
        res.status(500).send(error);
    }
};
