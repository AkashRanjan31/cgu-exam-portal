import api from './api';

export const retestService = {
  /**
   * Get all retest requests across the university (Admin)
   */
  getRetestRequests: async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      const retests = JSON.parse(localStorage.getItem('cvrgu_retests') || '[]');
      return retests;
    } catch (err) {
      console.error('Failed to get retests:', err);
      throw err;
    }
  },

  /**
   * Get retests applicable to a specific student
   */
  getStudentRetests: async (studentId, email) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 150));
      const retests = JSON.parse(localStorage.getItem('cvrgu_retests') || '[]');
      return retests.filter(
        r => r.studentId === studentId || (email && r.studentEmail?.toLowerCase() === email.toLowerCase())
      );
    } catch (err) {
      console.error('Failed to get student retests:', err);
      throw err;
    }
  },

  /**
   * Check if a student is authorized for a retest on an exam
   */
  checkRetestEligibility: async (studentId, email, examId) => {
    try {
      const retests = JSON.parse(localStorage.getItem('cvrgu_retests') || '[]');
      const results = JSON.parse(localStorage.getItem('cvrgu_results') || '[]');

      const studentResults = results.filter(
        r => (r.studentId === studentId || (email && r.studentEmail?.toLowerCase() === email.toLowerCase())) &&
             r.examId === Number(examId)
      );

      const approvedRetest = retests.find(
        r => (r.studentId === studentId || (email && r.studentEmail?.toLowerCase() === email.toLowerCase())) &&
             r.examId === Number(examId) &&
             r.status === 'Approved'
      );

      const pendingRetest = retests.find(
        r => (r.studentId === studentId || (email && r.studentEmail?.toLowerCase() === email.toLowerCase())) &&
             r.examId === Number(examId) &&
             r.status === 'Pending'
      );

      const attemptsCount = studentResults.length;

      return {
        attemptsCount,
        hasTakenExam: attemptsCount > 0,
        isRetestAuthorized: Boolean(approvedRetest && attemptsCount < (approvedRetest.attemptAllowed || 2)),
        approvedRetest: approvedRetest || null,
        pendingRetest: pendingRetest || null,
        nextAttemptNumber: attemptsCount + 1
      };
    } catch (err) {
      console.error('Failed to verify retest eligibility:', err);
      return {
        attemptsCount: 0,
        hasTakenExam: false,
        isRetestAuthorized: false,
        approvedRetest: null,
        pendingRetest: null,
        nextAttemptNumber: 1
      };
    }
  },

  /**
   * Student submits a formal retest request to the Controller of Examinations
   */
  requestRetest: async (payload) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 350));
      const retests = JSON.parse(localStorage.getItem('cvrgu_retests') || '[]');

      // Check if already submitted
      const existing = retests.find(
        r => r.examId === Number(payload.examId) &&
             r.studentEmail.toLowerCase() === payload.studentEmail.toLowerCase() &&
             r.status === 'Pending'
      );
      if (existing) {
        throw new Error('A retest petition for this examination is already pending review with the Controller of Examinations.');
      }

      const newRetest = {
        id: `ret-${Date.now()}`,
        examId: Number(payload.examId),
        examTitle: payload.examTitle || 'Examination',
        examCode: payload.examCode || 'EXAM',
        studentId: payload.studentId,
        studentName: payload.studentName,
        studentEmail: payload.studentEmail,
        rollNumber: payload.rollNumber,
        department: payload.department,
        reason: payload.reason.trim(),
        status: 'Pending',
        attemptAllowed: 2,
        scheduledWindow: 'Pending COE Scheduling',
        approvedBy: 'Pending COE Review',
        refCode: `COE/CVRGU/PET-${Math.floor(1000 + Math.random() * 9000)}`,
        createdAt: new Date().toISOString(),
        remarks: 'Submitted by student via Candidate Portal.'
      };

      retests.unshift(newRetest);
      localStorage.setItem('cvrgu_retests', JSON.stringify(retests));
      return newRetest;
    } catch (err) {
      console.error('Failed to submit retest request:', err);
      throw err;
    }
  },

  /**
   * Admin approves retest and schedules attempt window
   */
  approveRetest: async (retestId, { scheduledWindow, remarks, attemptAllowed = 2 } = {}) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const retests = JSON.parse(localStorage.getItem('cvrgu_retests') || '[]');
      const index = retests.findIndex(r => r.id === retestId);
      if (index === -1) throw new Error('Retest petition not found');

      retests[index] = {
        ...retests[index],
        status: 'Approved',
        attemptAllowed: Number(attemptAllowed || 2),
        scheduledWindow: scheduledWindow || 'Immediate window: Next 72 Hours',
        approvedBy: 'Office of the Controller of Examinations',
        approvedAt: new Date().toISOString(),
        refCode: `COE/CVRGU/RET-2026/${Math.floor(100 + Math.random() * 900)}`,
        remarks: remarks || 'Retest authorized upon verification of technical/administrative grounds.'
      };

      localStorage.setItem('cvrgu_retests', JSON.stringify(retests));
      return retests[index];
    } catch (err) {
      console.error('Failed to approve retest:', err);
      throw err;
    }
  },

  /**
   * Admin rejects retest petition
   */
  rejectRetest: async (retestId, remarks = '') => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const retests = JSON.parse(localStorage.getItem('cvrgu_retests') || '[]');
      const index = retests.findIndex(r => r.id === retestId);
      if (index === -1) throw new Error('Retest petition not found');

      retests[index] = {
        ...retests[index],
        status: 'Rejected',
        approvedBy: 'Office of the Controller of Examinations',
        rejectedAt: new Date().toISOString(),
        remarks: remarks || 'Petition rejected after review of workstation audit telemetry.'
      };

      localStorage.setItem('cvrgu_retests', JSON.stringify(retests));
      return retests[index];
    } catch (err) {
      console.error('Failed to reject retest:', err);
      throw err;
    }
  },

  /**
   * Admin proactively grants a retest to a student (e.g. university lab issue)
   */
  grantProactiveRetest: async (grantData) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const retests = JSON.parse(localStorage.getItem('cvrgu_retests') || '[]');
      
      const newGrant = {
        id: `ret-${Date.now()}`,
        examId: Number(grantData.examId),
        examTitle: grantData.examTitle,
        examCode: grantData.examCode || 'EXAM',
        studentId: grantData.studentId || 's1',
        studentName: grantData.studentName,
        studentEmail: grantData.studentEmail,
        rollNumber: grantData.rollNumber,
        department: grantData.department,
        reason: grantData.reason || 'Official administrative grant by COE',
        status: 'Approved',
        attemptAllowed: Number(grantData.attemptAllowed || 2),
        scheduledWindow: grantData.scheduledWindow || 'Next 48 Hours',
        approvedBy: 'Office of the Controller of Examinations',
        approvedAt: new Date().toISOString(),
        refCode: `COE/CVRGU/GRANT-2026/${Math.floor(100 + Math.random() * 900)}`,
        createdAt: new Date().toISOString(),
        remarks: grantData.remarks || 'Special dispensation granted by Examination Controller.'
      };

      retests.unshift(newGrant);
      localStorage.setItem('cvrgu_retests', JSON.stringify(retests));
      return newGrant;
    } catch (err) {
      console.error('Failed to grant proactive retest:', err);
      throw err;
    }
  }
};
