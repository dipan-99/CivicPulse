import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import CategoryBadge from './CategoryBadge';
import { ThumbsUp, MapPin, Calendar, User, ArrowRight } from 'lucide-react';

export default function IssueCard({ issue, onUpvote, currentUserId }) {
  const upvotesCount = Array.isArray(issue.upvotes)
    ? issue.upvotes.length
    : issue.upvotesCount || 0;

  const hasUpvoted = currentUserId
    ? Array.isArray(issue.upvotes) &&
      issue.upvotes.some((id) => (id._id || id).toString() === currentUserId.toString())
    : false;

  const formattedDate = new Date(issue.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      <div>
        {/* Optional Image Banner */}
        {issue.imageUrl && (
          <div className="w-full h-44 overflow-hidden bg-slate-100 relative">
            <img
              src={issue.imageUrl}
              alt={issue.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div className="absolute top-3 right-3">
              <StatusBadge status={issue.status} size="sm" />
            </div>
          </div>
        )}

        <div className="p-5">
          {/* Badges Bar (if no image, show status here) */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <CategoryBadge category={issue.category} size="xs" />
            {!issue.imageUrl && <StatusBadge status={issue.status} size="xs" />}
          </div>

          {/* Title */}
          <Link to={`/issues/${issue._id}`} className="block group-hover:text-indigo-600 transition-colors">
            <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2">
              {issue.title}
            </h3>
          </Link>

          {/* Description */}
          <p className="mt-2 text-xs text-slate-500 line-clamp-3 leading-relaxed">
            {issue.description}
          </p>
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-5 py-3.5 bg-slate-50/75 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        
        {/* Reporter info and date */}
        <div className="flex flex-col gap-0.5">
          <span className="flex items-center gap-1 font-medium text-slate-700">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate max-w-[120px]">{issue.createdBy?.name || 'Citizen'}</span>
          </span>
          <span className="flex items-center gap-1 text-[11px] text-slate-400">
            <Calendar className="w-3 h-3" />
            <span>{formattedDate}</span>
          </span>
        </div>

        {/* Upvote & View Details */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              if (onUpvote) onUpvote(issue._id);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
              hasUpvoted
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:border-indigo-300 hover:text-indigo-600'
            }`}
            title={hasUpvoted ? 'Remove upvote' : 'Upvote issue'}
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${hasUpvoted ? 'fill-current' : ''}`} />
            <span>{upvotesCount}</span>
          </button>

          <Link
            to={`/issues/${issue._id}`}
            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-200/60 rounded-lg transition-colors"
            title="View details"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
