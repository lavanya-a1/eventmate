import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkLoggedIn = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const res = await api.get('/auth/me');
                    setUser(res.data.data);
                } catch (err) {
                    localStorage.removeItem('token');
                    setUser(null);
                }
            }
            setLoading(false);
        };
        checkLoggedIn();
    }, []);

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('refreshToken', res.data.refreshToken);
        setUser(res.data.user);
        return res.data;
    };

    const loginWithTokens = async (token, refreshToken) => {
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
        const res = await api.get('/auth/me');
        setUser(res.data.data);
    };

    const register = async ({ name, email, password }) => {
        const res = await api.post('/auth/register', { name, email, password });
        return res.data;
    };

    const logout = async () => {
        const refreshToken = localStorage.getItem('refreshToken');
        try {
            await api.post('/auth/logout', { refreshToken });
        } catch {
            // Ignore errors — we clear local state regardless
        }
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, loading, login, loginWithTokens, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
