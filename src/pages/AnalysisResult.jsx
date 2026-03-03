import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, RefreshCw, Hash, Beaker, Candy, ShieldAlert, Droplets } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getAnalysis } from '../services/analysisStorage';
import Navbar from '../components/Navbar';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import '../styles/analysis.css';

export default function AnalysisResult() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const toast = useToast();
    const [analysis, setAnalysis] = useState(location.state?.analysis || null);
    const [loading, setLoading] = useState(!location.state?.analysis);

    useEffect(() => {
        if (!analysis && user) {
            setLoading(true);
            getAnalysis(user.uid, id)
                .then(data => {
                    if (data) {
                        setAnalysis(data);
                    } else {
                        toast.error('Analysis not found');
                        navigate('/history');
                    }
                })
                .catch(() => {
                    toast.error('Failed to load analysis');
                    navigate('/history');
                })
                .finally(() => setLoading(false));
        }
    }, [id, user]);

    if (loading) {
        return (
            <div className="analysis-page" id="analysis-page">
                <Navbar />
                <div className="analysis-loading">
                    <Spinner size={48} />
                    <p>Loading analysis...</p>
                </div>
            </div>
        );
    }

    if (!analysis) return null;

    const riskColor = analysis.risk_score <= 30 ? 'green' : analysis.risk_score <= 60 ? 'yellow' : 'red';
    const riskLabel = analysis.badge || riskColor;

    const ingredients = analysis.ingredients || [];
    const additives = ingredients.filter(i => i.category === 'additive');
    const sweeteners = ingredients.filter(i => i.category === 'sweetener');
    const allergens = ingredients.filter(i => i.is_allergen);
    const addedSugars = ingredients.filter(i => i.is_added_sugar);
    const preservatives = ingredients.filter(i => i.category === 'preservative');

    return (
        <div className="analysis-page" id="analysis-page">
            <Navbar />
            <div className="analysis-container">
                <button className="analysis-back-btn" onClick={() => navigate(-1)} id="back-btn">
                    <ArrowLeft size={18} />
                    Back
                </button>

                <div className="analysis-result-card glass-card">
                    <div className="analysis-product-header">
                        <h1 className="analysis-product-name">
                            {analysis.product_name || 'Unknown Product'}
                        </h1>
                        {analysis.brand && (
                            <p className="analysis-brand">{analysis.brand}</p>
                        )}
                    </div>

                    <div className={`analysis-summary-box summary-${riskLabel}`}>
                        <div className={`risk-score-circle risk-${riskColor}`} id="risk-score">
                            <span className="risk-score-value">{analysis.risk_score}</span>
                            <span className="risk-score-label">RISK SCORE</span>
                        </div>
                        <p className="analysis-summary-text">{analysis.summary}</p>
                    </div>

                    {analysis.confidence_low && (
                        <div className="analysis-confidence-warning">
                            <AlertTriangle size={18} />
                            <span>Low confidence analysis — image quality may be affecting accuracy</span>
                        </div>
                    )}

                    {analysis.key_findings && analysis.key_findings.length > 0 && (
                        <div className="analysis-section" id="key-findings">
                            <h2 className="analysis-section-title">Key Findings</h2>
                            <div className="findings-chips">
                                {analysis.key_findings.map((finding, i) => (
                                    <span className="finding-chip" key={i}>
                                        <AlertTriangle size={14} />
                                        {finding}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="analysis-section" id="ingredient-breakdown">
                        <h2 className="analysis-section-title">Ingredient Breakdown</h2>
                        <div className="breakdown-grid">
                            <div className="breakdown-card">
                                <div className="breakdown-card-header">
                                    <Hash size={20} className="breakdown-icon" style={{ color: '#3b82f6' }} />
                                    <div>
                                        <span className="breakdown-card-count">{ingredients.length}</span>
                                        <span className="breakdown-card-label">Total Ingredients</span>
                                    </div>
                                </div>
                                <div className="breakdown-list">
                                    {ingredients.slice(0, 8).map((ing, i) => (
                                        <div className="breakdown-item" key={i}>
                                            <span className="breakdown-item-name">{ing.original}</span>
                                            <Badge category={ing.category}>{ing.category}</Badge>
                                        </div>
                                    ))}
                                    {ingredients.length > 8 && (
                                        <p className="breakdown-more">+{ingredients.length - 8} more</p>
                                    )}
                                </div>
                            </div>

                            {additives.length > 0 && (
                                <div className="breakdown-card">
                                    <div className="breakdown-card-header">
                                        <Beaker size={20} className="breakdown-icon" style={{ color: '#f59e0b' }} />
                                        <div>
                                            <span className="breakdown-card-count">{additives.length}</span>
                                            <span className="breakdown-card-label">Additives</span>
                                        </div>
                                    </div>
                                    <div className="breakdown-list">
                                        {additives.map((ing, i) => (
                                            <div className="breakdown-item" key={i}>
                                                <span className="breakdown-item-name">{ing.original}</span>
                                                <Badge category="additive">Additive</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {sweeteners.length > 0 && (
                                <div className="breakdown-card">
                                    <div className="breakdown-card-header">
                                        <Candy size={20} className="breakdown-icon" style={{ color: '#3b82f6' }} />
                                        <div>
                                            <span className="breakdown-card-count">{sweeteners.length}</span>
                                            <span className="breakdown-card-label">Sweeteners</span>
                                        </div>
                                    </div>
                                    <div className="breakdown-list">
                                        {sweeteners.map((ing, i) => (
                                            <div className="breakdown-item" key={i}>
                                                <span className="breakdown-item-name">{ing.original}</span>
                                                <Badge category="sweetener">Sweetener</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {preservatives.length > 0 && (
                                <div className="breakdown-card">
                                    <div className="breakdown-card-header">
                                        <ShieldAlert size={20} className="breakdown-icon" style={{ color: '#db2777' }} />
                                        <div>
                                            <span className="breakdown-card-count">{preservatives.length}</span>
                                            <span className="breakdown-card-label">Preservatives</span>
                                        </div>
                                    </div>
                                    <div className="breakdown-list">
                                        {preservatives.map((ing, i) => (
                                            <div className="breakdown-item" key={i}>
                                                <span className="breakdown-item-name">{ing.original}</span>
                                                <Badge category="preservative">Preservative</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {allergens.length > 0 && (
                        <div className="analysis-section" id="allergens-section">
                            <h2 className="analysis-section-title">
                                <ShieldAlert size={20} style={{ color: 'var(--color-danger)' }} />
                                Allergens Detected
                            </h2>
                            <div className="allergens-list">
                                {allergens.map((ing, i) => (
                                    <span className="allergen-chip" key={i}>
                                        {ing.original}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {addedSugars.length > 0 && (
                        <div className="analysis-section" id="added-sugars-section">
                            <h2 className="analysis-section-title">
                                <Droplets size={20} style={{ color: 'var(--color-warning)' }} />
                                Added Sugars
                            </h2>
                            <div className="breakdown-list">
                                {addedSugars.map((ing, i) => (
                                    <div className="breakdown-item" key={i}>
                                        <span className="breakdown-item-name">{ing.original}</span>
                                        <Badge category="sweetener">Sweetener</Badge>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {analysis.suggestions && analysis.suggestions.length > 0 && (
                        <div className="analysis-section" id="suggestions-section">
                            <h2 className="analysis-section-title">Suggestions</h2>
                            <ul className="suggestions-list">
                                {analysis.suggestions.map((s, i) => (
                                    <li key={i} className="suggestion-item">{s}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="analysis-actions">
                        <Link to="/dashboard" className="btn-primary" id="scan-another-btn">
                            <RefreshCw size={18} />
                            Scan Another Product
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
