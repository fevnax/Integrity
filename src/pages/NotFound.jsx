import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import '../styles/notfound.css';

export default function NotFound() {
    return (
        <div className="notfound-page" id="notfound-page">
            <Navbar />
            <div className="notfound-container">
                <div className="notfound-card glass-card">
                    <AlertCircle size={56} className="notfound-icon" />
                    <h1 className="notfound-title">404</h1>
                    <p className="notfound-subtitle">Page not found</p>
                    <p className="notfound-text">
                        The page you're looking for doesn't exist or has been moved.
                    </p>
                    <Link to="/" className="btn-primary" id="notfound-home-btn">
                        <Home size={18} />
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
