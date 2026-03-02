const Document = require('../models/Document');
const JobSeeker = require('../models/JobSeeker');
const Employer = require('../models/Employer');
const User = require('../models/User');
const AccessRequest = require('../models/AccessRequest');

// @desc    Get dashboard stats & analytics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getStats = async (req, res) => {
    try {
        const now = new Date();
        const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const prev7Days = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

        const [
            totalUsers, totalJobSeekers, totalEmployers,
            newUsersThisWeek, newUsersPrevWeek,
            docStats, requestStats,
            topTitles, topLocations,
            recentUsers, recentDocs, recentRequests
        ] = await Promise.all([
            User.countDocuments(),
            JobSeeker.countDocuments(),
            Employer.countDocuments(),
            User.countDocuments({ createdAt: { $gte: last7Days } }),
            User.countDocuments({ createdAt: { $gte: prev7Days, $lt: last7Days } }),
            
            // Document distribution
            Document.aggregate([
                { $group: { _id: "$status", count: { $sum: 1 } } }
            ]),

            // Access Request distribution
            AccessRequest.aggregate([
                { $group: { _id: "$status", count: { $sum: 1 } } }
            ]),

            // Top Titles
            JobSeeker.aggregate([
                { $match: { title: { $exists: true, $ne: "" } } },
                { $group: { _id: "$title", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 5 }
            ]),

            // Top Locations
            JobSeeker.aggregate([
                { $match: { location: { $exists: true, $ne: "" } } },
                { $group: { _id: "$location", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 5 }
            ]),

            // Recent activity
            User.find().sort({ createdAt: -1 }).limit(5).select('name email role createdAt profilePicture'),
            Document.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name'),
            AccessRequest.find().sort({ createdAt: -1 }).limit(5).populate('employer', 'name').populate('jobSeeker', 'title')
        ]);

        // Format distributions into objects
        const docs = docStats.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), { pending: 0, verified: 0, rejected: 0 });
        const requests = requestStats.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), { pending: 0, approved: 0, rejected: 0 });

        res.json({
            summary: {
                totalUsers, totalJobSeekers, totalEmployers,
                growth: {
                    currentWeek: newUsersThisWeek,
                    prevWeek: newUsersPrevWeek,
                    percentage: newUsersPrevWeek === 0 ? 100 : Math.round(((newUsersThisWeek - newUsersPrevWeek) / newUsersPrevWeek) * 100)
                }
            },
            distributions: { docs, requests },
            topMetrics: { titles: topTitles, locations: topLocations },
            recentActivity: { users: recentUsers, docs: recentDocs, requests: recentRequests }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch complex stats' });
    }
};

// @desc    Get all pending documents for verification
// @route   GET /api/admin/documents
// @access  Private/Admin
const getPendingDocuments = async (req, res) => {
    const documents = await Document.find({ status: 'pending' }).populate('user', 'name email');
    res.json(documents);
};

// @desc    Verify or reject document
// @route   PUT /api/admin/documents/:id
// @access  Private/Admin
const verifyDocument = async (req, res) => {
    const { status } = req.body;
    const document = await Document.findById(req.params.id);

    if (document) {
        document.status = status;
        document.verifiedBy = req.user._id;
        await document.save();

        if (status === 'verified') {
            const jobSeeker = await JobSeeker.findOne({ user: document.user });
            if (jobSeeker) {
                jobSeeker.isVerified = true;
                await jobSeeker.save();
            }
        }

        res.json(document);
    } else {
        res.status(404).json({ message: 'Document not found' });
    }
};

// @desc    Get all jobseekers
// @route   GET /api/admin/jobseekers
// @access  Private/Admin
const getAllJobSeekers = async (req, res) => {
    const jobSeekers = await JobSeeker.find({})
        .populate('user', 'name email profilePicture')
        .populate('documents')
        .sort('-createdAt');
    res.json(jobSeekers);
};

// @desc    Toggle jobseeker verified status
// @route   PUT /api/admin/jobseekers/:id/verify
// @access  Private/Admin
const toggleJobSeekerVerification = async (req, res) => {
    const jobSeeker = await JobSeeker.findById(req.params.id);
    if (!jobSeeker) return res.status(404).json({ message: 'JobSeeker not found' });
    jobSeeker.isVerified = !jobSeeker.isVerified;
    await jobSeeker.save();
    res.json({ isVerified: jobSeeker.isVerified });
};

// @desc    Get all employers
// @route   GET /api/admin/employers
// @access  Private/Admin
const getAllEmployers = async (req, res) => {
    const employers = await Employer.find({})
        .populate('user', 'name email profilePicture')
        .sort('-createdAt');
    res.json(employers);
};

// @desc    Get all users (all roles)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
    const users = await User.find({}).select('-password').sort('-createdAt');
    res.json(users);
};

// @desc    Update a user (name, role)
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateAnyUser = async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Prevent changing own role
    if (user._id.toString() === req.user._id.toString()) {
        return res.status(400).json({ message: 'Cannot modify your own account here.' });
    }

    user.name = req.body.name || user.name;
    if (req.body.role && ['jobseeker', 'employer', 'admin'].includes(req.body.role)) {
        user.role = req.body.role;
    }
    await user.save();
    res.json({ _id: user._id, name: user.name, email: user.email, role: user.role });
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user._id.toString() === req.user._id.toString()) {
        return res.status(400).json({ message: 'Cannot delete your own admin account.' });
    }

    // Cascade-delete role profile
    if (user.role === 'jobseeker') await JobSeeker.deleteOne({ user: user._id });
    if (user.role === 'employer') await Employer.deleteOne({ user: user._id });

    await User.deleteOne({ _id: user._id });
    res.json({ message: 'User deleted successfully.' });
};

// @desc    Toggle user active status
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
const toggleUserStatus = async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user._id.toString() === req.user._id.toString()) {
        return res.status(400).json({ message: 'Cannot deactivate your own account.' });
    }

    // Explicitly check for false, everything else (true/undefined) is treated as active
    user.isActive = user.isActive === false ? true : false;
    await user.save();

    res.json({ _id: user._id, isActive: user.isActive });
};

module.exports = {
    getStats,
    getPendingDocuments,
    verifyDocument,
    getAllJobSeekers,
    toggleJobSeekerVerification,
    getAllEmployers,
    getAllUsers,
    updateAnyUser,
    deleteUser,
    toggleUserStatus,
};
