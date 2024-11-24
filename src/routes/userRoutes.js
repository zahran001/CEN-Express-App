const express = require("express");
const verifyToken = require("../middlewares/authMiddleware.js");
const authorizeRoles = require("../middlewares/roleMiddleware.js");
const router = express.Router();
const User = require("../models/userModel");

// staff user only routes
// define the verifyToken middleware here

// add one more middleware here - authorizeRoles 
// we can pass some values on this middleware.
// Only staff members can access this route
router.get("/staff", verifyToken, authorizeRoles("staff"), (req, res) => {
    res.json({message: "Welcome Staff"});
});


// advisor user only routes
// Only staff and advisor members can access this route
router.get("/advisor", verifyToken, authorizeRoles("advisor", "staff"), (req, res) => {
    res.json({message: "Welcome Advisor"});
});


// instructor user only routes
// Staff, advisor, and instructor members can access this route
router.get("/instructor", verifyToken, authorizeRoles("instructor", "staff", "advisor"), (req, res) => {
    res.json({message: "Welcome Instructor"});
});


// student user only routes
// All four can access this route
router.get("/student", verifyToken, authorizeRoles("student", "staff", "advisor", "instructor"), (req, res) => {
    res.json({message: "Welcome Student"});
});

// Advisor adds course to student
router.post("/add-course", verifyToken, authorizeRoles("advisor"), async (req, res) => {
    try {
        const { studentId, courseId } = req.body;
        const student = await User.findById(studentId);
        if (!student || student.role !== "student") {
            return res.status(404).json({ message: "Student not found" });
        }
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }
        if (!student.courses.includes(courseId)) {
            student.courses.push(courseId);
            await student.save();
        }
        res.status(200).json({ message: "Course added successfully", student });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});
// Advisor sets GPA for a student
router.post("/set-gpa", verifyToken, authorizeRoles("advisor"), async (req, res) => {
    try {
        const { studentId, gpa } = req.body;
        if (gpa < 0 || gpa > 4) {
            return res.status(400).json({ message: "Invalid GPA value" });
        }
        const student = await User.findById(studentId);
        if (!student || student.role !== "student") {
            return res.status(404).json({ message: "Student not found" });
        }
        student.gpa = gpa;
        await student.save();
        res.status(200).json({ message: "GPA updated successfully", student });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});
// Student views their profile
router.get("/student-profile", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id; // From the token middleware
        const student = await User.findById(userId).populate("courses");
        if (!student || student.role !== "student") {
            return res.status(403).json({ message: "Access forbidden" });
        }
        const studentProfile = {
            uid: student.uid,
            username: student.username,
            courses: student.courses,
            gpa: student.gpa,
        };
        // Include gradDate only if the user is a student
        if (student.role === "student") {
            studentProfile.gradDate = student.gradDate;
        }
        res.status(200).json(studentProfile);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// endpoint for advisor adding courses for a student
router.post(
    "/students/:uid/register-courses",
    verifyToken, // Ensure the user is authenticated
    authorizeRoles("advisor"), // Restrict access to advisors
    async (req, res) => {
      const { uid } = req.params;
      const { courses } = req.body;
  
      try {
        // Find the student
        const student = await User.findOne({ uid, role: "student" });
        if (!student) {
          return res.status(404).json({ error: "Student not found" });
        }
  
        if (student.department !== req.user.department) {
          return res.status(403).json({ error: "The student is from a different department" });
        }
  
        // Add courses to the student, avoiding duplicates
        student.courses = [...new Set([...student.courses, ...courses])];
        await student.save();
  
        res.json({ message: "Courses registered successfully!" });
      } catch (error) {
        console.error("Error registering courses:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    }
);
// endpoint for student view; gets student's courses
router.get("/student/studentview", verifyToken, authorizeRoles("student"), async (req, res) => {
    try {
      const uid = req.user.uid;
      const student = await User.findOne({ uid, role: "student" }).populate("courses");
  
      if (!student) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ courses: student.courses, name: req.user.username });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
});
// endpoint for instructor view; gets instructor's instructor_courses
router.get("/instructor/instructorview", verifyToken, authorizeRoles("instructor"), async (req, res) => {
    try {
      const uid = req.user.uid;
      console.log(uid);
      const instructor = await User.findOne({ uid, role: "instructor" }).populate("courses");
      console.log(instructor);
      if (!instructor) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ courses: instructor.instructor_courses, name: req.user.username });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
});
// fetches student courses when the advisor requests it
router.get("/student/:uid/courses", verifyToken, authorizeRoles("advisor", "student"), async (req, res) => {
    try {
      const { uid } = req.params;
      const user = await User.findOne({ uid, role: "student" }).populate("courses");
  
      if (!user) {
        return res.status(404).json({ message: "Student not found" });
      }
      if (user.department !== req.user.department) {
        return res.status(403).json({ error: "Error" });
      }
  
      res.json({ courses: user.courses });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
});
// Advisor can drop a course from the student's profile
router.post("/student/:uid/drop-courses", verifyToken, authorizeRoles("advisor"), async (req, res) => {
    try {
        const { uid } = req.params;
        const { courses } = req.body;
    
        // Find the student
        const student = await User.findOne({ uid, role: "student" });
        if (!student) {
          return res.status(404).json({ error: "Student not found" });
        }
        if (student.department !== req.user.department) {
            return res.status(403).json({ error: "The student is from a different department" });
        }
    
        // Filter out courses to remove
        student.courses = student.courses.filter(
          (course) => !courses.includes(course.toString())
        );
    
        // Save updated student
        await student.save();
        res.json({ message: "Courses successfully dropped", courses: student.courses });
      } catch (error) {
        console.error("Error dropping courses:", error);
        res.status(500).json({ error: "Internal server error" });
      }
  });
  // endpoint for staff creating course stuff for the instructor
  router.post("/staff/courses/create", async (req, res) => {
    try {
      const {course_code, title, instructor_name, credits, semester, year} = req.body;
  
      // Find the user by UID
      console.log(instructor_name);
      const user = await User.findOne({ username: instructor_name, role:"instructor" });
      console.log(user);
  
      // Add the course to the user's courses array
      user.instructor_courses.push({
        course_code,
        title,
        credits,
        semester,
        year,
      });
  
      // Save the updated user document
      await user.save();
  
      res.status(200).json({
        message: "Course registered successfully!",
        user: user,
      });
    } catch (error) {
      console.error("Error registering course:", error);
      res.status(500).json({
        message: "Failed to register course.",
        error: error.message,
      });
    }
  });


// directly export the router object
module.exports = router;

// To make protected routes, the user authentication is required.
// We will be authenticating the user based on the access token.
// verifyToken -> if you've a valid token, irrespective of your role, you'll be able to access the routes.