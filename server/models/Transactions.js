const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema(
  {
    userCustomerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserCustomer",
      required: true,
    },
    productsList: [
      {
        productUid: {
          type: String,
          ref: "Product",
          required: true,
        },
      },
    ],
    paymentMethod: {
      type: String,
      required: true,
    },
    paymentPhone: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Transaction", TransactionSchema);
