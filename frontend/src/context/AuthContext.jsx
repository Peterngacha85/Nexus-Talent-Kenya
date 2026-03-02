import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('ntk_user')) || null;
        } catch {
            return null;
        }
    });

    const login = (userData) => {
        // Always preserve the existing token if the new data doesn't include one
        const existing = JSON.parse(localStorage.getItem('ntk_user') || 'null');
        const merged = (existing?.token && !userData.token)
            ? { ...userData, token: existing.token }
            : userData;
        localStorage.setItem('ntk_user', JSON.stringify(merged));
        setUser(merged);
    };

    const logout = () => {
        localStorage.removeItem('ntk_user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoggedIn: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
};
