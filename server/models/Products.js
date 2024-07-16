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
        default: 'active'
    },
   
    image: { type: String},
   
}, {
    timestamps: true,
});

module.exports = mongoose.model('Product', ProductSchema);
