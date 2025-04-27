const cloudinary = require('../config/cloudinary');

/**
 * Uploads a file to Cloudinary.
 * @param {string} filePath - The local path of the file to upload.
 * @param {string} folder - The Cloudinary folder where the file will be stored.
 * @returns {Promise<string>} - The URL of the uploaded file.
 */
const uploadToCloudinary = async (filePath, folder) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder, // Specify the folder in Cloudinary
    });
    return result.secure_url; // Return the URL of the uploaded file
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

module.exports = uploadToCloudinary;