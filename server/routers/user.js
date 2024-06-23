const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');

router.post('/users/signup', userController.upload, userController.createUser);
router.post('/users/login', userController.loginUser);

router.put('/users/:id', userController.upload, userController.updateUser);
router.post('/users/update', userController.upload, userController.updateUserPassword);

router.get('/users/getall', userController.getAllUsers);
router.get('/users/:id', userController.getUserById);
router.delete('/users/:id', userController.deleteUser);
router.get('/users/email/:email', userController.getUserByEmail);

router.post('/users/change-password', userController.changePassword);
router.post('/users/send-verification-code', userController.sendVerificationCode);
router.post('/users/verify-code-update-password', userController.verifyCodeAndUpdatePassword);

// Ensure this route is correctly set
router.get('/users/auth/validate-token', userController.validateToken);



module.exports = router;
