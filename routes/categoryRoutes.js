const express = require('express');
const router = express.Router();
const Role = require('../constants/roles');
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

// Only admins can manage categories (shared/global data across all events)
router.post('/', protect, authorize(Role.ADMIN), createCategory);
router.put('/:id', protect, authorize(Role.ADMIN), updateCategory);
router.delete('/:id', protect, authorize(Role.ADMIN), deleteCategory);

module.exports = router;