const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  title: { type: String, required: true },
  list: { type: mongoose.Schema.Types.ObjectId, ref: 'List', required: true },
  description: {
    type: String,
    default: '',
  },
  dueDate: {
    type: Date,
    default: null,
  },
  order: {
    type: Number,
    default: 0
  },
  attachments: [{
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    size: { type: Number, required: true },
    mimetype: { type: String, required: true },
    url: { type: String, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    uploadedAt: { type: Date, default: Date.now }
  }],
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  labels: [{
    name: String,
    color: String
  }],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'completed'],
    default: 'active'
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Card', cardSchema);
