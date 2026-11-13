const Profile = require("../models/Profile");
const User = require("../models/User");
const Course = require("../models/Course");
const CourseProgress = require("../models/CourseProgress");

exports.createProfile = async (req, res) => {
  try {
    const {
      firstName = "",
      lastName = "",
      dateOfBirth = "",
      gender = "",
      about = "",
      contactNumber = "",
    } = req.body;

    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const profile = await Profile.findById(user.additionalDetails);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    await user.save();

    profile.dateOfBirth = dateOfBirth || profile.dateOfBirth;
    profile.about = about || profile.about;
    profile.gender = gender || profile.gender;
    profile.contactNumber = contactNumber || profile.contactNumber;
    await profile.save();

    const updatedUserDetails = await User.findById(userId).populate("additionalDetails").exec();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUserDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error during profile creation",
    });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const id = req.user.id;
    const userDetails = await User.findById(id);

    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (userDetails.additionalDetails) {
      await Profile.findByIdAndDelete(userDetails.additionalDetails);
    }

    for (const courseId of userDetails.courses || []) {
      await Course.findByIdAndUpdate(
        courseId,
        { $pull: { studentsEnrolled: id } },
        { new: true }
      );
    }

    await User.findByIdAndDelete(id);
    await CourseProgress.deleteMany({ userId: id });

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error during account deletion",
    });
  }
};

exports.getAllDetails = async (req, res) => {
  try {
    const id = req.user.id;
    const userDetails = await User.findById(id).populate("additionalDetails").exec();

    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: userDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error during fetching all user details",
    });
  }
};