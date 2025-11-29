const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Project = require('../models/Project');
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

// GET all projects
router.get('/', async (req, res) => {
  try {
    // Use lean() for faster queries and add timeout
    const projects = await Project.find()
      .sort({ createdAt: -1 })
      .lean()
      .maxTimeMS(5000); // 5 second timeout
    
    // Map projects to ensure id field is present (lean() doesn't include virtuals)
    const projectsWithId = projects.map(project => ({
      ...project,
      id: project._id ? project._id.toString() : project.id
    }));
    
    res.json(projectsWithId);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET a single project by ID
router.get('/:id', async (req, res) => {
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid project ID format' });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    // Handle CastError specifically (invalid ObjectId)
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid project ID format' });
    }
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// POST create a new project (protected)
// Handle both file upload and URL input for video
router.post('/', authenticate, upload.single('video'), async (req, res) => {
  try {
    let videoUrl = req.body.video;
    const projectData = { ...req.body };

    // If a file was uploaded, use its path
    if (req.file) {
      // Save path as /videos/filename
      videoUrl = '/videos/' + req.file.filename;
      projectData.video = videoUrl;
    } else if (videoUrl) {
      // If URL is provided, use it as is
      projectData.video = videoUrl.trim();
    } else {
      // Video is optional, so empty string is fine
      projectData.video = '';
    }

    // Parse arrays from JSON strings if they come from FormData
    if (typeof projectData.challenges === 'string') {
      try {
        projectData.challenges = JSON.parse(projectData.challenges);
      } catch (e) {
        projectData.challenges = [];
      }
    }
    if (typeof projectData.executionMethods === 'string') {
      try {
        projectData.executionMethods = JSON.parse(projectData.executionMethods);
      } catch (e) {
        projectData.executionMethods = [];
      }
    }
    if (typeof projectData.results === 'string') {
      try {
        projectData.results = JSON.parse(projectData.results);
      } catch (e) {
        projectData.results = [];
      }
    }
    if (typeof projectData.gallery === 'string') {
      try {
        projectData.gallery = JSON.parse(projectData.gallery);
      } catch (e) {
        projectData.gallery = [];
      }
    }

    // Parse year as number
    if (projectData.year) {
      projectData.year = parseInt(projectData.year);
    }

    const project = new Project(projectData);
    const savedProject = await project.save();
    res.status(201).json(savedProject);
  } catch (error) {
    console.error('Error creating project:', error);
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

// PUT update a project (protected)
// Handle both file upload and URL input for video
router.put('/:id', authenticate, upload.single('video'), async (req, res) => {
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      // Clean up uploaded file if ID is invalid
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ error: 'Invalid project ID format' });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      // Clean up uploaded file if project not found
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ error: 'Project not found' });
    }

    let videoUrl = req.body.video;
    const updateData = { ...req.body };

    // If a file was uploaded, use its path and delete old file if it was a local file
    if (req.file) {
      // Delete old video file if it exists and is a local file
      if (project.video && project.video.startsWith('/videos/')) {
        const oldFilePath = path.join(videosPath, path.basename(project.video));
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      // Save path as /videos/filename
      videoUrl = '/videos/' + req.file.filename;
      updateData.video = videoUrl;
    } else if (videoUrl !== undefined) {
      // If URL is provided, use it as is
      updateData.video = videoUrl.trim();
    }
    // If videoUrl is undefined, don't update the video field

    // Parse arrays from JSON strings if they come from FormData
    if (typeof updateData.challenges === 'string') {
      try {
        updateData.challenges = JSON.parse(updateData.challenges);
      } catch (e) {
        updateData.challenges = [];
      }
    }
    if (typeof updateData.executionMethods === 'string') {
      try {
        updateData.executionMethods = JSON.parse(updateData.executionMethods);
      } catch (e) {
        updateData.executionMethods = [];
      }
    }
    if (typeof updateData.results === 'string') {
      try {
        updateData.results = JSON.parse(updateData.results);
      } catch (e) {
        updateData.results = [];
      }
    }
    if (typeof updateData.gallery === 'string') {
      try {
        updateData.gallery = JSON.parse(updateData.gallery);
      } catch (e) {
        updateData.gallery = [];
      }
    }

    // Parse year as number if provided
    if (updateData.year) {
      updateData.year = parseInt(updateData.year);
    }

    // Remove _id and __v from request body if present (these shouldn't be updated)
    delete updateData._id;
    delete updateData.__v;
    delete updateData.id; // Remove id if present, as it's a virtual
    delete updateData.createdAt; // Don't update timestamps
    delete updateData.updatedAt;

    // Validate required fields before updating
    const finalData = { ...project.toObject(), ...updateData };
    if (!finalData.name || !finalData.location || !finalData.year || !finalData.duration || !finalData.image || !finalData.description) {
      // Clean up uploaded file if validation fails
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ error: 'Missing required fields: name, location, year, duration, image, and description are required' });
    }

    // Ensure arrays are arrays
    if (updateData.challenges !== undefined && !Array.isArray(updateData.challenges)) {
      updateData.challenges = [];
    }
    if (updateData.executionMethods !== undefined && !Array.isArray(updateData.executionMethods)) {
      updateData.executionMethods = [];
    }
    if (updateData.results !== undefined && !Array.isArray(updateData.results)) {
      updateData.results = [];
    }
    if (updateData.gallery !== undefined && !Array.isArray(updateData.gallery)) {
      updateData.gallery = [];
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    console.log('Project updated successfully');
    res.json(updatedProject);
  } catch (error) {
    console.error('Error updating project:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Clean up uploaded file if there was an error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    // Check if response was already sent
    if (res.headersSent) {
      return;
    }
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(e => e.message).join(', ');
      return res.status(400).json({ error: `Validation error: ${validationErrors}` });
    } else if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid project ID format' });
    } else if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Video file is too large. Maximum size is 100MB.' });
    } else {
      return res.status(500).json({ 
        error: error.message || 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
});

// DELETE a project (protected)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid project ID format' });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Delete the video file if it's a local file
    if (project.video && project.video.startsWith('/videos/')) {
      const filePath = path.join(videosPath, path.basename(project.video));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted successfully', project });
  } catch (error) {
    console.error('Error deleting project:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid project ID format' });
    }
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

module.exports = router;

