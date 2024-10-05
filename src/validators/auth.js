const { check, validationResult } = require('express-validator');
const db = require('../db');
const { compare } = require('bcryptjs');

// Password validation
const password = check('password')
  .isLength({ min: 6, max: 15 })
  .withMessage('Password must be between 6 and 15 characters.');

// Email validation
const email = check('email')
  .isEmail()
  .withMessage('Please provide a valid email.');

// Check if email already exists during registration
const emailExists = check('email').custom(async (value) => {
  const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [value]);

  if (rows.length) {
    throw new Error('Email already exists.');
  }
});

// Login validation (check if email exists and if the password is correct)
const loginFieldsCheck = check('email').custom(async (value, { req }) => {
  const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [value]);

  if (!rows.length) {
    throw new Error('Email does not exist.');
  }

  const validPassword = await compare(req.body.password, rows[0].password_hash);

  if (!validPassword) {
    throw new Error('Wrong password.');
  }

  req.user = rows[0]; // Attach user to the request object if valid
});

// Middleware to handle validation errors and send status codes
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMsg = errors.array()[0].msg;
    const statusCode = errorMsg === 'Wrong password.' || errorMsg === 'Email does not exist.' ? 401 : 400;

    return res.status(statusCode).json({ message: errorMsg });
  }
  next();
};

module.exports = {
  registerValidation: [email, password, emailExists, handleValidationErrors],
  loginValidation: [loginFieldsCheck, handleValidationErrors],
};


