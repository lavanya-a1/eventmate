import React from 'react';

/**
 * PageWrapper component ensures consistent spacing and layout for all dashboard pages
 * Automatically adapts to sidebar state and responsive breakpoints
 */
export default function PageWrapper({ 
    children, 
    title, 
    description,
    maxWidth = 'max-w-[1400px]',
    className = ''
}) {
    return (
        <div className={`space-y-8 animate-fade-in pb-20 ${className}`}>
            {/* Page Header */}
            {(title || description) && (
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {(title || description) && (
                        <div>
                            {title && <h1 className="text-3xl font-bold text-theme">{title}</h1>}
                            {description && <p className="text-slate-400 mt-1">{description}</p>}
                        </div>
                    )}
                </div>
            )}

            {/* Page Content */}
            <div className={maxWidth}>
                {children}
            </div>
        </div>
    );
}
