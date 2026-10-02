import axios from 'axios';
import {
  INITIAL_EXAMS,
  DATA_STRUCTURES_QUESTIONS,
  INITIAL_STUDENTS,
  INITIAL_RESULTS,
  DEMO_CREDENTIALS,
  INITIAL_RETESTS
} from '../utils/constants';

// ---------------------------------------------------------------------------
// Mock localStorage initialisation — seeds demo data on first load
// ---------------------------------------------------------------------------
const initStorage = () => {
    const existingUsers = localStorage.getItem('cvrgu_users');
    const needsMigration =
      !existingUsers ||
      existingUsers.includes('Mahapatra') ||
      existingUsers.includes('2301020334') ||
      existingUsers.includes('Akash') ||
      (() => {
        try {
          const u = JSON.parse(existingUsers);
          if (u.some(x => x.role === 'student' && (!x.id || !x.status))) return true;
          const emails = u.map(x => x.email?.toLowerCase()).filter(Boolean);
          return emails.length !== new Set(emails).size;
        } catch { return true; }
      })();

    if (needsMigration && DEMO_CREDENTIALS) {
      const initialUsers = [
        { ...DEMO_CREDENTIALS.student, password: DEMO_CREDENTIALS.student.demoKey },
        { ...DEMO_CREDENTIALS.admin,   password: DEMO_CREDENTIALS.admin.demoKey },
        ...INITIAL_STUDENTS.map(s => ({ ...s, password: 'Password@123', role: 'student' }))
      ];
      localStorage.setItem('cvrgu_users', JSON.stringify(initialUsers));
      localStorage.removeItem('cvrgu_user');
      localStorage.removeItem('cvrgu_auth_token');
    }

    const existingExams = localStorage.getItem('cvrgu_exams');
    if (!existingExams || !existingExams.includes('sections')) {
      localStorage.setItem('cvrgu_exams', JSON.stringify(INITIAL_EXAMS));
    }

    if (!localStorage.getItem('cvrgu_questions')) {
      const extraQuestions = [
        {
          id: 201, examId: 2, sectionId: 'sec-db-1',
          sectionTitle: 'Section A: Relational Model & SQL Calculus', questionNumber: 1,
          questionText: 'Which normal form deals with removing partial functional dependencies on a candidate key?',
          options: ['1NF', '2NF', '3NF', 'BCNF'], correctAnswer: 1, marks: 1,
          explanation: 'Second Normal Form (2NF) enforces that no non-prime attribute is functionally dependent on any proper subset of any candidate key.'
        },
        {
          id: 202, examId: 2, sectionId: 'sec-db-2',
          sectionTitle: 'Section B: Normalization & Transaction Concurrency', questionNumber: 2,
          questionText: 'Which ACID property guarantees that all operations in a transaction are committed or none are in case of system failures?',
          options: ['Atomicity', 'Consistency', 'Isolation', 'Durability'], correctAnswer: 0, marks: 1,
          explanation: 'Atomicity ensures all-or-nothing execution of operations in a transaction.'
        },
        {
          id: 301, examId: 3, sectionId: 'sec-os-1',
          sectionTitle: 'Section A: Process Management & CPU Scheduling', questionNumber: 1,
          questionText: 'Which CPU scheduling algorithm is preemptive and minimizes average turnaround and waiting times?',
          options: ['First-Come First-Served', 'Shortest Remaining Time First', 'Priority Scheduling', 'Round Robin'],
          correctAnswer: 1, marks: 1,
          explanation: 'SRTF is the preemptive counterpart of SJF and gives the theoretically optimal average waiting time.'
        }
      ];
      localStorage.setItem('cvrgu_questions', JSON.stringify([...DATA_STRUCTURES_QUESTIONS, ...extraQuestions]));
    }

    const existingResults = localStorage.getItem('cvrgu_results');
    if (
      !existingResults ||
      existingResults.includes('Mahapatra') ||
      existingResults.includes('2301020334') ||
      existingResults.includes('Akash')
    ) {
      localStorage.setItem('cvrgu_results', JSON.stringify(INITIAL_RESULTS));
    }

    const existingRetests = localStorage.getItem('cvrgu_retests');
    if (!existingRetests || existingRetests.includes('2301020334') || existingRetests.includes('Akash')) {
      localStorage.setItem('cvrgu_retests', JSON.stringify(INITIAL_RETESTS));
    }
  };

initStorage();

// ---------------------------------------------------------------------------
// Axios instance — configured for real backend integration
// ---------------------------------------------------------------------------
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
  withCredentials: true // Required for httpOnly cookie-based auth in production
});

// Attach JWT from localStorage (dev mock) or rely on httpOnly cookie (production)
api.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      const token = localStorage.getItem('cvrgu_auth_token');
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 — clear session and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('cvrgu_auth_token');
      sessionStorage.removeItem('cvrgu_user');
      localStorage.removeItem('cvrgu_active_exam');
      // Only redirect if not already on the login page
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
