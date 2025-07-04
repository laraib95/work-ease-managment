import { createSlice } from "@reduxjs/toolkit";

const initialAuthState = () => {
    const token = localStorage.getItem('userToken');
    const userProfile = localStorage.getItem('userProfile');

    if (token && userProfile)
        try {
            const parsedUserProfile = JSON.parse(userProfile);
            return {
                isLoggedIn: true,
                token: token,
                user: parsedUserProfile,
                role: parsedUserProfile.role || null,            }
        } catch (error) {
            console.log("Failed to parse the user profile");
            return {
                isLoggedIn: false,
                token: null,
                user: null,
                role: null,
            };
        }
    return {
        isLoggedIn: false,
        token: null,
        user: null,
        role: null,
    };
}
const AuthSlice = createSlice({
    name: 'auth',
    initialState: initialAuthState(),
    reducers : {
        loginsuccess: (state, action) => {
            state.isLoggedIn = true;
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.role = action.payload.user.role;

            localStorage.setItem('userProfile', JSON.stringify(action.payload.user));
            localStorage.setItem('userToken',action.payload.token);
            localStorage.setItem('role',action.payload.user.role);
        },
        logout: (state) => {
            state.isLoggedIn = false;
            state.user = null;
            state.token = null;
            state.role = null;

            localStorage.removeItem('userToken');
            localStorage.removeItem('userProfile');
            localStorage.removeItem('role');
        },
        updateSuccess: (state, action) => {
            state.user = action.payload;
            state.role = action.payload.role;
            localStorage.setItem('userData',JSON.stringify(action.payload));
        },
    },
});
//exporting all actions
export const {logout, loginsuccess, updateSuccess} = AuthSlice.actions;
//exporting reducers
export default AuthSlice.reducer;