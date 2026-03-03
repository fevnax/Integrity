import '../../styles/badge.css';

const categoryClasses = {
    allergen: 'badge-allergen',
    additive: 'badge-additive',
    sweetener: 'badge-sweetener',
    preservative: 'badge-preservative',
    filler: 'badge-filler',
    spice: 'badge-spice',
    ingredient: 'badge-ingredient',
    unknown: 'badge-unknown',
};

export default function Badge({ category, children }) {
    const cls = categoryClasses[category] || 'badge-unknown';
    return (
        <span className={`badge ${cls}`}>
            {children || category}
        </span>
    );
}
