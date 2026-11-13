const Course = require("../models/Course");
const User = require("../models/User");
const Category = require("../models/Category");

exports.createCourse = async (req, res) => {
  try {
    const { courseName, courseDescription, whatYouWillLearn, price, category, thumbnail } = req.body;
    const userId = req.user.id;

    if (!courseName || !courseDescription || !whatYouWillLearn || !price || !category) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const instructorDetails = await User.findById(userId);

    if (!instructorDetails) {
      return res.status(404).json({
        success: false,
        message: "Instructor details not found",
      });
    }

    const categoryDetails = await Category.findById(category);

    if (!categoryDetails) {
      return res.status(404).json({
        success: false,
        message: "Category details not found",
      });
    }

    const newCourse = await Course.create({
      courseName,
      courseDescription,
      whatYouWillLearn,
      instructor: instructorDetails._id,
      price,
      category: categoryDetails._id,
      thumbnail: thumbnail || "https://placehold.co/600x400",
      status: "Draft",
    });

    await User.findByIdAndUpdate(
      instructorDetails._id,
      { $push: { courses: newCourse._id } },
      { new: true }
    );

    await Category.findByIdAndUpdate(
      categoryDetails._id,
      { $push: { courses: newCourse._id } },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Course created successfully",
      data: newCourse,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Error occurred during course creation",
    });
  }
};

exports.getAllCourses = async (req, res) => {
  try {
    const allCourses = await Course.find({ status: "Published" }, {
      courseName: true,
      price: true,
      thumbnail: true,
      instructor: true,
      ratingAndReviews: true,
      studentsEnrolled: true,
    })
      .populate("instructor")
      .exec();

    return res.status(200).json({
      success: true,
      data: allCourses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching all courses",
    });
  }
};

exports.getCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body;
    const courseDetails = await Course.findById(courseId)
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .exec();

    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: `Could not find the course with course id ${courseId}`,
      });
    }

    return res.status(200).json({
      success: true,
      data: courseDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};