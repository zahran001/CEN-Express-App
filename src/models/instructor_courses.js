// Course
const mongoose = require("mongoose");

// define all the properties in this object
const instructor_courses = new mongoose.Schema({
    instructor_name: {
        type: String,
        required: true,
    },
    instructor_department: {
        type: String,
        required: true,
        enum: ["CSE", "BME", "ME"],
    },
    assigned_course_code: {
        type: String,
        required: true,
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
},
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Course", courseSchema);

// Zahran - Backup