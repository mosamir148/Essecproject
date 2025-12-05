const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const News = require('../models/News');
const { authenticate } = require('../middleware/auth');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Helper function to upload image to Cloudinary
async function uploadToCloudinary(fileData, folder = 'news') {
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

// GET all news (public endpoint, sorted by displayOrder then publicationDate)
router.get('/', async (req, res) => {
  try {
    const sortBy = req.query.sortBy || 'displayOrder'; // 'displayOrder' or 'date'
    const limit = parseInt(req.query.limit) || 20; // Limit results for performance
    let sortQuery = {};
    
    if (sortBy === 'date') {
      sortQuery = { publicationDate: -1 };
    } else {
      sortQuery = { displayOrder: 1, publicationDate: -1 };
    }
    
    // Only fetch necessary fields for list view (exclude heavy fields for performance)
    // Exclude fullText, additionalImages (can be large base64), and other heavy fields
    const news = await News.find()
      .select('title mainImage summary publicationDate displayOrder createdAt updatedAt _id')
      .sort(sortQuery)
      .limit(limit)
      .lean() // Use lean() for faster queries
      .maxTimeMS(5000); // 5 second timeout for the query
    
    // Transform _id to id for consistency (lean() bypasses Mongoose transforms)
    const transformedNews = news.map(item => {
      const { _id, ...rest } = item;
      return {
        ...rest,
        id: _id.toString()
      };
    });
    
    res.json(transformedNews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET a single news item by ID (public)
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid news ID format' });
    }

    const newsItem = await News.findById(req.params.id);
    if (!newsItem) {
      return res.status(404).json({ error: 'News item not found' });
    }
    res.json(newsItem);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid news ID format' });
    }
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// POST create a new news item (protected)
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, mainImage, summary, fullText, additionalImages, publicationDate, displayOrder, extraData } = req.body;

    if (!title || !mainImage || !summary || !fullText) {
      return res.status(400).json({ error: 'Title, main image, summary, and full text are required' });
    }

    // Upload main image
    const mainImageResult = await uploadToCloudinary(mainImage, 'news/main');
    
    // Upload additional images
    let additionalImagesUrls = [];
    let additionalImagesPublicIds = [];
    
    if (additionalImages && Array.isArray(additionalImages)) {
      for (const img of additionalImages) {
        if (img) {
          const imgResult = await uploadToCloudinary(img, 'news/additional');
          if (imgResult && imgResult.url) {
            additionalImagesUrls.push(imgResult.url);
            if (imgResult.publicId) {
              additionalImagesPublicIds.push(imgResult.publicId);
            }
          }
        }
      }
    }

    const newsItem = new News({
      title,
      mainImage: mainImageResult.url,
      mainImagePublicId: mainImageResult.publicId || '',
      summary,
      fullText,
      additionalImages: additionalImagesUrls,
      additionalImagesPublicIds,
      publicationDate: publicationDate ? new Date(publicationDate) : new Date(),
      displayOrder: displayOrder || 0,
      extraData: extraData || {}
    });

    const savedNews = await newsItem.save();
    res.status(201).json(savedNews);
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }
});

// PUT update a news item (protected)
router.put('/:id', authenticate, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid news ID format' });
    }

    const newsItem = await News.findById(req.params.id);
    if (!newsItem) {
      return res.status(404).json({ error: 'News item not found' });
    }

    const { title, mainImage, summary, fullText, additionalImages, publicationDate, displayOrder, extraData, removeMainImage, removeAdditionalImages } = req.body;

    // Update basic fields
    if (title !== undefined) newsItem.title = title;
    if (summary !== undefined) newsItem.summary = summary;
    if (fullText !== undefined) newsItem.fullText = fullText;
    if (publicationDate !== undefined) newsItem.publicationDate = new Date(publicationDate);
    if (displayOrder !== undefined) newsItem.displayOrder = displayOrder;
    if (extraData !== undefined) newsItem.extraData = extraData;

    // Handle main image
    if (removeMainImage) {
      // Delete old image from Cloudinary
      if (newsItem.mainImagePublicId) {
        await deleteFromCloudinary(newsItem.mainImagePublicId);
      }
      newsItem.mainImage = '';
      newsItem.mainImagePublicId = '';
    } else if (mainImage && mainImage !== newsItem.mainImage) {
      // Delete old image if it exists and is from Cloudinary
      if (newsItem.mainImagePublicId) {
        await deleteFromCloudinary(newsItem.mainImagePublicId);
      }
      // Upload new image
      const imageResult = await uploadToCloudinary(mainImage, 'news/main');
      newsItem.mainImage = imageResult.url;
      newsItem.mainImagePublicId = imageResult.publicId || '';
    }

    // Handle additional images
    if (removeAdditionalImages && Array.isArray(removeAdditionalImages)) {
      // Delete specified images from Cloudinary
      for (const index of removeAdditionalImages) {
        if (newsItem.additionalImagesPublicIds[index]) {
          await deleteFromCloudinary(newsItem.additionalImagesPublicIds[index]);
        }
      }
      // Remove from arrays
      const indicesToRemove = new Set(removeAdditionalImages.sort((a, b) => b - a));
      newsItem.additionalImages = newsItem.additionalImages.filter((_, i) => !indicesToRemove.has(i));
      newsItem.additionalImagesPublicIds = newsItem.additionalImagesPublicIds.filter((_, i) => !indicesToRemove.has(i));
    }

    if (additionalImages && Array.isArray(additionalImages)) {
      // Upload new additional images
      for (const img of additionalImages) {
        if (img && !img.startsWith('http://') && !img.startsWith('https://')) {
          // Only upload if it's not already a URL (new image)
          const imgResult = await uploadToCloudinary(img, 'news/additional');
          if (imgResult && imgResult.url) {
            // Check if this is replacing an existing image or adding new
            const existingIndex = newsItem.additionalImages.findIndex(existing => existing === img);
            if (existingIndex >= 0) {
              // Replace existing
              if (newsItem.additionalImagesPublicIds[existingIndex]) {
                await deleteFromCloudinary(newsItem.additionalImagesPublicIds[existingIndex]);
              }
              newsItem.additionalImages[existingIndex] = imgResult.url;
              newsItem.additionalImagesPublicIds[existingIndex] = imgResult.publicId || '';
            } else {
              // Add new
              newsItem.additionalImages.push(imgResult.url);
              newsItem.additionalImagesPublicIds.push(imgResult.publicId || '');
            }
          }
        } else if (img && (img.startsWith('http://') || img.startsWith('https://'))) {
          // Already a URL, just add it if not already present
          if (!newsItem.additionalImages.includes(img)) {
            newsItem.additionalImages.push(img);
            newsItem.additionalImagesPublicIds.push('');
          }
        }
      }
    }

    const updatedNews = await newsItem.save();
    res.json(updatedNews);
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(400).json({ error: error.message });
    } else if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid news ID format' });
    } else {
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }
});

// DELETE a news item (protected)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid news ID format' });
    }

    const newsItem = await News.findById(req.params.id);
    if (!newsItem) {
      return res.status(404).json({ error: 'News item not found' });
    }

    // Delete images from Cloudinary
    if (newsItem.mainImagePublicId) {
      await deleteFromCloudinary(newsItem.mainImagePublicId);
    }
    
    if (newsItem.additionalImagesPublicIds && newsItem.additionalImagesPublicIds.length > 0) {
      for (const publicId of newsItem.additionalImagesPublicIds) {
        if (publicId) {
          await deleteFromCloudinary(publicId);
        }
      }
    }

    await News.findByIdAndDelete(req.params.id);
    res.json({ message: 'News item deleted successfully' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid news ID format' });
    }
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

module.exports = router;

