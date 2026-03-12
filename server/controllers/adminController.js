const Club = require('../models/Club');
const Event = require('../models/Event');
const Enrollment = require('../models/Enrollment');
const Attendance = require('../models/Attendance');

// @desc    Get admin report for all clubs
// @route   GET /api/admin/reports/clubs
// @access  Private/Admin
const getClubActivityReport = async (req, res) => {
    try {
        const clubs = await Club.find().populate('coordinator', 'name email');

        const report = await Promise.all(clubs.map(async (club) => {
            const memberCount = await Enrollment.countDocuments({ club: club._id, status: 'approved' });
            const eventCount = await Event.countDocuments({ club: club._id });

            // Calculate average attendance %
            const attendanceRecords = await Attendance.find({ club: club._id });
            let totalAttendancePercent = 0;
            if (attendanceRecords.length > 0) {
                attendanceRecords.forEach(record => {
                    const presentCount = record.records.filter(r => r.status === 'present').length;
                    const percent = (presentCount / record.records.length) * 100;
                    totalAttendancePercent += percent;
                });
                totalAttendancePercent = totalAttendancePercent / attendanceRecords.length;
            }

            return {
                id: club._id,
                name: club.name,
                coordinator: club.coordinator ? club.coordinator.name : 'Unassigned',
                memberCount,
                eventCount,
                avgAttendance: totalAttendancePercent.toFixed(2)
            };
        }));

        res.json(report);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getClubActivityReport };
