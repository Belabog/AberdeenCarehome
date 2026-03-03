import { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LoadingScreen from '../components/LoadingScreen';
import VideoBackdrop from '../components/VideoBackdrop';
import CalendlyWidget from '../components/CalendlyWidget';
import { supabase } from '../lib/supabase';
import { useSiteImages } from '../lib/useSiteImage';
import { Calendar, ChevronRight, Star, MapPin, Phone, Mail } from 'lucide-react';

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [heroVideoUrl, setHeroVideoUrl] = useState<string | undefined>(undefined);
  const [arialVideoUrl, setArialVideoUrl] = useState<string | undefined>(undefined);
  const [isCalendlyOpen, setIsCalendlyOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const siteImages = useSiteImages([
    { key: 'home-card-1', fallback: '/card_2.jpg' },
    { key: 'home-card-2', fallback: '/Card_1.jpg' },
    { key: 'home-card-3', fallback: '/card_3.jpg' },
    { key: 'home-location-top', fallback: '/Memory_Care.jpg' },
    { key: 'home-location-bottom-left', fallback: '/card_2.jpg' },
    { key: 'home-location-bottom-right', fallback: '/Services_4.jpg' },
  ]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    async function fetchHeroVideo() {
      const { data } = await supabase
        .from('videos')
        .select('storage_path')
        .eq('section_name', 'hero')
        .eq('is_active', true)
        .maybeSingle();

      if (data) {
        const { data: urlData } = supabase.storage
          .from('videos')
          .getPublicUrl(data.storage_path);
        setHeroVideoUrl(urlData.publicUrl);
      }
    }

    fetchHeroVideo();

    async function fetchArialVideo() {
      const { data } = await supabase
        .from('videos')
        .select('storage_path')
        .ilike('title', '%arial%')
        .maybeSingle();

      if (data) {
        const { data: urlData } = supabase.storage
          .from('videos')
          .getPublicUrl(data.storage_path);
        setArialVideoUrl(urlData.publicUrl);
      }
    }

    fetchArialVideo();

    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set(prev).add(entry.target.id));
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
    );

    const sections = document.querySelectorAll('[data-animate]');
    sections.forEach((section) => {
      if (observerRef.current) {
        observerRef.current.observe(section);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loading]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-warm-ivory">
      <Header />

      <section className="relative min-h-screen overflow-hidden bg-evergreen-shadow" data-animate id="hero">
        <VideoBackdrop
          videoUrl={heroVideoUrl}
          overlayOpacity={0.15}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-evergreen-shadow/40 via-transparent to-evergreen-shadow/60"></div>
        <div className="relative z-10 w-full px-6 pt-80 flex items-center">
          <div className="animate-fade-in-up animation-delay-200 max-w-2xl">
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
              Life's journey<br />defined by <span className="text-antique-brass">you</span>
            </h1>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 z-10 pb-16">
          <div className="w-full px-6">
            <div className="space-y-8">
              <div className="text-center animate-fade-in-up animation-delay-400">
                <p className="text-xl md:text-2xl text-white/90 leading-relaxed font-light mb-8">
                  Experience truly personalized care designed to improve your life
                </p>
                <button
                  onClick={() => setIsCalendlyOpen(true)}
                  className="group bg-velvet-green text-white px-8 py-5 rounded-2xl hover:bg-evergreen-shadow hover:shadow-2xl hover:shadow-velvet-green/30 transition-all duration-300 flex items-center justify-center gap-3 text-lg font-semibold w-full sm:w-auto sm:min-w-[340px] mx-auto border border-moss-silk/30"
                >
                  <Calendar size={24} />
                  Schedule Your Personal Tour
                  <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="relative py-20 md:py-32 overflow-hidden bg-warm-ivory" data-animate>
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-sage-mist/30 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-velvet-green/5 to-transparent rounded-full blur-3xl"></div>
        <div className="relative container mx-auto px-6">
          <div className="max-w-4xl mx-auto mb-16">
            <h2 className={`text-4xl md:text-5xl font-bold text-evergreen-shadow mb-8 text-center transition-all duration-1000 ${visibleSections.has('about') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              A New Level<br />of Elderly Care
            </h2>
            <div className="prose prose-lg max-w-none leading-relaxed space-y-6">
              <p className={`text-lg md:text-xl text-soft-charcoal text-center transition-all duration-1000 delay-150 ${visibleSections.has('about') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                We believe every resident deserves more than just care. They deserve a life with purpose,
                comfort, and joy. Our philosophy centers on individualized attention — treating each person as the unique individual
                they are, honoring their story, their preferences, and their needs.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className={`group relative overflow-hidden border border-sage-mist p-10 rounded-3xl hover:border-antique-brass hover:shadow-2xl hover:shadow-stone-taupe/30 transition-all duration-700 hover:-translate-y-2 ${visibleSections.has('about') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'} animation-delay-200`}
              style={{ backgroundImage: `url('${siteImages['home-card-1']}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
              <div className="absolute inset-0 bg-evergreen-shadow/65 rounded-3xl"></div>
              <div className="relative flex flex-col items-center text-center">
                <div className="w-14 h-14 mb-6"></div>
                <h3 className="text-2xl font-bold text-white mb-4">Personalized Care</h3>
                <p className="text-sage-mist leading-relaxed">
                  Every care plan is tailored specifically for each resident, honoring their lifestyle preferences and health needs.
                </p>
              </div>
            </div>

            <div className={`group relative overflow-hidden border border-sage-mist p-10 rounded-3xl hover:border-antique-brass hover:shadow-2xl hover:shadow-stone-taupe/30 transition-all duration-700 hover:-translate-y-2 ${visibleSections.has('about') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'} animation-delay-400`}
              style={{ backgroundImage: `url('${siteImages['home-card-2']}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
              <div className="absolute inset-0 bg-evergreen-shadow/65 rounded-3xl"></div>
              <div className="relative flex flex-col items-center text-center">
                <div className="w-14 h-14 mb-6"></div>
                <h3 className="text-2xl font-bold text-white mb-4">Professional Excellence</h3>
                <p className="text-sage-mist leading-relaxed">
                  Licensed, compassionate staff bring decades of experience in elderly care with a commitment to dignity and respect.
                </p>
              </div>
            </div>

            <div className={`group relative overflow-hidden border border-sage-mist p-10 rounded-3xl hover:border-antique-brass hover:shadow-2xl hover:shadow-stone-taupe/30 transition-all duration-700 hover:-translate-y-2 ${visibleSections.has('about') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'} animation-delay-600`}
              style={{ backgroundImage: `url('${siteImages['home-card-3']}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
              <div className="absolute inset-0 bg-evergreen-shadow/65 rounded-3xl"></div>
              <div className="relative flex flex-col items-center text-center">
                <div className="w-14 h-14 mb-6"></div>
                <h3 className="text-2xl font-bold text-white mb-4">Community Connection</h3>
                <p className="text-sage-mist leading-relaxed">
                  We foster meaningful relationships and social engagement through curated activities and communal spaces.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative bg-velvet-green py-16">
        <div className="w-full px-6">
          <div>
            <h3 className="text-white text-2xl md:text-3xl font-serif text-center mb-8">
              Learn More About Aberdeen Manor Today
            </h3>
            <form className="grid md:grid-cols-4 gap-4 items-end">
              <div>
                <input
                  type="text"
                  placeholder="NAME"
                  required
                  className="w-full bg-transparent border-b-2 border-white/30 text-white placeholder-white/60 py-3 px-2 focus:border-antique-brass focus:outline-none transition text-lg uppercase tracking-wide font-sans"
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="EMAIL"
                  required
                  className="w-full bg-transparent border-b-2 border-white/30 text-white placeholder-white/60 py-3 px-2 focus:border-antique-brass focus:outline-none transition text-lg uppercase tracking-wide font-sans"
                />
              </div>
              <div>
                <input
                  type="tel"
                  placeholder="PHONE"
                  required
                  className="w-full bg-transparent border-b-2 border-white/30 text-white placeholder-white/60 py-3 px-2 focus:border-antique-brass focus:outline-none transition text-lg uppercase tracking-wide font-sans"
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full bg-antique-brass hover:bg-antique-brass/80 text-white font-semibold py-4 px-8 transition-all duration-300 flex items-center justify-center gap-2 group"
                >
                  <span className="uppercase tracking-wide font-sans">Submit</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m0 0l-3-3m3 3l-3 3"/>
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <section id="services" className="relative py-20 md:py-32 overflow-hidden bg-sage-mist/20" data-animate>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-[-35%] w-[1067px] h-[800px] bg-velvet-green/5 rounded-[50%] blur-3xl"></div>
        <div className="relative container mx-auto px-6">
          <div className="max-w-4xl mx-auto mb-16">
            <h2 className={`text-4xl md:text-5xl font-bold text-evergreen-shadow mb-8 text-center transition-all duration-1000 ${visibleSections.has('services') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              Guided with Compassion
            </h2>
            <div className="prose prose-lg max-w-none leading-relaxed">
              <p className={`text-lg md:text-xl text-soft-charcoal text-center transition-all duration-1000 delay-150 ${visibleSections.has('services') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                Comprehensive suite of services designed to enhance quality of life while maintaining independence and dignity
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className={`bg-warm-ivory/80 backdrop-blur-sm p-10 rounded-2xl border border-sage-mist hover:border-antique-brass hover:shadow-xl transition-all duration-700 hover:-translate-y-1 ${visibleSections.has('services') ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'} animation-delay-200`}>
              <h3 className="text-2xl font-bold text-evergreen-shadow mb-6">
                Daily Living Assistance
              </h3>
              <ul className="space-y-4 text-soft-charcoal">
                <li className="flex items-start gap-3">
                  <span className="text-antique-brass mt-1 text-lg">•</span>
                  <span className="text-lg">Assistance with dressing, bathing, and grooming</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-antique-brass mt-1 text-lg">•</span>
                  <span className="text-lg">Personalized medication management and storage</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-antique-brass mt-1 text-lg">•</span>
                  <span className="text-lg">Mobility support and fall prevention programs</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-antique-brass mt-1 text-lg">•</span>
                  <span className="text-lg">Licensed care staff available 24/7</span>
                </li>
              </ul>
            </div>

            <div className={`bg-warm-ivory/80 backdrop-blur-sm p-10 rounded-2xl border border-sage-mist hover:border-antique-brass hover:shadow-xl transition-all duration-700 hover:-translate-y-1 ${visibleSections.has('services') ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'} animation-delay-200`}>
              <h3 className="text-2xl font-bold text-evergreen-shadow mb-6">
                Gourmet Dining
              </h3>
              <ul className="space-y-4 text-soft-charcoal">
                <li className="flex items-start gap-3">
                  <span className="text-antique-brass mt-1 text-lg">•</span>
                  <span className="text-lg">Homemade meals with unique dietary considerations</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-antique-brass mt-1 text-lg">•</span>
                  <span className="text-lg">Fresh ingredients from the farm-to-fork capital</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-antique-brass mt-1 text-lg">•</span>
                  <span className="text-lg">Comprehensive meal plans prioritizing resident preferences</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-antique-brass mt-1 text-lg">•</span>
                  <span className="text-lg">Accommodations for special dietary needs and restrictions</span>
                </li>
              </ul>
            </div>

            <div className={`bg-warm-ivory/80 backdrop-blur-sm p-10 rounded-2xl border border-sage-mist hover:border-antique-brass hover:shadow-xl transition-all duration-700 hover:-translate-y-1 ${visibleSections.has('services') ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'} animation-delay-400`}>
              <h3 className="text-2xl font-bold text-evergreen-shadow mb-6">
                Wellness & Activities
              </h3>
              <ul className="space-y-4 text-soft-charcoal">
                <li className="flex items-start gap-3">
                  <span className="text-antique-brass mt-1 text-lg">•</span>
                  <span className="text-lg">Activity programs tailored for each individual</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-antique-brass mt-1 text-lg">•</span>
                  <span className="text-lg">Engaging social and cultural enrichment events</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-antique-brass mt-1 text-lg">•</span>
                  <span className="text-lg">Gardening and patio living area with views of Folsom Lake</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-antique-brass mt-1 text-lg">•</span>
                  <span className="text-lg">Stimulating mental exercises to preserve cognitive function</span>
                </li>
              </ul>
            </div>

            <div className={`bg-warm-ivory/80 backdrop-blur-sm p-10 rounded-2xl border border-sage-mist hover:border-antique-brass hover:shadow-xl transition-all duration-700 hover:-translate-y-1 ${visibleSections.has('services') ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'} animation-delay-400`}>
              <h3 className="text-2xl font-bold text-evergreen-shadow mb-6">
                Concierge Services
              </h3>
              <ul className="space-y-4 text-soft-charcoal">
                <li className="flex items-start gap-3">
                  <span className="text-antique-brass mt-1 text-lg">•</span>
                  <span className="text-lg">Accompanying residents to appointments and organizing transport</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-antique-brass mt-1 text-lg">•</span>
                  <span className="text-lg">Coordinating healthcare providers and home health teams</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-antique-brass mt-1 text-lg">•</span>
                  <span className="text-lg">Clear communication with families, care staff, and providers </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-antique-brass mt-1 text-lg">•</span>
                  <span className="text-lg">Prescription and pharmacy management</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="location" className="relative py-20 md:py-32 bg-warm-ivory" data-animate>
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto mb-16">
            <h2 className={`text-4xl md:text-5xl font-bold text-evergreen-shadow mb-8 text-center transition-all duration-1000 ${visibleSections.has('location') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              Set on the<br />Perfect Stage
            </h2>
            <div className="prose prose-lg max-w-none leading-relaxed space-y-6">
              <p className={`text-lg md:text-xl text-soft-charcoal text-center transition-all duration-1000 delay-150 ${visibleSections.has('location') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                Nestled in Northern California's most desirable community, Aberdeen Manor offers the perfect blend of natural beauty, suburban tranquility, and convenient access to necessary amenities. A warm homey atmosphere and breathtaking views, perfect for those seeking a peaceful setting.
              </p>
            </div>
          </div>

          <div className={`flex flex-col md:flex-row gap-4 transition-all duration-1000 ${visibleSections.has('location') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'} animation-delay-300`}>
            <div className="flex flex-col gap-3 flex-1" style={{minHeight: '580px'}}>
              <div className="relative overflow-hidden shadow-lg" style={{height: '40%'}}>
                <img src={siteImages['home-location-top']} alt="Aberdeen Manor memory care" className="w-full h-full object-cover" />
              </div>
              <div className="flex gap-3" style={{height: 'calc(60% - 0.75rem)'}}>
                <div className="relative overflow-hidden shadow-lg flex-1">
                  <img src={siteImages['home-location-bottom-left']} alt="Aberdeen Manor lobby" className="w-full h-full object-cover" />
                </div>
                <div className="relative overflow-hidden shadow-lg flex-1">
                  <img src={siteImages['home-location-bottom-right']} alt="Aberdeen Manor dining room" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden shadow-lg flex-1" style={{minHeight: '580px'}}>
              {arialVideoUrl ? (
                <video
                  src={arialVideoUrl}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              ) : (
                <div className="w-full h-full bg-sage-mist/30 flex items-center justify-center">
                  <span className="text-moss-silk">Loading video...</span>
                </div>
              )}
            </div>
          </div>

          <div className="max-w-4xl mx-auto mt-12">
            <div className="prose prose-lg max-w-none leading-relaxed space-y-6">
              <p className={`text-lg md:text-xl text-soft-charcoal text-center transition-all duration-1000 delay-500 ${visibleSections.has('location') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                Surrounded by rolling hills, oak trees, and picturesque trails, El Dorado Hills is a welcoming community. Residents and families enjoy a vibrant lifestyle with access to award-winning parks, premier medical facilities, fine dining, and entertainment options. Over 260 days of sunshine annually and mild seasons make El Dorado Hills the perfect climate for year-round outdoor activities and comfortable living.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="relative py-20 md:py-32 overflow-hidden bg-sage-mist/15" data-animate>
        <div className="absolute top-1/2 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-velvet-green/5 to-transparent rounded-full blur-3xl -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-sage-mist/20 to-transparent rounded-full blur-3xl"></div>
        <div className="relative container mx-auto px-6">
          <div>
            <div className="max-w-4xl mx-auto mb-16">
              <h2 className={`text-4xl md:text-5xl font-bold text-evergreen-shadow mb-8 text-center transition-all duration-1000 ${visibleSections.has('contact') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                Begin Your Journey with Us
              </h2>
              <div className="prose prose-lg max-w-none leading-relaxed">
                <p className={`text-lg md:text-xl text-soft-charcoal text-center transition-all duration-1000 delay-150 ${visibleSections.has('contact') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                  We invite you to experience Aberdeen Manor firsthand. Schedule a personal tour, meet our staff,
                  and discover how we can enhance your loved one's quality of life.
                </p>
              </div>
            </div>

            <div>
              <div className="grid md:grid-cols-3 gap-8">
                <a href="tel:+19168037498" className={`flex flex-col items-center text-center p-6 bg-warm-ivory/80 backdrop-blur-sm rounded-2xl border border-sage-mist hover:border-antique-brass hover:shadow-xl hover:-translate-y-2 transition-all duration-500 cursor-pointer ${visibleSections.has('contact') ? 'opacity-100 scale-100' : 'opacity-0 scale-90'} animation-delay-200`}>
                  <div className="w-16 h-16 rounded-xl bg-velvet-green flex items-center justify-center mb-4">
                    <Phone size={24} className="text-antique-brass" />
                  </div>
                  <p className="font-bold text-evergreen-shadow text-xl">Call Us</p>
                </a>

                <a href="mailto:alex@aberdeencarehomes.com?subject=Aberdeen Manor Inquiry" className={`flex flex-col items-center text-center p-6 bg-warm-ivory/80 backdrop-blur-sm rounded-2xl border border-sage-mist hover:border-antique-brass hover:shadow-xl hover:-translate-y-2 transition-all duration-500 cursor-pointer ${visibleSections.has('contact') ? 'opacity-100 scale-100' : 'opacity-0 scale-90'} animation-delay-400`}>
                  <div className="w-16 h-16 rounded-xl bg-velvet-green flex items-center justify-center mb-4">
                    <Mail size={24} className="text-antique-brass" />
                  </div>
                  <p className="font-bold text-evergreen-shadow text-xl">Email Us</p>
                </a>

                <a href="https://www.google.com/maps/search/?api=1&query=2932+Aberdeen+Ln+El+Dorado+Hills+CA+95762" target="_blank" rel="noopener noreferrer" className={`flex flex-col items-center text-center p-6 bg-warm-ivory/80 backdrop-blur-sm rounded-2xl border border-sage-mist hover:border-antique-brass hover:shadow-xl hover:-translate-y-2 transition-all duration-500 cursor-pointer ${visibleSections.has('contact') ? 'opacity-100 scale-100' : 'opacity-0 scale-90'} animation-delay-600`}>
                  <div className="w-16 h-16 rounded-xl bg-velvet-green flex items-center justify-center mb-4">
                    <MapPin className="text-antique-brass" size={24} />
                  </div>
                  <p className="font-bold text-evergreen-shadow text-xl">Visit Us</p>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="testimonials" className="relative py-20 md:py-32 overflow-hidden bg-warm-ivory" data-animate>
        <div className="absolute top-0 left-0 w-[750px] h-[750px] bg-gradient-to-br from-sage-mist/20 to-transparent rounded-full blur-3xl"></div>
        <div className="relative container mx-auto px-6">
          <div className="max-w-4xl mx-auto mb-16">
            <h2 className={`text-4xl md:text-5xl font-bold text-evergreen-shadow mb-8 text-center transition-all duration-1000 ${visibleSections.has('testimonials') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              The Trust in Us
            </h2>
            <div className="prose prose-lg max-w-none leading-relaxed">
              <p className={`text-lg md:text-xl text-soft-charcoal text-center transition-all duration-1000 delay-150 ${visibleSections.has('testimonials') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                Our greatest honor
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className={`bg-white p-10 rounded-3xl border border-sage-mist hover:border-antique-brass hover:shadow-2xl hover:-translate-y-2 transition-all duration-700 flex flex-col ${visibleSections.has('testimonials') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'} animation-delay-200`}>
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="text-antique-brass fill-antique-brass" size={20} />
                ))}
              </div>
              <p className="text-soft-charcoal leading-relaxed mb-8 text-lg italic flex-1">
                "Moving my mother to Aberdeen Manor was one of the best decisions our family has made. The staff treats her
                like family, and she's thriving in ways we never imagined. She's made wonderful friends, participates in
                activities daily, and her health has improved dramatically. We finally have peace of mind."
              </p>
              <div className="text-right mt-auto">
                <p className="font-bold text-evergreen-shadow text-lg font-sans">Margaret Chen</p>
                <p className="text-stone-taupe font-sans">Daughter of Resident</p>
              </div>
            </div>

            <div className={`bg-white p-10 rounded-3xl border border-sage-mist hover:border-antique-brass hover:shadow-2xl hover:-translate-y-2 transition-all duration-700 flex flex-col ${visibleSections.has('testimonials') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'} animation-delay-400`}>
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="text-antique-brass fill-antique-brass" size={20} />
                ))}
              </div>
              <p className="text-soft-charcoal leading-relaxed mb-8 text-lg italic flex-1">
                "What sets Aberdeen Manor apart is their genuine care and attention to detail. They know Dad's preferences,
                his routines, even his favorite meal. The concierge approach isn't just marketing—it's how they operate
                every single day. We're so grateful for the love they show him."
              </p>
              <div className="text-right mt-auto">
                <p className="font-bold text-evergreen-shadow text-lg font-sans">Robert & Susan Williams</p>
                <p className="text-stone-taupe font-sans">Son and Daughter-in-Law of Resident</p>
              </div>
            </div>

            <div className={`bg-white p-10 rounded-3xl border border-sage-mist hover:border-antique-brass hover:shadow-2xl hover:-translate-y-2 transition-all duration-700 flex flex-col ${visibleSections.has('testimonials') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'} animation-delay-400`}>
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="text-antique-brass fill-antique-brass" size={20} />
                ))}
              </div>
              <p className="text-soft-charcoal leading-relaxed mb-8 text-lg italic flex-1">
                "After touring multiple facilities, Aberdeen Manor stood out immediately. The warmth, the beautiful setting,
                and most importantly, the quality of care is exceptional. My grandmother says she wishes she had moved here
                sooner. The staff's professionalism and compassion give us tremendous comfort."
              </p>
              <div className="text-right mt-auto">
                <p className="font-bold text-evergreen-shadow text-lg font-sans">Jennifer Martinez</p>
                <p className="text-stone-taupe font-sans">Granddaughter of Resident</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <CalendlyWidget isOpen={isCalendlyOpen} onClose={() => setIsCalendlyOpen(false)} />
    </div>
  );
}
