const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ================= REGISTER =================
const register = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    console.log("Register request:", email, role);

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role,
    });

    console.log("User created:", user.email);

    res.status(201).json({ message: "User registered successfully" });

  } catch (error) {
    console.log("Register Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// ================= LOGIN =================
const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    console.log("Login attempt:", email, role);

    // Predefined Supplier Login
    if (
      email === "supplier@aquaflow.com" &&
      password === "supplier123" &&
      role === "supplier"
    ) {
      const token = jwt.sign(
        { id: "supplier_fixed_id", role: "supplier" },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.json({
        token,
        user: {
          id: "supplier_fixed_id",
          name: "Aqua Supplier",
          role: "supplier",
        },
      });
    }

    // Find user in database
    const user = await User.findOne({ email });

    console.log("User found:", user ? user.email : "No user");

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (user.role !== role) {
      return res.status(400).json({ message: "Invalid role selected" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    console.log("Password match:", isMatch);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
      },
    });

  } catch (error) {
    console.log("Login Error:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  register,
  login,
};