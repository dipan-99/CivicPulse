const Issue = require('../models/Issue');

/**
 * GET /api/stats
 * Admin-only aggregation endpoint for dashboard metrics and Recharts visualizations.
 */
const getStats = async (req, res, next) => {
    try {
        // 1. Total issue count
        const totalIssues = await Issue.countDocuments();

        // 2. Status distribution
        const statusCountsRaw = await Issue.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        const byStatus = {
            open: 0,
            in_progress: 0,
            resolved: 0
        };
        statusCountsRaw.forEach((item) => {
            if (item._id && byStatus[item._id] !== undefined) {
                byStatus[item._id] = item.count;
            }
        });

        // 3. Category distribution (ensure all 6 standard categories are represented)
        const categoryCountsRaw = await Issue.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);

        const allCategories = [
            'pothole',
            'streetlight',
            'garbage',
            'water_leak',
            'road_damage',
            'other'
        ];

        const categoryMap = {};
        categoryCountsRaw.forEach((item) => {
            categoryMap[item._id] = item.count;
        });

        const byCategory = allCategories.map((cat) => ({
            category: cat,
            count: categoryMap[cat] || 0
        }));

        // 4. Total community upvotes
        const upvotesAggregate = await Issue.aggregate([
            {
                $project: {
                    upvoteCount: { $size: { $ifNull: ['$upvotes', []] } }
                }
            },
            {
                $group: {
                    _id: null,
                    totalUpvotes: { $sum: '$upvoteCount' }
                }
            }
        ]);
        const totalUpvotes = upvotesAggregate[0]?.totalUpvotes || 0;

        // 5. Recent 5 reported issues
        const recentIssues = await Issue.find()
            .populate('createdBy', 'name email role')
            .sort({ createdAt: -1 })
            .limit(5);

        res.status(200).json({
            total: totalIssues,
            byStatus,
            byCategory,
            totalUpvotes,
            recentIssues
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getStats
};
