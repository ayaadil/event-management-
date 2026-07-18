const SpeakerModel = require('../models/speakerModel');
const EventModel = require('../models/eventModel');
const getSpeakers = async (req, res, next) => {
  try {
    const speakers = await SpeakerModel.findAll();
    res.json(speakers);
  } catch (err) {
    next(err);
  }
};

const createSpeaker = async (req, res, next) => {
  try {
    const { name, role, company, image_url } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'The speaker name is required' });
    }
    const id = await SpeakerModel.create({ name, role, company, image_url });
    res.status(201).json({ message: 'The speaker has been created', id });
  } catch (err) {
    next(err);
  }
};

const linkSpeakerToEvent = async (req, res, next) => {
  try {
    const { event_id, speaker_id } = req.body;
    const event = await EventModel.findById(event_id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    const speaker = await SpeakerModel.findById(speaker_id);
    if (!speaker) {
      return res.status(404).json({ message: 'Speaker not found' });
    }
    await SpeakerModel.linkToEvent(event_id, speaker_id);
    res.status(201).json({ message: 'The speaker has been linked to the event' });
  } catch (err) {
    next(err);
  }
};

const getSpeakersByEvent = async (req, res, next) => {
  try {
    const speakers = await SpeakerModel.findByEventId(req.params.eventId);
    res.json(speakers);
  } catch (err) {
    next(err);
  }
};

module.exports = { getSpeakers, createSpeaker, linkSpeakerToEvent, getSpeakersByEvent };
