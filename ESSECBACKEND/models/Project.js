const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: Number,
    required: true,
    min: 2000,
    max: 2100
  },
  duration: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    required: true,
    trim: true
  },
  video: {
    type: String,
    trim: true,
    default: ''
  },
  description: {
    type: String,
    required: true
  },
  challenges: {
    type: [String],
    default: []
  },
  executionMethods: {
    type: [String],
    default: []
  },
  results: {
    type: [String],
    default: []
  },
  technicalNotes: {
    type: String,
    default: ''
  },
  gallery: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

// Add indexes for faster queries
projectSchema.index({ createdAt: -1 }); // For sorting by creation date

// Generate a URL-friendly ID from the name
projectSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

projectSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Project', projectSchema);

