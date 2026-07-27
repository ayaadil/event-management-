const express = require('express');
const router = express.Router();
const Role = require('../constants/roles');
const {
  getSpeakers,
  createSpeaker,
  linkSpeakerToEvent,
  getSpeakersByEvent,
} = require('../controllers/speakerController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/', getSpeakers);
router.get('/event/:eventId', getSpeakersByEvent);
router.post('/', protect, authorize(Role.ORGANIZER, Role.ADMIN), createSpeaker);
router.post('/link', protect, authorize(Role.ORGANIZER, Role.ADMIN), linkSpeakerToEvent);

module.exports = router;
