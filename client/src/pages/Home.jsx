import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import IssueMap from '../components/IssueMap';
import Spinner from '../components/Spinner';
import { CATEGORY_LIST, STATUS_LIST } from '../utils/constants';
import { PlusCircle, Filter, Layers, List, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react';

export default function Home() {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');

    const fetchMapIssues = async () => {
        try {
            setLoading(true);
            setError('');
            let url = '/issues?limit=100';
            if (statusFilter !== 'all') url += `&status=${statusFilter}`;
            if (categoryFilter !== 'all') url += `&category=${categoryFilter}`;

            const res = await api.get(url);
            setIssues(res.data.issues || []);
        } catch (err) {
            console.error('Failed to load map issues:', err);
            setError('Failed to fetch community issues. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMapIssues();
    }, [statusFilter, categoryFilter]);

    // Status counters
    const counts = {
        total: issues.length,
        open: issues.filter((i) => i.status === 'open').length,
        in_progress: issues.filter((i) => i.status === 'in_progress').length,
        resolved: issues.filter((i) => i.status === 'resolved').length,
    };

    return (
        <div className="relative w-full h-[calc(100vh-4rem)] min-h-[500px] flex flex-col overflow-hidden">

            {/* Top Floating Controls Bar */}
            <div className="absolute top-4 left-4 right-4 z-20 pointer-events-none flex flex-wrap items-center justify-between gap-3">

                {/* Filter Pills Box */}
                <div className="pointer-events-auto bg-white/95 backdrop-blur-md p-2 rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-200/80 flex flex-wrap items-center gap-2">

                    {/* Status Tabs */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                        <button
                            onClick={() => setStatusFilter('all')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${statusFilter === 'all'
                                    ? 'bg-white text-slate-900 shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            All ({counts.total})
                        </button>
                        <button
                            onClick={() => setStatusFilter('open')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${statusFilter === 'open'
                                    ? 'bg-rose-50 text-rose-700 shadow-xs ring-1 ring-rose-200'
                                    : 'text-slate-600 hover:text-rose-600'
                                }`}
                        >
                            <span className="w-2 h-2 rounded-full bg-rose-500" />
                            <span>Open</span>
                        </button>
                        <button
                            onClick={() => setStatusFilter('in_progress')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${statusFilter === 'in_progress'
                                    ? 'bg-amber-50 text-amber-700 shadow-xs ring-1 ring-amber-200'
                                    : 'text-slate-600 hover:text-amber-600'
                                }`}
                        >
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            <span>In Progress</span>
                        </button>
                        <button
                            onClick={() => setStatusFilter('resolved')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${statusFilter === 'resolved'
                                    ? 'bg-emerald-50 text-emerald-700 shadow-xs ring-1 ring-emerald-200'
                                    : 'text-slate-600 hover:text-emerald-600'
                                }`}
                        >
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span>Resolved</span>
                        </button>
                    </div>

                    {/* Category Dropdown */}
                    <div className="relative">
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="appearance-none bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold pl-3 pr-8 py-2 rounded-xl border-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                        >
                            <option value="all">All Categories</option>
                            {CATEGORY_LIST.map((cat) => (
                                <option key={cat.key} value={cat.key}>
                                    {cat.label}
                                </option>
                            ))}
                        </select>
                        <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    {/* Refresh button */}
                    <button
                        onClick={fetchMapIssues}
                        className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors"
                        title="Refresh map issues"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {/* Right Action Buttons */}
                <div className="pointer-events-auto flex items-center gap-2">
                    <Link
                        to="/issues"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white/95 backdrop-blur-md text-slate-700 hover:text-indigo-600 rounded-xl shadow-lg shadow-slate-900/10 border border-slate-200/80 text-xs font-semibold transition-all hover:bg-white"
                    >
                        <List className="w-4 h-4 text-slate-500" />
                        <span className="hidden sm:inline">List View</span>
                    </Link>

                    <Link
                        to="/report"
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/25 text-xs font-bold transition-all hover:scale-105 active:scale-95"
                    >
                        <PlusCircle className="w-4 h-4" />
                        <span>Report Issue</span>
                    </Link>
                </div>
            </div>

            {/* Bottom Floating Legend Bar */}
            <div className="absolute bottom-6 left-4 z-20 pointer-events-none hidden sm:block">
                <div className="pointer-events-auto bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-xl shadow-md border border-slate-200/80 flex items-center gap-4 text-xs font-medium text-slate-600">
                    <span className="font-bold text-slate-900 flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Map Legend:</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                        <span>Open</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                        <span>In Progress</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <span>Resolved</span>
                    </div>
                </div>
            </div>

            {/* Loading Overlay */}
            {loading && issues.length === 0 && (
                <div className="absolute inset-0 z-30 bg-slate-900/20 backdrop-blur-xs flex items-center justify-center">
                    <div className="bg-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3">
                        <Spinner size="sm" />
                        <span className="text-sm font-semibold text-slate-700">Loading live civic map...</span>
                    </div>
                </div>
            )}

            {/* Error Alert Overlay */}
            {error && (
                <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 max-w-md w-full px-4">
                    <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl shadow-lg flex items-center justify-between text-xs font-semibold">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                        <button onClick={fetchMapIssues} className="underline text-rose-800 ml-2">Retry</button>
                    </div>
                </div>
            )}

            {/* Full-Screen Leaflet Map */}
            <div className="w-full h-full flex-1 min-h-[500px] relative z-0">
                <IssueMap issues={issues} height="100%" />
            </div>

        </div>
    );
}
