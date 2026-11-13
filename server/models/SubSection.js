const mongoose = require("mongoose");

const subSection = new mongoose.Schema({
    title:{
        type: String,
        required: true,
    },
    timeDuration:{
        type: String,
        required: true,
    },
    videoUrl:{
        type: String,
        required: true,
    },
    description:{
        type: String,

    }
})

module.exports = mongoose.model("SubSections", subSection);