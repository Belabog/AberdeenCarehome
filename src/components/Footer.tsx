import { Link, useLocation } from 'react-router-dom';
import { Phone, MapPin } from 'lucide-react';

export default function Footer() {
  const location = useLocation();

  const scrollToSection = (id: string) => {
    if (location.pathname !== '/') {
      window.location.href = `/#${id}`;
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="bg-evergreen-shadow text-white py-4 md:py-8">
      <div className="w-full px-6">
        <div className="grid grid-cols-[auto_auto_auto] md:grid-cols-4 gap-x-1 md:gap-8 mb-3 md:mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2 md:mb-3">
              <img
                src="/ChatGPT_Image_Mar_1,_2026,_09_55_21_AM.png"
                alt="Aberdeen Manor Logo"
                className="w-8 h-8 object-contain"
              />
              <h3 className="text-base md:text-lg font-bold">Aberdeen Manor</h3>
            </div>
            <p className="text-sage-mist leading-relaxed text-xs md:text-sm hidden md:block">
              Bespoke Assisted Living & Elderly Care in El Dorado Hills.
            </p>
          </div>

          <div>
            <h4 className="font-sans font-bold text-sm md:text-sm mb-2 md:mb-3 uppercase tracking-wide text-center md:text-left">Quick Links</h4>
            <div className="space-y-1 md:space-y-2">
              <Link to="/about" className="block text-sage-mist hover:text-antique-brass transition text-sm md:text-sm">About Us</Link>
              <Link to="/services" className="block text-sage-mist hover:text-antique-brass transition text-sm md:text-sm">Services</Link>
              <button onClick={() => scrollToSection('location')} className="block text-sage-mist hover:text-antique-brass transition text-sm md:text-sm">Location</button>
              <Link to="/blog" className="block text-sage-mist hover:text-antique-brass transition text-sm md:text-sm">Blog</Link>
            </div>
          </div>

          <div className="hidden md:block">
            <h4 className="font-sans font-bold text-xs md:text-sm mb-2 md:mb-3 uppercase tracking-wide">Services</h4>
            <div className="space-y-1 md:space-y-2 text-sage-mist text-xs md:text-sm">
              <p>Daily Living</p>
              <p>Medication Mgmt</p>
              <p>Activities</p>
              <p>Concierge</p>
            </div>
          </div>

          <div>
            <h4 className="font-sans font-bold text-sm md:text-sm mb-2 md:mb-3 uppercase tracking-wide text-center md:text-left">Contact</h4>
            <div className="space-y-1 md:space-y-2">
              <a href="tel:+19168037498" className="flex items-center gap-2 text-sage-mist hover:text-antique-brass transition text-sm md:text-sm">
                <Phone size={14} className="md:hidden" />
                <Phone size={14} className="hidden md:block" />
                <span>(916) 803-7498</span>
              </a>
              <div className="flex items-start gap-2 text-sage-mist text-sm md:text-sm">
                <MapPin size={14} className="mt-0.5 flex-shrink-0 md:hidden" />
                <MapPin size={14} className="mt-0.5 flex-shrink-0 hidden md:block" />
                <span>2932 Aberdeen Ln<br />El Dorado Hills, CA 95762</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-moss-silk/30 pt-2 md:pt-4 flex flex-col md:flex-row justify-between items-center gap-1 md:gap-0 text-sage-mist text-xs">
          <p>&copy; 2025 Aberdeen Manor. All rights reserved.</p>
          <p>RCFE License #097003566</p>
        </div>
      </div>
    </footer>
  );
}
