const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        const isPDF = file.originalname.toLowerCase().endsWith('.pdf');
        return {
            folder: 'nexus_talent_kenya',
            allowed_formats: ['jpg', 'png', 'jpeg', 'pdf'],
            resource_type: isPDF ? 'raw' : 'image',
        };
    },
});

const upload = multer({ storage: storage });

module.exports = { cloudinary, upload };
