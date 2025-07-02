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

export const formDataSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  tCNo: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),

  image: Joi.any().required(), // file or base64 string

  country: Joi.string().required(),
  city: Joi.string().required(),
  district: Joi.string().required(),
  town: Joi.string().required(),
  street: Joi.string().required(),
  doorNo: Joi.string().required(),

  salarayAmount: Joi.string().required(),
  salarayCurrency: Joi.string().required(),
  paymentDate: Joi.string().required(), // or Joi.date() if ISO

  commission: Joi.string().optional(),
  commissionPercentage: Joi.string().optional(),

  // monthlyWageSlip: Joi.any().optional(), // could be a file

  gender: Joi.string().required(),
  personalType: Joi.string().optional(),
  serviceType: Joi.string().optional(),

  commissionDate: Joi.string().optional(),
  startingDate: Joi.string().optional(),
  resignationDate: Joi.string().optional(),
  lastDayAtWork: Joi.string().optional(),

  cnicFront: Joi.any().required(), // file
  cnicBack: Joi.any().required(), // file

  SpecializationCertificate: Joi.any().required(), // file
  certificate: Joi.any().required(), // file
  cv: Joi.any().required(), // file

  hiredBy: Joi.string().optional(),
  responsibility: Joi.string().optional(),

  createdByRoles: Joi.string().required(),
  branchId: Joi.string().required(),
});

