const Project = require('../models/Project');

exports.createProject = async (req, res) => {
  try {
    const { title, description, members, status, priority, startDate, endDate, deadline, tags } = req.body;
    const newProject = await Project.create({
      title,
      description,
      status: status || 'planning',
      priority: priority || 'medium',
      startDate,
      endDate,
      deadline,
      createdBy: req.user._id,
      members,
      tags
    });
    res.status(201).json(newProject);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create project', error: err.message });
  }
};

exports.getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ createdBy: req.user._id }, { members: req.user._id }]
    })
    .populate('members', 'name email')
    .populate('createdBy', 'name email')
    .populate('updates.updatedBy', 'name email')
    .sort({ updatedAt: -1 });
    res.status(200).json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch projects', error: err.message });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findOne({
      _id: id,
      $or: [{ createdBy: req.user._id }, { members: req.user._id }]
    })
    .populate('members', 'name email')
    .populate('createdBy', 'name email')
    .populate('updates.updatedBy', 'name email');
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    res.status(200).json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch project', error: err.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, startDate, endDate, deadline, tags, progress } = req.body;
    
    const project = await Project.findOne({
      _id: id,
      $or: [{ createdBy: req.user._id }, { members: req.user._id }]
    });
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Update project fields
    if (title) project.title = title;
    if (description !== undefined) project.description = description;
    if (status) project.status = status;
    if (priority) project.priority = priority;
    if (startDate) project.startDate = startDate;
    if (endDate) project.endDate = endDate;
    if (deadline) project.deadline = deadline;
    if (tags) project.tags = tags;
    if (progress !== undefined) project.progress = progress;
    
    await project.save();
    
    res.status(200).json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update project', error: err.message });
  }
};

exports.addProjectUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, title, description, priority, tags } = req.body;
    
    const project = await Project.findOne({
      _id: id,
      $or: [{ createdBy: req.user._id }, { members: req.user._id }]
    });
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Create new update
    const newUpdate = {
      type: type || 'general',
      title,
      description,
      updatedBy: req.user._id,
      priority: priority || 'medium',
      tags: tags || []
    };
    
    project.updates.push(newUpdate);
    await project.save();
    
    // Populate the new update with user info
    await project.populate('updates.updatedBy', 'name email');
    
    res.status(201).json({ 
      message: 'Update added successfully', 
      update: project.updates[project.updates.length - 1],
      project
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to add project update', error: err.message });
  }
};

exports.getProjectUpdates = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const project = await Project.findOne({
      _id: id,
      $or: [{ createdBy: req.user._id }, { members: req.user._id }]
    })
    .populate('updates.updatedBy', 'name email')
    .select('updates');
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Sort updates by creation date (newest first) and paginate
    const sortedUpdates = project.updates.sort((a, b) => b.createdAt - a.createdAt);
    const paginatedUpdates = sortedUpdates.slice(skip, skip + limit);
    const totalUpdates = project.updates.length;
    
    res.status(200).json({
      updates: paginatedUpdates,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalUpdates / limit),
        totalUpdates,
        hasMore: skip + limit < totalUpdates
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch project updates', error: err.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    
    const project = await Project.findOne({
      _id: id,
      createdBy: req.user._id // Only project creator can delete
    });
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found or unauthorized' });
    }
    
    await Project.findByIdAndDelete(id);
    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete project', error: err.message });
  }
};
