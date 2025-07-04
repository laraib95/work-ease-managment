const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.ObjectId,
        ref: 'Employee',
        required: true,
    },
    leaveType: {
        type: String,
        enum: ['sick leave', 'casual leave', 'maternity leave', 'annual leave', 'other'],
        default: 'casual leave',
        required: true,
    },
    startDate: {
        type: Date,
        required: [true, "Start Date is required"],
    },
    endDate: {
        type: Date,
        required: [true, "End Date is required"],
    },
    duration: {
        type: Number,
        required: true,
        min: 1, // A leave must be at least 1 day
    },
    reason: {
        type: String,
        required: [true, 'Reason is required'],
        maxlength: [800, 'Reason can\'t exceed 800 characters.'] // Changed max to maxlength for clarity
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'cancelled'],
        default: 'pending',
    },
    approvedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User', // Reference to the Admin User who approved/rejected
        default: null,
    },
    adminComments: {
        type: String,
        maxlength: [500, 'Admin comments cannot exceed 500 characters.'],
        default: "",
    },
    appliedAt: {
        type: Date,
        default: Date.now,
    },
});

// Pre-save hook to calculate duration and ensure end date is not before start date
leaveSchema.pre('validate', function (next) { // Changed to 'validate' hook for field calculations
    if (this.startDate && this.endDate) {
        const start = new Date(this.startDate);
        const end = new Date(this.endDate);

        if (start > end) {
            return next(new Error('End date cannot be before start date.'));
        }

        const diffTime = Math.abs(end.getTime() - start.getTime());
        // Calculate duration including both start and end day
        this.duration = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    } else {
        // If either date is missing, duration cannot be calculated, let other validations handle
        this.duration = undefined;
    }
    next();
});

module.exports = mongoose.model('Leave', leaveSchema);