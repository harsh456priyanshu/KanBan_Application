const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  
  // Board type
  type: { 
    type: String, 
    enum: ['scrum', 'kanban', 'next_gen'],
    default: 'scrum' 
  },
  
  // Board administrators
  administrators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // Board configuration
  configuration: {
    // Column configuration
    columns: [{
      name: { type: String, required: true },
      statusIds: [{ type: String }],
      max: { type: Number }, // WIP limit
      color: { type: String, default: '#0052CC' }
    }],
    
    // Quick filters
    quickFilters: [{
      name: { type: String },
      jql: { type: String },
      description: { type: String },
      position: { type: Number }
    }],
    
    // Swimlanes
    swimlanes: {
      type: { type: String, enum: ['none', 'assignee', 'epic', 'queries'], default: 'none' },
      queries: [{
        name: { type: String },
        jql: { type: String }
      }]
    },
    
    // Card layout
    cardLayout: {
      fields: [{ type: String }],
      colors: {
        issueType: { type: Boolean, default: true },
        priority: { type: Boolean, default: true }
      }
    },
    
    // Working days
    workingDays: {
      monday: { type: Boolean, default: true },
      tuesday: { type: Boolean, default: true },
      wednesday: { type: Boolean, default: true },
      thursday: { type: Boolean, default: true },
      friday: { type: Boolean, default: true },
      saturday: { type: Boolean, default: false },
      sunday: { type: Boolean, default: false }
    },
    
    // Estimation
    estimation: {
      field: { type: String, enum: ['story_points', 'time_original_estimate', 'issue_count'], default: 'story_points' },
      timeFormat: { type: String, enum: ['days', 'hours'], default: 'hours' }
    }
  },
  
  // Board filters
  filter: {
    jql: { type: String },
    name: { type: String },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    shared: { type: Boolean, default: false }
  },
  
  // Board location
  location: {
    type: { type: String, enum: ['project', 'user'], default: 'project' },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  
  // Board permissions
  permissions: {
    view: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    edit: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    admin: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  
  // Board favorites
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // Board visibility
  visibility: { type: String, enum: ['public', 'private'], default: 'public' },
  
  // Board statistics
  statistics: {
    totalIssues: { type: Number, default: 0 },
    lastViewed: { type: Date },
    viewCount: { type: Number, default: 0 }
  },
  
  // Board status
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Index for better query performance
boardSchema.index({ project: 1, isActive: 1 });
boardSchema.index({ 'administrators': 1 });
boardSchema.index({ 'location.projectId': 1 });
boardSchema.index({ 'location.userId': 1 });

// Method to check if user can view board
boardSchema.methods.canView = function(userId) {
  if (this.visibility === 'public') return true;
  const userIdStr = userId.toString();
  return this.permissions.view.some(id => id.toString() === userIdStr) || 
         this.permissions.edit.some(id => id.toString() === userIdStr) || 
         this.permissions.admin.some(id => id.toString() === userIdStr) ||
         this.administrators.some(id => id.toString() === userIdStr);
};

// Method to check if user can edit board
boardSchema.methods.canEdit = function(userId) {
  return this.permissions.edit.includes(userId) || 
         this.permissions.admin.includes(userId);
};

// Method to check if user is admin
boardSchema.methods.isAdmin = function(userId) {
  return this.administrators.includes(userId) || 
         this.permissions.admin.includes(userId);
};

module.exports = mongoose.model('Board', boardSchema);
