//-----> External Imports
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

//-----> Internal Imports
const User = require('../Models/User');
const CatchAsyncErrors = require('../Middlewares/CatchAsyncErrors')
const ErrorHandler = require('../Utilis/ErrorHandler');

//@method: POST
//@route: /api/v1/registerUser 
exports.RegisterUser = CatchAsyncErrors(async (req, res, next) => {
    //Extraction + Validation + Hashing + Saving

    //extracting data from UI
    const { name, email, password, mobilenumber, age } = req.body;
    if (!name || !email || !password || !mobilenumber || !age) {
        return next(new ErrorHandler("All fields are required", 400));
    }
    //validate if emil exists already
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return next(new ErrorHandler("Email has been already taken.", 400));
    }
    //hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
        name,
        email,
        password: hashedPassword,
        mobilenumber,
        age,
        role:'Employee',
    });
    //saving new User
    await newUser.save();
    res.status(200).json('User Registered Successfuly');
})

// @method : GET
// @route  : /api/v1/login
exports.LoginUser = CatchAsyncErrors(async (req, res, next) => {
    const {email, password} = req.body;

    //email and password must be provided for login
    if (!email || !password) {
        return next(new ErrorHandler('All fields are required'))
    }
    //Check if user exists or not
    const user = await User.findOne({email});
    if(!user)
    {
        return next(new ErrorHandler("User not registered. Please register first", 401));
    }
    //check if password matches
    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch)
    {
        return next(new ErrorHandler("Invalid Password", 400));
    }
    //generating Token
    const token = jwt.sign(
        {id:user._id},               //payload
        process.env.JWT_SECRET,     // sign the token with JWT_SECRET key
        {expiresIn: '1d'}           // token expiry
    );
    //returns the token and user data to frontend 
    res.status(200).json({
        message: "Logged in successfuly",
        user:{
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        }, token,
    });
})