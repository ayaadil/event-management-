const Event = require('../models/eventModel');
const Category = require('../models/categoryModel');

// POST /events  (organizer only)
exports.createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      image_url,
      date_time,
      location,
      latitude,
      longitude,
      category_id,
      status,
    } = req.body;

    if (!title || !date_time) {
      return res.status(400).json({ message: 'title and date_time are required' });
    }

    if (category_id) {
      const categoryExists = await Category.findById(category_id);
      if (!categoryExists) {
        return res.status(400).json({ message: 'Invalid category' });
      }
    }

    const event = await Event.create({
      title,
      description,
      image_url,
      date_time,
      location,
      latitude,
      longitude,
      organizer_id: req.user.id,
      category_id,
      status,
    });

    return res.status(201).json(event);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to create event' });
  }
};

// GET /events  (supports filters via query params)
exports.getEvents = async (req, res) => {
  try {
    const { category, location, status, from, to, search, page = 1, limit = 10 } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    const { rows, total } = await Event.findAll({
      category,
      location,
      status,
      from,
      to,
      search,
      limit,
      offset,
    });

    return res.status(200).json({
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      events: rows,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch events' });
  }
};

// GET /events/:id
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    return res.status(200).json(event);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch event' });
  }
};

// PUT /events/:id  (organizer who owns the event, or admin)
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const isOwner = event.organizer_id === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    const {
      title,
      description,
      image_url,
      date_time,
      location,
      latitude,
      longitude,
      category_id,
      status,
    } = req.body;

    if (category_id) {
      const categoryExists = await Category.findById(category_id);
      if (!categoryExists) {
        return res.status(400).json({ message: 'Invalid category' });
      }
    }

    const updated = await Event.update(req.params.id, {
      title: title ?? event.title,
      description: description ?? event.description,
      image_url: image_url ?? event.image_url,
      date_time: date_time ?? event.date_time,
      location: location ?? event.location,
      latitude: latitude ?? event.latitude,
      longitude: longitude ?? event.longitude,
      category_id: category_id ?? event.category_id,
      status: status ?? event.status,
    });

    return res.status(200).json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to update event' });
  }
};

// DELETE /events/:id  (organizer who owns the event, or admin)
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const isOwner = event.organizer_id === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    await Event.remove(req.params.id);
    return res.status(200).json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to delete event' });
  }
};