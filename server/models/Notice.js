const mongoose = require('mongoose');

const noticeSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    club: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Club',
        // Optional: for club-specific notices
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['club', 'college'],
        required: true
    },
}, {
    timestamps: true,
});

const Notice = mongoose.model('Notice', noticeSchema);

module.exports = Notice;
