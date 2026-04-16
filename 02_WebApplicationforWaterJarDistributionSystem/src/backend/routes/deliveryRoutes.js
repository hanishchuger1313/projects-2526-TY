const express = require("express");
const router = express.Router();

const deliveryController = require("../controllers/deliveryController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/dashboard",
authMiddleware,
deliveryController.getDashboardStats
);

router.get("/today",
authMiddleware,
deliveryController.getTodaysDeliveries
);

router.put("/deliver/:id",
authMiddleware,
deliveryController.markDelivered
);

router.put("/collect/:id",
authMiddleware,
deliveryController.collectEmptyJars
);

module.exports = router;