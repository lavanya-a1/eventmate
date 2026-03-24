/**
 * Frontend error logging utility for development and error tracking.
 * In production, can be extended to send to a monitoring service (e.g., Sentry).
 */

const isDev = process.env.NODE_ENV === 'development';

/**
 * Log an error to console in dev, silently structure data for production tracking.
 */
function logError(context, error, metadata = {}) {
  const errorData = {
    timestamp: new Date().toISOString(),
    context,
    message: error?.message || String(error),
    stack: error?.stack,
    ...metadata,
  };

  if (isDev) {
    console.error(`[${context}]`, errorData);
  }

  // TODO: In production, send to error tracking service
  // Example: Sentry.captureException(error, { extra: { context, ...metadata } })

  return errorData;
}

/**
 * Extract client-safe error message from API response.
 */
function getErrorMessage(error) {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.message) {
    return error.message;
  }
  return 'An unexpected error occurred.';
}

export { logError, getErrorMessage };
