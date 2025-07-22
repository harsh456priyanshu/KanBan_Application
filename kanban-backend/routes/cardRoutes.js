const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createCard,
  getCardsByList,
  updateCard,
  moveCard,
  deleteCard,
  uploadCardAttachment,
  deleteCardAttachment,
} = require('../controllers/cardController');
const upload = require('../middleware/uploadMiddleware');

// Create card in a list
router.post('/list/:listId', protect, createCard);

// Get all cards for a list
router.get('/list/:listId', protect, getCardsByList);

// Update card
router.put('/:id', protect, updateCard);

// Move card to a new list
router.put('/:id/move', protect, moveCard);

// Upload card attachment
router.post('/:id/attachment', protect, upload.single('file'), uploadCardAttachment);

// Delete card attachment
router.delete('/:id/attachment/:attachmentId', protect, deleteCardAttachment);

// Delete card
router.delete('/:id', protect, deleteCard);

module.exports = router;
