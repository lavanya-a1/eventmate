/**
 * Dashboard utility functions for handling button actions and navigation
 */

/**
 * Navigate to an internal page
 */
export const navigateTo = (path, navigate) => {
    navigate(path);
};

/**
 * Handle search functionality
 */
export const handleEventSearch = (searchTerm, navigate) => {
    if (searchTerm.trim()) {
        // Encode the search term for URL
        const encodedQuery = encodeURIComponent(searchTerm);
        navigate(`/browse?search=${encodedQuery}`);
    }
};

/**
 * Handle bookmark/save event
 */
export const handleBookmarkEvent = (eventId, isBookmarked, toast) => {
    const action = isBookmarked ? 'Bookmarked' : 'Bookmark removed';
    const message = `${action} successfully`;
    toast?.({
        title: action,
        description: message,
        duration: 3000,
    });
    return !isBookmarked;
};

/**
 * Handle ticket download
 */
export const handleDownloadTicket = (ticketId, fileName = 'ticket.pdf') => {
    // Implement download logic
    console.log(`Downloading ticket: ${ticketId}`);
    // In real app, this would call an API to generate PDF
};

/**
 * Handle QR code scanning
 */
export const handleScanQR = (navigate) => {
    navigate('/tickets?scan=true');
};

/**
 * Handle notification click
 */
export const handleNotificationClick = (notification, navigate) => {
    if (notification.actionUrl) {
        navigate(notification.actionUrl);
    }
};

/**
 * Handle mark notification as read
 */
export const handleMarkAsRead = (notificationId, api) => {
    return api.post(`/notifications/${notificationId}/read`);
};

/**
 * Handle clear all notifications
 */
export const handleClearNotifications = (api) => {
    return api.post('/notifications/clear-all');
};

/**
 * Handle profile update
 */
export const handleUpdateProfile = (formData, api) => {
    return api.put('/users/profile', formData);
};

/**
 * Handle logout
 */
export const handleLogout = (logout, navigate) => {
    logout();
    navigate('/login');
};

/**
 * Format date for display
 */
export const formatDateForDisplay = (date) => {
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    };
    return new Date(date).toLocaleDateString('en-US', options);
};

/**
 * Format time ago (e.g., "2 hours ago")
 */
export const formatTimeAgo = (date) => {
    const now = new Date();
    const then = new Date(date);
    const seconds = Math.floor((now - then) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return then.toLocaleDateString();
};

/**
 * Truncate text
 */
export const truncateText = (text, maxLength = 50) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

/**
 * Format event price
 */
export const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(price);
};

/**
 * Get event status badge color
 */
export const getEventStatusColor = (status) => {
    const colors = {
        upcoming: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        ongoing: 'bg-green-500/20 text-green-400 border-green-500/30',
        completed: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
        cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return colors[status?.toLowerCase()] || colors.upcoming;
};

/**
 * Handle responsive menu toggle
 */
export const handleMenuToggle = (isOpen, setIsOpen, breakpoint = 1024) => {
    if (window.innerWidth < breakpoint) {
        setIsOpen(!isOpen);
    } else {
        setIsOpen(!isOpen);
    }
};
