/**
 * Exam Monitoring Service
 * Live proctoring oversight, workstation telemetry, and real-time security tracking.
 *
 * PRODUCTION NOTE: This service must be backed by a real WebSocket or polling
 * endpoint on the backend. The current implementation reads from localStorage
 * for the active session on the current device (dev only) and returns no other
 * sessions. Hardcoded mock sessions have been removed.
 */
export const monitoringService = {
  /**
   * Fetch active candidate exam sessions currently in progress.
   * DEV: returns the session on this device if one is active.
   * PROD: GET /api/monitoring/sessions — returns all active sessions from backend.
   */
  getActiveSessions: async () => {
    try {
      if (!import.meta.env.DEV) {
        // Production: delegate to real backend
        const { default: api } = await import('./api');
        const res = await api.get('/monitoring/sessions');
        return res.data;
      }

      await new Promise(resolve => setTimeout(resolve, 200));
      const sessions = [];
      const activeState = localStorage.getItem('cvrgu_active_exam');

      if (activeState) {
        try {
          const parsed = JSON.parse(activeState);
          if (parsed.examStatus === 'in-progress' && parsed.currentExam) {
            const user = JSON.parse(localStorage.getItem('cvrgu_user') || '{}');
            const sec = parsed.currentExam.sections?.[parsed.activeSectionIndex] || { title: 'Section A' };
            sessions.push({
              id: `sess-live-${parsed.currentExam.id}`,
              studentId: user.id || 's1',
              studentName: user.name || 'Student Name',
              studentEmail: user.email || '',
              rollNumber: user.rollNumber || '',
              department: user.department || '',
              examId: parsed.currentExam.id,
              examTitle: parsed.currentExam.title,
              currentSection: sec.title,
              activeSectionIndex: parsed.activeSectionIndex + 1,
              totalSections: parsed.currentExam.sections?.length || 1,
              remainingSeconds: parsed.sectionRemainingTime || 0,
              violations: 0,
              status: 'Active',
              workstationIp: 'localhost (dev)',
              lastHeartbeat: new Date().toLocaleTimeString()
            });
          }
        } catch {
          // ignore parse errors
        }
      }

      return sessions;
    } catch (err) {
      return [];
    }
  },

  /**
   * Fetch university violation events log.
   * PROD: GET /api/monitoring/violations
   */
  getViolationAuditLog: async () => {
    if (!import.meta.env.DEV) {
      const { default: api } = await import('./api');
      const res = await api.get('/monitoring/violations');
      return res.data;
    }
    // Dev: return empty — no fabricated data
    return [];
  },

  /**
   * Controller remote termination / disqualification.
   * PROD: POST /api/monitoring/sessions/:sessionId/terminate
   * This sends a server-side signal to force-submit the student's exam.
   */
  terminateSession: async (sessionId, reason = 'COE Administrative Disqualification') => {
    if (!import.meta.env.DEV) {
      const { default: api } = await import('./api');
      const res = await api.post(`/monitoring/sessions/${sessionId}/terminate`, { reason });
      return res.data;
    }
    // Dev stub — no real effect
    return { success: true, sessionId, reason, note: 'Dev stub — no real session terminated.' };
  }
};

export default monitoringService;
