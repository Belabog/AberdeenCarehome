import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone } from 'lucide-react';
import CalendlyWidget from './CalendlyWidget';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCalendlyOpen, setIsCalendlyOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const openCalendly = () => {
    setIsCalendlyOpen(true);
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className={`fixed w-full z-50 transition-all duration-500 ${isScrolled ? 'bg-warm-ivory/90 backdrop-blur-md shadow-sm' : 'bg-transparent lg:bg-transparent bg-warm-ivory/80 backdrop-blur-md shadow-sm'}`}>
        <nav className="w-full px-6 py-5">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <img
                src="/ChatGPT_Image_Mar_1,_2026,_09_55_21_AM.png"
                alt="Aberdeen Manor Logo"
                className="w-14 h-14 lg:w-11 lg:h-11 object-contain"
              />
              <div className="text-2xl font-bold tracking-tight hidden lg:block">
                <span className={`transition-colors duration-500 ${isScrolled ? 'text-velvet-green' : 'text-white'}`}>Aberdeen Manor</span>
              </div>
            </Link>

            <div className="hidden lg:flex items-center space-x-1">
              <Link to="/about" className={`px-4 py-2 transition-colors duration-300 rounded-lg ${isScrolled ? 'text-soft-charcoal hover:text-antique-brass' : 'text-white hover:text-antique-brass hover:bg-white/10'}`}>About Us</Link>
              <Link to="/services" className={`px-4 py-2 transition-colors duration-300 rounded-lg ${isScrolled ? 'text-soft-charcoal hover:text-antique-brass' : 'text-white hover:text-antique-brass hover:bg-white/10'}`}>Services</Link>
              <Link to="/blog" className={`px-4 py-2 transition-colors duration-300 rounded-lg ${isScrolled ? 'text-soft-charcoal hover:text-antique-brass' : 'text-white hover:text-antique-brass hover:bg-white/10'}`}>Blog</Link>
              <a href="tel:+19168037498" className={`flex items-center gap-2 px-4 py-2 transition-colors duration-300 rounded-lg group ${isScrolled ? 'text-soft-charcoal hover:text-antique-brass' : 'text-white hover:text-antique-brass hover:bg-white/10'}`}>
                <Phone size={18} />
                <span>(916) 803-7498</span>
              </a>
              <button onClick={openCalendly} className="ml-2 bg-velvet-green text-white px-6 py-2.5 rounded-xl hover:bg-evergreen-shadow hover:shadow-lg hover:shadow-velvet-green/20 transition-all duration-300 font-medium">
                Schedule Tour
              </button>
            </div>

            <button
              className={`lg:hidden p-2 rounded-lg transition ${isScrolled ? 'text-soft-charcoal hover:bg-velvet-green/10' : 'text-white hover:bg-white/10'}`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {isMenuOpen && (
            <div className="lg:hidden mt-6 pb-6 space-y-2 animate-in slide-in-from-top">
              <Link to="/about" className={`block w-full text-left px-4 py-3 transition-colors rounded-lg ${isScrolled ? 'text-soft-charcoal hover:text-antique-brass hover:bg-velvet-green/5' : 'text-white hover:text-antique-brass hover:bg-white/10'}`}>About Us</Link>
              <Link to="/services" className={`block w-full text-left px-4 py-3 transition-colors rounded-lg ${isScrolled ? 'text-soft-charcoal hover:text-antique-brass hover:bg-velvet-green/5' : 'text-white hover:text-antique-brass hover:bg-white/10'}`}>Services</Link>
              <Link to="/blog" className={`block w-full text-left px-4 py-3 transition-colors rounded-lg ${isScrolled ? 'text-soft-charcoal hover:text-antique-brass hover:bg-velvet-green/5' : 'text-white hover:text-antique-brass hover:bg-white/10'}`}>Blog</Link>
              <a href="tel:+19168037498" className={`flex items-center gap-2 w-full px-4 py-3 transition-colors rounded-lg ${isScrolled ? 'text-soft-charcoal hover:text-antique-brass hover:bg-velvet-green/5' : 'text-white hover:text-antique-brass hover:bg-white/10'}`}>
                <Phone size={18} />
                <span>(916) 803-7498</span>
              </a>
              <button onClick={openCalendly} className="block w-full text-left mt-2 bg-velvet-green text-white px-6 py-3 rounded-xl font-medium">
                Schedule Tour
              </button>
            </div>
          )}
        </nav>
      </header>
      <CalendlyWidget isOpen={isCalendlyOpen} onClose={() => setIsCalendlyOpen(false)} />
    </>
  );
}
