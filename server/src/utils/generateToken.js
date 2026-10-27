const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
require('dotenv').config();

/**
 * Generates a signed JWT token containing user id and role.
 * Uses environment variable JWT_SECRET and JWT_EXPIRES_IN with safe fallback.
 */
const generateToken = (userId, role) => {
  const secret = process.env.JWT_SECRET || 'civicpulse_super_secret_local_jwt_key_2026_dev_secure';

  return jwt.sign(
    { id: userId, role },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

module.exports = generateToken;
