// import the express
const express = require("express");
// Using the variables defined in the .env file
const dotenv = require("dotenv").config();
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const courseRoutes = require("./routes/courseRoutes");
const User = require("./models/userModel");
const authorizeRoles = require("./middlewares/roleMiddleware.js");
const Log = require("./models/logModel");
const logMiddleware = require("./middlewares/logMiddleware.js");



const cors = require("cors");
const corsOptions = {
    origin: ["http://localhost:5173"],
};

// import dbConnect
const dbConnect = require("./config/dbConnect");
const verifyToken = require("./middlewares/authMiddleware.js");
// call this function
dbConnect();

// create an app
const app = express();

app.use(cors(corsOptions));
app.use(logMiddleware);

// Middleware to get the json data
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello from Node Server");
});

// Routes
// Always include the leading / to define routes in Express
// Defind the routes in injex.js
app.use("/api/auth", authRoutes);
// import the router
app.use("/api/users", userRoutes);
app.use("/api/courses", courseRoutes);

// To do
// CRUD operations on course, department by the staff user


// Zahran

app.get('/logs', verifyToken, authorizeRoles('staff'), async (req, res) => {
    try {
        const logs = await Log.find().sort({ timestamp: -1 }); // Most recent logs first
        res.status(200).json(logs);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching logs.' });
    }
});
// Start the server
const PORT = process.env.PORT || 7001;

// Run it
// listen to the app
// listen to a port which also gives a callback function
app.listen(PORT, () => {
    console.log(`Server is running at port ${PORT}`);
});