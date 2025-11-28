const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  mainImage: {
    type: String,
    required: true,
    trim: true
  },
  mainImagePublicId: {
    type: String,
    default: '',
    trim: true
  },
  summary: {
    type: String,
    required: true,
    trim: true
  },
  fullText: {
    type: String,
    required: true
  },
  additionalImages: {
    type: [String],
    default: []
  },
  additionalImagesPublicIds: {
    type: [String],
    default: []
  },
  publicationDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  extraData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Add indexes for faster queries
newsSchema.index({ displayOrder: 1, publicationDate: -1 }); // For sorting by displayOrder
newsSchema.index({ publicationDate: -1 }); // For sorting by date

// Generate a URL-friendly ID
newsSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

newsSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('News', newsSchema);

