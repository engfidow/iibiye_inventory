// controllers/categoryController.js
const Category = require("../models/Categories");
const multer = require("multer");
const path = require("path");

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/categories/"); // Ensure this directory exists or is automatically created
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });
exports.upload = upload.single("icon"); // Configure multer to handle single icon file under the 'icon' field name

exports.createCategory = async (req, res) => {
  try {
    const categoryData = {
      ...req.body,
      icon: req.file ? req.file.path : undefined, // Save the path of the uploaded icon
    };
    const category = new Category(categoryData);
    await category.save();
    res.status(201).send(category);
  } catch (error) {
    res.status(400).send(error);
  }
};

// Handle bulk import of categories
exports.bulkImportCategory = async (req, res) => {
  try {
    const categories = req.body; // Expecting an array of categories

    // Validate the format and required fields
    const existingCategoryNames = [];

    for (const cat of categories) {
      // Check for missing fields
      if (!cat.name || !cat.Description) {
        return res
          .status(400)
          .json({
            error:
              "Invalid Category format. All fields are required (Category Name and Category Description).",
          });
      }

      // Validate Category Name (only letters)
      if (!/^[a-zA-Z]+$/.test(cat.name)) {
        return res
          .status(400)
          .json({ error: "Category name can contain only letters." });
      }

      // Validate Category Description (only letters and spaces)
      if (!/^[a-zA-Z\s]+$/.test(cat.Description)) {
        return res
          .status(400)
          .json({
            error: "Category description can contain only letters and spaces.",
          });
      }

      // Check for existing Category Name
      const existingCategory = await Category.findOne({ name: cat.name });
      if (existingCategory) {
        existingCategoryNames.push(cat.name);
      }
    }

    // After looping through all categories, check if any category names already exist
    if (existingCategoryNames.length > 0) {
      return res.status(400).json({
        error: `Categories with the following names already exist: ${existingCategoryNames.join(
          ", "
        )}. Please use unique category names.`,
      });
    }

    await Category.insertMany(categories);

    res.status(201).json({ message: "Category imported successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
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
      categoryUpdateData.icon = req.file.path; // Update the icon path if a new icon was uploaded
    }
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      categoryUpdateData,
      { new: true, runValidators: true }
    );
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
