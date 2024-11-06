// import the express
const express = require("express");
// Using the variables defined in the .env file
const dotenv = require("dotenv").config();
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
// import dbConnect
const dbConnect = require("./config/dbConnect");
// call this function
dbConnect();


// create an app
const app = express();

// Middleware to get the json data
app.use(express.json());

// Routes
// Defind the routes in injex.js
app.use("/api/auth", authRoutes);
// import the router
app.use("/api/users", userRoutes);

// Start the server
const PORT = process.env.PORT || 7001;

// listen to the app
// listen to a port which also gives a callback function
app.listen(PORT, () => {
    console.log(`Server is running at port ${PORT}`);
});