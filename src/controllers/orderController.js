const pool = require("../mysqlPool");

const createOrderItem = async (req, res) => {
  try {
    const { cartItems } = req.body;
    const order_id = req.orderId;
    pool.getConnection((conn_err, conn) => {
      if (conn_err) return res.status(500).send("Internal error");
      const VALUES = cartItems.map((item) => {
        return `(NULL,"${order_id}","${item.id}","${item.count}","${
          item.isPizza ? "Pizza" : "Other"
        }")`;
      });
      conn.query(
        `INSERT INTO Items
      VALUES ${VALUES.join(",")}`,
        (q_err, q_res) => {
          conn.release();
          if (q_err) {
            console.log(q_err);
            return res.status(400).send("Bad request");
          }
          return res.status(200).send("Order successfully created!");
        }
      );
    });
  } catch (error) {
    res.status(500).send("Server error");
  }
};

const createOrder = async (req, res, next) => {
  try {
    const { doorbell, phone, floor, comments, payment, address, cartItems } =
      req.body;
    const DateNow = new Date(Date.now())
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");
    pool.getConnection((conn_err, conn) => {
      if (conn_err) return res.status(500).send("Internal error");
      conn.query(
        `INSERT INTO \`Orders\` 
        VALUES (NULL,${
          req.userId
        },"${DateNow}",${100},"${comments}","${doorbell}","${floor}","${phone}","${payment}","${address}")`,
        (q_err, q_res) => {
          conn.release();
          if (q_err) {
            console.log(q_err);
            return res.status(400).send(q_err);
          }
          req.orderId = q_res.insertId;
          next();
        }
      );
    });
  } catch (error) {
    res.status(500).send("Server error");
  }
};

const getPastOrders = (req, res) => {
  try {
    pool.getConnection((conn_err, conn) => {
      if (conn_err) return res.status(500).send("Internal error");
      conn.query(
        `SELECT Orders.id, created, total_price, comments, doorbell, floor, phoneNumber, payment, item_count, item_id, item_type, address FROM \`Orders\` INNER JOIN Items ON Items.order_id=Orders.id AND Orders.user_id=${req.userId}`,
        (q_err, q_res) => {
          conn.release();
          if (q_err) {
            console.log(q_err);
            return res.status(500).send("Server error");
          }
          return res.status(200).send(q_res);
        }
      );
    });
  } catch (error) {
    res.status(500).send("Server error");
  }
};

module.exports = { createOrderItem, createOrder, getPastOrders };
