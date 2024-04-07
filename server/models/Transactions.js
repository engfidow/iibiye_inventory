const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    userCustomerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserCustomer',
        required: true,
    },
    userCustomerEmail: {
        type: String,
        required: true,
    },
    productsList: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
        },
        quantity: Number,
    }],
    paymentMethod: {
        type: String,
        required: true,
    },
    totalPrice: {
        type: Number,
        required: true,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Transaction', TransactionSchema);
