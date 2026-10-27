import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';
import CategoryBadge from '../components/CategoryBadge';
import Spinner from '../components/Spinner';
import {
    FileText,
    PlusCircle,
    Calendar,
    MessageSquareQuote,
    ThumbsUp,
    ArrowRight,
    ShieldCheck,
    Inbox
} from 'lucide-react';

export default function MyReports() {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchMyIssues = async () => {
        try {
            setLoading(true);
            setError('');
            const res = await api.get('/issues/mine');
            setIssues(res.data.issues || []);
        } catch (err) {
            console.error('Failed to load my issues:', err);
            setError('Unable to load your reports at this time.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyIssues();
    }, []);

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                        <FileText className="w-7 h-7 text-indigo-600" />
                        <span>My Submitted Reports</span>
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Track real-time progress and official responses for issues you have reported.
                    </p>
                </div>

                <Link
                    to="/report"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition hover:shadow-indigo-200 self-start sm:self-auto"
                >
                    <PlusCircle className="w-4 h-4" />
                    <span>Report New Issue</span>
                </Link>
            </div>

            {loading ? (
                <div className="py-20 flex items-center justify-center">
                    <Spinner size="lg" text="Loading your reported issues..." />
                </div>
            ) : error ? (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm">
                    {error}
                </div>
            ) : issues.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-xs">
                    <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mx-auto text-indigo-500 mb-4">
                        <Inbox className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">No reports submitted yet</h3>
                    <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                        Notice a pothole, broken streetlight, or garbage dump in your neighborhood? Drop a pin to report it.
                    </p>
                    <Link
                        to="/report"
                        className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition"
                    >
                        <PlusCircle className="w-4 h-4" />
                        <span>Report Your First Issue</span>
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {issues.map((issue) => {
                        const formattedDate = new Date(issue.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                        });

                        // Get latest statusHistory entry (especially admin comments)
                        const latestHistory =
                            issue.statusHistory && issue.statusHistory.length > 0
                                ? issue.statusHistory[issue.statusHistory.length - 1]
                                : null;

                        const upvotesCount = Array.isArray(issue.upvotes) ? issue.upvotes.length : 0;

                        return (
                            <div
                                key={issue._id}
                                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all p-5 sm:p-6"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                                    <div className="flex items-center gap-2">
                                        <CategoryBadge category={issue.category} size="xs" />
                                        <StatusBadge status={issue.status} size="xs" />
                                    </div>

                                    <div className="flex items-center gap-4 text-xs text-slate-400">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5" />
                                            <span>{formattedDate}</span>
                                        </span>
                                        <span className="flex items-center gap-1 font-semibold text-slate-600">
                                            <ThumbsUp className="w-3.5 h-3.5 text-indigo-500" />
                                            <span>{upvotesCount} upvotes</span>
                                        </span>
                                    </div>
                                </div>

                                <Link
                                    to={`/issues/${issue._id}`}
                                    className="block group mb-2"
                                >
                                    <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                        {issue.title}
                                    </h3>
                                </Link>

                                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                                    {issue.description}
                                </p>

                                {/* Latest Status Update / Admin Comment Highlight */}
                                {latestHistory && (
                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-2.5 text-xs">
                                        <MessageSquareQuote className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                                        <div className="space-y-0.5 flex-1">
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold text-slate-800 flex items-center gap-1">
                                                    <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                                                    <span>Latest status update:</span>
                                                </span>
                                                <span className="text-[11px] text-slate-400">
                                                    {new Date(latestHistory.date).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                    })}
                                                </span>
                                            </div>
                                            <p className="text-slate-600 italic">
                                                "{latestHistory.comment}"
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
                                    <Link
                                        to={`/issues/${issue._id}`}
                                        className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition"
                                    >
                                        <span>View full history & timeline</span>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
