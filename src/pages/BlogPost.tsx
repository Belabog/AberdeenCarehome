import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LoadingScreen from '../components/LoadingScreen';
import { Clock, User, ArrowLeft } from 'lucide-react';
import { supabase, BlogPost as BlogPostType } from '../lib/supabase';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPost() {
      if (!slug) return;

      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .maybeSingle();

      if (error) {
        console.error('Error fetching blog post:', error);
      } else {
        setPost(data);
      }

      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }

    fetchPost();
  }, [slug]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-warm-ivory">
        <Header />
        <div className="container mx-auto px-6 pt-48 pb-32">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-evergreen-shadow mb-6">Post Not Found</h1>
            <p className="text-xl text-soft-charcoal mb-8">The blog post you're looking for doesn't exist.</p>
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 bg-velvet-green text-white px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-velvet-green/20 transition-all duration-300 font-medium"
            >
              <ArrowLeft size={20} />
              Back to Blog
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const formattedDate = new Date(post.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-warm-ivory">
      <Header />

      <article className="relative pt-32 pb-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-soft-charcoal hover:text-antique-brass transition-colors mb-8"
            >
              <ArrowLeft size={20} />
              Back to Blog
            </Link>

            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4 text-sm text-stone-taupe">
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  <span>{formattedDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User size={16} />
                  <span>{post.author}</span>
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-evergreen-shadow mb-6 leading-tight">
                {post.title}
              </h1>
              <p className="text-xl text-soft-charcoal leading-relaxed">
                {post.excerpt}
              </p>
            </div>

            <div className="relative h-96 rounded-3xl overflow-hidden shadow-2xl border border-sage-mist mb-12">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${encodeURI(post.image_url)})` }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-velvet-green/20 to-transparent"></div>
            </div>

            <div className="prose prose-lg max-w-none">
              <div className="text-soft-charcoal leading-relaxed text-lg whitespace-pre-line">
                {post.content}
              </div>
            </div>
          </div>
        </div>
      </article>

      <section className="relative py-20 bg-warm-ivory">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-evergreen-shadow mb-6">
              Experience the Aberdeen Manor Difference
            </h2>
            <p className="text-lg text-soft-charcoal leading-relaxed mb-8">
              See how our small, intimate community addresses these concerns with personalized care
              that larger facilities simply cannot offer.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:+19168037498"
                className="inline-flex items-center justify-center gap-3 bg-velvet-green text-white px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-velvet-green/20 transition-all duration-300 font-medium"
              >
                Schedule Your Tour
              </a>
              <Link
                to="/blog"
                className="inline-flex items-center justify-center gap-3 bg-warm-ivory text-soft-charcoal border-2 border-sage-mist px-6 py-3 rounded-xl hover:border-antique-brass hover:shadow-xl transition-all duration-300 font-medium"
              >
                Read More Articles
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
