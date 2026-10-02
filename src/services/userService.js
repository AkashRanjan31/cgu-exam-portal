import api from './api';

export const userService = {
  /**
   * Get all registered students with enriched summary (Admin)
   * Backend: GET /api/admin/students?page=&limit=&search=&dept=&status=&eligibility=
   */
  getAllStudents: async () => {
    try {
      // Future backend:
      // const res = await api.get('/admin/students', { params });
      // return res.data; // { students, total, page, totalPages }

      await new Promise(resolve => setTimeout(resolve, 200));
      const users = JSON.parse(localStorage.getItem('cvrgu_users') || '[]');
      const results = JSON.parse(localStorage.getItem('cvrgu_results') || '[]');
      const retests = JSON.parse(localStorage.getItem('cvrgu_retests') || '[]');

      return users
        .filter(u => u.role === 'student')
        .map(u => {
          const studentResults = results.filter(r => r.studentEmail === u.email);
          const studentRetests = retests.filter(r => r.studentEmail === u.email);
          const examsTaken = studentResults.length;
          const lastResult = studentResults.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))[0];
          const pendingRetest = studentRetests.find(r => r.status === 'Pending');
          const approvedRetest = studentRetests.find(r => r.status === 'Approved');

          // Strip password — never expose it
          const { password, ...safe } = u;

          return {
            ...safe,
            examsTaken,
            averageScore: examsTaken > 0
              ? Math.round(studentResults.reduce((acc, r) => acc + r.percentage, 0) / examsTaken) + '%'
              : 'N/A',
            lastExamTitle: lastResult?.examTitle || null,
            lastExamDate: lastResult?.submittedAt || null,
            lastExamStatus: lastResult?.status || null,
            retestStatus: approvedRetest ? 'Approved' : pendingRetest ? 'Pending' : 'None',
            // examEligibility is authoritative on the backend; frontend displays only
            examEligibility: u.examEligibility || (u.status === 'Active' ? 'Eligible' : 'Not Eligible'),
            program: u.program || 'B.Tech',
            batch: u.batch || u.year || null,
            semester: u.semester || null,
            section: u.section || null,
            registrationNumber: u.registrationNumber || u.rollNumber || null,
          };
        });
    } catch (err) {
      console.error('Failed to get students:', err);
      throw err;
    }
  },

  /**
   * Get full student profile with exam history, results, retests
   * Backend: GET /api/admin/students/:id
   */
  getStudentDetail: async (studentId) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 150));
      const users = JSON.parse(localStorage.getItem('cvrgu_users') || '[]');
      const results = JSON.parse(localStorage.getItem('cvrgu_results') || '[]');
      const retests = JSON.parse(localStorage.getItem('cvrgu_retests') || '[]');

      const user = users.find(u => u.id === studentId || u.email === studentId);
      if (!user) throw new Error('Student not found');

      const { password, ...safe } = user;
      const studentResults = results
        .filter(r => r.studentEmail === safe.email)
        .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
      const studentRetests = retests
        .filter(r => r.studentEmail === safe.email)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return {
        ...safe,
        program: safe.program || 'B.Tech',
        batch: safe.batch || safe.year || null,
        examEligibility: safe.examEligibility || (safe.status === 'Active' ? 'Eligible' : 'Not Eligible'),
        registrationNumber: safe.registrationNumber || safe.rollNumber || null,
        results: studentResults,
        retests: studentRetests,
        examsTaken: studentResults.length,
        examsCompleted: studentResults.filter(r => r.status === 'PASS' || r.status === 'FAIL').length,
      };
    } catch (err) {
      console.error('Failed to get student detail:', err);
      throw err;
    }
  },

  /**
   * Admin reset student password — security-sensitive operation.
   * Backend: POST /api/admin/students/:id/password-reset
   * Backend must: authenticate admin, verify COE/super-admin permission,
   * verify student exists, generate credential server-side, hash & store it,
   * set mustChangePassword=true, invalidate existing sessions, write audit log.
   * Frontend NEVER receives the existing password or any hash.
   */
  adminResetStudentPassword: async (studentId, method, options = {}) => {
    try {
      // Future backend:
      // const res = await api.post(`/admin/students/${studentId}/password-reset`, { method, ...options });
      // return res.data;

      await new Promise(resolve => setTimeout(resolve, 500));
      const users = JSON.parse(localStorage.getItem('cvrgu_users') || '[]');
      const idx = users.findIndex(u => u.id === studentId);
      if (idx === -1) throw new Error('Student not found.');

      if (method === 'temporary_password') {
        // Use explicitly provided password (from inline tab) or generate one
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$!';
        const tmp = options.password ||
          Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');

        users[idx].password = tmp;
        users[idx].mustChangePassword = options.mustChangePassword !== false;
        users[idx].passwordResetAt = new Date().toISOString();
        localStorage.setItem('cvrgu_users', JSON.stringify(users));

        return { success: true, method, temporaryPassword: tmp };
      }

      if (method === 'reset_link') {
        // Production: backend generates a secure short-lived token, emails the student.
        // Frontend never sees the token.
        users[idx].mustChangePassword = true;
        users[idx].passwordResetAt = new Date().toISOString();
        localStorage.setItem('cvrgu_users', JSON.stringify(users));
        return { success: true, method, message: 'Password reset link sent to student\'s university email.' };
      }

      throw new Error('Invalid reset method.');
    } catch (err) {
      console.error('Failed to reset student password:', err);
      throw err;
    }
  },

  /**
   * Update editable student profile fields (Admin)
   * Backend: PATCH /api/admin/students/:id
   * Backend must: authenticate admin, verify permission, validate, check uniqueness,
   * update atomically, write audit log, return updated student.
   */
  updateStudentProfile: async (id, fields) => {
    try {
      // Future backend:
      // const res = await api.patch(`/admin/students/${id}`, fields);
      // return res.data; // { student, auditId }

      await new Promise(resolve => setTimeout(resolve, 350));
      const users = JSON.parse(localStorage.getItem('cvrgu_users') || '[]');
      const idx = users.findIndex(u => u.id === id);
      if (idx === -1) throw new Error('Student not found');

      // PROTECTED fields — backend must enforce; frontend mirrors the restriction
      const PROTECTED = ['registrationNumber', 'rollNumber', 'email', 'role', 'password', 'id'];
      const sanitized = Object.fromEntries(
        Object.entries(fields).filter(([k]) => !PROTECTED.includes(k))
      );

      users[idx] = { ...users[idx], ...sanitized, updatedAt: new Date().toISOString() };
      localStorage.setItem('cvrgu_users', JSON.stringify(users));

      const { password, ...safe } = users[idx];
      return safe;
    } catch (err) {
      console.error('Failed to update student profile:', err);
      throw err;
    }
  },

  /**
   * Update student status (Active/Suspended)
   * Backend: PATCH /api/admin/students/:id/status
   */
  updateStudentStatus: async (id, status) => {
    try {
      const users = JSON.parse(localStorage.getItem('cvrgu_users') || '[]');
      const idx = users.findIndex(u => u.id === id);
      if (idx !== -1) {
        users[idx].status = status;
        localStorage.setItem('cvrgu_users', JSON.stringify(users));
        const { password, ...safe } = users[idx];
        return safe;
      }
      throw new Error('User not found');
    } catch (err) {
      console.error('Failed to update student status:', err);
      throw err;
    }
  }
};
