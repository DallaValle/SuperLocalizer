import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import LoadingSpinner from './LoadingSpinner';
import './Button.css';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'small' | 'medium' | 'large';
    loading?: boolean;
    children: ReactNode;
    icon?: ReactNode;
    fullWidth?: boolean;
}

/**
 * Enhanced button component with loading states and variants
 */
function Button({
    variant = 'primary',
    size = 'medium',
    loading = false,
    children,
    icon,
    fullWidth = false,
    className = '',
    disabled,
    ...props
}: ButtonProps) {
    const baseClass = 'btn';
    const variantClass = `btn--${variant}`;
    const sizeClass = `btn--${size}`;
    const fullWidthClass = fullWidth ? 'btn--full-width' : '';
    const loadingClass = loading ? 'btn--loading' : '';

    const buttonClass = [
        baseClass,
        variantClass,
        sizeClass,
        fullWidthClass,
        loadingClass,
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <button
            {...props}
            className={buttonClass}
            disabled={disabled || loading}
            aria-disabled={disabled || loading}
        >
            {loading && (
                <LoadingSpinner size="small" text="" />
            )}
            {!loading && icon && (
                <span className="btn__icon" aria-hidden="true">
                    {icon}
                </span>
            )}
            <span className={`btn__text ${loading ? 'btn__text--hidden' : ''}`}>
                {children}
            </span>
        </button>
    );
}

export default Button;