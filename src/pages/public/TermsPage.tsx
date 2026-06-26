import { ArrowLeft, FileText, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { QuizzarLogo } from '../../components/common/QuizzarLogo';

export default function TermsPage() {
  const navigate = useNavigate();

  const sections = [
    { id: 'acceptance', title: '1. Acceptance of Terms', content: 'By accessing or using Quizzar, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.' },
    { id: 'services', title: '2. Description of Service', content: 'Quizzar is an AI-powered quiz generation and examination platform. We provide tools for teachers to create, configure, and analyze quizzes, and for student takers to participate in interactive, timed, or per-question quiz sessions. Services include document extraction, raw text processing, and AI-assisted short-answer grading.' },
    { id: 'accounts', title: '3. User Accounts & Security', content: 'To access teacher features, you must register for an account and verify your email. You are responsible for maintaining the confidentiality of your account credentials. Student takers do not require accounts but must provide a nickname or identifying name to join a public quiz session.' },
    { id: 'intellectual-property', title: '4. Content & Intellectual Property', content: 'Teachers retain ownership of the source materials they upload (PDFs, Word documents, text) and the quizzes they create. By uploading content, you grant Quizzar a worldwide, non-exclusive, royalty-free license to process, analyze, and format your content through AI models solely to provide the services.' },
    { id: 'acceptable-use', title: '5. Acceptable Use & Conduct', content: 'You agree not to use the platform to generate offensive, copyrighted, or inappropriate quiz content. Any attempts to cheat, circumvent session timers, scrape quiz data, or upload malicious files to our S3 buckets are strictly prohibited and will result in account termination.' },
    { id: 'ai-grading', title: '6. AI & Automated Grading Disclaimer', content: 'Quizzar utilizes advanced artificial intelligence models to extract quiz questions and grade student short-answer responses. While we strive for accuracy, AI grading may occasionally produce errors. Quizzar does not guarantee 100% accuracy and recommends teacher review for high-stakes evaluations.' },
    { id: 'uploads', title: '7. File Uploads & Third Parties', content: 'Quizzar utilizes Amazon Web Services (AWS S3) to host avatars, documents, and screenshot feedback. You represent and warrant that any files uploaded do not violate third-party rights. We reserve the right to delete any uploaded files that violate our policies.' },
    { id: 'liability', title: '8. Limitation of Liability', content: 'Quizzar is provided on an "as is" and "as available" basis. In no event shall Quizzar, its developers, or partners be liable for any damages (including, without limitation, damages for loss of data, quiz progress, or grading discrepancies) arising out of the use or inability to use the platform.' },
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
            <FileText className="w-3.5 h-3.5" />
            Legal Agreement
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">Terms of Use</h1>
          <p className="text-slate-400 mt-3 text-sm md:text-base max-w-xl">
            Please read these terms carefully before using our platform. Last updated June 2026.
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
              <div className="flex items-start gap-3 p-4 rounded-xl bg-[#0A99AB]/5 border border-[#0A99AB]/10 text-[#0A99AB] text-xs font-medium leading-relaxed">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>
                  Welcome to Quizzar. By accessing our platform, generating timed quizzes, or participating in session grading, you accept these terms.
                </span>
              </div>

              {sections.map(sec => (
                <div key={sec.id} id={sec.id} className="scroll-mt-24 space-y-2.5">
                  <h2 className="text-lg font-black text-slate-800 tracking-tight">{sec.title}</h2>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">{sec.content}</p>
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
