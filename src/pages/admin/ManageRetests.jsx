import React, { useState, useEffect, useCallback } from 'react';
import { retestService } from '../../services/retestService';
import { examService } from '../../services/examService';
import { UNIVERSITY_INFO } from '../../utils/constants';
import {
  ShieldAlert,
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  PlusCircle,
  FileText,
  X,
  Check,
  UserCheck
} from 'lucide-react';

export const ManageRetests = () => {
  const [retests, setRetests] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // All, Pending, Approved, Rejected

  // Modals
  const [activeApproval, setActiveApproval] = useState(null); // Retest item to approve
  const [activeRejection, setActiveRejection] = useState(null); // Retest item to reject
  const [isGrantModalOpen, setIsGrantModalOpen] = useState(false); // Proactive grant modal

  // Approval Form State
  const [scheduledWindow, setScheduledWindow] = useState('Next 72 Hours (Campus Terminals)');
  const [approvalRemarks, setApprovalRemarks] = useState('Authorized upon verification of workstation incident telemetry.');
  const [attemptAllowed, setAttemptAllowed] = useState(2);
  const [actionLoading, setActionLoading] = useState(false);

  // Rejection Form State
  const [rejectionRemarks, setRejectionRemarks] = useState('');

  // Proactive Grant Form State
  const [grantExamId, setGrantExamId] = useState('');
  const [grantStudentRoll, setGrantStudentRoll] = useState('');
  const [grantStudentName, setGrantStudentName] = useState('');
  const [grantStudentEmail, setGrantStudentEmail] = useState('');
  const [grantDepartment, setGrantDepartment] = useState('Computer Science & Engineering');
  const [grantReason, setGrantReason] = useState('Campus lab workstation power outage during active section');
  const [grantWindow, setGrantWindow] = useState('Next 48 Hours');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [retestData, examData] = await Promise.all([
        retestService.getRetestRequests(),
        examService.getExams()
      ]);
      setRetests(retestData);
      setExams(examData);
      if (examData.length > 0) {
        setGrantExamId(examData[0].id);
      }
    } catch (err) {
      console.error('Failed to load retest records:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleApprove = async () => {
    if (!activeApproval) return;
    setActionLoading(true);
    try {
      await retestService.approveRetest(activeApproval.id, {
        scheduledWindow,
        remarks: approvalRemarks,
        attemptAllowed: Number(attemptAllowed)
      });
      setActiveApproval(null);
      await loadData();
    } catch (err) {
      alert(`Approval error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!activeRejection) return;
    if (!rejectionRemarks.trim()) {
      alert('Please provide reason for rejection.');
      return;
    }
    setActionLoading(true);
    try {
      await retestService.rejectRetest(activeRejection.id, rejectionRemarks);
      setActiveRejection(null);
      setRejectionRemarks('');
      await loadData();
    } catch (err) {
      alert(`Rejection error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateGrant = async (e) => {
    e.preventDefault();
    if (!grantStudentEmail.endsWith('@cgu-odisha.ac.in')) {
      alert('Student email must end with @cgu-odisha.ac.in');
      return;
    }

    const selectedExam = exams.find(ex => ex.id === Number(grantExamId));
    if (!selectedExam) return;

    setActionLoading(true);
    try {
      await retestService.grantProactiveRetest({
        examId: selectedExam.id,
        examTitle: selectedExam.title,
        examCode: selectedExam.code,
        studentName: grantStudentName || `Candidate ${grantStudentRoll || 'XXX XXXXXXX'}`,
        studentEmail: grantStudentEmail,
        rollNumber: grantStudentRoll || 'XXX XXXXXXX',
        department: grantDepartment,
        reason: grantReason,
        scheduledWindow: grantWindow,
        attemptAllowed: 2
      });

      setIsGrantModalOpen(false);
      // Reset
      setGrantStudentRoll('');
      setGrantStudentName('');
      setGrantStudentEmail('');
      await loadData();
    } catch (err) {
      alert(`Failed to grant retest: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredRetests = retests.filter((item) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      item.studentName?.toLowerCase().includes(query) ||
      item.rollNumber?.toLowerCase().includes(query) ||
      item.examTitle?.toLowerCase().includes(query) ||
      item.refCode?.toLowerCase().includes(query);

    if (!matchesSearch) return false;
    if (statusFilter !== 'All' && item.status !== statusFilter) return false;
    return true;
  });

  const pendingCount = retests.filter(r => r.status === 'Pending').length;
  const approvedCount = retests.filter(r => r.status === 'Approved').length;
  const rejectedCount = retests.filter(r => r.status === 'Rejected').length;

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#06264A] border-t-[#F5A623] rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-semibold text-slate-500">Loading Retest Authority Petitions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#F5A623] uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            <span>{UNIVERSITY_INFO.authorityTitle}</span>
          </div>
          <h1 className="text-2xl font-black text-[#06264A] tracking-tight mt-1">
            Retest Authority & Appeals Console
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Sole jurisdiction for reviewing candidate incident petitions, granting Attempt 2 authorizations, and scheduling re-examination windows
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsGrantModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[#06264A] hover:bg-[#0A3B72] text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
        >
          <PlusCircle className="w-4 h-4 text-[#F5A623]" />
          <span>Issue Proactive Retest Grant</span>
        </button>
      </div>

      {/* Authority Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-academic">
          <span className="text-[11px] font-bold uppercase text-slate-500 block">Pending COE Review</span>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 mt-1 flex items-center justify-between">
            <span>{pendingCount}</span>
            <Clock className="w-5 h-5 text-amber-400 opacity-60" />
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Awaiting verification</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-academic">
          <span className="text-[11px] font-bold uppercase text-slate-500 block">Authorized Retests</span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1 flex items-center justify-between">
            <span>{approvedCount}</span>
            <ShieldCheck className="w-5 h-5 text-emerald-400 opacity-60" />
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Granted Attempt 2 access</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-academic">
          <span className="text-[11px] font-bold uppercase text-slate-500 block">Rejected Appeals</span>
          <div className="text-2xl sm:text-3xl font-black text-red-600 mt-1 flex items-center justify-between">
            <span>{rejectedCount}</span>
            <XCircle className="w-5 h-5 text-red-400 opacity-60" />
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Grounds unsubstantiated</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-academic">
          <span className="text-[11px] font-bold uppercase text-slate-500 block">Total Appeals Logged</span>
          <div className="text-2xl sm:text-3xl font-black text-[#06264A] mt-1 flex items-center justify-between">
            <span>{retests.length}</span>
            <FileText className="w-5 h-5 text-[#06264A] opacity-60" />
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Audited in repository</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidate name, roll no, exam, or COE ref code..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#06264A]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white font-medium"
          >
            <option value="All">All Statuses ({retests.length})</option>
            <option value="Pending">Pending Review ({pendingCount})</option>
            <option value="Approved">Approved / Authorized ({approvedCount})</option>
            <option value="Rejected">Rejected ({rejectedCount})</option>
          </select>
        </div>
      </div>

      {/* Petitions Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-academic">
        {filteredRetests.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-700 text-sm">No Retest Petitions Found</h3>
            <p className="text-xs text-slate-400 mt-1">
              No student records match the active search or filter criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F7FA] text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-4 px-6">Candidate Details</th>
                  <th className="py-4 px-6">Examination</th>
                  <th className="py-4 px-6">Reported Grounds / Incident</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6">Official Ref Code & Window</th>
                  <th className="py-4 px-6 text-right">COE Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRetests.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Candidate */}
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900 text-xs">
                        {item.studentName}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {item.rollNumber} • {item.department}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {item.studentEmail}
                      </div>
                    </td>

                    {/* Examination */}
                    <td className="py-4 px-6">
                      <div className="font-bold text-[#06264A] text-xs">
                        {item.examTitle}
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        {item.examCode}
                      </span>
                    </td>

                    {/* Reported Grounds */}
                    <td className="py-4 px-6 max-w-xs">
                      <p className="text-slate-700 text-[11px] leading-relaxed line-clamp-2" title={item.reason}>
                        {item.reason}
                      </p>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Logged: {new Date(item.createdAt).toLocaleString()}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                          item.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'Rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.status === 'Approved' && <CheckCircle2 className="w-3 h-3" />}
                        {item.status === 'Rejected' && <XCircle className="w-3 h-3" />}
                        {item.status === 'Pending' && <Clock className="w-3 h-3" />}
                        {item.status}
                      </span>
                    </td>

                    {/* Ref Code & Window */}
                    <td className="py-4 px-6">
                      <div className="font-mono text-[11px] font-bold text-slate-800">
                        {item.refCode || 'COE/CVRGU/PENDING'}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Window: {item.scheduledWindow || 'Pending Schedule'}
                      </div>
                      {item.remarks && (
                        <div className="text-[10px] text-slate-400 italic truncate max-w-[200px]" title={item.remarks}>
                          Remarks: {item.remarks}
                        </div>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-4 px-6 text-right">
                      {item.status === 'Pending' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveApproval(item);
                              setScheduledWindow('Next 72 Hours (Campus Terminals)');
                              setApprovalRemarks('Authorized upon verification of workstation incident telemetry.');
                              setAttemptAllowed(2);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs"
                          >
                            <Check className="w-3 h-3" />
                            <span>Approve</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveRejection(item);
                              setRejectionRemarks('');
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 font-bold text-[11px] flex items-center gap-1"
                          >
                            <X className="w-3 h-3" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium">
                          Adjudicated
                        </span>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* APPROVAL MODAL */}
      {activeApproval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-[#06264A] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-[#F5A623]" />
                <div>
                  <h3 className="font-bold text-sm">Authorize Examination Retest</h3>
                  <p className="text-[11px] text-slate-300">Office of the Controller of Examinations</p>
                </div>
              </div>
              <button
                onClick={() => setActiveApproval(null)}
                className="text-slate-300 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
                <div className="font-bold text-[#06264A]">{activeApproval.examTitle} ({activeApproval.examCode})</div>
                <div className="text-slate-700 text-[11px]">
                  Candidate: <strong>{activeApproval.studentName}</strong> ({activeApproval.rollNumber})
                </div>
                <div className="text-slate-500 text-[11px]">
                  Grounds: <em>"{activeApproval.reason}"</em>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Permitted Scheduled Window *
                </label>
                <input
                  type="text"
                  value={scheduledWindow}
                  onChange={(e) => setScheduledWindow(e.target.value)}
                  placeholder="e.g. Next 48 Hours / 24 Sep 2026 10:00 AM - 12:00 PM"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:border-[#06264A]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Total Allowed Attempts *
                </label>
                <select
                  value={attemptAllowed}
                  onChange={(e) => setAttemptAllowed(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white"
                >
                  <option value={2}>Attempt 2 (Default Retest)</option>
                  <option value={3}>Attempt 3 (Special COE Exemption)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  COE Adjudication Remarks & Justification *
                </label>
                <textarea
                  value={approvalRemarks}
                  onChange={(e) => setApprovalRemarks(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:border-[#06264A]"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">
                  Will generate official ref: COE/CVRGU/RET-2026/...
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveApproval(null)}
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleApprove}
                    disabled={actionLoading}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    {actionLoading ? 'Authorizing...' : 'Issue Authorization'}
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* REJECTION MODAL */}
      {activeRejection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-red-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <XCircle className="w-5 h-5 text-red-300" />
                <div>
                  <h3 className="font-bold text-sm">Reject Retest Petition</h3>
                  <p className="text-[11px] text-red-200">Office of the Controller of Examinations</p>
                </div>
              </div>
              <button
                onClick={() => setActiveRejection(null)}
                className="text-slate-300 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-slate-600">
                You are rejecting the appeal of <strong>{activeRejection.studentName}</strong> ({activeRejection.rollNumber}) for <strong>{activeRejection.examTitle}</strong>.
              </p>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Reason for Rejection *
                </label>
                <textarea
                  value={rejectionRemarks}
                  onChange={(e) => setRejectionRemarks(e.target.value)}
                  rows={3}
                  placeholder="e.g. Workstation telemetry indicates no network loss. Telemetry shows intentional window minimizations."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:border-red-500"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveRejection(null)}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-1.5 shadow-sm"
                >
                  {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* PROACTIVE GRANT MODAL */}
      {isGrantModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-[#06264A] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <UserCheck className="w-5 h-5 text-[#F5A623]" />
                <div>
                  <h3 className="font-bold text-sm">Issue Administrative Retest Grant</h3>
                  <p className="text-[11px] text-slate-300">Dispensation for terminal failure or batch technical incident</p>
                </div>
              </div>
              <button
                onClick={() => setIsGrantModalOpen(false)}
                className="text-slate-300 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGrant} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Examination *
                </label>
                <select
                  value={grantExamId}
                  onChange={(e) => setGrantExamId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white"
                  required
                >
                  {exams.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.code} - {ex.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Candidate Roll Number *
                  </label>
                  <input
                    type="text"
                    value={grantStudentRoll}
                    onChange={(e) => setGrantStudentRoll(e.target.value)}
                    placeholder="e.g. XXX XXXXXXX"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Candidate Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={grantStudentName}
                    onChange={(e) => setGrantStudentName(e.target.value)}
                    placeholder="e.g. Student Name"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Official University Email (@cgu-odisha.ac.in) *
                </label>
                <input
                  type="email"
                  value={grantStudentEmail}
                  onChange={(e) => setGrantStudentEmail(e.target.value)}
                  placeholder="e.g. XXX@cgu-odisha.ac.in"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={grantDepartment}
                    onChange={(e) => setGrantDepartment(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Scheduled Window *
                  </label>
                  <input
                    type="text"
                    value={grantWindow}
                    onChange={(e) => setGrantWindow(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Administrative Dispensation Reason *
                </label>
                <textarea
                  value={grantReason}
                  onChange={(e) => setGrantReason(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsGrantModalOpen(false)}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-[#06264A] hover:bg-[#0A3B72] text-white font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <ShieldCheck className="w-4 h-4 text-[#F5A623]" />
                  <span>{actionLoading ? 'Granting...' : 'Grant Retest Authorization'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManageRetests;
