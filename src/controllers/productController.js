const pool = require("../mysqlPool");
const bcrypt = require("bcryptjs");

const getProductByType = async (req, res) => {
  try {
    const { type } = req.body;
    if (type === "Pizza") {
      pool.getConnection((conn_err, conn) => {
        if (conn_err) return res.status(500).send("Internal error");
        conn.query(`SELECT id, name FROM Pizzas`, (q_err, q_res) => {
          conn.release();
          if (q_err) return res.status(400).send("Bad request");
          if (q_res) return res.status(200).json(q_res);
        });
      });
    } else {
      pool.getConnection((conn_err, conn) => {
        if (conn_err) return res.status(500).send("Internal error");
        conn.query(`SELECT id, name FROM Others `, (q_err, q_res) => {
          conn.release();
          if (q_err) return res.status(400).send("Bad request");
          if (q_res) return res.status(200).json(q_res);
        });
      });
    }
  } catch (error) {
    res.status(500).send("Server error");
  }
};

const createProduct = async (req, res, next) => {
  try {
    const { name, price, type, description } = req.body;
    const { file } = req.files;

    const salt = await bcrypt.genSalt(5);
    let fileName = await bcrypt.hash(file.name, salt);
    console.log(fileName);
    fileName = fileName
      .split("")
      .map((c) => {
        if (/[\.\/\\]/.test(c)) return "_";
        return c;
      })
      .join("");
    fileName += `.${file.mimetype.split("/")[1]}`;
    console.log(fileName);
    pool.getConnection((conn_err, conn) => {
      if (conn_err) return res.status(500).send("Internal error");

      conn.query(
        `INSERT INTO Others (id,name,image,price,description,type) VALUES (NULL,"${name}","${fileName}","${price}","${description}","${type}");`,
        (q_err, q_res) => {
          conn.release();
          console.log(q_err);
          if (q_err) return res.status(400).send("Bad Request");
          req.fileName = fileName;
          next();
        }
      );
    });
  } catch (error) {
    res.status(500).send("Server error");
  }
};

module.exports = { createProduct, getProductByType };
