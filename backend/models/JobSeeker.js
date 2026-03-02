const mongoose = require('mongoose');

const jobSeekerSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    // Identifying information (hidden from initial search)
    firstName: { type: String, default: '' },
    lastName:  { type: String, default: '' },
    phone:     { type: String, default: '' },
    
    // Merit-based information (visible in search)
    title: { type: String, default: 'New Talent' },
    skills: [{ type: String }],
    experience: { type: Number, default: 0 }, // Years of experience
    education: [{
        institution: String,
        degree: String,
        year: Number
    }],
    summary: { type: String },
    location: { type: String },
    
    // Anonymization & Consent
    isVerified: { type: Boolean, default: false },
    consentPin: { type: String, required: true }, // Generated PIN for employer access
    documents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document'
    }]
}, { timestamps: true });

module.exports = mongoose.model('JobSeeker', jobSeekerSchema);
