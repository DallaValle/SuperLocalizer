import React, { FormEvent, ReactNode } from 'react';
import LoadingSpinner from './LoadingSpinner';
import './Form.css';

interface FormProps {
    onSubmit: (event: FormEvent<HTMLFormElement>) => void | Promise<void>;
    loading?: boolean;
    error?: string | null;
    children: ReactNode;
    className?: string;
}

/**
 * Enhanced form component with loading states and error handling
 */
function Form({ onSubmit, loading = false, error, children, className }: FormProps) {
    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (loading) return; // Prevent double submission

        await onSubmit(event);
    };

    return (
        <form
            onSubmit={handleSubmit}
            className={`form ${className || ''} ${loading ? 'form--loading' : ''}`}
            noValidate
        >
            {error && (
                <div className="form__error" role="alert">
                    {error}
                </div>
            )}

            <fieldset disabled={loading} className="form__fieldset">
                {children}
            </fieldset>

            {loading && (
                <div className="form__loading-overlay">
                    <LoadingSpinner size="medium" text="Processing..." />
                </div>
            )}
        </form>
    );
}

export default Form;