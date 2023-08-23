const express = require("express");
const cookieParser = require("cookie-parser");
const {
  login,
  register,
  getUsers,
  authenticateUser,
  getUserInfo,
  authenticateAdmin,
  updateVerifyUser,
  findUserByEmail,
  logout,
  changeValue,
} = require("../controllers/userController");
const {
  verifyRegistrationToken,
  sendRegistrationToken,
  createRegistrationToken,
} = require("../controllers/tokenController");

const router = express.Router();

router
  .route("/")
  .get(login)
  .post(register, sendRegistrationToken)
  .patch(authenticateUser, changeValue);
router
  .route("/token")
  .get(authenticateUser, getUserInfo)
  .delete(logout)
  .post(findUserByEmail, createRegistrationToken, sendRegistrationToken);
router.route("/admin").get(authenticateAdmin);
router.route("/token/:token").get(verifyRegistrationToken, updateVerifyUser);

// router.route("/test").get(sendRegistrationToken);
//for testing give as a view of all users
// router.route("/getusers").get(getUsers);

module.exports = router;
