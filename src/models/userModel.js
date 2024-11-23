const mongoose = require("mongoose");

// define all the properties in this object
const userSchema = new mongoose.Schema({
    uid: {
        // Put UI validations for the UID
        type: String,
        required: true,
        unique: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
        enum: ["staff", "advisor", "instructor", "student"],
    },
    
    // CSE, Medical Engineering, Mechanical Engineering, Civil and Environmental Engineering
    department: {
        type: String,
        required: true,
        enum: ["CSE", "BME", "ME"],
    },

    //  Database-Level Validation
    major: {
        type: String,
        enum: ["CS", "CE", "IT", "CyS", "ME", "BME"],
    },
    // updated the authController
},
    {
        timestamps: true,
    }
);

// export it
module.exports = mongoose.model("User", userSchema);