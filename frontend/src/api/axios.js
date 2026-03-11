import axios from 'axios';

const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://eventmate-hmtf.onrender.com/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // send cookies (httpOnly refresh token + CSRF cookie)
});

/**
 * Read a cookie value by name (for the non-httpOnly CSRF cookie).
 */
function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
}

// Add a request interceptor to include auth token + CSRF header
instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Attach CSRF token for state-changing requests
        if (['post', 'put', 'patch', 'delete'].includes(config.method)) {
            const csrfToken = getCookie('csrf_token');
            if (csrfToken) {
                config.headers['X-CSRF-Token'] = csrfToken;
            }
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Track whether a refresh is already in progress to avoid duplicate refreshes
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

instance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Only attempt refresh for TOKEN_EXPIRED responses (not other 401s)
        if (
            error.response?.status === 401 &&
            error.response?.data?.code === 'TOKEN_EXPIRED' &&
            !originalRequest._retry
        ) {
            if (isRefreshing) {
                // Queue this request until the refresh completes
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return instance(originalRequest);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Refresh token is sent automatically via httpOnly cookie
                const { data } = await axios.post(
                    `${instance.defaults.baseURL}/auth/refresh-token`,
                    {},
                    { withCredentials: true }
                );

                localStorage.setItem('token', data.token);

                instance.defaults.headers.common.Authorization = `Bearer ${data.token}`;
                originalRequest.headers.Authorization = `Bearer ${data.token}`;

                processQueue(null, data.token);
                return instance(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                localStorage.removeItem('token');
                window.location.href = '/';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default instance;
