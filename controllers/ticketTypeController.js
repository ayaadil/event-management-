const TicketTypeModel = require('../models/ticketTypeModel');
const EventModel = require('../models/eventModel');
const Role = require('../constants/roles');

// create a new ticket type (for admin or event organizer)
const createTicketType = async (req, res, next) => {
  try {
    const { event_id, ticket_name, price, capacity } = req.body;

    if (!event_id || !ticket_name || price == null || !capacity) {
      return res.status(400).json({ message: 'Please fill in all fields' });
    }

    const event = await EventModel.findById(event_id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    if (Number(event.organizer_id) !== Number(req.user.id) && req.user.role !== Role.ADMIN) {
      return res.status(403).json({ message: 'You are not allowed to perform this action' });
    }

    const id = await TicketTypeModel.create({ event_id, ticket_name, price, capacity });
    const ticketType = await TicketTypeModel.findById(id);
    res.status(201).json({ message: 'Ticket type created successfully', ticketType });
  } catch (err) {
    next(err);
  }
};

const getTicketTypesByEvent = async (req, res, next) => {
  try {
    const ticketTypes = await TicketTypeModel.findByEventId(req.params.eventId);
    res.json(ticketTypes);
  } catch (err) {
    next(err);
  }
};

const updateTicketType = async (req, res, next) => {
  try {
    const existingTicketType = await TicketTypeModel.findById(req.params.id);

    if (!existingTicketType) {
      return res.status(404).json({
        message: "Ticket type not found",
      });
    }

    const event = await EventModel.findById(existingTicketType.event_id);

    if (!event) {
      return res.status(404).json({
        message: "Parent event not found",
      });
    }

    if (
      Number(event.organizer_id) !== Number(req.user.id) &&
      req.user.role !== Role.ADMIN
    ) {
      return res.status(403).json({
        message: "You are not allowed to perform this action",
      });
    }

    // البيانات الجديدة
    const updatedFields = { ...req.body };

    // إذا تغيرت السعة وكانت أقل من available_tickets
    // نجعل available_tickets تساوي السعة الجديدة حتى لا يفشل الـ CHECK Constraint
    if (updatedFields.capacity !== undefined) {
      updatedFields.capacity = Number(updatedFields.capacity);

      if (
        existingTicketType.available_tickets >
        updatedFields.capacity
      ) {
        updatedFields.available_tickets =
          updatedFields.capacity;
      }
    }

    await TicketTypeModel.update(req.params.id, updatedFields);

    const ticketType = await TicketTypeModel.findById(req.params.id);

    res.json({
      message: "Ticket type updated successfully",
      ticketType,
    });
  } catch (err) {
    next(err);
  }
}
const deleteTicketType = async (req, res, next) => {
  try {
    const existingTicketType = await TicketTypeModel.findById(req.params.id);
    if (!existingTicketType) {
      return res.status(404).json({ message: 'Ticket type not found' });
    }
    const event = await EventModel.findById(existingTicketType.event_id);
    if (!event) {
      return res.status(404).json({ message: 'Parent event not found' });
    }
    if (Number(event.organizer_id) !== Number(req.user.id) && req.user.role !== Role.ADMIN) {
      return res.status(403).json({ message: 'You are not allowed to perform this action' });
    }
    await TicketTypeModel.delete(req.params.id);
    res.json({ message: 'Ticket type deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createTicketType,
  getTicketTypesByEvent,
  updateTicketType,
  deleteTicketType,
};
