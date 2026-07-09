const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUsersById,
  updateMe,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const { protect, authorize } = require('../middlewares/authMiddleware');


router.put('/me', protect, updateMe);


router.get('/', protect, authorize('admin'), getUsers);
router.get('/:id', protect, authorize('admin'), getUsersById);
router.put('/:id', protect, authorize('admin'), updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;