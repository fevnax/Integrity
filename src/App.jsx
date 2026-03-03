import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AnalysisResult from './pages/AnalysisResult';
import AnalysisHistory from './pages/AnalysisHistory';
import ProtectedRoute from './ProtectedRoute';

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/analysis/:id"
                element={
                    <ProtectedRoute>
                        <AnalysisResult />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/history"
                element={
                    <ProtectedRoute>
                        <AnalysisHistory />
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
}
