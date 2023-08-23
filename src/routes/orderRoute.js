const express = require("express");
const {
  createOrder,
  createOrderItem,
  getPastOrders,
} = require("../controllers/orderController");
const router = express.Router();
const pool = require("../mysqlPool");
router.route("/").post(createOrder, createOrderItem);
router.route("/").get(getPastOrders);

module.exports = router;
