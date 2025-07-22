const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createBoard,
  getBoards,
  getBoardsByProject,
  updateBoard,
  deleteBoard,
} = require('../controllers/boardController');

// Create Board under a project
router.post('/', protect, createBoard);

// Get all boards of the logged-in user
router.get('/', protect, getBoards);

// Get single board by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const board = await require('../models/Board').findById(req.params.id).populate('project', 'name description');
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }
    
    // Check if user can view this board
    if (!board.canView(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to view this board' });
    }
    
    res.json(board);
  } catch (error) {
    console.error('Error fetching board:', error);
    res.status(500).json({ message: 'Failed to fetch board', error: error.message });
  }
});

// Get boards by project
router.get('/project/:projectId', protect, getBoardsByProject);

// Update board
router.put('/:id', protect, updateBoard);

// Delete board
router.delete('/:id', protect, deleteBoard);

// Get lists for a board
router.get('/:id/lists', protect, (req, res) => {
  req.params.boardId = req.params.id;
  require('../controllers/listController').getListsByBoard(req, res);
});

// Create list for a board
router.post('/:id/lists', protect, (req, res) => {
  req.body.boardId = req.params.id;
  require('../controllers/listController').createList(req, res);
});

module.exports = router;
