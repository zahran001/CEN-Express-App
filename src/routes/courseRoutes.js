// all routes related to course
const express = require("express");
const router = express.Router();

// Middleware for authentication and authorization
const verifyToken = require("../middlewares/authMiddleware.js");
const authorizeRoles = require("../middlewares/roleMiddleware.js");


// destructure
const {getCourses, getSingleCourse, createCourse, updateCourse, deleteCourse } = require("../controllers/courseController"); 

router.get("/view", verifyToken, getCourses);

router.get("/view-single/:id", verifyToken, getSingleCourse);

// router.post("/", createCourse);

// router.put("/:id", updateCourse);

// router.delete("/:id", deleteCourse);

router.post("/create", verifyToken, authorizeRoles("staff"), createCourse);

router.put("/update/:id", verifyToken, authorizeRoles("staff"), updateCourse);

router.delete("/delete/:id", verifyToken, authorizeRoles("staff"), deleteCourse);


module.exports = router;
