// routes/userRouter.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/usercustomer');

// Include multer middleware for routes that handle image uploads
router.post('/customers/signup', userController.upload, userController.createUser);
router.post('/customers/login', userController.loginUser);
router.get('/customers', userController.protect, userController.getAllUsers);


router.put('/customers/:id', userController.upload, userController.updateUser);

router.post('/customers/update', userController.upload, userController.updateUserPassword);

router.get('/customers', userController.getAllUsers);
router.get('/customers/:id', userController.getUserById);
router.delete('/customers/:id', userController.deleteUser);
router.get('/customers/email/:email', userController.getUserByEmail);

//route for changing password
router.post('/customers/change-password', userController.changePassword);

router.post('/customers/send-verification-code', userController.sendVerificationCode);
router.post('/customers/update-password', userController.verifyCodeAndUpdatePassword);



module.exports = router;
