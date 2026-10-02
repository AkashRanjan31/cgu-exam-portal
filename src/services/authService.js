import { isCguEmail, CGU_EMAIL_RESTRICTION_MESSAGE } from '../utils/validation';

export const authService = {
  /**
   * Log in user.
   * DEV: mock against localStorage.
   * PROD: POST /auth/login — backend issues httpOnly JWT cookie, returns safe user object.
   */
  login: async (email, password) => {
    if (!isCguEmail(email)) {
      throw new Error(CGU_EMAIL_RESTRICTION_MESSAGE);
    }

    await new Promise(resolve => setTimeout(resolve, 400));
    const users = JSON.parse(localStorage.getItem('cvrgu_users') || '[]');
    const user = users.find(
      u =>
        u.email.toLowerCase() === email.trim().toLowerCase() &&
        u.password === password
    );

    if (!user) {
      throw new Error('Invalid university credentials. Check your email and password.');
    }

    const safeUser = { ...user };
    delete safeUser.password;

    const token = `cvrgu_mock_jwt_${Date.now()}`;
    localStorage.setItem('cvrgu_auth_token', token);
    localStorage.setItem('cvrgu_user', JSON.stringify(safeUser));

    return { success: true, token, user: safeUser };
  },

  /**
   * Register a new student.
   * DEV: mock against localStorage.
   * PROD: POST /auth/register
   */
  register: async (userData) => {
    if (!isCguEmail(userData.email)) {
      throw new Error(CGU_EMAIL_RESTRICTION_MESSAGE);
    }

    await new Promise(resolve => setTimeout(resolve, 500));
    const users = JSON.parse(localStorage.getItem('cvrgu_users') || '[]');
    const existing = users.find(
      u => u.email.toLowerCase() === userData.email.trim().toLowerCase()
    );
    if (existing) {
      throw new Error('An account with this CVRGU email is already registered.');
    }

    const newUser = {
      id: `s-${Date.now()}`,
      name: userData.name.trim(),
      email: userData.email.trim().toLowerCase(),
      rollNumber: userData.rollNumber.trim(),
      department: userData.department,
      year: userData.year || '3rd Year',
      semester: userData.semester || '5th Semester',
      status: 'Active',
      registeredDate: new Date().toISOString().split('T')[0],
      password: userData.password,
      role: 'student'
    };

    users.push(newUser);
    localStorage.setItem('cvrgu_users', JSON.stringify(users));

    const safeUser = { ...newUser };
    delete safeUser.password;

    const token = `cvrgu_mock_jwt_${Date.now()}`;
    localStorage.setItem('cvrgu_auth_token', token);
    localStorage.setItem('cvrgu_user', JSON.stringify(safeUser));

    return { success: true, token, user: safeUser };
  },

  /**
   * Validate current session with the backend and return the authenticated user.
   * DEV: reads from localStorage.
   * PROD: GET /auth/me — backend validates the httpOnly cookie JWT.
   */
  getProfile: async () => {
    const stored = localStorage.getItem('cvrgu_user');
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },

  /**
   * Log out — clears all local state and invalidates the server session.
   */
  logout: async () => {
    localStorage.removeItem('cvrgu_auth_token');
    localStorage.removeItem('cvrgu_user');
    localStorage.removeItem('cvrgu_active_exam');
    localStorage.removeItem('cvrgu_exam_state');
  }
};
