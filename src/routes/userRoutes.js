const express = require("express");
const verifyToken = require("../middlewares/authMiddleware.js");
const authorizeRoles = require("../middlewares/roleMiddleware.js");
const router = express.Router();

// staff user only routes
// define the verifyToken middleware here

// add one more middleware here - authorizeRoles 
// we can pass some values on this middleware.
// Only staff members can access this route
router.get("/staff", verifyToken, authorizeRoles("staff"), (req, res) => {
    res.json({message: "Welcome Staff"});
});


// advisor user only routes
// Only staff and advisor members can access this route
router.get("/advisor", verifyToken, authorizeRoles("advisor", "staff"), (req, res) => {
    res.json({message: "Welcome Advisor"});
});


// instructor user only routes
// Staff, advisor, and instructor members can access this route
router.get("/instructor", verifyToken, authorizeRoles("instructor", "staff", "advisor"), (req, res) => {
    res.json({message: "Welcome Instructor"});
});


// student user only routes
// All four can access this route
router.get("/student", verifyToken, authorizeRoles("student", "staff", "advisor", "instructor"), (req, res) => {
    res.json({message: "Welcome Student"});
});

// directly export the router object
module.exports = router;

// To make protected routes, the user authentication is required.
// We will be authenticating the user based on the access token.
// verifyToken -> if you've a valid token, irrespective of your role, you'll be able to access the routes.