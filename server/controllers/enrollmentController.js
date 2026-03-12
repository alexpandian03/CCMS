const Enrollment = require('../models/Enrollment');

// @desc    Enroll in a club
// @route   POST /api/enrollments
// @access  Private/Student
const enrollInClub = async (req, res) => {
    const { clubId, reason, experience } = req.body;

    try {


        // Check if student is already enrolled in ANY club (Single Club Policy)
        const anyEnrollment = await Enrollment.findOne({
            student: req.user._id,
            status: { $in: ['approved', 'pending'] }
        });

        if (anyEnrollment) {
            return res.status(400).json({
                message: 'You can only join one club. You are already enrolled or have a pending request.'
            });
        }

        const existingEnrollment = await Enrollment.findOne({
            student: req.user._id,
            club: clubId
        });

        if (existingEnrollment) {
            return res.status(400).json({ message: 'Already enrolled or request pending' });
        }

        const enrollment = await Enrollment.create({
            student: req.user._id,
            club: clubId,
            reason,
            experience
        });

        res.status(201).json(enrollment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my enrollments
// @route   GET /api/enrollments/my
// @access  Private/Student
const getMyEnrollments = async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ student: req.user._id })
            .populate('club', 'name image');
        res.json(enrollments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get enrollments for a specific club (Coordinator view)
// @route   GET /api/enrollments/club/:clubId
// @access  Private/Coordinator
const getClubEnrollments = async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ club: req.params.clubId })
            .populate('student', 'name email rollNumber department year phoneNumber documents');
        res.json(enrollments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update enrollment status (Approve/Reject)
// @route   PUT /api/enrollments/:id
// @access  Private/Coordinator
const updateEnrollmentStatus = async (req, res) => {
    const { status } = req.body; // 'approved' or 'rejected'

    try {
        const enrollment = await Enrollment.findById(req.params.id);

        if (enrollment) {
            enrollment.status = status;
            const updatedEnrollment = await enrollment.save();
            res.json(updatedEnrollment);
        } else {
            res.status(404).json({ message: 'Enrollment not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    enrollInClub,
    getMyEnrollments,
    getClubEnrollments,
    updateEnrollmentStatus
};
