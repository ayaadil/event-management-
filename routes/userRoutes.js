const express = require('express');
const router = express.Router();
const Role = require('../constants/roles');
const {
  getUsers,
  getUsersById,
  updateMe,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const { protect, authorize } = require('../middlewares/authMiddleware');


router.put('/me', protect, updateMe);


router.get('/', protect, authorize(Role.ADMIN), getUsers);
router.get('/:id', protect, authorize(Role.ADMIN), getUsersById);
router.put('/:id', protect, authorize(Role.ADMIN), updateUser);
router.delete('/:id', protect, authorize(Role.ADMIN), deleteUser);

module.exports = router;