const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema({
    department_name: {
        type: String,
        required: true,
        enum: ["CSE", "Medical Engineering", "Mechanical Engineering", "Civil and Environmental Engineering"],
    },
    department_head: {
        type: String,
        required: true,
    },
    department_size: {
        type: Number,
        required: true,
    },


},
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Department", departmentSchema);



