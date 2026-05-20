import { motion } from 'framer-motion';
import { Sparkles, Upload, FileText, BarChart2, ArrowRight, Zap, Clock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { staggerContainer, fadeUp } from '../lib/motion';
import { BrandButton } from '../components/common/BrandButton';
import { QuizzarLogo } from '../components/common/QuizzarLogo';

const features = [
  { icon: Upload, title: 'Upload & Extract', desc: 'Upload PDFs, Word docs, or text files — AI extracts and formats questions instantly.', color: 'bg-brand-100 text-brand-600' },
  { icon: FileText, title: 'Paste & Format', desc: 'Copy-paste any raw question content and AI structures it into a clean, consistent format.', color: 'bg-purple-100 text-purple-600' },
  { icon: Sparkles, title: 'AI Generation', desc: 'Describe your quiz specs — level, difficulty, topic — and AI generates from scratch.', color: 'bg-orange-100 text-orange-600' },
  { icon: BarChart2, title: 'Deep Analytics', desc: 'Track every student attempt, score distribution, and per-question difficulty in real time.', color: 'bg-green-100 text-green-600' },
  { icon: Zap, title: 'Instant Sharing', desc: 'Generate a public link in one click. Students need no account — just their name.', color: 'bg-yellow-100 text-yellow-600' },
  { icon: Clock, title: 'Smart Timing', desc: 'Let AI suggest quiz timing or configure your own per-question or overall timers.', color: 'bg-red-100 text-red-600' },
];

export default function LandingPage() {
  const { login } = useAuth();
  // Note: useAuth() initializes Keycloak via its useEffect
  const { isAuthenticated: storeAuth } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (storeAuth) navigate('/dashboard', { replace: true });
  }, [storeAuth]);

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <QuizzarLogo />
          <BrandButton onClick={login} size="sm" icon={<ArrowRight className="w-4 h-4" />}>
            Get Started
          </BrandButton>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative">
        {/* Background blobs — pure CSS, no performance impact */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-brand-100/50 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-0 w-80 h-80 bg-accent-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 text-sm font-semibold px-4 py-2 rounded-full border border-brand-100 mb-6"
          >
            <Sparkles className="w-4 h-4" />
            AI-Powered Quiz Generation
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-6xl md:text-7xl font-black text-slate-900 leading-[1.05] tracking-tight mb-6"
          >
            Create quizzes in{' '}
            <span className="relative">
              <span className="bg-gradient-brand bg-clip-text text-transparent">seconds</span>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-brand rounded-full origin-left"
              />
            </span>
            {' '}not hours
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Quizzar lets teachers generate, share, and analyze quizzes using AI.
            Upload a document, paste content, or describe your specs — we handle the rest.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <BrandButton onClick={login} size="lg" icon={<Sparkles className="w-5 h-5" />}>
              Start for Free
            </BrandButton>
            <BrandButton variant="secondary" size="lg">
              See how it works
            </BrandButton>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-16 grid grid-cols-3 gap-6 max-w-md mx-auto"
          >
            {[
              { label: 'Quizzes Generated', value: '10K+' },
              { label: 'Questions Created', value: '500K+' },
              { label: 'Student Attempts', value: '2M+' },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-3xl font-black text-brand-600">{value}</p>
                <p className="text-xs text-muted-foreground mt-1">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="text-center mb-14"
          >
            <motion.h2 variants={fadeUp} className="text-4xl font-black text-slate-900 mb-4">
              Everything you need
            </motion.h2>
            <motion.p variants={fadeUp} className="text-slate-500 text-lg max-w-xl mx-auto">
              From AI generation to real-time analytics — one platform for the full quiz lifecycle.
            </motion.p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {features.map(({ icon: Icon, title, desc, color }) => (
              <motion.div
                key={title}
                variants={fadeUp}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-card hover:shadow-card-hover transition-shadow duration-300"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-800 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center bg-gradient-brand rounded-3xl p-14 shadow-brand-lg relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
          <div className="relative">
            <h2 className="text-4xl font-black text-white mb-4">Ready to quiz smarter?</h2>
            <p className="text-brand-100 mb-8 text-lg">
              Join thousands of educators already using Quizzar.
            </p>
            <BrandButton
              onClick={login}
              size="lg"
              className="bg-white text-brand-600 hover:bg-brand-50 shadow-lg"
              icon={<ArrowRight className="w-5 h-5" />}
            >
              Get Started Free
            </BrandButton>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
