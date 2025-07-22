const express = require('express');
const router = express.Router();
const { createBoard } = require('../controllers/boardController');
const {protect} = require('../middleware/authMiddleware');

// POST route to create a board
router.post('/', protect, createBoard);

module.exports = router;
