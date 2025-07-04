//----> external imports
const express = require('express');
const router = express.Router();
//-----> internal imports
const {createDepartment ,
       getAllDepartments,
       getSingleDepartment,
       updateDepartment,
       deleteDepartment} = require('../Controllers/DepartmentController');
const {VerifyToken, authorizeRoles} = require('../Middlewares/AuthMiddleware');

// Admin-only routes for creating, updating, and deleting departments
router.route('/admin/departments/new')
    .post(VerifyToken, authorizeRoles('Admin'), createDepartment);
router.route('/admin/departments/:id')
    .put(VerifyToken, authorizeRoles('Admin'), updateDepartment)
    .delete(VerifyToken, authorizeRoles('Admin'), deleteDepartment);

// Public or general access routes for viewing departments
router.route('/departments').get(getAllDepartments);
router.route('/departments/:id').get(getSingleDepartment);

module.exports = router;