const Transaction = require("../models/Transactions");
const Product = require('../models/Products');
const { payByWaafiPay } = require("../paymentEvc");

// Create Transaction
exports.createTransaction = async (req, res) => {
  try {
    if (req.body.paymentMethod === "EVC-PLUS") {
      const waafiResponse = await payByWaafiPay({
        phone: req.body.paymentPhone,
        amount: req.body.totalPrice,
        merchantUid: process.env.merchantUid,
        apiUserId: process.env.apiUserId,
        apiKey: process.env.apiKey,
      });

      if (waafiResponse.status) {
        console.log(waafiResponse.status);
        const transaction = new Transaction(req.body);
        await transaction.save();

        // Update product status to inactive
        for (const product of req.body.productsList) {
          await Product.findByIdAndUpdate(product.productUid, { status: "inactive" });
        }

        res.status(201).json(transaction);
      } else {
        // Handling payment failure
        return res.status(400).send({
          status: "failed",
          message: `${waafiResponse.error}` ?? "Payment Failed Try Again",
        });
      }
    } else {
      const transaction = new Transaction(req.body);
      await transaction.save();

      // Update product status to inactive
      for (const product of req.body.productsList) {
        await Product.findByIdAndUpdate(product.productUid, { status: "inactive" });
      }

      res.status(201).json(transaction);
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get All Transactions
exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate("userCustomerId")
      .populate("productsList.productUid");
    res.status(200).json(transactions);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get Single Transaction
exports.getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate("userCustomerId")
      .populate("productsList.productUid");
    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    res.status(200).json(transaction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update Transaction
exports.updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    res.status(200).json(transaction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete Transaction
exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);
    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    res.status(200).json({ message: "Transaction deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get Transactions with Product Details
exports.getTransactionsWithProductDetails = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate("userCustomerId")
      .populate({
        path: "productsList.productUid",
        select: "name image sellPrice",
      });
    res.status(200).json(transactions);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get Transactions by User ID
exports.getTransactionByUserId = async (req, res) => {
  try {
    const userId = req.params.userId; // Assuming the user ID is passed as a URL parameter
    const transactions = await Transaction.find({ userCustomerId: userId })
      .populate("userCustomerId")
      .populate({
        path: "productsList.productUid",
        select: "name image sellingPrice",
      });
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).send(error);
  }
};
