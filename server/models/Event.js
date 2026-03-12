const mongoose = require('mongoose');

const eventSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    club: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Club',
        required: true
    },
    description: String,
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String, // e.g., "14:00"
        required: true
    },
    venue: {
        type: String,
        required: true
    },
    capacity: {
        type: Number,
        default: 50
    },
    type: {
        type: String,
        enum: ['Meeting', 'Workshop', 'Competition', 'Seminar', 'Other'],
        default: 'Meeting'
    }
}, {
    timestamps: true,
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
