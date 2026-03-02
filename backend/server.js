const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const jobSeekerRoutes = require('./routes/jobSeekerRoutes');
const employerRoutes = require('./routes/employerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

const path = require('path');
const fs = require('fs');

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// 1. CORS - MUST BE FIRST
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://nexus-talent-kenya.vercel.app',
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200 // Some legacy browsers choke on 204
}));

app.use(express.json());

// Request logging for Render debugging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Health Check / Root Route
app.get('/', (req, res) => {
    res.status(200).send('Nexus Talent Kenya API is Live 🚀');
});

app.get('/api/health', (req, res) => {
    res.status(200).send('API is healthy');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobseekers', jobSeekerRoutes);
app.use('/api/employers', employerRoutes);
app.use('/api/admin', adminRoutes);

// ---- Production: Serve Frontend ----
if (process.env.NODE_ENV === 'production') {
    // If we build the frontend into the backend's dist folder
    const frontendPath = path.join(__dirname, '../frontend/dist');
    app.use(express.static(frontendPath));

    app.get(/.*/, (req, res, next) => {
        if (req.originalUrl.startsWith('/api')) {
            return next(); // Pass to 404 handler
        }
        const indexPath = path.resolve(frontendPath, 'index.html');
        if (fs.existsSync(indexPath)) {
            res.sendFile(indexPath);
        } else {
            next(); // Pass to 404 handler
        }
    });
} else {
    app.get('/', (req, res) => {
        res.send('API is running in development mode...');
    });
}

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

// Port configuration
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
