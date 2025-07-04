// Redux/LeaveSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
const API_BASE_URL = 'http://localhost:5001/api/v1';

// Helper to get token from localStorage
const getToken = () => {
    return localStorage.getItem('userToken'); 
};

// Async Thunks for Leave Operations
// Employee: Apply for a new leave
export const applyForLeave = createAsyncThunk(
    'leave/applyForLeave',
    async (leaveData, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/leave/apply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getToken()}`,
                },
                body: JSON.stringify(leaveData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData.message || 'Failed to apply for leave');
            }

            const data = await response.json();
            return data.leaveRequest;
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

// Employee: Get their own leave history
export const getEmployeeLeaveHistory = createAsyncThunk(
    'leave/getEmployeeLeaveHistory',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/leave/my`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData.message || 'Failed to fetch leave history');
            }

            const data = await response.json();
            return data.leaveRequests;
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

// Employee: Cancel their own pending leave request
export const cancelLeave = createAsyncThunk(
    'leave/cancelLeave',
    async (id, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/leave/cancel/${id}`, {
                method: 'PUT', // It's a PUT because we're changing status
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData.message || 'Failed to cancel leave');
            }

            // No data expected back for a cancel success, but can parse if backend sends a message
            const data = await response.json(); // Backend sends leaveRequest object
            return data.leaveRequest; // Return updated leave request
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

// Admin: Get all leave requests
export const getAllLeaveRequests = createAsyncThunk(
    'leave/getAllLeaveRequests',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/leave/all`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData.message || 'Failed to fetch all leave requests');
            }

            const data = await response.json();
            return data.leaves;
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

// Admin: Get a single leave request
export const getSingleLeaveRequest = createAsyncThunk(
    'leave/getSingleLeaveRequest',
    async (id, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/leave/${id}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData.message || 'Failed to fetch single leave request');
            }

            const data = await response.json();
            return data.leaveRequest;
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

// Admin: Update leave status (Approve/Reject)
export const updateLeaveStatus = createAsyncThunk(
    'leave/updateLeaveStatus',
    async ({ id, status, adminComments }, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/leave/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getToken()}`,
                },
                body: JSON.stringify({ status, adminComments }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData.message || 'Failed to update leave status');
            }

            const data = await response.json();
            return data.leaveRequest; // Return the updated leave request
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);


// Clear Errors and Messages
export const clearErrors = createAsyncThunk(
    'leave/clearErrors',
    async () => {},
    {
        fulfilled: (state) => {
            state.error = null;
        }
    }
);

export const clearMessage = createAsyncThunk(
    'leave/clearMessage',
    async () => {},
    {
        fulfilled: (state) => {
            state.message = null;
        }
    }
);


const leaveSlice = createSlice({
    name: 'leave',
    initialState: {
        leaves: [], // Array for all leaves (admin view) or employee's history
        singleLeave: null, // For viewing a single leave request detail
        loading: false,
        error: null,
        message: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Apply For Leave
            .addCase(applyForLeave.pending, (state) => {
                state.loading = true;
            })
            .addCase(applyForLeave.fulfilled, (state, action) => {
                state.loading = false;
                state.message = "Leave application submitted!";
                // Optionally add to leaves array if this slice is primary for listing
                state.leaves.push(action.payload);
            })
            .addCase(applyForLeave.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Get Employee Leave History
            .addCase(getEmployeeLeaveHistory.pending, (state) => {
                state.loading = true;
            })
            .addCase(getEmployeeLeaveHistory.fulfilled, (state, action) => {
                state.loading = false;
                state.leaves = action.payload; // Set employee's leaves
            })
            .addCase(getEmployeeLeaveHistory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Cancel Leave
            .addCase(cancelLeave.pending, (state) => {
                state.loading = true;
            })
            .addCase(cancelLeave.fulfilled, (state, action) => {
                state.loading = false;
                state.message = "Leave cancelled successfully!";
                // Update the cancelled leave in the array
                state.leaves = state.leaves.map((leave) =>
                    leave._id === action.payload._id ? action.payload : leave
                );
            })
            .addCase(cancelLeave.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Get All Leave Requests (Admin)
            .addCase(getAllLeaveRequests.pending, (state) => {
                state.loading = true;
            })
            .addCase(getAllLeaveRequests.fulfilled, (state, action) => {
                state.loading = false;
                state.leaves = action.payload; // Set all leave requests
                console.log("DEBUGGING: Frontend (LeaveSlice): getAllLeaveRequests fulfilled, payload:", action.payload);
            })
            .addCase(getAllLeaveRequests.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                console.error("Frontend (LeaveSlice): getAllLeaveRequests rejected, error:", action.payload);
            })

            // Get Single Leave Request (Admin)
            .addCase(getSingleLeaveRequest.pending, (state) => {
                state.loading = true;
                state.singleLeave = null;
            })
            .addCase(getSingleLeaveRequest.fulfilled, (state, action) => {
                state.loading = false;
                state.singleLeave = action.payload;
            })
            .addCase(getSingleLeaveRequest.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Clear Errors and Messages
            .addCase(clearErrors.fulfilled, (state) => {
                state.error = null;
            })
            .addCase(clearMessage.fulfilled, (state) => {
                state.message = null;
            })
            // Update Leave Status (Admin)
            .addCase(updateLeaveStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.message = null;
            })
            .addCase(updateLeaveStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.message = "Leave status updated!";
                // Update the status of the specific leave in the leaves array
                state.leaves = state.leaves.map((leave) =>
                    leave._id === action.payload._id ? action.payload : leave
                );
                // Also update singleLeave if it's currently displayed
                if (state.singleLeave && state.singleLeave._id === action.payload._id) {
                    state.singleLeave = action.payload;
                }
            })
            .addCase(updateLeaveStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

    },
});
export default leaveSlice.reducer;