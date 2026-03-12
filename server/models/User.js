const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        // Role can be 'student', 'admin', 'coordinator'
        enum: ['student', 'admin', 'coordinator'],
        default: 'student',
    },
    // Specific fields for students
    rollNumber: {
        type: String,
        // Required only if role is student
        required: function () { return this.role === 'student'; }
    },
    department: String,
    year: String,
    semester: String,
    phoneNumber: String,
    bloodGroup: String,
    address: String,
    profilePhoto: String,

    // Specific fields for coordinators
    assignedClub: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Club'
    },
    documents: {
        aadhar: String,
        bankPassbook: String,
        markSheet10: String,
        markSheet12: String,
        photo: String,
        bioData: String
    },
}, {
    timestamps: true,
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

module.exports = User;
