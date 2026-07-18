const SavedEventModel = require('../models/savedEventModel');
const EventModel = require('../models/eventModel');

const saveEvent = async (req, res, next) => {
  try {
    const event = await EventModel.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    await SavedEventModel.add(req.user.id, req.params.eventId);
    res.status(201).json({ message: 'Event saved successfully' });
  } catch (err) {
    next(err);
  }
};

const unsaveEvent = async (req, res, next) => {
  try {
    await SavedEventModel.remove(req.user.id, req.params.eventId);
    res.json({ message: 'Event unsaved successfully' });
  } catch (err) {
    next(err);
  }
};

const getMySavedEvents = async (req, res, next) => {
  try {
    const events = await SavedEventModel.findByUserId(req.user.id);
    res.json(events);
  } catch (err) {
    next(err);
  }
};

module.exports = { saveEvent, unsaveEvent, getMySavedEvents };
