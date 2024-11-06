// arrow function

// destructure allowedRoles
const authorizeRoles = (...allowedRoles) => {
    // return an arrow function
    return (req, res, next) => {
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({message : "Access denied (role-restriction)"});
        }
        // forward the request
        next();

    }

}

module.exports = authorizeRoles;
// We will use this authorizeRoles in the userRoutes
