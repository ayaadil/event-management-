const express = require('express');
const router = express.Router();
const Role = require('../constants/roles');
const {
  createTicketType,
  getTicketTypesByEvent,
  updateTicketType,
  deleteTicketType,
} = require('../controllers/ticketTypeController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/event/:eventId', getTicketTypesByEvent);
router.post('/', protect, authorize(Role.ORGANIZER, Role.ADMIN), createTicketType);
router.put('/:id', protect, authorize(Role.ORGANIZER, Role.ADMIN), updateTicketType);
router.delete('/:id', protect, authorize(Role.ORGANIZER, Role.ADMIN), deleteTicketType);

module.exports = router;
