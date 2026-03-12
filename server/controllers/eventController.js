const Event = require('../models/Event');
const EventRegistration = require('../models/EventRegistration');
const Enrollment = require('../models/Enrollment');

// @desc    Get all events
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res) => {
    try {
        const events = await Event.find().populate('club', 'name');
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get club specific events
// @route   GET /api/events/club/:clubId
// @access  Public
const getClubEvents = async (req, res) => {
    try {
        const events = await Event.find({ club: req.params.clubId }).populate('club', 'name');
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create an event
// @route   POST /api/events
// @access  Private/Coordinator
const createEvent = async (req, res) => {
    const { name, club, date, time, venue, description, type, capacity } = req.body;

    try {
        const event = await Event.create({
            name,
            club,
            date,
            time,
            venue,
            description,
            type,
            capacity
        });
        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// @desc    Register for an event
// @route   POST /api/events/:id/register
// @access  Private/Student
const registerForEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        // Check if student is a member of the club
        const isMember = await Enrollment.findOne({
            student: req.user._id,
            club: event.club,
            status: 'approved'
        });

        if (!isMember) {
            return res.status(403).json({ message: 'Only club members can register for this event' });
        }

        // Check capacity
        const registrationCount = await EventRegistration.countDocuments({ event: event._id, status: 'registered' });
        if (registrationCount >= event.capacity) {
            return res.status(400).json({ message: 'Event is full' });
        }

        // Register
        const registration = await EventRegistration.create({
            event: event._id,
            student: req.user._id
        });

        res.status(201).json(registration);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Already registered' });
        }
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get event registrations (for coordinator)
// @route   GET /api/events/:id/registrations
// @access  Private/Coordinator
const getEventRegistrations = async (req, res) => {
    try {
        const registrations = await EventRegistration.find({ event: req.params.id })
            .populate('student', 'name email rollNumber department year');
        res.json(registrations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createEvent, getEvents, getClubEvents, registerForEvent, getEventRegistrations };
