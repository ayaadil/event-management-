const db = require("../config/db");
const BookingModel = require("../models/bookingModel");
const TicketTypeModel = require("../models/ticketTypeModel");
const EventModel = ("../models/eventModel");
const QRCode = require("qrcode");
const jwt = require("jsonwebtoken");
const Role = require('../constants/roles')

/**
 * booking a ticket
 * POST /bookings
 */
const createBooking = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    const { ticket_type_id, quantity } = req.body;

    if (!ticket_type_id || !quantity || quantity < 1) {
      connection.release();
      return res
        .status(400)
        .json({ message: "Please specify the ticket type and quantity" });
    }

    await connection.beginTransaction();

    // lock the ticket type row to prevent race conditions
    const [rows] = await connection.query(
      "SELECT * FROM ticket_types WHERE id = ? FOR UPDATE",
      [ticket_type_id]
    );

    if (rows.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({ message: "Ticket type not found" });
    }

    const ticketType = rows[0];

    if (ticketType.available_tickets < quantity) {
      await connection.rollback();
      connection.release();
      return res
        .status(409)
        .json({ message: "Not enough tickets available" });
    }

    // reducing the available tickets in the ticket_types table
    await connection.query(
      "UPDATE ticket_types SET available_tickets = available_tickets - ? WHERE id = ?",
      [quantity, ticket_type_id]
    );

    const total_price = Number(ticketType.price) * Number(quantity);

    // creating the booking within the same transaction
    const bookingId = await BookingModel.create(
      {
        user_id: req.user.id,
        event_id: ticketType.event_id,
        ticket_type_id,
        quantity,
        total_price,
        status: "pending",
      },
      connection
    );

    await connection.commit();

    const booking = await BookingModel.findById(bookingId, connection);
    connection.release();

    return res
      .status(201)
      .json({ message: "Booking created successfully,Awaiting payment", booking });
  } catch (err) {
    try {
      await connection.rollback();
    } catch (_) {}
    connection.release();
    next(err);
  }
};

/**
 * retrieve bookings for the current user
 * GET /bookings/me
 */
const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await BookingModel.findByUserId(req.user.id);
    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

/**
 * retrieve all bookings (admin only)
 * GET /bookings
 */
const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await BookingModel.findAll();
    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

/**
 * cancel a booking (returns the quantity to inventory)
 * PUT /bookings/:id/cancel
 */
const cancelBooking = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const booking = await BookingModel.findById(req.params.id, connection);

    if (!booking) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({ message: "Booking not found" });
    }

    if (
      Number(booking.user_id) !== Number(req.user.id) &&
      req.user.role !== Role.ADMIN
    ) {
      await connection.rollback();
      connection.release();
      return res
        .status(403)
        .json({ message: "You are not allowed to perform this action" });
    }

    if (booking.status === "cancelled") {
      await connection.rollback();
      connection.release();
      return res.status(400).json({ message: "Booking is already cancelled" });
    }

    await BookingModel.updateStatus(booking.id, "cancelled", connection);

    // returning the quantity to inventory
    await connection.query(
      "UPDATE ticket_types SET available_tickets = available_tickets + ? WHERE id = ?",
      [booking.quantity, booking.ticket_type_id]
    );

    await connection.commit();
    connection.release();

    res.json({ message: "Booking cancelled successfully" });
  } catch (err) {
    try {
      await connection.rollback();
    } catch (_) {}
    connection.release();
    next(err);
  }
};

 /**
  * QR code
  * GET /bookings/:id/qrcode
  */

const getBookingQRCode = async (req, res, next) => {
  try {
    const booking = await BookingModel.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    const event = await EventModel.findById(booking.event_id);
    const isOwner = Number(booking.user_id) === Number(req.user.id);
    const isAdmin = req.user.role === Role.ADMIN;
    const isOrganizer = event && Number(event.isOrganizer_id) === Number(req.user.id);

    if(!isOwner && !isAdmin && !isOrganizer){
      return res.status(403).json({message: 'You are not alowed to preform this action'});
    }
    if (booking.status !== 'confirmed') {
      return res.status(400).json({message: 'QR code can only by issues for confirmed bookings'});
    }

    const ticketToken = jwt.sign({ booking_id: booking.id, type:'ticket' },
       process.env.JWT_SECRET, { expiresIn: '10d' }
    );
    const qrImage = await QRCode.toDataURL(ticketToken);
    res.json({ qrCode: qrImage });
  } catch (err) {
    next(err);
  }
};

/**
 * Ticket verification and attendance registartion (for staff/admin only)
 * POST /booking/verify
 */

const verifyTicket = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: "invalid or tampered with ticket" });
    }

    const booking = await BookingModel.findById(decoded.booking_id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    
    const event = await EventModel.findById(booking.event_id);
    const isAdmin = req.user.role === Role.ADMIN;
    const isOrganizer = event && Number(event.isOrganizer_id) === Number(req.user.id);

    if(!isAdmin && !isOrganizer){
      return res.status(403).json({message: 'You are not alowed to preform this action'});
    }
    if (booking.status !== "confirmed") {
      return res.status(400).json({ message: "Reservation not confirmed" });
    }
    if (booking.checked_in_at) {
      return res.status(409).json({
        message: "this ticket has already been used",
        checked_in_at: booking.checked_in_at,
      });
    }

    const success = await BookingModel.markCheckedIn(booking.id);
    if (!success) {
      return res.status(409).json({ message: "this ticket has already been used" });
    }

    res.json({ message: "Check-in successful", booking_id: booking.id });
  } catch (err) {
    next(err);
  }
};
module.exports = {
  createBooking,
  getMyBookings,
  getAllBookings,
  cancelBooking,
  getBookingQRCode,
  verifyTicket,
};