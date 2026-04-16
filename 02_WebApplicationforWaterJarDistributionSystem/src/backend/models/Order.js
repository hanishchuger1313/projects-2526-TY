const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      required: true,
    },

    jars: {
      type: Number,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },

    deliveryDate: {
      type: Date,
    },

    startDate: {
      type: Date,
    },

    endDate: {
      type: Date,
    },

    frequency: {
      type: String,
    },

    pricePerJar: {
      type: Number,
      default: 20,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    // ✅ UPDATED STATUS FLOW
    status: {
      type: String,
      enum: ["Pending", "Awaiting Payment", "Confirmed", "Assigned", "Delivered", "Rejected"],
      default: "Pending",
    },

    // ✅ UPDATED PAYMENT STATUS
    paymentStatus: {
      type: String,
      enum: ["Pending", "Advance Paid", "Paid"],
      default: "Pending",
    },

    // ✅ NEW FIELDS
    advancePayment: {
      type: Number,
      default: 0,
    },

    remainingAmount: {
      type: Number,
      default: 0,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

 paymentHistory: [
  {
    amount: {
      type: Number
    },
    type: {
      type: String
    },
    date: {
      type: Date,
      default: Date.now
    }
  }
],


  },{ timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);