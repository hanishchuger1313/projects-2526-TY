const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const authMiddleware = require("../middleware/authMiddleware");
const orderController = require("../controllers/orderController");
const DeliveryStaff = require("../models/DeliveryStaff");

// ✅ CREATE ORDER (FIXED - using controller)
router.post("/create", authMiddleware, orderController.createOrder);


// ✅ GET all orders (Supplier)
router.get("/all", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ✅ UPDATE ORDER STATUS (WITH ADVANCE PAYMENT FLOW)
router.put("/update-status/:id", authMiddleware, async (req, res) => {
  try {
    let { status } = req.body;

    // 🔥 IMPORTANT: Confirm → Awaiting Payment
    if (status === "Confirmed") {
      status = "Awaiting Payment";
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ✅ GET MY ORDERS (Customer)
router.get("/my-orders", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ✅ PAY ADVANCE
router.put("/pay-advance/:id", authMiddleware, async (req, res) => {
  try {
    console.log("Pay advance API called");

    const { amount } = req.body;

    // ✅ FIRST get order
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // ✅ NOW you can use order safely
    console.log("paymentHistory:", order.paymentHistory);

    // ✅ Safe assignment (BEST METHOD)
    order.paymentHistory = [
      ...(order.paymentHistory || []),
      {
        amount: amount,
        type: "Advance",
      },
    ];

    order.advancePayment = amount;
    order.remainingAmount = order.totalAmount - amount;

    order.paymentStatus = "Advance Paid";
    order.status = "Confirmed";

    await order.save();

    console.log("Payment saved successfully");

    res.json(order);

  } catch (error) {
    console.log("PAYMENT ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ ASSIGN ORDER TO STAFF
router.put("/assign/:id", authMiddleware, async (req, res) => {
  try {
    const { staffId } = req.body;

    const order = await Order.findById(req.params.id);
    const staff = await DeliveryStaff.findById(staffId);

    if (!order || !staff) {
      return res.status(404).json({ message: "Order or staff not found" });
    }

    // ❗ Prevent double assignment
    if (order.assignedTo) {
      return res.status(400).json({ message: "Order already assigned" });
    }

    // ❗ Capacity check
    if (staff.currentLoad + order.jars > staff.maxCapacity) {
      return res.status(400).json({
        message: "Staff does not have enough capacity"
      });
    }

    // ✅ Assign
    order.assignedTo = staffId;
    order.status = "Assigned";

    // ✅ Update load
    staff.currentLoad += order.jars;

    await order.save();
    await staff.save();

    res.json({ message: "Order assigned successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ MARK AS DELIVERED
router.put("/mark-delivered/:id", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const staff = await DeliveryStaff.findById(order.assignedTo);

    order.status = "Delivered";

    // ✅ Reduce load
    if (staff) {
      staff.currentLoad -= order.jars;

      if (staff.currentLoad < 0) {
        staff.currentLoad = 0;
      }

      await staff.save();
    }

    await order.save();

    res.json({ message: "Order delivered successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ PAY REMAINING AMOUNT
router.post("/pay-remaining/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.remainingAmount <= 0) {
      return res.status(400).json({ message: "No remaining payment" });
    }

    // Add payment
    order.paymentHistory.push({
      amount: order.remainingAmount,
      type: "Remaining",
      date: new Date()
    });

    order.paymentStatus = "Paid";
    order.remainingAmount = 0;

    await order.save();

    res.json({ message: "Remaining payment completed" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ FINAL PAYMENT COLLECTION (AFTER DELIVERY)
router.put("/payment/:id", authMiddleware, orderController.updatePaymentStatus);


module.exports = router;