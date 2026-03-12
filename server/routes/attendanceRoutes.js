const express = require('express');
const router = express.Router();
const { markAttendance, getAttendance, getMyAttendance } = require('../controllers/attendanceController');
const { protect, coordinator } = require('../middleware/authMiddleware');

router.post('/', protect, coordinator, markAttendance);
router.get('/', protect, coordinator, getAttendance);
router.get('/my', protect, getMyAttendance);

module.exports = router;
