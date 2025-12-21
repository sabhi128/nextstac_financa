import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockDataService } from '../services/mockDataService';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for persisted user session
        const storedUser = localStorage.getItem('erp_user_session');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error('Failed to parse user session', error);
                localStorage.removeItem('erp_user_session');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // Get users from mock service (RBAC)
        const users = mockDataService.getUsers();
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            const sessionUser = {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role, // 'super_admin', 'ecommerce_admin', 'dev_admin'
                permissions: ['all'], // Simplified permissions for now
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`
            };

            setUser(sessionUser);
            localStorage.setItem('erp_user_session', JSON.stringify(sessionUser));
            return { success: true };
        }

        return { success: false, error: 'Invalid credentials' };
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('erp_user_session');
        window.location.href = '/login';
    };

    const value = {
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin'
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
