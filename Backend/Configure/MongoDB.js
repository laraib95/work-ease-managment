const mongoose = require('mongoose');

const connectDB = async ()=>{
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("mongoDB connected successfully! ")
    } catch (error) {
        console.error("❌ mongoDB connection Failed", error);
        process.exit(1);
    }
}
module.exports = connectDB;