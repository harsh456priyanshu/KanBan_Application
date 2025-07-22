const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    username: { type: String, unique: true },
    displayName: { type: String },
    avatar: { type: String, default: '' },
    jobTitle: { type: String },
    department: { type: String },
    location: { type: String },
    timezone: { type: String, default: 'UTC' },
    language: { type: String, default: 'en' },
    phoneNumber: { type: String },
    role: {
        type: String, 
        enum: ['admin', 'project_manager', 'developer', 'tester', 'user'], 
        default: 'user'
    },
    isActive:  { type: Boolean, default: true },
    lastLogin: { type: Date },
    preferences:  {
        theme: { type: String, default: 'light' },
        emailNotifications: { type: Boolean, default: true },
        inAppNotifications: { type: Boolean, default: true },
        dashboardLayout: { type: String, default: 'default' }
    },
    permissions: [{
        resource: String,
        actions: [String]
    }],
    groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
    worklog: [{
        issue: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue' },
        timeSpent: Number,
        description: String,
        date: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.comparePassword = function(password) {
    return bcrypt.compare(password, this.password);
};

userSchema.methods.hasPermission = function(resource, action) {
    const permission = this.permissions.find(p => p.resource === resource);
    return permission && permission.actions.includes(action);
};

module.exports = mongoose.model('User', userSchema);
