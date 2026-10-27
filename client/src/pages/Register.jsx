import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Eye, EyeOff, Radio, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [serverError, setServerError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const validate = () => {
        const errors = {};
        if (!formData.name.trim()) {
            errors.name = 'Full name is required';
        } else if (formData.name.trim().length < 2) {
            errors.name = 'Name must be at least 2 characters';
        } else if (formData.name.trim().length > 60) {
            errors.name = 'Name cannot exceed 60 characters';
        }

        if (!formData.email.trim()) {
            errors.email = 'Email address is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }

        if (!formData.password) {
            errors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters long';
        }

        if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (fieldErrors[name]) {
            setFieldErrors((prev) => ({ ...prev, [name]: '' }));
        }
        if (serverError) setServerError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setSubmitting(true);
        setServerError('');

        try {
            await register(formData.name, formData.email, formData.password);
            navigate('/', { replace: true });
        } catch (err) {
            const msg = err.response?.data?.message || 'Registration failed. Please check your details and try again.';
            setServerError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
            <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">

                {/* Header */}
                <div className="text-center">
                    <div className="mx-auto w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-300">
                        <Radio className="w-6 h-6 animate-pulse" />
                    </div>
                    <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                        Create an Account
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                        Join your community to report local issues and improve civic infrastructure
                    </p>
                </div>

                {/* Server Error Alert */}
                {serverError && (
                    <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-700 text-sm">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-500" />
                        <span>{serverError}</span>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
                    {/* Full Name */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                            Full Name
                        </label>
                        <div className="relative rounded-xl shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <User className="w-4 h-4" />
                            </div>
                            <input
                                id="register-name"
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Aarav Sharma"
                                className={`block w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border ${fieldErrors.name
                                        ? 'border-rose-400 focus:ring-rose-500 focus:border-rose-500'
                                        : 'border-slate-300 focus:ring-indigo-500 focus:border-indigo-500'
                                    } bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2`}
                            />
                        </div>
                        {fieldErrors.name && (
                            <p className="mt-1 text-xs text-rose-600 font-medium">{fieldErrors.name}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                            Email Address
                        </label>
                        <div className="relative rounded-xl shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <Mail className="w-4 h-4" />
                            </div>
                            <input
                                id="register-email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="aarav@example.com"
                                className={`block w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border ${fieldErrors.email
                                        ? 'border-rose-400 focus:ring-rose-500 focus:border-rose-500'
                                        : 'border-slate-300 focus:ring-indigo-500 focus:border-indigo-500'
                                    } bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2`}
                            />
                        </div>
                        {fieldErrors.email && (
                            <p className="mt-1 text-xs text-rose-600 font-medium">{fieldErrors.email}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                            Password
                        </label>
                        <div className="relative rounded-xl shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <Lock className="w-4 h-4" />
                            </div>
                            <input
                                id="register-password"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="At least 6 characters"
                                className={`block w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border ${fieldErrors.password
                                        ? 'border-rose-400 focus:ring-rose-500 focus:border-rose-500'
                                        : 'border-slate-300 focus:ring-indigo-500 focus:border-indigo-500'
                                    } bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {fieldErrors.password && (
                            <p className="mt-1 text-xs text-rose-600 font-medium">{fieldErrors.password}</p>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                            Confirm Password
                        </label>
                        <div className="relative rounded-xl shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <Lock className="w-4 h-4" />
                            </div>
                            <input
                                id="register-confirm-password"
                                type={showPassword ? 'text' : 'password'}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Re-enter your password"
                                className={`block w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border ${fieldErrors.confirmPassword
                                        ? 'border-rose-400 focus:ring-rose-500 focus:border-rose-500'
                                        : 'border-slate-300 focus:ring-indigo-500 focus:border-indigo-500'
                                    } bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2`}
                            />
                        </div>
                        {fieldErrors.confirmPassword && (
                            <p className="mt-1 text-xs text-rose-600 font-medium">{fieldErrors.confirmPassword}</p>
                        )}
                    </div>

                    {/* Role Disclosure Note */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 text-xs text-slate-500">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span>Public registration creates standard Citizen accounts.</span>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all hover:shadow-indigo-200"
                    >
                        {submitting ? (
                            <span>Creating account...</span>
                        ) : (
                            <>
                                <span>Register as Citizen</span>
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>

                {/* Login Link */}
                <p className="text-center text-sm text-slate-500">
                    Already have an account?{' '}
                    <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
                        Sign in
                    </Link>
                </p>

            </div>
        </div>
    );
}
