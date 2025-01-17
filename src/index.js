// import the express
const express = require("express");
// Using the variables defined in the .env file
const dotenv = require("dotenv").config();
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const courseRoutes = require("./routes/courseRoutes");
const User = require("./models/userModel");
const authorizeRoles = require("./middlewares/roleMiddleware.js");
const Log = require("./models/logModel");
const logMiddleware = require("./middlewares/logMiddleware.js");


const cors = require("cors");
const corsOptions = {
    origin: ["http://localhost:5173"],
};

// import dbConnect
const dbConnect = require("./config/dbConnect");
const verifyToken = require("./middlewares/authMiddleware.js");
// call this function
dbConnect();

// create an app
const app = express();

app.use(cors(corsOptions));
app.use(logMiddleware);

// Middleware to get the json data
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello from Node Server");
});

// Routes
// Always include the leading / to define routes in Express
// Defind the routes in injex.js
app.use("/api/auth", authRoutes);
// import the router
app.use("/api/users", userRoutes);
app.use("/api/courses", courseRoutes);

// Zahran

app.get('/logs', verifyToken, authorizeRoles('staff'), async (req, res) => {
    try {
        const logs = await Log.find().sort({ timestamp: -1 }); // Most recent logs first
        res.status(200).json(logs);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching logs.' });
    }
});


app.get("/reports/major-gpa", verifyToken, authorizeRoles("advisor", "staff"), async (req, res) => {
    try {
        const gpaStats = await User.aggregate([
            { $match: { role: "student", gpa: { $exists: true } } },
            {
                $group: {
                    _id: "$major",
                    highestGPA: { $max: { $toDouble: "$gpa" } },
                    lowestGPA: { $min: { $toDouble: "$gpa" } },
                    averageGPA: { $avg: { $toDouble: "$gpa" } }
                }
            },
            {
                $project: {
                    _id: 1,
                    highestGPA: 1,
                    lowestGPA: 1,
                    averageGPA: { $round: ["$averageGPA", 2] } // Round to 2 decimal places
                }
            }
        ]);
        console.log(gpaStats);
        res.status(200).json(gpaStats);
    } catch (err) {
        console.error("Error fetching GPA stats by major:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.get("/reports/department-gpa", verifyToken, authorizeRoles("staff"), async (req, res) => {
    try {
        const departmentGpa = await User.aggregate([
            { $match: { role: "student", gpa: { $exists: true } } },
            {
                $group: {
                    _id: "$department",
                    averageGPA: { $avg: { $toDouble: "$gpa" } }
                }
            },
            { $sort: { averageGPA: -1 } },
            {
                $project: {
                    _id: 1,
                    highestGPA: 1,
                    lowestGPA: 1,
                    averageGPA: { $round: ["$averageGPA", 2] } // Round to 2 decimal places
                }
            }
        ]);

        const highestGPADept = departmentGpa[0];
        const lowestGPADept = departmentGpa[departmentGpa.length - 1];

        res.status(200).json({ highestGPADept, lowestGPADept, allDepartments: departmentGpa });
    } catch (err) {
        console.error("Error fetching department GPA stats:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.get("/reports/course-enrollment", verifyToken, authorizeRoles("staff"), async (req, res) => {
    try {
        const courseStats = await User.aggregate([
            { $unwind: "$courses" },
            {
                $group: {
                    _id: { course: "$courses.courseCode" },
                    totalEnrollment: { $sum: 1 },
                    averageGrade: {
                        $avg: {
                            $switch: {
                                branches: [
                                    { case: { $eq: ["$courses.grade", "A"] }, then: 4 },
                                    { case: { $eq: ["$courses.grade", "B"] }, then: 3 },
                                    { case: { $eq: ["$courses.grade", "C"] }, then: 2 },
                                    { case: { $eq: ["$courses.grade", "D"] }, then: 1 },
                                    { case: { $eq: ["$courses.grade", "F"] }, then: 0 }
                                ],
                                default: null // Exclude non-GPA grades from the calculation
                            }
                        }
                    }
                }
            }
        ]);

        console.log(courseStats);
        res.status(200).json(courseStats);
    } catch (err) {
        console.error("Error fetching course stats:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.get("/reports/instructor-students", verifyToken, authorizeRoles("instructor", "staff"), async (req, res) => {
    try {
        const instructorStats = await User.aggregate([
            { $match: { role: "instructor" } },
            { $unwind: "$instructor_courses" },
            {
                $lookup: {
                    from: "users", // Assuming "users" is the name of the collection for User model
                    localField: "instructor_courses.course_code",
                    foreignField: "courses.courseCode",
                    as: "students"
                }
            },
            { $unwind: "$students" },
            {
                $group: {
                    _id: { instructor: "$username", major: "$students.major" },
                    totalStudents: { $sum: 1 }
                }
            }
        ]);
        res.status(200).json(instructorStats);
    } catch (err) {
        console.error("Error fetching instructor student stats:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.get("/reports/students-by-major", verifyToken, authorizeRoles("staff"), async (req, res) => {
    try {
        const studentsByMajor = await User.aggregate([
            // Step 1: Match only students
            { $match: { role: "student", courses: { $exists: true, $ne: [] } } },

            // Step 2: Project the necessary fields and calculate totalCredits
            {
                $project: {
                    username: 1,
                    major: 1,
                    totalCredits: { $multiply: [{ $size: "$courses" }, 3] }
                }
            },

            // Step 3: Group students by major
            {
                $group: {
                    _id: "$major",
                    students: {
                        $push: { username: "$username", totalCredits: "$totalCredits" }
                    }
                }
            },

            // Step 4: Sort students within each major by totalCredits (descending)
            {
                $project: {
                    _id: 1,
                    students: {
                        $sortArray: { input: "$students", sortBy: { totalCredits: -1 } }
                    }
                }
            },

            // Step 5: Sort majors alphabetically (optional)
            { $sort: { _id: 1 } }
        ]);

        res.status(200).json(studentsByMajor);
    } catch (err) {
        console.error("Error fetching students by major:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});


// Start the server
const PORT = process.env.PORT || 7001;

// Run it
// listen to the app
// listen to a port which also gives a callback function
app.listen(PORT, () => {
    console.log(`Server is running at port ${PORT}`);
});