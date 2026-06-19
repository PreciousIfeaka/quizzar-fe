import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/use-toast';
import { QuizzarLogo } from '../../components/common/QuizzarLogo';

export default function ForgotPasswordPage() {
  const { forgotPassword, resetPassword } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: 'Validation Error',
        description: 'Please enter your email address.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await forgotPassword({ email });
      toast({
        title: 'Recovery Email Sent!',
        description: 'Check your inbox for a 6-digit verification code.',
      });
      setStep(2);
    } catch (err: any) {
      toast({
        title: 'Request Failed',
        description: err.response?.data?.message || 'Failed to request password reset. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !newPassword || !confirmPassword) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all fields.',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: 'Validation Error',
        description: 'Password must be at least 6 characters long.',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Validation Error',
        description: 'New password and confirm password do not match.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ email, otp, newPassword });
      toast({
        title: 'Password Reset Successful!',
        description: 'Your password has been updated. You can now sign in with your new password.',
      });
      navigate('/signin');
    } catch (err: any) {
      toast({
        title: 'Reset Failed',
        description: err.response?.data?.message || 'Invalid OTP code or expired session. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f7f9fb] font-['Plus_Jakarta_Sans',sans-serif] text-[#191c1e] min-h-screen flex flex-col items-center justify-center relative overflow-hidden p-4">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 grid-pattern pointer-events-none z-0"></div>

      {/* Decorative floating spheres */}
      <div className="absolute top-20 right-[15%] w-32 h-32 bg-[#006877]/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 left-[10%] w-48 h-48 bg-[#00c48c]/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '-2s' }}></div>

      <main className="relative z-10 w-full max-w-md mt-10">
        {/* Logo Header */}
        <div className="flex flex-col items-center mb-8">
          <QuizzarLogo noLink size="md" />
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-[0px_4px_20px_rgba(15,43,61,0.05)] border border-[#bbc9cc]/30 relative overflow-hidden">
          {/* Recovery Badge */}
          <div className="absolute top-6 right-6 flex items-center gap-2 bg-[#006877]/5 px-3 py-1 rounded-full">
            <span className="w-2 h-2 bg-[#006877] rounded-full"></span>
            <span className="text-[10px] font-bold text-[#006877] uppercase tracking-wider">
              {step === 1 ? 'RECOVERY' : 'VERIFICATION'}
            </span>
          </div>

          {step === 1 ? (
            /* Step 1: Request OTP Code */
            <>
              <div className="mb-8">
                <h2 className="font-['Montserrat',sans-serif] text-xl font-bold text-[#191c1e] mb-2">Reset Password</h2>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Enter the email associated with your account and we'll send you instructions to reset your password.
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleRequest}>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#191c1e] uppercase tracking-widest" htmlFor="email">
                    Email Address
                  </label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#006877] transition-colors">
                      mail
                    </span>
                    <input
                      className="block w-full pl-11 pr-4 py-4 bg-[#f7f9fb] rounded-xl border border-[#bbc9cc] focus:border-[#006877] focus:ring-2 focus:ring-[#006877]/10 transition-all text-sm outline-none"
                      id="email"
                      placeholder="name@institution.edu"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <button
                  className="gradient-btn w-full py-4 rounded-xl flex items-center justify-center gap-2 text-white font-bold text-base group disabled:opacity-50"
                  type="submit"
                  disabled={loading}
                >
                  <span>{loading ? 'Sending...' : 'Send Recovery Code'}</span>
                  {!loading && (
                    <span className="material-symbols-outlined text-white text-xl transition-transform group-hover:translate-x-1">
                      arrow_forward
                    </span>
                  )}
                </button>
              </form>
            </>
          ) : (
            /* Step 2: Input OTP & New Password */
            <>
              <div className="mb-8">
                <h2 className="font-['Montserrat',sans-serif] text-xl font-bold text-[#191c1e] mb-2">Enter Verification Code</h2>
                <p className="text-slate-500 text-sm leading-relaxed">
                  We've sent a 6-digit OTP code to <strong className="text-slate-700">{email}</strong>. Enter it below with your new password.
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleReset}>
                {/* OTP Code Input */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#191c1e] uppercase tracking-widest" htmlFor="otp">
                    Verification Code
                  </label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#006877] transition-colors">
                      dialpad
                    </span>
                    <input
                      className="block w-full pl-11 pr-4 py-4 bg-[#f7f9fb] rounded-xl border border-[#bbc9cc] focus:border-[#006877] focus:ring-2 focus:ring-[#006877]/10 transition-all text-sm outline-none font-bold tracking-widest"
                      id="otp"
                      placeholder="••••••"
                      maxLength={6}
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* New Password Input */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#191c1e] uppercase tracking-widest" htmlFor="newPassword">
                    New Password
                  </label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#006877] transition-colors">
                      lock
                    </span>
                    <input
                      className="block w-full pl-11 pr-4 py-4 bg-[#f7f9fb] rounded-xl border border-[#bbc9cc] focus:border-[#006877] focus:ring-2 focus:ring-[#006877]/10 transition-all text-sm outline-none"
                      id="newPassword"
                      placeholder="At least 6 characters"
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Confirm Password Input */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#191c1e] uppercase tracking-widest" htmlFor="confirmPassword">
                    Confirm New Password
                  </label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#006877] transition-colors">
                      lock_reset
                    </span>
                    <input
                      className="block w-full pl-11 pr-4 py-4 bg-[#f7f9fb] rounded-xl border border-[#bbc9cc] focus:border-[#006877] focus:ring-2 focus:ring-[#006877]/10 transition-all text-sm outline-none"
                      id="confirmPassword"
                      placeholder="Repeat new password"
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Password Visibility Toggle */}
                <div className="flex items-center gap-2">
                  <input
                    id="showPass"
                    type="checkbox"
                    checked={showPassword}
                    onChange={(e) => setShowPassword(e.target.checked)}
                    className="w-4 h-4 rounded border-[#bbc9cc] text-[#006877] focus:ring-[#006877]/25"
                  />
                  <label htmlFor="showPass" className="text-xs text-slate-500 cursor-pointer select-none">
                    Show Passwords
                  </label>
                </div>

                <button
                  className="gradient-btn w-full py-4 rounded-xl flex items-center justify-center gap-2 text-white font-bold text-base group disabled:opacity-50 mt-4"
                  type="submit"
                  disabled={loading}
                >
                  <span>{loading ? 'Resetting...' : 'Reset Password'}</span>
                  {!loading && (
                    <span className="material-symbols-outlined text-white text-xl transition-transform group-hover:translate-x-1">
                      check_circle
                    </span>
                  )}
                </button>
              </form>
            </>
          )}

          <div className="mt-8 pt-8 border-t border-[#bbc9cc]/30 text-center">
            <Link
              className="text-[#006877] font-bold hover:underline inline-flex items-center gap-1 group text-sm"
              to="/signin"
            >
              <span className="material-symbols-outlined !text-sm transition-transform group-hover:-translate-x-1">
                arrow_back
              </span>
              Back to Login
            </Link>
          </div>
        </div>

        {/* Footer Info */}
        <p className="text-center mt-8 text-slate-550 font-bold text-xs">
          Need help?{' '}
          <a className="text-[#006877] hover:underline" href="#">
            Contact Support
          </a>
        </p>
      </main>

      {/* Side Graphic (Desktop Only) */}
      <div className="hidden lg:block absolute right-12 top-1/2 -translate-y-1/2 w-64 h-[400px] pointer-events-none opacity-20">
        <div className="w-full h-full border-l-2 border-[#006877]/20 flex flex-col justify-between pl-8 py-12">
          <div className="space-y-4">
            <div className="w-12 h-1 bg-[#006877]/40 rounded-full"></div>
            <div className="w-24 h-1 bg-[#006877]/20 rounded-full"></div>
            <div className="w-16 h-1 bg-[#006877]/30 rounded-full"></div>
          </div>
          <div className="text-[#006877] font-['Montserrat',sans-serif] text-[100px] font-black opacity-10 leading-none">?</div>
          <div className="space-y-4">
            <div className="w-16 h-1 bg-[#006877]/30 rounded-full"></div>
            <div className="w-12 h-1 bg-[#006877]/40 rounded-full"></div>
            <div className="w-24 h-1 bg-[#006877]/20 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
