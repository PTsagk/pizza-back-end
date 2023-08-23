const pool = require("../mysqlPool");
const bcrypt = require("bcryptjs");

const getPizzas = async (req, res) => {
  pool.getConnection((err, conn) => {
    conn.query("SELECT * FROM Pizzas ", (error, response) => {
      conn.release();
      if (error) return res.send("Error");
      else return res.send(response);
    });
  });
};

const createPizza = async (req, res, next) => {
  try {
    const { name, price, description, category } = req.body;
    const { files } = req;
    let sampleFile = files.file;

    const salt = await bcrypt.genSalt(5);
    let fileName = await bcrypt.hash(sampleFile.name, salt);
    fileName = fileName
      .split("")
      .map((c) => {
        if (/[\.\/\\]/.test(c)) return "_";
        return c;
      })
      .join("");
    fileName += `.${sampleFile.mimetype.split("/")[1]}`;
    // console.log(image);
    // return res.send("Good shit");
    pool.getConnection((pool_err, conn) => {
      if (pool_err) return res.status(500).send("Service Unavailable");
      if (conn) {
        conn.query(
          `INSERT INTO Pizzas VALUES (NULL,"${name}","${price}","${fileName}","${description}","${category}")`,
          (query_error, query_response) => {
            conn.release();
            if (query_error) return res.status(404).send("Bad Request");
            if (query_response) {
              req.pizzaId = query_response.insertId;
              req.fileName = fileName;
              next();
            }
          }
        );
      }
    });
  } catch (error) {
    res.status(500).send("Server error");
  }
};

const deletePizza = async (req, res) => {
  try {
    const { id } = req.body;
    pool.getConnection((conn_err, conn) => {
      if (conn_err) return res.status(500).send("Service Unavailable");
      conn.query(
        `DELETE FROM Pizzas WHERE id="${id}"`,
        (query_err, query_res) => {
          conn.release();
          if (query_err) return res.status(404).send("Not Found");
          if (query_res) return res.status(200).send("Deleted Successfully");
        }
      );
    });
  } catch (error) {
    res.status(500).send("Server error");
  }
};

module.exports = { getPizzas, createPizza, deletePizza };
