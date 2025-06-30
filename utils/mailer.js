import { createTransport } from "nodemailer";
import { NewCustomer } from "../emailTemplates/NewCustomer";
import { ForgotPasswordHtml } from "../emailTemplates/ForgotPasswordHtml";
import { CustomerEmailVerify } from "../emailTemplates/CustomerEmailVerify";

var transporter = createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    pass: process.env.SMTP_PASSWORD,
    user: process.env.SMTP_EMAIL,
  },
});

export const sendPasswordToNewCustomer = async (email, password) => {
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
export const sendOTP = async (email, code) => {
  try {
    let html = ForgotPasswordHtml.replace(`{{otp}}`, code.toString());
    let emailObj = {
      to: email,
      from: process.env.SMTP_EMAIL,
      subject: "Password Reset OTP",
      html: html,
    };
    await transporter.sendMail(emailObj);
    return true;
  } catch (error) {
    return false;
  }
};
export const sendOTPForCustomerAddition = async (email, code) => {
  try {
    let html = CustomerEmailVerify.replace(`{{otp}}`, code.toString());
    let emailObj = {
      to: email,
      from: process.env.SMTP_EMAIL,
      subject: "Verify Your Email",
      html: html,
    };
    await transporter.sendMail(emailObj);
    return true;
  } catch (error) {
    return false;
  }
};

