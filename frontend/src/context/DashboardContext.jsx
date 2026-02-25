import React, { createContext, useContext, useState } from 'react';

const DashboardContext = createContext();

export const useDashboard = () => {
    const context = useContext(DashboardContext);
    if (!context) {
        throw new Error('useDashboard must be used within DashboardProvider');
    }
    return context;
};

export function DashboardProvider({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const openSearch = () => setShowSearchModal(true);
    const closeSearch = () => setShowSearchModal(false);

    const openNotifications = () => setShowNotifications(true);
    const closeNotifications = () => setShowNotifications(false);

    const openProfileMenu = () => setShowProfileMenu(true);
    const closeProfileMenu = () => setShowProfileMenu(false);

    const toggleTheme = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        // Apply theme to document
        if (!newMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        // Store preference
        localStorage.setItem('theme-mode', newMode ? 'dark' : 'light');
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
        // Implement search functionality
        console.log('Searching for:', query);
    };

    return (
        <DashboardContext.Provider
            value={{
                sidebarOpen,
                setSidebarOpen,
                showSearchModal,
                setShowSearchModal,
                openSearch,
                closeSearch,
                showNotifications,
                setShowNotifications,
                openNotifications,
                closeNotifications,
                showProfileMenu,
                setShowProfileMenu,
                openProfileMenu,
                closeProfileMenu,
                isDarkMode,
                setIsDarkMode,
                toggleTheme,
                searchQuery,
                setSearchQuery,
                handleSearch,
            }}
        >
            {children}
        </DashboardContext.Provider>
    );
}
