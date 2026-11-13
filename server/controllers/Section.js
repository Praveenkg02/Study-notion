const Course = require("../models/Course")
const Section = require("../models/Section")
const SubSection = require("../models/SubSection")

//Create a new Section

exports.createSection = async (req, res) =>{

    try{

        const {sectionName, courseId} = req.body;

    if(!sectionName || !courseId){

        res.status(400).json({
            success: false,
            message: "All fields are required"
        })
    }

    const newSection = await Section.create({sectionName});

    const updateCourse = await Course.findByIdAndUpdate( courseId,
        {
            $push:{
                courseContent: newSection._id,
            },
        },
        {new : true}
    ).populate({
        path: "CourseContent",
        populate:{
            path: "subSection"
        }
    }).exec()

    return res.status(200).json({
        success: true,
        message: "Section is created successfully",
        updateCourse,
    })


        
    }catch(error){
        return res.status(500).json({
            success: false,
            message: "Error during section creation",
            error: error.message
        })
    }
}


//UPDATE a section 

exports.updateSection = async(req,res) => {

    try{

        const {courseId, sectionId, sectionName} = req.body;

        if(!courseId || !sectionId || !sectionName){
            res.status(400).json({
                success: false,
                message: "All fields are required",
            })
        }

        const section = await Section.findByIdAndUpdate(sectionId,
            {
                sectionName,
            },
            {new: true}
        )

        const course = await Course.findById(courseId).populate({
            path:"courseContent",
            populate:{
                path:"subSection"
            }
        })

        return res.status(200).json({
            success: true,
            message: "Sub Section updated successfully",
            data:course
        })

    }catch(error){

        return res.status(500).json({
            success: false,
            message: "Error during section updation"
        })
    }
}

//Delete a Section

exports.deleteSection = async(req,res) => {

    try{

        const {sectionId, courseId} = req.body;

        //Pull the section from courseSection before deleting otherwise it will keep finding
        await Course.findById(courseId, {
            $pull:{
                courseContent: sectionId
            }
        }
        )

        const section = await Section.findById(sectionId);
        console.log(sectionId, courseId);

        if(!section){
            return res.status(404).json({
                success: false,
                message:"No section found",
            })
        }

        //delete subSection
        await SubSection.deleteMany({_id: {$in: section.subSection}})

        //delete section
        await Section.findByIdAndDelete(sectionId)

        //find the updated course and return 
        const course = await Course.findById(courseId).populate({
            path:"courseContent",
            populate:{
                path:"subSection"
            }
        }).exec();

        return res.status(200).json({
            success: true,
            message: "Sub Section deleted successfully",
            data: course
        })

    }catch(error){

        return res.status(500).json({
            success: false,
            message:"Error during section deletion"
        })
    }
}