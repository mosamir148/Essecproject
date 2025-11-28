const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const TeamMember = require('../models/TeamMember');
const { authenticate } = require('../middleware/auth');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Helper function to upload image to Cloudinary
async function uploadToCloudinary(fileData, folder = 'team') {
  if (!fileData) return null;
  
  // Check if it's already a URL (not base64)
  if (fileData.startsWith('http://') || fileData.startsWith('https://')) {
    return { url: fileData, publicId: null };
  }
  
  // Check if Cloudinary is configured
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    // If Cloudinary is not configured, return the data as-is (assuming it's a base64 or URL)
    return { url: fileData, publicId: null };
  }
  
  try {
    // Upload base64 image to Cloudinary
    const result = await cloudinary.uploader.upload(fileData, {
      folder: folder,
      resource_type: 'auto'
    });
    return { url: result.secure_url, publicId: result.public_id };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    // If upload fails, return the original data
    return { url: fileData, publicId: null };
  }
}

// Helper function to delete from Cloudinary
async function deleteFromCloudinary(publicId) {
  if (!publicId || !process.env.CLOUDINARY_CLOUD_NAME) {
    return;
  }
  
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    // Don't throw error, just log it
  }
}

// GET all team members (public endpoint, sorted by displayOrder)
router.get('/', async (req, res) => {
  try {
    const members = await TeamMember.find().sort({ displayOrder: 1, createdAt: -1 });
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET a single team member by ID (public endpoint)
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid team member ID format' });
    }

    const member = await TeamMember.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ error: 'Team member not found' });
    }
    res.json(member);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid team member ID format' });
    }
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// POST create a new team member (protected)
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, role, bio, profileImage, socialLinks, cvUrl } = req.body;

    // Validate required fields
    if (!name || !role || !bio) {
      return res.status(400).json({ error: 'Name, role, and bio are required' });
    }

    // Upload profile image if provided
    let profileImageUrl = '';
    let profileImagePublicId = '';
    if (profileImage) {
      const imageResult = await uploadToCloudinary(profileImage, 'team/profiles');
      profileImageUrl = imageResult.url;
      profileImagePublicId = imageResult.publicId || '';
    }

    // Upload CV if provided
    let cvUrlFinal = '';
    let cvPublicId = '';
    if (cvUrl) {
      const cvResult = await uploadToCloudinary(cvUrl, 'team/cvs');
      cvUrlFinal = cvResult.url;
      cvPublicId = cvResult.publicId || '';
    }

    // Get the highest displayOrder and add 1
    const lastMember = await TeamMember.findOne().sort({ displayOrder: -1 });
    const displayOrder = lastMember ? lastMember.displayOrder + 1 : 0;

    const member = new TeamMember({
      name,
      role,
      bio,
      profileImage: profileImageUrl,
      profileImagePublicId,
      socialLinks: socialLinks || {},
      cvUrl: cvUrlFinal,
      cvPublicId,
      displayOrder
    });

    const savedMember = await member.save();
    res.status(201).json(savedMember);
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// PUT update a team member (protected)
router.put('/:id', authenticate, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid team member ID format' });
    }

    const member = await TeamMember.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    const { name, role, bio, profileImage, socialLinks, cvUrl, displayOrder, removeProfileImage, removeCv } = req.body;

    // Update basic fields
    if (name !== undefined) member.name = name;
    if (role !== undefined) member.role = role;
    if (bio !== undefined) member.bio = bio;
    if (displayOrder !== undefined) member.displayOrder = displayOrder;
    if (socialLinks !== undefined) member.socialLinks = { ...member.socialLinks, ...socialLinks };

    // Handle profile image
    if (removeProfileImage) {
      // Delete old image from Cloudinary
      if (member.profileImagePublicId) {
        await deleteFromCloudinary(member.profileImagePublicId);
      }
      member.profileImage = '';
      member.profileImagePublicId = '';
    } else if (profileImage && profileImage !== member.profileImage) {
      // Delete old image if it exists and is from Cloudinary
      if (member.profileImagePublicId) {
        await deleteFromCloudinary(member.profileImagePublicId);
      }
      // Upload new image
      const imageResult = await uploadToCloudinary(profileImage, 'team/profiles');
      member.profileImage = imageResult.url;
      member.profileImagePublicId = imageResult.publicId || '';
    }

    // Handle CV
    if (removeCv) {
      // Delete old CV from Cloudinary
      if (member.cvPublicId) {
        await deleteFromCloudinary(member.cvPublicId);
      }
      member.cvUrl = '';
      member.cvPublicId = '';
    } else if (cvUrl && cvUrl !== member.cvUrl) {
      // Delete old CV if it exists and is from Cloudinary
      if (member.cvPublicId) {
        await deleteFromCloudinary(member.cvPublicId);
      }
      // Upload new CV
      const cvResult = await uploadToCloudinary(cvUrl, 'team/cvs');
      member.cvUrl = cvResult.url;
      member.cvPublicId = cvResult.publicId || '';
    }

    const updatedMember = await member.save();
    res.json(updatedMember);
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(400).json({ error: error.message });
    } else if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid team member ID format' });
    } else {
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }
});

// DELETE a team member (protected)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid team member ID format' });
    }

    const member = await TeamMember.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    // Delete images from Cloudinary
    if (member.profileImagePublicId) {
      await deleteFromCloudinary(member.profileImagePublicId);
    }
    if (member.cvPublicId) {
      await deleteFromCloudinary(member.cvPublicId);
    }

    await TeamMember.findByIdAndDelete(req.params.id);
    res.json({ message: 'Team member deleted successfully' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid team member ID format' });
    }
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

module.exports = router;

