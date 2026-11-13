const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.auth = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.body.token || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is missing",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.log(err);
    return res.status(401).json({
      success: false,
      message: "Something went wrong during token validation",
    });
  }
};

exports.isStudent = async (req, res, next) => {
  try {
    const userDetails = await User.findById(req.user.id);

    if (!userDetails || userDetails.role !== "Student") {
      return res.status(403).json({
        success: false,
        message: "This route is only for students",
      });
    }

    next();
  } catch (err) {
    console.log(err);
    return res.status(401).json({
      success: false,
      message: "User role could not be verified",
    });
  }
};

exports.isInstructor = async (req, res, next) => {
  try {
    const userDetails = await User.findById(req.user.id);

    if (!userDetails || userDetails.role !== "Instructor") {
      return res.status(403).json({
        success: false,
        message: "This route is only for instructors",
      });
    }

    next();
  } catch (err) {
    console.log(err);
    return res.status(401).json({
      success: false,
      message: "Error occurred during role validation",
    });
  }
};

exports.isAdmin = async (req, res, next) => {
  try {
    const userDetails = await User.findById(req.user.id);

    if (!userDetails || userDetails.role !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "This route is only for admins",
      });
    }

    next();
  } catch (err) {
    console.log(err);
    return res.status(401).json({
      success: false,
      message: "Error occurred during role validation",
    });
  }
};
