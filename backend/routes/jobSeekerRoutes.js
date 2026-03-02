const express = require('express');
const { getMyProfile, updateMyProfile, uploadDocument } = require('../controllers/jobSeekerController');
const { getMyPendingRequests, approveRequest, rejectRequest } = require('../controllers/consentController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

const router = express.Router();

router.route('/profile')
    .get(protect, getMyProfile)
    .put(protect, updateMyProfile);

router.post('/upload', protect, upload.single('file'), uploadDocument);

router.get('/requests', protect, getMyPendingRequests);
router.post('/approve-request', protect, approveRequest);
router.post('/reject-request', protect, rejectRequest);

module.exports = router;
