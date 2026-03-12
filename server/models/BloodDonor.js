const mongoose = require('mongoose');

const bloodDonorSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    bloodGroup: {
        type: String,
        required: true,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    lastDonationDate: Date,
    isAvailable: {
        type: Boolean,
        default: true
    },
    donationHistory: [{
        date: Date,
        campOrHospital: String,
        notes: String
    }]
}, {
    timestamps: true,
});

const BloodDonor = mongoose.model('BloodDonor', bloodDonorSchema);

module.exports = BloodDonor;
