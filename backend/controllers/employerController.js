const JobSeeker = require('../models/JobSeeker');
const Employer = require('../models/Employer');
const AccessRequest = require('../models/AccessRequest');

// @desc    Search for talent (anonymized)
// @route   GET /api/employers/search
// @access  Private/Employer
const searchTalent = async (req, res) => {
    const { title, skills, location, minExperience } = req.query;

    let query = { isVerified: true };

    if (title) query.title = { $regex: title, $options: 'i' };
    if (location) query.location = { $regex: location, $options: 'i' };
    if (minExperience) query.experience = { $gte: Number(minExperience) };
    if (skills) {
        const skillsArray = skills.split(',').map(skill => skill.trim());
        query.skills = { $all: skillsArray };
    }

    // Return only anonymized fields
    const talents = await JobSeeker.find(query)
        .select('title skills experience education summary location isVerified user')
        .populate('user', 'profilePicture'); // Return profile picture if available

    res.json(talents);
};

// @desc    Request access to jobseeker full profile
// @route   POST /api/employers/request-access
// @access  Private/Employer
const requestAccess = async (req, res) => {
    const { jobSeekerId, message } = req.body;

    const employer = await Employer.findOne({ user: req.user._id });
    if (!employer) {
        return res.status(404).json({ message: 'Employer profile not found' });
    }

    const jobSeeker = await JobSeeker.findById(jobSeekerId);
    if (!jobSeeker) {
        return res.status(404).json({ message: 'JobSeeker not found' });
    }

    // Check if request already exists
    const existingRequest = await AccessRequest.findOne({
        employer: req.user._id,
        jobSeeker: jobSeekerId,
        status: 'pending'
    });

    if (existingRequest) {
        return res.status(400).json({ message: 'Request already pending' });
    }

    const accessRequest = await AccessRequest.create({
        employer: req.user._id,
        jobSeeker: jobSeekerId,
        message,
    });

    employer.accessRequests.push(accessRequest._id);
    await employer.save();

    res.status(201).json(accessRequest);
};

// @desc    Get access request status
// @route   GET /api/employers/requests
// @access  Private/Employer
const getMyRequests = async (req, res) => {
    const requests = await AccessRequest.find({ employer: req.user._id })
        .populate({
            path: 'jobSeeker',
            populate: [
                { path: 'user', select: 'name email profilePicture' },
                { path: 'documents' }
            ]
        })
        .sort('-createdAt');
    res.json(requests);
};

// @desc    Get all unique available job titles from verified talent
// @route   GET /api/employers/available-titles
// @access  Private/Employer
const getAvailableTitles = async (req, res) => {
    try {
        const titles = await JobSeeker.distinct('title', { isVerified: true });
        // Clean up empty/null and sort alphabetically
        const cleanTitles = titles.filter(t => t && t.trim().length > 0).sort();
        res.json(cleanTitles);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch titles' });
    }
};

module.exports = {
    searchTalent,
    requestAccess,
    getMyRequests,
    getAvailableTitles,
};
