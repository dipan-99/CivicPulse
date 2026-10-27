const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect middleware: Ensures incoming request has a valid Bearer JWT.
 * Attaches the authenticated user to req.user (without passwordHash).
 */
const protect = async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      message: 'Access denied: No authentication token provided'
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'civicpulse_super_secret_local_jwt_key_2026_dev_secure';
    const decoded = jwt.verify(token, secret);
    const user = await User.findById(decoded.id).select('-passwordHash');

    if (!user) {
      return res.status(401).json({
        message: 'Authentication failed: User account no longer exists'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Session expired: Please log in again'
      });
    }
    return res.status(401).json({
      message: 'Access denied: Invalid authentication token'
    });
  }
};

module.exports = protect;
