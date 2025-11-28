const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
// Increase body size limit to handle large base64 images/videos
// Base64 encoding increases size by ~33%, so 50MB video becomes ~67MB
// Set to 100MB to handle large base64-encoded videos safely
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/essec_projects';

if (!process.env.MONGODB_URI) {
  console.warn('Warning: MONGODB_URI not set in environment variables. Using default local connection.');
}

mongoose.connect(MONGODB_URI)
.then(() => {
  console.log('✅ Connected to MongoDB');
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error.message);
  console.error('Please check your MONGODB_URI in the .env file');
  console.error('If using MongoDB Atlas, make sure to include username:password in the connection string');
});

// Routes
const projectRoutes = require('./routes/projects');
const authRoutes = require('./routes/auth');
const homepageVideoRoutes = require('./routes/homepageVideo');
const teamRoutes = require('./routes/team');
app.use('/api/projects', projectRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/homepage-video', homepageVideoRoutes);
app.use('/api/team', teamRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'ESSEC Backend API is running' });
});

// Error handling middleware (should be last)
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  console.error('Error stack:', err.stack);
  console.error('Request path:', req.path);
  console.error('Request method:', req.method);
  
  // Don't send error if response was already sent
  if (res.headersSent) {
    return next(err);
  }
  
  // Handle "request entity too large" errors specifically
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ 
      error: 'Request entity too large. The file you are trying to upload is too big. Please use a smaller file or upload via URL instead.',
      maxSize: '100MB (base64 encoded)'
    });
  }
  
  res.status(err.status || 500).json({ 
    error: err.message || 'Something went wrong!',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

