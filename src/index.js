const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const fileUpload = require("express-fileupload");
const userRoute = require("./routes/userRoute");
const pizzaRoute = require("./routes/pizzaRoute");
const ingredientRoute = require("./routes/ingredientsRoute");
const imageRouter = require("./routes/imageRoute");
const productRoute = require("./routes/productRoute");
const addressRoute = require("./routes/addressRoute");
const orderRoute = require("./routes/orderRoute");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const {
  authenticateUser,
  findUserByEmail,
} = require("./controllers/userController");

// const { transporter } = require("./transporter");
//fix cors for images
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    sameSite: "none",
    domain: "http://localhost:5173",
  })
);

app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(fileUpload());

app.use("/users", userRoute);
app.use("/pizza", pizzaRoute);
app.use("/ingredients", ingredientRoute);
app.use("/image", imageRouter);
app.use("/product", productRoute);
app.use("/address", authenticateUser, addressRoute);
app.use("/order", authenticateUser, orderRoute);

const port = process.env.PORT | 5000;
// const service_email = process.env.SERVICE_EMAIL;

// BOILERPLATE

// const boilerplate = async (req, res) => {
//   try {
//     pool.getConnection((conn_err, conn) => {
//       if (conn_err) return res.status(500).send("Internal error");
//       conn.query(``, (q_err, q_res) => {
//         conn.release();
//         if (q_err) return res.status(400).send("Bad request");
//       });
//     });
//   } catch (error) {
//     res.status(500).send("Server error");
//   }
// };
// app.get("/", async (req, res) => {
//   try {
//     console.log(service_email);
//     await transporter.mailer.sendMail(
//       {
//         from: service_email,
//         to: "jan-haspel@hotmail.com",
//         subject: "Test",
//         text: "testing 123",
//       },
//       (error, info) => {
//         console.log(error);
//         console.log(info);
//         if (!error) res.sendStatus(200);
//       }
//     );
//   } catch (error) {
//     res.status(500).send("Server error");
//   }
// });

// app.get(
//   "/test",
//   async (req, res, next) => {
//     try {
//       console.log("blalaldaslasld");
//       next();
//     } catch (error) {
//       res.sendStatus(500);
//     }
//   },
//   findUserByEmail
// );

app.listen(port, () => {
  console.log("Listening on port " + port);
});
