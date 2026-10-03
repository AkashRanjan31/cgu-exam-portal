import { isCguEmail, CGU_EMAIL_RESTRICTION_MESSAGE } from '../utils/validation';

// ---------------------------------------------------------------------------
// Session storage keys
// ---------------------------------------------------------------------------
// Each browser tab gets its own sessionStorage slot for the token so that
// multiple tabs/windows can hold independent authenticated sessions for the
// same account without overwriting each other.
//
// localStorage is still used for the user object (read-only profile cache)
// because it is safe to share — it contains no credentials.
//
// In production these keys are irrelevant: the backend issues an httpOnly
// cookie that is automatically scoped per-browser (not per-tab), and the
// frontend calls GET /auth/me on mount to validate the session.
// ---------------------------------------------------------------------------
export const SESSION_TOKEN_KEY = 'cvrgu_auth_token';   // sessionStorage — per-tab
export const SESSION_USER_KEY  = 'cvrgu_user';         // localStorage  — shared profile cache

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

    // sessionStorage: per-tab — does NOT overwrite another tab's session
    const token = `cvrgu_mock_jwt_${Date.now()}`;
    sessionStorage.setItem(SESSION_TOKEN_KEY, token);
    // localStorage: shared profile cache — safe, contains no credentials
    localStorage.setItem(SESSION_USER_KEY, JSON.stringify(safeUser));

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
    sessionStorage.setItem(SESSION_TOKEN_KEY, token);
    localStorage.setItem(SESSION_USER_KEY, JSON.stringify(safeUser));

    return { success: true, token, user: safeUser };
  },

  /**
   * Validate current session with the backend and return the authenticated user.
   * DEV: reads from localStorage.
   * PROD: GET /auth/me — backend validates the httpOnly cookie JWT.
   */
  getProfile: async () => {
    // A session is only valid if this tab has its own token.
    // This prevents a tab that was never logged in from inheriting
    // another tab's user object from the shared localStorage cache.
    const token = sessionStorage.getItem(SESSION_TOKEN_KEY);
    if (!token) return null;
    const stored = localStorage.getItem(SESSION_USER_KEY);
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
    // Remove this tab's session token — other tabs keep their own tokens
    sessionStorage.removeItem(SESSION_TOKEN_KEY);
    // Remove this tab's active exam state — does not affect other tabs
    sessionStorage.removeItem('cvrgu_active_exam_tab');
    // Clear the shared profile cache only if no other tab is still logged in.
    // We cannot reliably detect other tabs in a pure frontend mock, so we
    // leave the shared user cache in place — it is safe (no credentials).
    // In production the backend invalidates the session server-side.
    localStorage.removeItem('cvrgu_active_exam');
    localStorage.removeItem('cvrgu_exam_state');
  },

  /**
   * Log out of all sessions on this device.
   * In production: POST /auth/logout-all — backend invalidates all sessions
   * for this user and clears the httpOnly cookie.
   */
  logoutAll: async () => {
    sessionStorage.clear();
    localStorage.removeItem(SESSION_USER_KEY);
    localStorage.removeItem('cvrgu_active_exam');
    localStorage.removeItem('cvrgu_exam_state');
    // Signal all other same-origin tabs to log out
    localStorage.setItem('cvrgu_logout_all', String(Date.now()));
    localStorage.removeItem('cvrgu_logout_all');
  }
};
