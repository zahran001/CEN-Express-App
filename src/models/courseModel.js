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
    },
    credits: {
        type: Number,
        required: true,
    },
    department: {
        type: String,
        required: true,
        enum: ["CSE", "Medical Engineering", "Mechanical Engineering", "Civil and Environmental Engineering"],
    },
    semester: {
        type: String,
        required: true,
        enum: ["Fall","Spring","Summer"],
    },
    instructor_name: {
        type: String,
        required: true,
    },

},
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Course", courseSchema);
