import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import { useDispatch } from 'react-redux';
import { logout } from '../Redux/AuthSlice';


const EmployeeDashboard = () => {
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  }
  return (
    <div className="flex box-border bg-gradient-radial from-[#595656] to-[#E62121] w-full h-full m-0 p-0">
      <div className={`p-8 text-center justify-center opacity-80 bg-white m-auto rounded-lg shadow-md p-auto h-auto box-border ${isMobile ? 'w-120' : ' w-180'} `}>
        <button className={`m-4 p-2 text-center border border-gray-700 border-3 hover:bg-black hover:text-white ${isMobile ? 'ml-4 w-20 text-sm' : ' ml-2 w-35 text-xl'}`}
          onClick={() => navigate(-1)}>← Back</button>
        <h1 className="text-4xl font-bold text-green-800">Welcome to the Employee Dashboard!</h1>
        <p className="text-lg mt-4 text-green-600">This content is only visible to Employee users.</p>
        <div className="mt-8 gap-8 flex justify-center">
          <Link
            to="/employee/profile"
            className="px-6 py-3 bg-green-700 text-white font-semibold rounded-lg shadow-md hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75"
          >
            View My Profile
          </Link>
          <Link
            to="/employee/leave"
            className="px-6 py-3 bg-green-700 text-white font-semibold rounded-lg shadow-md hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75"
          >
            Apply For Leave
          </Link>
          <button
            onClick={handleLogout}
            className=" bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;