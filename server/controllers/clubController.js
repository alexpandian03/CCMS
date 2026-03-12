const Club = require('../models/Club');

// @desc    Get all clubs
// @route   GET /api/clubs
// @access  Public
const getClubs = async (req, res) => {
    try {
        const clubs = await Club.find().populate('coordinator', 'name email');
        res.json(clubs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single club
// @route   GET /api/clubs/:id
// @access  Public
const getClubById = async (req, res) => {
    try {
        const club = await Club.findById(req.params.id).populate('coordinator', 'name email');

        if (club) {
            res.json(club);
        } else {
            res.status(404).json({ message: 'Club not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a club
// @route   POST /api/clubs
// @access  Private/Admin
const createClub = async (req, res) => {
    const { name, description, coordinator, image, capacity } = req.body;

    try {
        const clubExists = await Club.findOne({ name });

        if (clubExists) {
            return res.status(400).json({ message: 'Club already exists' });
        }

        const club = await Club.create({
            name,
            description,
            coordinator,
            image,
            capacity
        });

        // Update the coordinator user to have this club assigned
        const User = require('../models/User');
        // Optional: If this user was already assigned to another club, you might want to warn or overwrite.
        // For now, we overwrite.
        await User.findByIdAndUpdate(coordinator, { assignedClub: club._id });

        res.status(201).json(club);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a club
// @route   PUT /api/clubs/:id
// @access  Private/Admin/Coordinator
const updateClub = async (req, res) => {
    try {
        const club = await Club.findById(req.params.id);

        if (club) {
            // Check if user is admin or the coordinator of this club
            if (req.user.role !== 'admin' && club.coordinator.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'Not authorized to update this club' });
            }

            club.name = req.body.name || club.name;
            club.description = req.body.description || club.description;
            club.coordinator = req.body.coordinator || club.coordinator;
            club.image = req.body.image || club.image;
            club.capacity = req.body.capacity || club.capacity;

            const updatedClub = await club.save();
            res.json(updatedClub);
        } else {
            res.status(404).json({ message: 'Club not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a club
// @route   DELETE /api/clubs/:id
// @access  Private/Admin
const deleteClub = async (req, res) => {
    try {
        const club = await Club.findById(req.params.id);

        if (club) {
            // Find the coordinator for this club and clear their assignment
            const User = require('../models/User'); // Import here if not top-level
            if (club.coordinator) {
                await User.findByIdAndUpdate(club.coordinator, { $unset: { assignedClub: "" } });
            }

            await club.deleteOne();
            res.json({ message: 'Club removed' });
        } else {
            res.status(404).json({ message: 'Club not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getClubs,
    getClubById,
    createClub,
    updateClub,
    deleteClub,
};
