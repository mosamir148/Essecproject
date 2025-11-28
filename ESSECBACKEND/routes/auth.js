const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');

// Hardcoded admin user for secure access
// Change these credentials in production!
const adminUser = {
  email: process.env.ADMIN_EMAIL || "admin@example.com",
  password: process.env.ADMIN_PASSWORD || "supersecret",
  name: process.env.ADMIN_NAME || "Admin User",
  id: "hardcoded-admin-id" // Special ID for hardcoded admin
};

// Register new admin (only for initial setup - you may want to protect this route)
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Please provide email, password, and name' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check MongoDB connection
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database connection not available. Please check your MongoDB connection.' });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ error: 'Admin with this email already exists' });
    }

    // Create new admin
    const admin = new Admin({ email, password, name });
    await admin.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: admin._id, email: admin.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Admin created successfully',
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    if (error.name === 'MongoServerError' && error.code === 11000) {
      return res.status(400).json({ error: 'Admin with this email already exists' });
    }
    res.status(500).json({ 
      error: 'Server error during registration',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Login admin
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    // Normalize email for comparison
    const normalizedEmail = email.toLowerCase().trim();

    // Check hardcoded admin first
    if (normalizedEmail === adminUser.email.toLowerCase()) {
      if (password === adminUser.password) {
        // Generate JWT token for hardcoded admin
        const token = jwt.sign(
          { id: adminUser.id, email: adminUser.email, name: adminUser.name, isHardcoded: true },
          JWT_SECRET,
          { expiresIn: '7d' }
        );

        return res.json({
          message: 'Login successful',
          token,
          admin: {
            id: adminUser.id,
            email: adminUser.email,
            name: adminUser.name
          }
        });
      } else {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
    }

    // If not hardcoded admin, check database
    const admin = await Admin.findOne({ email: normalizedEmail });
    if (!admin) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: admin._id, email: admin.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Server error during login',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get current admin (protected route)
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if this is a hardcoded admin
    if (decoded.isHardcoded && decoded.id === 'hardcoded-admin-id') {
      return res.json({
        admin: {
          _id: 'hardcoded-admin-id',
          email: decoded.email,
          name: decoded.name || 'Admin User',
          isHardcoded: true
        }
      });
    }
    
    const admin = await Admin.findById(decoded.id).select('-password');
    if (!admin) {
      return res.status(401).json({ error: 'Admin not found' });
    }

    res.json({ admin });
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

module.exports = router;

