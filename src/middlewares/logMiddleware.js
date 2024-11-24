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

// const logMiddleware = async (req, res, next) => {
//     if (req.user) { // Ensure the user is authenticated
//         const logData = {
//             user: req.user ? req.user.username : "Unauthenticated", // Handle unauthenticated requests
//             role: req.user ? req.user.role : "Unauthenticated",
//             operationType: req.method,
//             affectedData: req.body || req.query, // What data was acted upon
//         };

//         // Handle old/new values for updates
//         if (req.method === "PUT" || req.method === "PATCH") {
//             logData.oldValue = req.oldData; // Capture old data from previous middleware
//             logData.newValue = req.body; // Capture the updated data
//         }

//         // Save the log asynchronously
//         try {
//             const log = new Log(logData);
//             await log.save();
//         } catch (error) {
//             console.error("Error saving log:", error);
//         }
//     }
//     next(); // Proceed to the next middleware or route handler
// };

module.exports = logMiddleware;