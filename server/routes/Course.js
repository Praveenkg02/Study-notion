// Import the required modules
const express = require("express")
const router = express.Router()

//Course controller import
const {
    createCourse,
    getAllCourses,
    getCourseDetails
} = require("../controllers/Course");

//Categories Controller Import
const {
    createCategory,
    showAllCategories,
    categoryPageDetails

} = require("../controllers/Category")

//Sections Controllers import

const {
    createSection,
    updateSection,
    deleteSection
} = require("../controllers/Section")

//Subsection Controllers

const{
    createSubSection,
    updateSubSection,
    deleteSubSection
} = require("../controllers/SubSection")

//Rating and reviews Subsetion

const {
    createRating,
    getAllRating,
    getAverageRating
}= require("../controllers/RatingAndReviews");

//Importing middleware

const {auth, isAdmin, isInstructor, isStudent} = require("../middlewares/auth")


// Course ROutes

router.post("/createCourse", auth, isInstructor, createCourse);

router.post("/addSection", auth, isInstructor, createSection);

router.post("/updateSection", auth, isInstructor, updateSection);

router.post("/deleteSection", auth, isInstructor, deleteSection);

router.post("/addSubSection", auth, isInstructor, createSubSection);

router.post("/updateSubSection", auth, isInstructor, updateSubSection);

router.post("/deleteSubSection", auth, isInstructor, deleteSubSection);

router.get("/getAllCourses", getAllCourses)

router.post("/getCourseDetails", getCourseDetails)

//Category routes --> Only by Admin

router.post("/createCategory", auth, isAdmin, createCategory)
router.get("/showAllCategories", showAllCategories)
router.post("/getCategoryPageDetails", categoryPageDetails)

//Rating and review

router.post("/createRating", auth, isStudent, createRating)
router.get("/getAverageRating", getAverageRating)
router.get("/getReviews", getAllRating)

module.exports = router;