const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security headers
app.use(helmet());

// CORS configuration - strict origin from CLIENT_URL env var, allow localhost in dev, and *.vercel.app
const rawClientOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
const normalizedClientOrigin = rawClientOrigin.replace(/\/$/, '');

app.use(
    cors({
        origin: function (origin, callback) {
            // Allow requests with no origin (like mobile apps, curl, or Postman)
            if (!origin) return callback(null, true);

            const normalizedOrigin = origin.replace(/\/$/, '');

            // Allow configured CLIENT_URL, localhost, or any Vercel domain
            if (
                normalizedOrigin === normalizedClientOrigin ||
                normalizedOrigin === 'http://localhost:5173' ||
                normalizedOrigin === 'http://127.0.0.1:5173' ||
                /^https:\/\/.*\.vercel\.app$/.test(normalizedOrigin)
            ) {
                return callback(null, true);
            }

            console.warn(`[CORS] Blocked request from origin: ${origin}`);
            return callback(new Error('CORS policy: Not allowed by CORS'));
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    })
);

// Body parsers
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint for Render/deployment monitoring
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        uptime: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
        service: 'CivicPulse API'
    });
});

// API Route mounts
const authRoutes = require('./routes/authRoutes');
const issueRoutes = require('./routes/issueRoutes');
const statsRoutes = require('./routes/statsRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/stats', statsRoutes);


// 404 handler for unknown API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({ message: `API route ${req.originalUrl} not found` });
});

// Centralized error handler
app.use(errorHandler);

module.exports = app;
