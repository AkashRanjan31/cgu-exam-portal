import React from 'react';
import { Link } from 'react-router-dom';
import { UNIVERSITY_INFO } from '../utils/constants';
import {
  GraduationCap,
  ShieldCheck,
  Zap,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  Lock,
  Award,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export const Landing = () => {
  return (
    <div className="min-h-screen bg-[#F5F7FA] text-slate-800 flex flex-col selection:bg-[#F5A623] selection:text-white">
      
      {/* Top University Ribbon */}
      <div className="bg-[#031A33] text-slate-300 text-xs py-2 px-4 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold text-white">{UNIVERSITY_INFO.accreditation}</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Helpline: {UNIVERSITY_INFO.helpline}</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">Official Domain: {UNIVERSITY_INFO.domain}</span>
          </div>
        </div>
      </div>

      {/* Main Header / Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#06264A] text-white flex items-center justify-center font-bold shadow-md">
              <GraduationCap className="w-7 h-7 text-[#F5A623]" />
            </div>
            <div>
              <h1 className="font-extrabold text-[#06264A] text-lg sm:text-xl tracking-tight leading-none">
                {UNIVERSITY_INFO.name}
              </h1>
              <p className="text-xs font-semibold text-slate-500 mt-1">
                {UNIVERSITY_INFO.location}
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-slate-600">
            <a href="#hero" className="hover:text-[#06264A] transition-colors">Home</a>
            <a href="#features" className="hover:text-[#06264A] transition-colors">Features</a>
            <a href="#about" className="hover:text-[#06264A] transition-colors">About CVRGU</a>
            <a href="#security" className="hover:text-[#06264A] transition-colors">Proctoring</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#06264A] hover:bg-slate-100 transition-all"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#06264A] hover:bg-[#0A3B72] text-white shadow-sm hover:shadow-md transition-all flex items-center gap-1.5"
            >
              <span>Register</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero" className="relative overflow-hidden bg-linear-to-b from-[#06264A] via-[#041E3B] to-[#031A33] text-white py-20 lg:py-28">
        {/* Subtle geometric pattern overlay */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#F5A623_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-medium text-[#F5A623] backdrop-blur-xs">
                <Sparkles className="w-4 h-4" />
                <span>Secure • Simple • Smart • Built for CVRGU Students</span>
              </div>

              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                Online Examination <span className="text-[#F5A623]">System</span>
              </h2>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                A secure digital examination platform for students of <strong>C. V. Raman Global University</strong>. 
                Experience distraction-free testing, transparent timer synchronizations, automatic evaluation, and in-depth performance analytics.
              </p>

              {/* Email restriction callout in Hero */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 max-w-xl text-left mx-auto lg:mx-0 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-[#F5A623] shrink-0" />
                <p className="text-xs text-slate-200">
                  Authentication is strictly restricted to official <strong>@cgu-odisha.ac.in</strong> student and faculty accounts.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
                <Link
                  to="/login"
                  className="px-8 py-4 rounded-xl bg-[#F5A623] hover:bg-[#d98f18] text-[#031A33] font-bold text-sm tracking-wide shadow-lg hover:shadow-xl active:scale-98 transition-all flex items-center gap-2"
                >
                  <span>Candidate Login</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/register"
                  className="px-8 py-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-sm tracking-wide transition-all flex items-center gap-2"
                >
                  <span>Student Registration</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Key Quick Stats */}
              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/10 max-w-lg mx-auto lg:mx-0">
                <div>
                  <span className="text-2xl font-black text-white">100%</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">Automated Evaluation</p>
                </div>
                <div>
                  <span className="text-2xl font-black text-[#F5A623]">3-Strike</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">Proctor Protection</p>
                </div>
                <div>
                  <span className="text-2xl font-black text-emerald-400">Zero</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">Hardware Clutter</p>
                </div>
              </div>
            </div>

            {/* University Portal Graphic / Preview Mockup */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border-4 border-white/10 text-slate-800 space-y-4 transform hover:-translate-y-1 transition-transform">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">portal.cgu-odisha.ac.in</span>
                </div>

                <div className="bg-[#06264A] text-white p-4 rounded-2xl">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-[#F5A623]">Active Assessment</span>
                    <span className="font-mono bg-white/20 px-2 py-0.5 rounded text-[11px]">59:42 remaining</span>
                  </div>
                  <h4 className="font-bold text-base mt-2">Data Structures (CS301)</h4>
                  <p className="text-xs text-slate-300 mt-0.5">Mid-Semester Exam • 20 Questions</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-slate-600">Proctoring Security State</span>
                    <span className="text-emerald-600 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Secured
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full w-4/5 rounded-full"></div>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Fullscreen verified • Window visibility locked • No tab violations
                  </p>
                </div>

                <div className="pt-2">
                  <Link
                    to="/login"
                    className="w-full py-3 rounded-xl bg-[#06264A] text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#0A3B72] transition-colors"
                  >
                    <span>Try University Demo Portal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4 Feature Cards Section */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#06264A] bg-[#06264A]/10 px-3 py-1 rounded-full">
            Key System Highlights
          </span>
          <h3 className="text-3xl font-extrabold text-[#06264A]">
            Engineered for Academic Integrity & Speed
          </h3>
          <p className="text-slate-600 text-sm">
            Everything students and examiners require for seamless, standardized semester evaluations at CVRGU.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Feature 1 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-academic transition-all flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#06264A] flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-[#06264A]" />
            </div>
            <h4 className="font-bold text-base text-[#06264A] mb-2">
              Secure Examination
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed flex-1">
              Official university email authentication (<code className="text-[11px] font-mono text-[#06264A]">@cgu-odisha.ac.in</code>) ensures verified student identity and prevents unauthorized exam access.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs font-semibold text-[#06264A]">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Domain Enforced</span>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-academic transition-all flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#F5A623] flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-[#F5A623]" />
            </div>
            <h4 className="font-bold text-base text-[#06264A] mb-2">
              Online Examination
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed flex-1">
              Take examinations from accredited campus labs or remote study spaces with responsive layout, synchronized countdown timers, and full-screen focus.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs font-semibold text-[#06264A]">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Universal Access</span>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-academic transition-all flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-emerald-600" />
            </div>
            <h4 className="font-bold text-base text-[#06264A] mb-2">
              Automatic Evaluation
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed flex-1">
              Instantaneous score computation upon test submission. Receive clear Pass/Fail summaries, marks distribution, and comprehensive answer explanations.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs font-semibold text-[#06264A]">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Instant Grading</span>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-academic transition-all flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="font-bold text-base text-[#06264A] mb-2">
              Result Analytics
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed flex-1">
              Historical performance tracking with downloadable grade cards, percentage breakdowns, and subject-wise academic progression analytics.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs font-semibold text-[#06264A]">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Performance Ledger</span>
            </div>
          </div>

        </div>
      </section>

      {/* Security & Proctoring Details */}
      <section id="security" className="bg-white py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-100">
                Transparent Anti-Cheat Protocol
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-[#06264A]">
                State-of-the-Art Browser Violation Monitoring
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Rather than making impossible claims of total OS locking, the CVRGU system implements intelligent client-side telemetry:
              </p>

              <div className="space-y-3 pt-2 text-xs text-slate-700">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-[#F5F7FA] border border-slate-200">
                  <div className="w-6 h-6 rounded-md bg-[#06264A] text-white flex items-center justify-center shrink-0 font-bold">1</div>
                  <div>
                    <strong className="text-slate-900 block font-semibold">Tab-Switch & Minimization Detection</strong>
                    Monitors <code className="font-mono bg-white px-1 rounded">document.visibilityState</code> and triggers when the candidate switches browser tabs.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-[#F5F7FA] border border-slate-200">
                  <div className="w-6 h-6 rounded-md bg-[#06264A] text-white flex items-center justify-center shrink-0 font-bold">2</div>
                  <div>
                    <strong className="text-slate-900 block font-semibold">Window Focus Loss De-duplication</strong>
                    Listens to window blur and focus events while preventing duplicate penalties when visibilitychange also fires.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-[#F5F7FA] border border-slate-200">
                  <div className="w-6 h-6 rounded-md bg-red-600 text-white flex items-center justify-center shrink-0 font-bold">3</div>
                  <div>
                    <strong className="text-slate-900 block font-semibold">Automatic 3-Strike Submission</strong>
                    Warning modals guide candidates back on Strikes 1 and 2. On Strike 3, the exam submits automatically and records the breach in the university ledger.
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#031A33] rounded-3xl p-8 text-white space-y-6 shadow-xl">
              <h4 className="text-lg font-bold text-[#F5A623]">
                Official CVRGU Honor Code
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                By entering the examination hall, candidates solemnly declare that they will abide by the University Examination Rules and Regulations, refrain from unfair means, and honor the legacy of Nobel Laureate Sir C. V. Raman.
              </p>
              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">Office of the Controller of Examinations</p>
                  <p className="text-[11px] text-slate-400">Bidyanagar, Mahura, Janla, Bhubaneswar, Odisha</p>
                </div>
                <Award className="w-8 h-8 text-[#F5A623]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-[#031A33] text-slate-400 text-xs py-10 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div>
              <p className="text-sm font-bold text-white">{UNIVERSITY_INFO.name}</p>
              <p className="text-[11px] text-slate-400">{UNIVERSITY_INFO.location}, PIN-{UNIVERSITY_INFO.pin}</p>
            </div>
            <div className="flex items-center gap-6">
              <Link to="/login" className="hover:text-white transition-colors">Portal Login</Link>
              <Link to="/register" className="hover:text-white transition-colors">Candidate Registration</Link>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 text-center">
            © {new Date().getFullYear()} C. V. Raman Global University (CVRGU). All rights reserved. 
            Authorized domain restricted to <span className="text-slate-300 font-mono">@cgu-odisha.ac.in</span>.
          </p>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
