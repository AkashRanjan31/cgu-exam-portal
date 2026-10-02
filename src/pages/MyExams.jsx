import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { examService } from '../services/examService';
import { resultService } from '../services/resultService';
import { retestService } from '../services/retestService';
import ExamCard from '../components/ExamCard';
import { Search, BookOpen } from 'lucide-react';

export const MyExams = () => {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [retests, setRetests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('all'); // all, available, retests, upcoming, completed

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
        console.error('Error fetching exams:', err);
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

  const completedExamIds = results.map(r => r.examId);
  const authorizedRetestExamIds = retests
    .filter(r => {
      const attempts = results.filter(res => res.examId === r.examId).length;
      return r.status === 'Approved' && attempts < (r.attemptAllowed || 2);
    })
    .map(r => r.examId);

  // Filter logic
  const filteredExams = exams.filter((exam) => {
    const matchesSearch =
      exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.subject.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedTab === 'retests') {
      return authorizedRetestExamIds.includes(exam.id);
    }
    if (selectedTab === 'available') {
      const isAuthorized = authorizedRetestExamIds.includes(exam.id);
      const isUncompletedAvailable = (exam.status === 'Available' || exam.isPublished) && !completedExamIds.includes(exam.id);
      return isAuthorized || isUncompletedAvailable;
    }
    if (selectedTab === 'upcoming') {
      return exam.status === 'Upcoming';
    }
    if (selectedTab === 'completed') {
      return completedExamIds.includes(exam.id);
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-[#06264A] border-t-[#F5A623] rounded-full animate-spin"></div>
        <p className="mt-3 text-xs font-semibold text-slate-500">Loading university examinations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#06264A]">My Examinations</h1>
          <p className="text-xs text-slate-500 mt-1">
            Registered examination schedule for C. V. Raman Global University
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search exam or subject code..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-[#06264A] focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-bold">
        {[
          { id: 'all', label: 'All Exams', count: exams.length },
          { id: 'available', label: 'Available Now', count: exams.filter(e => (!completedExamIds.includes(e.id) && e.status === 'Available') || authorizedRetestExamIds.includes(e.id)).length },
          { id: 'retests', label: 'Retests Authorized', count: authorizedRetestExamIds.length },
          { id: 'upcoming', label: 'Upcoming', count: exams.filter(e => e.status === 'Upcoming').length },
          { id: 'completed', label: 'Completed', count: completedExamIds.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id)}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
              selectedTab === tab.id
                ? 'bg-[#06264A] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
              selectedTab === tab.id ? 'bg-[#F5A623] text-[#031A33]' : 'bg-slate-200 text-slate-700'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Grid of Exam Cards */}
      {filteredExams.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          <BookOpen className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-700">No Examinations Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `No examinations matched "${searchQuery}". Try searching with a different term.`
              : 'There are no examinations under this category at the moment.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.map((exam) => (
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
  );
};

export default MyExams;
