const Log = require("../models/logModel");

const logMiddleware = async (req, res, next) => {
    try {
        const logData = {
            user: req.user ? req.user.username : "Unauthenticated", // Handle unauthenticated requests
            role: req.user ? req.user.role : "Unauthenticated",
            operationType: req.method, // HTTP method
            affectedData: req.body || req.query || {}, // Capture request body or query
            timestamp: new Date(),
        };

        if (req.method === "PUT" || req.method === "PATCH") {
            logData.oldValue = req.oldData; // Capture old data from previous middleware
            logData.newValue = req.body; // Capture the updated data
        }

        // Save the log
        const log = new Log(logData);
        await log.save();
        console.log("Log saved:", logData);
    } catch (error) {
        console.error("Error saving log:", error);
    }
    next();
};

module.exports = logMiddleware;