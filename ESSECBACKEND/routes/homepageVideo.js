const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const HomepageVideo = require('../models/HomepageVideo');
const { authenticate } = require('../middleware/auth');

// Configure multer for video uploads
const videosPath = path.join(__dirname, '..', '..', 'ESSEC', 'public', 'videos');
// Ensure videos directory exists
if (!fs.existsSync(videosPath)) {
  fs.mkdirSync(videosPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, videosPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: timestamp-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, name + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept video files
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed!'), false);
    }
  }
});

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
    
    const video = await HomepageVideo.findOne({ isActive: true })
      .sort({ createdAt: -1 })
      .lean()
      .maxTimeMS(3000); // 3 second timeout
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
// Handle both file upload and URL input
router.post('/', authenticate, upload.single('video'), async (req, res) => {
  try {
    let videoUrl = req.body.videoUrl;
    const { title, subtitle, isActive } = req.body;

    // If a file was uploaded, use its path
    if (req.file) {
      // Save path as /videos/filename
      videoUrl = '/videos/' + req.file.filename;
    }

    // Validation
    if (!videoUrl || !videoUrl.trim()) {
      // If file was uploaded but path is missing, delete the file
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ error: 'Video URL or file is required' });
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
    // Clean up uploaded file if there was an error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    if (error.name === 'ValidationError') {
      res.status(400).json({ error: error.message });
    } else if (error.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ error: 'Video file is too large. Maximum size is 100MB.' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// PUT update a homepage video (protected)
// Handle both file upload and URL input
router.put('/:id', authenticate, upload.single('video'), async (req, res) => {
  try {
    let videoUrl = req.body.videoUrl;
    const { title, subtitle, isActive } = req.body;

    const video = await HomepageVideo.findById(req.params.id);
    if (!video) {
      // Clean up uploaded file if video not found
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ error: 'Homepage video not found' });
    }

    // If a file was uploaded, use its path and delete old file if it was a local file
    if (req.file) {
      // Delete old video file if it exists and is a local file
      if (video.videoUrl && video.videoUrl.startsWith('/videos/')) {
        const oldFilePath = path.join(videosPath, path.basename(video.videoUrl));
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      // Save path as /videos/filename
      videoUrl = '/videos/' + req.file.filename;
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
        // Clean up uploaded file if URL is empty
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
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
    // Clean up uploaded file if there was an error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    if (error.name === 'ValidationError') {
      res.status(400).json({ error: error.message });
    } else if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid video ID format' });
    } else if (error.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ error: 'Video file is too large. Maximum size is 100MB.' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// DELETE a homepage video (protected)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const video = await HomepageVideo.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ error: 'Homepage video not found' });
    }

    // Delete the video file if it's a local file
    if (video.videoUrl && video.videoUrl.startsWith('/videos/')) {
      const filePath = path.join(videosPath, path.basename(video.videoUrl));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await HomepageVideo.findByIdAndDelete(req.params.id);
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


