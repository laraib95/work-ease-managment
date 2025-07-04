//----> internal imports
const CatchAsyncErrors = require('../Middlewares/CatchAsyncErrors');
const ErrorHandler = require('../Utilis/ErrorHandler');
const Leave = require('../Models/Leave');
// const User = require('../Models/User');
const Employee = require('../Models/Employee');

//=============> Public functions (employee) <================================

// @method : POST
// @route  : /api/v1/leave/apply
exports.applyForLeave = CatchAsyncErrors(async (req, res, next) => {
    // Get the logged-in User's ObjectId
    const userObjectId = req.user._id;
    // Find the Employee document linked to this User
    const employee = await Employee.findOne({ user: userObjectId });
    if (!employee) {
        return next(new ErrorHandler("Employee profile not found for the logged-in user. Cannot apply for leave.", 404));
    }
    // This is the correct Employee's ObjectId to use for the Leave model
    const employeeId = employee._id; 

    const { leaveType, startDate, endDate, reason } = req.body;
    if (!leaveType || !startDate || !endDate || !reason) {
        return next(new ErrorHandler('All Fields are required', 404));
    }
    // Basic date validation
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) {
        return next(new ErrorHandler("Start date cannot be after end date.", 400));
    }
    const leaveRequest = await Leave.create({
        employee: employeeId,
        leaveType,
        startDate,
        endDate,
        reason,
        status: 'pending',
        appliedAt: Date.now(),
    });
    res.status(200).json({
        success: true,
        message: 'Leave Request generated successfully',
        leaveRequest,
    });
});

// @method: GET
// @route: /api/v1/leave/:id
exports.getEmployeeLeaveHistory = CatchAsyncErrors(async (req, res, next) => {
    // Get the logged-in User's ObjectId
    const userObjectId = req.user._id;
    // Find the Employee document linked to this User
    const employee = await Employee.findOne({ user: userObjectId });
    if (!employee) {
        return next(new ErrorHandler("Employee profile not found for the logged-in user. Cannot fetch leave history.", 404));
    }    
    const employeeId = employee._id; 

    const leaveRequests = await Leave.find({ employee: employeeId }).sort({ appliedAt: -1 });
    res.status(200).json({
        success: true,
        count: leaveRequests.length,
        leaveRequests,
    });
})

// @method: DELETE
// @route: /api/v1/leave/:id
exports.cancelLeave = CatchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const leaveRequest = await Leave.findById(id);
    if (!leaveRequest) {
        return next(new ErrorHandler(`Leave request not found with id: ${id} `, 404))
    }
    // Ensure employee is canceling their own leave
    const userObjectId = req.user._id;
    const employee = await Employee.findOne({ user: userObjectId });
    if (!employee) {
        return next(new ErrorHandler("Employee profile not found for the logged-in user. Cannot cancel leave.", 404));
    }
    const employeeId = employee._id; 
    // Compare the Employee ID stored in the leave request with the logged-in Employee's ID
    if (String(leaveRequest.employee) !== String(employeeId)) {
        return next(new ErrorHandler('Not authorized to cancel this leave request'));
    }
    //only allow to cancel the leave request if it's status is pending.
    if (leaveRequest.status !== 'pending') {
        return next(new ErrorHandler(`Can't delete request with this status : ${leaveRequest.status}`, 404));
    }
     // Else Set status to Cancelled
    leaveRequest.status = 'cancelled';
    await leaveRequest.save();

    res.status(200).json({
        success: true,
        message: "Leave request cancelled successfully.",
        leaveRequest,
    });
})

//=============> Private functions (Admin) <================================

// @method : GET
// @routes : /api/v1/admin/leaves
exports.getAllLeaveRequests = CatchAsyncErrors(async (req,res,next)=>{
    const leaves = await Leave.find().populate('employee','name email department position').populate('approvedBy','name email');

     console.log("Backend (Admin - getAllLeaveRequests): Fetched leaves:", leaves);
    res.status(200).json({
        success: true,
        count: leaves.length,
        leaves,
    });


})

// @method : GET
// @route : /api/v1/admin/leave/:id
// @desc : Get single leave request details (Admin only)
exports.getSingleLeaveRequest = CatchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;

    const leaveRequest = await Leave.findById(id)
        .populate('employee', 'name email department position')
        .populate('approvedBy', 'name email'); // Populate if used

    if (!leaveRequest) {
        return next(new ErrorHandler(`Leave request not found with id: ${id}`, 404));
    }

    res.status(200).json({
        success: true,
        leaveRequest,
    });
});


// @method : PUT
// @route : /api/v1/admin/leave/:id/status
exports.updateLeaveStatus = CatchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const { status, adminComments } = req.body;
    let leaveRequest = await Leave.findById(id);

    if (!leaveRequest) {
        return next(new ErrorHandler(`Leave request not found with id: ${id}`, 404));
    }
    // Only allow status change if current status is 'pending'
    if (leaveRequest.status !== 'pending') {
        return next(new ErrorHandler(`Cannot change status of a leave request that is already ${leaveRequest.status}. Only pending requests can be updated.`, 400));
    }
    // Validate the new status
    const allowedStatuses = ['approved', 'rejected'];
    if (!allowedStatuses.includes(status)) {
        return next(new ErrorHandler("Invalid status provided. Status must be 'approved' or 'rejected'.", 400));
    }
    // Find the associated employee to update their leave balances
    const employee = await Employee.findById(leaveRequest.employee);
    if (!employee) {
        return next(new ErrorHandler("Associated employee not found for this leave request.", 404));
    }
    if (status === 'approved') {
        // Decrement remainingLeaves and increment leavesTaken for the employee
        // Ensure duration is calculated and stored in leaveRequest during applyForLeave
        const leaveDuration = leaveRequest.duration; 
        if (employee.remainingLeaves < leaveDuration) {
            return next(new ErrorHandler(`Employee does not have enough remaining leaves to approve this request. Remaining: ${employee.remainingLeaves}, Requested: ${leaveDuration}`, 400));
        }

        employee.leavesTaken += leaveDuration;
        employee.remainingLeaves -= leaveDuration;
        leaveRequest.approvedBy = req.user._id; // Set the admin who approved
    } else if (status === 'rejected') {
        // No change to leave balances if rejected, as they were not decremented on application
        leaveRequest.approvedBy = req.user._id; // Set the admin who rejected
    }

    leaveRequest.status = status;
    leaveRequest.adminComments = adminComments || leaveRequest.adminComments; // Update comments if provided

    await employee.save(); // Save the updated employee document
    await leaveRequest.save(); // Save the updated leave request document

    res.status(200).json({
        success: true,
        message: `Leave request ${status} successfully.`,
        leaveRequest,
    });
});

