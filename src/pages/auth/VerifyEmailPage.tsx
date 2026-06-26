import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/use-toast';
import { QuizzarLogo } from '../../components/common/QuizzarLogo';

export default function VerifyEmailPage() {
  const { verifyEmail, resendOtp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';

  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Focus helper
  useEffect(() => {
    if (inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }
  }, []);

  // Cooldown countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handleChange = (index: number, val: string) => {
    // Only allow single digit numeric values
    if (val && !/^[0-9]$/.test(val)) return;

    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);

    // Auto-focus next input
    if (val && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // Focus previous and clear
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputsRef.current[index - 1]?.focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (!/^\d{6}$/.test(pasteData)) return;

    const digits = pasteData.split('');
    setOtp(digits);
    inputsRef.current[5]?.focus();
  };

  const submitCode = async (code: string) => {
    setLoading(true);
    try {
      await verifyEmail({ email, otp: code });
      toast({
        title: 'Verification Successful!',
        description: 'Your account is now verified. Welcome to Quizzar!',
      });
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      toast({
        title: 'Verification Failed',
        description: err.response?.data?.message || 'Invalid or expired code. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Auto-submit when all 6 digits are entered
  useEffect(() => {
    const code = otp.join('');
    if (code.length === 6 && !loading) {
      submitCode(code);
    }
  }, [otp]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) {
      toast({
        title: 'Validation Error',
        description: 'Please enter all 6 digits of the code.',
        variant: 'destructive',
      });
      return;
    }
    await submitCode(code);
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      await resendOtp({ email });
      toast({
        title: 'Code Sent',
        description: 'A new 6-digit verification code has been sent to your email.',
      });
      setResendCooldown(30);
    } catch (err: any) {
      toast({
        title: 'Request Failed',
        description: err.response?.data?.message || 'Could not resend code. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="bg-[#f7f9fb] font-['Plus_Jakarta_Sans',sans-serif] text-[#191c1e] min-h-screen flex flex-col items-center justify-center relative overflow-hidden p-4">
      {/* Subtle Grid Background */}
      <div className="fixed inset-0 grid-pattern pointer-events-none z-0 opacity-50"></div>

      {/* Header / Logo */}
      <header className="absolute top-0 left-0 w-full h-16 md:h-20 flex items-center px-4 md:px-12 max-w-[1280px] mx-auto z-10">
        <QuizzarLogo noLink size="md" />
      </header>

      {/* Verification Card */}
      <main className="relative z-10 w-full max-w-lg bg-white rounded-xl shadow-lg border border-[#bbc9cc]/30 p-6 sm:p-10 md:p-12 overflow-hidden mt-20">

        {/* Content Header */}
        <div className="text-center mb-10">
          <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#cbe6fe] text-[#006877] shadow-sm">
            <span className="material-symbols-outlined text-[32px]">mark_email_read</span>
          </div>
          <h1 className="font-['Montserrat',sans-serif] text-2xl font-bold text-[#191c1e] mb-2">Verify Your Email</h1>
          <p className="text-slate-500 text-sm max-w-[320px] mx-auto leading-relaxed">
            We've sent a 6-digit verification code to:
            <span className="block font-bold text-[#191c1e] break-all mt-1">{email || 'your email'}</span>
          </p>
        </div>

        {/* OTP Input Form */}
        <form className="space-y-8" onSubmit={handleSubmit}>
          <div className="flex justify-between gap-2 sm:gap-3 md:gap-4">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputsRef.current[index] = el; }}
                className="w-12 h-14 sm:w-14 sm:h-16 text-center font-['Montserrat',sans-serif] text-2xl font-bold bg-[#f2f4f6] border border-[#bbc9cc] rounded-lg transition-all focus:outline-none focus:border-[#006877] focus:ring-2 focus:ring-[#006877]/20"
                maxLength={1}
                inputMode="numeric"
                pattern="\d*"
                type="text"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                disabled={loading}
              />
            ))}
          </div>

          <div className="space-y-4">
            <button
              className="btn-gradient w-full h-14 rounded-full text-white font-bold text-base flex items-center justify-center gap-2 group disabled:opacity-50"
              type="submit"
              disabled={loading}
            >
              <span>{loading ? 'Verifying...' : 'Verify'}</span>
              {!loading && (
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              )}
            </button>

            <div className="text-center">
              <p className="text-sm text-slate-500">
                Didn't receive the code?{' '}
                <button
                  className={`text-[#006877] font-bold hover:underline ml-1 ${resendCooldown > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={handleResend}
                  disabled={resendCooldown > 0}
                  type="button"
                >
                  Resend Code
                </button>
              </p>
              {resendCooldown > 0 && (
                <p className="text-xs text-slate-400 mt-2">
                  Resend available in <span className="font-bold">{resendCooldown}</span>s
                </p>
              )}
            </div>
          </div>
        </form>

        {/* Atmospheric graphics */}
        <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-[#006877]/5 rounded-full blur-3xl"></div>
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-[#00c48c]/10 rounded-full blur-3xl"></div>
      </main>

      {/* Footer */}
      <footer className="w-full py-12 px-8 max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4 border-t border-[#bbc9cc]/50 mt-16 text-slate-500 z-10 text-xs">
        <div>© 2024 Quizzar AI Platform. All rights reserved.</div>
        <div className="flex gap-6">
          <Link className="hover:text-[#006877] transition-colors" to="/privacy">
            Privacy Policy
          </Link>
          <Link className="hover:text-[#006877] transition-colors" to="/terms">
            Terms of Service
          </Link>
          <a className="hover:text-[#006877] transition-colors" href="#">
            Contact Support
          </a>
        </div>
      </footer>
    </div>
  );
}
