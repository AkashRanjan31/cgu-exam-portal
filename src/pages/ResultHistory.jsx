import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { resultService } from '../services/resultService';
import { Search, ArrowRight, CheckCircle2, XCircle, FileText } from 'lucide-react';

export const ResultHistory = () => {
  const { user } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All'); // All, Passed, Failed
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const data = await resultService.getResultsByStudentId(user?.id, user?.email);
        setResults(data);
      } catch (err) {
        console.error('Error fetching student results:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [user]);

  const filteredResults = results.filter((res) => {
    const matchesSearch =
      res.examTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.examCode?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterStatus === 'Passed') return res.status === 'PASS';
    if (filterStatus === 'Failed') return res.status === 'FAIL';
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#06264A] border-t-[#F5A623] rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-semibold text-slate-500">Loading academic transcripts...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#06264A]">My Results & Transcripts</h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete record of your C. V. Raman Global University examination evaluations
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search exam or subject code..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-[#06264A] transition-all"
          />
        </div>
      </div>

      {/* Filter Tabs (Section 23 requirement) */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {['All', 'Passed', 'Failed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filterStatus === status
                ? 'bg-[#06264A] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-academic">
        {filteredResults.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-700 text-sm">No Examination Records Found</h3>
            <p className="text-xs text-slate-400 mt-1">
              You haven't completed any examinations under this filter yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F7FA] text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-4 px-6">Examination</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6 text-center">Attempt</th>
                  <th className="py-4 px-6 text-center">Score</th>
                  <th className="py-4 px-6 text-center">Percentage</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredResults.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6">
                      <span className="font-bold text-slate-900 block text-sm">
                        {res.examTitle}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {res.examCode || 'EXAM'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      {new Date(res.submittedAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        res.attemptNumber > 1 || res.isRetest
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {res.attemptNumber > 1 || res.isRetest ? `Attempt ${res.attemptNumber || 2} (Retest)` : 'Attempt 1'}
                      </span>
                      {res.sectionScores && Object.keys(res.sectionScores).length > 0 && (
                        <span className="block text-[10px] text-slate-400 mt-0.5 font-medium">
                          {Object.keys(res.sectionScores).length} Sections
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center font-bold text-slate-800">
                      {res.score} / {res.totalMarks}
                    </td>
                    <td className="py-4 px-6 text-center font-extrabold text-[#06264A]">
                      {res.percentage}%
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[11px] ${
                          res.status === 'PASS'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {res.status === 'PASS' ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        {res.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        to={`/student/results/${res.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-[#06264A] hover:bg-[#06264A] hover:text-white font-bold transition-all"
                      >
                        <span>View Card</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default ResultHistory;
