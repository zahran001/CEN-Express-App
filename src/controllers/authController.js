const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// on successful login, we need to give the token to the user

// need the userSchema
const User = require("../models/userModel");

// an arrow function
const register = async (req, res) => {
    // We will have these three filled from the user as a request body
    // When we create the model, these three values should be the properties in the user object
    const {username, password, role} = req.body;

    // hash the password
    // pass the salt number required to hash the password along with the raw password
    const bcryptHashedPassword = await bcrypt.hash(password, 10);
    // create the newUser
    const newUser = new User({username, password: bcryptHashedPassword, role})
    
}

const login = async (req, res) => {
    // for login - request body will only have the username and password
    const { username, password } = req.body;
};


module.exports = {
    register,
    login,
}