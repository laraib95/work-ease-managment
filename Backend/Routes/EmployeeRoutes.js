//-----> external imports
const express = require('express');
const router = express.Router();

const {createEmployee, 
       getAllEmployees, 
       getSingleEmployee, 
       getMyEmployeeProfile,
       deleteEmployee, updateEmployee} =  require('../Controllers/EmployeeController');
const {VerifyToken , authorizeRoles} = require('../Middlewares/AuthMiddleware');
//=======> Admin routes
router.route('/admin/employees/new')
            .post(VerifyToken, authorizeRoles('Admin'), createEmployee);
router.route('/admin/employees')
    .get(VerifyToken, authorizeRoles('Admin'), getAllEmployees);

router.route('/admin/employees/:id')
    .get(VerifyToken, authorizeRoles('Admin'), getSingleEmployee)
    .put(VerifyToken, authorizeRoles('Admin'), updateEmployee)
    .delete(VerifyToken, authorizeRoles('Admin'), deleteEmployee);
    
//========> employee specific routes
    router.route('/me/employeeProfile') 
    .get(VerifyToken, authorizeRoles('Employee'), getMyEmployeeProfile); 

module.exports = router;