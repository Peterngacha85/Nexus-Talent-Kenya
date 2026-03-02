const JobSeeker = require('../models/JobSeeker');
const User = require('../models/User');
const Document = require('../models/Document');

// @desc    Get current jobseeker profile
// @route   GET /api/jobseekers/profile
// @access  Private/JobSeeker
const getMyProfile = async (req, res) => {
    const profile = await JobSeeker.findOne({ user: req.user._id }).populate('user', 'name email profilePicture');
    if (profile) {
        res.json(profile);
    } else {
        res.status(404).json({ message: 'Profile not found' });
    }
};

// @desc    Update jobseeker profile
// @route   PUT /api/jobseekers/profile
// @access  Private/JobSeeker
const updateMyProfile = async (req, res) => {
    const profile = await JobSeeker.findOne({ user: req.user._id });

    if (profile) {
        profile.firstName = req.body.firstName || profile.firstName;
        profile.lastName = req.body.lastName || profile.lastName;
        profile.phone = req.body.phone || profile.phone;
        profile.title = req.body.title || profile.title;
        profile.skills = req.body.skills || profile.skills;
        profile.experience = req.body.experience || profile.experience;
        profile.education = req.body.education || profile.education;
        profile.summary = req.body.summary || profile.summary;
        profile.location = req.body.location || profile.location;

        const updatedProfile = await profile.save();
        res.json(updatedProfile);
    } else {
        res.status(404).json({ message: 'Profile not found' });
    }
};

// @desc    Upload document
// @route   POST /api/jobseekers/upload
// @access  Private/JobSeeker
const uploadDocument = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const { type, fileName } = req.body;

    const document = await Document.create({
        user: req.user._id,
        fileName: fileName || req.file.originalname,
        fileUrl: req.file.path,
        publicId: req.file.filename,
        type: type || 'other',
    });

    if (document) {
        const profile = await JobSeeker.findOne({ user: req.user._id });
        profile.documents.push(document._id);
        await profile.save();

        res.status(201).json(document);
    } else {
        res.status(400).json({ message: 'Invalid document data' });
    }
};

module.exports = {
    getMyProfile,
    updateMyProfile,
    uploadDocument,
};
