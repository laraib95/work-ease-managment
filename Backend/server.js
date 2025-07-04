//-------> external imports
const express = require('express');
const cors = require('cors');
const connectDB = require('./Configure/MongoDB');
require('dotenv').config();
const app = express();
//--------> internal imports
//--------> internal imports
const ErrorHandler = require('./Utilis/ErrorHandler'); 

//------> importing routes
const AuthRoutes = require('./Routes/AuthRoutes');
const EmployeeRoutes = require('./Routes/EmployeeRoutes');
const DepartmentRoutes = require('./Routes/DepartmentRoutes');
const LeaveRoutes = require('./Routes/LeaveRoutes');

//setting up global Middleware (cors & express.json)
app.use(cors());
app.use(express.json());              //Parse for JSON bodies

//using routes
app.use('/api/v1',AuthRoutes);
app.use('/api/v1',EmployeeRoutes);
app.use('/api/v1',DepartmentRoutes);
app.use('/api/v1', LeaveRoutes);

// <--- CRUCIAL: GLOBAL ERROR HANDLING MIDDLEWARE --->
app.use(ErrorHandler); 

//connect DB and start server
connectDB();
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on PORT : ${PORT}`));