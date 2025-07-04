import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// backend API base URL
const API_BASE_URL = 'http://localhost:5001/api/v1';

// Helper function to handle fetch responses and errors
const handleFetchResponse = async (response) => {
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
    }
    return data;
};

// Helper function to get token from localStorage
const getToken = () => {
    return localStorage.getItem('userToken');
};

// Async Thunks for API Calls
// Get All Employees (Admin only)
export const getAllEmployees = createAsyncThunk(
    'employees/getAll',
    async (_, { rejectWithValue, getState }) => {
        try {
            const { auth } = getState(); // Access auth state to get the token
            const token = auth.token;

            const response = await fetch(`${API_BASE_URL}/admin/employees`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`, 
                },
            });

            const data = await handleFetchResponse(response);
            return data.employees; // As API returns { success, count, employees }
        } catch (error) {
            return rejectWithValue(error.message); 
        }
    }
);

// Create New Employee (Admin only)
export const createEmployee = createAsyncThunk(
    'employees/create',
    async (employeeData, { rejectWithValue, getState }) => {
        try {
            const { auth } = getState();
            const token = auth.token;

            const response = await fetch(`${API_BASE_URL}/admin/employees/new`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(employeeData), 
            });

            const data = await handleFetchResponse(response);
            return data.employee; // As API returns { success, message, employee }
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Update Employee (Admin only)
export const updateEmployee = createAsyncThunk(
    'employees/update',
    async ({ id, employeeData }, { rejectWithValue, getState }) => {
        try {
            const { auth } = getState();
            const token = auth.token;

            const response = await fetch(`${API_BASE_URL}/admin/employees/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(employeeData),
            });

            const data = await handleFetchResponse(response);
            return data.employee; 
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Delete Employee (Admin only)
export const deleteEmployee = createAsyncThunk(
    'employees/delete',
    async (id, { rejectWithValue, getState }) => {
        try {
            const { auth } = getState();
            const token = auth.token;

            const response = await fetch(`${API_BASE_URL}/admin/employees/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            await handleFetchResponse(response); 
            return id; // Return the ID of the deleted employee for state update
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);
// Employee's Own Profile 
export const getMyProfile = createAsyncThunk(
    'me/employeeProfile',
    async (_, { rejectWithValue }) => {
        try {
            const token = getToken();
            if (!token) {
                return rejectWithValue('Authentication token not found. Please log in.');
            }
            const response = await fetch(`${API_BASE_URL}/me/employeeProfile`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await handleFetchResponse(response);
            // The backend returns { success: true, employeeProfile: {...} }
            return data.employeeProfile;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);
// Admin: Update Employee Leave Balance
export const updateEmployeeLeaveBalance = createAsyncThunk(
    'employees/updateLeaveBalance',
    async ({ id, leaveBalanceData }, { rejectWithValue }) => {
        try {
            const token = getToken();
            if (!token) {
                return rejectWithValue('Authentication token not found. Please log in.');
            }

            const response = await fetch(`${API_BASE_URL}/admin/employees/${id}/leave-balance`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(leaveBalanceData),
            });

            const data = await handleFetchResponse(response);
            return data.employee;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);
const employeeSlice = createSlice({
    name: 'employee',
    initialState: {
        employees: [],
        employeeProfile: null,
        loading: false,
        error: null,
        message: null, // For success messages like 'Employee created successfully'
    },
    reducers: {
        clearErrors: (state) => {
            state.error = null;
        },
        clearMessage: (state) => {
            state.message = null;
        },
        clearEmployeeProfile: (state) => {
            state.employeeProfile = null;
            state.loading = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Get All Employees
            .addCase(getAllEmployees.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAllEmployees.fulfilled, (state, action) => {
                state.loading = false;
                state.employees = action.payload;
            })
            .addCase(getAllEmployees.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Create Employee
            .addCase(createEmployee.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.message = null;
            })
            .addCase(createEmployee.fulfilled, (state, action) => {
                state.loading = false;
                state.employees.push(action.payload); // Add new employee to the list
                state.message = "Employee created successfully!"; // Set success message
            })
            .addCase(createEmployee.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Update Employee
            .addCase(updateEmployee.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.message = null;
            })
            .addCase(updateEmployee.fulfilled, (state, action) => {
                state.loading = false;
                // Find and replace the updated employee in the array
                state.employees = state.employees.map((emp) =>
                    emp._id === action.payload._id ? action.payload : emp
                );
                state.message = "Employee updated successfully!";
            })
            .addCase(updateEmployee.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Delete Employee
            .addCase(deleteEmployee.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.message = null;
            })
            .addCase(deleteEmployee.fulfilled, (state, action) => {
                state.loading = false;
                // Remove the deleted employee from the list
                state.employees = state.employees.filter((emp) => emp._id !== action.payload);
                state.message = "Employee deleted successfully!";
            })
            .addCase(deleteEmployee.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            //update Employee Leave Balance
            .addCase(updateEmployeeLeaveBalance.pending, (state,action)=> {
                state.loading = true;
                state.error = null;
                state.message = null;
            })
            .addCase(updateEmployeeLeaveBalance.fulfilled, (state, action) => {
                state.loading = false;
                state.message = "Employee leave balance updated successfully!";
                state.employees = state.employees.map((emp) =>
                    emp._id === action.payload._id ? action.payload : emp
                );
                // If the updated employee is the currently viewed profile, update it too
                if (state.employeeProfile && state.employeeProfile._id === action.payload._id) {
                    state.employeeProfile = action.payload;
                }
            })
            .addCase(updateEmployeeLeaveBalance.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            
            // Get My Profile
            .addCase(getMyProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.employeeProfile = null; // Clear previous profile when fetching new one
            })
            .addCase(getMyProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.employeeProfile = action.payload; // Store the authenticated employee's profile
                state.error = null;
            })
            .addCase(getMyProfile.rejected, (state, action) => {
                state.loading = false;
                state.employeeProfile = null; // Clear profile on error
                state.error = action.payload;
            })


    },
});

export const { clearErrors, clearMessage, clearEmployeeProfile } = employeeSlice.actions;
export default employeeSlice.reducer;