const express = require('express');
const router = express.Router();
const {
    enrollInClub,
    getMyEnrollments,
    getClubEnrollments,
    updateEnrollmentStatus
} = require('../controllers/enrollmentController');
const { protect, coordinator } = require('../middleware/authMiddleware');

router.post('/', protect, enrollInClub);
router.get('/my', protect, getMyEnrollments);
router.get('/club/:clubId', protect, coordinator, getClubEnrollments);
router.put('/:id', protect, coordinator, updateEnrollmentStatus);

module.exports = router;
