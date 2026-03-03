import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import FeaturesSection from '../components/FeaturesSection';
import Footer from '../components/Footer';

export default function Landing() {
    return (
        <div className="page-landing" id="landing-page">
            <Navbar />
            <HeroSection />
            <FeaturesSection />
            <Footer />
        </div>
    );
}
