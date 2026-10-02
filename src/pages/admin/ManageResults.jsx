import React, { useState, useEffect, useCallback } from 'react';
import { resultService } from '../../services/resultService';
import {
  Award,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  X
} from 'lucide-react';

export const ManageResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [activeModalResult, setActiveModalResult] = useState(null);

  const fetchResults = useCallback(async () => {
    try {
      const data = await resultService.getAllResults();
      setResults(data);
    } catch (err) {
      console.error('Failed to load results:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const filteredResults = results.filter((res) => {
    const matchesSearch =
      res.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.rollNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.examTitle?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter !== 'All' && res.status !== statusFilter) return false;

    return true;
  });

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#06264A] border-t-[#F5A623] rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-semibold text-slate-500">Loading university examination ledger...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#06264A]">Institutional Result Ledger</h1>
          <p className="text-xs text-slate-500 mt-1">
            Official records, auto-graded marks, and proctoring integrity audit logs
          </p>
        </div>

        <div className="text-xs bg-slate-100 font-bold px-3 py-1.5 rounded-xl text-slate-700">
          {filteredResults.length} Submissions Logged
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidate name, roll no, or exam..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#06264A]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white"
          >
            <option value="All">All Grades</option>
            <option value="PASS">Passed Candidates</option>
            <option value="FAIL">Failed Candidates</option>
          </select>
        </div>
      </div>

      {/* Results Table (Section 29 requirement) */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-academic">
        {filteredResults.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-700 text-sm">No Results Found</h3>
            <p className="text-xs text-slate-400 mt-1">Try modifying your search or grade filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F7FA] text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-4 px-6">Candidate</th>
                  <th className="py-4 px-6">Roll Number</th>
                  <th className="py-4 px-6">Examination</th>
                  <th className="py-4 px-6 text-center">Attempt</th>
                  <th className="py-4 px-6 text-center">Score</th>
                  <th className="py-4 px-6 text-center">Percentage</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-center">Violations</th>
                  <th className="py-4 px-6 text-right">Submitted At</th>
                  <th className="py-4 px-6 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredResults.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6">
                      <span className="font-bold text-slate-900 block">{res.studentName}</span>
                      <span className="text-[11px] text-slate-400 font-mono">{res.studentEmail}</span>
                    </td>
                    <td className="py-4 px-6 font-mono font-bold text-slate-700">
                      {res.rollNumber}
                    </td>
                    <td className="py-4 px-6 font-semibold text-[#06264A]">
                      {res.examTitle}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold text-[10px] ${
                        res.attemptNumber > 1 || res.isRetest ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {res.attemptNumber > 1 || res.isRetest ? `Attempt ${res.attemptNumber || 2}` : 'Attempt 1'}
                      </span>
                      {res.retestRefCode && (
                        <span className="block text-[9px] font-mono text-slate-400 mt-0.5 truncate max-w-[90px]" title={res.retestRefCode}>
                          {res.retestRefCode}
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
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          res.status === 'PASS'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {res.status === 'PASS' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {res.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        (res.violations || 0) > 0 ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {res.violations || 0} Strikes
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right text-slate-500">
                      {new Date(res.submittedAt).toLocaleString('en-GB', {
                        dateStyle: 'short',
                        timeStyle: 'short'
                      })}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setActiveModalResult(res)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-[#06264A] hover:bg-blue-50"
                        title="View Full Grade Breakdown"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspect Modal */}
      {activeModalResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in max-h-[85vh] flex flex-col">
            <div className="bg-[#06264A] text-white p-5 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-bold text-base">{activeModalResult.examTitle}</h3>
                <p className="text-xs text-slate-300">
                  {activeModalResult.studentName} ({activeModalResult.rollNumber})
                </p>
              </div>
              <button onClick={() => setActiveModalResult(null)} className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs overflow-y-auto">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-slate-50 rounded-xl border">
                  <span className="text-slate-500 uppercase block text-[10px]">Score</span>
                  <span className="text-lg font-bold text-[#06264A]">{activeModalResult.score} / {activeModalResult.totalMarks}</span>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                  <span className="text-blue-700 uppercase block text-[10px]">Percentage</span>
                  <span className="text-lg font-bold text-blue-900">{activeModalResult.percentage}%</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border">
                  <span className="text-slate-500 uppercase block text-[10px]">Violations</span>
                  <span className="text-lg font-bold text-amber-700">{activeModalResult.violations || 0} Strikes</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border space-y-1">
                <p><strong>Attempt Number:</strong> {activeModalResult.attemptNumber || 1} {activeModalResult.isRetest ? `(Retest Authorized • Ref: ${activeModalResult.retestRefCode || 'COE Verified'})` : '(Standard Regular Attempt)'}</p>
                <p><strong>Department:</strong> {activeModalResult.department}</p>
                <p><strong>Official Email:</strong> {activeModalResult.studentEmail}</p>
                <p><strong>Submission Trigger:</strong> {activeModalResult.autoSubmitted ? 'Automatic (Violations/Timer Elapsed)' : 'Manual Candidate Submission'}</p>
                <p><strong>Submitted Timestamp:</strong> {new Date(activeModalResult.submittedAt).toString()}</p>
              </div>

              {/* Section-Wise Scores Breakdown */}
              {activeModalResult.sectionScores && Object.keys(activeModalResult.sectionScores).length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <span className="font-bold text-slate-800 text-xs block uppercase tracking-wider">
                    Section-Wise Performance
                  </span>
                  <div className="space-y-2">
                    {Object.values(activeModalResult.sectionScores).map((sec, i) => (
                      <div key={sec.id || i} className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-900 block text-xs">{sec.title}</span>
                          <span className="text-[10px] text-slate-500">Attempted {sec.attempted}/{sec.totalQuestions} Questions</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-slate-900 block">{sec.score} / {sec.totalMarks} Marks</span>
                          <span className={`text-[10px] font-bold ${sec.percentage >= 40 ? 'text-emerald-700' : 'text-red-700'}`}>
                            {sec.percentage}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setActiveModalResult(null)}
                  className="px-4 py-2 bg-[#06264A] text-white rounded-xl font-bold"
                >
                  Close Inspection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManageResults;
