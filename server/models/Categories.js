// models/Category.js
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  Description: { type: String, required: true },
  icon: { type: String, required: true}
},{timestamps:true});

module.exports = mongoose.model('Category', categorySchema);
