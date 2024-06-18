const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    uid: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    sellingPrice: {
        type: Number,
        required: true,
    },
   
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    status: {
        type: String,
        required: true,
    },
   
    image: { type: String, required: true },
   
}, {
    timestamps: true,
});

module.exports = mongoose.model('Product', ProductSchema);
