const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/Transactions_Controller');

// CRUD routes
router.post('/transactions', transactionController.createTransaction);
router.get('/transactions/get', transactionController.getAllTransactions);
router.get('/transactions/:id', transactionController.getTransaction);
router.put('/transactions/:id', transactionController.updateTransaction);
router.delete('/transactions/:id', transactionController.deleteTransaction);

// Route to get transactions with product details
router.get('/transactions/details', transactionController.getTransactionsWithProductDetails);

// Route to get transactions by user ID
router.get('/transactions/user/:userId', transactionController.getTransactionByUserId);


// Get profit for the current month
router.get('/transactions/profit/month', transactionController.getMonthlyProfit);


//report data

// routes/transactionRoutes.js

// routes/transactionRoutes.js

router.get('/transactions/report/:type', transactionController.getReportData);


// router.get('/transactions/profit/most-profitable', transactionController.getMostProfitableTransactions);
// router.get('/transactions/sales/month', transactionController.getMonthlySales);
// router.get('/transactions/sales/year', transactionController.getYearlySales);
// router.get('/transactions/sales/week', transactionController.getWeeklySales);


module.exports = router;
