import { userService } from './userService';

/**
 * Student Service
 * Centralized service for student roster, profiles, and verification
 */
export const studentService = {
  ...userService,

  /**
   * Get student profile by ID or email
   */
  getStudentProfile: async (studentId, email) => {
    try {
      const users = JSON.parse(localStorage.getItem('cvrgu_users') || '[]');
      const student = users.find(u => u.id === studentId || (email && u.email.toLowerCase() === email.toLowerCase()));
      if (!student) return null;
      const safe = { ...student };
      delete safe.password;
      return safe;
    } catch (err) {
      console.error('Failed to get student profile:', err);
      return null;
    }
  }
};

export default studentService;
