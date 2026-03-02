const mongoose = require('mongoose');

const accessRequestSchema = mongoose.Schema({
    employer: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    jobSeeker: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'JobSeeker'
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    message: { type: String }, // Optional message from employer
    // Data visible only AFTER approval
    fullProfileData: { type: Object } 
}, { timestamps: true });

module.exports = mongoose.model('AccessRequest', accessRequestSchema);
