// controllers/userController.js
const User = require('../models/User_Customer');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const nodemailer = require('nodemailer');
require('dotenv').config();
const verificationCodes = {}; // In-memory store for verification codes
// Environment variables for JWT
const JWT_SECRET = process.env.JWT_SECRET || ''; // Ensure you have a secure key
const JWT_EXPIRES_IN = '90d'; // Token expiration time

// Configure multer for file storage
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/users/');  // Ensure this directory exists or is automatically created
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });
exports.upload = upload.single('image'); // Middleware to handle single image file

exports.createUser = async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 12);
        const userData = {
            ...req.body,
            password: hashedPassword,
            image: req.file ? req.file.path : ''  // Save the path of the uploaded image
        };
        const user = new User(userData);
        await user.save();
        const token = generateToken(user._id);
        res.status(201).send({ user, token });
    } catch (error) {
        res.status(400).send(error);
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).send({ message: 'Email or password is incorrect' });
        }
        const token = generateToken(user._id);
        res.status(200).send({ user, token });
    } catch (error) {
        res.status(500).send(error);
    }
};

function generateToken(id) {
    return jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

exports.protect = async (req, res, next) => {
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).send({ message: 'Not authorized to access this route' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = await User.findById(decoded.id);
        next();
    } catch (error) {
        return res.status(401).send({ message: 'Not authorized, token failed' });
    }
};


exports.updateUser = async (req, res) => {
    try {
        const userUpdateData = {
            ...req.body,
        };
        if (req.file) {
            userUpdateData.image = req.file.path;  // Update the image path if a new image was uploaded
        }
        const user = await User.findByIdAndUpdate(req.params.id, userUpdateData, { new: true, runValidators: true });
        if (!user) {
            return res.status(404).send();
        }
        res.status(200).send(user);
    } catch (error) {
        res.status(400).send(error);
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).send(users);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).send();
        }
        res.status(200).send(user);
    } catch (error) {
        res.status(500).send(error);
    }
};



exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).send();
        }
        res.status(200).send(user);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.getUserByEmail = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email });
        if (!user) {
            return res.status(404).send();
        }
        res.status(200).send(user);
    } catch (error) {
        res.status(500).send(error);
    }
};


exports.changePassword = async (req, res) => {
    try {
        const { userId, currentPassword, newPassword } = req.body;

        // Find the user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        // Check if the current password matches
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).send({ message: 'Current password is incorrect' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        // Update the user's password
        user.password = hashedPassword;
        await user.save();
        
        res.status(200).send({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).send({ message: 'An error occurred while changing the password' });
    }
};


//update use for forget

exports.updateUserPassword = async (req, res) => {
    try {
        const { userId, newPassword } = req.body;

        // Find the user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

       

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        // Update the user's password
        user.password = hashedPassword;
        await user.save();
        
        res.status(200).send({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).send({ message: 'An error occurred while changing the password' });
    }
};

// Configure nodemailer for sending emails
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
    },
});

transporter.verify((error, success) => {
    if (error) {
        console.log(error);
    } else {
        console.log('Server is ready to take our messages');
    }
});

exports.sendVerificationCode = async (req, res) => {
    const { email } = req.body;
    try {
        // Generate a 6-digit numeric verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const verificationCodeExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

        // Save the verification code and its expiration time in memory
        verificationCodes[email] = {
            code: verificationCode,
            expires: verificationCodeExpires,
        };

        console.log(`Verification code for ${email}: ${verificationCode}, expires at: ${new Date(verificationCodeExpires)}`);

        // Send the verification code to the user's email
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'Your Verification Code',
            text: `Your verification code is ${verificationCode}`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                return res.status(500).send({ message: 'Error sending email' });
            }
            res.status(200).send({ message: 'Verification code sent' });
        });
    } catch (error) {
        console.error('An error occurred:', error);
        res.status(500).send({ message: 'An error occurred' });
    }
};





exports.verifyCodeAndUpdatePassword = async (req, res) => {
    const { email,  newPassword } = req.body;
    try {
       

       

       

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        // Find the user and update the password
        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found for email:', email);
            return res.status(404).send({ message: 'User not found' });
        }

        user.password = hashedPassword;
        await user.save();

        // Remove the verification code from memory
        delete verificationCodes[email];

        res.status(200).send({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('An error occurred:', error);
        res.status(500).send({ message: 'An error occurred' });
    }
};


