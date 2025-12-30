const Joi = require("joi");
const {
  NAME_MIN,
  NAME_MAX,
  PASSWORD_MIN,
  PASSWORD_MAX,
} = require("../constants/validations.constants");

const registerSchema = Joi.object({
  name: Joi.string().min(NAME_MIN).max(NAME_MAX).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(PASSWORD_MIN).max(PASSWORD_MAX).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

module.exports = { registerSchema, loginSchema };
