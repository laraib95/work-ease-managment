// Components/LeaveApprovalManagement.jsx

import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    getAllLeaveRequests,
    updateLeaveStatus,
    clearErrors,
    clearMessage,
} from '../Redux/LeaveSlice'; 
import { FaCheckCircle, FaTimesCircle, FaEye } from 'react-icons/fa'; 

// Reusable Modal component 
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

const LeaveApprovalManagement = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { leaves, loading, error, message } = useSelector((state) => state.leave);

    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedLeave, setSelectedLeave] = useState(null);
    const [adminComments, setAdminComments] = useState('');

    // Fetch all leave requests on component mount
    useEffect(() => {
        dispatch(getAllLeaveRequests());
    }, [dispatch]);

    // Handle messages and errors from Redux state
    useEffect(() => {
        if (message) {
            alert(message); 
            dispatch(clearMessage());
            // After status update, re-fetch all leaves to ensure data consistency
            dispatch(getAllLeaveRequests());
        }
        if (error) {
            alert(`Error: ${error}`); 
            dispatch(clearErrors());
        }
    }, [message, error, dispatch]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const handleViewDetails = (leave) => {
        setSelectedLeave(leave);
        setAdminComments(leave.adminComments || ''); // Pre-fill with existing comments
        setShowDetailsModal(true);
    };

    const handleStatusUpdate = (status) => {
        if (selectedLeave && window.confirm(`Are you sure you want to ${status.toLowerCase()} this leave request?`)) {
            dispatch(updateLeaveStatus({
                id: selectedLeave._id,
                status: status,
                adminComments: adminComments,
            }));
            setShowDetailsModal(false); // Close modal after action
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <button className={`m-2 p-2 w-35 text-center border border-gray-700 border-3 hover:bg-black hover:text-white`}
            onClick={() => navigate(-1)}>← Back</button>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Leave Request Approvals</h2>

            {loading ? (
                <p className="text-center text-lg text-gray-600">Loading leave requests...</p>
            ) : leaves && leaves.length === 0 ? (
                <p className="text-center text-lg text-gray-600">No leave requests found.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Employee</th>
                                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Type</th>
                                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Period</th>
                                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Duration</th> {/* Added Duration column */}
                                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Reason</th>
                                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Status</th>
                                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Applied At</th>
                                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(leaves || []).map((leave) => (
                                <tr key={leave._id} className="hover:bg-gray-50">
                                    <td className="py-3 px-4 border-b text-sm text-gray-800">
                                        {leave.employee ? leave.employee.name : 'N/A'}
                                    </td>
                                    <td className="py-3 px-4 border-b text-sm text-gray-800">{leave.leaveType}</td>
                                    <td className="py-3 px-4 border-b text-sm text-gray-800">
                                        {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                                    </td>
                                    <td className="py-3 px-4 border-b text-sm text-gray-800">
                                        {leave.duration} Days {/* Display duration */}
                                    </td>
                                    <td className="py-3 px-4 border-b text-sm text-gray-800 truncate max-w-xs">
                                        {leave.reason.length > 50 ? `${leave.reason.substring(0, 50)}...` : leave.reason}
                                    </td>
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
                                        <button
                                            onClick={() => handleViewDetails(leave)}
                                            className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-100 transition duration-200"
                                            title="View Details"
                                        >
                                            <FaEye />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Leave Details and Approval Modal */}
            <Modal show={showDetailsModal} onClose={() => setShowDetailsModal(false)}>
                {selectedLeave && (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold mb-4 text-gray-800">Leave Request Details</h2>
                        <p><strong>Employee:</strong> {selectedLeave.employee ? selectedLeave.employee.name : 'N/A'}</p>
                        {selectedLeave.employee && ( // Ensure employee data is available
                            <div className="bg-gray-100 p-3 rounded-md border border-gray-200">
                                <h3 className="text-md font-semibold mb-2">Employee Leave Balances:</h3>
                                <p><strong>Total Leaves:</strong> {selectedLeave.employee.totalLeaves}</p>
                                <p><strong>Leaves Taken:</strong> {selectedLeave.employee.leavesTaken}</p>
                                <p><strong>Remaining Leaves:</strong> {selectedLeave.employee.remainingLeaves}</p>
                            </div>
                        )}
                        <p><strong>Type:</strong> {selectedLeave.leaveType}</p>
                        <p><strong>Period:</strong> {formatDate(selectedLeave.startDate)} to {formatDate(selectedLeave.endDate)} ({selectedLeave.duration} Days)</p>
                        <p><strong>Reason:</strong> {selectedLeave.reason}</p>
                        <p><strong>Status:</strong> <span className={`font-semibold
                                ${selectedLeave.status === 'pending' ? 'text-yellow-800' : ''}
                                ${selectedLeave.status === 'approved' ? 'text-green-800' : ''}
                                ${selectedLeave.status === 'rejected' ? 'text-red-800' : ''}
                                ${selectedLeave.status === 'cancelled' ? 'text-gray-800' : ''}
                            `}>{selectedLeave.status}</span></p>
                        {selectedLeave.approvedBy && (
                            <p><strong>Approved/Rejected By:</strong> {selectedLeave.approvedBy.name}</p>
                        )}
                        {selectedLeave.adminComments && (
                            <p><strong>Admin Comments:</strong> {selectedLeave.adminComments}</p>
                        )}

                        {selectedLeave.status === 'pending' && (
                            <div className="mt-6 border-t pt-4">
                                <h3 className="text-xl font-bold mb-3 text-gray-700">Update Status</h3>
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="adminComments">Admin Comments (Optional)</label>
                                    <textarea
                                        id="adminComments"
                                        value={adminComments}
                                        onChange={(e) => setAdminComments(e.target.value)}
                                        rows="3"
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        placeholder="Add comments for approval or rejection"
                                    ></textarea>
                                </div>
                                <div className="flex justify-end gap-4 mt-4">
                                    <button
                                        onClick={() => handleStatusUpdate('approved')}
                                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-md flex items-center transition duration-300"
                                    >
                                        <FaCheckCircle className="mr-2" /> Approve
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate('rejected')}
                                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-md flex items-center transition duration-300"
                                    >
                                        <FaTimesCircle className="mr-2" /> Reject
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};
export default LeaveApprovalManagement;