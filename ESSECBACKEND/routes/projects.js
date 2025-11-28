const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Project = require('../models/Project');
const { authenticate } = require('../middleware/auth');

// GET all projects
router.get('/', async (req, res) => {
  try {
    // Use lean() for faster queries and add timeout
    const projects = await Project.find()
      .sort({ createdAt: -1 })
      .lean()
      .maxTimeMS(5000); // 5 second timeout
    res.json(projects);
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
router.post('/', authenticate, async (req, res) => {
  try {
    const project = new Project(req.body);
    const savedProject = await project.save();
    res.status(201).json(savedProject);
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// PUT update a project (protected)
router.put('/:id', authenticate, async (req, res) => {
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid project ID format' });
    }

    console.log('Updating project:', req.params.id);
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    // Remove _id and __v from request body if present (these shouldn't be updated)
    const updateData = { ...req.body };
    delete updateData._id;
    delete updateData.__v;
    delete updateData.id; // Remove id if present, as it's a virtual
    delete updateData.createdAt; // Don't update timestamps
    delete updateData.updatedAt;

    // Validate required fields before updating
    if (!updateData.name || !updateData.location || !updateData.year || !updateData.duration || !updateData.image || !updateData.description) {
      return res.status(400).json({ error: 'Missing required fields: name, location, year, duration, image, and description are required' });
    }

    // Ensure arrays are arrays
    if (updateData.challenges && !Array.isArray(updateData.challenges)) {
      updateData.challenges = [];
    }
    if (updateData.executionMethods && !Array.isArray(updateData.executionMethods)) {
      updateData.executionMethods = [];
    }
    if (updateData.results && !Array.isArray(updateData.results)) {
      updateData.results = [];
    }
    if (updateData.gallery && !Array.isArray(updateData.gallery)) {
      updateData.gallery = [];
    }

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    console.log('Project updated successfully');
    res.json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Check if response was already sent
    if (res.headersSent) {
      return;
    }
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(e => e.message).join(', ');
      return res.status(400).json({ error: `Validation error: ${validationErrors}` });
    } else if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid project ID format' });
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

    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
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

