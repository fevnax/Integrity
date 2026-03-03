import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import '../../styles/modal.css';

export default function Modal({ isOpen, onClose, title, children, actions }) {
    const modalRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) onClose();
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick} id="modal-overlay">
            <div className="modal glass-card" ref={modalRef} role="dialog" aria-modal="true">
                <div className="modal-header">
                    <h3 className="modal-title">{title}</h3>
                    <button className="modal-close-btn" onClick={onClose} aria-label="Close dialog">
                        <X size={20} />
                    </button>
                </div>
                <div className="modal-body">
                    {children}
                </div>
                {actions && (
                    <div className="modal-actions">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
}
