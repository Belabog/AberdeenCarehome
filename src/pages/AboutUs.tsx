import { useState, useEffect, useRef, useCallback } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LoadingScreen from '../components/LoadingScreen';
import CalendlyWidget from '../components/CalendlyWidget';
import { CheckCircle2, ChevronLeft, ChevronRight, ShieldCheck, Heart, Leaf, MessageCircle, HandHeart } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSiteImages } from '../lib/useSiteImage';

const TENET_DATA = [
  { title: 'Accountability', description: 'We do what\u2019s right with reliability and integrity. From keeping our promises to communicating clearly, we own our role in the lives of those in our care.', sectionKey: 'about-tenet-accountability', fallback: '/card_2.jpg', Icon: ShieldCheck },
  { title: 'Benevolence', description: 'Kindness guides our choices. We look for the thoughtful thing to do. Whether that\u2019s offering to sit and talk, cooking a favorite meal, or patience when it\u2019s needed.', sectionKey: 'about-tenet-benevolence', fallback: '/Card_1.jpg', Icon: HandHeart },
  { title: 'Compassion', description: 'We listen before we act. By acknowledging feelings and honoring them, we make care personal and more receptive for residents and reassuring for families.', sectionKey: 'about-tenet-compassion', fallback: '/card_3.jpg', Icon: Heart },
  { title: 'Dignity', description: 'Every person deserves respect, privacy, and a voice. We ask, not assume. We invite, not insist. We support individuality so residents feel in control of their day.', sectionKey: 'about-tenet-dignity', fallback: '/Memory_Care.jpg', Icon: Leaf },
  { title: 'Empathy', description: 'We seek to understand emotions in order to ease fears and loneliness. We create meaningful connections to make each person feel seen, heard, and valued.', sectionKey: 'about-tenet-empathy', fallback: '/Services_4.jpg', Icon: MessageCircle },
];

const GAP = 24;

export default function AboutUs() {
  const [loading, setLoading] = useState(true);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [isCalendlyOpen, setIsCalendlyOpen] = useState(false);
  const [heroVideoUrl, setHeroVideoUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const currentTranslate = useRef(0);
  const prevTranslate = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [cardWidth, setCardWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const tenetImages = useSiteImages(
    TENET_DATA.map((t) => ({ key: t.sectionKey, fallback: t.fallback }))
  );

  const TENETS = TENET_DATA.map((t) => ({
    title: t.title,
    description: t.description,
    image: tenetImages[t.sectionKey] ?? t.fallback,
    Icon: t.Icon,
  }));

  const extendedTenets = [...TENETS, ...TENETS, ...TENETS];
  const baseOffset = TENETS.length;

  const getCardWidth = useCallback(() => {
    if (!containerRef.current) return 400;
    const containerWidth = containerRef.current.offsetWidth;
    if (containerWidth < 640) return containerWidth - 48;
    if (containerWidth < 1024) return (containerWidth - 48 - GAP) / 2;
    return (containerWidth - 48 - GAP * 2) / 3;
  }, []);

  const getTranslateForIndex = useCallback((index: number) => {
    if (!containerRef.current) return 0;
    const cw = getCardWidth();
    const containerWidth = containerRef.current.offsetWidth;
    const centerOffset = (containerWidth - cw) / 2;
    return -(index * (cw + GAP)) + centerOffset;
  }, [getCardWidth]);

  const goToIndex = useCallback((index: number, animate = true) => {
    if (!trackRef.current) return;
    const translate = getTranslateForIndex(index + baseOffset);
    if (animate) {
      setIsTransitioning(true);
      trackRef.current.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)';
    } else {
      trackRef.current.style.transition = 'none';
    }
    trackRef.current.style.transform = `translateX(${translate}px)`;
    currentTranslate.current = translate;
    prevTranslate.current = translate;
    setActiveIndex(index);

    if (animate) {
      setTimeout(() => setIsTransitioning(false), 500);
    }
  }, [getTranslateForIndex, baseOffset]);

  const normalizeIndex = useCallback((idx: number) => {
    return ((idx % TENETS.length) + TENETS.length) % TENETS.length;
  }, []);

  const handleTransitionEnd = useCallback(() => {
    if (!trackRef.current) return;
    const normalized = normalizeIndex(activeIndex);
    if (normalized !== activeIndex) {
      trackRef.current.style.transition = 'none';
      const translate = getTranslateForIndex(normalized + baseOffset);
      trackRef.current.style.transform = `translateX(${translate}px)`;
      currentTranslate.current = translate;
      prevTranslate.current = translate;
      setActiveIndex(normalized);
    }
  }, [activeIndex, normalizeIndex, getTranslateForIndex, baseOffset]);

  const scrollCarousel = useCallback((direction: 'left' | 'right') => {
    if (isTransitioning) return;
    const newIndex = direction === 'left' ? activeIndex - 1 : activeIndex + 1;
    goToIndex(newIndex);
  }, [activeIndex, goToIndex, isTransitioning]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (isTransitioning) return;
    isDragging.current = true;
    startX.current = e.clientX;
    prevTranslate.current = currentTranslate.current;
    if (trackRef.current) trackRef.current.style.transition = 'none';
  }, [isTransitioning]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current || !trackRef.current) return;
    const diff = e.clientX - startX.current;
    currentTranslate.current = prevTranslate.current + diff;
    trackRef.current.style.transform = `translateX(${currentTranslate.current}px)`;
  }, []);

  const onPointerUp = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const diff = currentTranslate.current - prevTranslate.current;
    const cw = getCardWidth();
    const threshold = cw * 0.2;
    if (Math.abs(diff) > threshold) {
      goToIndex(diff > 0 ? activeIndex - 1 : activeIndex + 1);
    } else {
      goToIndex(activeIndex);
    }
  }, [activeIndex, goToIndex, getCardWidth]);

  useEffect(() => {
    const updateSize = () => {
      const cw = getCardWidth();
      setCardWidth(cw);
      if (trackRef.current) {
        trackRef.current.style.transition = 'none';
        const translate = getTranslateForIndex(activeIndex + baseOffset);
        trackRef.current.style.transform = `translateX(${translate}px)`;
        currentTranslate.current = translate;
        prevTranslate.current = translate;
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [getCardWidth, getTranslateForIndex, activeIndex, baseOffset]);

  useEffect(() => {
    if (!loading && containerRef.current && trackRef.current) {
      requestAnimationFrame(() => {
        const cw = getCardWidth();
        setCardWidth(cw);
        const translate = getTranslateForIndex(0 + baseOffset);
        trackRef.current!.style.transition = 'none';
        trackRef.current!.style.transform = `translateX(${translate}px)`;
        currentTranslate.current = translate;
        prevTranslate.current = translate;
        setActiveIndex(0);
      });
    }
  }, [loading, getCardWidth, getTranslateForIndex, baseOffset]);

  useEffect(() => {
    async function fetchHeroVideo() {
      const { data } = await supabase
        .from('videos')
        .select('storage_path')
        .eq('section_name', 'about')
        .eq('is_active', true)
        .maybeSingle();

      if (data?.storage_path) {
        const { data: urlData } = supabase.storage
          .from('videos')
          .getPublicUrl(data.storage_path);
        setHeroVideoUrl(urlData.publicUrl);
      }
    }

    fetchHeroVideo();

    setTimeout(() => {
      setLoading(false);
    }, 1000);
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
        <div className="absolute inset-0 bg-evergreen-shadow" />
        {heroVideoUrl && (
          <video
            ref={videoRef}
            src={heroVideoUrl}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            aria-hidden="true"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />

        <div className="relative z-10 container mx-auto px-6 pt-56 pb-16 flex flex-col justify-end min-h-[60vh]">
          <div className="text-center">
            <p className="text-lg md:text-xl text-white/90 leading-relaxed font-light drop-shadow-md mb-3">
              A <span className="font-semibold text-white">community</span> where every resident is family
            </p>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight drop-shadow-lg">
              Every <span className="text-antique-brass">Story</span> Matters
            </h1>
          </div>
        </div>
      </section>

      <section className="relative py-20 md:py-32 bg-warm-ivory" data-animate id="our-story">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className={`text-4xl md:text-5xl font-bold text-evergreen-shadow mb-8 text-center transition-all duration-1000 ${
              visibleSections.has('our-story') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              Our Story
            </h2>
            <div className="prose prose-lg max-w-none text-soft-charcoal leading-relaxed space-y-6">
              <p className={`text-lg md:text-xl transition-all duration-1000 delay-150 ${
                visibleSections.has('our-story') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}>
                Aberdeen Manor began with one clear belief: every person is unique and their care should be unique as well. Our founder brings 15+ years of operational and administrative experience in elderly care. After years of working across different care settings, he saw how much a small, steady environment can help people feel safe, heard, and at ease. He established Aberdeen Manor to offer that kind of reassuring, consistent care on a human scale.
              </p>
              <p className={`text-lg md:text-xl transition-all duration-1000 delay-300 ${
                visibleSections.has('our-story') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}>
                Our approach is grounded in everyday details. We will ask about your morning routine, the way you like your coffee, or your favorite football team. We believe that small details like these, and the experiences you have had, are what define a person. That is the heart of our mission at Aberdeen Manor: to hear your story and learn from your past, so it may guide us in what we do in the future.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-20 md:py-32 overflow-hidden bg-warm-ivory" data-animate id="philosophy">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[800px] bg-velvet-green/10 rounded-[50%] blur-3xl"></div>
        <div className="relative">
          <div className="container mx-auto px-6">
            <div className="mb-16">
              <h2 className={`text-4xl md:text-5xl font-bold text-evergreen-shadow mb-8 text-center transition-all duration-1000 ${
                visibleSections.has('philosophy') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}>
                Foundational Motifs
              </h2>
            </div>
          </div>

          <div className={`relative transition-all duration-1000 ${
            visibleSections.has('philosophy') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`} data-animate id="tenets">
            <div
              ref={containerRef}
              className="overflow-hidden px-6 cursor-grab active:cursor-grabbing select-none"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerLeave={onPointerUp}
            >
              <div
                ref={trackRef}
                className="flex"
                style={{ gap: `${GAP}px` }}
                onTransitionEnd={handleTransitionEnd}
              >
                {extendedTenets.map((tenet, index) => {
                  const realIndex = index - baseOffset;
                  const isActive = normalizeIndex(activeIndex) === normalizeIndex(realIndex);
                  const TenetIcon = tenet.Icon;
                  return (
                    <div
                      key={`${tenet.title}-${index}`}
                      className={`group relative flex-shrink-0 transition-all duration-500 rounded-2xl cursor-pointer ${
                        isActive
                          ? 'shadow-2xl shadow-evergreen-shadow/15 scale-[1.03] z-10'
                          : 'shadow-md opacity-75 scale-[0.97]'
                      }`}
                      style={{ width: cardWidth || 400 }}
                      onClick={() => {
                        if (!isActive && !isDragging.current) goToIndex(realIndex);
                      }}
                    >
                      <div
                        className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl transition-all duration-500 ${
                          isActive ? 'bg-antique-brass' : 'bg-velvet-green/60'
                        }`}
                      />
                      <div
                        className={`h-full rounded-2xl px-8 py-10 flex flex-col items-center text-center transition-all duration-500 ${
                          isActive
                            ? 'bg-[#F8F5EE]'
                            : 'bg-[#F0EDE6]'
                        }`}
                      >
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-5 transition-all duration-500 border ${
                          isActive
                            ? 'border-velvet-green/40 bg-warm-ivory'
                            : 'border-velvet-green/25 bg-warm-ivory/70'
                        }`}>
                          <TenetIcon
                            size={26}
                            className={`transition-all duration-500 ${isActive ? 'text-velvet-green' : 'text-velvet-green/60'}`}
                            strokeWidth={1.5}
                          />
                        </div>

                        <h3 className={`text-xl font-bold mb-2 transition-all duration-500 ${
                          isActive ? 'text-evergreen-shadow' : 'text-evergreen-shadow/70'
                        }`} style={{ fontFamily: 'Georgia, serif' }}>
                          {tenet.title}
                        </h3>

                        <div className={`flex items-center gap-1.5 mb-4 transition-all duration-500 ${
                          isActive ? 'opacity-100' : 'opacity-50'
                        }`}>
                          <div className="h-px w-6 bg-antique-brass/60" />
                          <div className="w-1 h-1 rounded-full bg-antique-brass/70" />
                          <div className="h-px w-6 bg-antique-brass/60" />
                        </div>

                        <p className={`leading-relaxed text-sm transition-all duration-500 ${
                          isActive ? 'text-soft-charcoal' : 'text-soft-charcoal/60'
                        }`}>
                          {tenet.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => scrollCarousel('left')}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-warm-ivory/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-warm-ivory hover:scale-110 transition-all duration-300 z-10"
              aria-label="Previous card"
            >
              <ChevronLeft size={24} className="text-soft-charcoal" />
            </button>
            <button
              onClick={() => scrollCarousel('right')}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-warm-ivory/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-warm-ivory hover:scale-110 transition-all duration-300 z-10"
              aria-label="Next card"
            >
              <ChevronRight size={24} className="text-soft-charcoal" />
            </button>

            <div className="flex justify-center gap-2 mt-8">
              {TENETS.map((tenet, index) => (
                <button
                  key={tenet.title}
                  onClick={() => goToIndex(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    normalizeIndex(activeIndex) === index
                      ? 'w-8 bg-velvet-green'
                      : 'w-2 bg-stone-taupe/50 hover:bg-stone-taupe'
                  }`}
                  aria-label={`Go to ${tenet.title}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-20 md:py-32 bg-warm-ivory" data-animate id="bespoke-care">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className={`text-4xl md:text-5xl font-bold text-evergreen-shadow mb-8 text-center transition-all duration-1000 ${
              visibleSections.has('bespoke-care') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              Every Story is Unique
            </h2>
            <div className="prose prose-lg max-w-none text-soft-charcoal leading-relaxed space-y-6">
              <p className={`text-lg md:text-xl transition-all duration-1000 delay-150 ${
                visibleSections.has('bespoke-care') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}>
                At Aberdeen Manor, care starts with knowing the people you serve. Their history, routines, likes, and needs. In our community, we commit ourselves to shape a plan that fits each individual, and then to refine it as life changes. This resident-focused approach means we adjust our practices and daily rhythms to what feels best for each of our clients.
              </p>
              <p className={`text-lg md:text-xl transition-all duration-1000 delay-300 ${
                visibleSections.has('bespoke-care') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}>
                We rely on families to be a part of the process. As advocates for your loved ones, we listen to your priorities and observations. We share updates in clear, simple language and welcome feedback. When everyone understands the plan, small decisions become easier and the day feels smoother. That is what personalized elderly care looks like; informed, meaningful, and as unique as the people we serve.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-20 md:py-32 bg-warm-ivory" data-animate id="life">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className={`text-4xl md:text-5xl font-bold text-evergreen-shadow mb-8 text-center transition-all duration-1000 ${
              visibleSections.has('life') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              Daily Chapters
            </h2>
            <div className="prose prose-lg max-w-none text-soft-charcoal leading-relaxed space-y-6 mb-12">
              <p className={`text-lg md:text-xl transition-all duration-1000 delay-150 ${
                visibleSections.has('life') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}>
                Life at Aberdeen Manor feels homey. Mornings are relaxed. There's time for a cup of coffee, a quick glance at the newspaper, or a walk around the grounds. Shared meals bring engaging conversations and familiar faces. Afternoons might include light activities, or a nap, a visit from family or a peaceful moment on the patio. Evenings are for winding down. Sunsets from the dining room, a couple chapters from a book, and a sense that the day landed in a good place.
              </p>
              <p className={`text-lg md:text-xl transition-all duration-1000 delay-300 ${
                visibleSections.has('life') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}>
                Because we are a home, everyone is familiar and routines feel consistent. Residents know who will greet them in the morning, and staff know what to do before being told . That consistency builds confidence and trust, which only grows with time.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-20 md:py-32 bg-warm-ivory" data-animate id="families">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className={`text-4xl md:text-5xl font-bold text-evergreen-shadow mb-8 text-center transition-all duration-1000 ${
              visibleSections.has('families') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              Foreword For Families
            </h2>
            <div className="prose prose-lg max-w-none text-soft-charcoal leading-relaxed space-y-6 mb-12">
              <p className={`text-lg md:text-xl transition-all duration-1000 delay-150 ${
                visibleSections.has('families') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}>
                Choosing care is both overwhelming and emotional. You're comparing options, coordinating schedules, managing emotions, and you have never done this before. We understand. Our goal is to make our partnership simple for you and transparent for everyone. Let us help. Help guide you through this process, and help relieve the worry you may have.
              </p>
            </div>

            <div className={`bg-velvet-green rounded-3xl p-8 md:p-12 text-white transition-all duration-1000 ${
              visibleSections.has('families') ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`} style={{ transitionDelay: visibleSections.has('families') ? '300ms' : '0ms' }}>
              <h3 className={`text-2xl md:text-3xl font-bold mb-8 text-center transition-all duration-1000 delay-150 ${
                visibleSections.has('families') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}>What Families Can Expect</h3>
              <div className="space-y-4">
                <div className={`flex items-start gap-4 transition-all duration-700 delay-300 ${
                  visibleSections.has('families') ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
                }`}>
                  <CheckCircle2 className="text-antique-brass flex-shrink-0 mt-1" size={24} />
                  <p className="text-lg leading-relaxed">
                    A small-home setting: peace, consistency, and familiarity surround your loved ones
                  </p>
                </div>
                <div className={`flex items-start gap-4 transition-all duration-700 delay-[400ms] ${
                  visibleSections.has('families') ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
                }`}>
                  <CheckCircle2 className="text-antique-brass flex-shrink-0 mt-1" size={24} />
                  <p className="text-lg leading-relaxed">
                    Respect for your preference: daily routines, favorite activities, and personal choices
                  </p>
                </div>
                <div className={`flex items-start gap-4 transition-all duration-700 delay-500 ${
                  visibleSections.has('families') ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
                }`}>
                  <CheckCircle2 className="text-antique-brass flex-shrink-0 mt-1" size={24} />
                  <p className="text-lg leading-relaxed">
                    Clear communication you can rely on: what's going well and what's changing
                  </p>
                </div>
                <div className={`flex items-start gap-4 transition-all duration-700 delay-[600ms] ${
                  visibleSections.has('families') ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
                }`}>
                  <CheckCircle2 className="text-antique-brass flex-shrink-0 mt-1" size={24} />
                  <p className="text-lg leading-relaxed">
                    Friendly relationships with the people who are responsible for your loved ones well-being
                  </p>
                </div>
                <div className={`flex items-start gap-4 transition-all duration-700 delay-700 ${
                  visibleSections.has('families') ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
                }`}>
                  <CheckCircle2 className="text-antique-brass flex-shrink-0 mt-1" size={24} />
                  <p className="text-lg leading-relaxed">
                    Access to years of experience in elderly care: guiding you through this process
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-20 md:py-32 bg-warm-ivory" data-animate id="cta">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className={`text-4xl md:text-5xl font-bold text-evergreen-shadow mb-8 transition-all duration-1000 ${
              visibleSections.has('cta') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              Tell Us Your Story
            </h2>
            <p className={`text-xl text-soft-charcoal leading-relaxed mb-12 transition-all duration-1000 delay-200 ${
              visibleSections.has('cta') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              We invite you to visit us. Tell us your story and see firsthand how our bespoke approach to elderly care creates an environment where residents don't just live, they thrive.
            </p>
            <button
              onClick={() => setIsCalendlyOpen(true)}
              className={`inline-flex items-center gap-3 bg-velvet-green text-white px-8 py-4 rounded-xl hover:shadow-lg hover:shadow-velvet-green/20 transition-all duration-500 font-medium text-lg hover:scale-105 ${
                visibleSections.has('cta') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: visibleSections.has('cta') ? '200ms' : '0ms' }}
            >
              Schedule Your Personal Tour
            </button>
          </div>
        </div>
      </section>

      <Footer />
      <CalendlyWidget isOpen={isCalendlyOpen} onClose={() => setIsCalendlyOpen(false)} />
    </div>
  );
}
