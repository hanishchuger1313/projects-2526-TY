const Order = require("../models/Order");

// Create Order
exports.createOrder = async (req, res) => {
  try {
    console.log("API HIT"); // 👈 ADD THIS

    const pricePerJar = 20;
    const totalAmount = req.body.jars * pricePerJar;

    console.log("Before DB save"); // 👈 ADD

    const order = await Order.create({
      ...req.body,
      user: req.user.id,
      pricePerJar,
      totalAmount,
      status: "Pending",
    });

    console.log("After DB save"); // 👈 ADD

    res.status(201).json(order);

  } catch (error) {
    console.log("ERROR:", error); // 👈 ADD
    res.status(500).json({ error: error.message });
  }
};


// Get My Orders
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.updatePaymentStatus = async (req, res) => {
  try {

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.paymentStatus = "Collected";

    await order.save();

    res.json(order);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};