const pool = require("../mysqlPool");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { days, minutes, seconds } = require("ms-conversion");
// const cookieParser = require("cookie-parser");

const website_url = process.env.WEBSITE_URL;

const getUsers = async (req, res) => {
  try {
    pool.getConnection((err, conn) => {
      conn.query("CALL User_GetAllUsers();", (error, response) => {
        conn.release();

        if (error) return res.send("Error");
        else res.send(response);
      });
    });
  } catch (error) {
    return res.send(error);
  }
};

const register = async (req, res, next) => {
  try {
    const { fullname, password, created, email } = req.body;
    const salt = await bcrypt.genSalt(10);
    const encryptedPassword = await bcrypt.hash(password, salt);

    pool.getConnection((err, conn) => {
      if (err) return res.status(500).send(err.message);
      conn.query(
        `INSERT INTO Users VALUES (NULL,"${fullname}","${encryptedPassword}","${created}","${email}")`,
        (error, queryRes) => {
          conn.release();
          if (error) {
            console.log(error);
            return res.status(400).send(error);
          }
          const { insertId } = queryRes;

          const token = jwt.sign({ id: insertId }, process.env.JWT_SECRET, {
            expiresIn: "1d", // jwt token duration
          });
          req.token = token;
          req.email = email;
          // next();
          res.cookie("token", `Bearer ${token}`, {
            secure: false, //change to true when deploy
            httpOnly: true,
            maxAge: days(),
          });
          res.status(200).json({
            fullname,
            email,
            created,
          });
        }
      );
    });
  } catch (error) {
    return res.send(error);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.query;
    pool.getConnection((err, conn) => {
      if (err) return res.status(500).send(err.message);
      conn.query(
        `SELECT id, email, password, fullname, created FROM Users WHERE email="${email}"`,
        async (error, response) => {
          conn.release();
          if (error) return res.status(400).send("Internal error");
          // console.log(response);
          if (response.length > 0) {
            const encryptedPassword = response[0].password;
            const isMatch = await bcrypt.compare(password, encryptedPassword);

            // Check if password is correct
            if (isMatch) {
              const { fullname, created, id, verified } = response[0];
              // Check if email is verified
              // if (!verified) {
              //   return res.status(401).send("Please verify your email");
              // }

              const token = jwt.sign({ id }, process.env.JWT_SECRET, {
                expiresIn: "1d",
              });
              res.cookie("token", `Bearer ${token}`, {
                secure: false, //change to true when deploy
                httpOnly: true,
                maxAge: days(),
              });

              if (
                email == process.env.ADMIN_EMAIL &&
                password == process.env.ADMIN_PASSWORD
              ) {
                const adminToken = jwt.sign(
                  { admin: true },
                  process.env.JWT_SECRET,
                  {
                    expiresIn: "1d",
                  }
                );

                res.cookie("admin", `Bearer ${adminToken}`, {
                  secure: false,
                  httpOnly: true,
                  maxAge: days(),
                });
              }

              return res.status(200).json({
                fullname,
                email,
                created,
              });
            } else {
              return res.status(401).send("Incorrect password");
            }
          } else {
            return res.status(404).send("User not found");
          }
        }
      );
    });
  } catch (error) {
    return res.send(error);
  }
};

const authenticateUser = async (req, res, next) => {
  try {
    let cookie = req.cookies.token;

    if (!cookie || !cookie.startsWith("Bearer")) {
      return res.status(401).send("unauthorized");
    }
    const token = cookie.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // req.user = { id: payload.id };
    req.userId = payload.id;
    next();
  } catch (error) {
    return res.send(error);
  }
};

const authenticateAdmin = async (req, res) => {
  try {
    let { admin } = req.cookies;
    if (!admin || !admin.startsWith("Bearer"))
      return res.status(401).send("Unauthorised");
    const token = admin.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    res.status(200).json(payload);
  } catch (error) {
    return res.send("Internal error");
  }
};

const updateVerifyUser = async (req, res) => {
  try {
    const { userId } = req;
    pool.getConnection((conn_err, conn) => {
      if (conn_err) return res.status(500).send("Internal error");
      conn.query(
        `UPDATE Users SET verified=TRUE WHERE id="${userId}"`,
        (q_err, q_res) => {
          conn.release();
          if (q_err) return res.status(400).send("Bad request");

          // Doesnt work for some reason
          // res.redirect(website_url);

          // Just send an OK response until res.redirect gets fixed
          res.status(200).send("Email was verified!");
        }
      );
    });
  } catch (error) {
    res.status(500).send("Server error");
  }
};

const findUserByEmail = async (req, res, next) => {
  try {
    console.log("teste3st");
    const { email } = req.body;
    pool.getConnection((conn_err, conn) => {
      if (conn_err) return res.status(500).send("Internal error");
      conn.query(
        `SELECT id FROM Users WHERE email="${email}"`,
        (q_err, q_res) => {
          conn.release();
          if (q_err) return res.status(400).send("Bad request");
          console.log(q_res);
          if (q_res.length > 0) {
            req.email = email;
            req.id = q_res[0].id;
            next();
          } else res.status(404).send("No account exists with this email");
        }
      );
    });
  } catch (error) {
    res.status(500).send("Server error");
  }
};

const getUserInfo = async (req, res) => {
  try {
    if (!req.userId) return res.status(401).send("Unauthorized");
    // const cookieId = req.user.id;
    const { userId } = req;
    pool.getConnection((err, conn) => {
      if (err) return res.status(500).send(err.message);
      conn.query(
        `SELECT email, fullname, created FROM Users WHERE id="${userId}";`,
        (queryErr, queryRes) => {
          conn.release();
          console.log(queryRes);
          if (queryErr) return res.status(400).send(queryErr.message);
          if (queryRes.length > 0) {
            return res.status(200).json({ user: queryRes[0], isAdmin: true });
          } else return res.status(404).send("User not found");
        }
      );
    });
  } catch (error) {
    return res.send(error);
  }
};

const changeValue = (req, res) => {
  try {
    let { type, value } = req.body;
    console.log("user id is " + req.userId);
    pool.getConnection(async (err, conn) => {
      if (err) return res.status(500).send(err);

      // If we want to change the password encrypt it first
      if (type === "password") {
        const salt = await bcrypt.genSalt(10);
        value = await bcrypt.hash(value, salt);
      }
      conn.query(
        `UPDATE Users SET ${type}="${value}" WHERE id=${req.userId}`,
        (queryErr, queryRes) => {
          conn.release();
          console.log(queryRes);
          if (queryErr) return res.status(400).send(queryErr);
          return res.status(200).send("Ok");
        }
      );
    });
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};

const logout = (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).send("Logout success");
  } catch (error) {
    return res.status(500).send("Unable to logout");
  }
};

module.exports = {
  getUsers,
  register,
  login,
  authenticateUser,
  getUserInfo,
  authenticateAdmin,
  updateVerifyUser,
  findUserByEmail,
  logout,
  changeValue,
};
