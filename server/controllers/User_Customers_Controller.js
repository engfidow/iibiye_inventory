const UserCustomer = require('../models/User_Customer'); // Ensure the path matches your file structure

// Create a new user customer
exports.createUserCustomer = async (req, res) => {
    try {
        const userCustomer = new UserCustomer(req.body);
        await userCustomer.save();
        res.status(201).send(userCustomer);
    } catch (error) {
        res.status(400).send(error);
    }
};

// Get all user customers
exports.getAllUserCustomers = async (req, res) => {
    try {
        const userCustomers = await UserCustomer.find({});
        res.send(userCustomers);
    } catch (error) {
        res.status(500).send(error);
    }
};

// Update a user customer
exports.updateUserCustomer = async (req, res) => {
    try {
        const userCustomer = await UserCustomer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!userCustomer) {
            return res.status(404).send();
        }
        res.send(userCustomer);
    } catch (error) {
        res.status(400).send(error);
    }
};

// Delete a user customer
exports.deleteUserCustomer = async (req, res) => {
    try {
        const userCustomer = await UserCustomer.findByIdAndDelete(req.params.id);
        if (!userCustomer) {
            return res.status(404).send();
        }
        res.send(userCustomer);
    } catch (error) {
        res.status(500).send(error);
    }
};
