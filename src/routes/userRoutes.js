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

    // randomly assigns grades
    const grades = ["A", "B", "C", "D", "F", "I", "S", "U"];

    try {
      // Find the student
      const student = await User.findOne({ uid, role: "student" });
      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }

      if (student.department !== req.user.department) {
        return res.status(403).json({ error: "The student is from a different department" });
      }

      // Find instructors in the same department as the student
      const instructors = await User.find({ department: student.department, role: "instructor" });

      // Collect course codes from instructor's courses in the same department
      const instructorCourses = instructors.flatMap((instructor) =>
        instructor.instructor_courses.map((course) => course.course_code)
      );

      // Check if the requested courses are valid by checking if they exist in any instructor's courses
      const validCourses = courses.filter((course) => instructorCourses.includes(course));

      if (validCourses.length === 0) {
        return res.status(400).json({ error: "None of the provided courses are available for registration" });
      }

      // Add courses with random grades
      const newCourses = validCourses.map((course) => ({
        courseCode: course,
        grade: grades[Math.floor(Math.random() * grades.length)], // Random grade
      }));

      // Avoid duplicates by checking if the course is already in the student's courses
      const existingCourses = student.courses.map((c) => c.courseCode);
      student.courses = [
        ...student.courses,
        ...newCourses.filter((c) => !existingCourses.includes(c.courseCode)),
      ];

      await student.save();

      res.json({
        message: "Courses registered successfully!",
        registeredCourses: newCourses,
      });
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
      // Fetch user with the student role
      const student = await User.findOne({ uid, role: "student" });

      if (!student) {
          return res.status(404).json({ message: "User not found" });
      }

      // Map through the courses and return both courseCode and grade
      const courseDetails = student.courses.map(course => ({
          courseCode: course.courseCode,
          grade: course.grade,
      }));

      console.log("Course details: ", courseDetails);

      // Return the courses with grades and username
      res.json({ courses: courseDetails, name: req.user.username });
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
  
      const courseCodes = user.courses.map(course => course.courseCode);

      res.json({ courses: courseCodes, name: req.user.username });
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
          (course) => !courses.includes(course.courseCode.toString())
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
      const { course_code, title, instructor_name, credits, semester, year, department } = req.body;
      console.log("Register for instructor:", req.body);
        
      // Find the instructor by username and role
      const instructor = await User.findOne({ username: instructor_name, role: "instructor"});
      console.log("Instructor:", instructor);
      
      if (instructor.department !== department) {
        return res.status(403).json({
          message: "You can only register courses for instructors in the same department.",
        });
      }

      if (!instructor) {
        return res.status(404).json({
          message: "Instructor not found.",
        });
      }

      // Add the course to the instructor's courses array
      instructor.instructor_courses.push({
        course_code,
        title,
        credits,
        semester,
        year,
      });
  
      // Save the updated instructor document
      await instructor.save();
  
      // Respond with success message
      res.status(200).json({
        message: "Course registered successfully!",
        instructor: instructor,
      });
    } catch (error) {
      console.error("Error registering course:", error);
      res.status(500).json({
        message: "Failed to register course.",
        error: error.message,
      });
    }
  });

  router.get("/currentgpa", verifyToken, authorizeRoles("student", "advisor"), async (req, res) => {
    try {
      const gradeToPoints = {
        A: 4.0,
        B: 3.0,
        C: 2.0,
        D: 1.0,
        F: 0.0,
        I: 0.0, 
        S: 4.0, 
        U: 0.0, 
      };

      const uid = req.query.uid || req.user.uid;
      // Get user from database using ID from the token
      const user = await User.findOne({uid: uid}); // Ensure `req.user` is populated by the `authenticateToken` middleware
      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }
  
      // Check if the user has any courses
      const courses = user.courses; 
      if (!courses || courses.length === 0) {
        return res.status(200).json({ currentGPA: 0 }); // No courses, GPA is 0
      }
  
      // Fetch course details from instructor_courses
      const courseCodes = courses.map(course => course.courseCode);
      const instructorCourses = await User.aggregate([
        { $unwind: "$instructor_courses" },
        { $match: { "instructor_courses.course_code": { $in: courseCodes } } },
        { $project: { "instructor_courses.course_code": 1, "instructor_courses.credits": 1 } }
      ]);
  
      // Create a map of courseCode to credits
      const courseCreditsMap = {};
      instructorCourses.forEach(course => {
        courseCreditsMap[course.instructor_courses.course_code] = course.instructor_courses.credits;
      });
  
      // GPA Calculation using the gradeToPoints mapping
      let totalPoints = 0;
      let totalCredits = 0;
  
      courses.forEach(course => {
        const credits = courseCreditsMap[course.courseCode];
        if (credits) {
          const gradePoints = gradeToPoints[course.grade] || 0; // Default to 0 if grade is not valid
          totalPoints += gradePoints * credits;
          totalCredits += credits;
        }
      });
      const currentGPA = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0;

      user.gpa = currentGPA;
      await user.save();
  
      // Respond with the calculated GPA
      res.status(200).json({ currentGPA });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error. Failed to fetch GPA." });
    }
  });

  router.post("/whatifanalysis", verifyToken, authorizeRoles("student", "advisor"), async (req, res) => {
    try {
      const gradeToPoints = {
        A: 4.0,
        B: 3.0,
        C: 2.0,
        D: 1.0,
        F: 0.0,
        I: 0.0, 
        S: 4.0, 
        U: 0.0, 
      };
      const { newCourses, uid: requestUid } = req.body;
      console.log(newCourses);
      if (!newCourses || !Array.isArray(newCourses) || newCourses.length === 0) {
        return res.status(400).json({ error: "New courses data is required." });
      }
  
      // Find the user from the database using the token payload (e.g., user ID or username)
      const uid = req.body.uid || req.user.uid;

      const user = await User.findOne({ uid: uid });
      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }
  
      // Replace `courses` with `completedCourses`
      const courseCodes = user.courses.map(course => course.courseCode); // Corrected this line
      const instructorCourses = await User.aggregate([
        { $unwind: "$instructor_courses" },
        { $match: { "instructor_courses.course_code": { $in: courseCodes } } },
        { $project: { "instructor_courses.course_code": 1, "instructor_courses.credits": 1 } }
      ]);
  
      const courseCreditsMap = {};
      instructorCourses.forEach(course => {
        courseCreditsMap[course.instructor_courses.course_code] = course.instructor_courses.credits;
      });
  
      // Extract current GPA and course data
      const currentGPA = parseFloat(user.gpa) || 0;
      const completedCourses = user.courses || [];
  
      // Calculate current total quality points and total credits
      let totalQualityPoints = 0;
      let totalCredits = 0;
  
      completedCourses.forEach(course => {
        const credits = courseCreditsMap[course.courseCode];
        if (credits) {
          const gradePoints = gradeToPoints[course.grade] || 0; // Default to 0 if grade is not valid
          totalQualityPoints += gradePoints * credits;
          totalCredits += credits;
        }
      });
  
      // Process new courses
      newCourses.forEach((course) => {
        if (
          !gradeToPoints[course.grade] ||
          isNaN(course.credits) ||
          course.credits <= 0
        ) {
          throw new Error("Invalid course data: ensure grades and credits are valid.");
        }
        totalQualityPoints += gradeToPoints[course.grade] * course.credits;
        console.log("total quality points: ", totalQualityPoints);
        totalCredits += course.credits;
        console.log(totalCredits);
      });
  
      // Calculate updated GPA
      const updatedGPA = totalCredits > 0 ? totalQualityPoints / totalCredits : 0;
  
      // Respond with current GPA and updated GPA
      res.status(200).json({
        currentGPA,
        updatedGPA,
      });
    } catch (error) {
      console.error("Error in What-If Analysis:", error.message);
      res.status(500).json({ error: error.message || "Internal server error." });
    }
  });

// directly export the router object
module.exports = router;

// To make protected routes, the user authentication is required.
// We will be authenticating the user based on the access token.
// verifyToken -> if you've a valid token, irrespective of your role, you'll be able to access the routes.