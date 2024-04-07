const express = require('express');
const transactionsController = require('../controllers/Transactions_Controller');
const router = express.Router();

// Routes for Transactions
router.post('/transactions', transactionsController.createTransaction);
router.get('/transactions', transactionsController.getAllTransactions);
router.patch('/transactions/:id', transactionsController.updateTransaction);
router.delete('/transactions/:id', transactionsController.deleteTransaction);

module.exports = router;
