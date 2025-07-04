const express = require('express');
const router = express.Router();
const {VerifyToken , authorizeRoles} = require('../Middlewares/AuthMiddleware');

const {
    applyForLeave,
    getEmployeeLeaveHistory,
    cancelLeave,
    getAllLeaveRequests,
    getSingleLeaveRequest,
    updateLeaveStatus
} = require('../Controllers/LeaveController');

router.route('/leave/apply')
            .post(VerifyToken, authorizeRoles('Employee', 'Admin'), applyForLeave);
router.route('/leave/my')
                .get(VerifyToken, authorizeRoles('Employee', 'Admin'), getEmployeeLeaveHistory);

// Employee cancels their own leave request (changes status to 'Cancelled')
router.route('/leave/cancel/:id')
            .put(VerifyToken, authorizeRoles('Employee', 'Admin'), cancelLeave);

//===================> FOR ADMIN ONLY
// Get all leave requests for admin review
router.route('/admin/leave/all')
            .get(VerifyToken, authorizeRoles('Admin'), getAllLeaveRequests);
// Get single leave request details (for admin to review)
router.route('/admin/leave/:id')
            .get(VerifyToken, authorizeRoles('Admin'), getSingleLeaveRequest);
// Update leave request status (Approve/Reject) by admin
router.route('/admin/leave/:id/status')
            .put(VerifyToken, authorizeRoles('Admin'), updateLeaveStatus);


module.exports = router;