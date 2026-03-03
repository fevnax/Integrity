import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, Home, ClipboardList } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { useMediaQuery } from '../hooks/useMediaQuery';
import ThemeToggle from './ThemeToggle';
import '../styles/navbar.css';

export default function Navbar() {
    const { user, logOut } = useAuth();
    const { theme } = useTheme();
    const toast = useToast();
    const navigate = useNavigate();
    const isMobile = useMediaQuery('(max-width: 768px)');
    const [menuOpen, setMenuOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef(null);
    const mobileMenuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setProfileOpen(false);
            }
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        try {
            await logOut();
            toast.success('Logged out successfully');
            navigate('/');
            setProfileOpen(false);
            setMenuOpen(false);
        } catch {
            toast.error('Failed to log out');
        }
    };

    const getInitials = () => {
        if (!user) return '?';
        if (user.displayName) {
            return user.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        }
        return user.email?.[0]?.toUpperCase() || '?';
    };

    return (
        <nav className="navbar glass" id="main-navbar">
            <div className="container navbar-inner">
                <Link to="/" className="navbar-brand" id="navbar-brand">
                    <img
                        src={theme === 'dark' ? '/logo-dark.png' : '/logo-light.png'}
                        alt="Integrity"
                        className="navbar-logo"
                    />
                </Link>

                <div className="navbar-right">
                    {!isMobile && <ThemeToggle />}

                    {user ? (
                        <div className="profile-wrapper" ref={profileRef}>
                            <button
                                className="profile-avatar-btn"
                                onClick={() => setProfileOpen(!profileOpen)}
                                id="profile-menu-btn"
                                aria-label="Profile menu"
                            >
                                {user.photoURL ? (
                                    <img src={user.photoURL} alt="" className="profile-avatar-img" referrerPolicy="no-referrer" />
                                ) : (
                                    <span className="profile-avatar-initials">{getInitials()}</span>
                                )}
                            </button>

                            {profileOpen && (
                                <div className="profile-dropdown" id="profile-dropdown">
                                    <div className="profile-dropdown-header">
                                        <p className="profile-dropdown-name">{user.displayName || 'User'}</p>
                                        <p className="profile-dropdown-email">{user.email}</p>
                                    </div>
                                    <div className="profile-dropdown-divider" />
                                    {isMobile && (
                                        <div className="profile-dropdown-item theme-toggle-mobile">
                                            <span>Theme</span>
                                            <ThemeToggle />
                                        </div>
                                    )}
                                    <Link
                                        to="/"
                                        className="profile-dropdown-item"
                                        onClick={() => setProfileOpen(false)}
                                        id="nav-home"
                                    >
                                        <Home size={18} />
                                        <span>Home</span>
                                    </Link>
                                    <Link
                                        to="/history"
                                        className="profile-dropdown-item"
                                        onClick={() => setProfileOpen(false)}
                                        id="nav-history"
                                    >
                                        <ClipboardList size={18} />
                                        <span>My Analyses</span>
                                    </Link>
                                    <button
                                        className="profile-dropdown-item profile-dropdown-logout"
                                        onClick={handleLogout}
                                        id="nav-logout"
                                    >
                                        <LogOut size={18} />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            {!isMobile ? (
                                <Link to="/signup" className="btn-primary navbar-signup-btn" id="nav-signup-btn">
                                    Sign Up
                                </Link>
                            ) : (
                                <button
                                    className="navbar-hamburger"
                                    onClick={() => setMenuOpen(!menuOpen)}
                                    aria-label="Menu"
                                    id="hamburger-btn"
                                >
                                    {menuOpen ? <X size={24} /> : <Menu size={24} />}
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>

            {isMobile && menuOpen && !user && (
                <div className="mobile-menu glass-card" ref={mobileMenuRef} id="mobile-menu">
                    <div className="mobile-menu-item theme-toggle-mobile">
                        <span>Theme</span>
                        <ThemeToggle />
                    </div>
                    <Link
                        to="/signup"
                        className="btn-primary mobile-signup-btn"
                        onClick={() => setMenuOpen(false)}
                        id="mobile-signup-btn"
                    >
                        Sign Up
                    </Link>
                </div>
            )}
        </nav>
    );
}
