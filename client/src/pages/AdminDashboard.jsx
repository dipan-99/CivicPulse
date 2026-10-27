import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import CategoryBadge from '../components/CategoryBadge';
import Spinner from '../components/Spinner';
import { CATEGORY_LIST, STATUS_LIST, CATEGORIES } from '../utils/constants';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip as RechartsTooltip,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import {
    ShieldCheck,
    AlertCircle,
    CheckCircle2,
    Clock,
    Trash2,
    Edit3,
    ExternalLink,
    Search,
    Filter,
    RefreshCw,
    X,
    AlertTriangle
} from 'lucide-react';

export default function AdminDashboard() {
    const { user } = useAuth();

    // Metrics and stats state
    const [stats, setStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(true);

    // Issues table state
    const [issues, setIssues] = useState([]);
    const [issuesLoading, setIssuesLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [totalCount, setTotalCount] = useState(0);

    // Modal states
    const [statusModalIssue, setStatusModalIssue] = useState(null);
    const [newStatus, setNewStatus] = useState('in_progress');
    const [statusComment, setStatusComment] = useState('');
    const [statusSubmitting, setStatusSubmitting] = useState(false);
    const [statusModalError, setStatusModalError] = useState('');

    const [deleteModalIssue, setDeleteModalIssue] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [feedbackNotice, setFeedbackNotice] = useState('');

    // Fetch admin stats
    const fetchStats = async () => {
        try {
            setStatsLoading(true);
            const res = await api.get('/stats');
            setStats(res.data);
        } catch (err) {
            console.error('Failed to load admin stats:', err);
        } finally {
            setStatsLoading(false);
        }
    };

    // Fetch issues for table
    const fetchIssues = useCallback(async () => {
        try {
            setIssuesLoading(true);
            const params = new URLSearchParams();
            if (search.trim()) params.set('search', search.trim());
            if (statusFilter !== 'all') params.set('status', statusFilter);
            if (categoryFilter !== 'all') params.set('category', categoryFilter);
            params.set('limit', 100);

            const res = await api.get(`/issues?${params.toString()}`);
            setIssues(res.data.issues || []);
            setTotalCount(res.data.total || 0);
        } catch (err) {
            console.error('Failed to load admin issues:', err);
        } finally {
            setIssuesLoading(false);
        }
    }, [search, statusFilter, categoryFilter]);

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        fetchIssues();
    }, [fetchIssues]);

    // Handle open status update modal
    const openStatusModal = (issue) => {
        setStatusModalIssue(issue);
        setNewStatus(issue.status === 'open' ? 'in_progress' : issue.status);
        setStatusComment('');
        setStatusModalError('');
    };

    // Handle submit status update
    const handleStatusUpdate = async (e) => {
        e.preventDefault();
        if (!statusComment.trim()) {
            setStatusModalError('An administrative explanation comment is required.');
            return;
        }

        setStatusSubmitting(true);
        setStatusModalError('');

        try {
            const res = await api.patch(`/issues/${statusModalIssue._id}/status`, {
                status: newStatus,
                comment: statusComment.trim(),
            });

            // Update local issue in table
            setIssues((prev) =>
                prev.map((item) => (item._id === statusModalIssue._id ? res.data.issue : item))
            );

            setStatusModalIssue(null);
            setFeedbackNotice(`Status for "${statusModalIssue.title}" changed to ${newStatus}.`);
            fetchStats();
            setTimeout(() => setFeedbackNotice(''), 4000);
        } catch (err) {
            setStatusModalError(err.response?.data?.message || 'Failed to update status.');
        } finally {
            setStatusSubmitting(false);
        }
    };

    // Handle delete issue
    const handleDeleteIssue = async () => {
        if (!deleteModalIssue) return;
        setDeleting(true);

        try {
            await api.delete(`/issues/${deleteModalIssue._id}`);
            setIssues((prev) => prev.filter((i) => i._id !== deleteModalIssue._id));
            setDeleteModalIssue(null);
            setFeedbackNotice(`Issue "${deleteModalIssue.title}" permanently deleted.`);
            fetchStats();
            setTimeout(() => setFeedbackNotice(''), 4000);
        } catch (err) {
            console.error('Failed to delete issue:', err);
        } finally {
            setDeleting(false);
        }
    };

    // Chart data formatting
    const statusPieData = stats?.byStatus
        ? [
            { name: 'Open', value: stats.byStatus.open || 0, color: '#ef4444' },
            { name: 'In Progress', value: stats.byStatus.in_progress || 0, color: '#f59e0b' },
            { name: 'Resolved', value: stats.byStatus.resolved || 0, color: '#10b981' },
        ].filter((item) => item.value > 0)
        : [];

    const categoryBarData = stats?.byCategory
        ? stats.byCategory.map((c) => ({
            name: CATEGORIES[c.category]?.label || c.category,
            count: c.count,
        }))
        : [];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                        <ShieldCheck className="w-8 h-8 text-purple-600" />
                        <span>Admin Command Center</span>
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Real-time municipal metrics, category analytics, and community issue workflows.
                    </p>
                </div>

                <button
                    onClick={() => {
                        fetchStats();
                        fetchIssues();
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-300 text-slate-700 hover:text-indigo-600 rounded-xl text-xs font-semibold shadow-xs transition hover:bg-slate-50 self-start sm:self-auto"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${statsLoading || issuesLoading ? 'animate-spin' : ''}`} />
                    <span>Refresh Data</span>
                </button>
            </div>

            {/* Temporary Success Notice Banner */}
            {feedbackNotice && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-emerald-800 text-xs font-bold shadow-xs">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>{feedbackNotice}</span>
                    </div>
                    <button onClick={() => setFeedbackNotice('')} className="text-emerald-600 hover:text-emerald-800">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* 1. Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

                {/* Total Issues Card */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Reports</span>
                        <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                            <ShieldCheck className="w-4 h-4" />
                        </span>
                    </div>
                    <div className="mt-4">
                        <div className="text-3xl font-extrabold text-slate-900">
                            {statsLoading ? '...' : stats?.total || 0}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                            {stats?.totalUpvotes || 0} community upvotes across issues
                        </p>
                    </div>
                </div>

                {/* Open Issues Card */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-rose-500 uppercase tracking-wider">Open (Unresolved)</span>
                        <span className="p-2 rounded-xl bg-rose-50 text-rose-600">
                            <AlertCircle className="w-4 h-4" />
                        </span>
                    </div>
                    <div className="mt-4">
                        <div className="text-3xl font-extrabold text-rose-600">
                            {statsLoading ? '...' : stats?.byStatus?.open || 0}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Awaiting dispatch or initial review</p>
                    </div>
                </div>

                {/* In Progress Issues Card */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">In Progress</span>
                        <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
                            <Clock className="w-4 h-4" />
                        </span>
                    </div>
                    <div className="mt-4">
                        <div className="text-3xl font-extrabold text-amber-600">
                            {statsLoading ? '...' : stats?.byStatus?.in_progress || 0}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Dispatched to maintenance crews</p>
                    </div>
                </div>

                {/* Resolved Issues Card */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Resolved</span>
                        <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                            <CheckCircle2 className="w-4 h-4" />
                        </span>
                    </div>
                    <div className="mt-4">
                        <div className="text-3xl font-extrabold text-emerald-600">
                            {statsLoading ? '...' : stats?.byStatus?.resolved || 0}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Completed and verified fixed</p>
                    </div>
                </div>

            </div>

            {/* 2. Recharts Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Category Breakdown Bar Chart (lg: 7 cols) */}
                <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                    <h2 className="text-base font-bold text-slate-900 mb-1">
                        Issues by Category
                    </h2>
                    <p className="text-xs text-slate-400 mb-6">Distribution across municipal issue classifications</p>

                    <div className="h-64 sm:h-72 w-full">
                        {statsLoading ? (
                            <div className="h-full flex items-center justify-center">
                                <Spinner size="md" />
                            </div>
                        ) : categoryBarData.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-xs text-slate-400">
                                No category data recorded yet
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={categoryBarData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fontSize: 11, fill: '#64748b' }}
                                        interval={0}
                                        angle={-15}
                                        textAnchor="end"
                                    />
                                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                                    <RechartsTooltip
                                        contentStyle={{
                                            backgroundColor: '#ffffff',
                                            borderRadius: '12px',
                                            border: '1px solid #e2e8f0',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                            fontSize: '12px',
                                        }}
                                    />
                                    <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Status Distribution Donut Chart (lg: 5 cols) */}
                <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                    <h2 className="text-base font-bold text-slate-900 mb-1">
                        Status Breakdown
                    </h2>
                    <p className="text-xs text-slate-400 mb-6">Current operational lifecycle state</p>

                    <div className="h-64 sm:h-72 w-full">
                        {statsLoading ? (
                            <div className="h-full flex items-center justify-center">
                                <Spinner size="md" />
                            </div>
                        ) : statusPieData.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-xs text-slate-400">
                                No status data available
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusPieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {statusPieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip
                                        contentStyle={{
                                            backgroundColor: '#ffffff',
                                            borderRadius: '12px',
                                            border: '1px solid #e2e8f0',
                                            fontSize: '12px',
                                        }}
                                    />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                        iconType="circle"
                                        formatter={(value) => <span className="text-xs font-semibold text-slate-700">{value}</span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

            </div>

            {/* 3. Issues Management Table Section */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">

                {/* Table Filters Bar */}
                <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h2 className="text-base font-bold text-slate-900">
                            Manage Civic Reports
                        </h2>
                        <p className="text-xs text-slate-500">
                            Review citizen complaints, change status with required notes, or remove spam
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Search */}
                        <div className="relative">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                id="admin-search-input"
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Filter issues..."
                                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-slate-50/50"
                            />
                        </div>

                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="all">All Statuses</option>
                            {STATUS_LIST.map((s) => (
                                <option key={s.key} value={s.key}>
                                    {s.label}
                                </option>
                            ))}
                        </select>

                        {/* Category Filter */}
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="all">All Categories</option>
                            {CATEGORY_LIST.map((c) => (
                                <option key={c.key} value={c.key}>
                                    {c.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Table Content */}
                <div className="overflow-x-auto">
                    {issuesLoading ? (
                        <div className="py-16 flex items-center justify-center">
                            <Spinner size="md" text="Loading issue records..." />
                        </div>
                    ) : issues.length === 0 ? (
                        <div className="py-16 text-center text-xs text-slate-400">
                            No matching issues found for the selected filters.
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                                    <th className="py-3 px-4">Title & Category</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4">Reporter & Date</th>
                                    <th className="py-3 px-4 text-center">Upvotes</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {issues.map((issue) => {
                                    const dateStr = new Date(issue.createdAt).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                    });
                                    const upvotesCount = Array.isArray(issue.upvotes) ? issue.upvotes.length : 0;

                                    return (
                                        <tr key={issue._id} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="py-3 px-4">
                                                <Link
                                                    to={`/issues/${issue._id}`}
                                                    className="font-bold text-slate-900 hover:text-indigo-600 transition"
                                                >
                                                    {issue.title}
                                                </Link>
                                                <div className="mt-1">
                                                    <CategoryBadge category={issue.category} size="xs" />
                                                </div>
                                            </td>

                                            <td className="py-3 px-4">
                                                <StatusBadge status={issue.status} size="xs" />
                                            </td>

                                            <td className="py-3 px-4 text-slate-500">
                                                <div className="font-medium text-slate-800">{issue.createdBy?.name || 'Citizen'}</div>
                                                <div className="text-[11px] text-slate-400">{dateStr}</div>
                                            </td>

                                            <td className="py-3 px-4 text-center font-bold text-slate-700">
                                                {upvotesCount}
                                            </td>

                                            <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                                                <button
                                                    type="button"
                                                    onClick={() => openStatusModal(issue)}
                                                    className="p-1.5 text-purple-700 hover:bg-purple-100 rounded-lg transition"
                                                    title="Update Status"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => setDeleteModalIssue(issue)}
                                                    className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg transition"
                                                    title="Delete Issue"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>

                                                <Link
                                                    to={`/issues/${issue._id}`}
                                                    className="p-1.5 inline-block text-slate-400 hover:text-slate-700 rounded-lg transition"
                                                    title="View Details"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 text-right">
                    Showing {issues.length} records
                </div>
            </div>

            {/* 4. Status Update Modal */}
            {statusModalIssue && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white max-w-lg w-full rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="p-5 bg-purple-50 border-b border-purple-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-purple-700" />
                                <h3 className="text-sm font-bold text-purple-900">
                                    Update Issue Status
                                </h3>
                            </div>
                            <button
                                onClick={() => setStatusModalIssue(null)}
                                className="text-slate-400 hover:text-slate-700"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleStatusUpdate} className="p-6 space-y-4">
                            <div>
                                <p className="text-xs text-slate-500">Target Issue:</p>
                                <p className="text-sm font-bold text-slate-800 line-clamp-1 mt-0.5">
                                    {statusModalIssue.title}
                                </p>
                            </div>

                            {statusModalError && (
                                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                                    {statusModalError}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    New Status *
                                </label>
                                <select
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                                >
                                    <option value="open">Open (Re-open Issue)</option>
                                    <option value="in_progress">In Progress (Dispatch Team)</option>
                                    <option value="resolved">Resolved (Fix Complete)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Required Admin Explanation Note *
                                </label>
                                <textarea
                                    rows={3}
                                    value={statusComment}
                                    onChange={(e) => setStatusComment(e.target.value)}
                                    placeholder="Explain the inspection status, work order dispatched, or resolution details..."
                                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                                <p className="text-[11px] text-slate-400 mt-1">
                                    This note will be public and permanently recorded in the issue timeline.
                                </p>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setStatusModalIssue(null)}
                                    className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={statusSubmitting}
                                    className="px-4 py-2 text-xs font-bold rounded-xl text-white bg-purple-700 hover:bg-purple-800 shadow-xs transition disabled:opacity-50"
                                >
                                    {statusSubmitting ? 'Saving...' : 'Confirm Update'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 5. Delete Issue Confirmation Modal */}
            {deleteModalIssue && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white max-w-md w-full rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                            <AlertTriangle className="w-6 h-6" />
                        </div>

                        <div className="text-center">
                            <h3 className="text-base font-bold text-slate-900">
                                Permanently Delete Report?
                            </h3>
                            <p className="mt-1 text-xs text-slate-500">
                                Are you sure you want to delete <span className="font-semibold text-slate-800">"{deleteModalIssue.title}"</span>? This action cannot be reversed.
                            </p>
                        </div>

                        <div className="flex items-center justify-center gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setDeleteModalIssue(null)}
                                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={deleting}
                                onClick={handleDeleteIssue}
                                className="px-4 py-2 text-xs font-bold rounded-xl text-white bg-rose-600 hover:bg-rose-700 shadow-xs transition disabled:opacity-50"
                            >
                                {deleting ? 'Deleting...' : 'Yes, Delete Report'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
