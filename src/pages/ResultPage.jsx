import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { resultService } from '../services/resultService';
import { retestService } from '../services/retestService';
import { RetestRequestModal } from '../components/RetestRequestModal';
import { UNIVERSITY_INFO } from '../utils/constants';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Download,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  GraduationCap,
  Layers,
  RotateCcw,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';

export const ResultPage = () => {
  const { resultId } = useParams();
  const { user } = useAuth();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAnswerReview, setShowAnswerReview] = useState(false);
  const [reviewFilter, setReviewFilter] = useState('all'); // all, correct, wrong, unattempted
  const [isRetestModalOpen, setIsRetestModalOpen] = useState(false);
  const [retestEligibility, setRetestEligibility] = useState(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const data = await resultService.getResultById(resultId);
        setResult(data);

        // Fetch retest status for this exam
        if (user && data.examId) {
          try {
            const elig = await retestService.checkRetestEligibility(user.id, user.email, data.examId);
            setRetestEligibility(elig);
          } catch (e) {
            console.error('Retest eligibility lookup error:', e);
          }
        }

        // Trigger confetti celebration if candidate passed!
        if (data.status === 'PASS') {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
      } catch (err) {
        console.error('Failed to load result:', err);
        setError('Unable to load evaluation report. Result may not exist.');
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [resultId, user]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#06264A] border-t-[#F5A623] rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-semibold text-slate-500">Generating examination grade report...</p>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white p-8 rounded-3xl border border-red-200 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">Result Not Found</h2>
        <p className="text-xs text-slate-600">{error || 'No record exists for this evaluation.'}</p>
        <Link
          to="/student/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#06264A] text-white text-xs font-bold"
        >
          <span>Return to Dashboard</span>
        </Link>
      </div>
    );
  }

  const isPass = result.status === 'PASS';
  const filteredReview = (result.questionReview || []).filter((item) => {
    if (reviewFilter === 'correct') return item.isCorrect;
    if (reviewFilter === 'wrong') return item.isAttempted && !item.isCorrect;
    if (reviewFilter === 'unattempted') return !item.isAttempted;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      
      {/* Auto-submission alert banner if triggered by security */}
      {result.autoSubmitted && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-300 text-red-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-0.5">
            <p className="font-bold text-red-950">Examination Automatically Submitted</p>
            <p>
              Your session was concluded automatically due to: <strong>{result.violations >= 3 ? 'Security violation limit (3 strikes) exceeded' : 'Exam duration elapsed'}</strong>. All answers saved up to the moment of cutoff have been evaluated below.
            </p>
          </div>
        </div>
      )}

      {/* Main Official University Result Certificate Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-academic overflow-hidden print:border-none print:shadow-none">
        
        {/* Top Header */}
        <div className={`p-8 text-white ${isPass ? 'bg-linear-to-br from-[#06264A] to-[#0A3B72]' : 'bg-linear-to-br from-[#4A0E17] to-[#7F1D1D]'}`}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-[#F5A623]">
                <GraduationCap className="w-4 h-4" />
                <span>{UNIVERSITY_INFO.name}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
                {isPass ? '🎉 Examination Completed' : 'Examination Concluded'}
              </h1>
              <p className="text-xs text-slate-300 mt-0.5">
                Official Statement of Marks • {result.examTitle} ({result.examCode})
              </p>
            </div>

            {/* Pass/Fail Seal & Attempt Badge */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-white/10 border border-white/20 text-slate-200">
                {result.attemptNumber > 1 || result.isRetest ? `Retest • Attempt ${result.attemptNumber || 2}` : 'Attempt 1'}
              </div>
              <div className={`px-6 py-2 rounded-2xl font-black text-sm tracking-widest uppercase border shadow-inner ${
                isPass ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400' : 'bg-red-500/20 text-red-300 border-red-400'
              }`}>
                {result.status}
              </div>
            </div>
          </div>

          {/* Candidate Bio Snippet */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-6 pt-6 border-t border-white/10 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px] uppercase">Candidate</span>
              <span className="font-bold text-white block mt-0.5">{result.studentName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] uppercase">Roll Number</span>
              <span className="font-bold text-white block mt-0.5">{result.rollNumber}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] uppercase">Attempt Ref</span>
              <span className="font-bold text-[#F5A623] block mt-0.5">
                {result.attemptNumber > 1 || result.isRetest ? `Attempt ${result.attemptNumber || 2} (Retest)` : 'Attempt 1 (Regular)'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] uppercase">Department</span>
              <span className="font-bold text-white block mt-0.5 truncate">{result.department}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] uppercase">Evaluation Date</span>
              <span className="font-bold text-white block mt-0.5">
                {new Date(result.submittedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Primary Scoreboard (Section 22 requirement) */}
        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Score Earned</span>
              <div className="text-3xl sm:text-4xl font-black text-[#06264A] mt-2">
                {result.score} <span className="text-lg text-slate-400 font-semibold">/ {result.totalMarks}</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Passing requirement: {result.passingMarks || 8} marks</p>
            </div>

            <div className="p-6 rounded-2xl bg-blue-50/50 border border-blue-200">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-800">Percentage</span>
              <div className="text-3xl sm:text-4xl font-black text-blue-900 mt-2">
                {result.percentage}%
              </div>
              <p className="text-[11px] text-blue-600 mt-1">Calculated across all evaluated questions</p>
            </div>

            <div className={`p-6 rounded-2xl border ${isPass ? 'bg-emerald-50/50 border-emerald-200' : 'bg-red-50/50 border-red-200'}`}>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Academic Status</span>
              <div className={`text-3xl sm:text-4xl font-black mt-2 ${isPass ? 'text-emerald-700' : 'text-red-700'}`}>
                {result.status}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">{isPass ? 'Grade cleared successfully' : 'Requires improvement / back paper'}</p>
            </div>

          </div>

          {/* Breakdown Statistics Grid (Section 22 requirement) */}
          <div className="border-t border-slate-100 pt-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
              Response Performance Breakdown
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 block uppercase">Total Questions</span>
                <span className="text-xl font-bold text-slate-800 mt-1 block">{result.totalQuestions}</span>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                <span className="text-[11px] text-blue-700 block uppercase">Attempted</span>
                <span className="text-xl font-bold text-blue-800 mt-1 block">{result.attempted}</span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-[11px] text-emerald-700 block uppercase">Correct</span>
                <span className="text-xl font-bold text-emerald-800 mt-1 block">{result.correct}</span>
              </div>
              <div className="p-3 bg-red-50 rounded-xl border border-red-200">
                <span className="text-[11px] text-red-700 block uppercase">Wrong</span>
                <span className="text-xl font-bold text-red-800 mt-1 block">{result.wrong}</span>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                <span className="text-[11px] text-amber-700 block uppercase">Unattempted</span>
                <span className="text-xl font-bold text-amber-800 mt-1 block">{result.unattempted}</span>
              </div>
            </div>
          </div>

          {/* Section-Wise Marks Breakdown Table */}
          {result.sectionScores && Object.keys(result.sectionScores).length > 0 && (
            <div className="border-t border-slate-100 pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#06264A]" />
                    <span>Section-Wise Performance Breakdown</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Scores achieved in each sequentially locked examination section
                  </p>
                </div>
                <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                  {Object.keys(result.sectionScores).length} Sections Evaluated
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.values(result.sectionScores).map((sec, idx) => (
                  <div
                    key={sec.id || idx}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#06264A] bg-blue-100/80 px-2 py-0.5 rounded">
                          Section {String.fromCharCode(65 + idx)}
                        </span>
                        <h4 className="font-bold text-slate-800 text-xs mt-1">
                          {sec.title}
                        </h4>
                      </div>
                      <span className={`text-xs font-black px-2.5 py-1 rounded-lg ${
                        sec.percentage >= 40
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {sec.percentage}%
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
                        <span>Marks Earned</span>
                        <span className="font-bold text-slate-800">{sec.score} / {sec.totalMarks} Marks</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${sec.percentage >= 40 ? 'bg-emerald-500' : 'bg-red-500'}`}
                          style={{ width: `${Math.min(100, sec.percentage)}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                      <span>Attempted: {sec.attempted} / {sec.totalQuestions} Questions</span>
                      <span className={sec.percentage >= 40 ? 'text-emerald-700 font-bold' : 'text-red-700 font-bold'}>
                        {sec.percentage >= 40 ? 'Cleared' : 'Needs Improvement'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Retest Authority Status / Petition Box */}
          <div className="border-t border-slate-100 pt-6">
            {retestEligibility?.isRetestAuthorized ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-emerald-950 text-xs">Retest Authorized by COE</h4>
                    <p className="text-[11px] text-emerald-800 mt-0.5">
                      Authorization Ref: <strong>{retestEligibility.approvedRetest?.refCode}</strong>. You are permitted to undertake Attempt {retestEligibility.nextAttemptNumber}.
                    </p>
                  </div>
                </div>
                <Link
                  to={`/student/exam/${result.examId}/instructions`}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm inline-flex items-center gap-1.5 shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Start Authorized Retest</span>
                </Link>
              </div>
            ) : retestEligibility?.pendingRetest ? (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <h4 className="font-bold text-amber-950">Retest Petition Under COE Review</h4>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Petition Ref: <strong>{retestEligibility.pendingRetest.refCode}</strong>. Your petition has been forwarded to the Office of the Controller of Examinations.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-slate-500" />
                    <span>Technical Disruption or Retest Required?</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Under university guidelines, retests are authority-controlled and require formal petition to the Controller of Examinations.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRetestModalOpen(true)}
                  className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 font-bold text-xs text-slate-700 shrink-0 flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Petition for Retest</span>
                </button>
              </div>
            )}
          </div>

          {/* Action CTAs: View Answers, Dashboard, Download */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-slate-100 print:hidden">
            <button
              onClick={() => setShowAnswerReview(!showAnswerReview)}
              className="px-5 py-3 rounded-xl border-2 border-[#06264A] text-[#06264A] font-bold text-xs hover:bg-[#06264A] hover:text-white transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>{showAnswerReview ? 'Hide Detailed Answers' : 'View Question Review & Answers'}</span>
              {showAnswerReview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={handlePrint}
                className="px-5 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Print Official Card</span>
              </button>

              <Link
                to="/student/dashboard"
                className="px-6 py-3 rounded-xl bg-[#06264A] hover:bg-[#0A3B72] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
              >
                <span>Back to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* Question By Question Detailed Answer Review (Section 22 requirement) */}
      {showAnswerReview && result.questionReview && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-[#06264A]">Question-by-Question Review</h2>
              <p className="text-xs text-slate-500">Examine correct options and academic rationale</p>
            </div>

            {/* Filter tags */}
            <div className="flex items-center gap-2 text-xs">
              {['all', 'correct', 'wrong', 'unattempted'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setReviewFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition-all ${
                    reviewFilter === filter
                      ? 'bg-[#06264A] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {filteredReview.map((q, idx) => {
              const optionLetters = ['A', 'B', 'C', 'D'];
              return (
                <div
                  key={q.questionId || idx}
                  className={`p-5 rounded-2xl border-2 space-y-3 ${
                    q.isCorrect
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : q.isAttempted
                      ? 'border-red-200 bg-red-50/20'
                      : 'border-slate-200 bg-slate-50/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Question {q.questionNumber || (idx + 1)}
                    </span>
                    {q.isCorrect ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        <Check className="w-3.5 h-3.5" /> Correct (+{q.marks})
                      </span>
                    ) : q.isAttempted ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                        <X className="w-3.5 h-3.5" /> Incorrect (0)
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                        Unattempted (0)
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                    {q.questionText}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {q.options.map((opt, optIndex) => {
                      const isCorrectAnswer = optIndex === q.correctAnswer;
                      const isStudentSelected = optIndex === q.studentAnswer;

                      let optStyle = 'border-slate-200 text-slate-600 bg-white';
                      if (isCorrectAnswer) {
                        optStyle = 'border-emerald-500 bg-emerald-100/60 font-bold text-emerald-950 ring-1 ring-emerald-400';
                      } else if (isStudentSelected && !isCorrectAnswer) {
                        optStyle = 'border-red-500 bg-red-100/60 font-bold text-red-950 ring-1 ring-red-400';
                      }

                      return (
                        <div key={optIndex} className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 ${optStyle}`}>
                          <span className="w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] bg-white/80 border">
                            {optionLetters[optIndex]}
                          </span>
                          <span className="flex-1">{opt}</span>
                          {isCorrectAnswer && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                          {isStudentSelected && !isCorrectAnswer && <XCircle className="w-4 h-4 text-red-600 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>

                  {q.explanation && (
                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-600">
                      <strong className="text-slate-800">Faculty Explanation: </strong>
                      {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Retest Petition Modal */}
      <RetestRequestModal
        isOpen={isRetestModalOpen}
        exam={{
          id: result.examId,
          title: result.examTitle,
          code: result.examCode
        }}
        user={user}
        onClose={() => setIsRetestModalOpen(false)}
        onSuccess={async () => {
          if (user && result.examId) {
            try {
              const elig = await retestService.checkRetestEligibility(user.id, user.email, result.examId);
              setRetestEligibility(elig);
            } catch (err) {
              console.error(err);
            }
          }
        }}
      />

    </div>
  );
};

export default ResultPage;
