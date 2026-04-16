const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

// Get all customers (example API)
router.get("/all", authMiddleware, async (req, res) => {
  try {
    const customers = await User.find({ role: "customer" }).select("-password");
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



module.exports = router;