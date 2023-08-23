const pool = require("../mysqlPool");

function stringContainsNumber(address) {
  return /\d/.test(address);
}

function validateInfo(address, addressNumber, phoneNumber) {
  if (
    !stringContainsNumber(address) &&
    /^[0-9]{1,3}$/.test(addressNumber) &&
    /^[0-9]{10}$/.test(phoneNumber)
  )
    return true;
  return false;
}

const getAddressInfo = async (req, res) => {
  try {
    const { userId: id } = req;
    pool.getConnection((conn_err, conn) => {
      if (conn_err) return res.status(500).send("Service Unavailable");
      conn.query(
        `SELECT id,address,address_number,city,phoneNumber FROM Addresses WHERE user_id=${id}`,
        (query_err, query_res) => {
          conn.release();
          console.log(query_res);
          console.log("HSDASDADS");
          if (query_err) {
            console.log(query_err);
            return res.status(404).send("Not Found");
          }
          if (query_res) return res.status(200).send(query_res);
        }
      );
    });
  } catch (error) {
    return res.send(error);
  }
};

const createAddress = async (req, res) => {
  try {
    const { userId } = req;
    const { address, addressNumber, city, phoneNumber } = req.body;
    if (!validateInfo(address, addressNumber, phoneNumber))
      return res.status(400).send("Bad input");
    pool.getConnection((conn_err, conn) => {
      if (conn_err) return res.status(500).send("Service Unavailable");
      conn.query(
        `INSERT INTO Addresses VALUES (NULL,${userId},"${address}",${addressNumber},"${city}","${phoneNumber}")`,
        (query_err) => {
          if (query_err) {
            console.log("The error is " + query_err);
            return res.status(404).send("Not Found");
          }
        }
      );
      conn.query(
        `SELECT id,address,address_number,city,phoneNumber FROM Addresses WHERE user_id=${userId}`,
        (query_err, query_res) => {
          conn.release();
          if (query_err) return res.status(404).send("Not Found");
          console.log(query_res);
          if (query_res) return res.status(200).send(query_res);
        }
      );
    });
  } catch (error) {
    return res.send(error);
  }
};

const updateAddress = async (req, res) => {
  try {
    const { userId: id } = req;
    const { addressId, address, addressNumber, city, phoneNumber } = req.body;
    if (!validateInfo(address, addressNumber, phoneNumber))
      return res.status(400).send("Bad input");
    pool.getConnection((conn_err, conn) => {
      if (conn_err) return res.status(500).send("Service Unavailable");
      conn.query(
        `UPDATE Addresses SET address="${address}", address_number=${addressNumber}, city="${city}", phoneNumber=${phoneNumber} WHERE user_id=${id} AND id=${addressId}`,
        (query_err) => {
          if (query_err) return res.status(404).send("Not Found");
        }
      );
      conn.query(
        `SELECT id,address,address_number,city,phoneNumber FROM Addresses WHERE user_id=${id}`,
        (query_err, query_res) => {
          conn.release();
          if (query_err) return res.status(404).send("Not Found");
          if (query_res) return res.status(200).send(query_res);
        }
      );
    });
  } catch (error) {
    return res.send(error);
  }
};

const deleteAddress = async (req, res) => {
  try {
    const { userId: id } = req;
    const { addressId } = req.body;
    console.log(addressId);
    pool.getConnection((conn_err, conn) => {
      if (conn_err) return res.status(500).send("Service Unavailable");
      /*
      First query to select all orders with address_id
      */
      conn.query(
        `SELECT id FROM \`Orders\` WHERE address_id="${addressId}"`,
        (q_err, q_res) => {
          if (q_err) return res.status(400).send("Bad Request");
          let itemsWhereCondition = q_res.reduce((string, id, index) => {
            if (index === q_res.length - 1)
              return string + ` order_id=${id.id}`;
            return string + ` order_id=${id.id} OR`;
          }, "");
          let itemsQuery = "";
          // if no orders exist, don't make query to delete items from orders
          if (itemsWhereCondition)
            itemsQuery = `DELETE FROM Items WHERE${itemsWhereCondition};`;
          /*
          Second query to delete all items, orders, and addresses
          corresponding to address_id
          */
          conn.query(
            `${itemsQuery}DELETE FROM \`Orders\` WHERE address_id=${addressId};DELETE FROM Addresses WHERE id=${addressId};`,
            (query_err1, query_res1) => {
              if (query_err1) return res.status(400).send("Bad Request");
              /*
              Third query select all addresses ( remaining addresses )
              */
              conn.query(
                `SELECT id,address,address_number,city,phoneNumber FROM Addresses WHERE user_id=${id}`,
                (query_err2, query_res2) => {
                  conn.release();
                  if (query_err2) return res.status(404).send("Not Found");
                  console.log(query_res2);
                  if (query_res2) return res.status(200).send(query_res2);
                }
              );
            }
          );
        }
      );
    });
  } catch (error) {
    return res.send(error);
  }
};

module.exports = {
  getAddressInfo,
  createAddress,
  updateAddress,
  deleteAddress,
};
