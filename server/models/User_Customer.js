const mongoose = require('mongoose');

const UserCustomerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    paymentMethods: [String], // Assuming multiple payment methods can be stored
    image: String,
}, {
    timestamps: true,
});

module.exports = mongoose.model('UserCustomer', UserCustomerSchema);
