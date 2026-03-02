import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('ntk_user')) || null;
        } catch {
            return null;
        }
    });

    const [isServerAwake, setIsServerAwake] = useState(true); // Default to true
    const [isCheckingServer, setIsCheckingServer] = useState(false);

    // Initial server wakeup
    useEffect(() => {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        
        // Skip check if we're on localhost
        if (apiUrl.includes('localhost')) return;

        setIsCheckingServer(true);
        setIsServerAwake(false); // Assume it might be asleep on cold start

        axios.get(`${apiUrl}/api/health`, { timeout: 60000 })
            .then(() => {
                setIsServerAwake(true);
            })
            .catch(() => {
                // If it fails, maybe it's just slow - but we tried
            })
            .finally(() => {
                setIsCheckingServer(false);
            });
    }, []);

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
        <AuthContext.Provider value={{
            user, login, logout, 
            isLoggedIn: !!user,
            isServerAwake, isCheckingServer
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
};
