const express = require('express');
const router = express.Router();
const { loginUser, registerUser, getUserProfile, loginAdmin, loginCoordinator } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/admin-login', loginAdmin);
router.post('/coordinator-login', loginCoordinator);
router.get('/profile', protect, getUserProfile);

module.exports = router;
