const crypto = require("crypto");
const { instance } = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const CourseProgress = require("../models/CourseProgress");
const mailSender = require("../utils/mailSender");
const { courseEnrollmentEmail } = require("../mail/courseEnrollmentEmail");
const { paymentSuccessEmail } = require("../mail/paymentSuccessEmail");

exports.capturePayment = async (req, res) => {
  const { courses = [] } = req.body;
  const userId = req.user.id;

  if (!Array.isArray(courses) || courses.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Please provide course ids",
    });
  }

  let totalAmount = 0;

  for (const courseId of courses) {
    try {
      const course = await Course.findById(courseId);

      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Could not find the course",
        });
      }

      if (course.studentsEnrolled.includes(userId)) {
        return res.status(400).json({
          success: false,
          message: "Student is already enrolled in the course",
        });
      }

      totalAmount += course.price;
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error during payment",
      });
    }
  }

  const options = {
    amount: totalAmount * 100,
    currency: "INR",
    receipt: `${userId}_${Date.now()}`,
  };

  try {
    const paymentResponse = await instance.orders.create(options);
    return res.status(200).json({
      success: true,
      data: paymentResponse,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.verifySignature = async (req, res) => {
  try {
    const { orderId, paymentId, amount, courses } = req.body;
    const userId = req.user.id;

    if (!orderId || !paymentId || !amount || !userId || !courses) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];
    const shasum = crypto.createHmac("sha256", webhookSecret);

    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if (digest !== signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid signature",
      });
    }

    await enrollStudents(courses, userId);
    await sendPaymentSuccessEmail(userId, orderId, paymentId, amount);

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const sendPaymentSuccessEmail = async (userId, orderId, paymentId, amount) => {
  const enrolledStudent = await User.findById(userId);

  if (!enrolledStudent) {
    throw new Error("User not found");
  }

  await mailSender(
    enrolledStudent.email,
    "Payment Received",
    paymentSuccessEmail(
      `${enrolledStudent.firstName} ${enrolledStudent.lastName}`,
      amount / 100,
      orderId,
      paymentId
    )
  );
};

exports.sendPaymentSuccessEmail = sendPaymentSuccessEmail;

const enrollStudents = async (courses, userId) => {
  try {
    if (!courses || !userId) {
      throw new Error("Please provide course IDs and User ID");
    }

    const enrolledStudent = await User.findById(userId);

    if (!enrolledStudent) {
      throw new Error("User not found");
    }

    for (const courseId of courses) {
      const courseEnrolled = await Course.findByIdAndUpdate(
        courseId,
        { $addToSet: { studentsEnrolled: userId } },
        { new: true }
      );

      if (!courseEnrolled) {
        throw new Error(`Course not found: ${courseId}`);
      }

      await CourseProgress.create({
        courseId,
        userId,
        completedVideos: [],
      });

      const userEnrolled = await User.findByIdAndUpdate(
        userId,
        { $addToSet: { courses: courseId } },
        { new: true }
      );

      await mailSender(
        userEnrolled.email,
        `Successfully enrolled into ${courseEnrolled.courseName}`,
        courseEnrollmentEmail(
          courseEnrolled.courseName,
          `${userEnrolled.firstName} ${userEnrolled.lastName}`
        )
      );
    }
  } catch (error) {
    console.error("Enrollment Error:", error);
    throw error;
  }
};

exports.enrollStudents = enrollStudents;