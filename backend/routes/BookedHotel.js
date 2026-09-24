const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const BookingService = require("../services/bookingService");
const authMiddleware = require("../middleware/authMiddleware");

const sendResponse = (res, statusCode, message, data = null) => {
  res.status(statusCode).json({ success: statusCode < 400, message, data, status: statusCode });
};

router.get("/hotels", authMiddleware, async (req, res) => {
  try {
    const bookings = await BookingService.getUserHotelBookings(req.user.id);
    sendResponse(res, 200, "Hotel bookings fetched successfully", { bookings });
  } catch (error) {
    sendResponse(res, 500, "Internal Server Error");
  }
});

router.get("/hotels/:bookingId", authMiddleware, async (req, res) => {
  try {
    const booking = await BookingService.getHotelBookingById(req.user.id, req.params.bookingId);
    if (!booking) {
      return sendResponse(res, 404, "Booking not found");
    }
    sendResponse(res, 200, "Booking fetched successfully", { booking });
  } catch (error) {
    sendResponse(res, 500, "Internal Server Error");
  }
});

router.post(
  "/hotels",
  authMiddleware,
  [body("name").notEmpty(), body("price").isNumeric(), body("location").notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendResponse(res, 400, errors.array()[0].msg);
    }
    try {
      const booking = await BookingService.createHotelBooking(req.user.id, req.body);
      sendResponse(res, 201, "Hotel booked successfully", { booking });
    } catch (error) {
      sendResponse(res, 500, "Internal Server Error");
    }
  }
);

router.delete("/hotels/:bookingId", authMiddleware, async (req, res) => {
  try {
    const success = await BookingService.cancelHotelBooking(req.user.id, req.params.bookingId);
    if (!success) {
      return sendResponse(res, 404, "Booking not found");
    }
    sendResponse(res, 200, "Booking cancelled successfully");
  } catch (error) {
    sendResponse(res, 500, "Internal Server Error");
  }
});

module.exports = router;
