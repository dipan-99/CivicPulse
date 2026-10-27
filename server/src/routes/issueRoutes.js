const express = require('express');
const { body } = require('express-validator');
const {
    getIssues,
    getMyIssues,
    getIssueById,
    createIssue,
    toggleUpvote,
    updateStatus,
    deleteIssue
} = require('../controllers/issueController');
const protect = require('../middleware/auth');
const { adminOnly } = require('../middleware/roles');
const validate = require('../middleware/validate');

const router = express.Router();

// Validation for creating an issue
const createIssueValidation = [
    body('title')
        .trim()
        .notEmpty().withMessage('Title is required')
        .isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
    body('description')
        .trim()
        .notEmpty().withMessage('Description is required')
        .isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
    body('category')
        .notEmpty().withMessage('Category is required')
        .isIn(['pothole', 'streetlight', 'garbage', 'water_leak', 'road_damage', 'other'])
        .withMessage('Invalid category specified'),
    body('imageUrl')
        .optional({ checkFalsy: true })
        .trim()
        .isURL().withMessage('Image URL must be a valid web URL'),
    validate
];

// Validation for updating status
const updateStatusValidation = [
    body('status')
        .notEmpty().withMessage('Status is required')
        .isIn(['open', 'in_progress', 'resolved'])
        .withMessage('Status must be open, in_progress, or resolved'),
    body('comment')
        .trim()
        .notEmpty().withMessage('A comment explaining the status update is required')
        .isLength({ min: 3, max: 1000 }).withMessage('Comment must be between 3 and 1000 characters'),
    validate
];

// Public routes
router.get('/', getIssues);

// Protected routes (order matters: /mine before /:id)
router.get('/mine', protect, getMyIssues);
router.get('/:id', getIssueById);
router.post('/', protect, createIssueValidation, createIssue);
router.post('/:id/upvote', protect, toggleUpvote);

// Admin-only routes
router.patch('/:id/status', protect, adminOnly, updateStatusValidation, updateStatus);
router.delete('/:id', protect, adminOnly, deleteIssue);

module.exports = router;
