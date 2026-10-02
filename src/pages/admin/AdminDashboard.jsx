import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { examService } from '../../services/examService';
import { userService } from '../../services/userService';
import { questionService } from '../../services/questionService';
import { resultService } from '../../services/resultService';
import { retestService } from '../../services/retestService';
import {
  Users,
  BookOpen,
  FileQuestion,
  Award,
  ArrowRight,
  ShieldCheck,
  PlusCircle,
  RotateCcw,
  Clock,
  Layers,
  Monitor
} from 'lucide-react';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [results, setResults] = useState([]);
  const [retests, setRetests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const [studData, examData, questData, resData, retestData] = await Promise.all([
          userService.getAllStudents(),
          examService.getExams(),
          questionService.getAllQuestions(),
          resultService.getAllResults(),
          retestService.getRetestRequests()
        ]);
        setStudents(studData);
        setExams(examData);
        setQuestions(questData);
        setResults(resData);
        setRetests(retestData);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#06264A] border-t-[#F5A623] rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-semibold text-slate-500">Loading university administrative portal...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      
      {/* Top Banner */}
      <div className="bg-[#06264A] text-white p-6 sm:p-8 rounded-3xl shadow-academic flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#F5A623] mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>CVRGU Examination Controller Operations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Administrator Dashboard
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Logged in as {user?.name || 'Administrator'} • Office of the Controller of Examinations
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/admin/exams"
            className="px-4 py-2.5 rounded-xl bg-[#F5A623] text-[#031A33] font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-[#d98f18] transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Exam</span>
          </Link>
        </div>
      </div>

      {/* 4 Primary Admin Statistics (Section 25 requirement) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Students</span>
            <div className="text-2xl font-black text-[#06264A] mt-1">{students.length}</div>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">Domain Verified (@cgu-odisha.ac.in)</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#06264A] flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Examinations</span>
            <div className="text-2xl font-black text-[#06264A] mt-1">{exams.length}</div>
            <p className="text-[11px] text-blue-600 font-semibold mt-1">
              {exams.filter(e => e.isPublished).length} Published & Active
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#F5A623] flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Questions</span>
            <div className="text-2xl font-black text-[#06264A] mt-1">{questions.length}</div>
            <p className="text-[11px] text-purple-600 font-semibold mt-1">In Question Bank</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <FileQuestion className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Completed Sessions</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">{results.length}</div>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">
              {results.filter(r => r.status === 'PASS').length} Passed
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Retest Petitions Pending COE Review Alert */}
      {retests.filter(r => r.status === 'Pending').length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-amber-900 block text-sm">
                {retests.filter(r => r.status === 'Pending').length} Retest Incident Appeal(s) Pending COE Review
              </span>
              <span className="text-slate-600 mt-0.5 block">
                Candidate workstation telemetry and incident appeals require Controller adjudication.
              </span>
            </div>
          </div>
          <Link
            to="/admin/retests"
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 inline-flex items-center gap-1.5 shadow-xs"
          >
            <span>Adjudicate Appeals</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        <Link
          to="/admin/students"
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-[#06264A] transition-all group shadow-xs"
        >
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 text-[#06264A]" />
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="font-bold text-sm text-slate-800">Manage Students</h3>
          <p className="text-xs text-slate-500 mt-1">Verify student rosters & departments</p>
        </Link>

        <Link
          to="/admin/exams"
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-[#06264A] transition-all group shadow-xs"
        >
          <div className="flex items-center justify-between mb-2">
            <BookOpen className="w-5 h-5 text-[#F5A623]" />
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="font-bold text-sm text-slate-800">Manage Exams</h3>
          <p className="text-xs text-slate-500 mt-1">Schedule & publish subject papers</p>
        </Link>

        <Link
          to="/admin/sections"
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-[#06264A] transition-all group shadow-xs"
        >
          <div className="flex items-center justify-between mb-2">
            <Layers className="w-5 h-5 text-[#06264A]" />
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="font-bold text-sm text-slate-800">Exam Sections</h3>
          <p className="text-xs text-slate-500 mt-1">Structure, timers & reordering</p>
        </Link>

        <Link
          to="/admin/questions"
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-[#06264A] transition-all group shadow-xs"
        >
          <div className="flex items-center justify-between mb-2">
            <FileQuestion className="w-5 h-5 text-purple-600" />
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="font-bold text-sm text-slate-800">Question Bank</h3>
          <p className="text-xs text-slate-500 mt-1">Bulk Excel/CSV upload & section curation</p>
        </Link>

        <Link
          to="/admin/results"
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-[#06264A] transition-all group shadow-xs"
        >
          <div className="flex items-center justify-between mb-2">
            <Award className="w-5 h-5 text-emerald-600" />
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="font-bold text-sm text-slate-800">University Results</h3>
          <p className="text-xs text-slate-500 mt-1">Audit scores, percentages & violations</p>
        </Link>

        <Link
          to="/admin/retests"
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-[#06264A] transition-all group shadow-xs relative"
        >
          {retests.filter(r => r.status === 'Pending').length > 0 && (
            <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-amber-500 text-white font-black text-[10px]">
              {retests.filter(r => r.status === 'Pending').length}
            </span>
          )}
          <div className="flex items-center justify-between mb-2">
            <RotateCcw className="w-5 h-5 text-[#06264A]" />
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="font-bold text-sm text-slate-800">Retest Authority</h3>
          <p className="text-xs text-slate-500 mt-1">Adjudicate appeals & attempt windows</p>
        </Link>

        <Link
          to="/admin/monitoring"
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-[#06264A] transition-all group shadow-xs"
        >
          <div className="flex items-center justify-between mb-2">
            <Monitor className="w-5 h-5 text-[#06264A]" />
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="font-bold text-sm text-slate-800">Live Monitoring</h3>
          <p className="text-xs text-slate-500 mt-1">Real-time telemetry & proctoring</p>
        </Link>
      </div>

      {/* Recent Examination Activity Log */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#06264A]">Recent Exam Submissions</h2>
            <p className="text-xs text-slate-500">Live submission stream from candidates</p>
          </div>
          <Link
            to="/admin/results"
            className="text-xs font-bold text-[#06264A] hover:underline flex items-center gap-1"
          >
            <span>View All Results</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {results.slice(0, 5).map((res) => (
            <div key={res.id} className="py-3 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-bold text-slate-900">{res.studentName} ({res.rollNumber})</p>
                <p className="text-slate-500 text-[11px]">
                  {res.examTitle} • Submitted {new Date(res.submittedAt).toLocaleTimeString()}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="font-bold text-slate-800">{res.score}/{res.totalMarks}</span>
                  <span className="text-[10px] text-slate-400 block font-mono">({res.percentage}%)</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                  res.status === 'PASS' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                }`}>
                  {res.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
