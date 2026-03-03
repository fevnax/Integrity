import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Sparkles } from 'lucide-react';
import '../styles/hero.css';

export default function HeroSection() {
    const { user } = useAuth();

    return (
        <section className="hero" id="hero-section">
            <div className="hero-bg">
                <div className="hero-gradient-orb hero-orb-1" />
                <div className="hero-gradient-orb hero-orb-2" />
                <div className="hero-gradient-orb hero-orb-3" />
            </div>

            <div className="container hero-content">
                <div className="hero-badge animate-fade-in-up">
                    <Sparkles size={16} />
                    <span>AI-Powered Ingredient Analysis</span>
                </div>

                <h1 className="hero-title animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    Know What's <span className="hero-title-accent">Really</span> In Your Food
                </h1>

                <p className="hero-subtitle animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    Scan, detect, and evaluate food product ingredients instantly with AI.
                    Get detailed health risk scores, allergen alerts, and additive breakdowns
                    — all from a single photo of the ingredients label.
                </p>

                <div className="hero-cta animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                    <Link
                        to={user ? '/dashboard' : '/signup'}
                        className="btn-primary hero-btn"
                        id="hero-cta-btn"
                    >
                        Analyze Now
                        <ArrowRight size={20} />
                    </Link>
                </div>

                <div className="hero-stats animate-fade-in-up" style={{ animationDelay: '0.45s' }}>
                    <div className="hero-stat">
                        <span className="hero-stat-value">100+</span>
                        <span className="hero-stat-label">Ingredients Detected</span>
                    </div>
                    <div className="hero-stat-divider" />
                    <div className="hero-stat">
                        <span className="hero-stat-value">0–100</span>
                        <span className="hero-stat-label">Risk Scoring</span>
                    </div>
                    <div className="hero-stat-divider" />
                    <div className="hero-stat">
                        <span className="hero-stat-value">Instant</span>
                        <span className="hero-stat-label">AI Analysis</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
