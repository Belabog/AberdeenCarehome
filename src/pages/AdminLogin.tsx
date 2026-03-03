import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';

export default function AdminLogin() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (!loading && session) {
      navigate('/admin/blog', { replace: true });
    }
  }, [session, loading, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSigningIn(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError('Invalid email or password. Please try again.');
      setSigningIn(false);
    } else {
      navigate('/admin/blog', { replace: true });
    }
  }

  return (
    <div className="min-h-screen bg-velvet-green flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <img
            src="/ChatGPT_Image_Mar_1,_2026,_09_55_21_AM.png"
            alt="Aberdeen Manor"
            className="w-20 h-20 object-contain mx-auto mb-5"
          />
          <h1 className="font-serif text-3xl text-warm-ivory tracking-wide mb-1">Aberdeen Manor</h1>
          <p className="text-sage-mist text-sm tracking-widest uppercase">Administrator Portal</p>
        </div>

        <div className="bg-warm-ivory rounded-2xl shadow-2xl shadow-black/40 p-8">
          <h2 className="font-serif text-2xl text-soft-charcoal mb-6 text-center">Sign In</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-soft-charcoal mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-taupe" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="admin@aberdeenmanor.com"
                  className="w-full pl-10 pr-4 py-3 border border-sage-mist rounded-xl bg-white text-soft-charcoal placeholder-stone-taupe focus:outline-none focus:ring-2 focus:ring-velvet-green/30 focus:border-velvet-green transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-soft-charcoal mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-taupe" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-11 py-3 border border-sage-mist rounded-xl bg-white text-soft-charcoal placeholder-stone-taupe focus:outline-none focus:ring-2 focus:ring-velvet-green/30 focus:border-velvet-green transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-taupe hover:text-soft-charcoal transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={signingIn}
              className="w-full bg-velvet-green text-white py-3 rounded-xl font-medium hover:bg-evergreen-shadow transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {signingIn ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sage-mist/60 text-xs mt-8">
          &copy; {new Date().getFullYear()} Aberdeen Manor. All rights reserved.
        </p>
      </div>
    </div>
  );
}
