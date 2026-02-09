const cloudinary = require("./cloudinaryConfig");

const uploadToCloudinary = (fileBuffer, folder = "employees") => {
  return new Promise((resolve, reject) => {
    if (!fileBuffer) {
      return reject(new Error("No file buffer provided"));
    }

    cloudinary.uploader
      .upload_stream({ folder }, (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      })
      .end(fileBuffer);
  });
};

module.exports = uploadToCloudinary;
