const User = require("../models/User");
const mailsender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

exports.resetPasswordToken = async (req, res) => {
  try {
    const { email } = req.body;
    const isUser = await User.findOne({ email });

    if (!isUser) {
      return res.json({
        success: false,
        message: `This Email: ${email} is not registered`,
      });
    }

    const token = crypto.randomUUID();

    const updatedDetails = await User.findOneAndUpdate(
      { email },
      {
        token,
        resetPasswordExpires: Date.now() + 3600000,
      },
      { new: true }
    );

    const url = `http://localhost:3000/update-password/${token}`;

    await mailsender(
      email,
      "Password Reset",
      `Your link for email verification is ${url}. Please click this to reset your password.`
    );

    return res.status(200).json({
      success: true,
      message: "Email sent successfully. Please check your email to continue",
      data: updatedDetails,
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      success: false,
      message: "Error occurred in sending reset password token",
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { password, confirmPassword, token } = req.body;

    if (confirmPassword !== password) {
      return res.status(401).json({
        success: false,
        message: "Password and Confirm password do not match",
      });
    }

    const userDetails = await User.findOne({ token });

    if (!userDetails) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    if (userDetails.resetPasswordExpires < Date.now()) {
      return res.status(403).json({
        success: false,
        message: "Token is expired",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.findOneAndUpdate(
      { token },
      { password: hashedPassword },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      success: false,
      message: "Error occurred during password reset",
    });
  }
};