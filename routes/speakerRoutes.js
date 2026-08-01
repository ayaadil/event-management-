const express = require('express');
const router = express.Router();
const Role = require('../constants/roles');
const {
  getSpeakers,
  createSpeaker,
  updateSpeaker,
  deleteSpeaker,
  linkSpeakerToEvent,
  unlinkSpeakerFromEvent,
  getSpeakersByEvent,
} = require('../controllers/speakerController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/', getSpeakers);
router.get('/event/:eventId', getSpeakersByEvent);
router.post('/', protect, authorize(Role.ORGANIZER, Role.ADMIN), createSpeaker);
router.put('/:id', protect, authorize(Role.ORGANIZER, Role.ADMIN), updateSpeaker);
router.delete('/:id', protect, authorize(Role.ORGANIZER, Role.ADMIN), deleteSpeaker);
router.post('/link', protect, authorize(Role.ORGANIZER, Role.ADMIN), linkSpeakerToEvent);
router.post('/unlink', protect, authorize(Role.ORGANIZER, Role.ADMIN), unlinkSpeakerFromEvent);

module.exports = router;