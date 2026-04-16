const bcrypt = require("bcryptjs");
const User = require("../models/User");

/* ===== CREATE STAFF ===== */
exports.createStaff = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    // check duplicate
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newStaff = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      role: "delivery"   // ✅ IMPORTANT
    });

    await newStaff.save();

    res.json({ message: "Staff created successfully" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};


/* ===== GET STAFF ===== */
exports.getStaff = async (req, res) => {
  try {
    const staff = await User.find({ role: "delivery" }).select("-password");
    res.json(staff);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};