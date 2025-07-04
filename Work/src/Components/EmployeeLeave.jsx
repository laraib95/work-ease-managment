// Components/EmployeeLeave.jsx
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    applyForLeave,
    getEmployeeLeaveHistory,
    cancelLeave,
    clearErrors,
    clearMessage,
} from '../Redux/LeaveSlice';
import { getMyProfile } from '../Redux/EmployeeSlice'; // Import getMyProfile
import { FaPlus, FaTimesCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Modal = ({ show, onClose, children }) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-lg w-full mx-4 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl font-bold">
                    &times;
                </button>
                {children}
            </div>
        </div>
    );
};

const EmployeeLeave = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { leaves, loading, error, message } = useSelector((state) => state.leave);
    // Access employeeProfile for leave balances
    const { employeeProfile } = useSelector((state) => state.employee); 

    const [showApplyModal, setShowApplyModal] = useState(false);
    const [formData, setFormData] = useState({
        leaveType: 'casual leave', // Default value
        startDate: '',
        endDate: '',
        reason: '',
    });

    // Fetch employee's leave history AND their profile on component mount
    useEffect(() => {
        dispatch(getEmployeeLeaveHistory());
        dispatch(getMyProfile()); // Fetch employee's profile to get leave balances
    }, [dispatch]);

    // Handle messages and errors from Redux state
    useEffect(() => {
        if (message) {
            alert(message); 
            dispatch(clearMessage());
            // After any successful leave action (apply/cancel), re-fetch employee profile
            // to update leave balances displayed on the page.
            dispatch(getMyProfile());
            dispatch(getEmployeeLeaveHistory()); // Also re-fetch history
        }
        if (error) {
            alert(`Error: ${error}`);
            dispatch(clearErrors());
        }
    }, [message, error, dispatch]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleApplySubmit = (e) => {
        e.preventDefault();
        // Basic validation
        if (new Date(formData.startDate) > new Date(formData.endDate)) {
            alert('Start date cannot be after end date.');
            return;
        }
        dispatch(applyForLeave(formData));
        setShowApplyModal(false);
        setFormData({ // Reset form
            leaveType: 'casual leave',
            startDate: '',
            endDate: '',
            reason: '',
        });
    };

    const handleCancelLeave = (id) => {
        if (window.confirm('Are you sure you want to cancel this leave request?')) {
            dispatch(cancelLeave(id));
        }
    };

    // Helper to format dates for display
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div className="p-6 bg-gradient-to-b from-[#e4d023] to-[#f0af58] to-60% rounded-lg shadow-md">
            <button className={`m-2 p-2 w-35 text-center border border-gray-700 border-3 hover:bg-black hover:text-white`}
            onClick={() => navigate(-1)}>← Back</button>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">My Leave Requests</h2>
                <button
                    onClick={() => setShowApplyModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md flex items-center transition duration-300"
                >
                    <FaPlus className="mr-2" /> Apply for Leave
                </button>
            </div>

            {/* NEW: Display Employee Leave Balances */}
            {employeeProfile && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-center">
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-700">Total Leaves</h3>
                        <p className="text-3xl font-bold text-blue-600">{employeeProfile.totalLeaves}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-700">Leaves Taken</h3>
                        <p className="text-3xl font-bold text-red-600">{employeeProfile.leavesTaken}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-700">Remaining Leaves</h3>
                        <p className="text-3xl font-bold text-green-600">{employeeProfile.remainingLeaves}</p>
                    </div>
                </div>
            )}
            {/* END NEW */}

            {loading ? (
                <p className="text-center text-lg text-gray-600">Loading leave history...</p>
            ) : leaves.length === 0 ? (
                <p className="text-center text-lg text-gray-600">No leave requests found. Apply for one!</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Type</th>
                                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Start Date</th>
                                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">End Date</th>
                                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Duration</th> {/* Added Duration column */}
                                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Reason</th>
                                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Status</th>
                                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Applied At</th>
                                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaves.map((leave) => (
                                <tr key={leave._id} className="hover:bg-gray-50">
                                    <td className="py-3 px-4 border-b text-sm text-gray-800">{leave.leaveType}</td>
                                    <td className="py-3 px-4 border-b text-sm text-gray-800">{formatDate(leave.startDate)}</td>
                                    <td className="py-3 px-4 border-b text-sm text-gray-800">{formatDate(leave.endDate)}</td>
                                    <td className="py-3 px-4 border-b text-sm text-gray-800">{leave.duration} Days</td> {/* Display duration */}
                                    <td className="py-3 px-4 border-b text-sm text-gray-800">{leave.reason}</td>
                                    <td className="py-3 px-4 border-b text-sm text-gray-800">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                            ${leave.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                                            ${leave.status === 'approved' ? 'bg-green-100 text-green-800' : ''}
                                            ${leave.status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
                                            ${leave.status === 'cancelled' ? 'bg-gray-100 text-gray-800' : ''}
                                        `}>
                                            {leave.status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 border-b text-sm text-gray-800">{formatDate(leave.appliedAt)}</td>
                                    <td className="py-3 px-4 border-b text-sm text-gray-800">
                                        {leave.status === 'pending' && (
                                            <button
                                                onClick={() => handleCancelLeave(leave._id)}
                                                className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-100 transition duration-200"
                                                title="Cancel Leave"
                                            >
                                                <FaTimesCircle />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Apply Leave Modal */}
            <Modal show={showApplyModal} onClose={() => setShowApplyModal(false)}>
                <form onSubmit={handleApplySubmit} className="space-y-4">
                    <h2 className="text-2xl font-bold mb-4 text-gray-800">Apply for Leave</h2>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="leaveType">Leave Type</label>
                        <select
                            name="leaveType"
                            id="leaveType"
                            value={formData.leaveType}
                            onChange={handleChange}
                            required
                            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        >
                            <option value="casual leave">Casual Leave</option>
                            <option value="sick leave">Sick Leave</option>
                            <option value="annual leave">Annual Leave</option>
                            <option value="maternity leave">Maternity Leave</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="startDate">Start Date</label>
                        <input
                            type="date"
                            name="startDate"
                            id="startDate"
                            value={formData.startDate}
                            onChange={handleChange}
                            required
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="endDate">End Date</label>
                        <input
                            type="date"
                            name="endDate"
                            id="endDate"
                            value={formData.endDate}
                            onChange={handleChange}
                            required
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="reason">Reason</label>
                        <textarea
                            name="reason"
                            id="reason"
                            value={formData.reason}
                            onChange={handleChange}
                            rows="4"
                            required
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        ></textarea>
                    </div>

                    <div className="flex justify-end gap-4 mt-6">
                        <button
                            type="button"
                            onClick={() => setShowApplyModal(false)}
                            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200"
                        >
                            Submit Application
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
export default EmployeeLeave;