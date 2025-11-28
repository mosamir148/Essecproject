const mongoose = require('mongoose');

const homepageVideoSchema = new mongoose.Schema({
  videoUrl: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    trim: true,
    default: ''
  },
  subtitle: {
    type: String,
    trim: true,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Add indexes for faster queries
homepageVideoSchema.index({ isActive: 1, createdAt: -1 }); // For finding active video

// Note: We handle the "only one active video" logic in the route handlers
// instead of the pre-save hook to avoid circular reference issues

homepageVideoSchema.set('toJSON', {
  transform: function(doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

// Export the model, checking if it already exists to avoid re-registration errors
const HomepageVideo = mongoose.models.HomepageVideo || mongoose.model('HomepageVideo', homepageVideoSchema);
module.exports = HomepageVideo;

