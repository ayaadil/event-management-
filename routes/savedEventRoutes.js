const express = require('express');
const router = express.Router();
const {
  saveEvent,
  unsaveEvent,
  getMySavedEvents,
} = require('../controllers/savedEventController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/my', protect, getMySavedEvents);
router.post('/:eventId', protect, saveEvent);
router.delete('/:eventId', protect, unsaveEvent);

module.exports = router;
