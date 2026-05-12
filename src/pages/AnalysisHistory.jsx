import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ChevronRight, ClipboardList, Scan, Search, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getAnalyses, deleteAnalysis } from '../services/analysisStorage';
import Navbar from '../components/Navbar';
import Spinner from '../components/ui/Spinner';
import Modal from '../components/ui/Modal';
import '../styles/history.css';

export default function AnalysisHistory() {
    const { user } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();
    const [analyses, setAnalyses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [riskFilter, setRiskFilter] = useState('all');

    useEffect(() => {
        if (user) {
            loadAnalyses();
        }
    }, [user]);

    const loadAnalyses = async () => {
        try {
            const data = await getAnalyses(user.uid);
            setAnalyses(data);
        } catch {
            toast.error('Failed to load analyses');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setDeleting(true);
        try {
            await deleteAnalysis(user.uid, deleteId);
            setAnalyses(prev => prev.filter(a => a.id !== deleteId));
            toast.success('Analysis deleted');
        } catch {
            toast.error('Failed to delete analysis');
        } finally {
            setDeleting(false);
            setDeleteId(null);
        }
    };

    const getRiskColor = (score) => {
        if (score <= 30) return 'green';
        if (score <= 60) return 'yellow';
        return 'red';
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const filteredAnalyses = analyses.filter(item => {
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch = !q
            || (item.product_name || '').toLowerCase().includes(q)
            || (item.brand || '').toLowerCase().includes(q);

        const matchesRisk = riskFilter === 'all'
            || (riskFilter === 'green' && item.risk_score <= 30)
            || (riskFilter === 'yellow' && item.risk_score > 30 && item.risk_score <= 60)
            || (riskFilter === 'red' && item.risk_score > 60);

        return matchesSearch && matchesRisk;
    });

    return (
        <div className="history-page" id="history-page">
            <Navbar />
            <div className="history-container">
                <div className="history-header">
                    <div>
                        <h1 className="history-title">
                            <ClipboardList size={28} />
                            My Analyses
                        </h1>
                        <p className="history-subtitle">
                            {analyses.length > 0
                                ? `${filteredAnalyses.length} of ${analyses.length} product${analyses.length !== 1 ? 's' : ''}`
                                : 'Your analysis history will appear here'}
                        </p>
                    </div>
                    <Link to="/dashboard" className="btn-primary" id="new-scan-btn">
                        <Scan size={18} />
                        New Scan
                    </Link>
                </div>

                {analyses.length > 0 && (
                    <div className="history-filters">
                        <div className="history-search-wrapper">
                            <Search size={18} className="history-search-icon" />
                            <input
                                type="text"
                                className="history-search-input"
                                placeholder="Search by product or brand..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                id="history-search"
                            />
                        </div>
                        <div className="history-risk-filter-wrapper">
                            <Filter size={16} className="history-filter-icon" />
                            <select
                                className="history-risk-filter"
                                value={riskFilter}
                                onChange={(e) => setRiskFilter(e.target.value)}
                                id="history-risk-filter"
                            >
                                <option value="all">All Risks</option>
                                <option value="green">Low (0–30)</option>
                                <option value="yellow">Moderate (31–60)</option>
                                <option value="red">High (61–100)</option>
                            </select>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="history-loading">
                        <Spinner size={48} />
                    </div>
                ) : filteredAnalyses.length === 0 && analyses.length > 0 ? (
                    <div className="history-empty glass-card">
                        <Search size={56} className="history-empty-icon" />
                        <h3>No matching results</h3>
                        <p>Try a different search term or filter</p>
                    </div>
                ) : analyses.length === 0 ? (
                    <div className="history-empty glass-card">
                        <ClipboardList size={56} className="history-empty-icon" />
                        <h3>No analyses yet</h3>
                        <p>Start by scanning a food product's ingredient label</p>
                        <Link to="/dashboard" className="btn-primary" id="empty-scan-btn">
                            <Scan size={18} />
                            Start Scanning
                        </Link>
                    </div>
                ) : (
                    <div className="history-list">
                        {filteredAnalyses.map((item) => (
                            <div
                                className="history-item glass-card"
                                key={item.id}
                                id={`history-item-${item.id}`}
                            >
                                <div
                                    className="history-item-main"
                                    onClick={() => navigate(`/analysis/${item.id}`)}
                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/analysis/${item.id}`); } }}
                                    role="button"
                                    tabIndex={0}
                                >
                                    <div className={`history-risk-dot risk-dot-${getRiskColor(item.risk_score)}`}>
                                        <span>{item.risk_score}</span>
                                    </div>
                                    <div className="history-item-info">
                                        <h3 className="history-item-name">
                                            {item.product_name || 'Unknown Product'}
                                        </h3>
                                        {item.brand && (
                                            <span className="history-item-brand">{item.brand}</span>
                                        )}
                                        <span className="history-item-date">{formatDate(item.createdAt)}</span>
                                    </div>
                                    <ChevronRight size={20} className="history-item-arrow" />
                                </div>
                                <button
                                    className="history-delete-btn"
                                    onClick={(e) => { e.stopPropagation(); setDeleteId(item.id); }}
                                    aria-label="Delete analysis"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Modal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                title="Delete Analysis"
                actions={
                    <>
                        <button className="btn-secondary" onClick={() => setDeleteId(null)} disabled={deleting}>
                            Cancel
                        </button>
                        <button
                            className="btn-primary"
                            onClick={handleDelete}
                            disabled={deleting}
                            style={{ background: 'var(--color-danger)' }}
                        >
                            {deleting ? <Spinner size={18} /> : 'Delete'}
                        </button>
                    </>
                }
            >
                <p>Are you sure you want to delete this analysis? This action cannot be undone.</p>
            </Modal>
        </div>
    );
}
