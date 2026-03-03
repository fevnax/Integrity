import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import '../../styles/toast.css';

const icons = {
    success: CheckCircle,
    error: XCircle,
    info: Info,
    warning: AlertTriangle
};

export default function Toast({ id, message, type = 'info', duration = 4000, onClose }) {
    const [exiting, setExiting] = useState(false);
    const Icon = icons[type] || Info;

    useEffect(() => {
        const timer = setTimeout(() => {
            setExiting(true);
            setTimeout(onClose, 300);
        }, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const handleClose = () => {
        setExiting(true);
        setTimeout(onClose, 300);
    };

    return (
        <div className={`toast toast-${type} ${exiting ? 'toast-exit' : ''}`} id={`toast-${id}`}>
            <Icon size={20} className="toast-icon" />
            <span className="toast-message">{message}</span>
            <button className="toast-close" onClick={handleClose} aria-label="Close notification">
                <X size={16} />
            </button>
        </div>
    );
}
