const Attendance = require('../models/Attendance');

// @desc    Mark attendance
// @route   POST /api/attendance
// @access  Private/Coordinator
// @desc    Mark or Update attendance
// @route   POST /api/attendance
// @access  Private/Coordinator
const markAttendance = async (req, res) => {
    const { clubId, date, records } = req.body;

    try {
        // Check if attendance already exists for this date and club
        let attendance = await Attendance.findOne({
            club: clubId,
            date: new Date(date)
        });

        if (attendance) {
            // Update existing record
            attendance.records = records;
            const updatedAttendance = await attendance.save();
            return res.json(updatedAttendance);
        }

        // Create new record
        attendance = await Attendance.create({
            club: clubId,
            date: new Date(date),
            records
        });

        res.status(201).json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get attendance by club and date
// @route   GET /api/attendance
// @access  Private/Coordinator
// @desc    Get attendance by club and date (or all if date not specified)
// @route   GET /api/attendance
// @access  Private/Coordinator
const getAttendance = async (req, res) => {
    const { clubId, date } = req.query;

    try {
        let query = { club: clubId };

        // If specific date provided, match it
        if (date) {
            query.date = new Date(date);
        }

        const attendanceRecords = await Attendance.find(query)
            .populate('records.student', 'name rollNumber')
            .sort({ date: -1 }); // Newest first

        res.json(attendanceRecords);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my attendance
// @route   GET /api/attendance/my
// @access  Private/Student
const getMyAttendance = async (req, res) => {
    try {
        // Find all attendance records where the user is present in the records array
        const attendance = await Attendance.find({
            'records.student': req.user._id
        }).populate('club', 'name').populate('event', 'name');

        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { markAttendance, getAttendance, getMyAttendance };
