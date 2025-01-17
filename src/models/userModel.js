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
    gradDate:{
        type: Date,
        required: false,
    },
    courses:[
        {
            // Added grades
            courseCode: { type: String, required: true },
            grade: { type: String, enum: ["A", "B", "C", "D", "F", "I", "S", "U"] },
        },
    ],
    // Added this extra attribute to help save the course details for students
    gpa: {
        type: Number,
        min: 0,
        max: 4,


    },
    // Added this extra attribute to help save the course details for instructors
    instructor_courses: [
        {
          course_code: { type: String, required: true },
          title: { type: String, required: true },
          credits: { type: Number, required: true },
          semester: { type: String, required: true },
          year: { type: Number, required: true },
        },
    ],
},
    {
        timestamps: true,
    }
);

// export it
module.exports = mongoose.model("User", userSchema);