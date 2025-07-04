import React, { useState } from 'react';
import EmployeeManagement from './EmployeeManagment';
import DepartmentManagement from './DepartmentManagement';
import LeaveApprovalManagement from './LeaveApprovalManagement';

import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../Redux/AuthSlice';
import { useMediaQuery } from 'react-responsive';


const AdminDashboard = ({ userName }) => {
    const [activeSection, setActiveSection] = useState('employeeManagement');
    const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
    }
    return (
        <div className="flex h-screen bg-[#595656] bg-gradient-radial from-[#595656] to-[#E62121] font-inter">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-800 text-white flex flex-col p-4 shadow-lg">
                <div className="text-2xl font-bold mb-8 text-center text-indigo-300">
                    HR Admin Panel
                </div>
                <nav className="flex-grow">
                    <ul>
                        <li className="mb-2">
                            <button
                                onClick={() => setActiveSection('employeeManagement')}
                                className={`w-full text-left py-2 px-4 rounded-lg transition duration-200 ${activeSection === 'employeeManagement' ? 'bg-indigo-700 text-white' : 'hover:bg-gray-700 text-gray-300'
                                    }`}
                            >
                                Employee Management
                            </button>
                        </li>
                        <li className="mb-2">
                            <button
                                onClick={() => setActiveSection('departmentManagement')}
                                className={`w-full text-left py-2 px-4 rounded-lg transition duration-200 ${activeSection === 'departmentManagement' ? 'bg-indigo-700 text-white' : 'hover:bg-gray-700 text-gray-300'
                                    }`}
                            >
                                Department Management
                            </button>
                        </li>
                        <li className="mb-2">
                            <button
                                onClick={() => setActiveSection('leaveApprovals')} // New section name
                                className={`w-full text-left py-2 px-4 rounded-lg transition duration-200 ${activeSection === 'leaveApprovals' ? 'bg-indigo-700 text-white' : 'hover:bg-gray-700 text-gray-300'
                                    }`}
                            >
                                Leave Approvals
                            </button>
                        </li>
                        <li className="mb-2">
                            <button
                                onClick={() => setActiveSection('reports')}
                                className={`w-full text-left py-2 px-4 rounded-lg transition duration-200 ${activeSection === 'reports' ? 'bg-indigo-700 text-white' : 'hover:bg-gray-700 text-gray-300'
                                    }`}
                            >
                                Reports & Analytics
                            </button>
                        </li>
                    </ul>
                </nav>
                <div className="mt-auto pt-4 border-t border-gray-700">
                    <p className="text-sm text-gray-400 mb-2">Logged in as: <span className="font-semibold">{userName} (Admin)</span></p>
                    <button
                        onClick={handleLogout}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300"
                    >
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="bg-red-600  p-6 rounded-lg shadow-md mb-8">
                    <h1 className="text-4xl font-extrabold text-white">Admin Dashboard</h1>
                    <p className="text-white">Welcome, {userName}! Manage your HR system here.</p>
                </header>

                {/* Content Area based on activeSection */}
                <div>
                    {activeSection === 'employeeManagement' && <EmployeeManagement />}
                    {activeSection === 'departmentManagement' && <DepartmentManagement />}
                    {activeSection === 'leaveApprovals' && <LeaveApprovalManagement />}
                    {activeSection === 'reports' && (
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-2xl font-bold text-gray-800">Reports & Analytics</h2>
                            <p className="text-gray-600">Coming Soon: Various HR reports and analytics.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;