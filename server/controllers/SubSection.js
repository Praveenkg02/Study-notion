const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const imageUploader = require("../utils/imageUploader")

//Create SubSection

exports.createSubSection = async (req, res) => {
  
  try {
    //fetch details

    

    const { sectionId, title, description } = req.body;
    const video = req.files?.video;

    console.log("here")
    //validate the details
    if (!sectionId || !title || !description || !video) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    console.log("heree")
    
    //upload to cloudinary
    const uploadDetails = await imageUploader.uploadImageToCloudinary(
      video,
      process.env.FOLDER_NAME,
    );

    //create a subsection
    const SubSectionDetails = await SubSection.create({
      title,
      timeDuration: `${uploadDetails.duration}`,
      description,
      videoUrl: uploadDetails.secure_url,
    });

    const updatedSection = await Section.findByIdAndUpdate(
      { _id: sectionId },
      { $push: { subSection: SubSectionDetails._id } },
      { new: true },
    ).populate("subSection");

    return res.status(200).json({
      success: true,
      message: "Sub Section created successfully",
      data: updatedSection,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      message: "Internal server error while creating Sub Section",
      
    });
  }
};

//Update the Subsection

exports.updateSubSection = async (req, res) => {
  try {
    const { title, description, sectionId, subSectionId } = req.body;
    const video = req.files?.video;

    if (!sectionId || !subSectionId) {
      return res.status(400).json({
        success: false,
        message: "Section ID and sub-section ID are required",
      });
    }

    const subSectionDoc = await SubSection.findById(subSectionId);

    if (!subSectionDoc) {
      return res.status(404).json({
        success: false,
        message: "No subsection found",
      });
    }

    if (title !== undefined) {
      subSectionDoc.title = title;
    }

    if (description !== undefined) {
      subSectionDoc.description = description;
    }

    if (video) {
      const uploadDetails = await imageUploader.uploadImageToCloudinary(
        video,
        process.env.FOLDER_NAME,
      );

      subSectionDoc.videoUrl = uploadDetails.secure_url;
      subSectionDoc.timeDuration = `${uploadDetails.duration}`;
    }

    await subSectionDoc.save();

    const updatedSection = await Section.findById(sectionId).populate("subSection");

    return res.status(200).json({
      success: true,
      message: "Sub Section updated successfully",
      data: updatedSection,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error during subSection update",
      error: error.message,
    });
  }
};

//delete subsections

exports.deleteSubSection = async(req,res) => {

    try{

        const {sectionId, subSectionId} = req.body;

        if(!sectionId || !subSectionId){
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            })
        }

        await Section.findByIdAndUpdate(sectionId,
            {
                $pull:{
                    path:subSectionId,
                }
            }
        )

        await SubSection.findByIdAndDelete(subSectionId);

        const updatedSection = await Section.findById(sectionId).populate("subSection");

        return res.status(200).json({
            success: true,
            message: "Sub-Section deleted successfully",
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message: "Internal server error during sub section deletion"
        })
    }
}
