'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import './ErrorBoundary.css';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

/**
 * Error boundary component to catch and handle React errors gracefully
 */
class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error('Error caught by boundary:', error, errorInfo);

        // You could send this to an error reporting service
        this.logErrorToService(error, errorInfo);
    }

    private logErrorToService(error: Error, errorInfo: ErrorInfo): void {
        // Implement error logging service integration here
        console.log('Error logged:', { error, errorInfo });
    }

    private handleRetry = (): void => {
        this.setState({ hasError: false });
    };

    render(): ReactNode {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="error-boundary">
                    <div className="error-boundary__content">
                        <h2>Something went wrong</h2>
                        <p>An unexpected error occurred. Please try again.</p>
                        <details className="error-boundary__details">
                            <summary>Error details</summary>
                            <pre>{this.state.error?.message}</pre>
                            <pre>{this.state.error?.stack}</pre>
                        </details>
                        <div className="error-boundary__actions">
                            <button
                                onClick={this.handleRetry}
                                className="error-boundary__retry-button"
                                type="button"
                            >
                                Try Again
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="error-boundary__reload-button"
                                type="button"
                            >
                                Reload Page
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;