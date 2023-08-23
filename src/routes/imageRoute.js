const express = require("express");
const { getImage } = require("../controllers/imageController");

const router = express.Router();

router.route("/:fileName").get(getImage);

module.exports = router;
