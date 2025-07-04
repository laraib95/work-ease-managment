const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    mobilenumber: {
        type: String,
        required: true,
    },
    age: {
        type: Number,
        required: true,
    },
    role: {
        type: String,
        enum: ['Admin','Employee'],
        default: 'Employee',
        required: true
    }
}, {timestamps: true,});

module.exports = mongoose.model('User', userSchema);