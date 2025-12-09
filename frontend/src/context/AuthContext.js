import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Cek token saat startup
    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (token && userData) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(JSON.parse(userData));
        }
        setIsLoading(false);
    }, []);

    // FUNGSI INTI: LOGIN
    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });

            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));

            api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
            setUser(response.data.user);
            return response.data.user;

        } catch (error) {
            throw error.response.data.message || 'Login failed';
        }
    };

    // LOGOUT
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
    };

    // REGISTER
    const register = async (username, email, password) => {
        try {
            const response = await api.post('/auth/register', { username, email, password });
            return response.data.message;
        } catch (error) {
            throw error.response.data.message || 'Registration failed';
        }
    };

    const value = {
        user,
        isLoading,
        login,
        logout,
        register,
        isLoggedIn: !!user,
        isAdmin: user && user.role === 'ADMIN',
    };

    return (
        <AuthContext.Provider value={value}>
            {isLoading ? <h1 className="text-center" style={{ marginTop: '200px' }}>Memuat Otentikasi...</h1> : children}
        </AuthContext.Provider>
    );
};