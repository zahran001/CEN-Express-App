const mongoose = require("mongoose");

// define all the properties in this object
const userSchema = new mongoose.Schema({
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
        enum: ["CSE", "Medical Engineering", "Mechanical Engineering", "Civil and Environmental Engineering"],
    },

    //  Database-Level Validation
    major: {
        type: String,
        required: function() {
            return this.role === "student" || this.role === "advisor";
        },
        enum: ["CS", "CE", "IT", "CyS", "BME"],
    },
    // updated the authController
},
    {
        timestamps: true,
    }
);

// export it
module.exports = mongoose.model("User", userSchema);