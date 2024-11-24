const express = require('express');

// Middleware for authentication and authorization
const verifyToken = require("../middlewares/authMiddleware.js");
const authorizeRoles = require("../middlewares/roleMiddleware.js");
const router = express.Router();

const { addStudentToCourse, dropStudentFromCourse } = require('../controllers/advisorController');


router.post('/addStudent', verifyToken, authorizeRoles("advisor"), addStudentToCourse);
router.post('/dropStudent', verifyToken, authorizeRoles("advisor"), dropStudentFromCourse);

module.exports = router;

