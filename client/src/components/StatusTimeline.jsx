import React from 'react';
import StatusBadge from './StatusBadge';
import { STATUSES } from '../utils/constants';
import { Clock, User, ShieldCheck, MessageSquareQuote } from 'lucide-react';

export default function StatusTimeline({ history = [] }) {
  if (!history || history.length === 0) {
    return (
      <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-500">
        No status update timeline recorded yet.
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
      {history.map((entry, index) => {
        const statusConfig = STATUSES[entry.status] || STATUSES.open;
        const entryDate = new Date(entry.date || entry.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });

        const updater = entry.updatedBy || {};
        const isAdmin = updater.role === 'admin';

        return (
          <div key={entry._id || index} className="relative group">
            
            {/* Timeline bullet icon */}
            <div
              className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 border-white shadow-xs flex items-center justify-center ${statusConfig.dotClass}`}
            />

            {/* Entry content card */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <StatusBadge status={entry.status} size="xs" />

                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Clock className="w-3 h-3" />
                  <span>{entryDate}</span>
                </div>
              </div>

              {/* Comment text */}
              <div className="flex items-start gap-2 pt-1 text-xs text-slate-700">
                <MessageSquareQuote className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                <p className="font-medium leading-relaxed italic">
                  "{entry.comment}"
                </p>
              </div>

              {/* Updated By user */}
              <div className="flex items-center gap-1.5 pt-1 text-[11px] text-slate-500 border-t border-slate-200/60">
                {isAdmin ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                ) : (
                  <User className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>
                  Updated by{' '}
                  <span className="font-semibold text-slate-800">
                    {updater.name || 'System Admin'}
                  </span>
                  {isAdmin && (
                    <span className="ml-1 text-[10px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">
                      ADMIN
                    </span>
                  )}
                </span>
              </div>
            </div>

          </div>
        );
      })}
    </div>
  );
}
