// import the express
const express = require("express");
// Using the variables defined in the .env file
const dotenv = require("dotenv").config();
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const courseRoutes = require("./routes/courseRoutes");

// import dbConnect
const dbConnect = require("./config/dbConnect");
// call this function
dbConnect();

// import the Course model
const Course = require("./models/courseModel.js");

// create an app
const app = express();

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


// Start the server
const PORT = process.env.PORT || 7001;

// Run it
// listen to the app
// listen to a port which also gives a callback function
app.listen(PORT, () => {
    console.log(`Server is running at port ${PORT}`);
});