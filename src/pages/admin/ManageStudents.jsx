import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { userService } from '../../services/userService';
import { DEPARTMENTS } from '../../utils/constants';
import { isCguEmail } from '../../utils/validation';
import { StudentProfileDrawer } from '../../components/admin/StudentProfileDrawer';
import {
  Users, Search, Filter, ShieldCheck, CheckCircle2, XCircle,
  ChevronLeft, ChevronRight, MoreVertical, Eye, UserX, UserCheck,
  AlertTriangle, X, Loader2, RefreshCw
} from 'lucide-react';

// ── Constants ────────────────────────────────────────────────────────────────
const PAGE_SIZES = [25, 50, 100];

const STATUS_OPTIONS = ['All', 'Active', 'Suspended', 'Inactive'];
const ELIGIBILITY_OPTIONS = ['All', 'Eligible', 'Not Eligible', 'Pending Verification', 'Blocked'];

const STATUS_BADGE = {
  Active:    'bg-emerald-100 text-emerald-800',
  Suspended: 'bg-red-100 text-red-800',
  Inactive:  'bg-slate-100 text-slate-600',
};

const ELIGIBILITY_BADGE = {
  Eligible:               'bg-emerald-100 text-emerald-800',
  'Not Eligible':         'bg-red-100 text-red-800',
  'Pending Verification': 'bg-amber-100 text-amber-800',
  Blocked:                'bg-red-200 text-red-900',
};

// ── Skeleton row ─────────────────────────────────────────────────────────────
const SkeletonRow = () => (
  <tr className="animate-pulse">
    {[...Array(8)].map((_, i) => (
      <td key={i} className="py-4 px-4">
        <div className="h-3 bg-slate-200 rounded w-3/4" />
      </td>
    ))}
  </tr>
);

// ── Actions dropdown ──────────────────────────────────────────────────────────
const ActionsMenu = ({ student, onView, onToggleStatus }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
        title="Actions"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-8 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1 text-xs">
          <button
            onClick={() => { onView(student); setOpen(false); }}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-700"
          >
            <Eye className="w-3.5 h-3.5" /> View Profile
          </button>
          <div className="border-t border-slate-100 my-1" />
          <button
            onClick={() => { onToggleStatus(student); setOpen(false); }}
            className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 ${
              student.status === 'Active' ? 'text-red-600' : 'text-emerald-700'
            }`}
          >
            {student.status === 'Active'
              ? <><UserX className="w-3.5 h-3.5" /> Suspend Student</>
              : <><UserCheck className="w-3.5 h-3.5" /> Activate Student</>
            }
          </button>
        </div>
      )}
    </div>
  );
};

// ── Confirm modal ─────────────────────────────────────────────────────────────
const ConfirmStatusModal = ({ student, onConfirm, onCancel, loading }) => {
  const isSuspending = student?.status === 'Active';
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSuspending ? 'bg-red-100' : 'bg-emerald-100'}`}>
            <AlertTriangle className={`w-5 h-5 ${isSuspending ? 'text-red-600' : 'text-emerald-600'}`} />
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            {isSuspending ? 'Suspend Student?' : 'Activate Student?'}
          </h3>
        </div>
        <p className="text-xs text-slate-600">
          {isSuspending
            ? `This will prevent ${student.name} from accessing examination services. You can reactivate at any time.`
            : `This will restore ${student.name}'s access to examination services.`
          }
        </p>
        <p className="text-[10px] font-mono text-slate-400">{student.email}</p>
        <div className="flex gap-2 pt-1">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-2 rounded-xl text-xs font-bold text-white transition-colors flex items-center justify-center gap-1.5 ${
              isSuspending ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {isSuspending ? 'Suspend' : 'Activate'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Filter chip ───────────────────────────────────────────────────────────────
const FilterChip = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-1 bg-[#06264A]/10 text-[#06264A] text-[10px] font-semibold px-2 py-1 rounded-full">
    {label}
    <button onClick={onRemove} className="hover:text-red-600 transition-colors"><X className="w-3 h-3" /></button>
  </span>
);

// ── Main component ────────────────────────────────────────────────────────────
export const ManageStudents = () => {
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & filters
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [eligibilityFilter, setEligibilityFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Modals
  const [confirmStudent, setConfirmStudent] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [drawerStudentId, setDrawerStudentId] = useState(null);

  const searchDebounce = useRef(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getAllStudents();
      setAllStudents(data.filter(s => isCguEmail(s.email)));
    } catch {
      setError('Failed to load student registry. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  // Debounce search
  useEffect(() => {
    clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(searchDebounce.current);
  }, [search]);

  // Reset to page 1 on filter/search change
  useEffect(() => { setPage(1); }, [debouncedSearch, deptFilter, statusFilter, eligibilityFilter]);

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    return allStudents.filter(s => {
      if (q && !(
        s.name?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.rollNumber?.toLowerCase().includes(q) ||
        s.registrationNumber?.toLowerCase().includes(q)
      )) return false;
      if (deptFilter !== 'All' && s.department !== deptFilter) return false;
      if (statusFilter !== 'All' && s.status !== statusFilter) return false;
      if (eligibilityFilter !== 'All' && s.examEligibility !== eligibilityFilter) return false;
      return true;
    });
  }, [allStudents, debouncedSearch, deptFilter, statusFilter, eligibilityFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const activeFilters = [
    deptFilter !== 'All' && { label: `Dept: ${deptFilter}`, clear: () => setDeptFilter('All') },
    statusFilter !== 'All' && { label: `Status: ${statusFilter}`, clear: () => setStatusFilter('All') },
    eligibilityFilter !== 'All' && { label: `Eligibility: ${eligibilityFilter}`, clear: () => setEligibilityFilter('All') },
  ].filter(Boolean);

  const clearAllFilters = () => { setDeptFilter('All'); setStatusFilter('All'); setEligibilityFilter('All'); setSearch(''); };

  const handleToggleStatus = (student) => setConfirmStudent(student);

  const handleConfirmStatus = async () => {
    if (!confirmStudent) return;
    const newStatus = confirmStudent.status === 'Active' ? 'Suspended' : 'Active';
    setConfirmLoading(true);
    try {
      await userService.updateStudentStatus(confirmStudent.id, newStatus);
      setAllStudents(prev => prev.map(s => s.id === confirmStudent.id ? { ...s, status: newStatus } : s));
      setConfirmStudent(null);
    } catch {
      alert('Failed to update student status. Please try again.');
    } finally {
      setConfirmLoading(false);
    }
  };

  // Pagination page numbers
  const pageNumbers = useMemo(() => {
    const pages = [];
    const delta = 1;
    for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) pages.push(i);
    if (pages[0] > 1) { if (pages[0] > 2) pages.unshift('...'); pages.unshift(1); }
    if (pages[pages.length - 1] < totalPages) {
      if (pages[pages.length - 1] < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  }, [page, totalPages]);

  return (
    <div className="space-y-5 pb-16">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#06264A]">Student Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified examination candidates — <code className="font-mono text-[#06264A]">@cgu-odisha.ac.in</code>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            {allStudents.length} Registered
          </span>
          <button onClick={fetchStudents} className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 transition-colors" title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search + Filter bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, roll no., registration no., or email..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#06264A]"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(f => !f)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-semibold transition-colors ${
              activeFilters.length > 0
                ? 'border-[#06264A] bg-[#06264A]/5 text-[#06264A]'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters {activeFilters.length > 0 && `(${activeFilters.length})`}
          </button>
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Department</label>
              <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
                className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#06264A]">
                <option value="All">All Departments</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status</label>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#06264A]">
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Exam Eligibility</label>
              <select value={eligibilityFilter} onChange={e => setEligibilityFilter(e.target.value)}
                className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#06264A]">
                {ELIGIBILITY_OPTIONS.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* Active filter chips */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {activeFilters.map(f => <FilterChip key={f.label} label={f.label} onRemove={f.clear} />)}
            <button onClick={clearAllFilters} className="text-[10px] text-slate-500 underline hover:text-red-600 transition-colors">
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-2">
          <AlertTriangle className="w-8 h-8 text-red-400 mx-auto" />
          <p className="text-xs font-semibold text-red-700">{error}</p>
          <button onClick={fetchStudents} className="text-xs text-[#06264A] underline">Retry</button>
        </div>
      )}

      {/* Table */}
      {!error && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">

          {/* Results summary */}
          <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              {loading ? 'Loading...' : (
                filtered.length === 0
                  ? 'No students found'
                  : `Showing ${Math.min((page - 1) * pageSize + 1, filtered.length)}–${Math.min(page * pageSize, filtered.length)} of ${filtered.length} student${filtered.length !== 1 ? 's' : ''}`
              )}
            </p>
            <select
              value={pageSize}
              onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="text-xs py-1 px-2 rounded-lg border border-slate-200 bg-white focus:outline-none"
            >
              {PAGE_SIZES.map(n => <option key={n} value={n}>{n} per page</option>)}
            </select>
          </div>

          {/* Empty state */}
          {!loading && filtered.length === 0 && (
            <div className="p-12 text-center text-slate-500">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-700 text-sm">No Students Found</h3>
              <p className="text-xs text-slate-400 mt-1">
                {activeFilters.length > 0 || search
                  ? 'No students match your current search or filters.'
                  : 'No registered students in the system.'}
              </p>
              {(activeFilters.length > 0 || search) && (
                <button onClick={clearAllFilters} className="mt-3 text-xs text-[#06264A] underline">Clear Filters</button>
              )}
            </div>
          )}

          {/* Table */}
          {(loading || filtered.length > 0) && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5F7FA] text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Roll No.</th>
                    <th className="py-3 px-4 hidden md:table-cell">Department</th>
                    <th className="py-3 px-4 hidden lg:table-cell">Program</th>
                    <th className="py-3 px-4 hidden lg:table-cell">Batch</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center hidden sm:table-cell">Eligibility</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading
                    ? [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
                    : paginated.map(s => (
                      <tr
                        key={s.id || s.email}
                        className="hover:bg-slate-50 transition-colors cursor-pointer"
                        onClick={() => setDrawerStudentId(s.id)}
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-[#06264A]/10 text-[#06264A] font-black text-sm flex items-center justify-center shrink-0">
                              {s.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800">{s.name}</p>
                              <p className="text-[10px] font-mono text-slate-400">{s.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">{s.rollNumber || '—'}</td>
                        <td className="py-3.5 px-4 text-slate-600 hidden md:table-cell max-w-[160px] truncate">{s.department || '—'}</td>
                        <td className="py-3.5 px-4 text-slate-600 hidden lg:table-cell">{s.program || '—'}</td>
                        <td className="py-3.5 px-4 text-slate-600 hidden lg:table-cell">{s.batch || s.year || '—'}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] ${STATUS_BADGE[s.status] || 'bg-slate-100 text-slate-600'}`}>
                            {s.status === 'Active' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            {s.status || 'Unknown'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center hidden sm:table-cell">
                          <span className={`inline-block px-2 py-0.5 rounded-full font-bold text-[10px] ${ELIGIBILITY_BADGE[s.examEligibility] || 'bg-slate-100 text-slate-600'}`}>
                            {s.examEligibility || 'Unknown'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right" onClick={e => e.stopPropagation()}>
                          <ActionsMenu
                            student={s}
                            onView={st => setDrawerStudentId(st.id)}
                            onToggleStatus={handleToggleStatus}
                          />
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && filtered.length > pageSize && (
            <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Previous
              </button>
              <div className="flex items-center gap-1">
                {pageNumbers.map((n, i) =>
                  n === '...'
                    ? <span key={`ellipsis-${i}`} className="px-2 text-xs text-slate-400">…</span>
                    : <button
                        key={n}
                        onClick={() => setPage(n)}
                        className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
                          page === n
                            ? 'bg-[#06264A] text-white'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >{n}</button>
                )}
              </div>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Confirm status modal */}
      {confirmStudent && (
        <ConfirmStatusModal
          student={confirmStudent}
          onConfirm={handleConfirmStatus}
          onCancel={() => setConfirmStudent(null)}
          loading={confirmLoading}
        />
      )}

      {/* Student profile drawer */}
      {drawerStudentId && (
        <StudentProfileDrawer
          studentId={drawerStudentId}
          onClose={() => setDrawerStudentId(null)}
        />
      )}
    </div>
  );
};

export default ManageStudents;
