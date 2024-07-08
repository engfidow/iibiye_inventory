// models/Category.js
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  Description: { type: String, required: true },
  icon: { type: String,}
},{timestamps:true});

module.exports = mongoose.model('Category', categorySchema);
