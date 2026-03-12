const express = require('express');
const router = express.Router();
const { registerDonor, getDonors } = require('../controllers/bloodDonorController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, registerDonor);
router.get('/', protect, getDonors);

module.exports = router;
