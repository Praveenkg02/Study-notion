const express = require("express");
const router = express.Router()

//import required controllers 
const {
    login,
    signUp,
    sendOTP,
    changePassword
} = require("../controllers/Auth");

const {
    resetPasswordToken,
    resetPassword,
} = require("../controllers/ResetPassword");

const {auth} = require("../middlewares/auth");

//Routes for Login, SignUp, and Authentication

router.post("/login", login);

router.post("/signup", signUp);

router.post("/sendotp", sendOTP);

router.post("/changepassword", auth, changePassword);


//Reset password

router.post("/reset-password-token", resetPasswordToken);

router.post("/reset-password", resetPassword);

module.exports = router;
