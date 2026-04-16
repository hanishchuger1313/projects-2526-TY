const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const staffRoutes = require("./routes/staffRoutes");
const reportRoutes = require("./routes/reportRoutes");

require("dotenv").config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Simple test route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Error:", err));

// Routes (you can add real routes later)
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/customers", require("./routes/customerRoutes"));
app.use("/api/assignments", require("./routes/assignmentRoutes"));
app.use("/api/delivery", require("./routes/deliveryRoutes"));
app.use("/api/staff", staffRoutes);
app.use("/api/reports", reportRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);


const jarRoutes = require("./routes/jarRoutes");

app.use("/api", jarRoutes);
});