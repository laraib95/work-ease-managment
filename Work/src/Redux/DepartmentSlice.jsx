// Redux/DepartmentSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE_URL = 'http://localhost:5001/api/v1'; 

// Helper to get token from localStorage
const getToken = () => {
    return localStorage.getItem('userToken');
};

// Async Thunks for Department Operations
// Get all departments
export const getAllDepartments = createAsyncThunk(
    'department/getAllDepartments',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/departments`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData.message || 'Failed to fetch departments');
            }

            const data = await response.json();
            return data.departments;
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

// Create a new department (Admin Only)
export const createDepartment = createAsyncThunk(
    'department/createDepartment',
    async (departmentData, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/departments/new`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getToken()}`, // Requires admin token
                },
                body: JSON.stringify(departmentData), // Stringify the body for fetch
            });

            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData.message || 'Failed to create department');
            }

            const data = await response.json();
            return data.department;
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

// Update a department (Admin Only)
export const updateDepartment = createAsyncThunk(
    'department/updateDepartment',
    async ({ id, departmentData }, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/departments/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getToken()}`, // Requires admin token
                },
                body: JSON.stringify(departmentData), // Stringify the body for fetch
            });

            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData.message || 'Failed to update department');
            }

            const data = await response.json();
            return data.department;
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

// Delete a department (Admin Only)
export const deleteDepartment = createAsyncThunk(
    'department/deleteDepartment',
    async (id, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/departments/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${getToken()}`, // Requires admin token
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData.message || 'Failed to delete department');
            }
            return id; // Return the ID of the deleted department to update state
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

// Clear Errors and Messages
export const clearErrors = createAsyncThunk(
    'department/clearErrors',
    async () => {},
    {
        fulfilled: (state) => {
            state.error = null;
        }
    }
);

export const clearMessage = createAsyncThunk(
    'department/clearMessage',
    async () => {},
    {
        fulfilled: (state) => {
            state.message = null;
        }
    }
);


const departmentSlice = createSlice({
    name: 'department',
    initialState: {
        departments: [],
        loading: false,
        error: null,
        message: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Get All Departments
            .addCase(getAllDepartments.pending, (state) => {
                state.loading = true;
            })
            .addCase(getAllDepartments.fulfilled, (state, action) => {
                state.loading = false;
                state.departments = action.payload;
            })
            .addCase(getAllDepartments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Create Department
            .addCase(createDepartment.pending, (state) => {
                state.loading = true;
            })
            .addCase(createDepartment.fulfilled, (state, action) => {
                state.loading = false;
                state.departments.push(action.payload); // Add new department to the list
                state.message = "Department created successfully!";
            })
            .addCase(createDepartment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Update Department
            .addCase(updateDepartment.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateDepartment.fulfilled, (state, action) => {
                state.loading = false;
                state.departments = state.departments.map((dep) =>
                    dep._id === action.payload._id ? action.payload : dep
                );
                state.message = "Department updated successfully!";
            })
            .addCase(updateDepartment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Delete Department
            .addCase(deleteDepartment.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteDepartment.fulfilled, (state, action) => {
                state.loading = false;
                state.departments = state.departments.filter((dep) => dep._id !== action.payload);
                state.message = "Department deleted successfully!";
            })
            .addCase(deleteDepartment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Clear Errors and Messages (special handling for non-dispatching thunks)
            .addCase(clearErrors.fulfilled, (state) => {
                state.error = null;
            })
            .addCase(clearMessage.fulfilled, (state) => {
                state.message = null;
            });
    },
});

export default departmentSlice.reducer;