import React from 'react';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
    size?: 'small' | 'medium' | 'large';
    text?: string;
    overlay?: boolean;
}

/**
 * Reusable loading spinner component
 */
function LoadingSpinner({
    size = 'medium',
    text = 'Loading...',
    overlay = false
}: LoadingSpinnerProps) {
    const spinnerClass = `loading-spinner loading-spinner--${size}`;
    const containerClass = overlay
        ? 'loading-container loading-container--overlay'
        : 'loading-container';

    return (
        <div className={containerClass}>
            <div className={spinnerClass} aria-label="Loading" role="status">
                <div className="loading-spinner__circle"></div>
            </div>
            {text && (
                <div className="loading-text" aria-live="polite">
                    {text}
                </div>
            )}
        </div>
    );
}

export default LoadingSpinner;