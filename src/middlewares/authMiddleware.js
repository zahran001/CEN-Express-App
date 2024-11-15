// Make protected routes - need to pass the access token in the header
// In the Authorization, we will the pass the token as a Bearer

// This middleware will intercept the request and 
// check the token to allow an authenticated user to access the routes

// we need to validate the token
const jwt = require("jsonwebtoken");
// an arrow function
// we will have three arguments
const verifyToken = (req, res, next) => {
    let token;
    // need the auth headers first
    let authHeader = req.headers.Authorization || req.headers.authorization; // supports both lowercase and uppercase
    // if Authorization header is not present
    if(!authHeader){
        return res.status(401).json({
            message: "No authorization header. Access denied."
        });
    }


    if (authHeader && authHeader.startsWith("Bearer") || authHeader && authHeader.startsWith("bearer")) {
        token = authHeader.split(" ")[1];

        // if we get a token
        try {
            // using the verify method to decode it
            const decode = jwt.verify(
                token,
                process.env.JWT_SECRET
            )
            // adding a property to the req (request) object to hold the decoded user information
            req.user = decode; 
            console.log("The decoded user is: ", req.user);

            // forward the request
            next();

        } catch (error) {
            res.status(400).json({
                message: "Invalid token"
            });
        }
    } else {
        return res.status(401).json({
            message: "No authorization header. Access denied."
        });

    }
}

// export it
module.exports = verifyToken;
// We can just use this verifyToken and intercept the request -> Check userRoutes.js
// If you want to make the route protected, you've to go to userRoutes and add verifyToken there.