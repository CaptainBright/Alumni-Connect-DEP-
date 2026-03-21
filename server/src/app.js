const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173', // Your Vite frontend
    credentials: true,               // MUST be true for cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

// Routes
const adminRoutes = require('./routes/adminRoutes');
const profileRoutes = require('./routes/profileRoutes');
const jobRoutes = require('./routes/jobRoutes');
const experienceRoutes = require('./routes/experienceRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/experiences', experienceRoutes);

// Health check
app.get('/', (req, res) => {
    res.send('Alumni Connect API is running');
});

module.exports = app;
