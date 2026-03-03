import { Camera, Brain, ShieldAlert, ListChecks, History, Lock } from 'lucide-react';
import '../styles/features.css';

const features = [
    {
        icon: Camera,
        title: 'Instant Scan',
        description: 'Snap a photo or upload an image of any packaged food ingredient label. Our OCR reads it in seconds.',
        color: '#3b82f6'
    },
    {
        icon: Brain,
        title: 'AI-Powered Analysis',
        description: 'Gemini AI identifies every ingredient, classifies additives, allergens, sweeteners, and more.',
        color: '#8b5cf6'
    },
    {
        icon: ShieldAlert,
        title: 'Health Risk Score',
        description: 'Get a 0–100 risk score with color-coded badges: green for safe, yellow for moderate, red for high risk.',
        color: '#f59e0b'
    },
    {
        icon: ListChecks,
        title: 'Ingredient Breakdown',
        description: 'See a categorized breakdown of all ingredients — additives, preservatives, fillers, allergens, and sugars.',
        color: '#22c55e'
    },
    {
        icon: History,
        title: 'Analysis History',
        description: 'All your past scans are saved and accessible anytime. Review and compare product analyses.',
        color: '#ec4899'
    },
    {
        icon: Lock,
        title: 'Secure & Private',
        description: 'Your data is securely stored and never shared. Analyze with confidence knowing your privacy is protected.',
        color: '#14b8a6'
    }
];

export default function FeaturesSection() {
    return (
        <section className="features" id="features-section">
            <div className="container">
                <div className="features-header">
                    <span className="features-label">Features</span>
                    <h2 className="features-title">Everything You Need to<br />Eat Smarter</h2>
                    <p className="features-subtitle">
                        From scanning to scoring, Integrity gives you the complete picture of what's inside your food.
                    </p>
                </div>

                <div className="features-grid">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <div
                                className="feature-card glass-card"
                                key={index}
                                style={{ animationDelay: `${index * 0.1}s` }}
                                id={`feature-card-${index}`}
                            >
                                <div className="feature-icon-wrapper" style={{ background: `${feature.color}15` }}>
                                    <Icon size={24} style={{ color: feature.color }} />
                                </div>
                                <h3 className="feature-card-title">{feature.title}</h3>
                                <p className="feature-card-desc">{feature.description}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
