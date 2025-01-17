// Course
const mongoose = require("mongoose");

// define all the properties in this object
const courseSchema = new mongoose.Schema({
    course_code: {
        type: String,
        required: true,
        unique: true,
    },
    title: {
        type: String,
        required: true,
        unique: true,
    },
    credits: {
        type: Number,
        required: true,
    },
    department: {
        type: String,
        required: true,
        enum: ["CSE", "BME", "ME"],
    },
    semester: {
        type: String,
        required: true,
        enum: ["Fall","Spring","Summer"],
    },
    year: {
        type: Number,
        required: true,
    },
    instructor_name: {
        type: String,
        required: true,
    },
    // Add an array for students
    students: [
        {
            type: mongoose.Schema.Types.ObjectId, // Reference to the User model (student)
            ref: "User", // Replace with your actual User model name
        },
    ],

},
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Course", courseSchema);