const mongoose = require('mongoose');

const clubSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
        required: true,
    },
    coordinator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    establishedDate: {
        type: Date,
        default: Date.now
    },
    image: {
        type: String, // URL to image/logo
    },
    capacity: {
        type: Number,
        default: 100
    }
}, {
    timestamps: true,
});

const Club = mongoose.model('Club', clubSchema);

module.exports = Club;
