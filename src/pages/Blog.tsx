import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LoadingScreen from '../components/LoadingScreen';
import { Clock, User } from 'lucide-react';
import { supabase, BlogPost as BlogPostType } from '../lib/supabase';

export default function Blog() {
  const [posts, setPosts] = useState<BlogPostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    async function fetchPosts() {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching blog posts:', error);
      } else {
        setPosts(data || []);
      }

      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }

    fetchPosts();
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
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
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
  }, [loading, posts]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-warm-ivory">
      <Header />

      <section className="relative min-h-[50vh] overflow-hidden bg-evergreen-shadow">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/261679/pexels-photo-261679.jpeg?auto=compress&cs=tinysrgb&w=1920')] bg-cover bg-center opacity-10 transition-transform duration-[3000ms] hover:scale-105"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-evergreen-shadow/40 via-transparent to-evergreen-shadow/60"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-sage-mist/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-velvet-green/5 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="relative z-10 container mx-auto px-6 pt-56 flex flex-col justify-end min-h-[50vh]">
          <div className="max-w-4xl mx-auto text-center pb-16">
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6 animate-fade-in-up animation-delay-200">
              Small Community<br />Making a <span className="text-antique-brass">Big Difference</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 leading-relaxed font-light animate-fade-in-up animation-delay-400">
              Real Stories, Community Guides, Questions Answered
            </p>
          </div>
        </div>
      </section>

      <section className="relative py-24 bg-warm-ivory" data-animate id="posts">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[800px] bg-velvet-green/5 rounded-[50%] blur-3xl"></div>
        <div className="relative container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            {posts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-xl text-soft-charcoal">No blog posts available yet.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post, index) => {
                  const formattedDate = new Date(post.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  });

                  const isVisible = visibleSections.has('posts');
                  const animationDelay = index * 100;

                  return (
                    <article
                      key={post.id}
                      className={`group bg-warm-ivory border border-sage-mist overflow-hidden hover:border-antique-brass hover:shadow-xl hover:shadow-antique-brass/10 transition-all duration-500 hover:-translate-y-1 ${
                        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                      }`}
                      style={{
                        transitionDelay: isVisible ? `${animationDelay}ms` : '0ms',
                        transitionProperty: 'opacity, transform, border-color, box-shadow'
                      }}
                    >
                      <Link to={`/blog/${post.slug}`} className="block">
                        <div className="relative h-64 overflow-hidden bg-gray-100">
                          <div
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                            style={{ backgroundImage: `url(${encodeURI(post.image_url)})` }}
                          ></div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                          <div className="absolute top-4 left-4">
                            <span className="inline-block text-[10px] font-semibold tracking-wider text-white/80 uppercase px-3 py-1 bg-black/30 backdrop-blur-sm">
                              {post.excerpt.split(' ').slice(0, 2).join(' ')}
                            </span>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 p-6">
                            <h2 className="text-2xl font-bold text-white leading-tight mb-3 group-hover:text-antique-brass transition-colors duration-300">
                              {post.title}
                            </h2>
                            <div className="flex items-center gap-2 text-white/90 text-sm">
                              <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <User size={14} />
                              </div>
                              <span className="font-medium">By {post.author}</span>
                              <span className="text-white/60">|</span>
                              <span className="text-white/80">{formattedDate}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="relative py-32 bg-warm-ivory overflow-hidden" data-animate id="cta">
        <div className="absolute inset-0 bg-gradient-to-br from-sage-mist/10 via-transparent to-velvet-green/5"></div>
        <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-gradient-to-bl from-velvet-green/5 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-velvet-green/5 to-transparent rounded-full blur-3xl"></div>
        <div className="relative container mx-auto px-6">
          <div className={`max-w-4xl mx-auto text-center transition-all duration-1000 ${
            visibleSections.has('cta') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}>
            <h2 className="text-4xl md:text-5xl font-bold text-evergreen-shadow mb-8">
              Experience the Difference
            </h2>
            <p className="text-xl text-soft-charcoal leading-relaxed mb-12">
              These aren't just complaints—they're reasons why Aberdeen Manor exists. We created a small,
              intimate community specifically to address these concerns and provide the personalized care
              that larger facilities simply cannot offer.
            </p>
            <div className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-1000 ${
              visibleSections.has('cta') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`} style={{ transitionDelay: visibleSections.has('cta') ? '200ms' : '0ms' }}>
              <a
                href="tel:+19168037498"
                className="group inline-flex items-center justify-center gap-3 bg-velvet-green text-white px-8 py-4 rounded-xl hover:shadow-2xl hover:shadow-velvet-green/20 transition-all duration-500 font-medium text-lg hover:scale-105 hover:-translate-y-1"
              >
                <span>Schedule Your Tour</span>
                <svg
                  className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
              <a
                href="mailto:alex@aberdeencarehomes.com"
                className="group inline-flex items-center justify-center gap-3 bg-warm-ivory text-soft-charcoal border-2 border-sage-mist px-8 py-4 rounded-xl hover:border-antique-brass hover:shadow-xl transition-all duration-500 font-medium text-lg hover:scale-105 hover:-translate-y-1"
              >
                <span>Learn More</span>
                <svg
                  className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
