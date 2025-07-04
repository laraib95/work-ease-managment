import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getAllEmployees, createEmployee, updateEmployee, deleteEmployee, clearErrors, clearMessage } from '../Redux/EmployeeSlice'; // Adjust path
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa'; 

// A simple Modal/Popup for forms and messages
const Modal = ({ show, onClose, children }) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-2xl w-full mx-4 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl font-bold">
                    &times;
                </button>
                {children}
            </div>
        </div>
    );
};

// Form for Adding/Editing Employee
const EmployeeForm = ({ initialData = {}, onSubmit, onCancel, type = 'add' }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phonenumber: '',
        photo: '',
        position: '',
        department: '',
        dateOfJoining: '',
        password: '',
        salary: '',
        status: 'active', // Default status
        ...initialData,
    });

    // Format date for input type="date" if it's an initialDate object
    useEffect(() => {
        if (initialData.dateOfJoining) {
            const date = new Date(initialData.dateOfJoining);
            setFormData(prev => ({
                ...prev,
                dateOfJoining: date.toISOString().split('T')[0] // Format to YYYY-MM-DD
            }));
        }
    }, [initialData]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <h2 className="col-span-full text-2xl font-bold mb-4 text-gray-800">{type === 'add' ? 'Add New Employee' : 'Edit Employee'}</h2>
            <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
            <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
            <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
            <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Phone Number</label>
                <input type="text" name="phonenumber" value={formData.phonenumber} onChange={handleChange} required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
            <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Photo URL</label>
                <input type="text" name="photo" value={formData.photo} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
            <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Position</label>
                <input type="text" name="position" value={formData.position} onChange={handleChange} required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
            <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Department</label>
                <input type="text" name="department" value={formData.department} onChange={handleChange} required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
            <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Date of Joining</label>
                <input type="date" name="dateOfJoining" value={formData.dateOfJoining} onChange={handleChange} required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
            <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Salary</label>
                <input type="number" name="salary" value={formData.salary} onChange={handleChange} required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
            <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Status</label>
                <select name="status" value={formData.status} onChange={handleChange} required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                    <option value="active">Active</option>
                    <option value="on leave">On Leave</option>
                    <option value="terminated">Terminated</option>
                    <option value="probation">Probation</option>
                </select>
            </div>
            
            <div className="col-span-full flex justify-end gap-4 mt-6">
                <button type="button" onClick={onCancel} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200">
                    Cancel
                </button>
                <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200">
                    {type === 'add' ? 'Add Employee' : 'Update Employee'}
                </button>
            </div>
        </form>
    );
};


const EmployeeManagement = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { employees, loading, error, message } = useSelector((state) => state.employee);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentEmployee, setCurrentEmployee] = useState(null);

    // Fetch employees on component mount
    useEffect(() => {
        dispatch(getAllEmployees());
    }, [dispatch]);

    // Handle success/error messages
    useEffect(() => {
        if (message) {
            // You can use a toast library here instead of alert
            alert(message);
            dispatch(clearMessage());
        }
        if (error) {
            alert(`Error: ${error}`);
            dispatch(clearErrors());
        }
    }, [message, error, dispatch]);


    // CRUD Handlers
    const handleAddEmployee = (employeeData) => {
        dispatch(createEmployee(employeeData));
        setShowAddModal(false);
    };

    const handleEditClick = (employee) => {
        setCurrentEmployee(employee);
        setShowEditModal(true);
    };

    const handleUpdateEmployee = (employeeData) => {
        dispatch(updateEmployee({ id: currentEmployee._id, employeeData }));
        setShowEditModal(false);
        setCurrentEmployee(null);
    };

    const handleDeleteEmployee = (id) => {
        if (window.confirm('Are you sure you want to delete this employee?')) {
            dispatch(deleteEmployee(id));
        }
    };

    return (
        <div className="p-6 bg-[#FEFEFE] rounded-lg shadow-md">
            <button className={`m-2 p-2 w-35 text-center border border-gray-700 border-3 hover:bg-black hover:text-white`}
            onClick={() => navigate(-1)}>← Back</button>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Employee Management</h2>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-md flex items-center transition duration-300"
                >
                    <FaPlus className="mr-2" /> Add New Employee
                </button>
            </div>

            {loading ? (
                <p className="text-center text-lg text-gray-600">Loading employees...</p>
            ) : employees.length === 0 ? (
                <p className="text-center text-lg text-gray-600">No employees found. Add one!</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Photo</th>
                                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Name</th>
                                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Email</th>
                                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Position</th>
                                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Department</th>
                                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Status</th>
                                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map((employee) => (
                                <tr key={employee._id} className="hover:bg-gray-50">
                                    <td className="py-3 px-4 border-b">
                                        <img src={employee.photo} alt={employee.name} className="w-10 h-10 rounded-full object-cover" />
                                    </td>
                                    <td className="py-3 px-4 border-b text-sm text-gray-800">{employee.name}</td>
                                    <td className="py-3 px-4 border-b text-sm text-gray-800">{employee.email}</td>
                                    <td className="py-3 px-4 border-b text-sm text-gray-800">{employee.position}</td>
                                    <td className="py-3 px-4 border-b text-sm text-gray-800">{employee.department}</td>
                                    <td className="py-3 px-4 border-b">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                            ${employee.status === 'active' ? 'bg-green-100 text-green-800' :
                                              employee.status === 'on leave' ? 'bg-yellow-100 text-yellow-800' :
                                              employee.status === 'terminated' ? 'bg-red-100 text-red-800' :
                                              'bg-blue-100 text-blue-800'}`
                                        }>
                                            {employee.status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 border-b">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEditClick(employee)}
                                                className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-100 transition duration-200"
                                                title="Edit"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteEmployee(employee._id)}
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

            {/* Add Employee Modal */}
            <Modal show={showAddModal} onClose={() => setShowAddModal(false)}>
                <EmployeeForm onSubmit={handleAddEmployee} onCancel={() => setShowAddModal(false)} type="add" />
            </Modal>

            {/* Edit Employee Modal */}
            <Modal show={showEditModal} onClose={() => setShowEditModal(false)}>
                <EmployeeForm initialData={currentEmployee} onSubmit={handleUpdateEmployee} onCancel={() => setShowEditModal(false)} type="edit" />
            </Modal>
        </div>
    );
};

export default EmployeeManagement;