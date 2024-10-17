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
},
{
    timestamps: true,
}
);

// export it
module.exports = mongoose.model("User", userSchema);