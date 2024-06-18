const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    usertype: {
        type: String,
        required: true,
        default : "user",
    },
    gender: { type: String, required: true },
    image: {type: String, required: true, }
}, {
    timestamps: true,
});

module.exports = mongoose.model('User', UserSchema);
