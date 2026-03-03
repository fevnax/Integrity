import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import Navbar from '../components/Navbar';
import Spinner from '../components/ui/Spinner';
import '../styles/auth.css';

export default function SignUp() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { signUp, logInWithGoogle } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim() || !email.trim() || !password.trim()) {
            toast.warning('Please fill in all fields');
            return;
        }
        if (password.length < 6) {
            toast.warning('Password must be at least 6 characters');
            return;
        }
        setLoading(true);
        try {
            await signUp(email, password, name.trim());
            toast.success('Account created successfully!');
            navigate('/dashboard');
        } catch (err) {
            const msg = err.code === 'auth/email-already-in-use'
                ? 'This email is already registered. Try logging in.'
                : err.code === 'auth/weak-password'
                    ? 'Password is too weak. Use at least 6 characters.'
                    : 'Failed to create account. Please try again.';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        try {
            await logInWithGoogle();
            toast.success('Signed in with Google!');
            navigate('/dashboard');
        } catch (err) {
            if (err.code !== 'auth/popup-closed-by-user') {
                toast.error('Google sign-in failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page" id="signup-page">
            <Navbar />
            <div className="auth-container">
                <div className="auth-card glass-card">
                    <div className="auth-header">
                        <h1 className="auth-title">Create Account</h1>
                        <p className="auth-subtitle">Join Integrity and start analyzing food ingredients</p>
                    </div>

                    <button
                        className="google-btn"
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        id="google-signup-btn"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Continue with Google
                    </button>

                    <div className="auth-divider">
                        <span>or</span>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form" id="signup-form">
                        <div className="input-group">
                            <User size={18} className="input-icon" />
                            <input
                                type="text"
                                className="input-field input-with-icon"
                                placeholder="Full Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                id="signup-name"
                                autoComplete="name"
                            />
                        </div>
                        <div className="input-group">
                            <Mail size={18} className="input-icon" />
                            <input
                                type="email"
                                className="input-field input-with-icon"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                id="signup-email"
                                autoComplete="email"
                            />
                        </div>
                        <div className="input-group">
                            <Lock size={18} className="input-icon" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="input-field input-with-icon"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                id="signup-password"
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                className="input-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label="Toggle password visibility"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <button
                            type="submit"
                            className="btn-primary auth-submit-btn"
                            disabled={loading}
                            id="signup-submit"
                        >
                            {loading ? <Spinner size={22} /> : 'Create Account'}
                        </button>
                    </form>

                    <p className="auth-footer-text">
                        Already have an account?{' '}
                        <Link to="/login" className="auth-link" id="goto-login">Log In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
