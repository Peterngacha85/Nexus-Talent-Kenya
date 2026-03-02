const express = require('express');
const { registerUser, loginUser, getUserProfile, updateUserProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

const router = express.Router();

router.post('/register', upload.single('profilePicture'), registerUser);
router.post('/login', loginUser);

// Protect routes from here down
router.use(protect);

router.get('/profile', getUserProfile);
router.put('/profile', upload.single('profilePicture'), updateUserProfile);

module.exports = router;
