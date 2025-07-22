const mongoose = require('mongoose');

// Project Update/Activity Schema
const projectUpdateSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['status', 'milestone', 'note', 'member_added', 'member_removed', 'file_upload', 'task_completed', 'general'],
    default: 'general'
  },
  title: { type: String, required: true },
  description: String,
  updatedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    mimetype: String,
    size: Number,
    uploadDate: { type: Date, default: Date.now }
  }],
  tags: [String],
  isVisible: { type: Boolean, default: true }
}, { timestamps: true });

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  status: {
    type: String,
    enum: ['planning', 'active', 'on_hold', 'completed', 'cancelled'],
    default: 'planning'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  startDate: Date,
  endDate: Date,
  deadline: Date,
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  members: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  updates: [projectUpdateSchema],
  tags: [String],
  isArchived: { type: Boolean, default: false },
  settings: {
    allowMemberUpdates: { type: Boolean, default: true },
    requireApproval: { type: Boolean, default: false },
    emailNotifications: { type: Boolean, default: true }
  }
}, { timestamps: true });

// Add indexes for better performance
projectSchema.index({ createdBy: 1, status: 1 });
projectSchema.index({ members: 1 });
projectSchema.index({ 'updates.createdAt': -1 });

// Virtual for latest update
projectSchema.virtual('latestUpdate').get(function() {
  return this.updates.length > 0 ? this.updates[this.updates.length - 1] : null;
});

// Virtual for update count
projectSchema.virtual('updateCount').get(function() {
  return this.updates.length;
});

module.exports = mongoose.model('Project', projectSchema);
