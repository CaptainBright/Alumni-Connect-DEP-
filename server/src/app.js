const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin: 'http://localhost:5173', // Your Vite frontend
    credentials: true,               // MUST be true for cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

// Routes
app.use('/api/auth', authRoutes);

// Health check
app.get('/', (req, res) => {
    res.send('Alumni Connect API is running');
});

module.exports = app;
