const express = require('express');
const router = express.Router();
const { uploadMaterial, getClubMaterials } = require('../controllers/materialController');
const { protect, coordinator } = require('../middleware/authMiddleware');

router.post('/', protect, coordinator, uploadMaterial);
router.get('/club/:clubId', protect, getClubMaterials);

module.exports = router;
