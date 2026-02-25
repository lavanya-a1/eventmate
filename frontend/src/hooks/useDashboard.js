import { useEffect, useState } from 'react';

/**
 * Hook for handling responsive sidebar behavior
 */
export const useResponsiveSidebar = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const [isTablet, setIsTablet] = useState(window.innerWidth < 1280);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
            setIsTablet(window.innerWidth < 1280);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return { isMobile, isTablet };
};

/**
 * Hook for handling outside clicks
 */
export const useClickOutside = (ref, callback) => {
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                callback();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [ref, callback]);
};

/**
 * Hook for keyboard shortcuts
 */
export const useKeyboardShortcuts = (shortcuts) => {
    useEffect(() => {
        const handleKeyPress = (e) => {
            Object.entries(shortcuts).forEach(([key, handler]) => {
                if (
                    (key === 'Escape' && e.key === 'Escape') ||
                    (key === 'Enter' && e.key === 'Enter') ||
                    (key === 'Ctrl+K' && e.ctrlKey && e.key === 'k') ||
                    (key === 'Cmd+K' && e.metaKey && e.key === 'k')
                ) {
                    e.preventDefault();
                    handler();
                }
            });
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [shortcuts]);
};

/**
 * Hook for local storage
 */
export const useLocalStorage = (key, initialValue) => {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(error);
            return initialValue;
        }
    });

    const setValue = (value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(error);
        }
    };

    return [storedValue, setValue];
};

/**
 * Hook for managing modal state
 */
export const useModal = (initialState = false) => {
    const [isOpen, setIsOpen] = useState(initialState);

    const open = () => setIsOpen(true);
    const close = () => setIsOpen(false);
    const toggle = () => setIsOpen(!isOpen);

    return { isOpen, open, close, toggle };
};

/**
 * Hook for pagination
 */
export const usePagination = (items, itemsPerPage = 10) => {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(items.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = items.slice(startIndex, endIndex);

    const goToPage = (page) => {
        const pageNumber = Math.max(1, Math.min(page, totalPages));
        setCurrentPage(pageNumber);
    };

    const goToNextPage = () => goToPage(currentPage + 1);
    const goToPreviousPage = () => goToPage(currentPage - 1);

    return {
        currentPage,
        totalPages,
        currentItems,
        goToPage,
        goToNextPage,
        goToPreviousPage,
        isFirstPage: currentPage === 1,
        isLastPage: currentPage === totalPages,
    };
};

/**
 * Hook for debounce
 */
export const useDebounce = (value, delay = 500) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => clearTimeout(handler);
    }, [value, delay]);

    return debouncedValue;
};

/**
 * Hook for fetch data
 */
export const useFetchData = (url, options = {}) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await fetch(url, options);
                if (!response.ok) throw new Error('Failed to fetch');
                const result = await response.json();
                setData(result);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [url]);

    return { data, loading, error, setData };
};
