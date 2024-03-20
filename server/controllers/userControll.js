const { default: mongoose } = require("mongoose");
const User = require("../models/UserModel.js");

module.exports = {
  createUser: async (req, res) => {
    const { username, email, password } = req.body;

    const sql =
      "INSERT INTO Users (UserName, Email, Password) VALUES (?, ?, ?)";
    const values = [username, email, password];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error("Error inserting user:", err);
        res.status(500).json({ error: "Internal Server Error" });
      } else {
        res.status(200).json({ message: "User inserted successfully", result });
      }
    });
  },
  getUsers: async (req, res) => {
    try {
      const users = await User.find();
      res.status(200).json({ status: true, data: users });
    } catch (e) {
      res.status(400).json({
        status: false,
        message: e.toString(),
      });
    }
  },
  getUser: async (req, res) => {
    try {
      const user = await User.findById({ _id: req.params.id });
      res.status(200).json({ status: true, data: user });
    } catch (e) {
      res.status(400).json({
        status: false,
        message: e.toString(),
      });
    }
  },
  deleteUser: async (req, res) => {
    try {
      const user = await User.findByIdAndDelete({ _id: req.params.id });
      res
        .status(200)
        .json({ status: true, data: "USER DELETED SUCCESSFULLY ✅" });
    } catch (e) {
      res.status(400).json({
        status: false,
        message: e.toString(),
      });
    }
  },
  updateUser: async (req, res) => {
    try {
      const user = await User.findOneAndUpdate(
        { _id: req.params.id },
        req.body,
        { new: true }
      );
      res
        .status(200)
        .json({
          status: true,
          message: "USER UPDATED SUCCESSFULLY",
          data: user,
        });
    } catch (e) {
      res.status(400).json({
        status: false,
        message: e.toString(),
      });
    }
  },

  // API endpoint for user login
  auth: async (req, res) => {
    const { email, password } = req.body;

    try {
      // Check if the user exists in the database
      const sql = "SELECT UserID, Email, Password FROM Users WHERE Email = ?";
      db.query(sql, [email], async (err, results) => {
        if (err) {
          console.error("Error during login:", err);
          return res.status(500).json({ error: "Internal server error" });
        }

        const user = results[0];

        if (!user) {
          return res.status(401).json({ error: "Invalid email or password" });
        }

        if (password != user.Password) {
          return res.status(401).json({ error: "Invalid email or password" });
        }
        // At this point, the user is authenticated
        res.json({ userID: user.UserID, message: "Login successful" });
      });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};
