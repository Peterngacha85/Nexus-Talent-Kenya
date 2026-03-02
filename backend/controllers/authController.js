const jwt = require('jsonwebtoken');
const User = require('../models/User');
const JobSeeker = require('../models/JobSeeker');
const Employer = require('../models/Employer');

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profilePicture: user.profilePicture,
            token: generateToken(user._id),
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password, role, firstName, lastName, phone, title, companyName } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    // Profile picture via Cloudinary (optional)
    const profilePicture = req.file ? req.file.path : '';

    const user = await User.create({
        name,
        email,
        password,
        role,
        profilePicture,
    });

    if (user) {
        // Additional role-based profile creation
        if (role === 'jobseeker') {
            // Generate a 4-digit PIN for consent
            const consentPin = Math.floor(1000 + Math.random() * 9000).toString();

            await JobSeeker.create({
                user: user._id,
                firstName: firstName || name.split(' ')[0] || '',
                lastName:  lastName  || name.split(' ')[1] || '',
                phone:     phone     || '',
                title:     title     || 'New Talent',
                consentPin,
            });
        } else if (role === 'employer') {
            await Employer.create({
                user: user._id,
                companyName: companyName || `${name}'s Company`,
            });
        }

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profilePicture: user.profilePicture,
            token: generateToken(user._id),
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};


// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profilePicture: user.profilePicture,
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Update user profile (name, picture)
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        
        if (req.file) {
            user.profilePicture = req.file.path;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            profilePicture: updatedUser.profilePicture,
            token: generateToken(updatedUser._id),
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

module.exports = {
    loginUser,
    registerUser,
    getUserProfile,
    updateUserProfile,
};
