import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LoadingScreen from '../components/LoadingScreen';
import VideoBackdrop from '../components/VideoBackdrop';
import CalendlyWidget from '../components/CalendlyWidget';
import { supabase } from '../lib/supabase';
import { useSiteImages } from '../lib/useSiteImage';
import { CheckCircle2, Calendar } from 'lucide-react';

export default function Services() {
  const [loading, setLoading] = useState(true);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [heroVideoUrl, setHeroVideoUrl] = useState<string | undefined>(undefined);
  const [isCalendlyOpen, setIsCalendlyOpen] = useState(false);

  const siteImages = useSiteImages([
    { key: 'services-daily-living', fallback: '/toothbrush.jpg' },
    { key: 'services-memory-care', fallback: '/Memory_Care.jpg' },
    { key: 'services-concierge', fallback: '/the-elderly-father-and-middle-aged-son-talking-in-2026-01-09-07-42-33-utc.jpg' },
    { key: 'services-dining', fallback: '/Services_4.jpg' },
  ]);

  useEffect(() => {
    async function init() {
      const { data } = await supabase
        .from('videos')
        .select('storage_path')
        .eq('title', 'Hands')
        .maybeSingle();

      if (data?.storage_path) {
        const { data: { publicUrl } } = supabase.storage
          .from('videos')
          .getPublicUrl(data.storage_path);
        setHeroVideoUrl(publicUrl);
      }

      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
    init();
  }, []);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setVisibleSections(prev => new Set(prev).add(entry.target.id));
        }
      });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('[data-animate]');
    animatedElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [loading]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-warm-ivory">
      <Header />

      <section className="relative min-h-[60vh] overflow-hidden bg-evergreen-shadow">
        <VideoBackdrop
          videoUrl={heroVideoUrl}
          overlayOpacity={0.1}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-evergreen-shadow/40 via-transparent to-evergreen-shadow/60"></div>

        <div className="relative z-10 container mx-auto px-6 pb-16 flex flex-col justify-end min-h-[60vh]">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6 animate-[fadeInUp_1s_ease-out_0.2s_both] whitespace-nowrap">
              <span className="text-antique-brass">Serving</span> Your Needs With Dignity
            </h1>
            <p className="text-xl md:text-2xl text-white leading-relaxed font-light animate-[fadeInUp_1s_ease-out_0.4s_both]">
              Pillars of service designed to enhance every aspect of daily life
            </p>
          </div>
        </div>
      </section>

      <section className="relative py-32 overflow-hidden bg-warm-ivory">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-sage-mist/30 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-velvet-green/5 to-transparent rounded-full blur-3xl"></div>
        <div className="relative container mx-auto px-6">
          <div className="max-w-6xl mx-auto space-y-32">

            <div className="grid md:grid-cols-2 gap-12 items-center" data-animate id="service-1">
              <div className={`transition-all duration-700 ${visibleSections.has('service-1') ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
                <h2 className="text-4xl md:text-5xl font-bold text-evergreen-shadow mb-6">Daily Living Assistance</h2>
                <p className="text-xl text-soft-charcoal leading-relaxed mb-8">
                  Our compassionate team provides personalized support for all activities of daily living. Ensuring
                  residents maintain their dignity and quality of life, on their terms.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="text-antique-brass flex-shrink-0 mt-1" size={22} />
                    <div>
                      <h4 className="font-bold text-evergreen-shadow text-lg mb-1">Personalized Morning & Evening Routines</h4>
                      <p className="text-soft-charcoal">Assistance with bathing, grooming, dressing, and personal hygiene tailored to individual preferences and schedules</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="text-antique-brass flex-shrink-0 mt-1" size={22} />
                    <div>
                      <h4 className="font-bold text-evergreen-shadow text-lg mb-1">Medication Management</h4>
                      <p className="text-soft-charcoal">Licensed staff ensure proper medication administration with careful tracking, reminders, and coordination with healthcare providers</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="text-antique-brass flex-shrink-0 mt-1" size={22} />
                    <div>
                      <h4 className="font-bold text-evergreen-shadow text-lg mb-1">Mobility & Safety Support</h4>
                      <p className="text-soft-charcoal">Expert assistance with walking, transferring, and fall prevention to maintain mobility and confidence</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="text-antique-brass flex-shrink-0 mt-1" size={22} />
                    <div>
                      <h4 className="font-bold text-evergreen-shadow text-lg mb-1">24/7 Professional Care</h4>
                      <p className="text-soft-charcoal">Round-the-clock trained staff available for immediate assistance, providing peace of mind for families</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="text-antique-brass flex-shrink-0 mt-1" size={22} />
                    <div>
                      <h4 className="font-bold text-evergreen-shadow text-lg mb-1">Health Monitoring</h4>
                      <p className="text-soft-charcoal">Regular vital sign checks, symptom monitoring, and prompt communication with medical professionals</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className={`relative h-[600px] rounded-3xl overflow-hidden shadow-2xl border border-sage-mist transition-all duration-700 delay-200 ${visibleSections.has('service-1') ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-12 scale-95'}`}>
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${siteImages['services-daily-living']}')` }}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-velvet-green/10 to-transparent"></div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center" data-animate id="service-2">
              <div className={`order-2 md:order-1 relative h-[600px] rounded-3xl overflow-hidden shadow-2xl border border-sage-mist transition-all duration-700 delay-200 ${visibleSections.has('service-2') ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 -translate-x-12 scale-95'}`}>
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${siteImages['services-memory-care']}')` }}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-velvet-green/10 to-transparent"></div>
              </div>
              <div className={`order-1 md:order-2 transition-all duration-700 ${visibleSections.has('service-2') ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}>
                <h2 className="text-4xl md:text-5xl font-bold text-evergreen-shadow mb-6">Memory Care</h2>
                <p className="text-xl text-soft-charcoal leading-relaxed mb-8">
                  Specialized support for residents experiencing memory challenges. Delivered with compassion,
                  patience, and a gentleness that respects each person's circumstance.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="text-antique-brass flex-shrink-0 mt-1" size={22} />
                    <div>
                      <h4 className="font-bold text-evergreen-shadow text-lg mb-1">Cognitive Stimulation Programs</h4>
                      <p className="text-soft-charcoal">Engaging activities designed to maintain cognitive function, leveraging socialization, recall and cognition exercises</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="text-antique-brass flex-shrink-0 mt-1" size={22} />
                    <div>
                      <h4 className="font-bold text-evergreen-shadow text-lg mb-1">Structured Daily Routines</h4>
                      <p className="text-soft-charcoal">Consistent schedules that provide predictability and reduce anxiety while allowing for individual flexibility</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="text-antique-brass flex-shrink-0 mt-1" size={22} />
                    <div>
                      <h4 className="font-bold text-evergreen-shadow text-lg mb-1">Specialized Staff Training</h4>
                      <p className="text-soft-charcoal">Team members trained in dementia care, communication techniques, and behavioral management strategies</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="text-antique-brass flex-shrink-0 mt-1" size={22} />
                    <div>
                      <h4 className="font-bold text-evergreen-shadow text-lg mb-1">Safe Environment Design</h4>
                      <p className="text-soft-charcoal">Thoughtfully designed spaces that minimize confusion and maximize safety while maintaining a homelike atmosphere</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="text-antique-brass flex-shrink-0 mt-1" size={22} />
                    <div>
                      <h4 className="font-bold text-evergreen-shadow text-lg mb-1">Family Education & Support</h4>
                      <p className="text-soft-charcoal">Education and guidance to help families understand and navigate memory care challenges together</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center" data-animate id="service-3">
              <div className={`transition-all duration-700 ${visibleSections.has('service-3') ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
                <h2 className="text-4xl md:text-5xl font-bold text-evergreen-shadow mb-6">Concierge Services</h2>
                <p className="text-xl text-soft-charcoal leading-relaxed mb-8">
                  Lifestyle services that extend past daily care. Allowing residents and their families to enjoy
                  what truly matters: living their best lives.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="text-antique-brass flex-shrink-0 mt-1" size={22} />
                    <div>
                      <h4 className="font-bold text-evergreen-shadow text-lg mb-1">Your Personal Advocate</h4>
                      <p className="text-soft-charcoal">Informing families of things to expect, pitfalls to avoid, and hidden opportunity costs before decisions are made</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="text-antique-brass flex-shrink-0 mt-1" size={22} />
                    <div>
                      <h4 className="font-bold text-evergreen-shadow text-lg mb-1">Healthcare Coordination</h4>
                      <p className="text-soft-charcoal">Assistance scheduling appointments, communicating with doctors, and coordinating with healthcare providers</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="text-antique-brass flex-shrink-0 mt-1" size={22} />
                    <div>
                      <h4 className="font-bold text-evergreen-shadow text-lg mb-1">Transportation Services</h4>
                      <p className="text-soft-charcoal">Coordinating transportation to medical appointments, social outings, and community events</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="text-antique-brass flex-shrink-0 mt-1" size={22} />
                    <div>
                      <h4 className="font-bold text-evergreen-shadow text-lg mb-1">Activity & Social Planning</h4>
                      <p className="text-soft-charcoal">Curated social activities, cultural entertainment, and enrichment programs tailored to resident interests</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="text-antique-brass flex-shrink-0 mt-1" size={22} />
                    <div>
                      <h4 className="font-bold text-evergreen-shadow text-lg mb-1">Housekeeping & Laundry</h4>
                      <p className="text-soft-charcoal">Comprehensive housekeeping services and personal laundry care to maintain a clean, comfortable living spaces</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className={`relative h-[600px] rounded-3xl overflow-hidden shadow-2xl border border-sage-mist transition-all duration-700 delay-200 ${visibleSections.has('service-3') ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-12 scale-95'}`}>
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${siteImages['services-concierge']}')` }}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-velvet-green/10 to-transparent"></div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center" data-animate id="service-4">
              <div className={`order-2 md:order-1 relative h-[600px] rounded-3xl overflow-hidden shadow-2xl border border-sage-mist transition-all duration-700 delay-200 ${visibleSections.has('service-4') ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 -translate-x-12 scale-95'}`}>
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${siteImages['services-dining']}')` }}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-velvet-green/10 to-transparent"></div>
              </div>
              <div className={`order-1 md:order-2 transition-all duration-700 ${visibleSections.has('service-4') ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}>
                <h2 className="text-4xl md:text-5xl font-bold text-evergreen-shadow mb-6">Homemade Wellness</h2>
                <p className="text-xl text-soft-charcoal leading-relaxed mb-8">
                  Fresh meals prepared daily in our kitchen using quality ingredients, are nutritious and delicious.
                  Because good food nourishes not just the body but the soul.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="text-antique-brass flex-shrink-0 mt-1" size={22} />
                    <div>
                      <h4 className="font-bold text-evergreen-shadow text-lg mb-1">Fresh Home Cooking</h4>
                      <p className="text-soft-charcoal">Meals prepared from scratch daily using fresh ingredients. Real food that tastes like it should</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="text-antique-brass flex-shrink-0 mt-1" size={22} />
                    <div>
                      <h4 className="font-bold text-evergreen-shadow text-lg mb-1">Personalized Menus</h4>
                      <p className="text-soft-charcoal">Flexible meal plans that accommodate dietary restrictions, preferences, and favorite comfort foods</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="text-antique-brass flex-shrink-0 mt-1" size={22} />
                    <div>
                      <h4 className="font-bold text-evergreen-shadow text-lg mb-1">Nutritionist Approved</h4>
                      <p className="text-soft-charcoal">Meals designed to meet individual nutritional needs and goals, without losing flavor or variety</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="text-antique-brass flex-shrink-0 mt-1" size={22} />
                    <div>
                      <h4 className="font-bold text-evergreen-shadow text-lg mb-1">Family-Style Dining</h4>
                      <p className="text-soft-charcoal">Meals served in a warm, communal setting that stimulates conversation and encourages connections</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="text-antique-brass flex-shrink-0 mt-1" size={22} />
                    <div>
                      <h4 className="font-bold text-evergreen-shadow text-lg mb-1">Special Occasions</h4>
                      <p className="text-soft-charcoal">Holiday gatherings, Birthday celebrations, and special occasions that create new memories and deepen bonds</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-32 bg-warm-ivory" data-animate id="cta">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className={`text-4xl md:text-5xl font-bold text-evergreen-shadow mb-8 transition-all duration-1000 ${visibleSections.has('cta') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              Care You Design To Serve You
            </h2>
            <p className={`text-xl text-soft-charcoal leading-relaxed mb-12 transition-all duration-1000 delay-150 ${visibleSections.has('cta') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              Our comprehensive services work seamlessly to create a lifestyle of comfort,
              while removing stress. For the resident's and their families. Reach out to see how we can serve you.
            </p>
            <div className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-1000 ${visibleSections.has('cta') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ transitionDelay: visibleSections.has('cta') ? '200ms' : '0ms' }}>
              <button
                onClick={() => setIsCalendlyOpen(true)}
                className="inline-flex items-center justify-center gap-3 bg-velvet-green text-white px-8 py-4 rounded-xl hover:bg-evergreen-shadow hover:shadow-lg hover:shadow-velvet-green/20 transition-all duration-300 font-medium text-lg hover:scale-105"
              >
                <Calendar size={20} />
                Schedule Your Tour
              </button>
              <a
                href="tel:+19168037498"
                className="inline-flex items-center justify-center gap-3 border-2 border-velvet-green text-velvet-green px-8 py-4 rounded-xl hover:bg-velvet-green hover:text-white hover:shadow-lg transition-all duration-300 font-medium text-lg hover:scale-105"
              >
                Call Us Today: (916) 803-7498
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <CalendlyWidget isOpen={isCalendlyOpen} onClose={() => setIsCalendlyOpen(false)} />
    </div>
  );
}
