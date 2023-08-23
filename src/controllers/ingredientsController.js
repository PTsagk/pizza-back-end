const express = require("express");
const pool = require("../mysqlPool");

const getIngredients = async (req, res) => {
  try {
    pool.getConnection((conn_err, conn) => {
      if (conn_err) return res.status(500).send(conn_err);
      conn.query("CALL Ingredient_GetAllIngredients();", (error, response) => {
        conn.release();
        if (error) {
          res.sendStatus(500);
          return;
        }
        if (response) res.json(response[0]);
      });
    });
  } catch (error) {
    res.sendStatus(500);
  }
};

const linkIngredients = async (req, res, next) => {
  try {
    const { pizzaId } = req;
    const { ingredients } = req.body;
    console.log(pizzaId);
    pool.getConnection((pool_err, conn) => {
      if (pool_err) return res.status(500).send("Service Unavailable");
      let query = "INSERT INTO Contain VALUES";
      for (const index in ingredients) {
        const ingredientId = ingredients[index];
        query += ` (NULL,"${pizzaId}","${ingredientId}")`;
        if (index < ingredients.length - 1) query += ",";
        else query += ";";
      }
      pool.query(query, (query_err, query_resp) => {
        conn.release();
        if (query_err) return res.status(404).send(query_err);
        next();
      });
    });
  } catch (error) {
    res.status(500).send("Server error");
  }
};
module.exports = { getIngredients, linkIngredients };
