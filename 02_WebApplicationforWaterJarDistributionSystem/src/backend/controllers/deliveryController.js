const Order = require("../models/Order");

/* DASHBOARD STATS */

exports.getDashboardStats = async(req,res)=>{
try{

const staffId = req.user.id;

const total = await Order.countDocuments({
$or:[
{assignedTo:staffId},
{regularDeliveryStaff:staffId}
]
});

const delivered = await Order.countDocuments({
$or:[
{assignedTo:staffId},
{regularDeliveryStaff:staffId}
],
status:"Delivered"
});

const pending = total - delivered;

res.json({
total,
delivered,
pending
});

}catch(err){
res.status(500).json({error:err.message});
}
};



/* TODAY DELIVERIES */

exports.getTodaysDeliveries = async (req,res)=>{
try{

const staffId = req.user.id;

const orders = await Order.find({

$or:[

{ assignedTo: staffId },

{ regularDeliveryStaff: staffId }

]

})
.populate("user","name")
.sort({createdAt:-1});   // latest first

res.json(orders);

}catch(err){

console.log(err);
res.status(500).json({error:err.message});

}
};
/* MARK DELIVERED */

exports.markDelivered = async(req,res)=>{
try{

const order = await Order.findById(req.params.id);

order.status = "Delivered";

/* empty jars will be collected next day */
order.pendingEmptyJars = order.jars;

await order.save();

res.json({message:"Delivered"});

}catch(err){
res.status(500).json({error:err.message});
}
};



/* COLLECT EMPTY JARS */

exports.collectEmptyJars = async(req,res)=>{
try{

const {collected} = req.body;

const order = await Order.findById(req.params.id);

order.returnedJars += collected;
order.pendingEmptyJars -= collected;

if(order.pendingEmptyJars < 0){
order.pendingEmptyJars = 0;
}

await order.save();

res.json(order);

}catch(err){
res.status(500).json({error:err.message});
}
};