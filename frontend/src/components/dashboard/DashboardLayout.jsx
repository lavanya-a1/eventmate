import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import TopNavbar from './TopNavbar';
import { useTheme } from '../../admin/context/AdminThemeContext';

export default function DashboardLayout() {
    const location = useLocation();

    const { theme, toggleTheme } = useTheme();
    const isDarkMode = theme === 'dark';
    const setIsDarkMode = useCallback((val) => {
        const next = typeof val === 'function' ? val(isDarkMode) : val;
        if (next !== isDarkMode) toggleTheme();
    }, [isDarkMode, toggleTheme]);

    const [showSearchModal, setShowSearchModal] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    // Close modals on Escape
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                setShowSearchModal(false);
                setShowNotifications(false);
                setShowProfileMenu(false);
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, []);

    // Close modals on route change
    useEffect(() => {
        setShowSearchModal(false);
        setShowNotifications(false);
        setShowProfileMenu(false);
    }, [location.pathname]);

    const contextValue = React.useMemo(() => ({
        showSearchModal, setShowSearchModal,
        showNotifications, setShowNotifications,
        showProfileMenu, setShowProfileMenu,
        isDarkMode, setIsDarkMode,
    }), [showSearchModal, showNotifications, showProfileMenu, isDarkMode]);

    return (
        <div className="flex flex-col min-h-screen w-full text-white overflow-x-hidden"
             style={{ backgroundColor: 'var(--app-bg)', color: 'var(--app-text)', transition: 'background-color 0.3s, color 0.3s' }}>
            {/* Background decor */}
            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] pointer-events-none -z-10"
                 style={{ backgroundColor: 'var(--app-blob1)' }} />
            <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] pointer-events-none -z-10"
                 style={{ backgroundColor: 'var(--app-blob2)' }} />

            {/* Top Navbar (contains all nav links) */}
            <TopNavbar
                showSearchModal={showSearchModal}
                setShowSearchModal={setShowSearchModal}
                showNotifications={showNotifications}
                setShowNotifications={setShowNotifications}
                showProfileMenu={showProfileMenu}
                setShowProfileMenu={setShowProfileMenu}
                isDarkMode={isDarkMode}
                setIsDarkMode={setIsDarkMode}
            />

            {/* Page content */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 custom-scrollbar">
                <div className="max-w-[1400px] mx-auto w-full">
                    <Outlet context={contextValue} />
                </div>
            </main>
        </div>
    );
}
