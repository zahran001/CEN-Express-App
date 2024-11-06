// import the express
const express = require("express");
const { register, login } = require("../controllers/authController");
const router = express.Router();

// For the register endpoint, we could just define the request response.
// Instead of defining a req res, we are going to put the logic into the controller.
// We created the register function into the controller.
router.post("/register", register);
router.post("/login", login);

// making this router available to other modules (files) in the application.
module.exports = router;