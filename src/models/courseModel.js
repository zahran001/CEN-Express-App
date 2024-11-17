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

},
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Course", courseSchema);
