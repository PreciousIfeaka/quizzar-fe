import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/use-toast';
import { QuizzarLogo } from '../../components/common/QuizzarLogo';
import { User } from 'lucide-react';
import { useGoogleAuth } from '../../hooks/useGoogleAuth';

export default function SignInPage() {
  const { signin, googleSignin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGoogleCredential = useCallback(async (idToken: string) => {
    setLoading(true);
    try {
      await googleSignin(idToken);
      toast({
        title: 'Welcome Back!',
        description: 'You have logged in successfully with Google.',
      });
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      toast({
        title: 'Authentication Failed',
        description: err.response?.data?.message || 'Google sign-in failed. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [googleSignin, navigate, toast]);

  const { triggerGoogleLogin, hiddenButton } = useGoogleAuth({
    onCredential: handleGoogleCredential,
    onError: () =>
      toast({
        title: 'Google Sign-In Failed',
        description: 'Google sign-in was cancelled or failed. Please try again.',
        variant: 'destructive',
      }),
  });

  const handleGoogleButtonClick = () => {
    triggerGoogleLogin();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in both email and password.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await signin({ email, password });
      toast({
        title: 'Welcome Back!',
        description: 'You have logged in successfully.',
      });
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      toast({
        title: 'Authentication Failed',
        description: err.response?.data?.message || 'Invalid email or password.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f7f9fb] font-['Plus_Jakarta_Sans',sans-serif] text-[#191c1e] min-h-screen relative overflow-hidden flex items-center justify-center p-4 md:p-12">
      {/* Hidden Google Login button — triggered programmatically by the custom button */}
      {hiddenButton}
      {/* Grid Background Layer */}
      <div className="fixed inset-0 grid-pattern pointer-events-none z-0"></div>

      <main className="relative z-10 w-full max-w-[1100px] grid grid-cols-1 md:grid-cols-2 bg-white rounded-2xl shadow-[0px_20px_40px_rgba(15,43,61,0.08)] overflow-hidden min-h-[650px]">
        {/* Branding Area (Left Side) */}
        <div className="teal-gradient p-12 flex flex-col justify-between relative overflow-hidden hidden md:flex text-white">
          {/* Atmospheric Glows */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#00bdd6]/20 rounded-full blur-[100px]"></div>
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-[#00c48c]/10 rounded-full blur-[120px]"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-12">
              <QuizzarLogo size="md" to="/" lightText />
            </div>
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 rounded-full backdrop-blur-md">
                <span className="material-symbols-outlined text-[18px] text-[#49ffbd]">auto_awesome</span>
                <span className="text-xs font-bold text-[#49ffbd] uppercase tracking-wider">AI-Powered Education</span>
              </div>
              <h1 className="font-['Montserrat',sans-serif] text-4xl font-extrabold text-white leading-tight">
                Let your quizzers have fun while they <span className="text-[#43d8f2]">learn.</span>
              </h1>
              <p className="text-sm text-slate-350 max-w-sm leading-relaxed">
                Step into the future of learning. Our AI-driven engine crafts personalized quizzes tailored to your growth.
              </p>
            </div>
          </div>

          <div className="relative z-10 mt-auto">
            <div className="p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border-2 border-[#43d8f2]/50 shadow-lg bg-white/10 flex items-center justify-center text-[#43d8f2] shrink-0">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Sarah</p>
                  <p className="text-slate-300 text-xs">Tutor</p>
                </div>
              </div>
              <p className="mt-4 text-slate-200 italic text-xs leading-relaxed">
                "Quizzar has redefined interactive quizzing. Whether it's driving classroom retention or hosting engaging trivia games, the AI-generated context is unparalleled."
              </p>
            </div>
          </div>
        </div>

        {/* Login Form Area (Right Side) */}
        <div className="flex flex-col justify-center p-6 md:p-16 lg:p-20 bg-white">
          <div className="max-w-md mx-auto w-full">
            {/* Mobile Logo */}
            <div className="md:hidden flex items-center justify-center gap-2 mb-12">
              <QuizzarLogo size="md" to="/" />
            </div>

            <header className="mb-10">
              <h2 className="font-['Montserrat',sans-serif] text-2xl font-bold text-[#191c1e] mb-2">Welcome Back</h2>
              <p className="text-slate-500 text-sm">Access your personalized AI dashboard.</p>
            </header>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-650 uppercase tracking-widest block" htmlFor="email">
                  EMAIL ADDRESS
                </label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#006877] transition-colors">
                    mail
                  </span>
                  <input
                    className="w-full pl-12 pr-4 py-4 bg-[#f7f9fb] border border-[#bbc9cc] rounded-xl focus:ring-2 focus:ring-[#006877]/20 focus:border-[#006877] transition-all outline-none placeholder:text-slate-400 text-sm"
                    id="email"
                    placeholder="name@university.edu"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-650 uppercase tracking-widest block" htmlFor="password">
                    PASSWORD
                  </label>
                  <Link
                    className="text-xs font-semibold text-[#006877] hover:text-[#004e5a] transition-colors"
                    to="/forgot-password"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#006877] transition-colors">
                    lock
                  </span>
                  <input
                    className="w-full pl-12 pr-12 py-4 bg-[#f7f9fb] border border-[#bbc9cc] rounded-xl focus:ring-2 focus:ring-[#006877]/20 focus:border-[#006877] transition-all outline-none placeholder:text-slate-400 text-sm"
                    id="password"
                    placeholder="••••••••"
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
              </div>



              {/* Sign In Button */}
              <button
                className="w-full btn-gradient py-4 rounded-xl flex items-center justify-center gap-2 group shadow-lg shadow-[#006877]/10 disabled:opacity-50"
                type="submit"
                disabled={loading}
              >
                <span className="font-bold text-white text-base">
                  {loading ? 'Signing In...' : 'Sign In'}
                </span>
                {!loading && (
                  <span className="material-symbols-outlined text-white group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                )}
              </button>

              {/* Social Login Divider */}
              <div className="relative my-8 text-center">
                <div aria-hidden="true" className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#bbc9cc]/30"></div>
                </div>
                <span className="relative px-4 bg-white text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  or continue with
                </span>
              </div>

              {/* Social Buttons */}
              <div className="w-full">
                <button
                  className="w-full flex items-center justify-center gap-3 py-3 border border-[#bbc9cc] bg-white rounded-xl hover:bg-slate-50 transition-colors text-xs font-bold text-slate-650 disabled:opacity-50"
                  type="button"
                  disabled={loading}
                  onClick={handleGoogleButtonClick}
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
                  <span>Continue with Google</span>
                </button>
              </div>
            </form>

            <footer className="mt-12 text-center">
              <p className="text-sm text-slate-500">
                Don't have an account?{' '}
                <Link
                  className="font-bold text-[#006877] hover:underline underline-offset-4 decoration-2 decoration-[#00bdd6]"
                  to="/signup"
                >
                  Sign Up
                </Link>
              </p>
            </footer>
          </div>
        </div>
      </main>

      {/* Atmospheric Elements */}
      <div className="fixed bottom-5 right-5 flex items-center gap-2 px-4 py-2 bg-white/40 backdrop-blur-md rounded-full border border-white/50 text-[10px] font-bold text-[#006877]/60 tracking-widest pointer-events-none uppercase">
        <span className="material-symbols-outlined text-xs">shield</span>
        Enterprise Secure
      </div>
    </div>
  );
}
