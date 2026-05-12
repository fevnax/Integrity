import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, RefreshCw, Hash, Beaker, Candy, ShieldAlert, Droplets, Share2, Download } from 'lucide-react';
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
    const [showAllIngredients, setShowAllIngredients] = useState(false);
    const [showAllAdditives, setShowAllAdditives] = useState(false);
    const [showAllSweeteners, setShowAllSweeteners] = useState(false);
    const [showAllPreservatives, setShowAllPreservatives] = useState(false);

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
    }, [id, user, navigate, toast]);

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
    const matchedHarmful = analysis.matched_harmful || [];
    const fromCache = location.state?.fromCache || false;

    const handleShare = async () => {
        const lines = [
            `🔍 ${analysis.product_name || 'Product'}${analysis.brand ? ` - ${analysis.brand}` : ''}`,
            `⚠️ Risk Score: ${analysis.risk_score}/100 (${analysis.badge || riskColor})`,
            '',
        ];
        if (analysis.summary) lines.push(`📋 ${analysis.summary}`, '');
        if (matchedHarmful.length > 0) {
            lines.push(`🚩 Flagged Ingredients (${matchedHarmful.length}):`);
            matchedHarmful.slice(0, 5).forEach(h => lines.push(`  • ${h.harmfulEntry || h.ingredient} - ${h.reason}`));
            if (matchedHarmful.length > 5) lines.push(`  ... +${matchedHarmful.length - 5} more`);
            lines.push('');
        }
        lines.push(`📊 Total: ${ingredients.length} ingredients | ${additives.length} additives | ${sweeteners.length} sweeteners`);
        lines.push('', '- Analyzed with Integrity');

        const text = lines.join('\n');

        if (navigator.share) {
            try {
                await navigator.share({ title: `Integrity - ${analysis.product_name}`, text });
            } catch (err) {
                if (err.name !== 'AbortError') toast.error('Sharing failed');
            }
        } else {
            try {
                await navigator.clipboard.writeText(text);
                toast.success('Analysis summary copied to clipboard!');
            } catch {
                toast.error('Failed to copy to clipboard');
            }
        }
    };

    const handleExportPDF = async () => {
        toast.success('Generating PDF...');
        const html2pdf = (await import('html2pdf.js')).default;

        const riskBg = riskColor === 'green' ? '#22c55e' : riskColor === 'yellow' ? '#eab308' : '#ef4444';

        const flaggedRows = matchedHarmful.map(h => `
            <tr>
                <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-weight:600">${h.harmfulEntry || h.ingredient}</td>
                <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:0.85rem">${h.reason}</td>
                <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center">${h.score}</td>
            </tr>
        `).join('');

        const toTitleCase = (str) => str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());

        const ingredientTags = ingredients.map(i => {
            const colors = { additive: '#3b82f6', sweetener: '#a855f7', preservative: '#f97316' };
            const bg = colors[i.category] || '#6b7280';
            const name = toTitleCase(i.original);
            return `<span style="display:inline-flex;align-items:center;justify-content:center;padding:6px 14px 17px 14px;margin:3px;border-radius:14px;font-size:0.75rem;color:white;background:${bg};height:28px;box-sizing:border-box">${name}</span>`;
        }).join('');

        const html = `
            <div style="font-family:'Segoe UI',sans-serif;color:#1f2937;padding:40px;max-width:800px;margin:auto">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;border-bottom:2px solid #40916C;padding-bottom:16px">
                    <div>
                        <h1 style="margin:0;font-size:1.6rem;color:#40916C">Integrity</h1>
                        <p style="margin:4px 0 0;font-size:0.8rem;color:#9ca3af">AI-Powered Ingredient Analysis Report</p>
                    </div>
                    <p style="font-size:0.8rem;color:#9ca3af">${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>

                <h2 style="margin:0 0 4px;font-size:1.4rem">${analysis.product_name || 'Unknown Product'}</h2>
                ${analysis.brand ? `<p style="margin:0 0 16px;color:#6b7280;font-size:0.95rem">${analysis.brand}</p>` : ''}

                <div style="display:flex;align-items:center;gap:20px;padding:20px;background:#f9fafb;border-radius:12px;margin-bottom:24px">
                    <div style="width:72px;height:72px;border-radius:50%;background:${riskBg};display:flex;flex-direction:column;align-items:center;justify-content:center;color:white;font-weight:800;font-size:1.4rem;flex-shrink:0">
                        ${analysis.risk_score}
                        <span style="font-size:0.5rem; padding-bottom:17px; font-weight:600;text-transform:uppercase;letter-spacing:0.5px">Risk</span>
                    </div>
                    <p style="margin:0;font-size:0.9rem;color:#374151;line-height:1.5">${analysis.summary || ''}</p>
                </div>

                ${matchedHarmful.length > 0 ? `
                    <h3 style="margin:0 0 12px;font-size:1.05rem;color:#dc2626">⚠ Flagged Ingredients (${matchedHarmful.length})</h3>
                    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;font-size:0.85rem">
                        <thead><tr style="background:#fef2f2">
                            <th style="padding:8px 12px;text-align:left;border-bottom:2px solid #fecaca">Ingredient</th>
                            <th style="padding:8px 12px;text-align:left;border-bottom:2px solid #fecaca">Concern</th>
                            <th style="padding:8px 12px;text-align:center;border-bottom:2px solid #fecaca">Score</th>
                        </tr></thead>
                        <tbody>${flaggedRows}</tbody>
                    </table>
                ` : ''}

                <h3 style="margin:0 0 12px;font-size:1.05rem">All Ingredients (${ingredients.length})</h3>
                <div style="margin-bottom:24px;line-height:2.2">${ingredientTags}</div>

                <div style="display:flex; gap:24px;margin-bottom:24px">
                    <div style="flex:1;padding:12px;background:#f0fdf4;border-radius:8px;text-align:center">
                        <div style="font-size:1.3rem;font-weight:700;color:#16a34a">${additives.length}</div>
                        <div style="font-size:0.75rem; padding-bottom:17px; color:#6b7280">Additives</div>
                    </div>
                    <div style="flex:1;padding:12px;background:#faf5ff;border-radius:8px;text-align:center">
                        <div style="font-size:1.3rem;font-weight:700;color:#9333ea">${sweeteners.length}</div>
                        <div style="font-size:0.75rem; padding-bottom:17px; color:#6b7280">Sweeteners</div>
                    </div>
                    <div style="flex:1;padding:12px;background:#fff7ed;border-radius:8px;text-align:center">
                        <div style="font-size:1.3rem;font-weight:700;color:#ea580c">${preservatives.length}</div>
                        <div style="font-size:0.75rem; padding-bottom:17px; color:#6b7280">Preservatives</div>
                    </div>
                </div>

                <div style="text-align:center;padding-top:16px;border-top:1px solid #e5e7eb;font-size:0.75rem;color:#9ca3af">
                    Generated by Integrity - AI-Powered Ingredient Analysis
                </div>
            </div>
        `;

        const container = document.createElement('div');
        container.innerHTML = html;
        document.body.appendChild(container);

        try {
            await html2pdf().set({
                margin: [10, 10, 10, 10],
                filename: `Integrity_${(analysis.product_name || 'Report').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            }).from(container).save();
        } catch {
            toast.error('PDF export failed');
        } finally {
            document.body.removeChild(container);
        }
    };

    return (
        <div className="analysis-page" id="analysis-page">
            <Navbar />
            <div className="analysis-container">
                <div className="analysis-top-bar">
                    <button className="analysis-back-btn" onClick={() => navigate(-1)} id="back-btn">
                        <ArrowLeft size={18} />
                        Back
                    </button>
                    <div className="analysis-top-actions">
                        <button className="analysis-share-btn" onClick={handleShare} id="share-btn">
                            <Share2 size={18} />
                            Share
                        </button>
                        <button className="analysis-share-btn" onClick={handleExportPDF} id="export-pdf-btn">
                            <Download size={18} />
                            Export PDF
                        </button>
                    </div>
                </div>

                <div className="analysis-result-card glass-card">
                    <div className="analysis-product-header">
                        <h1 className="analysis-product-name">
                            {analysis.product_name || 'Unknown Product'}
                            {fromCache && <span className="cached-badge">Cached</span>}
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
                            <span>Low confidence analysis - image quality may be affecting accuracy</span>
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
                                    {(showAllIngredients ? ingredients : ingredients.slice(0, 8)).map((ing, i) => (
                                        <div className="breakdown-item" key={i}>
                                            <span className="breakdown-item-name">{ing.original}</span>
                                            <Badge category={ing.category}>{ing.category}</Badge>
                                        </div>
                                    ))}
                                    {ingredients.length > 8 && (
                                        <button
                                            className="breakdown-toggle-btn"
                                            onClick={() => setShowAllIngredients(!showAllIngredients)}
                                        >
                                            {showAllIngredients ? 'Show less' : `Show all ${ingredients.length} ingredients`}
                                        </button>
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
                                        {(showAllAdditives ? additives : additives.slice(0, 8)).map((ing, i) => (
                                            <div className="breakdown-item" key={i}>
                                                <span className="breakdown-item-name">{ing.original}</span>
                                                <Badge category="additive">Additive</Badge>
                                            </div>
                                        ))}
                                        {additives.length > 8 && (
                                            <button
                                                className="breakdown-toggle-btn"
                                                onClick={() => setShowAllAdditives(!showAllAdditives)}
                                            >
                                                {showAllAdditives ? 'Show less' : `Show all ${additives.length} additives`}
                                            </button>
                                        )}
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
                                        {(showAllSweeteners ? sweeteners : sweeteners.slice(0, 8)).map((ing, i) => (
                                            <div className="breakdown-item" key={i}>
                                                <span className="breakdown-item-name">{ing.original}</span>
                                                <Badge category="sweetener">Sweetener</Badge>
                                            </div>
                                        ))}
                                        {sweeteners.length > 8 && (
                                            <button
                                                className="breakdown-toggle-btn"
                                                onClick={() => setShowAllSweeteners(!showAllSweeteners)}
                                            >
                                                {showAllSweeteners ? 'Show less' : `Show all ${sweeteners.length} sweeteners`}
                                            </button>
                                        )}
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
                                        {(showAllPreservatives ? preservatives : preservatives.slice(0, 8)).map((ing, i) => (
                                            <div className="breakdown-item" key={i}>
                                                <span className="breakdown-item-name">{ing.original}</span>
                                                <Badge category="preservative">Preservative</Badge>
                                            </div>
                                        ))}
                                        {preservatives.length > 8 && (
                                            <button
                                                className="breakdown-toggle-btn"
                                                onClick={() => setShowAllPreservatives(!showAllPreservatives)}
                                            >
                                                {showAllPreservatives ? 'Show less' : `Show all ${preservatives.length} preservatives`}
                                            </button>
                                        )}
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

                    {matchedHarmful.length > 0 && (
                        <div className="analysis-section" id="harmful-section">
                            <h2 className="analysis-section-title">
                                <AlertTriangle size={20} style={{ color: 'var(--color-danger)' }} />
                                Flagged Harmful Ingredients ({matchedHarmful.length})
                            </h2>
                            <div className="harmful-list">
                                {matchedHarmful
                                    .sort((a, b) => b.score - a.score)
                                    .map((item, i) => (
                                        <div className="harmful-item" key={i}>
                                            <div className="harmful-item-header">
                                                <span className="harmful-item-name">{item.ingredient}</span>
                                                <span className={`harmful-score-badge ${item.score >= 70 ? 'score-high' :
                                                    item.score >= 40 ? 'score-medium' : 'score-low'
                                                    }`}>
                                                    {item.score}/100
                                                </span>
                                            </div>
                                            <div className="harmful-item-meta">
                                                <Badge category={item.category}>{item.category}</Badge>
                                                <span className="harmful-matched-as">Matched: {item.harmfulEntry}</span>
                                            </div>
                                            <p className="harmful-item-reason">{item.reason}</p>
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
