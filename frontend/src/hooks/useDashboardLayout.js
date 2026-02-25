import { useOutletContext } from 'react-router-dom';

/**
 * Hook to access the Dashboard layout context from any child page
 * Returns all layout state and setters
 */
export const useDashboardLayout = () => {
    const context = useOutletContext();
    
    if (!context) {
        console.warn('useDashboardLayout must be used within DashboardLayout routes');
        return {
            sidebarOpen: false,
            setSidebarOpen: () => {},
            showSearchModal: false,
            setShowSearchModal: () => {},
            showNotifications: false,
            setShowNotifications: () => {},
            showProfileMenu: false,
            setShowProfileMenu: () => {},
            isDarkMode: true,
            setIsDarkMode: () => {},
        };
    }
    
    return context;
};
