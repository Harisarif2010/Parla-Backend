import Joi from "joi";

// Base schema with role
export const signupSchema = Joi.object({
  fullName: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  gender: Joi.string().when("role", {
    is: "people",
    then: Joi.required(),
  }),
  role: Joi.string().valid("business", "people").required(),
  businessName: Joi.string().when("role", {
    is: "business",
    then: Joi.required(),
    otherwise: Joi.allow(null, ""),
  }),
  vatId: Joi.string().when("role", {
    is: "business",
    then: Joi.required(),
    otherwise: Joi.allow(null, ""),
  }),
  businessAddress: Joi.string().when("role", {
    is: "business",
    then: Joi.required(),
    otherwise: Joi.allow(null, ""),
  }),
  businessDescription: Joi.string().when("role", {
    is: "business",
    then: Joi.required(),
    otherwise: Joi.allow(null, ""),
  }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string()
    .valid("customer", "admin", "branchAdmin", "employee")
    .required(),
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
  role: Joi.string()
    .valid("customer", "admin", "branchAdmin", "employee")
    .required(),
});

export const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  confirmPassword: Joi.string().min(6).required(),
  role: Joi.string()
    .valid("customer", "admin", "branchAdmin", "employee")
    .required(),
});

export const otpVerificationSchema = Joi.object({
  email: Joi.string().email().required(),
  code: Joi.string().required(),
  role: Joi.string().required(),
});
