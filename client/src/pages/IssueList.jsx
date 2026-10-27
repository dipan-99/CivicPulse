import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import IssueCard from '../components/IssueCard';
import Spinner from '../components/Spinner';
import { CATEGORY_LIST, STATUS_LIST } from '../utils/constants';
import {
    Search,
    Filter,
    ArrowUpDown,
    ListFilter,
    ChevronLeft,
    ChevronRight,
    X,
    Inbox
} from 'lucide-react';

export default function IssueList() {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();

    const [issues, setIssues] = useState([]);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(true);

    // Filters state initialized from URL params if present
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [status, setStatus] = useState(searchParams.get('status') || 'all');
    const [category, setCategory] = useState(searchParams.get('category') || 'all');
    const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
    const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));

    const fetchIssues = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (search.trim()) params.set('search', search.trim());
            if (status !== 'all') params.set('status', status);
            if (category !== 'all') params.set('category', category);
            params.set('sort', sort);
            params.set('page', page);
            params.set('limit', 10);

            const res = await api.get(`/issues?${params.toString()}`);
            setIssues(res.data.issues || []);
            setTotal(res.data.total || 0);
            setPages(res.data.pages || 1);
        } catch (err) {
            console.error('Failed to load issues:', err);
        } finally {
            setLoading(false);
        }
    }, [search, status, category, sort, page]);

    useEffect(() => {
        fetchIssues();
    }, [fetchIssues]);

    // Handle Search submit
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        fetchIssues();
    };

    // Reset filters
    const handleClearFilters = () => {
        setSearch('');
        setStatus('all');
        setCategory('all');
        setSort('newest');
        setPage(1);
    };

    // Handle upvote toggle in-place
    const handleUpvote = async (issueId) => {
        if (!user) {
            window.location.href = '/login';
            return;
        }

        try {
            const res = await api.post(`/issues/${issueId}/upvote`);
            const { upvoted, upvotesCount } = res.data;

            setIssues((prev) =>
                prev.map((item) => {
                    if (item._id === issueId) {
                        let newUpvotes = Array.isArray(item.upvotes) ? [...item.upvotes] : [];
                        if (upvoted) {
                            newUpvotes.push(user._id);
                        } else {
                            newUpvotes = newUpvotes.filter((id) => (id._id || id).toString() !== user._id.toString());
                        }
                        return {
                            ...item,
                            upvotes: newUpvotes,
                            upvotesCount,
                        };
                    }
                    return item;
                })
            );
        } catch (err) {
            console.error('Failed to upvote:', err);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Title */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                        <ListFilter className="w-7 h-7 text-indigo-600" />
                        <span>Community Issues</span>
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Browse, search, and upvote civic reports submitted by fellow citizens.
                    </p>
                </div>

                <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl self-start sm:self-auto">
                    {total} total reports recorded
                </div>
            </div>

            {/* Filter and Search Toolbar */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs mb-8 space-y-4">

                {/* Search Row */}
                <form onSubmit={handleSearchSubmit} className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Search className="w-4 h-4" />
                    </div>
                    <input
                        id="search-issues"
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search issues by title, street landmark, or description..."
                        className="w-full pl-10 pr-20 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearch('');
                                setPage(1);
                            }}
                            className="absolute inset-y-0 right-12 pr-2 flex items-center text-slate-400 hover:text-slate-600"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        type="submit"
                        className="absolute inset-y-1 right-1 px-3.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition"
                    >
                        Search
                    </button>
                </form>

                {/* Filter Controls Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">

                    {/* Status Select */}
                    <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Filter by Status
                        </label>
                        <select
                            value={status}
                            onChange={(e) => {
                                setStatus(e.target.value);
                                setPage(1);
                            }}
                            className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="all">All Statuses</option>
                            {STATUS_LIST.map((s) => (
                                <option key={s.key} value={s.key}>
                                    {s.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Category Select */}
                    <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Filter by Category
                        </label>
                        <select
                            value={category}
                            onChange={(e) => {
                                setCategory(e.target.value);
                                setPage(1);
                            }}
                            className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="all">All Categories</option>
                            {CATEGORY_LIST.map((cat) => (
                                <option key={cat.key} value={cat.key}>
                                    {cat.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Sort Select */}
                    <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Sort By
                        </label>
                        <select
                            value={sort}
                            onChange={(e) => {
                                setSort(e.target.value);
                                setPage(1);
                            }}
                            className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="newest">Newest Reports First</option>
                            <option value="upvotes">Most Upvoted First</option>
                        </select>
                    </div>

                </div>
            </div>

            {/* Issue Cards Grid */}
            {loading ? (
                <div className="py-20 flex flex-col items-center justify-center">
                    <Spinner size="lg" text="Fetching community reports..." />
                </div>
            ) : issues.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-xs">
                    <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-4">
                        <Inbox className="w-7 h-7" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800">No issues found</h3>
                    <p className="mt-1 text-xs text-slate-500">
                        No civic reports matched your search filters. Try widening your criteria or search term.
                    </p>
                    <button
                        type="button"
                        onClick={handleClearFilters}
                        className="mt-5 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition"
                    >
                        Clear All Filters
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {issues.map((issue) => (
                        <IssueCard
                            key={issue._id}
                            issue={issue}
                            onUpvote={handleUpvote}
                            currentUserId={user?._id}
                        />
                    ))}
                </div>
            )}

            {/* Pagination Controls */}
            {pages > 1 && (
                <div className="mt-10 flex items-center justify-between border-t border-slate-200 pt-5">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1 || loading}
                        className="inline-flex items-center gap-1 px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Previous</span>
                    </button>

                    <span className="text-xs font-medium text-slate-600">
                        Page <span className="font-bold text-slate-900">{page}</span> of <span className="font-bold text-slate-900">{pages}</span>
                    </span>

                    <button
                        onClick={() => setPage((p) => Math.min(pages, p + 1))}
                        disabled={page >= pages || loading}
                        className="inline-flex items-center gap-1 px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition"
                    >
                        <span>Next</span>
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
