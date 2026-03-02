const JobSeeker = require('../models/JobSeeker');
const AccessRequest = require('../models/AccessRequest');

// @desc    Get pending access requests for jobseeker
// @route   GET /api/jobseekers/requests
// @access  Private/JobSeeker
const getMyPendingRequests = async (req, res) => {
    const jobSeeker = await JobSeeker.findOne({ user: req.user._id });
    if (!jobSeeker) {
        return res.status(404).json({ message: 'JobSeeker profile not found' });
    }

    const requests = await AccessRequest.find({
        jobSeeker: jobSeeker._id,
        status: 'pending'
    }).populate('employer', 'companyName name');

    res.json(requests);
};

// @desc    Approve access request with PIN
// @route   POST /api/jobseekers/approve-request
// @access  Private/JobSeeker
const approveRequest = async (req, res) => {
    const { requestId, pin } = req.body;

    const jobSeeker = await JobSeeker.findOne({ user: req.user._id }).populate('user', 'name email profilePicture phone');
    if (!jobSeeker) {
        return res.status(404).json({ message: 'JobSeeker profile not found' });
    }

    // Verify PIN
    if (jobSeeker.consentPin !== pin) {
        return res.status(401).json({ message: 'Invalid PIN' });
    }

    const accessRequest = await AccessRequest.findById(requestId);
    if (!accessRequest) {
        return res.status(404).json({ message: 'Access request not found' });
    }

    accessRequest.status = 'approved';
    // attach full profile data for employer to view now
    accessRequest.fullProfileData = {
        name: jobSeeker.firstName + ' ' + jobSeeker.lastName,
        email: jobSeeker.user.email,
        phone: jobSeeker.phone,
        profilePicture: jobSeeker.user.profilePicture,
    };

    await accessRequest.save();

    res.json({ message: 'Request approved. Employer can now see your full profile.' });
};

// @desc    Reject access request
// @route   POST /api/jobseekers/reject-request
// @access  Private/JobSeeker
const rejectRequest = async (req, res) => {
    const { requestId } = req.body;

    const accessRequest = await AccessRequest.findById(requestId);
    if (!accessRequest) {
        return res.status(404).json({ message: 'Access request not found' });
    }

    accessRequest.status = 'rejected';
    await accessRequest.save();

    res.json({ message: 'Request rejected.' });
};

module.exports = {
    getMyPendingRequests,
    approveRequest,
    rejectRequest,
};
