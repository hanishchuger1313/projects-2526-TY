const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const authMiddleware = require("../middleware/authMiddleware");

/* ===== TOTAL PAYMENT REPORT ===== */
router.get("/total", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find();

    let totalRevenue = 0;

    orders.forEach(order => {
      if (order.paymentHistory && order.paymentHistory.length > 0) {
        order.paymentHistory.forEach(payment => {
          totalRevenue += payment.amount;
        });
      }
    });

    res.json({ totalRevenue });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


/* ===== DATE-WISE REPORT ===== */
router.get("/by-date", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find();

    let report = {};

    orders.forEach(order => {
      if (order.paymentHistory && order.paymentHistory.length > 0) {

        order.paymentHistory.forEach(payment => {

          const date = new Date(payment.date).toLocaleDateString();

          if (!report[date]) {
            report[date] = 0;
          }

          report[date] += payment.amount;

        });
      }
    });

    res.json(report);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;