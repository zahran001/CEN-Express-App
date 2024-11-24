const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    user: { type: String, required: true }, // user ID or username
    role: { type: String, required: true }, // e.g., staff, advisor, etc.
    operationType: { type: String, enum: ['POST', 'GET', 'UPDATE', 'DELETE'], required: true },
    affectedData: { type: mongoose.Schema.Types.Mixed, required: true }, // e.g., course, student
    oldValue: { type: mongoose.Schema.Types.Mixed }, // For update operations
    newValue: { type: mongoose.Schema.Types.Mixed }, // For insert/update operations
});

module.exports = mongoose.model("Log", logSchema);
