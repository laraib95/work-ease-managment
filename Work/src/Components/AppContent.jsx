import { Routes, Route } from "react-router-dom";

import HomeScreen from '../Screens/HomeScreen.jsx';
import SignupForm from './SignupForm.jsx';
import LoginForm from "./LoginForm.jsx";
import AdminDashboard from './AdminDashboard.jsx'
import EmployeeDashboard from './EmployeeDashboard.jsx'
import EmployeeProfilePage from './EmployeeProfilePage.jsx';
import EmployeeLeave from "./EmployeeLeave.jsx";

function AppContent() {
  return (
    // <div className="min-h-screen flex justify-center items-center">
        <Routes>
          <Route path='/' element={<HomeScreen />} />
          <Route path="/signupform" element={<SignupForm />} />
          <Route path="/login" element={<LoginForm/>} />
          <Route path="/admindashboard" element={<AdminDashboard/>} />
          <Route path="/employeedashboard" element={<EmployeeDashboard/>} />
          <Route path="/employee/profile" element={<EmployeeProfilePage/>} />
          <Route path="/employee/leave" element={<EmployeeLeave/>} />


        </Routes>
    // </div>
  )
}
export default AppContent;