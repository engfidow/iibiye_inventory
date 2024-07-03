const Transaction = require("../models/Transactions");
const Product = require('../models/Products');
const { payByWaafiPay } = require("../paymentEvc");

const mongoose = require("mongoose");




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
          await Product.findOneAndUpdate({ uid: product.productUid }, { status: "inactive" });
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
        await Product.findOneAndUpdate({ uid: product.productUid }, { status: "inactive" });
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


// Get profit for the current month with a limit of 10 transactions
exports.getMonthlyProfit = async (req, res) => {
  try {
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

    const transactions = await Transaction.find({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
    }).populate('productsList.productUid').limit(10); // Limit the number of transactions to 10

    let sellingPrices = [];
    let costPrices = [];

    transactions.forEach(transaction => {
      transaction.productsList.forEach(product => {
        if (product.productUid && product.productUid.sellingPrice && product.productUid.price) {
          sellingPrices.push(product.productUid.sellingPrice);
          costPrices.push(product.productUid.price);
        } else {
          console.log('Missing product details for:', product);
        }
      });
    });

    res.status(200).json({ sellingPrices, costPrices });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
