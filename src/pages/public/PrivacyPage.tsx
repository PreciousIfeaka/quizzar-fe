import { ArrowLeft, Shield, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { QuizzarLogo } from '../../components/common/QuizzarLogo';

export default function PrivacyPage() {
  const navigate = useNavigate();

  const sections = [
    {
      id: 'collection',
      title: '1. Information We Collect',
      subsections: [
        { label: 'Account Information', text: 'For teachers, we collect your name, email address, password, and optional profile pictures (avatar URLs) during registration and profile updates.' },
        { label: 'Quiz & Exam Data', text: 'We store the quiz titles, descriptions, question texts, correct options, and grading metrics you design. We also store session data, student taker names, individual response times, and final score calculations.' },
        { label: 'Feedback & Screenshots', text: 'When you submit feedback, we collect your text observation, browser details, active page URL, and optional screenshot attachments uploaded to our Amazon Web Services (AWS S3) buckets.' },
        { label: 'Technical Details', text: 'We automatically collect technical data like IP addresses, browser types (User-Agents), device types, and session tokens to maintain security and active authentication states.' }
      ]
    },
    {
      id: 'usage',
      title: '2. How We Use Your Information',
      content: 'We use the collected information for purposes including:',
      bullets: [
        'Providing and operating the core quiz platform, including running active student quiz sessions.',
        'Processing document uploads (PDF, Word) and text pastes through AI models to generate quiz questions.',
        'Facilitating automated and AI-assisted grading of short-answer questions in real time.',
        'Generating deep analytics dashboards (such as average scores, attempts, and question difficulty rates) for teachers.',
        'Sending critical transaction emails, including email verification, OTP codes, and password reset links.',
        'Reviewing and responding to user feedback and diagnosing technical bugs from uploaded screenshot reports.'
      ]
    },
    {
      id: 'sharing',
      title: '3. Sharing and Disclosures',
      content: 'We do not sell your personal data. We only share information with trusted third-party service providers to facilitate our operations:',
      bullets: [
        'Amazon Web Services (AWS S3) for hosting profile avatars and screenshot feedback attachments.',
        'Secure AI processing APIs to extract questions and evaluate student short-answers (data sent is strictly limited to the text of the questions/answers).',
        'Email delivery services to deliver verification OTPs and transactional notifications.'
      ]
    },
    {
      id: 'security',
      title: '4. Data Security & Storage',
      content: 'We implement industry-standard security measures to safeguard your information. All API interactions are encrypted via HTTPS (SSL/TLS). Teacher authentication is managed securely using JSON Web Tokens (JWT) stored in secure local storage. Uploaded assets are stored in secure S3 buckets under strict access control policies.'
    },
    {
      id: 'rights',
      title: '5. Your Rights and Choices',
      content: 'You have full control over your personal data. You can access, edit, or update your name and profile avatar at any time in the Settings dashboard. You can also delete quizzes or delete your account entirely, which permanently purges all associated questions, attempts, and stored assets from our active database.'
    },
    {
      id: 'cookies',
      title: '6. Cookies & Tracking',
      content: 'Quizzar uses technical cookies and local storage tokens solely to maintain your authenticated login session and track student participation states during active exam sessions. We do not use advertising or behavioral tracking cookies.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#fafbff] text-slate-850 font-sans antialiased flex flex-col">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 md:h-20 flex items-center justify-between">
          <QuizzarLogo size="md" to="/" />
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:border-[#0A99AB]/30 hover:bg-[#0A99AB]/5 hover:text-[#0A99AB] transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-[#0b192c] text-white py-12 md:py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05]" style={{
          backgroundImage: 'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }} />
        <div className="max-w-4xl mx-auto relative z-10 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 bg-[#00bcd4]/10 text-[#00bcd4] text-xs font-black px-4 py-2 rounded-full border border-[#00bcd4]/25 mb-4 tracking-wider uppercase">
            <Shield className="w-3.5 h-3.5" />
            Privacy & Security
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">Privacy Policy</h1>
          <p className="text-slate-400 mt-3 text-sm md:text-base max-w-xl">
            Learn how we handle and protect your personal and quiz data. Last updated June 2026.
          </p>
        </div>
      </div>

      {/* Content Area */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Quick Nav (Sidebar) */}
          <div className="md:col-span-1 hidden md:block">
            <div className="sticky top-28 space-y-2 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="font-black text-xs uppercase tracking-wider text-slate-400 mb-4 px-2">Table of Contents</h3>
              <nav className="flex flex-col gap-1.5">
                {sections.map(sec => (
                  <a
                    key={sec.id}
                    href={`#${sec.id}`}
                    className="text-xs font-bold text-slate-500 hover:text-[#0A99AB] py-1.5 px-2 rounded-lg hover:bg-slate-50 transition-all block"
                  >
                    {sec.title}
                  </a>
                ))}
              </nav>
            </div>
          </div>

          {/* Legal Text */}
          <div className="md:col-span-2 space-y-8">
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-750 text-xs font-medium leading-relaxed">
                <Lock className="w-5 h-5 shrink-0 text-emerald-600" />
                <span>
                  Your privacy is extremely important to us. We secure your quiz responses, feedback attachments, and files using bank-grade encryption and secure AWS clouds.
                </span>
              </div>

              {sections.map(sec => (
                <div key={sec.id} id={sec.id} className="scroll-mt-24 space-y-3">
                  <h2 className="text-lg font-black text-slate-800 tracking-tight">{sec.title}</h2>
                  {sec.content && <p className="text-sm text-slate-600 leading-relaxed font-medium">{sec.content}</p>}

                  {sec.subsections && (
                    <div className="space-y-3 mt-2">
                      {sec.subsections.map(sub => (
                        <div key={sub.label} className="p-3 bg-slate-50 rounded-xl border border-slate-150">
                          <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wide mb-1">{sub.label}</h4>
                          <p className="text-xs text-slate-600 leading-relaxed font-medium">{sub.text}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {sec.bullets && (
                    <ul className="list-disc pl-5 space-y-1.5 text-sm text-slate-600 font-medium">
                      {sec.bullets.map((bullet, idx) => (
                        <li key={idx}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                  <hr className="border-slate-50 mt-4" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-8 text-center text-xs text-slate-400 font-semibold">
        <div>© 2026 Quizzar. All rights reserved.</div>
      </footer>
    </div>
  );
}
