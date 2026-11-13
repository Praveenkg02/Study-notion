const cloudinary = require('cloudinary').v2

exports.uploadImageToCloudinary = async(file ,folder , height,quality) => {

    try {
    console.log("In Cloudinary uploader");

    const options = {
      folder,
      resource_type: "auto",
    };

    if (height) {
      options.height = height;
    }

    if (quality) {
      options.quality = quality;
    }

    const response = await cloudinary.uploader.upload(
      file.tempFilePath,
      options
    );

    console.log("Upload Success:", response);

    return response;
  } catch (err) {
    console.error("Cloudinary Upload Error:");
    console.error(err);

    throw err; // Pass the error back to the controller
  }
} 