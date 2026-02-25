/**
 * Template for creating new dashboard pages with persistent sidebar
 * Copy this file and modify as needed for new pages
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper, Card, Button, Badge } from '../components/ui';
import { useDashboardLayout } from '../hooks/useDashboardLayout';
import { ArrowRight } from 'lucide-react';

/**
 * Example Page Template
 * 
 * Features:
 * - Persistent sidebar (automatically managed by DashboardLayout)
 * - Responsive layout (works on all screen sizes)
 * - Route change handlers (modals close, mobile sidebar closes)
 * - Layout context access (if needed)
 */
export default function DashboardPageTemplate() {
    const navigate = useNavigate();
    const { sidebarOpen, isDarkMode, setShowNotifications } = useDashboardLayout();
    
    // Page-specific state
    const [isLoading, setIsLoading] = useState(false);
    const [items, setItems] = useState([
        { id: 1, title: 'Item 1', description: 'Description 1' },
        { id: 2, title: 'Item 2', description: 'Description 2' },
    ]);

    /**
     * Handle item click - navigate to details page
     */
    const handleItemClick = (itemId) => {
        navigate(`/path/${itemId}`);
        // Sidebar and modals automatically managed by DashboardLayout
    };

    /**
     * Handle action button
     */
    const handleAction = async () => {
        setIsLoading(true);
        try {
            // API call here
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <PageWrapper 
            title="Page Title"
            description="This is what your page is about"
        >
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Content Card */}
                    <Card>
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-white">Section Title</h3>
                            <p className="text-slate-400">
                                This is your main content area. It will adapt to the sidebar state 
                                and remain persistent across navigation.
                            </p>
                        </div>
                    </Card>

                    {/* Items List */}
                    <div className="space-y-4">
                        {items.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => handleItemClick(item.id)}
                                className="w-full text-left hover-scale"
                                title={`View ${item.title}`}
                            >
                                <Card className="transition-all">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-bold text-white hover:text-primary-400 transition-colors">
                                                {item.title}
                                            </h4>
                                            <p className="text-sm text-slate-400 mt-1">
                                                {item.description}
                                            </p>
                                        </div>
                                        <ArrowRight className="text-primary-400 flex-shrink-0" />
                                    </div>
                                </Card>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Column - Sidebar Info */}
                <div className="space-y-6">
                    {/* Info Card */}
                    <Card>
                        <h4 className="font-bold text-white mb-4">Quick Info</h4>
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider">Status</p>
                                <p className="text-white font-semibold mt-1">Active</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider">Theme</p>
                                <p className="text-white font-semibold mt-1">
                                    {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider">Sidebar</p>
                                <p className="text-white font-semibold mt-1">
                                    {sidebarOpen ? 'Expanded' : 'Collapsed'}
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* Action Card */}
                    <Card>
                        <h4 className="font-bold text-white mb-4">Actions</h4>
                        <div className="space-y-2">
                            <Button 
                                onClick={handleAction}
                                disabled={isLoading}
                                className="w-full"
                            >
                                {isLoading ? 'Loading...' : 'Do Something'}
                            </Button>
                            <Button 
                                onClick={() => setShowNotifications(true)}
                                variant="secondary"
                                className="w-full"
                            >
                                Show Notifications
                            </Button>
                        </div>
                    </Card>

                    {/* Badge Examples */}
                    <Card>
                        <h4 className="font-bold text-white mb-4">Tags</h4>
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="primary">Primary</Badge>
                            <Badge variant="success">Success</Badge>
                            <Badge variant="warning">Warning</Badge>
                        </div>
                    </Card>
                </div>
            </div>
        </PageWrapper>
    );
}

/**
 * Key Points for New Pages:
 * 
 * 1. Sidebar Management:
 *    - Sidebar persists automatically
 *    - No need to manage sidebar state in pages
 *    - Access via useDashboardLayout hook if needed
 * 
 * 2. Navigation:
 *    - Use useNavigate() for programmatic navigation
 *    - Modals automatically close on route change
 *    - Mobile sidebar automatically closes on route change
 *    - Desktop sidebar stays open
 * 
 * 3. Spacing:
 *    - Use PageWrapper for consistent header
 *    - Content inside has proper padding
 *    - pb-20 in wrapper prevents overlap
 *    - Use grid/flex for responsive layouts
 * 
 * 4. Responsive:
 *    - Mobile: Single column
 *    - Tablet: Two columns
 *    - Desktop: Three columns
 *    - All components adjust automatically
 * 
 * 5. Performance:
 *    - Context is memoized to prevent re-renders
 *    - Route changes handled efficiently
 *    - Minimize state in individual pages
 *    - Use useCallback for event handlers
 * 
 * 6. Accessibility:
 *    - Add title attributes to buttons
 *    - Use semantic HTML
 *    - Add aria-labels where needed
 *    - Keyboard navigation support
 */
