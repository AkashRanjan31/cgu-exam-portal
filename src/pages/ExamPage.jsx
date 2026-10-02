import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExam } from '../context/ExamContext';
import { useExamSecurity } from '../hooks/useExamSecurity';
import QuestionCard from '../components/QuestionCard';
import QuestionNavigator from '../components/QuestionNavigator';
import SecurityIndicator from '../components/SecurityIndicator';
import SecurityWarningModal from '../components/SecurityWarningModal';
import SubmitModal from '../components/SubmitModal';
import SectionStatusBar from '../components/SectionStatusBar';
import { UNIVERSITY_INFO } from '../utils/constants';
import {
  GraduationCap,
  Send,
  Monitor,
  Lock
} from 'lucide-react';

export const ExamPage = () => {
  const { examId } = useParams();
  const navigate = useNavigate();

  const {
    currentExam,
    questions,
    sections,
    activeSectionIndex,
    activeSection,
    activeSectionQuestions,
    lockedSectionIds,
    isCurrentSectionLocked,
    isLastSection,
    lockAndProceedToNextSection,
    sectionNotice,
    clearSectionNotice,
    sectionRemainingTime,
    currentQuestionIndex,
    currentQuestion,
    answers,
    markedForReview,
    examStatus,
    attemptMetadata,
    selectAnswer,
    clearAnswer,
    toggleMarkForReview,
    nextQuestion,
    prevQuestion,
    goToQuestion,
    submitExam,
    isSubmitting
  } = useExam();

  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isLockSectionModalOpen, setIsLockSectionModalOpen] = useState(false);

  // Security Proctoring Hook
  const {
    violations,
    maxViolations,
    warningModalOpen,
    lastViolationReason,
    acknowledgeWarning
  } = useExamSecurity({
    isExamActive: examStatus === 'in-progress',
    examId: currentExam?.id || examId,
    sectionId: activeSection?.id,
    studentId: attemptMetadata?.studentId,
    onAutoSubmit: async (reason) => {
      try {
        const res = await submitExam(reason, violations);
        if (res?.id) navigate(`/student/results/${res.id}`, { replace: true });
      } catch (err) {
        // Auto-submit failed — show error but don't crash
        console.error('Auto-submission error:', err);
      }
    },
    maxViolations: 3
  });

  // Redirect only if exam is definitively not in progress AND no exam is loaded.
  useEffect(() => {
    if (examStatus === 'idle' && !currentExam) {
      navigate('/student/my-exams', { replace: true });
    }
  }, [examStatus, currentExam, navigate]);

  // After submission, navigate to result page
  useEffect(() => {
    if (examStatus === 'submitted' && result?.id) {
      navigate(`/student/results/${result.id}`, { replace: true });
    }
  }, [examStatus, result, navigate]);

  // Handle manual submit confirmation
  const handleConfirmSubmit = async () => {
    try {
      const res = await submitExam('Candidate manual submission', violations);
      setIsSubmitModalOpen(false);
      if (res?.id) navigate(`/student/results/${res.id}`, { replace: true });
    } catch (err) {
      alert(`Submission error: ${err.message}`);
    }
  };

  const handleConfirmLockSection = () => {
    setIsLockSectionModalOpen(false);
    lockAndProceedToNextSection();
  };

  if (!currentExam || questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F7FA]">
        <div className="w-10 h-10 border-4 border-[#06264A] border-t-[#F5A623] rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-semibold text-slate-500">Synchronizing examination hall...</p>
      </div>
    );
  }

  // Count attempted across entire exam
  const attemptedTotal = Object.keys(answers).length;
  const unattemptedTotal = questions.length - attemptedTotal;

  // Count attempted within active section
  const sectionQuestionsCount = activeSectionQuestions.length;
  const sectionAttemptedCount = activeSectionQuestions.filter((q) => answers[q.id] !== undefined).length;
  const sectionUnattemptedCount = sectionQuestionsCount - sectionAttemptedCount;

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col select-none exam-fullscreen">
      
      {/* Distraction-Free Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          
          {/* Left: Exam Info & University Emblem */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#06264A] text-white flex items-center justify-center font-bold shadow-xs">
              <GraduationCap className="w-5 h-5 text-[#F5A623]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-[#06264A] text-sm sm:text-base leading-none">
                  {currentExam.title}
                </h1>
                <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                  {currentExam.code || 'EXAM'}
                </span>
                {attemptMetadata.isRetest && (
                  <span className="text-[10px] bg-purple-100 text-purple-900 border border-purple-200 font-bold px-1.5 py-0.5 rounded">
                    Retest Attempt {attemptMetadata.attemptNumber}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 hidden sm:block">
                {UNIVERSITY_INFO.shortName} • {currentExam.subject}
              </p>
            </div>
          </div>

          {/* Center: Proctoring Status & Strikes Indicator */}
          <div className="flex items-center gap-3">
            <SecurityIndicator violations={violations} maxViolations={maxViolations} />
          </div>

          {/* Right: Submit Button */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSubmitModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Final Exam</span>
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Device Advisory */}
      <div className="lg:hidden bg-amber-50 border-b border-amber-200 px-4 py-2 text-[11px] text-amber-900 flex items-center justify-center gap-2">
        <Monitor className="w-4 h-4 text-amber-600 shrink-0" />
        <span>For the best examination experience, please use a desktop or laptop.</span>
      </div>

      {/* Main Examination Hall Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-4">
        
        {/* Section Pipeline & Independent Section Timer Bar */}
        <SectionStatusBar
          sections={sections}
          activeSectionIndex={activeSectionIndex}
          lockedSectionIds={lockedSectionIds}
          sectionRemainingTime={sectionRemainingTime}
          isLastSection={isLastSection}
          onLockAndProceed={() => setIsLockSectionModalOpen(true)}
          onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
        />

        {/* Question Area & Navigator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left: Question Navigator for Active Section */}
          <div className="lg:col-span-4 xl:col-span-3 h-full">
            <QuestionNavigator
              totalQuestions={activeSectionQuestions.length}
              currentIndex={currentQuestionIndex}
              answers={answers}
              markedForReview={markedForReview}
              questions={activeSectionQuestions}
              activeSection={activeSection}
              sections={sections}
              lockedSectionIds={lockedSectionIds}
              onSelectQuestion={goToQuestion}
            />
          </div>

          {/* Right: Active Question Card */}
          <div className="lg:col-span-8 xl:col-span-9 h-full flex flex-col">
            <QuestionCard
              question={currentQuestion}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={activeSectionQuestions.length}
              sectionTitle={activeSection?.title}
              selectedOption={answers[currentQuestion?.id]}
              isMarkedForReview={markedForReview.includes(currentQuestion?.id)}
              isLocked={isCurrentSectionLocked}
              onSelectOption={(optIndex) => selectAnswer(currentQuestion.id, optIndex)}
              onClearOption={() => clearAnswer(currentQuestion.id)}
              onToggleMark={() => toggleMarkForReview(currentQuestion.id)}
              onNext={nextQuestion}
              onPrev={prevQuestion}
              isFirst={currentQuestionIndex === 0}
              isLast={currentQuestionIndex === activeSectionQuestions.length - 1}
            />
          </div>

        </div>

      </main>

      {/* Security Warning Modal (Pop up on strike 1 or 2, auto-submit on strike 3) */}
      <SecurityWarningModal
        isOpen={warningModalOpen}
        violations={violations}
        maxViolations={maxViolations}
        reason={lastViolationReason}
        onAcknowledge={acknowledgeWarning}
      />

      {/* Section Transition Notice (when section timer expires or section finishes) */}
      {sectionNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 text-center space-y-4 border border-slate-200 shadow-2xl">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-[#06264A]">{sectionNotice.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{sectionNotice.message}</p>
            <button
              onClick={clearSectionNotice}
              className="w-full py-2.5 bg-[#06264A] text-white rounded-xl font-bold text-xs hover:bg-[#0A3B72]"
            >
              Acknowledge & Begin Section
            </button>
          </div>
        </div>
      )}

      {/* Section Lock Confirmation Modal (Section-locking guarantee) */}
      {isLockSectionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-[#06264A] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#F5A623]" />
                <h3 className="font-bold text-base">Lock & Advance Section?</h3>
              </div>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-900 space-y-1">
                <p className="font-bold">⚠️ Irreversible Action Warning</p>
                <p>
                  Once you lock <strong>{activeSection?.title}</strong>, it <strong>CANNOT be reopened</strong>. You will not be able to return to modify or review any questions in this section.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center py-1">
                <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 font-bold text-emerald-800">
                  Attempted: {sectionAttemptedCount} / {sectionQuestionsCount}
                </div>
                <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 font-bold text-amber-800">
                  Unattempted: {sectionUnattemptedCount}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsLockSectionModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-semibold hover:bg-slate-50"
                >
                  Return to Section
                </button>
                <button
                  type="button"
                  onClick={handleConfirmLockSection}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Lock Section & Proceed</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Final Submit Confirmation Modal */}
      <SubmitModal
        isOpen={isSubmitModalOpen}
        totalQuestions={questions.length}
        attempted={attemptedTotal}
        unattempted={unattemptedTotal}
        onCancel={() => setIsSubmitModalOpen(false)}
        onConfirm={handleConfirmSubmit}
        isSubmitting={isSubmitting}
      />

    </div>
  );
};

export default ExamPage;
