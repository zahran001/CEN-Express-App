// all routes related to course
const express = require("express");
const router = express.Router();

// Middleware for authentication and authorization
const verifyToken = require("../middlewares/authMiddleware.js");
const authorizeRoles = require("../middlewares/roleMiddleware.js");
const logMiddleware = require("../middlewares/logMiddleware.js");


// destructure
const {getCourses, getSingleCourse, createCourse, updateCourse, deleteCourse } = require("../controllers/courseController"); 

router.get("/view", verifyToken, logMiddleware, getCourses);

router.get("/view-single/:id", verifyToken, logMiddleware, getSingleCourse);

// router.post("/", createCourse);

// router.put("/:id", updateCourse);

// router.delete("/:id", deleteCourse);

router.post("/create", verifyToken, logMiddleware, authorizeRoles("staff"), createCourse);

router.put("/update/:id", verifyToken, logMiddleware, authorizeRoles("staff"), updateCourse);

router.delete("/delete/:id", verifyToken, logMiddleware, authorizeRoles("staff"), deleteCourse);


module.exports = router;
