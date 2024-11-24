const Student = require('../models/studentModel');
const Course = require('../models/courseModel');
const Department = require('../models/departmentModel');

// Add student to a course
const addStudentToCourse = async (req, res) => {
    try {
        // studentId is UID
        // 
        const { studentId, courseId } = req.body;
        const advisorDept = req.user.departmentId;

        // Fetch student and verify department match
        const student = await Student.findById(studentId);
        if (!student || student.departmentId !== advisorDept) {
            return res.status(403).json({ message: 'Student is not in your department.' });
        }

        // Add student to course
        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: 'Course not found.' });

        if (!course.students.includes(studentId)) {
            course.students.push(studentId);
            await course.save();
            return res.status(200).json({ message: 'Student added to course successfully.' });
        }
        return res.status(400).json({ message: 'Student is already enrolled in the course.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Drop student from a course
const dropStudentFromCourse = async (req, res) => {
    try {
        const { studentId, courseId } = req.body;
        const advisorDept = req.user.departmentId;

        // Fetch student and verify department match
        const student = await Student.findById(studentId);
        if (!student || student.departmentId !== advisorDept) {
            return res.status(403).json({ message: 'Student is not in your department.' });
        }

        // Remove student from course
        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: 'Course not found.' });

        course.students = course.students.filter(id => id.toString() !== studentId);
        await course.save();
        return res.status(200).json({ message: 'Student removed from course successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { addStudentToCourse, dropStudentFromCourse };

// Zahran - Advisor - Backup
