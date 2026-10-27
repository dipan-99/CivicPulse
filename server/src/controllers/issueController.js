const Issue = require('../models/Issue');
const { toGeoJSONCoordinates, isValidLatLng } = require('../utils/geo');

/**
 * GET /api/issues
 * Public list of issues with query filtering, searching, sorting, and pagination.
 */
const getIssues = async (req, res, next) => {
    try {
        const {
            status,
            category,
            search,
            sort = 'newest',
            page = 1,
            limit = 10
        } = req.query;

        const filter = {};

        // Filter by status
        if (status && status !== 'all') {
            filter.status = status;
        }

        // Filter by category
        if (category && category !== 'all') {
            filter.category = category;
        }

        // Search by title or description
        if (search && search.trim()) {
            const searchRegex = new RegExp(search.trim(), 'i');
            filter.$or = [
                { title: { $regex: searchRegex } },
                { description: { $regex: searchRegex } }
            ];
        }

        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
        const skip = (pageNum - 1) * limitNum;

        const total = await Issue.countDocuments(filter);

        let query = Issue.find(filter).populate('createdBy', 'name email role');

        // Sorting strategy
        if (sort === 'upvotes') {
            // Sort by upvotes count descending, then newest
            query = Issue.aggregate([
                { $match: filter },
                {
                    $addFields: {
                        upvotesCount: { $size: { $ifNull: ['$upvotes', []] } }
                    }
                },
                { $sort: { upvotesCount: -1, createdAt: -1 } },
                { $skip: skip },
                { $limit: limitNum },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'createdBy',
                        foreignField: '_id',
                        as: 'createdBy'
                    }
                },
                { $unwind: '$createdBy' },
                {
                    $project: {
                        'createdBy.passwordHash': 0
                    }
                }
            ]);

            const issues = await query.exec();
            return res.status(200).json({
                issues,
                total,
                page: pageNum,
                pages: Math.ceil(total / limitNum) || 1
            });
        }

        // Default newest sort
        query = query.sort({ createdAt: -1 }).skip(skip).limit(limitNum);
        const issues = await query.exec();

        res.status(200).json({
            issues,
            total,
            page: pageNum,
            pages: Math.ceil(total / limitNum) || 1
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/issues/mine
 * Protected route: Returns issues submitted by the logged-in user.
 */
const getMyIssues = async (req, res, next) => {
    try {
        const issues = await Issue.find({ createdBy: req.user._id })
            .populate('createdBy', 'name email role')
            .populate('statusHistory.updatedBy', 'name email role')
            .sort({ createdAt: -1 });

        res.status(200).json({
            issues,
            total: issues.length
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/issues/:id
 * Public route: Returns single issue by id with timeline and creator populated.
 */
const getIssueById = async (req, res, next) => {
    try {
        const issue = await Issue.findById(req.params.id)
            .populate('createdBy', 'name email role')
            .populate('statusHistory.updatedBy', 'name email role');

        if (!issue) {
            return res.status(404).json({ message: 'Issue not found' });
        }

        res.status(200).json(issue);
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/issues
 * Protected route: Report a new civic issue.
 */
const createIssue = async (req, res, next) => {
    try {
        const { title, description, category, imageUrl, latitude, longitude, location } = req.body;

        let coords;
        if (latitude !== undefined && longitude !== undefined) {
            coords = toGeoJSONCoordinates([latitude, longitude]);
        } else if (location && location.coordinates) {
            coords = location.coordinates;
        } else {
            return res.status(400).json({
                message: 'Validation failed',
                errors: [{ field: 'location', message: 'Valid geographical coordinates are required' }]
            });
        }

        // Validate coordinates [lng, lat]
        const [lng, lat] = coords;
        if (!isValidLatLng(lat, lng)) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: [{ field: 'location', message: 'Coordinates are out of geographical range' }]
            });
        }

        const issue = await Issue.create({
            title: title.trim(),
            description: description.trim(),
            category,
            imageUrl: imageUrl ? imageUrl.trim() : '',
            location: {
                type: 'Point',
                coordinates: [Number(lng), Number(lat)]
            },
            status: 'open',
            createdBy: req.user._id,
            upvotes: [],
            statusHistory: [
                {
                    status: 'open',
                    comment: 'Issue reported by citizen',
                    updatedBy: req.user._id,
                    date: new Date()
                }
            ]
        });

        const populatedIssue = await Issue.findById(issue._id)
            .populate('createdBy', 'name email role')
            .populate('statusHistory.updatedBy', 'name email role');

        res.status(201).json({
            message: 'Issue reported successfully',
            issue: populatedIssue
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/issues/:id/upvote
 * Protected route: Toggle upvote on an issue (1 upvote per user).
 */
const toggleUpvote = async (req, res, next) => {
    try {
        const issue = await Issue.findById(req.params.id);
        if (!issue) {
            return res.status(404).json({ message: 'Issue not found' });
        }

        const userIdStr = req.user._id.toString();
        const existingIndex = issue.upvotes.findIndex(
            (id) => id.toString() === userIdStr
        );

        let upvoted = false;
        if (existingIndex > -1) {
            // Remove upvote
            issue.upvotes.splice(existingIndex, 1);
            upvoted = false;
        } else {
            // Add upvote
            issue.upvotes.push(req.user._id);
            upvoted = true;
        }

        await issue.save();

        res.status(200).json({
            message: upvoted ? 'Issue upvoted successfully' : 'Upvote removed',
            upvoted,
            upvotesCount: issue.upvotes.length,
            issue
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PATCH /api/issues/:id/status
 * Admin-only route: Update issue status with a mandatory comment.
 */
const updateStatus = async (req, res, next) => {
    try {
        const { status, comment } = req.body;

        if (!comment || !comment.trim()) {
            return res.status(400).json({
                message: 'A comment is required when updating an issue status'
            });
        }

        const validStatuses = ['open', 'in_progress', 'resolved'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                message: `Invalid status '${status}'. Must be one of: open, in_progress, resolved`
            });
        }

        const issue = await Issue.findById(req.params.id);
        if (!issue) {
            return res.status(404).json({ message: 'Issue not found' });
        }

        issue.status = status;
        issue.statusHistory.push({
            status,
            comment: comment.trim(),
            updatedBy: req.user._id,
            date: new Date()
        });

        await issue.save();

        const updatedIssue = await Issue.findById(issue._id)
            .populate('createdBy', 'name email role')
            .populate('statusHistory.updatedBy', 'name email role');

        res.status(200).json({
            message: `Status updated to ${status}`,
            issue: updatedIssue
        });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/issues/:id
 * Admin-only route: Delete spam or invalid issue.
 */
const deleteIssue = async (req, res, next) => {
    try {
        const issue = await Issue.findById(req.params.id);
        if (!issue) {
            return res.status(404).json({ message: 'Issue not found' });
        }

        await Issue.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: 'Issue deleted successfully',
            id: req.params.id
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getIssues,
    getMyIssues,
    getIssueById,
    createIssue,
    toggleUpvote,
    updateStatus,
    deleteIssue
};
