const mongoose= require('mongoose');

const employeeSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
    },
    phonenumber: {
        type: String,
        required: true,
    },
    position: {
        type: String,
        required: true,
    },
    photo:{
        type: String,
        default: '',
    },
    department: {
        type: String,
        required: true,
    },
    dateOfJoining: {
        type: Date,
        required: true,
        default: Date.now,
    },
    salary:{
        type: Number,
        required: true,
        min:0,
    },
     status: {
        type: String,
        enum: ['active', 'on leave', 'terminated', 'probation'],
        default: 'active',
        required: true, 
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        sparse: true, // Allows null values, so not all employees need a linked user account
    },
    totalLeaves: {
        type: Number,
        required: true,
        default: 20, // Default total annual leaves
        min: 0,
    },
    leavesTaken: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
    },
    remainingLeaves: {
        type: Number,
        required: true,
        default: 20, // Should typically be totalLeaves - leavesTaken
        min: 0,
    },
}, {timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema );