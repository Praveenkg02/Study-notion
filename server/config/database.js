const mongoose = require("mongoose");

exports.connect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected to MongoDB");
    } catch (err) {
        console.error("Error connecting to MongoDB");
        console.error(err);
        process.exit(1);
    }
};