//-----> external imports
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

//----> internal imports
const User = require('../Models/User');
const CatchAsyncErrors = require('../Middlewares/CatchAsyncErrors');
const ErrorHandler = require('../Utilis/ErrorHandler');
const Employee = require('../Models/Employee');

// @method : POST
// @route : /api/v1/CreateEmployee (admin only)
exports.createEmployee = CatchAsyncErrors(async (req, res, next) => {
    const { name, email, phonenumber, salary, photo, position, department, dateOfJoining, status,age, password, } = req.body;
    if (!name || !email || !phonenumber || !salary || !position || !department || !status || !password) {
        return next(new ErrorHandler("Please fill the required fields.", 400))
    }
    // Check if a employee account with this email already exists
    const existingEmployee = await Employee.findOne({ email })
    if (existingEmployee) {
        return next(new ErrorHandler("Email has already been taken.", 400));
    }
    // Check if a User account with this email already exists
    const existingUserAccount = await User.findOne({ email });
    if (existingUserAccount) {
        return next(new ErrorHandler("A user account with this email already exists. Link this employee to that user, or use a different email.", 400));
    }
    // Hash the temporary password for the new user
     const hashedPassword = await bcrypt.hash(password, 10);
    // 1. Create the new User account for this employee
    const newUser = new User({
        name,
        email,
        password: hashedPassword,
        mobilenumber: phonenumber,
        age: 0, // You might need to add age to req.body or set a default/placeholder
        role: 'Employee', // Explicitly set role
    });
    await newUser.save();

    // 2. Create the Employee profile and link it to the newly created User
    const newEmployee = await Employee.create({
        name,
        email,
        phonenumber,
        salary,
        photo,
        position,
        department,
        dateOfJoining: dateOfJoining ? new Date(dateOfJoining) : Date.now(),
        status,
        user: newUser._id,
        totalLeaves: 50, // Default total leaves,
        leavesTaken: 0,
        remainingLeaves: totalLeaves - leavesTaken,
    })
    res.status(201).json({
        success: true,
        message: "Employee and linked user account created successfully",
        employee: newEmployee,
        user: {
            _id: newUser._id,
            email: newUser.email,
            role: newUser.role
        }
    });
});

// @method : GET
// @route : /api/v1/employee
exports.getAllEmployees = CatchAsyncErrors(async (req, res, next) => {
    const employees = await Employee.find().populate('user', 'name email role');
    res.status(200).json({
        success: true,
        count: employees.length,
        employees,
    });
});

//method : GET
// @route : /api/v1/employee/:id
exports.getMyEmployeeProfile = CatchAsyncErrors(async (req, res, next) => {
    const userId = req.user.id;
    console.log("DEBUGGING: Fetching profile for userId:", userId);
    // Find the Employee document that is linked to this User ID
    const employeeProfile = await Employee.findOne({ user: userId }).populate('user', 'name email role').populate('department', 'name'); // If department is a reference
    // You might also want to populate the 'department' field if it's a ref to a Department model

    if (!employeeProfile) {
        console.log("DEBUGGING: No employee profile found for user:", userId);
        return next(new ErrorHandler("Employee profile not found for this user.", 404));
    }
    console.log("DEBUGGING: Employee Profile found:", employeeProfile); 
    res.status(200).json({
        success: true,
        employeeProfile,
    });
});

// @method: GET
// @route: /api/v1/admin/employees/:id
// @desc: Get single employee details (Admin only)
exports.getSingleEmployee = CatchAsyncErrors(async (req, res, next) => {
    const employee = await Employee.findById(req.params.id).populate('user', 'name email role');

    if (!employee) {
        return next(new ErrorHandler(`Employee not found with id: ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        employee,
    });
});

// @method: PUT
// @route: /api/v1/admin/employees/:id (admin only)
exports.updateEmployee = CatchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const { name, email, phoneNumber, photo, position, department, dateOfJoining, salary, status, userId } = req.body;

    let employee = await Employee.findById(id);

    if (!employee) {
        return next(new ErrorHandler(`Employee not found with id: ${id}`, 404));
    }

    // Handle email change unique constraint: check if new email already exists for another employee
    if (email && email !== employee.email) {
        const existingEmployeeWithEmail = await Employee.findOne({ email });
        if (existingEmployeeWithEmail && String(existingEmployeeWithEmail._id) !== id) {
            return next(new ErrorHandler("An employee with this email already exists.", 400));
        }
    }

    const updatedData = {
        name,
        email,
        phoneNumber,
        photo,
        position,
        department,
        dateOfJoining: dateOfJoining ? new Date(dateOfJoining) : undefined, // Only update if provided
        salary,
        status,
        user: userId, // Can update linked user
    };

    // Remove undefined values to avoid setting them in DB if not provided in request
    Object.keys(updatedData).forEach(key => updatedData[key] === undefined && delete updatedData[key]);

    employee = await Employee.findByIdAndUpdate(id, updatedData, {
        new: true, // Return the updated document
        runValidators: true, // Run schema validators on update
        useFindAndModify: false, // Use native MongoDB driver findOneAndUpdate
    }).populate('user', 'name email role');

    res.status(200).json({
        success: true,
        message: "Employee updated successfully.",
        employee,
    });
});

// @method: PUT
// @route: /api/v1/admin/employees/:id/leave-balance (admin only)
exports.updateEmployeeLeaveBalance = CatchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const { totalLeaves, leavesTaken, remainingLeaves } = req.body;

    let employee = await Employee.findById(id);

    if (!employee) {
        return next(new ErrorHandler(`Employee not found with id: ${id}`, 404));
    }

    const updatedLeaveBalance = {
        totalLeaves: totalLeaves !== undefined ? totalLeaves : employee.totalLeaves,
        leavesTaken: leavesTaken !== undefined ? leavesTaken : employee.leavesTaken,
        remainingLeaves: remainingLeaves !== undefined ? remainingLeaves : employee.remainingLeaves,
    };
    if (totalLeaves !== undefined || leavesTaken !== undefined) {
        updatedLeaveBalance.remainingLeaves = (updatedLeaveBalance.totalLeaves || 0) - (updatedLeaveBalance.leavesTaken || 0);
    }

    employee = await Employee.findByIdAndUpdate(id, updatedLeaveBalance, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    }).populate('user', 'name email role');

    res.status(200).json({
        success: true,
        message: "Employee leave balance updated successfully.",
        employee,
    });
});

// @method: DELETE
// @route: /api/v1/admin/employees/:id (admin only)
exports.deleteEmployee = CatchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;

    const employee = await Employee.findById(id);

    if (!employee) {
        return next(new ErrorHandler(`Employee not found with id: ${id}`, 404));
    }

    await employee.deleteOne(); // Use deleteOne() for Mongoose 6+

    res.status(200).json({
        success: true,
        message: "Employee deleted successfully.",
    });
});