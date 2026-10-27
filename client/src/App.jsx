import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

import Home from './pages/Home';
import IssueList from './pages/IssueList';
import IssueDetail from './pages/IssueDetail';
import ReportIssue from './pages/ReportIssue';
import MyReports from './pages/MyReports';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <ToastProvider>
                    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
                        <Navbar />
                        <main className="flex-1 flex flex-col min-h-0">
                            <Routes>
                                {/* Public Routes */}
                                <Route path="/" element={<Home />} />
                                <Route path="/issues" element={<IssueList />} />
                                <Route path="/issues/:id" element={<IssueDetail />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />

                                {/* Citizen Protected Routes */}
                                <Route
                                    path="/report"
                                    element={
                                        <ProtectedRoute>
                                            <ReportIssue />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/my-reports"
                                    element={
                                        <ProtectedRoute>
                                            <MyReports />
                                        </ProtectedRoute>
                                    }
                                />

                                {/* Admin-Only Protected Routes */}
                                <Route
                                    path="/admin"
                                    element={
                                        <AdminRoute>
                                            <AdminDashboard />
                                        </AdminRoute>
                                    }
                                />

                                {/* 404 Fallback */}
                                <Route path="*" element={<NotFound />} />
                            </Routes>
                        </main>
                    </div>
                </ToastProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}
