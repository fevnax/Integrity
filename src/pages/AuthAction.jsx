import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { verifyPasswordResetCode, confirmPasswordReset, applyActionCode } from 'firebase/auth';
import { auth } from '../services/firebase';
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle, MailCheck } from 'lucide-react';
import Navbar from '../components/Navbar';
import Spinner from '../components/ui/Spinner';
import '../styles/auth.css';

function VerifyEmail({ oobCode }) {
    const [verifying, setVerifying] = useState(true);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!oobCode) {
            setError('Invalid verification link.');
            setVerifying(false);
            return;
        }
        applyActionCode(auth, oobCode)
            .then(() => {
                setSuccess(true);
                setVerifying(false);
                // Reload user to update emailVerified flag
                if (auth.currentUser) auth.currentUser.reload();
            })
            .catch(() => {
                setError('This verification link has expired or already been used.');
                setVerifying(false);
            });
    }, [oobCode]);

    if (verifying) {
        return (
            <div className="auth-action-state">
                <Spinner size={40} />
                <p className="auth-action-msg">Verifying your email...</p>
            </div>
        );
    }

    if (success) {
        return (
            <div className="auth-action-state">
                <MailCheck size={48} className="auth-action-success-icon" />
                <h2 className="auth-title">Email Verified!</h2>
                <p className="auth-action-msg">
                    Your email has been successfully verified. You're all set!
                </p>
                <Link to="/dashboard" className="btn-primary auth-submit-btn" id="goto-dashboard-btn">
                    Go to Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div className="auth-action-state">
            <AlertCircle size={48} className="auth-action-error-icon" />
            <h2 className="auth-title">Verification Failed</h2>
            <p className="auth-action-msg">{error}</p>
            <Link to="/login" className="btn-primary auth-submit-btn" id="back-login-btn">
                Back to Login
            </Link>
        </div>
    );
}

function ResetPassword({ oobCode }) {
    const [verifying, setVerifying] = useState(true);
    const [email, setEmail] = useState('');
    const [error, setError] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPwd, setConfirmPwd] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!oobCode) {
            setError('Invalid or expired link.');
            setVerifying(false);
            return;
        }
        verifyPasswordResetCode(auth, oobCode)
            .then(userEmail => {
                setEmail(userEmail);
                setVerifying(false);
            })
            .catch(() => {
                setError('This reset link has expired or already been used.');
                setVerifying(false);
            });
    }, [oobCode]);

    const handleReset = async (e) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        if (newPassword !== confirmPwd) {
            setError('Passwords do not match.');
            return;
        }
        setError(null);
        setSubmitting(true);
        try {
            await confirmPasswordReset(auth, oobCode, newPassword);
            setSuccess(true);
        } catch (err) {
            setError(
                err.code === 'auth/expired-action-code'
                    ? 'This link has expired. Please request a new one.'
                    : err.code === 'auth/weak-password'
                        ? 'Password is too weak. Use at least 6 characters.'
                        : 'Failed to reset password. Please try again.'
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (verifying) {
        return (
            <div className="auth-action-state">
                <Spinner size={40} />
                <p className="auth-action-msg">Verifying reset link...</p>
            </div>
        );
    }

    if (success) {
        return (
            <div className="auth-action-state">
                <CheckCircle size={48} className="auth-action-success-icon" />
                <h2 className="auth-title">Password Reset!</h2>
                <p className="auth-action-msg">
                    Your password has been successfully updated.
                </p>
                <Link to="/login" className="btn-primary auth-submit-btn" id="goto-login-btn">
                    Log In
                </Link>
            </div>
        );
    }

    if (error && !email) {
        return (
            <div className="auth-action-state">
                <AlertCircle size={48} className="auth-action-error-icon" />
                <h2 className="auth-title">Link Invalid</h2>
                <p className="auth-action-msg">{error}</p>
                <Link to="/login" className="btn-primary auth-submit-btn" id="back-login-btn">
                    Back to Login
                </Link>
            </div>
        );
    }

    return (
        <>
            <div className="auth-header">
                <h1 className="auth-title">Reset Password</h1>
                <p className="auth-subtitle">
                    Enter a new password for <strong>{email}</strong>
                </p>
            </div>

            {error && <p className="auth-error-inline">{error}</p>}

            <form onSubmit={handleReset} className="auth-form" id="reset-form">
                <div className="input-group">
                    <Lock size={18} className="input-icon" />
                    <input
                        type={showPassword ? 'text' : 'password'}
                        className="input-field input-with-icon"
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        id="new-password"
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
                <div className="input-group">
                    <Lock size={18} className="input-icon" />
                    <input
                        type={showPassword ? 'text' : 'password'}
                        className="input-field input-with-icon"
                        placeholder="Confirm Password"
                        value={confirmPwd}
                        onChange={(e) => setConfirmPwd(e.target.value)}
                        id="confirm-password"
                        autoComplete="new-password"
                    />
                </div>

                <button
                    type="submit"
                    className="btn-primary auth-submit-btn"
                    disabled={submitting}
                    id="reset-password-submit"
                >
                    {submitting ? <Spinner size={22} /> : 'Reset Password'}
                </button>
            </form>
        </>
    );
}

export default function AuthAction() {
    const [searchParams] = useSearchParams();
    const mode = searchParams.get('mode');
    const oobCode = searchParams.get('oobCode');

    const renderContent = () => {
        switch (mode) {
            case 'resetPassword':
                return <ResetPassword oobCode={oobCode} />;
            case 'verifyEmail':
                return <VerifyEmail oobCode={oobCode} />;
            default:
                return (
                    <div className="auth-action-state">
                        <AlertCircle size={48} className="auth-action-error-icon" />
                        <h2 className="auth-title">Invalid Link</h2>
                        <p className="auth-action-msg">This action link is not recognized.</p>
                        <Link to="/" className="btn-primary auth-submit-btn">
                            Back to Home
                        </Link>
                    </div>
                );
        }
    };

    return (
        <div className="auth-page" id="auth-action-page">
            <Navbar />
            <div className="auth-container">
                <div className="auth-card glass-card">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}
