const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createList,
  getListsByBoard,
  updateList,
  deleteList,
} = require('../controllers/listController');

// Create list in a board
router.post('/', protect, createList);

// Get all lists for a board
router.get('/board/:boardId', protect, getListsByBoard);

// Update list
router.put('/:id', protect, updateList);

// Delete list
router.delete('/:id', protect, deleteList);

module.exports = router;
