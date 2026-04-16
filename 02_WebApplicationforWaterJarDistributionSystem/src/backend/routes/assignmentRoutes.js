const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

// Get all delivery staff
router.get("/staff", authMiddleware, async (req, res) => {
  try {
    const staff = await User.find({ role: "delivery" }).select("-password");
    res.json(staff);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get unassigned orders
router.get("/unassigned", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({
      status: "Confirmed",
      assignedTo: null,
    })
      .populate("user", "name")
      .populate("assignedTo", "name");

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get assigned orders
router.get("/assigned", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({
      assignedTo: { $ne: null },
    })
      .populate("user", "name")
      .populate("assignedTo", "name");

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Assign order
router.put("/assign/:id", authMiddleware, async (req, res) => {
  try {
    const { staffId } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { assignedTo: staffId, status: "Pending Delivery" },
      { new: true }
    );

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;