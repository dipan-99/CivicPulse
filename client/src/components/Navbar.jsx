import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  MapPin, 
  ListFilter, 
  PlusCircle, 
  FileText, 
  ShieldCheck, 
  LogOut, 
  LogIn, 
  UserPlus, 
  Menu, 
  X,
  Radio
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const navLinkClasses = ({ isActive }) =>
    `inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
      isActive
        ? 'bg-indigo-50 text-indigo-700 shadow-sm'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  const mobileNavLinkClasses = ({ isActive }) =>
    `flex items-center gap-2.5 px-4 py-3 rounded-lg text-base font-medium transition-all ${
      isActive
        ? 'bg-indigo-50 text-indigo-700 font-semibold'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-1">
                Civic<span className="text-indigo-600">Pulse</span>
              </span>
              <p className="text-[10px] text-slate-400 font-medium -mt-1 hidden sm:block">
                Community Issue Reporter
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/" end className={navLinkClasses}>
              <MapPin className="w-4 h-4 text-indigo-500" />
              <span>Map</span>
            </NavLink>
            <NavLink to="/issues" className={navLinkClasses}>
              <ListFilter className="w-4 h-4 text-slate-500" />
              <span>Issues</span>
            </NavLink>
            <NavLink to="/report" className={navLinkClasses}>
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              <span>Report Issue</span>
            </NavLink>
            {isAuthenticated && (
              <NavLink to="/my-reports" className={navLinkClasses}>
                <FileText className="w-4 h-4 text-blue-500" />
                <span>My Reports</span>
              </NavLink>
            )}
            {isAdmin && (
              <NavLink to="/admin" className={({ isActive }) =>
                `inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-purple-100 text-purple-800 shadow-sm ring-1 ring-purple-300'
                    : 'text-purple-700 bg-purple-50 hover:bg-purple-100'
                }`
              }>
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <span>Admin Dashboard</span>
              </NavLink>
            )}
          </div>

          {/* Desktop User Profile / Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
                  <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center font-bold text-slate-700 text-xs">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-900 leading-tight">
                      {user?.name}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                      isAdmin ? 'text-purple-600' : 'text-slate-400'
                    }`}>
                      {user?.role}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Log In</span>
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm hover:shadow transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-5 space-y-1 shadow-lg">
          <NavLink to="/" end onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClasses}>
            <MapPin className="w-5 h-5 text-indigo-500" />
            <span>Map</span>
          </NavLink>
          <NavLink to="/issues" onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClasses}>
            <ListFilter className="w-5 h-5 text-slate-500" />
            <span>Browse Issues</span>
          </NavLink>
          <NavLink to="/report" onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClasses}>
            <PlusCircle className="w-5 h-5 text-emerald-600" />
            <span>Report an Issue</span>
          </NavLink>
          {isAuthenticated && (
            <NavLink to="/my-reports" onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClasses}>
              <FileText className="w-5 h-5 text-blue-500" />
              <span>My Reports</span>
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin" onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClasses}>
              <ShieldCheck className="w-5 h-5 text-purple-600" />
              <span>Admin Dashboard</span>
            </NavLink>
          )}

          <div className="pt-3 border-t border-slate-100">
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-2 py-1">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
                    <p className="text-xs text-slate-400 capitalize">{user?.role} • {user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Log In</span>
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
