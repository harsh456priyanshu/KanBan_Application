const express = require('express');
const router = express.Router();
const {register , login} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register' , register);
router.post('/login' , login);

// Route to verify current user
router.get('/me', protect, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;