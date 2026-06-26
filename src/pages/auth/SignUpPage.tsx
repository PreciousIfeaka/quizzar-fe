import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/use-toast';
import { QuizzarLogo } from '../../components/common/QuizzarLogo';
import { User } from 'lucide-react';

export default function SignUpPage() {
  const { signup, googleSignin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGoogleCredentialResponse = async (response: any) => {
    const idToken = response.credential;
    if (!idToken) return;

    setLoading(true);
    try {
      await googleSignin(idToken);
      toast({
        title: 'Welcome!',
        description: 'You have signed up and logged in successfully with Google.',
      });
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      console.error('Google sign-up error:', err);
      toast({
        title: 'Registration Failed',
        description: err.response?.data?.message || 'Google sign-up failed. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initGoogle = () => {
      const google = (window as any).google;
      if (google) {
        google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
          callback: handleGoogleCredentialResponse,
        });
        google.accounts.id.renderButton(
          document.getElementById('google-signup-btn-container'),
          { theme: 'outline', size: 'large', width: '380' }
        );
      }
    };

    // Dynamically load Google client script if not already present
    if (!document.getElementById('google-gsi-script')) {
      const script = document.createElement('script');
      script.id = 'google-gsi-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initGoogle;
      document.body.appendChild(script);
    } else {
      initGoogle();
    }
  }, []);

  const handleCustomButtonClick = () => {
    const google = (window as any).google;
    if (!google) {
      toast({
        title: 'Loading Google Sign-In',
        description: 'Google authentication services are still loading. Please try again in a few seconds.',
      });
      return;
    }
    // Fallback: Trigger Google One Tap prompt if the iframe click was somehow missed
    if (google.accounts?.id) {
      google.accounts.id.prompt();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all fields.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await signup({ name, email, password });
      toast({
        title: 'Account Created!',
        description: 'A 6-digit verification code has been sent to your email.',
      });
      navigate(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      toast({
        title: 'Registration Failed',
        description: err.response?.data?.message || 'Failed to create your account. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f7f9fb] font-['Plus_Jakarta_Sans',sans-serif] text-[#191c1e] min-h-screen relative overflow-hidden flex items-center justify-center p-4 md:p-12">
      {/* Grid Background Layer */}
      <div className="fixed inset-0 grid-pattern pointer-events-none z-0"></div>

      <main className="relative z-10 w-full max-w-[1100px] grid grid-cols-1 md:grid-cols-2 bg-white rounded-2xl shadow-[0px_20px_40px_rgba(15,43,61,0.08)] overflow-hidden min-h-[650px]">
        {/* Branding Area (Left Side) - Darker Shade */}
        <div className="bg-[#001e2f] p-12 flex flex-col justify-between relative overflow-hidden hidden md:flex text-white">
          {/* Atmospheric Glows */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#006877]/20 rounded-full blur-[100px]"></div>
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-[#00c48c]/10 rounded-full blur-[120px]"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-8">
              <QuizzarLogo size="md" to="/" lightText />
            </div>
            <div className="space-y-4">
              <h2 className="font-['Montserrat',sans-serif] text-3xl font-extrabold leading-tight text-white">
                Master anything with <span className="text-[#49ffbd]">AI-powered</span> learning.
              </h2>
              <p className="text-xs text-slate-350 max-w-sm leading-relaxed">
                Join over 50,000 educators and students using Quizzar to turn static content into dynamic, interactive knowledge journeys.
              </p>
            </div>
          </div>

          {/* Middle Feature List to fill empty space */}
          <div className="relative z-10 my-4 space-y-4 bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#49ffbd] text-[20px] mt-0.5">auto_awesome</span>
              <div>
                <h4 className="text-xs font-bold text-white tracking-wide uppercase">Instant AI Generation</h4>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">Turn any text, URL, or PDF document into comprehensive quizzes in seconds.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#43d8f2] text-[20px] mt-0.5">analytics</span>
              <div>
                <h4 className="text-xs font-bold text-white tracking-wide uppercase">Real-time Analytics</h4>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">Monitor response distributions, average completion times, and student progress dashboards.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#49ffbd] text-[20px] mt-0.5">diversity_3</span>
              <div>
                <h4 className="text-xs font-bold text-white tracking-wide uppercase">Collaborative Classrooms</h4>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">Share quizzes, co-edit with other teachers, and export directly to your LMS.</p>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-auto">
            <div className="bg-[#30495d]/50 backdrop-blur-xl border border-white/10 p-6 rounded-2xl flex items-start gap-4">
              <div className="w-12 h-12 rounded-full border-2 border-[#a2eeff] shadow-lg bg-white/10 flex items-center justify-center text-[#a2eeff] shrink-0">
                <User className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-white text-xs leading-normal">
                  "Quizzar reduced my quiz preparation time by 80%. The AI suggestions are spookily accurate!"
                </p>
                <p className="text-[#49ffbd] font-bold text-[11px] mt-2">James, 8th Grade Math Tutor</p>
              </div>
            </div>
          </div>
        </div>

        {/* Register Form Area (Right Side) */}
        <div className="flex flex-col justify-center p-6 md:p-16 lg:p-20 bg-white">
          <div className="max-w-md mx-auto w-full">
            {/* Mobile Logo */}
            <div className="md:hidden flex items-center justify-center gap-2 mb-8">
              <QuizzarLogo size="md" to="/" />
            </div>

            <header className="mb-6 text-center md:text-left">
              <h2 className="font-['Montserrat',sans-serif] text-2xl font-bold text-[#191c1e] mb-2">Create Account</h2>
              <p className="text-slate-500 text-sm">Start your journey toward efficient learning today.</p>
            </header>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-650 uppercase tracking-widest block" htmlFor="name">
                  FULL NAME
                </label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#006877] transition-colors">
                    person
                  </span>
                  <input
                    className="w-full pl-12 pr-4 py-3 bg-[#f7f9fb] border border-[#bbc9cc] rounded-xl focus:ring-2 focus:ring-[#006877]/20 focus:border-[#006877] transition-all outline-none placeholder:text-slate-400 text-sm"
                    id="name"
                    placeholder="John Doe"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-650 uppercase tracking-widest block" htmlFor="email">
                  EMAIL ADDRESS
                </label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#006877] transition-colors">
                    mail
                  </span>
                  <input
                    className="w-full pl-12 pr-4 py-3 bg-[#f7f9fb] border border-[#bbc9cc] rounded-xl focus:ring-2 focus:ring-[#006877]/20 focus:border-[#006877] transition-all outline-none placeholder:text-slate-400 text-sm"
                    id="email"
                    placeholder="john@university.edu"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-650 uppercase tracking-widest block" htmlFor="password">
                  PASSWORD
                </label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#006877] transition-colors">
                    lock
                  </span>
                  <input
                    className="w-full pl-12 pr-12 py-3 bg-[#f7f9fb] border border-[#bbc9cc] rounded-xl focus:ring-2 focus:ring-[#006877]/20 focus:border-[#006877] transition-all outline-none placeholder:text-slate-400 text-sm"
                    id="password"
                    placeholder="••••••••••••"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650 transition-colors"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 px-1">Must be at least 6 characters.</p>
              </div>

              {/* Submit Button */}
              <button
                className="w-full btn-gradient py-3.5 rounded-xl flex items-center justify-center gap-2 group shadow-lg shadow-[#006877]/10 disabled:opacity-50 mt-2"
                type="submit"
                disabled={loading}
              >
                <span className="font-bold text-white text-base">
                  {loading ? 'Creating Account...' : 'Sign Up'}
                </span>
                {!loading && (
                  <span className="material-symbols-outlined text-white group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                )}
              </button>
            </form>

            {/* Social Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#bbc9cc]/50"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                  or sign up with
                </span>
              </div>
            </div>

            {/* Social Buttons */}
            <div className="w-full relative overflow-hidden">
              <button
                className="w-full flex items-center justify-center gap-3 py-3 border border-[#bbc9cc] bg-white rounded-xl hover:bg-slate-50 transition-colors text-xs font-bold text-slate-650"
                type="button"
                disabled={loading}
                onClick={handleCustomButtonClick}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  ></path>
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  ></path>
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  ></path>
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  ></path>
                </svg>
                Continue with Google
              </button>
              {/* Transparent Google Button Overlay (scaled to fully cover the custom button) */}
              <div
                id="google-signup-btn-container"
                className="absolute -inset-4 opacity-0 z-10 cursor-pointer overflow-hidden [&_iframe]:w-[200%] [&_iframe]:h-[200%] [&_iframe]:max-w-none [&_iframe]:absolute [&_iframe]:left-1/2 [&_iframe]:top-1/2 [&_iframe]:-translate-x-1/2 [&_iframe]:-translate-y-1/2 [&_iframe]:scale-150 [&_iframe]:cursor-pointer pointer-events-auto"
              />
            </div>

            {/* Footer Link */}
            <div className="mt-8 text-center">
              <p className="text-sm text-slate-500">
                Already have an account?{' '}
                <Link className="text-[#006877] font-bold hover:underline ml-1" to="/signin">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Global Footer Mini */}
      <footer className="fixed bottom-6 left-0 w-full px-8 pointer-events-none">
        <div className="max-w-[1280px] mx-auto flex justify-between items-center text-[10px] text-slate-455 font-bold tracking-widest uppercase">
          <p>© 2024 QUIZZAR AI PLATFORM</p>
          <div className="flex gap-6 pointer-events-auto">
            <a className="hover:text-[#006877] transition-colors" href="#">
              HELP
            </a>
            <Link className="hover:text-[#006877] transition-colors" to="/privacy">
              PRIVACY
            </Link>
            <Link className="hover:text-[#006877] transition-colors" to="/terms">
              TERMS
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
