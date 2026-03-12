const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    console.log(`[LOGIN] Attempt for: ${email}`);

    try {
        const user = await User.findOne({ email });

        if (!user) {
            console.log(`[LOGIN FAILED] No user found: ${email}`);
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await user.matchPassword(password);
        if (isMatch) {
            const role = user.role.toLowerCase();
            console.log(`[LOGIN] User role: ${role}`);

            // Prevent Admin and Coordinator from logging in via standard login
            if (role === 'admin' || role === 'coordinator') {
                const targetPage = role === 'admin' ? 'Secure Admin Login' : 'Secure Coordinator Login';
                console.log(`[BLOCK] ${role} denied standard login.`);
                return res.status(401).json({ message: `Please use the ${targetPage} page` });
            }

            console.log(`[SUCCESS] Student logged in: ${email}`);
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                assignedClub: user.role === 'coordinator' ? user.assignedClub : undefined,
                token: generateToken(user._id),
            });
        } else {
            console.log(`[FAILED] Password mismatch: ${email}`);
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error(`[ERROR] Login error:`, error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Auth Admin & get token
// @route   POST /api/auth/admin-login
// @access  Public
const loginAdmin = async (req, res) => {
    const { email, password, pin } = req.body;
    const submittedPin = pin ? pin.trim() : '';
    const storedPin = process.env.ADMIN_PIN ? process.env.ADMIN_PIN.trim() : '';

    console.log('--- ADMIN LOGIN ATTEMPT ---');
    console.log(`Submitted PIN: [${submittedPin}] (Length: ${submittedPin.length})`);
    console.log(`Stored PIN:    [${storedPin}] (Length: ${storedPin.length})`);

    try {
        // 1. Verify PIN first
        if (submittedPin !== storedPin) {
            console.log('[FAILED] PIN mismatch.');
            return res.status(401).json({ message: 'Invalid Admin PIN' });
        }
        console.log('[SUCCESS] PIN match.');

        const user = await User.findOne({ email });
        if (!user) {
            console.log(`[FAILED] No user found with email: ${email}`);
            return res.status(401).json({ message: 'Invalid Admin credentials' });
        }
        console.log(`[SUCCESS] User found: ${user.email}, Role: ${user.role}`);

        // 2. Verify Password & Role
        const isMatch = await user.matchPassword(password);
        const isAdmin = user.role === 'admin';
        console.log(`Password Match: ${isMatch}, Is Admin Role: ${isAdmin}`);

        if (isMatch && isAdmin) {
            console.log('[SUCCESS] Admin Logged In.');
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            console.log('[FAILED] Credentials mismatch (Password or Role).');
            res.status(401).json({ message: 'Invalid Admin credentials' });
        }
    } catch (error) {
        console.error('[CRITICAL] Admin Login Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Auth Coordinator & get token
// @route   POST /api/auth/coordinator-login
// @access  Public
const loginCoordinator = async (req, res) => {
    const { email, password, pin } = req.body;
    const submittedPin = pin ? pin.trim() : '';
    const storedPin = process.env.COORDINATOR_PIN ? process.env.COORDINATOR_PIN.trim() : '';

    console.log('--- COORDINATOR LOGIN ATTEMPT ---');
    console.log(`Submitted PIN: [${submittedPin}]`);
    console.log(`Stored PIN:    [${storedPin}]`);
    console.log(`Email: [${email}]`);

    try {
        // 1. Verify PIN
        if (submittedPin !== storedPin) {
            console.log('[FAILED] PIN mismatch.');
            return res.status(401).json({ message: 'Invalid Coordinator PIN' });
        }
        console.log('[SUCCESS] PIN match.');

        const user = await User.findOne({ email });
        if (!user) {
            console.log(`[FAILED] No user found with email: ${email}`);
            return res.status(401).json({ message: 'Invalid Coordinator credentials' });
        }
        console.log(`[SUCCESS] User found: ${user.email}, Role: ${user.role}`);

        // 2. Verify Password & Role
        const isMatch = await user.matchPassword(password);
        const isCoordinator = user.role === 'coordinator';
        console.log(`Password Match: ${isMatch}, Role is Coordinator: ${isCoordinator}`);

        if (isMatch && isCoordinator) {
            console.log('[SUCCESS] Coordinator Logged In.');
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                assignedClub: user.assignedClub,
                token: generateToken(user._id),
            });
        } else {
            console.log(`[FAILED] Credentials mismatch. Match: ${isMatch}, Role: ${user.role}`);
            res.status(401).json({ message: 'Invalid Coordinator credentials' });
        }
    } catch (error) {
        console.error('[ERROR] Coordinator Login Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    let { name, email, password, role, rollNumber, department, year } = req.body;

    try {
        // Force role to student if admin attempted
        if (role === 'admin') {
            return res.status(400).json({ message: 'Unauthorized role registration' });
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Check if roll number unique (only for students)
        if (role === 'student' && rollNumber) {
            const rollNumberExists = await User.findOne({ rollNumber });
            if (rollNumberExists) {
                return res.status(400).json({ message: 'Roll Number already registered' });
            }
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role || 'student', // Default to student
            rollNumber,
            department,
            year
        });

        if (user) {
            const role = user.role.toLowerCase();
            console.log(`[REGISTER] New user: ${user.email}, Role: ${role}`);

            const responseData = {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            };

            // Force Coordinators and Admins to login via Secure Portal (No Token here)
            if (role === 'coordinator' || role === 'admin') {
                console.log(`[REGISTER] Withholding token for ${role}. Redirecting to secure login.`);
                return res.status(201).json({
                    ...responseData,
                    message: `Registration successful! Please login via the Secure ${role === 'admin' ? 'Admin' : 'Coordinator'} Portal.`
                });
            }

            // Students get a token immediately
            console.log(`[REGISTER] Issuing token for student: ${user.email}`);
            res.status(201).json({
                ...responseData,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                rollNumber: user.rollNumber,
                department: user.department,
                // Add other fields as needed
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { loginUser, registerUser, getUserProfile, loginAdmin, loginCoordinator };
