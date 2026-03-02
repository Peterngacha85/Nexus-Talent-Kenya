const express = require('express');
const { searchTalent, requestAccess, getMyRequests, getAvailableTitles } = require('../controllers/employerController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/search', protect, searchTalent);
router.post('/request-access', protect, requestAccess);
router.get('/requests', protect, getMyRequests);
router.get('/available-titles', protect, getAvailableTitles);

module.exports = router;
