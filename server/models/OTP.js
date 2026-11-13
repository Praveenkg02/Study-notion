const mailSender = require("../utils/mailSender");
const mongoose = require('mongoose');

const OTPSchema = new mongoose.Schema({
    email:{
        type: String,
        required: true,

    },
    otp:{
        type: String,
        required: true,
    },
    createdAt:{
        type: Date,
        default: Date.now,
        expires: 300 // 5 minutes
    }
})

OTPSchema.index({ email: 1 }, { unique: true });

async function sendVerificationEmail(email, otp){

    try{

        const response = await mailSender(email, "Verification email from Study Notion", otp);
        console.log("OTP sent successfully: ", response);
        return response; 

    }catch(err){
        console.log("Error occured while sending OTP: ", err.message);
        throw err;
    }
}

module.exports = mongoose.model("OTP", OTPSchema);