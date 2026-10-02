import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { examService } from '../services/examService';
import { resultService } from '../services/resultService';
import { retestService } from '../services/retestService';
import ExamCard from '../components/ExamCard';
import {
  BookOpen,
  Clock,
  CheckCircle,
  TrendingUp,
  ArrowRight,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export const StudentDashboard = () => {
  const { user } = useAuth();

  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [retests, setRetests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allExams, studentResults, studentRetests] = await Promise.all([
          examService.getExams(),
          resultService.getResultsByStudentId(user?.id, user?.email),
          retestService.getStudentRetests(user?.id, user?.email)
        ]);
        setExams(allExams);
        setResults(studentResults);
        setRetests(studentRetests);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const getExamRetestStatus = (examId) => {
    const studentResults = results.filter(r => r.examId === examId);
    const approved = retests.find(r => r.examId === examId && r.status === 'Approved');
    const pending = retests.find(r => r.examId === examId && r.status === 'Pending');

    if (approved && studentResults.length < (approved.attemptAllowed || 2)) {
      return {
        isAuthorized: true,
        attemptNumber: studentResults.length + 1,
        refCode: approved.refCode
      };
    }
    if (pending) {
      return {
        isPending: true,
        refCode: pending.refCode
      };
    }
    return null;
  };

  // Calculations
  const completedExamIds = results.map(r => r.examId);
  const authorizedRetests = retests.filter(r => {
    const attempts = results.filter(res => res.examId === r.examId).length;
    return r.status === 'Approved' && attempts < (r.attemptAllowed || 2);
  });
  const authorizedExamIds = authorizedRetests.map(r => r.examId);

  const availableExams = exams.filter(e => {
    const isBasicAvailable = e.status === 'Available' || e.isPublished;
    const isAuthorizedForRetest = authorizedExamIds.includes(e.id);
    const notYetTaken = !completedExamIds.includes(e.id);
    return isBasicAvailable && (notYetTaken || isAuthorizedForRetest);
  });
  const upcomingExams = exams.filter(e => e.status === 'Upcoming');
  const completedExams = results.length;

  const averageScore = completedExams > 0
    ? Math.round(results.reduce((acc, curr) => acc + curr.percentage, 0) / completedExams)
    : 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-[#06264A] border-t-[#F5A623] rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-semibold text-slate-500">Loading student examination portal...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      
      {/* Welcome Banner */}
      <div className="bg-linear-to-r from-[#06264A] via-[#083363] to-[#0A3B72] rounded-3xl p-6 sm:p-8 text-white shadow-academic flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-[#F5A623] backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Official University Session 2026</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name?.split(' ')[0] || 'Student'}! 👋
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
            Here is your current examination overview. Ensure you review all proctoring guidelines and maintain your fullscreen view before entering an active test.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <Link
            to="/student/my-exams"
            className="px-5 py-3 rounded-xl bg-[#F5A623] hover:bg-[#d98f18] text-[#031A33] font-bold text-xs tracking-wide shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <span>View All Exams</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* 4 Statistics Cards (Section 10 requirement) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Available Exams
            </span>
            <div className="text-2xl font-black text-[#06264A] mt-1">
              {availableExams.length}
            </div>
            <p className="text-[11px] text-blue-600 font-semibold mt-1">Ready to attempt</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#06264A] flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Upcoming Exams
            </span>
            <div className="text-2xl font-black text-amber-600 mt-1">
              {upcomingExams.length}
            </div>
            <p className="text-[11px] text-amber-600 font-semibold mt-1">Scheduled next</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Completed Exams
            </span>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              {completedExams}
            </div>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">Evaluated & archived</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Average Score
            </span>
            <div className="text-2xl font-black text-purple-700 mt-1">
              {completedExams > 0 ? `${averageScore}%` : 'N/A'}
            </div>
            <p className="text-[11px] text-purple-600 font-semibold mt-1">Across all attempts</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Retest Dispensation Notice Banner */}
      {authorizedRetests.length > 0 && (
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-sm">Official Retest Authorization Granted by COE</h3>
              <p className="text-xs text-emerald-800 mt-0.5">
                The Office of the Controller of Examinations has authorized {authorizedRetests.length} retest session(s) for your account. You can now access your re-examination paper below.
              </p>
            </div>
          </div>
          <Link
            to="/student/my-exams"
            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shrink-0 inline-flex items-center gap-1.5 shadow-sm"
          >
            <span>View Retest Paper</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Available Examinations Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#06264A]">Available Examinations</h2>
            <p className="text-xs text-slate-500">Exams currently open for testing in your academic semester</p>
          </div>
          <Link
            to="/student/my-exams"
            className="text-xs font-bold text-[#06264A] hover:text-[#0A3B72] flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {availableExams.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
            <BookOpen className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-sm">No examinations are currently open.</p>
            <p className="text-xs text-slate-400 mt-1">Check back according to your university examination timetable.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableExams.slice(0, 3).map((exam) => (
              <ExamCard
                key={exam.id}
                exam={exam}
                isCompleted={completedExamIds.includes(exam.id) && !getExamRetestStatus(exam.id)?.isAuthorized}
                retestStatus={getExamRetestStatus(exam.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Recent Examination Results Snippet */}
      {results.length > 0 && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#06264A]">Recent Evaluations</h2>
              <p className="text-xs text-slate-500">Your latest graded semester examination results</p>
            </div>
            <Link
              to="/student/results"
              className="text-xs font-bold text-[#06264A] hover:text-[#0A3B72] flex items-center gap-1"
            >
              <span>Full History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="divide-y divide-slate-100">
              {results.slice(0, 3).map((res) => (
                <div key={res.id} className="p-4 sm:px-6 flex flex-wrap items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#06264A]">{res.examTitle}</span>
                      <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{res.examCode}</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Submitted on {new Date(res.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block uppercase">Marks</span>
                      <span className="font-bold text-sm text-slate-800">{res.score} / {res.totalMarks}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-400 block uppercase">Percentage</span>
                      <span className="font-extrabold text-sm text-[#06264A]">{res.percentage}%</span>
                    </div>

                    <div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        res.status === 'PASS' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {res.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default StudentDashboard;
