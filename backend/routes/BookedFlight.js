const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const BookingService = require("../services/bookingService");
const authMiddleware = require("../middleware/authMiddleware");

const sendResponse = (res, statusCode, message, data = null) => {
  res.status(statusCode).json({ success: statusCode < 400, message, data, status: statusCode });
};

router.get("/flights", authMiddleware, async (req, res) => {
  try {
    const bookings = await BookingService.getUserFlightBookings(req.user.id);
    sendResponse(res, 200, "Bookings fetched successfully", { bookings });
  } catch (error) {
    sendResponse(res, 500, "Internal Server Error");
  }
});

router.get("/flights/:bookingId", authMiddleware, async (req, res) => {
  try {
    const booking = await BookingService.getFlightBookingById(req.user.id, req.params.bookingId);
    if (!booking) {
      return sendResponse(res, 404, "Booking not found");
    }
    sendResponse(res, 200, "Booking fetched successfully", { booking });
  } catch (error) {
    sendResponse(res, 500, "Internal Server Error");
  }
});

router.post(
  "/flights",
  authMiddleware,
  [
    body("name").notEmpty(),
    body("departure_time").notEmpty(),
    body("arrival_time").notEmpty(),
    body("fare").isNumeric(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendResponse(res, 400, errors.array()[0].msg);
    }
    try {
      const booking = await BookingService.createFlightBooking(req.user.id, req.body);
      sendResponse(res, 201, "Booking created successfully", { booking });
    } catch (error) {
      sendResponse(res, 500, "Internal Server Error");
    }
  }
);

router.post("/flight/hold-seat", authMiddleware, async (req, res) => {
  try {
    const { flightId, travelDate, seatNumber } = req.body;
    if (!flightId || !travelDate || !seatNumber) {
      return sendResponse(res, 400, "flightId, travelDate, and seatNumber are required");
    }

    const seat = await BookingService.holdSeat(req.user.id, flightId, travelDate, seatNumber);
    sendResponse(res, 200, "Seat held successfully", { seat });
  } catch (error) {
    const statusCode = error.message.includes("not found")
      ? 404
      : error.message.includes("held") || error.message.includes("booked")
      ? 409
      : 500;
    sendResponse(res, statusCode, error.message || "Internal Server Error");
  }
});

router.post("/flight/confirm", authMiddleware, async (req, res) => {
  try {
    const { flightId, travelDate, seatNumber, fare } = req.body;
    if (!flightId || !travelDate || !seatNumber) {
      return sendResponse(res, 400, "flightId, travelDate, and seatNumber are required");
    }

    const result = await BookingService.confirmFlightBooking(req.user.id, flightId, travelDate, seatNumber, fare);
    sendResponse(res, 201, "Booking confirmed successfully", { booking: result.booking, seat: result.seat });
  } catch (error) {
    const statusCode = error.message.includes("not found")
      ? 404
      : error.message.includes("expired") || error.message.includes("held")
      ? 409
      : 500;
    sendResponse(res, statusCode, error.message || "Internal Server Error");
  }
});

router.delete("/flights/:bookingId", authMiddleware, async (req, res) => {
  try {
    const booking = await BookingService.cancelFlightBooking(req.user.id, req.params.bookingId);
    if (!booking) {
      return sendResponse(res, 404, "Booking not found");
    }
    sendResponse(res, 200, "Booking cancelled successfully", { booking });
  } catch (error) {
    sendResponse(res, 500, "Internal Server Error");
  }
});

module.exports = router;
