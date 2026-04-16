const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI);

const seedDeliveryStaff = async () => {
  await User.deleteMany({ role: "delivery" });

  const password = await bcrypt.hash("delivery123", 10);

  const staff = [
    { name: "Mike Wilson", email: "mike@aquaflow.com", phone: "555-0201" },
    { name: "Tom Davis", email: "tom@aquaflow.com", phone: "555-0202" },
    { name: "James Miller", email: "james@aquaflow.com", phone: "555-0203" },
    { name: "Robert Taylor", email: "robert@aquaflow.com", phone: "555-0204" },
    { name: "Daniel Brown", email: "daniel@aquaflow.com", phone: "555-0205" }
  ];

  for (let member of staff) {
    await User.create({
      ...member,
      password,
      role: "delivery"
    });
  }

  console.log("Delivery staff seeded!");
  process.exit();
};

seedDeliveryStaff();