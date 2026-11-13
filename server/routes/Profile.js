const express = require("express")
const router = express.Router()
const { auth, isInstructor } = require("../middlewares/auth")

const {
    deleteAccount,
    createProfile,
    getAllDetails

} = require("../controllers/Profile");


router.delete("/deleteProfile", auth, deleteAccount);
router.post("/createProfile", auth, createProfile);
router.get("/getUserDetails", auth, getAllDetails);

module.exports = router;