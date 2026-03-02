const mongoose = require('mongoose');

const employerSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    companyName: { type: String, required: true },
    website: { type: String },
    industry: { type: String },
    location: { type: String },
    description: { type: String },
    // A list of access requests sent to jobseekers
    accessRequests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AccessRequest'
    }]
}, { timestamps: true });

module.exports = mongoose.model('Employer', employerSchema);
