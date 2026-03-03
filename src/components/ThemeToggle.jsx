import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import '../styles/theme-toggle.css';

export default function ThemeToggle({ className = '' }) {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            className={`theme-toggle ${className}`}
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            id="theme-toggle-btn"
        >
            <div className="theme-toggle-track">
                <Sun size={14} className="theme-icon sun-icon" />
                <Moon size={14} className="theme-icon moon-icon" />
                <div className="theme-toggle-thumb" />
            </div>
        </button>
    );
}
