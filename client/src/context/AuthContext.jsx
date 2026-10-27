import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem('civicpulse_token'));
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('civicpulse_user');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                return null;
            }
        }
        return null;
    });
    const [loading, setLoading] = useState(true);

    // Initialize and verify user on mount or token change
    const fetchCurrentUser = useCallback(async () => {
        const storedToken = localStorage.getItem('civicpulse_token');
        if (!storedToken) {
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            const res = await api.get('/auth/me');
            setUser(res.data.user);
            localStorage.setItem('civicpulse_user', JSON.stringify(res.data.user));
        } catch (err) {
            console.warn('[CivicPulse Auth] Token invalid or expired, resetting session.');
            localStorage.removeItem('civicpulse_token');
            localStorage.removeItem('civicpulse_user');
            setToken(null);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCurrentUser();
    }, [fetchCurrentUser]);

    // Login handler
    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        const { token: receivedToken, user: receivedUser } = res.data;
        localStorage.setItem('civicpulse_token', receivedToken);
        localStorage.setItem('civicpulse_user', JSON.stringify(receivedUser));
        setToken(receivedToken);
        setUser(receivedUser);
        return receivedUser;
    };

    // Register handler
    const register = async (name, email, password) => {
        const res = await api.post('/auth/register', { name, email, password });
        const { token: receivedToken, user: receivedUser } = res.data;
        localStorage.setItem('civicpulse_token', receivedToken);
        localStorage.setItem('civicpulse_user', JSON.stringify(receivedUser));
        setToken(receivedToken);
        setUser(receivedUser);
        return receivedUser;
    };

    // Logout handler
    const logout = () => {
        localStorage.removeItem('civicpulse_token');
        localStorage.removeItem('civicpulse_user');
        setToken(null);
        setUser(null);
    };

    const value = {
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        refreshUser: fetchCurrentUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
