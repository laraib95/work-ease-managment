// Components/DepartmentManagement.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
    getAllDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    clearErrors,
    clearMessage
} from '../Redux/DepartmentSlice'; 
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa'; 

// A simple Modal/Popup for forms and messages (reusable from EmployeeManagement)
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

// Form for Adding/Editing Department
const DepartmentForm = ({ initialData = {}, onSubmit, onCancel, type = 'add' }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        ...initialData,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">{type === 'add' ? 'Add New Department' : 'Edit Department'}</h2>
            <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">Name</label>
                <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
            </div>
            <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">Description</label>
                <textarea
                    name="description"
                    id="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                ></textarea>
            </div>

            <div className="flex justify-end gap-4 mt-6">
                <button type="button" onClick={onCancel} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200">
                    Cancel
                </button>
                <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200">
                    {type === 'add' ? 'Add Department' : 'Update Department'}
                </button>
            </div>
        </form>
    );
};


const DepartmentManagement = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { departments, loading, error, message } = useSelector((state) => state.department); 

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEdit] = useState(false); 
    const [currentDepartment, setCurrentDepartment] = useState(null);

    // Fetch departments on component mount
    useEffect(() => {
        dispatch(getAllDepartments());
    }, [dispatch]);

    // Handle success/error messages
    useEffect(() => {
        if (message) {
            alert(message); // You can replace this with a more sophisticated toast notification
            dispatch(clearMessage());
        }
        if (error) {
            alert(`Error: ${error}`);
            dispatch(clearErrors());
        }
    }, [message, error, dispatch]);


    // CRUD Handlers
    const handleAddDepartment = (departmentData) => {
        dispatch(createDepartment(departmentData));
        setShowAddModal(false);
    };

    const handleEditClick = (department) => {
        setCurrentDepartment(department);
        setShowEdit(true); // Open edit modal
    };

    const handleUpdateDepartment = (departmentData) => {
        dispatch(updateDepartment({ id: currentDepartment._id, departmentData }));
        setShowEdit(false); // Close edit modal
        setCurrentDepartment(null);
    };

    const handleDeleteDepartment = (id) => {
        if (window.confirm('Are you sure you want to delete this department?')) {
            dispatch(deleteDepartment(id));
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <button className={`m-2 p-2 w-35 text-center border border-gray-700 border-3 hover:bg-black hover:text-white`}
            onClick={() => navigate(-1)}>← Back</button>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Department Management</h2>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-md flex items-center transition duration-300"
                >
                    <FaPlus className="mr-2" /> Add New Department
                </button>
            </div>

            {loading ? (
                <p className="text-center text-lg text-gray-600">Loading departments...</p>
            ) : departments.length === 0 ? (
                <p className="text-center text-lg text-gray-600">No departments found. Add one!</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Name</th>
                                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Description</th>
                                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Created At</th>
                                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {departments.map((department) => (
                                <tr key={department._id} className="hover:bg-gray-50">
                                    <td className="py-3 px-4 border-b text-sm text-gray-800">{department.name}</td>
                                    <td className="py-3 px-4 border-b text-sm text-gray-800">{department.description || 'N/A'}</td>
                                    <td className="py-3 px-4 border-b text-sm text-gray-800">
                                        {new Date(department.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="py-3 px-4 border-b">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEditClick(department)}
                                                className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-100 transition duration-200"
                                                title="Edit"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteDepartment(department._id)}
                                                className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-100 transition duration-200"
                                                title="Delete"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add Department Modal */}
            <Modal show={showAddModal} onClose={() => setShowAddModal(false)}>
                <DepartmentForm onSubmit={handleAddDepartment} onCancel={() => setShowAddModal(false)} type="add" />
            </Modal>

            {/* Edit Department Modal */}
            <Modal show={showEditModal} onClose={() => setShowEdit(false)}>
                <DepartmentForm initialData={currentDepartment} onSubmit={handleUpdateDepartment} onCancel={() => setShowEdit(false)} type="edit" />
            </Modal>
        </div>
    );
};

export default DepartmentManagement;