const express = require('express');
const router = express.Router();
const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Public read access
router.get('/', getCategories);
router.get('/:id', getCategoryById);

// Only organizers/admins can manage categories
router.post('/', protect, authorize('organizer', 'admin'), createCategory);
router.put('/:id', protect, authorize('organizer', 'admin'), updateCategory);
router.delete('/:id', protect, authorize('organizer', 'admin'), deleteCategory);

module.exports = router;