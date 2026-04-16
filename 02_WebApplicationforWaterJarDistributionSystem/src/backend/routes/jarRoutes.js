const express = require("express");
const router = express.Router();
const DeliveryBoy = require("../models/DeliveryBoy");


// delivery boys list (supplier ला jars count दिसण्यासाठी)
router.get("/delivery-boys", async (req, res) => {

  const boys = await DeliveryBoy.find();

  res.json(boys);

});


// jar assign API
router.post("/assign-jar", async (req, res) => {

 const { deliveryBoyId, jars } = req.body;

 const deliveryBoy = await DeliveryBoy.findById(deliveryBoyId);

 if(deliveryBoy.assignedJars >= 5){

   const anotherBoy = await DeliveryBoy.findOne({
     assignedJars: { $lt: 5 }
   });

   anotherBoy.assignedJars += jars;
   await anotherBoy.save();

   return res.json({
     message: "Jar reassigned to another delivery boy"
   });

 }

 deliveryBoy.assignedJars += jars;
 await deliveryBoy.save();

 res.json({
   message: "Jar assigned successfully"
 });

});

module.exports = router;