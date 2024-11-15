const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// on successful login, we need to give the token to the user

// need the userSchema
const User = require("../models/userModel");

// an arrow function
const register = async (req, res) => {
    try {

        // We will have these three filled from the user as a request body
        // When we create the model, these three values should be the properties in the user object
        const { username, password, role, department, major } = req.body;

        // hash the password
        // pass the salt number required to hash the password along with the raw password
        const bcryptHashedPassword = await bcrypt.hash(password, 10);
        // create the newUser
        const newUser = new User({ username, password: bcryptHashedPassword, role, department, major });
        // save that user
        await newUser.save();
        // give back the response - pass the json data to the user 
        res.status(201).json({ message: `User registered with username ${username}` });
    } catch (error) {
        // debugging
        res.status(500).json({ message: `User registration failed - authController` });

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
        const token = jwt.sign(
            // _id is automatically generated whenever you create a MongoDB record in the database
            { id: user._id, role: user.role }, process.env.JWT_SECRET,
            { expiresIn: "1h" },
        );

        // return the token in the response
        res.status(200).json({ token })


    } catch (error) {
        res.status(500).json({ message: `User registration failed` })
    }

};
;

module.exports = {
    register,
    login,
}