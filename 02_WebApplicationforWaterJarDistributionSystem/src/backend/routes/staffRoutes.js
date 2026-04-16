const express = require("express");
const router = express.Router();

const staffController = require("../controllers/staffController");
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User"); // ✅ ADD THIS

// Create
router.post("/create", staffController.createStaff);

// Get all
router.get("/all", staffController.getStaff);

// Delete
router.delete("/delete/:id", async (req, res) => {
  try {
    const staff = await User.findById(req.params.id);

    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: "Deleted successfully" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;