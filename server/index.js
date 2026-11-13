const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser")
const cors = require("cors")
const fileUpload = require("express-fileupload");

const {cloudinaryConnect} = require("./config/cloudinary");
const database = require("./config/database");


const PORT = process.env.PORT || 4000;

//database connect
database.connect();
//middleWares
app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin:"http://localhost:3000",
        credentials: true
    })
)

app.use(
    fileUpload({
        useTempFiles: true,
        tempFileDir:"/tmp",
    })
)

//clodinary connection
cloudinaryConnect();


//Routes import
const userRoutes = require("./routes/User")
const profileRoutes = require("./routes/Profile")
const paymentRoutes = require("./routes/Payment")
const courseRoutes = require("./routes/Course")


//routes
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/payment", paymentRoutes);

//def Route

app.get("/", (req,res) => {
    return res.json({
        success: true,
        message: "Your server is running"
    })
})

app.listen(PORT, () => {
    console.log(`App is running at ${PORT}`);
})