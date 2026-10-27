import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import IssueMap from '../components/IssueMap';
import StatusBadge from '../components/StatusBadge';
import CategoryBadge from '../components/CategoryBadge';
import StatusTimeline from '../components/StatusTimeline';
import Spinner from '../components/Spinner';
import { toLeafletCoords, formatCoordinates } from '../utils/geo';
import { 
  ThumbsUp, 
  MapPin, 
  Calendar, 
  User, 
  ArrowLeft, 
  ShieldCheck, 
  Send, 
  CheckCircle, 
  AlertCircle 
} from 'lucide-react';

export default function IssueDetail() {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const [searchParams] = useSearchParams();

  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Admin status update form state
  const [newStatus, setNewStatus] = useState('in_progress');
  const [statusComment, setStatusComment] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusActionMessage, setStatusActionMessage] = useState('');
  const [statusActionError, setStatusActionError] = useState('');

  const isNewlyReported = searchParams.get('reported') === '1';

  const fetchIssue = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/issues/${id}`);
      setIssue(res.data);
      if (res.data.status) {
        setNewStatus(res.data.status === 'open' ? 'in_progress' : res.data.status);
      }
    } catch (err) {
      console.error('Failed to load issue details:', err);
      setError('Unable to find or load the requested issue report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssue();
  }, [id]);

  // Handle upvote toggle
  const handleUpvote = async () => {
    if (!user) {
      window.location.href = `/login?from=/issues/${id}`;
      return;
    }

    try {
      const res = await api.post(`/issues/${id}/upvote`);
      const { upvoted, upvotesCount } = res.data;

      setIssue((prev) => {
        let newUpvotes = Array.isArray(prev.upvotes) ? [...prev.upvotes] : [];
        if (upvoted) {
          newUpvotes.push(user._id);
        } else {
          newUpvotes = newUpvotes.filter((uid) => (uid._id || uid).toString() !== user._id.toString());
        }
        return {
          ...prev,
          upvotes: newUpvotes,
          upvotesCount,
        };
      });
    } catch (err) {
      console.error('Upvote failed:', err);
    }
  };

  // Admin submit status change
  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!statusComment.trim()) {
      setStatusActionError('Please enter a comment explaining the status change.');
      return;
    }

    setUpdatingStatus(true);
    setStatusActionError('');
    setStatusActionMessage('');

    try {
      const res = await api.patch(`/issues/${id}/status`, {
        status: newStatus,
        comment: statusComment.trim(),
      });
      setIssue(res.data.issue);
      setStatusComment('');
      setStatusActionMessage(`Status successfully updated to ${newStatus}!`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update status.';
      setStatusActionError(msg);
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex items-center justify-center">
        <Spinner size="lg" text="Loading issue details..." />
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Issue Not Found</h2>
        <p className="mt-1 text-sm text-slate-500">{error || 'This report may have been removed or does not exist.'}</p>
        <Link
          to="/issues"
          className="mt-6 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Issues</span>
        </Link>
      </div>
    );
  }

  const coords = toLeafletCoords(issue.location?.coordinates);
  const upvotesCount = Array.isArray(issue.upvotes) ? issue.upvotes.length : issue.upvotesCount || 0;
  const hasUpvoted = user
    ? Array.isArray(issue.upvotes) &&
      issue.upvotes.some((uid) => (uid._id || uid).toString() === user._id.toString())
    : false;

  const formattedDate = new Date(issue.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Navigation Breadcrumb */}
      <div className="mb-6">
        <Link
          to="/issues"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to all issues</span>
        </Link>
      </div>

      {/* Success Notification for Newly Reported Issue */}
      {isNewlyReported && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-sm">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <div>
            <p className="font-bold">Your report has been successfully submitted!</p>
            <p className="text-xs text-emerald-700 mt-0.5">
              Municipal authorities and community members can now see it on the public map.
            </p>
          </div>
        </div>
      )}

      {/* Main Issue Card Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Optional Big Image Banner */}
        {issue.imageUrl && (
          <div className="w-full max-h-96 overflow-hidden bg-slate-900 flex items-center justify-center">
            <img
              src={issue.imageUrl}
              alt={issue.title}
              className="w-full h-full max-h-96 object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Top Badges & Upvote Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <CategoryBadge category={issue.category} size="md" />
              <StatusBadge status={issue.status} size="md" />
            </div>

            {/* Upvote Button */}
            <button
              onClick={handleUpvote}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm shadow-xs transition-all ${
                hasUpvoted
                  ? 'bg-indigo-600 text-white shadow-indigo-200'
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
              }`}
            >
              <ThumbsUp className={`w-4 h-4 ${hasUpvoted ? 'fill-current' : ''}`} />
              <span>{upvotesCount} Upvotes</span>
              <span className="text-xs opacity-75 font-normal">
                {hasUpvoted ? '(Upvoted)' : '(Click to upvote)'}
              </span>
            </button>
          </div>

          {/* Title */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
              {issue.title}
            </h1>
            
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1 font-medium text-slate-700">
                <User className="w-4 h-4 text-slate-400" />
                <span>Reported by {issue.createdBy?.name || 'Citizen'}</span>
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>{formattedDate}</span>
              </span>
              <span className="flex items-center gap-1 text-indigo-600 font-mono">
                <MapPin className="w-4 h-4" />
                <span>{formatCoordinates(issue.location?.coordinates)}</span>
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-100 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {issue.description}
          </div>

          {/* Mini Single-Pin Map */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-indigo-600" />
              <span>Exact Location</span>
            </h3>
            <div className="h-64 rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
              <IssueMap
                issues={[issue]}
                center={coords}
                zoom={15}
                height="100%"
                singleIssueMode={true}
              />
            </div>
          </div>

          {/* Status History Timeline */}
          <div className="pt-6 border-t border-slate-200">
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <span>Status Workflow & Admin Review Trail</span>
            </h3>
            <StatusTimeline history={issue.statusHistory} />
          </div>

          {/* Admin Workflow Action Panel (Admin only) */}
          {isAdmin && (
            <div className="mt-8 p-6 bg-purple-50/70 rounded-2xl border border-purple-200 space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-700" />
                <h3 className="text-sm font-bold text-purple-900 uppercase tracking-wider">
                  Admin Status Update Control
                </h3>
              </div>
              <p className="text-xs text-purple-700">
                As an authorized administrator, you can transition this issue between Open, In Progress, and Resolved. A clear comment is mandatory.
              </p>

              {statusActionError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                  {statusActionError}
                </div>
              )}

              {statusActionMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold">
                  {statusActionMessage}
                </div>
              )}

              <form onSubmit={handleStatusSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-purple-900 mb-1">
                      New Status
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-purple-300 bg-white text-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="open">Open (Re-open report)</option>
                      <option value="in_progress">In Progress (Dispatch crew)</option>
                      <option value="resolved">Resolved (Fix verified)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-purple-900 mb-1">
                    Administrative Comment *
                  </label>
                  <textarea
                    rows={2}
                    value={statusComment}
                    onChange={(e) => setStatusComment(e.target.value)}
                    placeholder="e.g. BBMP Ward inspection completed; pothole patched with hot asphalt mix."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={updatingStatus}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl shadow-xs transition disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{updatingStatus ? 'Saving Status...' : 'Apply Status Update'}</span>
                </button>
              </form>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
