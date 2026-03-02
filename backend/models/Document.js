const mongoose = require('mongoose');

const documentSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true }, // Cloudinary URL
    publicId: { type: String, required: true }, // Cloudinary public ID for deletions
    type: { 
        type: String, 
        enum: ['id', 'certificate', 'cv', 'other'], 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['pending', 'verified', 'rejected'], 
        default: 'pending' 
    },
    verifiedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);
