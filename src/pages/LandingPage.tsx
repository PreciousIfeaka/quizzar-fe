import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Upload, FileText, BarChart2, Zap, Clock, Volume2, VolumeX } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';

const features = [
  { icon: Upload, title: 'Upload & Extract', desc: 'Upload PDFs, Word docs, or text files — AI extracts and formats questions instantly.', color: 'bg-brand-50 text-brand-500' },
  { icon: FileText, title: 'Paste & Format', desc: 'Copy-paste any raw question content and AI structures it into a clean, consistent format.', color: 'bg-[#00bcd4]/5 text-[#00bcd4]' },
  { icon: Sparkles, title: 'AI Generation', desc: 'Describe your quiz specs — level, difficulty, topic — and AI generates from scratch.', color: 'bg-amber-50 text-[#f5a623]' },
  { icon: BarChart2, title: 'Deep Analytics', desc: 'Track every quiz attempt, score distribution, and per-question difficulty in real time.', color: 'bg-green-50 text-green-600' },
  { icon: Zap, title: 'Instant Sharing', desc: 'Generate a public link in one click. Takers need no account — just their name.', color: 'bg-cyan-50 text-[#00bcd4]' },
  { icon: Clock, title: 'Smart Timing', desc: 'Let AI suggest quiz timing or configure your own per-question or overall timers.', color: 'bg-red-50 text-red-600' },
];

export default function LandingPage() {
  const { login } = useAuth();
  const { isAuthenticated: storeAuth } = useAuthStore();
  const navigate = useNavigate();

  // Mockup interactive states
  const [selectedMockOption, setSelectedMockOption] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (storeAuth) navigate('/dashboard', { replace: true });
  }, [storeAuth, navigate]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const handleSpeechToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!synthRef.current) return;

    if (isSpeaking) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    } else {
      synthRef.current.cancel();
      const text = "Which planet in our solar system is known as the Red Planet?";
      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;

      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      setIsSpeaking(true);
      synthRef.current.speak(utterance);
    }
  };

  const selectOption = (opt: string) => {
    setSelectedMockOption(opt);
    if (opt === 'Mars' || opt === 'Iron') {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafbff] font-sans antialiased overflow-x-hidden text-slate-800">
      {/* Subtle faint grid background for the entire upper page */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(99, 102, 241, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(99, 102, 241, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px',
          maskImage: 'linear-gradient(to bottom, white 70%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, white 70%, transparent 100%)',
          height: '1000px',
        }}
      />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <span className="text-[#0b192c] font-black text-2xl tracking-tight">
              Quizz<span className="font-semibold text-[#00bcd4]">ar</span>
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center">
            <button 
              onClick={login}
              className="bg-[#0b192c] hover:bg-[#081322] text-white font-extrabold px-6 py-2.5 rounded-xl text-xs tracking-wider transition-all duration-200 shadow-[0_4px_14px_rgba(11,25,44,0.25)] hover:shadow-[0_6px_20px_rgba(11,25,44,0.35)]"
            >
              LOGIN
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-36 pb-24 px-6 max-w-7xl mx-auto min-h-[calc(100vh-80px)] flex flex-col lg:flex-row items-center gap-16 z-10">
        
        {/* Left Column (Typography & Call to Action) */}
        <div className="flex-1 text-left max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 bg-[#00bcd4]/5 text-[#00bcd4] text-xs font-black px-4 py-2 rounded-full border border-[#00bcd4]/10 mb-8 tracking-wider uppercase"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Quiz Platform
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-[64px] font-black text-slate-800 leading-[1.08] tracking-tight mb-8"
          >
            GENERATE SMART
            <br />
            QUIZZES,
            <br />
            <span className="text-[#00bcd4] relative inline-block font-black mt-2">
              STEP-BY-STEP
              {/* Curved sparkles next to text */}
              <svg className="absolute -right-10 top-1/2 -translate-y-1/2 w-8 h-8 text-[#00bcd4]/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round">
                <path d="M4 6c2.5 1 4.5 3.5 5.5 6" />
                <path d="M2 12c3.5 0 6.5 0 8 0" />
                <path d="M4 18c2.5-1 4.5-3.5 5.5-6" />
              </svg>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-slate-600 font-medium leading-relaxed mb-10 max-w-lg"
          >
            Quizzar delivers targeted, interactive step-by-step quiz experiences, making it effortless to generate, distribute, and analyze assessments.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <button 
              onClick={login}
              className="bg-gradient-brand text-white font-black px-10 py-5 rounded-2xl text-lg tracking-wider transition-all duration-200 shadow-[0_8px_30px_rgba(0,188,212,0.25)] hover:shadow-[0_12px_35px_rgba(0,188,212,0.35)] flex items-center justify-center gap-2.5 group hover:scale-[1.02] active:scale-[0.98]"
            >
              GET STARTED
              <span className="transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-0.5 text-xl">↗</span>
            </button>
          </motion.div>
        </div>

        {/* Right Column (Floating Mockups Stack) */}
        <div className="flex-1 relative w-full max-w-xl h-[480px] md:h-[520px] flex items-center justify-center mt-8 lg:mt-0">
          
          {/* Subtle concentric background arcs behind mockups */}
          <div className="absolute w-[440px] h-[440px] border border-brand-500/10 rounded-full pointer-events-none" />
          <div className="absolute w-[320px] h-[320px] border border-brand-500/5 rounded-full pointer-events-none" />
          <div className="absolute -top-10 right-20 w-32 h-32 bg-[#00bcd4]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 left-10 w-40 h-40 bg-[#00bcd4]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Interactive Celebration Rain */}
          <AnimatePresence>
            {showCelebration && (
              <div className="absolute inset-0 pointer-events-none z-50 overflow-visible flex items-center justify-center">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
                    animate={{
                      opacity: 0,
                      scale: [0.5, 1.2, 0.8],
                      x: (i % 2 === 0 ? 1 : -1) * (Math.random() * 120 + 20),
                      y: -Math.random() * 180 - 40,
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    className="absolute w-3.5 h-3.5 rounded-full"
                    style={{
                      backgroundColor: ['#00d68f', '#c97dff', '#3b82f6', '#f59e0b'][i % 4],
                    }}
                  />
                ))}
              </div>
            )}
          </AnimatePresence>

          {/* 1. Teal/Dark Green Floating Question Card (Top Left) */}
          <motion.div
            initial={{ opacity: 0, x: -40, y: -20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="absolute top-4 left-0 md:left-4 z-30 w-[270px] md:w-[310px] bg-gradient-to-b from-[#1b4344] to-[#0f2828] border-2 border-[#2b595a]/70 rounded-2xl p-5 shadow-[0_20px_45px_rgba(15,40,40,0.4)] text-white"
          >
            <div className="flex items-start justify-between">
              {/* Question Text */}
              <p className="text-xs font-semibold leading-relaxed text-slate-100 pr-8">
                Which planet in our solar system is known as the Red Planet?
              </p>
              
              {/* TTS Read Aloud Icon Button */}
              <button 
                onClick={handleSpeechToggle}
                className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  isSpeaking 
                    ? 'bg-[#00d68f]/20 text-[#00d68f] border border-[#00d68f]/40 animate-pulse' 
                    : 'bg-white/10 hover:bg-white/20 text-slate-200'
                }`}
                title="Read question aloud"
              >
                {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>

            {/* Answer Choices */}
            <div className="mt-5 flex gap-3">
              <button 
                onClick={() => selectOption('Mars')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${
                  selectedMockOption === 'Mars' 
                    ? 'bg-[#00d68f] text-white shadow-[0_0_15px_rgba(0,214,143,0.4)] border border-[#00e89c]' 
                    : 'bg-[#2a2b2c] hover:bg-[#343638] text-slate-200 border border-white/5'
                }`}
              >
                Mars
              </button>
              <button 
                onClick={() => selectOption('Venus')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${
                  selectedMockOption === 'Venus' 
                    ? 'bg-[#b83c42] text-white shadow-[0_0_15px_rgba(184,60,66,0.5)] border border-[#d64a51]' 
                    : 'bg-[#2a2b2c] hover:bg-[#343638] text-slate-200 border border-white/5'
                }`}
              >
                Venus
              </button>
            </div>
          </motion.div>

          {/* 2. White Worksheet Paper Mockup (Center/Back) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="absolute top-12 right-2 md:right-10 z-10 w-[350px] md:w-[400px] bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_15px_40px_rgba(99,102,241,0.06)] flex flex-col"
          >
            {/* QuizGuide Header */}
            <div className="flex items-center gap-1.5 mb-4">
              <div className="w-4.5 h-4.5 rounded-md bg-[#00bcd4] flex items-center justify-center text-[10px] font-black text-white shadow-sm">
                ▰
              </div>
              <span className="text-[#0b192c] font-black text-xs tracking-tight">QuizGuide</span>
            </div>

            {/* Astronomy Orbit Path Graphic */}
            <div className="relative w-36 h-36 mx-auto my-3 border border-[#00bcd4]/20 bg-[#00bcd4]/5 flex items-center justify-center rounded-xl overflow-hidden">
              {/* Sun at center */}
              <div className="w-6 h-6 rounded-full bg-amber-400 border border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)] z-10" />
              {/* Orbit paths */}
              <div className="absolute w-24 h-24 border border-dashed border-[#00bcd4]/30 rounded-full" />
              {/* Mars planet on the path */}
              <div className="absolute w-3 h-3 rounded-full bg-red-500 border border-red-600 shadow-[0_0_6px_rgba(239,68,68,0.5)] z-20" style={{ transform: 'rotate(45deg) translate(48px) rotate(-45deg)' }} />
              
              {/* Measurements Tag */}
              <div className="absolute top-2 right-4 flex flex-col items-center">
                <span className="text-[8px] font-bold text-[#00bcd4] bg-white px-1 leading-none shadow-sm z-10 border border-[#00bcd4]/20 rounded">
                  4th Planet
                </span>
              </div>
            </div>

            {/* In-paper Guidance Text */}
            <div className="text-left mt-2">
              <p className="text-[#1e293b] font-black text-xs">Identify the planet</p>
              <p className="text-slate-400 font-semibold text-[10px] mt-0.5">Orbit order from the Sun:</p>
              
              {/* Progress step */}
              <div className="flex items-center gap-1.5 text-slate-800 font-bold text-xs mt-2 bg-slate-50 p-2 rounded-lg border border-slate-100 w-fit">
                <span className="text-[10px] text-slate-600">Mercury, Venus, Earth,</span>
                <div className="w-10 h-6 border border-[#00bcd4]/30 bg-white rounded-md flex items-center justify-center text-[#00bcd4] text-[10px] font-black shadow-sm">
                  Mars
                </div>
              </div>
            </div>
          </motion.div>

          {/* 3. Floating Step Calculations Card (Bottom Right Overlap) */}
          <motion.div
            initial={{ opacity: 0, x: 40, y: 30 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="absolute bottom-6 right-0 md:right-4 z-40 w-[250px] md:w-[280px] bg-white border border-[#2563eb]/10 rounded-2xl p-5 shadow-[0_20px_45px_rgba(99,102,241,0.12)] flex flex-col text-left"
          >
            {/* Step Label */}
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-[#0b192c] text-white flex items-center justify-center text-[10px] font-black shadow-sm">
                2
              </div>
              <span className="text-slate-800 font-extrabold text-[11px] tracking-wide uppercase">
                Confirm surface features
              </span>
            </div>

            {/* Hint fact text */}
            <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-2.5">
              Iron oxide on the surface gives Mars its signature red appearance.
            </p>

            {/* Step Choices */}
            <div className="mt-4 flex gap-2">
              <button 
                onClick={() => selectOption('Copper')}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                  selectedMockOption === 'Copper' 
                    ? 'border-slate-300 bg-slate-50 text-slate-400' 
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                Copper
              </button>
              <button 
                onClick={() => selectOption('Iron')}
                className="flex-1 py-1.5 rounded-lg text-[10px] font-bold bg-[#00d68f] hover:bg-[#00c281] text-white transition-all shadow-[0_2px_8px_rgba(0,214,143,0.2)]"
              >
                Iron
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-white relative border-t border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight mb-4">
              Everything you need
            </h2>
            <p className="text-slate-500 font-medium text-lg max-w-xl mx-auto leading-relaxed">
              From AI-assisted quiz generation to instant shareable links and real-time performance analytics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <motion.div
                key={title}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="bg-[#fafbff] rounded-2xl p-7 border border-slate-100 hover:border-[#00bcd4]/30 hover:shadow-[0_12px_30px_rgba(0,188,212,0.08)] transition-all duration-300 flex flex-col text-left group"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${color} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-5 h-5 text-brand-500" />
                </div>
                <h3 className="font-extrabold text-slate-800 mb-2.5 text-base tracking-tight">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-slate-50 relative border-t border-slate-100 overflow-hidden">
        {/* Subtle background grids inside CTA */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(99, 102, 241, 0.02) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(99, 102, 241, 0.02) 1px, transparent 1px)
            `,
            backgroundSize: '24px 24px',
          }}
        />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-black text-slate-800 mb-6 tracking-tight">
            Ready to build better quizzes, step-by-step?
          </h2>
          <p className="text-slate-500 text-lg font-medium mb-10 max-w-xl mx-auto leading-relaxed">
            Empower your users with highly interactive, instant-feedback quiz sessions.
          </p>
          <button 
            onClick={login}
            className="bg-gradient-brand hover:scale-[1.02] active:scale-[0.98] text-white font-black px-14 py-5 rounded-2xl text-lg md:text-xl tracking-wider transition-all duration-200 shadow-[0_10px_35px_rgba(0,188,212,0.25)] flex items-center gap-2.5 mx-auto group"
          >
            GET STARTED NOW
            <span className="transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-0.5 text-xl">↗</span>
          </button>
        </div>
      </section>
    </div>
  );
}
