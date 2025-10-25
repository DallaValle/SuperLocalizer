'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import './Login.css';

const Login = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // For now, just simulate login with any username/password
        if (formData.username && formData.password) {
            // Store auth state in localStorage for demo purposes
            localStorage.setItem('isAuthenticated', 'true');
            router.push('/home');
        } else {
            alert('Please enter both username and password');
        }
    };

    return (
        <div className="login-container">
            <div className="login-form">
                <h2>SuperLocalizer</h2>
                <p>Please sign in to continue</p>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Enter your username"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                    <button type="submit" className="login-button">
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;