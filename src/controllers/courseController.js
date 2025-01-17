const User = require("../models/userModel");

// get all courses
const getCourses = async (req, res) => {
    try {
        const department = req.user.department;

        // Aggregate both student and instructor courses
        const users = await User.find({ department: department, role: "instructor" }).lean();

        // Extract courses from students and instructors
        const courses = users.reduce((acc, user) => {
       
        if (user.role === "instructor" && user.instructor_courses) {
            acc.push(...user.instructor_courses.map(course => ({ ...course, instructor_name: user.username, role: "instructor", department: department })));
        }
        return acc;
        }, []);
        res.status(200).json(courses);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// get a single course
const getSingleCourse = async (req, res) => {
    try {
        // using params
        const { id } = req.params; // get the id from the URL
        const course = await User.findById(id);
        res.status(200).json(course);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};


// create a course
const createCourse =  async (req, res) => {
    // Ensure the staff user can only add courses to their department

    /*
    The goal is to ensure that the department in the request (req.body.department) matches 
    the user's department (req.user.department).
    */

    const { department } = req.body;
    if (req.user.department !== department) {
        return res.status(403).json({ 
            message: "Access denied: Can only create courses for your department" 
        });
    }

    try {
        // save the course
        // await - because it takes time
        // whenever we use await - put async
        const course = await Course.create(req.body);
        res.status(200).json(course); // throw out the course

    } catch (error) {
        res.status(500).json({ message: error.message });

    }
};


// update a course
const updateCourse = async (req, res) => {
    try {
        const { id } = req.params; // get the id from the URL
        const course = await Course.findByIdAndUpdate(id, req.body);
        // pass in the things that we want to update

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        // Ensure the staff user can only update courses in their department
        if (req.user.department !== course.department) {
            return res.status(403).json({ 
                message: "Access denied: Can only update courses for your department" 
            });
        }

        // Check it again
        const updatedCourse = await Course.findById(id);
        res.status(200).json(updatedCourse);
    } catch (error) {
        res.status(500).json({ mesage: error.mesage });

    }
};

const deleteCourse = async (req, res) => {
    try {
      // Destructure course code from the request params
      const { courseCode } = req.params;
  
      // Find the course in the user's department
      const course = await User.findOne({
        "instructor_courses.course_code": courseCode,
        department: req.user.department,
        role: "instructor"
      });
      console.log(course);
  
      if (!course) {
        return res.status(404).json({ message: "Course not found or you don't have permission to delete it" });
      }
  
      // Remove the course from the instructor's courses
      const updatedUser = await User.findOneAndUpdate(
        { _id: course._id },
        { $pull: { instructor_courses: { course_code: courseCode } } },
        { new: true }
      );
  
      if (!updatedUser) {
        // return res.status(500).json({ message: "Failed to delete course" });
        return res.status(500).json({ message: "Failed to delete course" });
      }
  
      res.status(200).json({ message: "Course deleted successfully." });
  
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

module.exports = {
    getCourses,
    getSingleCourse,
    createCourse,
    updateCourse,
    deleteCourse,

};


