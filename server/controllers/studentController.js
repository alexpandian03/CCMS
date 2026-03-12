const User = require('../models/User');

// @desc    Get all students (or coordinators if role query is present)
// @route   GET /api/students
// @access  Private/Admin/Coordinator
const getStudents = async (req, res) => {
    try {
        const { role } = req.query;
        let query = { role: 'student' };

        if (role) {
            query = { role };
        }

        const users = await User.find(query).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get student by ID
// @route   GET /api/students/:id
// @access  Private/Admin/Coordinator
const getStudentById = async (req, res) => {
    try {
        const student = await User.findById(req.params.id).select('-password');
        if (student) {
            res.json(student);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update student profile
// @route   PUT /api/students/profile
// @access  Private
const updateStudentProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            if (req.body.password) {
                user.password = req.body.password;
            }
            user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
            user.bloodGroup = req.body.bloodGroup || user.bloodGroup;
            user.address = req.body.address || user.address;
            user.profilePhoto = req.body.profilePhoto || user.profilePhoto;

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                token: req.headers.authorization.split(' ')[1] // Return same token
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getStudents, getStudentById, updateStudentProfile };
