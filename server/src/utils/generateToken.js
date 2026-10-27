const jwt = require('jsonwebtoken');

/**
 * Generates a signed JWT token containing user id and role.
 * Uses environment variable JWT_SECRET and JWT_EXPIRES_IN.
 */
const generateToken = (userId, role) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not defined');
  }

  return jwt.sign(
    { id: userId, role },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

module.exports = generateToken;
