const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    trim: true
  },
  bio: {
    type: String,
    required: true,
    trim: true
  },
  profileImage: {
    type: String,
    trim: true,
    default: ''
  },
  profileImagePublicId: {
    type: String,
    trim: true,
    default: ''
  },
  socialLinks: {
    linkedin: { type: String, trim: true, default: '' },
    twitter: { type: String, trim: true, default: '' },
    facebook: { type: String, trim: true, default: '' },
    instagram: { type: String, trim: true, default: '' },
    website: { type: String, trim: true, default: '' }
  },
  cvUrl: {
    type: String,
    trim: true,
    default: ''
  },
  cvPublicId: {
    type: String,
    trim: true,
    default: ''
  },
  displayOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Generate a URL-friendly ID
teamMemberSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

teamMemberSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('TeamMember', teamMemberSchema);

