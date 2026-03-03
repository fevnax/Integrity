import { Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Spinner from './components/ui/Spinner';

export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                background: 'var(--color-bg-primary)'
            }}>
                <Spinner size={48} />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
