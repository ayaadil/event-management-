const express = require('express');
const router = express.Router();
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
router.post('/', protect, authorize('organizer', 'admin'), createEvent);
router.put('/:id', protect, authorize('organizer', 'admin'), updateEvent);
router.delete('/:id', protect, authorize('organizer', 'admin'), deleteEvent);

module.exports = router;