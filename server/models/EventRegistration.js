const mongoose = require('mongoose');

const eventRegistrationSchema = mongoose.Schema({
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['registered', 'cancelled'],
        default: 'registered'
    },
    registeredDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
});

// Prevent duplicate registrations for the same event
eventRegistrationSchema.index({ event: 1, student: 1 }, { unique: true });

const EventRegistration = mongoose.model('EventRegistration', eventRegistrationSchema);

module.exports = EventRegistration;
