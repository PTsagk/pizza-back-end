const transporter = require("../transporter");
const jwt = require("jsonwebtoken");

const service_email = process.env.SERVICE_EMAIL;
const website_url = process.env.WEBSITE_URL;
const jwt_secret = process.env.JWT_SECRET;

// const verifyCookieIdToken = async (req,res)=>{
//   try {

//   } catch (error) {
//     res.status(500).send("Token expired");
//   }
// }

const verifyRegistrationToken = async (req, res, next) => {
  try {
    let { token } = req.params;
    token = token.split("=2E");
    token = token.join(".");
    console.log(token, "token");
    const payload = jwt.verify(token, jwt_secret);
    console.log("payload", payload);
    if (!payload.id) res.status(404).send("Token expired");
    req.userId = payload.id;
    next();
  } catch (error) {
    res.status(500).send("Token expired");
  }
};

const sendRegistrationToken = async (req, res) => {
  try {
    let { token } = req;
    let { email } = req;
    if (!token) {
      token = req.body.token;
    }
    if (!email) {
      email = req.body.email;
    }
    console.log(token, email);
    token = token.split(".");
    token = token.join("=2E");
    console.log(token);
    const url = `${website_url}/token/verify/${token}`;
    await transporter.sendMail(
      {
        from: service_email,
        to: email,
        subject: "Verify email",
        html: `Please verify your email by clicking this link : <a href="${url}">${url}</a>`,
      },
      (error, info) => {
        if (error) {
          console.log(error);
          res.sendStatus(400);
        }
        if (!error && info) res.status(200).send("Please verify your email");
      }
    );
  } catch (error) {
    res.status(500).send("Server error");
  }
};

const createRegistrationToken = async (req, res, next) => {
  try {
    const { id } = req;
    if (!id) return req.status(404).send("User not found");
    const token = jwt.sign({ id }, jwt_secret);
    req.token = token;
    next();
  } catch (error) {
    res.status(500).send("Internal error");
  }
};

module.exports = {
  verifyRegistrationToken,
  sendRegistrationToken,
  createRegistrationToken,
};
