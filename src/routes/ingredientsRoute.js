const express = require("express");
const { getIngredients } = require("../controllers/ingredientsController");

const router = express.Router();

router.get("/", getIngredients);

module.exports = router;
