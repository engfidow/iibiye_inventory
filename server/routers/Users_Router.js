const express = require('express');
const usersController = require('../controllers/Users_Controller');
const router = express.Router();

// Routes for Users
router.post('/users', usersController.createUser);
router.get('/users', usersController.getAllUsers);
router.patch('/users/:id', usersController.updateUser);
router.delete('/users/:id', usersController.deleteUser);

module.exports = router;
