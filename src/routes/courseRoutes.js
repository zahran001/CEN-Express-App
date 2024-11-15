// all routes related to course
const express = require("express");
const router = express.Router();

// destructure
const {getCourses, getSingleCourse, createCourse, updateCourse, deleteCourse } = require("../controllers/courseController"); 

router.get("/", getCourses);

router.get("/:id", getSingleCourse);

router.post("/", createCourse);

router.put("/:id", updateCourse);

router.delete("/:id", deleteCourse)


module.exports = router;
