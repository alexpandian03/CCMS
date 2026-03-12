const express = require('express');
const router = express.Router();
const { createNotice, getNotices } = require('../controllers/noticeController');
const { protect, coordinator } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, coordinator, createNotice)
    .get(protect, getNotices);

module.exports = router;
