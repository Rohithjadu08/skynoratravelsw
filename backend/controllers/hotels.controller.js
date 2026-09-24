const express = require("express");
const HotelService = require("../services/hotelService");
const router = express.Router();

const catalogueLabel = () => ({
  dataType: "estimated",
  source: "SkyNora internal hotel catalogue",
  retrievedAt: new Date().toISOString(),
});

router.get("/", async (req, res) => {
  try {
    const hotels = await HotelService.getAllHotels();
    res.status(200).json({
      success: true,
      data: hotels.map((hotel) => ({ ...hotel, label: catalogueLabel() })),
      label: catalogueLabel(),
      warning: "Catalogue results are not live availability. Use /ai/chat for provider-backed searches.",
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const hotel = await HotelService.getHotelById(req.params.id);
    if (!hotel) {
      return res.status(404).json({ success: false, message: "Hotel not found" });
    }
    res.status(200).json({
      success: true,
      data: { ...hotel, label: catalogueLabel() },
      label: catalogueLabel(),
      warning: "Catalogue results are not live availability. Use /ai/chat for provider-backed searches.",
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

module.exports = router;
