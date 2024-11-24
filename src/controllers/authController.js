const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// on successful login, we need to give the token to the user

// need the userSchema
const User = require("../models/userModel");

// an arrow function
const register = async (req, res) => {
    try {
        const { uid, username, password, role, department, major } = req.body;

        // Validate role
        const allowedRoles = ["student", "advisor", "staff", "instructor"];
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({ message: "Invalid role specified." });
        }

        // Validate major for specific roles
        if ((role === "student" || role === "advisor") && !major) {
            return res.status(400).json({ message: "Major is required for students and advisors." });
        }

        // Hash the password
        const bcryptHashedPassword = await bcrypt.hash(password, 10);

        // Create the user object dynamically
        const userObject = { uid, username, password: bcryptHashedPassword, role, department };
        if (major && (role === "student" || role === "advisor")) {
            userObject.major = major;
        }

        // Create and save the new user
        const newUser = new User(userObject);
        await newUser.save();

        // Respond with success
        res.status(201).json({ message: `User registered with username ${username}` });
    } catch (error) {
        console.error("Registration error:", error.message); // For debugging
        res.status(500).json({ message: `User registration failed: ${error.message}` });
    }
};


const login = async (req, res) => {
    try {
        // for login - request body will only have the username and password
        const { username, password } = req.body;
        // find a particular user with the particular username
        // since username is unique, we can use it as a property to find it 
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({ message: `User with username ${username} not found` });
        }
        // if you find the user, match the password of that user with the password that we've received in the request body
        const isMatch = await bcrypt.compare(password, user.password);
        // if it doesn't match
        if (!isMatch) {
            // return response 400 for the client-side error
            return res.status(400).json({ message: `Username and Password don't match` })
        }

        // if the login is successful, generate a token and give the token as a response back to the user
        // use jwt.sign() to generate the token

        // Confirm that the department field is part of the token payload when it is generated during login.
        const token = jwt.sign(
            // _id is automatically generated whenever you create a MongoDB record in the database
            { id: user._id, uid: user.uid, role: user.role, department: user.department, username: user.username }, process.env.JWT_SECRET,
            { expiresIn: "1h" },
        );

        /* 
        Including department in the token ensures all the user's authorization details (like role and department) 
        are self-contained within the token. 
        This makes the server completely independent of session storage.
        */

        // return the token in the response
        // res.status(200).json({ token })
        res.status(200).json({ token, role: user.role, username: user.username, department: user.department });



    } catch (error) {
        res.status(500).json({ message: `User login failed` })
    }

};

module.exports = {
    register,
    login,
};