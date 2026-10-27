import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowLeft, Radio } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-4 sm:px-6">
      <div className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-6 shadow-sm">
        <Radio className="w-8 h-8 animate-pulse" />
      </div>

      <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mb-3">
        404 Error
      </span>

      <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
        Civic Report Not Found
      </h1>

      <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
        The community issue report or page you requested could not be located. It may have been resolved, archived, or moved.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition"
        >
          <MapPin className="w-4 h-4" />
          <span>Interactive Map</span>
        </Link>
        <Link
          to="/issues"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold shadow-xs transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Browse All Issues</span>
        </Link>
      </div>
    </div>
  );
}
