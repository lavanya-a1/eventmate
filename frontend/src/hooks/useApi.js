import { useState, useEffect, useCallback } from 'react';

/**
 * Generic hook for API calls.
 *
 * Usage:
 *   const { data, loading, error, refetch } = useApi(apiFn, deps);
 *
 * @param {Function} apiFn        - () => Promise  (called on mount + when deps change)
 * @param {Array}   [deps=[]]     - dependencies that trigger a re-fetch
 * @param {*}       [initial=null]- initial value for `data`
 */
export function useApi(apiFn, deps = [], initial = null) {
    const [data, setData]       = useState(initial);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(null);

    const fetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await apiFn();
            setData(result);
        } catch (err) {
            setError(err?.response?.data?.message || err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    useEffect(() => { fetch(); }, [fetch]);

    return { data, loading, error, refetch: fetch };
}

/**
 * Hook for manual (trigger-based) API calls — e.g. form submissions.
 *
 * const { execute, loading, error, data } = useMutation(apiFn);
 * await execute(payload);
 */
export function useMutation(apiFn) {
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState(null);
    const [data, setData]       = useState(null);

    const execute = useCallback(async (...args) => {
        setLoading(true);
        setError(null);
        try {
            const result = await apiFn(...args);
            setData(result);
            return result;
        } catch (err) {
            const msg = err?.response?.data?.message || err.message || 'Something went wrong';
            setError(msg);
            throw new Error(msg);
        } finally {
            setLoading(false);
        }
    }, [apiFn]);

    return { execute, loading, error, data };
}
