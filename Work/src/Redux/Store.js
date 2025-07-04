import {configureStore} from "@reduxjs/toolkit";
import AuthReducer from "./AuthSlice";
import EmployeeReducer from "./EmployeeSlice";
import DepartmentReducer from './DepartmentSlice';
import LeaveReducer from './LeaveSlice';

export const Store = configureStore({
    reducer:{
        auth: AuthReducer,  
        employee: EmployeeReducer,
        department : DepartmentReducer,
        leave: LeaveReducer,
    }
});