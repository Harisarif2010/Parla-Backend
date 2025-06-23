import { createTransport } from "nodemailer";
import { NewCustomer } from "../emailTemplates/NewCustomer";

var transporter = createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    pass: process.env.SMTP_PASSWORD,
    user: process.env.SMTP_EMAIL,
  },
});

export const sendNewCustomer = async (email, password) => {
  try {
    let html = NewCustomer.replace(`{{password}}`, password.toString());
    let emailObj = {
      to: email,
      from: process.env.SMTP_EMAIL,
      subject: "New Customer Credentials",
      html: html,
    };
    await transporter.sendMail(emailObj);
    return true;
  } catch (error) {
    return false;
  }
};
