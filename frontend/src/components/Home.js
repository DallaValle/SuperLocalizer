import React from 'react';
import './Home.css';

const Home = ({ onLogout }) => {
    return (
        <div className="home-container">
            <header className="home-header">
                <div className="header-content">
                    <h1>SuperLocalizer</h1>
                    <button onClick={onLogout} className="logout-button">
                        Logout
                    </button>
                </div>
            </header>

            <main className="home-main">
                <div className="welcome-section">
                    <h2>Welcome to SuperLocalizer</h2>
                    <p>Your localization management dashboard</p>
                </div>

                <div className="content-placeholder">
                    <div className="placeholder-card">
                        <h3>Coming Soon</h3>
                        <p>Dashboard features will be added here</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Home;