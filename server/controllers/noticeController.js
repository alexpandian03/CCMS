const Notice = require('../models/Notice');
const Enrollment = require('../models/Enrollment');

// @desc    Create a notice
// @route   POST /api/notices
// @access  Private/Admin/Coordinator
const createNotice = async (req, res) => {
    const { title, content, type, clubId } = req.body;

    try {
        // Validation: Coordinators can only post to their club
        if (req.user.role === 'coordinator') {
            if (type !== 'club' || clubId !== req.user.assignedClub.toString()) {
                return res.status(403).json({ message: 'Unauthorized: Coordinators can only post to their assigned club' });
            }
        }

        const notice = await Notice.create({
            title,
            content,
            type,
            club: type === 'club' ? clubId : undefined,
            author: req.user._id
        });

        res.status(201).json(notice);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get notices
// @route   GET /api/notices
// @access  Private
const getNotices = async (req, res) => {
    try {
        let query = { type: 'college' }; // Everyone sees college notices

        if (req.user.role === 'student') {
            // Find clubs the student is in
            const memberships = await Enrollment.find({ student: req.user._id, status: 'approved' });
            const clubIds = memberships.map(m => m.club);
            query = {
                $or: [
                    { type: 'college' },
                    { type: 'club', club: { $in: clubIds } }
                ]
            };
        } else if (req.user.role === 'coordinator') {
            query = {
                $or: [
                    { type: 'college' },
                    { type: 'club', club: req.user.assignedClub }
                ]
            };
        } else if (req.user.role === 'admin') {
            query = {}; // Admins see everything
        }

        const notices = await Notice.find(query)
            .sort({ createdAt: -1 })
            .populate('author', 'name role')
            .populate('club', 'name');

        res.json(notices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createNotice, getNotices };
