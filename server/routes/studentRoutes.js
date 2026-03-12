const express = require('express');
const router = express.Router();
const { getStudents, getStudentById, updateStudentProfile } = require('../controllers/studentController');
const { protect, coordinator } = require('../middleware/authMiddleware');

router.get('/', protect, coordinator, getStudents);
router.get('/:id', protect, coordinator, getStudentById);
router.put('/profile', protect, updateStudentProfile);

module.exports = router;
