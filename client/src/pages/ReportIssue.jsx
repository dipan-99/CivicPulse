import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import IssueMap from '../components/IssueMap';
import { DEFAULT_MAP_CENTER, formatCoordinates } from '../utils/geo';
import { CATEGORY_LIST } from '../utils/constants';
import {
    MapPin,
    Navigation,
    AlertCircle,
    CheckCircle2,
    Image as ImageIcon,
    Send,
    Info,
    HelpCircle
} from 'lucide-react';

export default function ReportIssue() {
    const navigate = useNavigate();

    // Location state: [latitude, longitude]
    const [selectedLocation, setSelectedLocation] = useState(DEFAULT_MAP_CENTER);
    const [hasSelectedLocation, setHasSelectedLocation] = useState(false);
    const [geoLocating, setGeoLocating] = useState(false);
    const [geoNotice, setGeoNotice] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'pothole',
        imageUrl: '',
    });

    const [fieldErrors, setFieldErrors] = useState({});
    const [serverError, setServerError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Handle Geolocation with robust HTTPS / permission error handling
    const handleUseCurrentLocation = () => {
        setGeoNotice('');
        if (!navigator.geolocation) {
            setGeoNotice('Geolocation is not supported by your browser. Please click directly on the map to drop a pin.');
            return;
        }

        if (!window.isSecureContext && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            setGeoNotice('Geolocation requires a secure HTTPS connection. Please select your location directly on the map.');
            return;
        }

        setGeoLocating(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setSelectedLocation([latitude, longitude]);
                setHasSelectedLocation(true);
                setGeoLocating(false);
                setGeoNotice('Location detected successfully from browser GPS!');
                if (fieldErrors.location) {
                    setFieldErrors((prev) => ({ ...prev, location: '' }));
                }
            },
            (error) => {
                setGeoLocating(false);
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        setGeoNotice('Location permission was denied. You can easily click anywhere on the map to pin the issue.');
                        break;
                    case error.POSITION_UNAVAILABLE:
                        setGeoNotice('Location details are currently unavailable. Please click on the map to choose the spot.');
                        break;
                    case error.TIMEOUT:
                        setGeoNotice('Location request timed out. Please click on the map to mark the location.');
                        break;
                    default:
                        setGeoNotice('Unable to fetch device location. Please drop a pin on the map.');
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 30000,
            }
        );
    };

    const handleMapLocationSelect = (coords) => {
        setSelectedLocation(coords);
        setHasSelectedLocation(true);
        setGeoNotice('');
        if (fieldErrors.location) {
            setFieldErrors((prev) => ({ ...prev, location: '' }));
        }
    };

    const validate = () => {
        const errors = {};

        if (!formData.title.trim()) {
            errors.title = 'Title is required';
        } else if (formData.title.trim().length < 5) {
            errors.title = 'Title must be at least 5 characters long';
        } else if (formData.title.trim().length > 100) {
            errors.title = 'Title cannot exceed 100 characters';
        }

        if (!formData.description.trim()) {
            errors.description = 'Description is required';
        } else if (formData.description.trim().length < 10) {
            errors.description = 'Please provide more detail (minimum 10 characters)';
        } else if (formData.description.trim().length > 1000) {
            errors.description = 'Description cannot exceed 1000 characters';
        }

        if (!formData.category) {
            errors.category = 'Category selection is required';
        }

        if (formData.imageUrl.trim()) {
            try {
                new URL(formData.imageUrl.trim());
            } catch (e) {
                errors.imageUrl = 'Please enter a valid HTTP/HTTPS image URL';
            }
        }

        if (!selectedLocation || !Array.isArray(selectedLocation) || selectedLocation.length !== 2) {
            errors.location = 'Please select a location on the map';
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
            const payload = {
                title: formData.title.trim(),
                description: formData.description.trim(),
                category: formData.category,
                imageUrl: formData.imageUrl.trim(),
                latitude: selectedLocation[0],
                longitude: selectedLocation[1],
            };

            const res = await api.post('/issues', payload);
            const created = res.data.issue;
            navigate(`/issues/${created._id}?reported=1`);
        } catch (err) {
            console.error('Failed to report issue:', err);
            const msg = err.response?.data?.message || 'Failed to submit report. Please review your inputs.';
            setServerError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    <MapPin className="w-7 h-7 text-indigo-600" />
                    <span>Report a Community Issue</span>
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                    Pin the problem on the map, provide accurate details, and help your municipal authorities resolve it.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Left Column: Interactive Pin Drop Map (lg: 7 cols) */}
                <div className="lg:col-span-7 bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
                    <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                                <Navigation className="w-4 h-4 text-indigo-600" />
                                <span>Drop a Pin on the Map</span>
                            </h2>
                            <p className="text-xs text-slate-500">
                                Click anywhere on the map to pinpoint the exact location
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={handleUseCurrentLocation}
                            disabled={geoLocating}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-xl border border-indigo-200 transition-colors disabled:opacity-50"
                        >
                            <Navigation className={`w-3.5 h-3.5 ${geoLocating ? 'animate-spin' : ''}`} />
                            <span>{geoLocating ? 'Locating...' : 'Use My Current Location'}</span>
                        </button>
                    </div>

                    {/* Map Display */}
                    <div className="relative h-[420px] sm:h-[480px]">
                        <IssueMap
                            center={selectedLocation}
                            zoom={14}
                            height="100%"
                            selectable={true}
                            selectedLocation={selectedLocation}
                            onLocationSelect={handleMapLocationSelect}
                        />

                        {/* Geolocation feedback badge overlay */}
                        {geoNotice && (
                            <div className="absolute top-3 left-3 right-3 z-20 pointer-events-none">
                                <div className="pointer-events-auto bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl shadow-md border border-slate-200 text-xs text-slate-700 flex items-start gap-2">
                                    <Info className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                                    <span>{geoNotice}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Selected Coordinates Status Bar */}
                    <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-500">Selected Coordinates:</span>
                        <span className="font-mono font-bold text-indigo-600">
                            {formatCoordinates(selectedLocation)}
                        </span>
                    </div>
                </div>

                {/* Right Column: Form (lg: 5 cols) */}
                <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-2xl shadow-md border border-slate-200">

                    {serverError && (
                        <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-rose-700 text-sm">
                            <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                            <span>{serverError}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>

                        {/* Title */}
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                    Issue Title *
                                </label>
                                <span className="text-[11px] text-slate-400">
                                    {formData.title.length}/100
                                </span>
                            </div>
                            <input
                                id="issue-title"
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g. Deep pothole near 80ft road junction"
                                className={`w-full px-3.5 py-2.5 text-sm rounded-xl border ${fieldErrors.title
                                        ? 'border-rose-400 focus:ring-rose-500'
                                        : 'border-slate-300 focus:ring-indigo-500'
                                    } focus:outline-none focus:ring-2`}
                            />
                            {fieldErrors.title && (
                                <p className="mt-1 text-xs text-rose-600 font-medium">{fieldErrors.title}</p>
                            )}
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                Category *
                            </label>
                            <select
                                id="issue-category"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                            >
                                {CATEGORY_LIST.map((cat) => (
                                    <option key={cat.key} value={cat.key}>
                                        {cat.label} ({cat.description})
                                    </option>
                                ))}
                            </select>
                            {fieldErrors.category && (
                                <p className="mt-1 text-xs text-rose-600 font-medium">{fieldErrors.category}</p>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                    Description *
                                </label>
                                <span className="text-[11px] text-slate-400">
                                    {formData.description.length}/1000
                                </span>
                            </div>
                            <textarea
                                id="issue-description"
                                name="description"
                                rows={4}
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe the severity, exact landmark, and how long the issue has persisted..."
                                className={`w-full px-3.5 py-2.5 text-sm rounded-xl border ${fieldErrors.description
                                        ? 'border-rose-400 focus:ring-rose-500'
                                        : 'border-slate-300 focus:ring-indigo-500'
                                    } focus:outline-none focus:ring-2`}
                            />
                            {fieldErrors.description && (
                                <p className="mt-1 text-xs text-rose-600 font-medium">{fieldErrors.description}</p>
                            )}
                        </div>

                        {/* Optional Image URL */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                Image URL (Optional)
                            </label>
                            <div className="relative rounded-xl shadow-xs">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <ImageIcon className="w-4 h-4" />
                                </div>
                                <input
                                    id="issue-image"
                                    type="url"
                                    name="imageUrl"
                                    value={formData.imageUrl}
                                    onChange={handleChange}
                                    placeholder="https://example.com/photo.jpg"
                                    className={`w-full pl-10 pr-3.5 py-2 text-sm rounded-xl border ${fieldErrors.imageUrl
                                            ? 'border-rose-400 focus:ring-rose-500'
                                            : 'border-slate-300 focus:ring-indigo-500'
                                        } focus:outline-none focus:ring-2`}
                                />
                            </div>
                            {fieldErrors.imageUrl && (
                                <p className="mt-1 text-xs text-rose-600 font-medium">{fieldErrors.imageUrl}</p>
                            )}
                        </div>

                        {/* Image Preview if provided */}
                        {formData.imageUrl && !fieldErrors.imageUrl && (
                            <div className="relative rounded-xl overflow-hidden h-28 bg-slate-100 border border-slate-200">
                                <img
                                    src={formData.imageUrl}
                                    alt="Issue Preview"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all hover:shadow-indigo-200"
                        >
                            <Send className="w-4 h-4" />
                            <span>{submitting ? 'Submitting Report...' : 'Publish Issue Report'}</span>
                        </button>
                    </form>

                </div>
            </div>
        </div>
    );
}
