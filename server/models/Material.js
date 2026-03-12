const mongoose = require('mongoose');

const materialSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    club: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Club',
        required: true
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Coordinator or Admin
        required: true
    },
    type: {
        type: String,
        enum: ['PDF', 'PPT', 'Video', 'Document', 'Link'],
        required: true
    },
    fileUrl: {
        type: String,
        // Required if type is not Link
        required: function () { return this.type !== 'Link'; }
    },
    externalLink: {
        type: String
    },
    tags: [String],
    views: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
});

const Material = mongoose.model('Material', materialSchema);

module.exports = Material;
