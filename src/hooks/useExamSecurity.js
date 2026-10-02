import { useState, useEffect, useRef, useCallback } from 'react';
import { isFullScreenActive, requestFullScreenMode } from '../utils/examSecurity';

/**
 * useExamSecurity Hook
 * Manages tab-switch detection, window focus/blur, fullscreen enforcement,
 * de-duplicated security strikes, and automated exam submission.
 */
export const useExamSecurity = ({
  isExamActive = false,
  onAutoSubmit = () => {},
  maxViolations = 3,
  examId = null,
  sectionId = null,
  studentId = null
} = {}) => {
  const [violations, setViolations] = useState(0);
  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [violationLog, setViolationLog] = useState([]);
  const [lastViolationReason, setLastViolationReason] = useState('');

  // Ref to prevent double-counting within a short window (e.g., blur + visibilitychange firing together)
  const lastViolationTimeRef = useRef(0);
  const isAutoSubmittingRef = useRef(false);
  const activeRef = useRef(isExamActive);

  useEffect(() => {
    activeRef.current = isExamActive;
  }, [isExamActive]);

  // Core function to record a security breach
  const recordViolation = useCallback((reason) => {
    if (!activeRef.current || isAutoSubmittingRef.current) return;

    const now = Date.now();
    // Guard: ignore if triggered within 1000ms of the previous violation
    if (now - lastViolationTimeRef.current < 1000) {
      return;
    }
    lastViolationTimeRef.current = now;

    setViolations((prevCount) => {
      const newCount = prevCount + 1;
      const logEntry = {
        violationNumber: newCount,
        type: reason,
        reason,
        examId,
        sectionId,
        studentId,
        timestamp: new Date().toLocaleTimeString(),
        isoTime: new Date().toISOString()
      };

      setViolationLog((prevLogs) => [...prevLogs, logEntry]);
      setLastViolationReason(reason);

      if (newCount >= maxViolations) {
        // Strike 3 reached: Trigger automated submission
        isAutoSubmittingRef.current = true;
        setWarningModalOpen(true);
        setTimeout(() => {
          onAutoSubmit('Security violation limit (3 strikes) exceeded.');
        }, 1200);
      } else {
        // Strike 1 or 2: Display warning modal
        setWarningModalOpen(true);
      }

      return newCount;
    });
  }, [maxViolations, onAutoSubmit, examId, sectionId, studentId]);

  // Handle visibility change (tab switch, window minimization)
  useEffect(() => {
    if (!isExamActive) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        recordViolation('Tab switched or browser minimized');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isExamActive, recordViolation]);

  // Handle window focus and blur
  useEffect(() => {
    if (!isExamActive) return;

    const handleBlur = () => {
      // Blur can fire on tab switch, iframe click, or OS app switch
      recordViolation('Browser window lost focus');
    };

    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('blur', handleBlur);
    };
  }, [isExamActive, recordViolation]);

  // Handle fullscreen exit
  useEffect(() => {
    if (!isExamActive) return;

    const handleFullscreenChange = () => {
      if (!isFullScreenActive() && activeRef.current) {
        recordViolation('Exited fullscreen examination mode');
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [isExamActive, recordViolation]);

  // Acknowledge warning and re-enter fullscreen
  const acknowledgeWarning = async () => {
    setWarningModalOpen(false);
    if (!isFullScreenActive() && activeRef.current) {
      await requestFullScreenMode();
    }
  };

  const resetSecurity = () => {
    setViolations(0);
    setViolationLog([]);
    setWarningModalOpen(false);
    isAutoSubmittingRef.current = false;
    lastViolationTimeRef.current = 0;
  };

  return {
    violations,
    maxViolations,
    warningModalOpen,
    violationLog,
    lastViolationReason,
    acknowledgeWarning,
    resetSecurity,
    recordViolation
  };
};
