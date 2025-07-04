const jwt = require('jsonwebtoken');
const User = require('../Models/User');
const ErrorHandler = require('../Utilis/ErrorHandler');
const CatchAsyncErrors = require('./CatchAsyncErrors');

//function to verify token 
exports.VerifyToken = CatchAsyncErrors(async (req, res, next) => {
    let token;
    //check if authorization header is present in request ad it also contains token 
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        //get token from header
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return next(new ErrorHandler('Login first to access this resource.', 401));
    }
    try {

        //verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        //find the user by ID and attach it to the request. Exclude password
        req.user = await User.findById(decoded.id).select('-password');
        //if user got deleted
        if (!req.user) {
            return next(new ErrorHandler("Requested User Not Found", 401))
        }
        next();
    } catch (error) {
        console.error('Token verification error', error);
        if (error.name === 'JsonWebTokenError') {
            return next(new ErrorHandler('Invalid Token. Please Log in again', 401))
        }
        if (error.name === 'TokenExpiredError') {
            return next(new ErrorHandler("Token Expired. please log in again", 403));
        }
        return next(new ErrorHandler("Authentication failed due to server erro", 500))
    }
});

// Middleware to authorize user roles
// This middleware takes an array of allowed roles (e.g., ['admin', 'manager'])
// and checks if the { VerifyToken } user's role matches any of them.
exports.authorizeRoles =  (...roles) => {
    return (req, res, next) => {
        // req.user must have been set by isAuthenticatedUser middleware
        if (!req.user || !req.user.role) {
            // This case should ideally be caught by isAuthenticatedUser, but
            // it's a good safeguard.
            return next(new ErrorHandler(`Unauthorized: User role not found or not authenticated.`, 403));
        }

        // Check if the user's role is included in the allowed roles list
        if (!roles.includes(req.user.role)) {
            return next(new ErrorHandler(`Role (${req.user.role}) is not allowed to access this resource.`, 403));
        }
        next(); // User has the required role, proceed
    };
};
