import { Github, Linkedin, Mail } from 'lucide-react';
import '../styles/footer.css';

const creators = [
    {
        name: 'Vedant P.',
        github: 'https://github.com/Vp9191',
        linkedin: 'https://www.linkedin.com/in/vedant-link',
        email: 'pvedant091@gmail.com',
        photo: '/creators/vedant.jpg',
        initials: 'VP',
        color: '#3b82f6'
    },
    {
        name: 'Harshvardhan P.',
        github: 'https://github.com/fevnax',
        linkedin: 'https://www.linkedin.com/in/fevnax',
        email: 'haru54709@gmail.com',
        photo: '/creators/harsh.jpg',
        initials: 'HP',
        color: '#8b5cf6'
    },
    {
        name: 'Ritik J.',
        github: 'https://github.com/Ritikjagtap11',
        linkedin: 'https://linkedin.com/in/ritik-jagtap-link',
        email: 'jagtapritik8@gmail.com',
        photo: '/creators/ritik.jpg',
        initials: 'RJ',
        color: '#22c55e'
    }
];

export default function Footer() {
    return (
        <footer className="footer" id="footer-section">
            <div className="container">
                <div className="footer-header">
                    <h2 className="footer-title">Meet the Creators</h2>
                    <p className="footer-subtitle">The team behind Integrity</p>
                </div>

                <div className="footer-cards">
                    {creators.map((creator, index) => (
                        <div className="creator-card glass-card" key={index} id={`creator-card-${index}`}>
                            <div
                                className="creator-avatar"
                                style={{ background: `linear-gradient(135deg, ${creator.color}, ${creator.color}88)` }}
                            >
                                {creator.photo ? (
                                    <img
                                        src={creator.photo}
                                        alt={creator.name}
                                        className="creator-photo"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'block';
                                        }}
                                    />
                                ) : null}
                                <span
                                    className="creator-initials"
                                    style={creator.photo ? { display: 'none' } : {}}
                                >
                                    {creator.initials}
                                </span>
                            </div>
                            <h3 className="creator-name">{creator.name}</h3>
                            <div className="creator-links">
                                <a
                                    href={creator.github}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="creator-link"
                                    aria-label={`${creator.name} GitHub`}
                                >
                                    <Github size={18} />
                                </a>
                                <a
                                    href={creator.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="creator-link"
                                    aria-label={`${creator.name} LinkedIn`}
                                >
                                    <Linkedin size={18} />
                                </a>
                                <a
                                    href={`mailto:${creator.email}`}
                                    className="creator-link"
                                    aria-label={`Email ${creator.name}`}
                                >
                                    <Mail size={18} />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="footer-bottom">
                    <p className="footer-copyright">
                        &copy; {new Date().getFullYear()} Integrity. Built with purpose.
                    </p>
                </div>
            </div>
        </footer>
    );
}
