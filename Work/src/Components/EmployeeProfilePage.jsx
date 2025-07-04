// src/pages/EmployeeProfilePage.jsx (or src/components/Employee/EmployeeProfilePage.jsx)
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
// Make sure the import path is correct based on your file structure
import { getMyProfile, clearErrors, clearEmployeeProfile } from '../Redux/EmployeeSlice'; 

const EmployeeProfilePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // Access the 'employee' slice from the Redux store
  const { employeeProfile, loading, error } = useSelector((state) => state.employee); 

  useEffect(() => {
    // Dispatch the thunk to fetch the employee's profile when the component mounts
    dispatch(getMyProfile());

    // Cleanup function: Clear any errors when the component unmounts
    // You might also clear the profile if you want it to refetch every time
    return () => {
      dispatch(clearErrors());
      dispatch(clearEmployeeProfile()); 
    };
  }, [dispatch]); // Dependency array ensures this runs only once on mount

  // --- Render Logic based on Redux State ---

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl font-semibold text-gray-700">Loading employee profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline ml-2">{error}</span>
          {/* Optional: Add a button to dismiss the error */}
          <span className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer" onClick={() => dispatch(clearErrors())}>
            <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
          </span>
        </div>
      </div>
    );
  }

  if (!employeeProfile) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg text-gray-600">No employee profile data available. Please ensure you are logged in and your profile is set up.</p>
      </div>
    );
  }

  // If we have employeeProfile data, display it
  return (
    <div className=" box-border mx-3 p-2 bg-white shadow-lg rounded-lg my-7 max-w-screen h-170">
      <button className={`m-5 p-2 w-35 text-center border border-gray-700 border-3 hover:bg-black hover:text-white`}
            onClick={() => navigate(-1)}>← Back</button>
      <h1 className="text-3xl font-bold text-gray-800 mt-2 mb-6 border-b-2 pb-2">My Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Personal Information */}
        <div className="p-4 border rounded-md bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">Personal Information</h2>
          <p className="mb-2"><strong className="text-gray-600 mr-20">Name:</strong> {employeeProfile.name}</p>
          <p className="mb-2"><strong className="text-gray-600 mr-20">Email:</strong> {employeeProfile.email}</p>
          <p className="mb-2"><strong className="text-gray-600 mr-7">Employee ID:</strong> {employeeProfile._id}</p>
          <p className="mb-2"><strong className="text-gray-600 mr-8">Department:</strong> {employeeProfile.department}</p>
          <p className="mb-2"><strong className="text-gray-600 mr-16">Position:</strong> {employeeProfile.position}</p>
          <p className="mb-2"><strong className="text-gray-600 mr-4">Date of Joining:</strong> {new Date(employeeProfile.dateOfJoining).toLocaleDateString()}</p>
        </div>

        {/* Contact Information */}
        <div className="p-4 border rounded-md bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">Contact Information</h2>
          <p className="mb-2"><strong className="text-gray-600 mr-7">Phone:</strong> {employeeProfile.phone || 'N/A'}</p>
          <p className="mb-2"><strong className="text-gray-600 mr-4">Address:</strong> {employeeProfile.address || 'N/A'}</p>
        </div>

        {/* Leave Information */}
        <div className="p-4 border rounded-md bg-gray-50 col-span-1 md:col-span-2">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">Leave Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <p className="mb-2"><strong className="text-gray-600">Total Leaves:</strong> {employeeProfile.totalLeaves}</p>
              <p className="mb-2"><strong className="text-gray-600">Leaves Taken:</strong> {employeeProfile.leavesTaken}</p>
              <p className="mb-2"><strong className="text-gray-600">Remaining Leaves:</strong> {employeeProfile.remainingLeaves}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfilePage;