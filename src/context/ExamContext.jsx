import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { questionService } from '../services/questionService';
import { resultService } from '../services/resultService';
import { requestFullScreenMode, exitFullScreenMode } from '../utils/examSecurity';

const ExamContext = createContext(null);

/**
 * Restore an in-progress exam from localStorage.
 * Timer is recalculated from the server-issued endsAt timestamp so that
 * manipulating the system clock or sectionRemainingTime in localStorage
 * has no effect — the remaining time is always derived from endsAt.
 */
const getInitialExamState = () => {
  try {
    const saved = localStorage.getItem('cvrgu_active_exam');
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    if (parsed.examStatus !== 'in-progress') {
      localStorage.removeItem('cvrgu_active_exam');
      return null;
    }

    // Use server-issued endsAt if available; fall back to legacy timestamp calc
    let remaining;
    if (parsed.sectionEndsAt) {
      remaining = Math.max(0, Math.floor((parsed.sectionEndsAt - Date.now()) / 1000));
    } else {
      const elapsed = Math.floor((Date.now() - (parsed.sectionTimestamp || parsed.timestamp)) / 1000);
      remaining = Math.max(0, (parsed.sectionRemainingTime || 0) - elapsed);
    }

    if (remaining > 0) {
      return { ...parsed, sectionRemainingTime: remaining };
    }
    localStorage.removeItem('cvrgu_active_exam');
    return null;
  } catch {
    localStorage.removeItem('cvrgu_active_exam');
    return null;
  }
};

export const ExamProvider = ({ children }) => {
  const initial = getInitialExamState();

  const [currentExam, setCurrentExam] = useState(initial?.currentExam || null);
  const [questions, setQuestions] = useState(initial?.questions || []);
  const [activeSectionIndex, setActiveSectionIndex] = useState(initial?.activeSectionIndex || 0);
  const [lockedSectionIds, setLockedSectionIds] = useState(initial?.lockedSectionIds || []);
  const [sectionRemainingTime, setSectionRemainingTime] = useState(initial?.sectionRemainingTime || 0);
  // Server-issued absolute deadline for the active section (ms epoch)
  const [sectionEndsAt, setSectionEndsAt] = useState(initial?.sectionEndsAt || null);
  const [sectionNotice, setSectionNotice] = useState(null);
  const [attemptMetadata, setAttemptMetadata] = useState(initial?.attemptMetadata || {
    attemptNumber: 1, isRetest: false, retestRefCode: null
  });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(initial?.currentQuestionIndex || 0);
  const [answers, setAnswers] = useState(initial?.answers || {});
  const [markedForReview, setMarkedForReview] = useState(initial?.markedForReview || []);
  const [examStatus, setExamStatus] = useState(initial?.examStatus || 'idle');
  const [result, setResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionReason, setSubmissionReason] = useState(null);

  const sectionTimerRef = useRef(null);
  const handleExpiredRef = useRef(null);
  const submitExamRef = useRef(null);
  // Idempotency guard — prevents double submission
  const submittedRef = useRef(false);

  const sections = currentExam?.sections || [
    { id: 'sec-1', title: 'General Section', durationMinutes: currentExam?.durationMinutes || 60, totalQuestions: questions.length, totalMarks: currentExam?.totalMarks || 20 }
  ];
  const activeSection = sections[activeSectionIndex] || sections[0];
  // Only show questions belonging to the active section.
  // Questions without a sectionId fall into section 0 as a safe fallback.
  const activeSectionQuestions = questions.filter(q =>
    q.sectionId ? q.sectionId === activeSection?.id : activeSectionIndex === 0
  );
  const currentQuestion = activeSectionQuestions[currentQuestionIndex] || activeSectionQuestions[0] || null;

  // Persist state to localStorage on every relevant change
  useEffect(() => {
    if (examStatus === 'in-progress' && currentExam) {
      const stateToSave = {
        currentExam, questions, activeSectionIndex, lockedSectionIds,
        sectionRemainingTime, sectionEndsAt,
        sectionTimestamp: Date.now(),
        currentQuestionIndex, answers, markedForReview,
        attemptMetadata, examStatus
      };
      localStorage.setItem('cvrgu_active_exam', JSON.stringify(stateToSave));
    } else if (examStatus === 'submitted') {
      localStorage.removeItem('cvrgu_active_exam');
    }
  }, [examStatus, currentExam, questions, activeSectionIndex, lockedSectionIds,
    sectionRemainingTime, sectionEndsAt, currentQuestionIndex, answers,
    markedForReview, attemptMetadata]);

  const handleSectionTimerExpired = () => {
    if (activeSectionIndex < sections.length - 1) {
      const currentSecId = activeSection.id;
      const nextIndex = activeSectionIndex + 1;
      const nextSec = sections[nextIndex];
      const nextDuration = (nextSec.durationMinutes || 30) * 60;
      const nextEndsAt = Date.now() + nextDuration * 1000;

      setLockedSectionIds(prev => [...new Set([...prev, currentSecId])]);
      setActiveSectionIndex(nextIndex);
      setCurrentQuestionIndex(0);
      setSectionRemainingTime(nextDuration);
      setSectionEndsAt(nextEndsAt);
      setSectionNotice({
        title: 'Section Duration Concluded',
        message: `${activeSection.title} time has elapsed and is now permanently locked. You are now beginning ${nextSec.title}.`
      });
    } else {
      submitExamRef.current?.('Final section time duration completed');
    }
  };

  useEffect(() => { handleExpiredRef.current = handleSectionTimerExpired; });

  // Countdown timer — display only. Authority is sectionEndsAt (server-issued).
  useEffect(() => {
    if (examStatus !== 'in-progress') {
      clearInterval(sectionTimerRef.current);
      return;
    }
    sectionTimerRef.current = setInterval(() => {
      setSectionRemainingTime(prev => {
        // If we have a server endsAt, recalculate from it every tick
        // so clock drift and localStorage manipulation have no effect
        if (sectionEndsAt) {
          const serverRemaining = Math.max(0, Math.floor((sectionEndsAt - Date.now()) / 1000));
          if (serverRemaining <= 0) {
            clearInterval(sectionTimerRef.current);
            handleExpiredRef.current?.();
            return 0;
          }
          return serverRemaining;
        }
        // Fallback for dev mock (no sectionEndsAt)
        if (prev <= 1) {
          clearInterval(sectionTimerRef.current);
          handleExpiredRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(sectionTimerRef.current);
  }, [examStatus, activeSectionIndex, sectionEndsAt]);

  const startExam = async (exam, options = {}) => {
    try {
      const qList = await questionService.getQuestionsByExamId(exam.id);
      if (!qList || qList.length === 0) throw new Error('No questions available for this examination.');

      const examSections = exam.sections?.length > 0 ? exam.sections : [
        { id: 'sec-1', title: 'Section A: General Examination', durationMinutes: exam.durationMinutes || 60, totalQuestions: qList.length, totalMarks: exam.totalMarks || 20 }
      ];

      const initialDuration = (examSections[0].durationMinutes || 30) * 60;
      // In production the backend returns endsAt; in dev we calculate it locally
      const initialEndsAt = options.sectionEndsAt || (Date.now() + initialDuration * 1000);

      submittedRef.current = false;
      setCurrentExam({ ...exam, sections: examSections });
      setQuestions(qList);
      setActiveSectionIndex(0);
      setLockedSectionIds([]);
      setSectionRemainingTime(initialDuration);
      setSectionEndsAt(initialEndsAt);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setMarkedForReview([]);
      setResult(null);
      setSubmissionReason(null);
      setSectionNotice(null);
      setAttemptMetadata({
        attemptNumber: options.attemptNumber || 1,
        isRetest: Boolean(options.isRetest),
        retestRefCode: options.retestRefCode || null
      });
      setExamStatus('in-progress');
      await requestFullScreenMode();
      return true;
    } catch (err) {
      throw err;
    }
  };

  const lockAndProceedToNextSection = () => {
    if (activeSectionIndex >= sections.length - 1) return;
    const currentSecId = activeSection.id;
    const nextIndex = activeSectionIndex + 1;
    const nextSec = sections[nextIndex];
    const nextDuration = (nextSec.durationMinutes || 30) * 60;
    const nextEndsAt = Date.now() + nextDuration * 1000;

    setLockedSectionIds(prev => [...new Set([...prev, currentSecId])]);
    setActiveSectionIndex(nextIndex);
    setCurrentQuestionIndex(0);
    setSectionRemainingTime(nextDuration);
    setSectionEndsAt(nextEndsAt);
    setSectionNotice({
      title: 'Section Submitted & Locked',
      message: `${activeSection.title} has been locked. Answers can no longer be modified. Starting ${nextSec.title}.`
    });
  };

  const selectAnswer = (questionId, optionIndex) => {
    const targetQuestion = questions.find(q => q.id === questionId);
    if (targetQuestion && lockedSectionIds.includes(targetQuestion.sectionId)) return;
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const clearAnswer = (questionId) => {
    const targetQuestion = questions.find(q => q.id === questionId);
    if (targetQuestion && lockedSectionIds.includes(targetQuestion.sectionId)) return;
    setAnswers(prev => { const next = { ...prev }; delete next[questionId]; return next; });
  };

  const toggleMarkForReview = (questionId) => {
    setMarkedForReview(prev =>
      prev.includes(questionId) ? prev.filter(id => id !== questionId) : [...prev, questionId]
    );
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < activeSectionQuestions.length - 1)
      setCurrentQuestionIndex(prev => prev + 1);
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) setCurrentQuestionIndex(prev => prev - 1);
  };

  const goToQuestion = (index) => {
    if (index >= 0 && index < activeSectionQuestions.length) setCurrentQuestionIndex(index);
  };

  const submitExam = async (reason = 'Manual submission', violationsCount = 0) => {
    // Idempotency guard — prevent double submission
    if (isSubmitting || submittedRef.current) return;
    submittedRef.current = true;
    setIsSubmitting(true);
    setSubmissionReason(reason);

    try {
      await exitFullScreenMode();

      // Identity comes from localStorage safe user object (no password).
      // In production the backend derives identity from the JWT cookie —
      // the studentId/email in the payload is ignored server-side.
      const storedUser = localStorage.getItem('cvrgu_user');
      const user = storedUser ? JSON.parse(storedUser) : {};

      const submissionPayload = {
        examId: currentExam?.id,
        studentId: user.id || 's1',
        studentName: user.name || 'Candidate',
        studentEmail: user.email || '',
        rollNumber: user.rollNumber || '',
        department: user.department || '',
        answers,
        violations: violationsCount,
        autoSubmitted: reason !== 'Manual submission',
        submissionReason: reason,
        attemptNumber: attemptMetadata.attemptNumber,
        isRetest: attemptMetadata.isRetest,
        retestRefCode: attemptMetadata.retestRefCode
      };

      const evaluatedResult = await resultService.submitExamResult(submissionPayload);
      setResult(evaluatedResult);
      setExamStatus('submitted');
      localStorage.removeItem('cvrgu_active_exam');
      return evaluatedResult;
    } catch (err) {
      // Reset guard so user can retry on network failure
      submittedRef.current = false;
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => { submitExamRef.current = submitExam; });

  const resetExamState = () => {
    submittedRef.current = false;
    setCurrentExam(null);
    setQuestions([]);
    setActiveSectionIndex(0);
    setLockedSectionIds([]);
    setSectionRemainingTime(0);
    setSectionEndsAt(null);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setMarkedForReview([]);
    setExamStatus('idle');
    setResult(null);
    setSubmissionReason(null);
    setSectionNotice(null);
    localStorage.removeItem('cvrgu_active_exam');
  };

  const value = {
    currentExam, questions, sections, activeSectionIndex, activeSection,
    activeSectionQuestions, lockedSectionIds,
    isCurrentSectionLocked: lockedSectionIds.includes(activeSection?.id),
    isLastSection: activeSectionIndex === sections.length - 1,
    lockAndProceedToNextSection, sectionNotice,
    clearSectionNotice: () => setSectionNotice(null),
    sectionRemainingTime, sectionEndsAt,
    currentQuestionIndex, currentQuestion, answers, markedForReview,
    examStatus, result, attemptMetadata, isSubmitting, submissionReason,
    startExam, selectAnswer, clearAnswer, toggleMarkForReview,
    nextQuestion, prevQuestion, goToQuestion, submitExam, resetExamState
  };

  return <ExamContext.Provider value={value}>{children}</ExamContext.Provider>;
};

export const useExam = () => {
  const context = useContext(ExamContext);
  if (!context) throw new Error('useExam must be used within an ExamProvider');
  return context;
};
