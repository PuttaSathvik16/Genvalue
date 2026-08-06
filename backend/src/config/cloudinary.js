import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload base64 image to Cloudinary
 * @param {string} base64Image - Base64 encoded image string
 * @param {string} folder - Cloudinary folder name
 * @param {string} publicId - Optional public ID for the image
 * @returns {Promise<object>} - Cloudinary upload response
 */
export const uploadBase64Image = async (base64Image, folder = 'profile-pictures', publicId = null) => {
  try {
    const uploadOptions = {
      folder: folder,
      resource_type: 'image',
      transformation: [
        { width: 500, height: 500, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'auto' }
      ],
    };

    if (publicId) {
      uploadOptions.public_id = publicId;
      uploadOptions.overwrite = true;
    }

    const result = await cloudinary.uploader.upload(base64Image, uploadOptions);
    
    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/** Blog/dispatch cover — 16:9, no face crop */
export const uploadBlogCoverBase64 = async (base64Image, publicId = null) => {
  try {
    const uploadOptions = {
      folder: "genvalue-academy/dispatch-covers",
      resource_type: "image",
      transformation: [
        { width: 1200, height: 675, crop: "fill", gravity: "auto" },
        { quality: "auto", fetch_format: "auto" },
      ],
    };

    if (publicId) {
      uploadOptions.public_id = publicId;
      uploadOptions.overwrite = true;
    }

    const result = await cloudinary.uploader.upload(base64Image, uploadOptions);

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    console.error("Cloudinary blog cover upload error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Cloudinary public ID of the image
 * @returns {Promise<object>} - Deletion result
 */
export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return {
      success: result.result === 'ok',
      result: result.result,
    };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/** Bug report screenshot — preserve aspect ratio, max width */
export const uploadBugScreenshotBase64 = async (base64Image) => {
  try {
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: "genvalue-academy/bug-reports",
      resource_type: "image",
      transformation: [
        { width: 1400, crop: "limit" },
        { quality: "auto", fetch_format: "auto" },
      ],
    });

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error("Cloudinary bug screenshot upload error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export default cloudinary;
