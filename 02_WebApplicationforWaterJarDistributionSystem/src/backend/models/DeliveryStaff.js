const mongoose = require("mongoose");

const deliveryStaffSchema = new mongoose.Schema({
name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },

  maxCapacity: {
    type: Number,
    default: 20
  },

  currentLoad: {
    type: Number,
    default: 0
  }

});

module.exports = mongoose.model("DeliveryStaff", deliveryStaffSchema);