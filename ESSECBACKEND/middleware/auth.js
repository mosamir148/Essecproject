const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'your-secret-key-change-this-in-production') {
  console.warn('⚠️  WARNING: JWT_SECRET not set or using default value. Please set a secure JWT_SECRET in your .env file!');
}

// Middleware to verify JWT token
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided, authorization denied' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Invalid token' });
      }
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired' });
      }
      throw jwtError;
    }

    // Check if this is a hardcoded admin
    if (decoded.isHardcoded && decoded.id === 'hardcoded-admin-id') {
      // Create a mock admin object for hardcoded admin
      req.admin = {
        _id: 'hardcoded-admin-id',
        email: decoded.email,
        name: decoded.name || 'Admin User',
        isHardcoded: true
      };
      return next();
    }

    // Get admin from database
    const admin = await Admin.findById(decoded.id).select('-password');
    
    if (!admin) {
      return res.status(401).json({ error: 'Token is not valid - admin not found' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    console.error('Unexpected authentication error:', error.stack);
    return res.status(500).json({ error: 'Server error during authentication', details: error.message });
  }
};

module.exports = { authenticate, JWT_SECRET };

