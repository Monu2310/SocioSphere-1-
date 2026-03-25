const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const isCloudinaryConfigured = () => {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) return false;
  if (
    CLOUDINARY_CLOUD_NAME.startsWith('your_') ||
    CLOUDINARY_API_KEY.startsWith('your_') ||
    CLOUDINARY_API_SECRET.startsWith('your_')
  ) {
    return false;
  }
  return true;
};

const uploadImage = async (filePath, folder = 'sociosphere') => {
  if (!isCloudinaryConfigured()) {
    const err = new Error('Cloudinary is not configured.');
    err.code = 'CLOUDINARY_NOT_CONFIGURED';
    throw err;
  }

  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: 'image',
    transformation: [{ width: 800, height: 600, crop: 'limit', quality: 'auto' }],
  });
  return result.secure_url;
};

const deleteImage = async (publicId) => {
  await cloudinary.uploader.destroy(publicId);
};

module.exports = { cloudinary, uploadImage, deleteImage, isCloudinaryConfigured };
