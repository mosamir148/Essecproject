const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const HomepageVideo = require('../models/HomepageVideo');
const { authenticate } = require('../middleware/auth');

// Helper function to check MongoDB connection
const checkMongoConnection = () => {
  return mongoose.connection.readyState === 1; // 1 = connected
};

// GET active homepage video (public route)
router.get('/active', async (req, res) => {
  try {
    if (!checkMongoConnection()) {
      console.error('MongoDB is not connected');
      return res.status(503).json({ error: 'Database connection not available' });
    }
    
    if (!HomepageVideo) {
      console.error('HomepageVideo model is not available');
      return res.status(500).json({ error: 'Database model not available' });
    }
    
    const video = await HomepageVideo.findOne({ isActive: true }).sort({ createdAt: -1 });
    if (!video) {
      // Return default video if none is set
      return res.json({
        videoUrl: '/video.mp4',
        title: '',
        subtitle: '',
        isActive: true
      });
    }
    res.json(video);
  } catch (error) {
    console.error('Error fetching active homepage video:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: error.message || 'Failed to fetch active homepage video',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// GET all homepage videos (protected - for admin)
router.get('/', authenticate, async (req, res) => {
  try {
    if (!checkMongoConnection()) {
      console.error('MongoDB is not connected');
      return res.status(503).json({ error: 'Database connection not available' });
    }
    
    // Check if HomepageVideo model is available
    if (!HomepageVideo) {
      console.error('HomepageVideo model is not available');
      return res.status(500).json({ error: 'Database model not available' });
    }
    
    const videos = await HomepageVideo.find().sort({ createdAt: -1 });
    res.json(videos);
  } catch (error) {
    console.error('Error fetching homepage videos:', error);
    console.error('Error stack:', error.stack);
    console.error('Error name:', error.name);
    res.status(500).json({ 
      error: error.message || 'Failed to fetch homepage videos',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// GET a single homepage video by ID (protected)
router.get('/:id', authenticate, async (req, res) => {
  try {
    const video = await HomepageVideo.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ error: 'Homepage video not found' });
    }
    res.json(video);
  } catch (error) {
    console.error('Error fetching homepage video:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid video ID format' });
    }
    res.status(500).json({ error: error.message });
  }
});

// POST create a new homepage video (protected)
router.post('/', authenticate, async (req, res) => {
  try {
    const { videoUrl, title, subtitle, isActive } = req.body;

    // Validation
    if (!videoUrl || !videoUrl.trim()) {
      return res.status(400).json({ error: 'Video URL is required' });
    }

    // If setting as active, deactivate all other videos
    if (isActive !== false) {
      await HomepageVideo.updateMany(
        {},
        { $set: { isActive: false } }
      );
    }

    const video = new HomepageVideo({
      videoUrl: videoUrl.trim(),
      title: title || '',
      subtitle: subtitle || '',
      isActive: isActive !== false // Default to true
    });

    const savedVideo = await video.save();
    res.status(201).json(savedVideo);
  } catch (error) {
    console.error('Error creating homepage video:', error);
    if (error.name === 'ValidationError') {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// PUT update a homepage video (protected)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { videoUrl, title, subtitle, isActive } = req.body;

    const video = await HomepageVideo.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ error: 'Homepage video not found' });
    }

    // If setting as active, deactivate all other videos
    if (isActive === true) {
      await HomepageVideo.updateMany(
        { _id: { $ne: req.params.id } },
        { $set: { isActive: false } }
      );
    }

    // Update fields
    if (videoUrl !== undefined) {
      if (!videoUrl || !videoUrl.trim()) {
        return res.status(400).json({ error: 'Video URL cannot be empty' });
      }
      video.videoUrl = videoUrl.trim();
    }
    if (title !== undefined) video.title = title || '';
    if (subtitle !== undefined) video.subtitle = subtitle || '';
    if (isActive !== undefined) video.isActive = isActive;

    const updatedVideo = await video.save();
    res.json(updatedVideo);
  } catch (error) {
    console.error('Error updating homepage video:', error);
    if (error.name === 'ValidationError') {
      res.status(400).json({ error: error.message });
    } else if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid video ID format' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// DELETE a homepage video (protected)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const video = await HomepageVideo.findByIdAndDelete(req.params.id);
    if (!video) {
      return res.status(404).json({ error: 'Homepage video not found' });
    }
    res.json({ message: 'Homepage video deleted successfully', video });
  } catch (error) {
    console.error('Error deleting homepage video:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid video ID format' });
    }
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;


