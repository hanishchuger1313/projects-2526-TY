const mongoose = require("mongoose");

const deliveryBoySchema = new mongoose.Schema({
  name: String,
  phone: String,
  assignedJars: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model("DeliveryBoy", deliveryBoySchema);