'use client'

import { useAuth } from '../contexts/AuthContext'
import './Home.css'

export default function HomePage() {
    const { logout, token } = useAuth()

    const handleLogout = () => {
        logout()
    }

    return (
        <div className="home-container">
            <header className="home-header">
                <h1>SuperLocalizer Dashboard</h1>
                <div className="user-info">
                    <span>Benvenuto!</span>
                    <button onClick={handleLogout} className="logout-btn">
                        Logout
                    </button>
                </div>
            </header>

            <main className="home-content">
                {/* Navigation Cards */}
                <div className="navigation-section">
                    <h2>Azioni Rapide</h2>
                    <div className="navigation-cards">
                        <a href="/properties" className="nav-card">
                            <div className="nav-card-icon">📝</div>
                            <h3>Gestisci Traduzioni</h3>
                            <p>Visualizza e modifica tutte le traduzioni</p>
                        </a>

                        <div className="nav-card">
                            <div className="nav-card-icon">📊</div>
                            <h3>Report</h3>
                            <p>Statistiche e analisi delle traduzioni</p>
                        </div>

                        <div className="nav-card">
                            <div className="nav-card-icon">⚙️</div>
                            <h3>Impostazioni</h3>
                            <p>Configura progetti e lingue</p>
                        </div>
                    </div>
                </div>

                <div className="dashboard-grid">
                    <div className="dashboard-card">
                        <h3>Progetti Attivi</h3>
                        <p className="card-number">12</p>
                        <p className="card-description">Progetti di localizzazione in corso</p>
                    </div>

                    <div className="dashboard-card">
                        <h3>Lingue Supportate</h3>
                        <p className="card-number">24</p>
                        <p className="card-description">Lingue disponibili per la traduzione</p>
                    </div>

                    <div className="dashboard-card">
                        <h3>Traduzioni Completate</h3>
                        <p className="card-number">1,247</p>
                        <p className="card-description">Chiavi tradotte questo mese</p>
                    </div>

                    <div className="dashboard-card">
                        <h3>Revisioni Pending</h3>
                        <p className="card-number">43</p>
                        <p className="card-description">Traduzioni in attesa di revisione</p>
                    </div>
                </div>

                <div className="recent-activity">
                    <h3>Attività Recente</h3>
                    <div className="activity-list">
                        <div className="activity-item">
                            <span className="activity-time">10:30</span>
                            <span className="activity-text">Nuova traduzione aggiunta per "welcome_message" in IT</span>
                        </div>
                        <div className="activity-item">
                            <span className="activity-time">09:15</span>
                            <span className="activity-text">Revisione completata per il progetto "Mobile App"</span>
                        </div>
                        <div className="activity-item">
                            <span className="activity-time">08:45</span>
                            <span className="activity-text">Nuovo progetto "Website v2" creato</span>
                        </div>
                    </div>
                </div>

                <div className="debug-info">
                    <h4>Debug Info:</h4>
                    <p>Token: {token ? `${token.substring(0, 20)}...` : 'Non presente'}</p>
                </div>
            </main>
        </div>
    )
}