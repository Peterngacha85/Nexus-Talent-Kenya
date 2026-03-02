const express = require('express');
const {
    getStats,
    getPendingDocuments,
    verifyDocument,
    getAllJobSeekers,
    toggleJobSeekerVerification,
    getAllEmployers,
    getAllUsers,
    updateAnyUser,
    deleteUser,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require admin
router.use(protect, admin);

router.get('/stats',                        getStats);
router.get('/documents',                    getPendingDocuments);
router.put('/documents/:id',                verifyDocument);
router.get('/jobseekers',                   getAllJobSeekers);
router.put('/jobseekers/:id/verify',        toggleJobSeekerVerification);
router.get('/employers',                    getAllEmployers);
router.get('/users',                        getAllUsers);
router.put('/users/:id',                    updateAnyUser);
router.delete('/users/:id',                 deleteUser);
module.exports = router;
