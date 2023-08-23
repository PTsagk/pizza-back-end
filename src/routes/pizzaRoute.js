const express = require("express");
const { linkIngredients } = require("../controllers/ingredientsController");
const {
  getPizzas,
  createPizza,
  deletePizza,
} = require("../controllers/pizzaController");
const { storeImage, deleteImage } = require("../controllers/imageController");
const router = express.Router();

router
  .route("/")
  .get(getPizzas)
  .post(createPizza, linkIngredients, storeImage)
  .delete(deleteImage, deletePizza);

module.exports = router;
