import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ExamProvider } from './context/ExamContext';
import { StudentRoute, AdminRoute } from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Public Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';

// Student Pages
import StudentDashboard from './pages/StudentDashboard';
import MyExams from './pages/MyExams';
import ExamInstructions from './pages/ExamInstructions';
import ExamPage from './pages/ExamPage';
import ResultPage from './pages/ResultPage';
import ResultHistory from './pages/ResultHistory';
import Profile from './pages/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageStudents from './pages/admin/ManageStudents';
import ManageExams from './pages/admin/ManageExams';
import ManageQuestions from './pages/admin/ManageQuestions';
import ManageSections from './pages/admin/ManageSections';
import ManageResults from './pages/admin/ManageResults';
import ManageRetests from './pages/admin/ManageRetests';
import ManageMonitoring from './pages/admin/ManageMonitoring';

/**
 * Dashboard Shell Layout with Navbar and responsive Sidebar
 */
const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col">
      <Navbar onToggleSidebar={() => setSidebarOpen(true)} />
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-8">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ExamProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Student Protected Portal */}
            <Route element={<StudentRoute />}>
              {/* Standalone Fullscreen Exam View */}
              <Route path="/student/exam/:examId" element={<ExamPage />} />
              <Route path="/exam/:examId" element={<ExamPage />} />

              {/* Standard Student Portal Layout */}
              <Route path="/student" element={<DashboardLayout />}>
                <Route index element={<Navigate to="/student/dashboard" replace />} />
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="my-exams" element={<MyExams />} />
                <Route path="exams" element={<MyExams />} />
                <Route path="instructions/:examId" element={<ExamInstructions />} />
                <Route path="exam/:examId/instructions" element={<ExamInstructions />} />
                <Route path="results" element={<ResultHistory />} />
                <Route path="results/:resultId" element={<ResultPage />} />
                <Route path="profile" element={<Profile />} />
              </Route>
            </Route>

            {/* Admin Protected Portal */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<DashboardLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="students" element={<ManageStudents />} />
                <Route path="exams" element={<ManageExams />} />
                <Route path="examinations" element={<ManageExams />} />
                <Route path="sections" element={<ManageSections />} />
                <Route path="questions" element={<ManageQuestions />} />
                <Route path="results" element={<ManageResults />} />
                <Route path="retests" element={<ManageRetests />} />
                <Route path="monitoring" element={<ManageMonitoring />} />
              </Route>
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ExamProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
