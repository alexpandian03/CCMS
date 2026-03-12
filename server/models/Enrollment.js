const mongoose = require('mongoose');

const enrollmentSchema = mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    club: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Club',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    reason: {
        type: String,
        required: true
    },
    experience: {
        type: String
    },
    enrolledDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
});

// Prevent duplicate enrollments
enrollmentSchema.index({ student: 1, club: 1 }, { unique: true });

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

module.exports = Enrollment;
