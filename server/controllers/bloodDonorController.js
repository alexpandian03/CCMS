const BloodDonor = require('../models/BloodDonor');

// @desc    Register as a blood donor
// @route   POST /api/blood-donors
// @access  Private/Student
const registerDonor = async (req, res) => {
    const { bloodGroup, lastDonationDate } = req.body;

    try {
        const donor = await BloodDonor.create({
            user: req.user._id,
            bloodGroup,
            lastDonationDate
        });
        res.status(201).json(donor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all blood donors
// @route   GET /api/blood-donors
// @access  Private
const getDonors = async (req, res) => {
    const { bloodGroup } = req.query;

    try {
        let query = { isAvailable: true };
        if (bloodGroup) {
            query.bloodGroup = bloodGroup;
        }

        const donors = await BloodDonor.find(query)
            .populate('user', 'name phoneNumber email');
        res.json(donors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerDonor, getDonors };
