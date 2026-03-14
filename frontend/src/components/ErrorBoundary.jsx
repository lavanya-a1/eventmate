import React from 'react';

function DefaultFallback({ error, onRetry }) {
  return (
    <div className="min-h-[40vh] w-full flex items-center justify-center p-6">
      <div className="w-full max-w-xl rounded-2xl border border-red-500/30 bg-red-500/5 p-6">
        <h2 className="text-xl font-bold text-white">Something went wrong</h2>
        <p className="mt-2 text-sm text-slate-300">
          This section crashed unexpectedly. You can try again without reloading the whole app.
        </p>
        {error?.message ? (
          <p className="mt-3 text-xs text-red-300/90 break-words">{error.message}</p>
        ) : null}
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onRetry}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
          >
            Try again
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10"
          >
            Reload app
          </button>
        </div>
      </div>
    </div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Keep logging lightweight; the app can later replace this with telemetry.
    console.error('ErrorBoundary caught an error:', error, info);
  }

  componentDidUpdate(prevProps) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false, error: null });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    const { hasError, error } = this.state;
    const { fallback, children } = this.props;

    if (hasError) {
      if (typeof fallback === 'function') {
        return fallback({ error, onRetry: this.handleRetry });
      }

      if (React.isValidElement(fallback)) {
        return fallback;
      }

      return <DefaultFallback error={error} onRetry={this.handleRetry} />;
    }

    return children;
  }
}

export default ErrorBoundary;
