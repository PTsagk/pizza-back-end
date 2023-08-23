const express = require("express");
const pool = require("../mysqlPool");
const bcrypt = require("bcryptjs");
const {
  createProduct,
  getProductByType,
} = require("../controllers/productController");
const { storeImage, deleteImage } = require("../controllers/imageController");

const router = express.Router();

router
  .route("/")
  .post(createProduct, storeImage)
  .delete(deleteImage, async (req, res) => {
    try {
      const { id } = req.body;
      pool.getConnection((conn_err, conn) => {
        if (conn_err) return res.status(500).send("Internal error");
        conn.query(`DELETE FROM Products WHERE id="${id}"`, (q_err, q_res) => {
          conn.release();
          if (q_err) return res.status(400).send("Bad request");
          return res.sendStatus(200);
        });
      });
    } catch (error) {
      res.status(500).send("Server error");
    }
  });
router.route("/type").post(getProductByType);

module.exports = router;
