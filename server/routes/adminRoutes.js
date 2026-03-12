const express = require('express');
const router = express.Router();
const { getClubActivityReport } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/reports/clubs', protect, admin, getClubActivityReport);

module.exports = router;
