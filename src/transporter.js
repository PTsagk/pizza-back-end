require("dotenv").config();
const nodemailer = require("nodemailer");

const service_email = process.env.SERVICE_EMAIL;
const service_email_password = process.env.SERVICE_EMAIL_PASSWORD;

const transporter = nodemailer.createTransport({
  service: "outlook",
  port: 587,
  secure: false,
  tls: {
    rejectUnauthorized: false,
  },
  auth: {
    user: service_email,
    pass: service_email_password,
  },
});

module.exports = transporter;
