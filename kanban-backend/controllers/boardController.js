const Board = require('../models/Board');
const Project = require('../models/Project');

exports.createBoard = async (req, res) => {
  try {
    const { name, description, projectId, type } = req.body;

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Unauthorized: No user info' });
    }

    if (!name) {
      return res.status(400).json({ message: 'Board name is required' });
    }

    // If no projectId provided, create a default project
    let finalProjectId = projectId;
    if (!projectId) {
      const defaultProject = new Project({
        title: `${name} Project`,
        description: `Default project for ${name} board`,
        createdBy: req.user._id
      });
      await defaultProject.save();
      finalProjectId = defaultProject._id;
    } else {
      // Verify the project exists
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(400).json({ message: 'Project not found' });
      }
    }

    // Default configuration for new boards
    const defaultConfig = {
      columns: [
        { name: 'To Do', statusIds: ['todo'], color: '#0052CC' },
        { name: 'In Progress', statusIds: ['inprogress'], color: '#0052CC' },
        { name: 'Done', statusIds: ['done'], color: '#0052CC' }
      ],
      quickFilters: [],
      swimlanes: { type: 'none', queries: [] },
      cardLayout: { fields: [], colors: { issueType: true, priority: true } },
      workingDays: {
        monday: true, tuesday: true, wednesday: true, thursday: true, friday: true,
        saturday: false, sunday: false
      },
      estimation: { field: 'story_points', timeFormat: 'hours' }
    };

    const board = new Board({
      name,
      description: description || '',
      project: finalProjectId,
      type: type || 'kanban',
      administrators: [req.user._id],
      configuration: defaultConfig,
      location: {
        type: 'project',
        projectId: finalProjectId,
        userId: req.user._id
      },
      permissions: {
        view: [req.user._id],
        edit: [req.user._id],
        admin: [req.user._id]
      },
      visibility: 'public',
      statistics: {
        totalIssues: 0,
        lastViewed: new Date(),
        viewCount: 0
      },
      isActive: true
    });

    await board.save();
    res.status(201).json(board);
  } catch (error) {
    console.error('Error creating board:', error);
    res.status(500).json({ message: 'Board creation failed', error: error.message });
  }
};

// Get all boards for a user
exports.getBoards = async (req, res) => {
  try {
    const boards = await Board.find({ 
      $or: [
        { administrators: req.user._id },
        { 'permissions.view': req.user._id },
        { 'permissions.edit': req.user._id },
        { 'permissions.admin': req.user._id }
      ]
    }).populate('project', 'title description');
    res.status(200).json(boards);
  } catch (error) {
    console.error('Error getting boards:', error);
    res.status(500).json({ message: 'Fetching boards failed' });
  }
};

exports.getBoardsByProject = async (req, res) => {
  try {
    const boards = await Board.find({ project: req.params.projectId })
      .populate('project', 'title description');
    res.status(200).json(boards);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch boards' });
  }
};

exports.updateBoard = async (req, res) => {
  try {
    const updatedBoard = await Board.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedBoard);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update board' });
  }
};

exports.deleteBoard = async (req, res) => {
  try {
    await Board.findByIdAndDelete(req.params.id);
    res.json({ message: 'Board deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete board' });
  }
};
