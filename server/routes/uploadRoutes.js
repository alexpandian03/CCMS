const express = require('express');
const router = express.Router();
const { uploadDocument, deleteDocument } = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');

router.post('/:docType', protect, uploadDocument);
router.delete('/:docType', protect, deleteDocument);

module.exports = router;
