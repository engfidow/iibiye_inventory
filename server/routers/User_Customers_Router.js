const express = require('express');
const userCustomersController = require('../controllers/User_Customers_Controller');
const router = express.Router();

// Routes for User Customers
router.post('/userCustomers', userCustomersController.createUserCustomer);
router.get('/userCustomers', userCustomersController.getAllUserCustomers);
router.patch('/userCustomers/:id', userCustomersController.updateUserCustomer);
router.delete('/userCustomers/:id', userCustomersController.deleteUserCustomer);

module.exports = router;
