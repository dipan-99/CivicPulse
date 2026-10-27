const express = require('express');
const { getStats } = require('../controllers/statsController');
const protect = require('../middleware/auth');
const { adminOnly } = require('../middleware/roles');

const router = express.Router();

// Admin-only metrics and aggregation route
router.get('/', protect, adminOnly, getStats);

module.exports = router;
