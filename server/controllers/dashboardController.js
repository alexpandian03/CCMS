const Club = require('../models/Club');
const Event = require('../models/Event');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');
const Attendance = require('../models/Attendance');

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res) => {
    try {
        const stats = {
            clubs: 0,
            events: 0,
            members: 0,
            pending: 0,
            attendance: 0,
            clubName: null,
            membershipStatus: null
        };

        // Common stats
        stats.clubs = await Club.countDocuments();
        stats.events = await Event.countDocuments({ date: { $gte: new Date() } });

        if (req.user.role === 'admin') {
            stats.members = await User.countDocuments({ role: 'student' });
        } else if (req.user.role === 'coordinator') {
            if (req.user.assignedClub) {
                const clubId = req.user.assignedClub;
                stats.members = await Enrollment.countDocuments({ club: clubId, status: 'approved' });
                stats.pending = await Enrollment.countDocuments({ club: clubId, status: 'pending' });

                // Coordinator's upcoming events
                stats.events = await Event.countDocuments({ club: clubId, date: { $gte: new Date() } });
            }
        } else if (req.user.role === 'student') {
            const enrollment = await Enrollment.findOne({ student: req.user._id, status: 'approved' })
                .populate('club', 'name');

            if (enrollment) {
                stats.clubName = enrollment.club.name;
                stats.membershipStatus = 'Approved';

                // Calculate attendance % for this student in their club
                const attendanceRecords = await Attendance.find({ club: enrollment.club._id });
                if (attendanceRecords.length > 0) {
                    let presentCount = 0;
                    attendanceRecords.forEach(record => {
                        const studentRecord = record.records.find(r => r.student.toString() === req.user._id.toString());
                        if (studentRecord && studentRecord.status === 'present') {
                            presentCount++;
                        }
                    });
                    stats.attendance = ((presentCount / attendanceRecords.length) * 100).toFixed(2);
                }
            } else {
                const pendingEnrollment = await Enrollment.findOne({ student: req.user._id, status: 'pending' })
                    .populate('club', 'name');
                if (pendingEnrollment) {
                    stats.clubName = pendingEnrollment.club.name;
                    stats.membershipStatus = 'Pending';
                }
            }
        }

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getDashboardStats };
