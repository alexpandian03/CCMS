const express = require('express');
const router = express.Router();
const {
    createEvent,
    getEvents,
    getClubEvents,
    registerForEvent,
    getEventRegistrations
} = require('../controllers/eventController');
const { protect, coordinator } = require('../middleware/authMiddleware');

router.post('/', protect, coordinator, createEvent);
router.get('/', getEvents);
router.get('/club/:clubId', getClubEvents);
router.post('/:id/register', protect, registerForEvent);
router.get('/:id/registrations', protect, coordinator, getEventRegistrations);

module.exports = router;
