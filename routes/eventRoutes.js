const express = require('express');
const router = express.Router();
const Role = require('../constants/roles');
const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} = require('../controllers/eventController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Public read access
router.get('/', getEvents);
router.get('/:id', getEventById);

// Organizer-only write access (ownership is checked inside the controller
// for update/delete so an organizer can't touch another organizer's event)
router.post('/', protect, authorize(Role.ORGANIZER, Role.ADMIN), createEvent);
router.put('/:id', protect, authorize(Role.ORGANIZER, Role.ADMIN), updateEvent);
router.delete('/:id', protect, authorize(Role.ORGANIZER, Role.ADMIN), deleteEvent);

module.exports = router;