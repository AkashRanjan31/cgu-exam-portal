import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { examService } from '../services/examService';
import { useExam } from '../context/ExamContext';
import { EXAM_RULES, UNIVERSITY_INFO } from '../utils/constants';
import {
  ShieldAlert,
  ArrowRight,
  Maximize2,
  AlertTriangle,
  ArrowLeft,
  Lock,
  Layers,
  Timer
} from 'lucide-react';

export const ExamInstructions = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { startExam } = useExam();

  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const data = await examService.getExamById(examId);
        setExam(data);
      } catch (err) {
        console.error('Failed to fetch exam:', err);
        setError('Unable to load examination details. Please verify the exam ID.');
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [examId]);

  const handleStartExam = async () => {
    if (!agreed || !exam || starting) return;
    setStarting(true);
    try {
      // Pass retest metadata if present in location state
      const retestOptions = location.state?.retestOptions || {};
      await startExam(exam, retestOptions);
      navigate(`/student/exam/${exam.id}`, { replace: true });
    } catch (err) {
      alert(`Could not start exam: ${err.message}`);
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-[#06264A] border-t-[#F5A623] rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-semibold text-slate-500">Preparing examination instructions...</p>
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="max-w-lg mx-auto mt-12 bg-white p-8 rounded-3xl border border-red-200 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">Examination Error</h2>
        <p className="text-xs text-slate-600">{error || 'Exam not found.'}</p>
        <Link
          to="/student/my-exams"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#06264A] text-white text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Examinations</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      
      {/* Top Breadcrumb & Title */}
      <div className="flex items-center justify-between">
        <Link
          to="/student/my-exams"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#06264A] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Exam Roster</span>
        </Link>
        <span className="text-[11px] font-mono text-slate-400">
          Exam Session Ref: CVRGU-{exam.code || 'EXAM'}
        </span>
      </div>

      {/* Main Instructions Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-academic overflow-hidden">
        
        {/* Academic Header Banner */}
        <div className="bg-[#06264A] text-white p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#F5A623]">
                {exam.code} • {exam.subject}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {exam.title}
              </h1>
              <p className="text-xs text-slate-300">
                {UNIVERSITY_INFO.name}, Bhubaneswar
              </p>
            </div>

            {/* Hardware / Environment Recommended Banner (Section 35 requirement) */}
            <div className="bg-white/10 border border-white/15 px-4 py-2.5 rounded-2xl backdrop-blur-xs text-xs">
              <span className="text-[10px] text-slate-300 block uppercase tracking-wider">Device Advisory</span>
              <span className="text-white font-semibold flex items-center gap-1.5 mt-0.5">
                <Maximize2 className="w-3.5 h-3.5 text-[#F5A623]" /> Desktop / Laptop Recommended
              </span>
            </div>
          </div>

          {/* Examination Details Row (Section 11 requirement) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10 text-center">
            <div className="bg-white/5 rounded-xl p-3">
              <span className="text-[11px] text-slate-400 block uppercase">Duration</span>
              <span className="text-base sm:text-lg font-bold text-white mt-0.5 block">{exam.durationMinutes} Minutes</span>
            </div>
            <div className="bg-white/5 rounded-xl p-3">
              <span className="text-[11px] text-slate-400 block uppercase">Total Questions</span>
              <span className="text-base sm:text-lg font-bold text-white mt-0.5 block">{exam.totalQuestions} Questions</span>
            </div>
            <div className="bg-white/5 rounded-xl p-3">
              <span className="text-[11px] text-slate-400 block uppercase">Total Marks</span>
              <span className="text-base sm:text-lg font-bold text-white mt-0.5 block">{exam.totalMarks} Marks</span>
            </div>
            <div className="bg-white/5 rounded-xl p-3">
              <span className="text-[11px] text-slate-400 block uppercase">Passing Cutoff</span>
              <span className="text-base sm:text-lg font-bold text-[#F5A623] mt-0.5 block">{exam.passingMarks} Marks</span>
            </div>
          </div>
        </div>

        {/* 10 Detailed Examination Rules */}
        <div className="p-6 sm:p-8 space-y-6">

          {/* Section-Wise Examination Architecture & Locking Protocol */}
          {exam.sections && exam.sections.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-[#06264A] flex items-center gap-2">
                    <Layers className="w-5 h-5 text-[#06264A]" />
                    <span>Section-Wise Structure & Sequential Locking</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    This examination consists of {exam.sections.length} sequential, independently timed sections.
                  </p>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold">
                  <Lock className="w-3.5 h-3.5" /> Irreversible Locking Active
                </span>
              </div>

              {/* Sections Breakdown Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {exam.sections.map((sec, idx) => (
                  <div
                    key={sec.id || idx}
                    className="p-4 rounded-2xl border-2 border-slate-200 bg-white hover:border-[#06264A] transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#06264A] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          Section {String.fromCharCode(65 + idx)} • Step {idx + 1} of {exam.sections.length}
                        </span>
                        <h3 className="font-bold text-slate-800 text-sm mt-1.5 leading-snug">
                          {sec.title}
                        </h3>
                      </div>
                      <span className="shrink-0 text-slate-400">
                        {idx === 0 ? (
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            First Section
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Lock className="w-3 h-3 text-slate-500" /> Locked initially
                          </span>
                        )}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-2">
                      {sec.description || 'Assesses syllabus competence for this module.'}
                    </p>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center text-xs">
                      <div className="bg-slate-50 rounded-lg p-2">
                        <span className="text-[10px] text-slate-400 block uppercase">Timer</span>
                        <span className="font-bold text-[#06264A] mt-0.5 block flex items-center justify-center gap-1">
                          <Timer className="w-3 h-3 text-slate-500" /> {sec.durationMinutes}m
                        </span>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-2">
                        <span className="text-[10px] text-slate-400 block uppercase">Questions</span>
                        <span className="font-bold text-slate-800 mt-0.5 block">{sec.totalQuestions} Qs</span>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-2">
                        <span className="text-[10px] text-slate-400 block uppercase">Marks</span>
                        <span className="font-bold text-[#F5A623] mt-0.5 block">{sec.totalMarks} Marks</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Critical Section Locking Warnings */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-[#F5A623]">
                  <Lock className="w-4 h-4" />
                  <span>Critical Section-Locking Rules</span>
                </div>
                <ul className="space-y-1 text-slate-300 text-[11px] list-disc list-inside">
                  <li><strong>Independent Section Clocks:</strong> Each section has its own timer. When the section timer expires, the section locks automatically, saving all answers.</li>
                  <li><strong>Permanent & Irreversible Lock:</strong> Once you manually proceed to the next section or the time runs out, the current section is permanently locked. You cannot revisit or change answers.</li>
                  <li><strong>Strict Sequential Order:</strong> Future sections cannot be previewed or attempted out of order. Section B unlocks only after Section A is locked.</li>
                </ul>
              </div>
            </div>
          )}

          <div className="pt-2">
            <h2 className="text-base font-bold text-[#06264A] flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              <span>Mandatory Candidate Instructions & Proctoring Rules</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Please read every clause carefully. Violations will be tracked automatically by the CVRGU integrity engine.
            </p>
          </div>

          <div className="space-y-3 bg-[#F5F7FA] p-5 rounded-2xl border border-slate-200">
            {EXAM_RULES.map((rule, idx) => (
              <div key={idx} className="flex items-start gap-3 text-xs text-slate-700">
                <span className="w-5 h-5 rounded-md bg-[#06264A] text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">
                  {rule}
                </span>
              </div>
            ))}
          </div>

          {/* Security Summary Box */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-300 text-xs text-amber-900 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-amber-950">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Security Strike Enforcement</span>
            </div>
            <p className="leading-relaxed">
              When entering the exam, your browser will switch to <strong>fullscreen mode</strong>. Tab switching, window minimization, or losing application focus will log strikes. 
              <strong> 3 violations will trigger immediate automatic submission</strong>.
            </p>
          </div>

          {/* Mandatory Checkbox Agreement (Section 11 requirement) */}
          <div className="pt-2">
            <label className="flex items-start gap-3 p-4 rounded-2xl border-2 border-slate-200 hover:border-[#06264A] cursor-pointer select-none transition-colors bg-white">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-5 h-5 rounded text-[#06264A] focus:ring-[#06264A] mt-0.5 shrink-0"
              />
              <div className="text-xs text-slate-800">
                <span className="font-bold block text-sm text-[#06264A]">
                  I have read and understood all examination instructions.
                </span>
                <span className="text-slate-500 text-[11px] block mt-0.5">
                  I confirm that I am logged in with my official CVRGU email account and agree to the 3-strike proctoring rules.
                </span>
              </div>
            </label>
          </div>

          {/* Start Button */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
            <Link
              to="/student/my-exams"
              className="text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Cancel & Return Later
            </Link>

            <button
              type="button"
              onClick={handleStartExam}
              disabled={!agreed || starting}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 ${
                agreed && !starting
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-lg active:scale-98 cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {starting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Launching Exam Hall...</span>
                </>
              ) : (
                <>
                  <span>Start Examination</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};

export default ExamInstructions;
