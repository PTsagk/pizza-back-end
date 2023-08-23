const {
  getAddressInfo,
  createAddress,
  deleteAddress,
  updateAddress,
} = require("../controllers/addressController");

const express = require("express");
const { authenticateUser } = require("../controllers/userController");
const router = express.Router();

router
  .route("/")
  .get(authenticateUser, getAddressInfo)
  .post(authenticateUser, createAddress)
  .patch(authenticateUser, updateAddress)
  .delete(authenticateUser, deleteAddress);

module.exports = router;
