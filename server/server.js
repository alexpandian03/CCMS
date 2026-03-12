const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const clubRoutes = require('./routes/clubRoutes');

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/enrollments', require('./routes/enrollmentRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/materials', require('./routes/materialRoutes'));
app.use('/api/blood-donors', require('./routes/bloodDonorRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/notices', require('./routes/noticeRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

app.get('/', (req, res) => {
    res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running on port ${PORT}`));
