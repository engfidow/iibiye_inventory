const mongoose = require('mongoose');

const UserCustomerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    gender: { type: String, required: true },
    image: {type: String, required: true, }
}, {
    timestamps: true,
});

module.exports = mongoose.model('UserCustomer', UserCustomerSchema);
