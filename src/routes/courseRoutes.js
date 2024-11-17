// all routes related to course
const express = require("express");
const router = express.Router();

// Middleware for authentication and authorization
const verifyToken = require("../middlewares/authMiddleware.js");
const authorizeRoles = require("../middlewares/roleMiddleware.js");


// destructure
const {getCourses, getSingleCourse, createCourse, updateCourse, deleteCourse } = require("../controllers/courseController"); 

router.get("/", getCourses);

router.get("/:id", getSingleCourse);

// router.post("/", createCourse);

// router.put("/:id", updateCourse);

// router.delete("/:id", deleteCourse)

router.post("/", verifyToken, authorizeRoles("staff"), createCourse);

router.put("/:id", verifyToken, authorizeRoles("staff"), updateCourse);

router.delete("/:id", verifyToken, authorizeRoles("staff"), deleteCourse);


module.exports = router;
