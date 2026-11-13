const OTP = require("../models/OTP");
const User = require("../models/User");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const Profile = require("../models/Profile");
const jwt = require("jsonwebtoken");
const mailSender = require("../utils/mailSender")

const generateOTP = async () => {
  let otp;
  let existingOTP;

  do {
    otp = otpGenerator.generate(6, {
      upperCaseAlphabet: false,
      lowerCaseAlphabet: false,
      specialChars: false,
    });

    existingOTP = await OTP.findOne({ otp });
  } while (existingOTP);

  return otp;
};

exports.sendOTP = async (req, res) => {

  
  try {
    console.log(req.body);
    const {email} = req.body;

    if(!email){
      return res.status(404).json({
        success: false,
        message: "No email found"
      })
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const otp = await generateOTP();
    const hashedOTP = await bcrypt.hash(otp, 10);

    await OTP.create({ email, otp: hashedOTP });

    await mailSender(
      email,
      "OTP for Study Notion signup",
      `<p>Your OTP is <b>${otp}</b>. It will expire in 5 minutes.</p>`
    );

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (err) {

    return res.status(500).json({
      success: false,
      message: "An error occurred while sending OTP, in sendOTP controller",
    });
  }
};

exports.signUp = async (req, res) => {
  try {
    const { firstName, lastName, email, password, confirmPassword, contactNumber, accountType, otp } = req.body;

    if (!firstName || !lastName || !email || !password || !confirmPassword || !contactNumber || !accountType || !otp) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password not matched",
      });
    }

    const dbOTP = await OTP.findOne({ email }).sort({ _id: -1 });

    if (!dbOTP) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    const isOtpValid = await bcrypt.compare(otp, dbOTP.otp);

    if (!isOtpValid) {
      return res.status(400).json({
        success: false,
        message: "OTP not matched",
      });
    }

    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: null,
    });

    const hashedPassword = await bcrypt.hash(password, 10);

    const userPayload = {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      contactNumber,
      role: accountType,
      additionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${encodeURIComponent(`${firstName} ${lastName}`)}&chars=2`,
    }
    const user = await User.create(userPayload);
    const userObj = user.toObject();
    delete userObj.password;

    await OTP.deleteMany({ email });

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      userObj,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Error occurred during signup",
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User is not registered",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const payload = {
      id: user._id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    user.token = token;
    await user.save();

    const options = {
      maxAge: 3 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    };

    res.cookie("token", token, options).status(200).json({
      success: true,
      token,
      user,
      message: "Logged in successfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "An error occurred during login",
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    if (!userId || !oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const user = await User.findById(userId).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const passwordMatch = await bcrypt.compare(oldPassword, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      success: false,
      message: "Error during password change",
    });
  }
};