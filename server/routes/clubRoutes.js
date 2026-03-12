const express = require('express');
const router = express.Router();
const {
    getClubs,
    getClubById,
    createClub,
    updateClub,
    deleteClub,
} = require('../controllers/clubController');
const { protect, admin, coordinator } = require('../middleware/authMiddleware');

router.route('/').get(getClubs).post(protect, admin, createClub);
router
    .route('/:id')
    .get(getClubById)
    .put(protect, coordinator, updateClub) // Admin can also be handled within coordinator middleware logic or adjusted
    .delete(protect, admin, deleteClub);

module.exports = router;
