const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createProject,
  getMyProjects,
  getProjectById,
  updateProject,
  addProjectUpdate,
  getProjectUpdates,
  deleteProject
} = require('../controllers/projectController');

// Project CRUD routes
router.post('/', protect, createProject);
router.get('/', protect, getMyProjects);
router.get('/:id', protect, getProjectById);
router.put('/:id', protect, updateProject);
router.delete('/:id', protect, deleteProject);

// Project updates/activity routes
router.post('/:id/updates', protect, addProjectUpdate);
router.get('/:id/updates', protect, getProjectUpdates);

module.exports = router;
