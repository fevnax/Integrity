import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('[Integrity ErrorBoundary] Uncaught application error:', error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '24px',
                    background: 'var(--color-bg-primary, #f9fafb)',
                    fontFamily: 'var(--font-sans, system-ui, sans-serif)',
                    color: 'var(--color-text-primary, #081C15)'
                }}>
                    <div className="glass-card" style={{
                        maxWidth: '520px',
                        width: '100%',
                        padding: '40px',
                        borderRadius: '20px',
                        textAlign: 'center',
                        boxShadow: 'var(--glass-shadow, 0 8px 32px rgba(0,0,0,0.1))',
                        border: '1px solid var(--color-border, rgba(0,0,0,0.1))'
                    }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            margin: '0 auto 20px',
                            borderRadius: '50%',
                            background: 'rgba(239, 68, 68, 0.12)',
                            color: '#ef4444',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <AlertTriangle size={36} />
                        </div>

                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '12px' }}>
                            Something went wrong
                        </h2>

                        <p style={{
                            fontSize: '0.95rem',
                            color: 'var(--color-text-muted, #6b8f7b)',
                            lineHeight: '1.5',
                            marginBottom: '24px'
                        }}>
                            We encountered an unexpected issue while loading this page. Please try refreshing or return to the home page.
                        </p>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button
                                onClick={this.handleReload}
                                className="btn-primary"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '10px 20px',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    border: 'none',
                                    fontWeight: '600',
                                    background: 'var(--color-accent, #40916C)',
                                    color: '#ffffff'
                                }}
                            >
                                <RefreshCw size={18} />
                                Refresh Page
                            </button>

                            <button
                                onClick={this.handleGoHome}
                                className="btn-secondary"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '10px 20px',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    border: '1px solid var(--color-border-strong, #ccc)',
                                    fontWeight: '600',
                                    background: 'transparent',
                                    color: 'var(--color-text-primary, #081C15)'
                                }}
                            >
                                <Home size={18} />
                                Home
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
