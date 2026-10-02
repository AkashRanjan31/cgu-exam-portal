import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { resultService } from '../services/resultService';
import { retestService } from '../services/retestService';
import { UNIVERSITY_INFO } from '../utils/constants';
import {
  User, Mail, Hash, Building, BookOpen, Calendar, Phone,
  CheckCircle2, XCircle, AlertTriangle, Loader2, RefreshCw,
  FileText, BarChart2, Lock, ShieldCheck, Clock
} from 'lucide-react';

// ── Constants ─────────────────────────────────────────────────────────────────
const TABS = ['Personal', 'Academic', 'Exam History', 'Results', 'Retests'];

const STATUS_MAP = {
  Active:    { cls: 'bg-emerald-100 text-emerald-800', icon: CheckCircle2 },
  Suspended: { cls: 'bg-red-100 text-red-800',         icon: XCircle },
  Inactive:  { cls: 'bg-slate-100 text-slate-600',     icon: null },
  _default:  { cls: 'bg-slate-100 text-slate-600',     icon: null },
};
const ELIGIBILITY_MAP = {
  Eligible:               { cls: 'bg-emerald-100 text-emerald-800' },
  'Not Eligible':         { cls: 'bg-red-100 text-red-800' },
  'Pending Verification': { cls: 'bg-amber-100 text-amber-800' },
  Blocked:                { cls: 'bg-red-200 text-red-900' },
  _default:               { cls: 'bg-slate-100 text-slate-600' },
};
const RESULT_STATUS_MAP = {
  PASS:     { cls: 'bg-emerald-100 text-emerald-800' },
  FAIL:     { cls: 'bg-red-100 text-red-800' },
  _default: { cls: 'bg-slate-100 text-slate-600' },
};
const RETEST_MAP = {
  Approved: { cls: 'bg-emerald-100 text-emerald-800' },
  Pending:  { cls: 'bg-amber-100 text-amber-800' },
  Rejected: { cls: 'bg-red-100 text-red-800' },
  _default: { cls: 'bg-slate-100 text-slate-600' },
};
const EXAM_STATUS_MAP = {
  PASS:           { cls: 'bg-emerald-100 text-emerald-800' },
  FAIL:           { cls: 'bg-red-100 text-red-800' },
  'Auto Submitted': { cls: 'bg-amber-100 text-amber-800' },
  Absent:         { cls: 'bg-slate-100 text-slate-600' },
  Disqualified:   { cls: 'bg-red-200 text-red-900' },
  _default:       { cls: 'bg-slate-100 text-slate-600' },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : null;
const fmtDT = (iso) =>
  iso ? new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : null;

// ── Shared UI ─────────────────────────────────────────────────────────────────
const Badge = ({ value, map }) => {
  const cfg = map[value] || map._default || { cls: 'bg-slate-100 text-slate-600' };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${cfg.cls}`}>
      {Icon && <Icon className="w-3 h-3" />}{value || '—'}
    </span>
  );
};

// Read-only field — shows "Not provided" when empty
const Field = ({ label, value, mono, full, icon: Icon }) => (
  <div className={full ? 'col-span-2' : ''}>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
    <div className={`flex items-center gap-2 ${value ? 'text-slate-800' : 'text-slate-400'}`}>
      {Icon && <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
      <p className={`text-xs font-semibold break-all ${mono ? 'font-mono' : ''} ${!value ? 'italic font-normal' : ''}`}>
        {value || 'Not provided'}
      </p>
    </div>
  </div>
);

const SectionHeading = ({ children }) => (
  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-2 pb-1 border-b border-slate-100 col-span-2">
    {children}
  </p>
);

// ── Skeleton ──────────────────────────────────────────────────────────────────
const SkeletonHeader = () => (
  <div className="bg-[#06264A] p-6 sm:p-8 animate-pulse">
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-white/20" />
        <div className="space-y-2">
          <div className="h-4 w-40 bg-white/20 rounded" />
          <div className="h-3 w-32 bg-white/10 rounded" />
          <div className="h-3 w-28 bg-white/10 rounded" />
          <div className="flex gap-2 mt-1">
            <div className="h-5 w-16 bg-white/10 rounded-full" />
            <div className="h-5 w-20 bg-white/10 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const SkeletonFields = () => (
  <div className="grid grid-cols-2 gap-x-6 gap-y-5 animate-pulse">
    {[...Array(8)].map((_, i) => (
      <div key={i} className={i === 0 ? 'col-span-2' : ''}>
        <div className="h-2.5 w-20 bg-slate-200 rounded mb-2" />
        <div className="h-4 w-36 bg-slate-100 rounded" />
      </div>
    ))}
  </div>
);

// ── Personal Tab ──────────────────────────────────────────────────────────────
const PersonalTab = ({ student }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
    <SectionHeading>Personal Information</SectionHeading>
    <Field label="Full Name"        value={student.name}               icon={User} />
    <Field label="Roll Number"      value={student.rollNumber}         icon={Hash} mono />
    <Field label="Registration No." value={student.registrationNumber} icon={Hash} mono />

    <SectionHeading>Contact Information</SectionHeading>
    <div className="col-span-2">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">University Email</p>
      <div className="flex items-center gap-2">
        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <p className="text-xs font-mono font-semibold text-slate-800 break-all min-w-0">{student.email}</p>
        <Lock className="w-3 h-3 text-slate-300 shrink-0" title="Protected — cannot be changed" />
      </div>
    </div>
    <Field label="Alternate Email" value={student.alternateEmail} icon={Mail} />
    <Field label="Mobile Number"   value={student.mobile}         icon={Phone} />

    <SectionHeading>Personal Details</SectionHeading>
    <Field label="Date of Birth" value={fmt(student.dateOfBirth)} icon={Calendar} />
    <Field label="Gender"        value={student.gender} />

    <SectionHeading>Account Information</SectionHeading>
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Account Status</p>
      <Badge value={student.status || 'Active'} map={STATUS_MAP} />
    </div>
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Exam Eligibility</p>
      <Badge value={student.examEligibility || 'Eligible'} map={ELIGIBILITY_MAP} />
    </div>
    <Field label="Enrolled Since" value={fmt(student.registeredDate || student.createdAt)} icon={Calendar} />
    <Field label="Last Login"     value={fmtDT(student.lastLoginAt)} icon={Clock} />
  </div>
);

// ── Academic Tab ──────────────────────────────────────────────────────────────
const AcademicTab = ({ student }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
    <SectionHeading>Program Details</SectionHeading>
    <Field label="Program"        value={student.program}        icon={BookOpen} />
    <Field label="Department"     value={student.department}     icon={Building} />
    <Field label="Specialization" value={student.specialization} />
    <Field label="Batch"          value={student.batch || student.year} icon={Calendar} />
    <Field label="Admission Year" value={student.admissionYear} />

    <SectionHeading>Current Standing</SectionHeading>
    <Field label="Current Semester"   value={student.semester} />
    <Field label="Section"            value={student.section} />
    <Field label="Enrollment Status"  value={student.enrollmentStatus || student.status} />
    <Field label="Academic Status"    value={student.academicStatus} />

    <SectionHeading>Institution</SectionHeading>
    <Field label="University" value={UNIVERSITY_INFO.name}     icon={Building} full />
    <Field label="Location"   value={UNIVERSITY_INFO.location} full />
  </div>
);

// ── Exam History Tab ──────────────────────────────────────────────────────────
const ExamHistoryTab = ({ results }) => {
  if (!results?.length) {
    return (
      <div className="text-center py-16 text-slate-400">
        <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300" />
        <p className="text-xs font-semibold">No examination history found.</p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500 flex items-center gap-2">
        <BarChart2 className="w-4 h-4" />
        {results.length} examination record{results.length !== 1 ? 's' : ''} on file
      </p>
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F5F7FA] text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Examination</th>
              <th className="py-3 px-4 hidden sm:table-cell">Date</th>
              <th className="py-3 px-4 text-center">Attempt</th>
              <th className="py-3 px-4 text-center hidden sm:table-cell">Score</th>
              <th className="py-3 px-4 text-center">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {results.map(r => (
              <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-3 px-4">
                  <p className="font-bold text-slate-800">{r.examTitle}</p>
                  <p className="text-[10px] font-mono text-slate-400">{r.examCode}</p>
                  {r.autoSubmitted && (
                    <p className="text-[10px] text-amber-600 font-semibold mt-0.5">Auto-submitted</p>
                  )}
                  {r.violations > 0 && (
                    <p className="text-[10px] text-red-500 flex items-center gap-1 mt-0.5">
                      <AlertTriangle className="w-3 h-3" />{r.violations} violation{r.violations > 1 ? 's' : ''}
                    </p>
                  )}
                </td>
                <td className="py-3 px-4 text-slate-600 hidden sm:table-cell">{fmt(r.submittedAt)}</td>
                <td className="py-3 px-4 text-center">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    r.attemptNumber > 1 ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    Attempt {r.attemptNumber || 1}{r.isRetest ? ' (Retest)' : ''}
                  </span>
                </td>
                <td className="py-3 px-4 text-center font-semibold text-slate-700 hidden sm:table-cell">
                  {r.score}/{r.totalMarks}
                </td>
                <td className="py-3 px-4 text-center">
                  <Badge value={r.status} map={EXAM_STATUS_MAP} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ── Results Tab ───────────────────────────────────────────────────────────────
const ResultsTab = ({ results }) => {
  if (!results?.length) {
    return (
      <div className="text-center py-16 text-slate-400">
        <BarChart2 className="w-10 h-10 mx-auto mb-2 text-slate-300" />
        <p className="text-xs font-semibold">No results available.</p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {results.map(r => (
        <div key={r.id} className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="bg-slate-50 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">{r.examTitle}</p>
              <p className="text-[10px] text-slate-500">
                {fmt(r.submittedAt)} · Attempt {r.attemptNumber || 1}{r.isRetest ? ' (Retest)' : ''}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-bold text-[#06264A]">
                {r.score}/{r.totalMarks} ({r.percentage}%)
              </span>
              <Badge value={r.status} map={RESULT_STATUS_MAP} />
            </div>
          </div>
          <div className="px-4 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[10px] text-slate-600 border-b border-slate-100">
            <div><span className="font-bold block text-slate-400 uppercase tracking-wider mb-0.5">Total Marks</span>{r.totalMarks}</div>
            <div><span className="font-bold block text-slate-400 uppercase tracking-wider mb-0.5">Obtained</span>{r.score}</div>
            <div><span className="font-bold block text-slate-400 uppercase tracking-wider mb-0.5">Percentage</span>{r.percentage}%</div>
            <div><span className="font-bold block text-slate-400 uppercase tracking-wider mb-0.5">Passing Marks</span>{r.passingMarks}</div>
          </div>
          {r.sectionScores && Object.keys(r.sectionScores).length > 0 && (
            <div className="px-4 py-3 space-y-1.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Section-wise Performance</p>
              {Object.values(r.sectionScores).map(sec => (
                <div key={sec.id || sec.title} className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 truncate max-w-[65%]">{sec.title || sec.name}</span>
                  <span className="font-semibold text-slate-800 shrink-0">{sec.score}/{sec.totalMarks} ({sec.percentage}%)</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// ── Retests Tab ───────────────────────────────────────────────────────────────
const RetestsTab = ({ retests }) => {
  const hasActive = retests?.some(r => r.status === 'Approved');
  if (!retests?.length) {
    return (
      <div className="text-center py-16 text-slate-400">
        <RefreshCw className="w-10 h-10 mx-auto mb-2 text-slate-300" />
        <p className="text-xs font-semibold">No retest petitions on record.</p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {hasActive && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          You have an active retest authorization. Check the approved petition below for details.
        </div>
      )}
      {retests.map(rt => (
        <div key={rt.id} className="border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">{rt.examTitle}</p>
              <p className="text-[10px] font-mono text-slate-500">{rt.refCode}</p>
            </div>
            <Badge value={rt.status} map={RETEST_MAP} />
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600">
            <div><span className="font-bold">Request Date:</span> {fmt(rt.createdAt)}</div>
            <div><span className="font-bold">Attempt Allowed:</span> {rt.attemptAllowed || '—'}</div>
            {rt.status === 'Approved' && rt.scheduledWindow && rt.scheduledWindow !== 'Pending COE Scheduling' && (
              <div className="col-span-2"><span className="font-bold">Validity Window:</span> {rt.scheduledWindow}</div>
            )}
            {rt.approvedBy && rt.approvedBy !== 'Pending COE Review' && (
              <div className="col-span-2"><span className="font-bold">Authorized by:</span> {rt.approvedBy}</div>
            )}
          </div>
          <div className="bg-slate-50 rounded-lg p-2.5 text-[10px] text-slate-600">
            <span className="font-bold">Reason: </span>{rt.reason}
          </div>
          {rt.remarks && (
            <p className="text-[10px] text-slate-500 italic">
              <span className="font-bold not-italic text-slate-600">COE Remarks: </span>{rt.remarks}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

// ── Main Profile Page ─────────────────────────────────────────────────────────
export const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile]   = useState(null);
  const [results, setResults]   = useState([]);
  const [retests, setRetests]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [tab, setTab]           = useState('Personal');

  const load = useCallback(async () => {
    if (!user?.id && !user?.email) return;
    setLoading(true);
    setError(null);
    try {
      const [profileData, resultsData, retestsData] = await Promise.all([
        userService.getStudentDetail(user.id || user.email),
        resultService.getResultsByStudentId(user.id, user.email),
        retestService.getStudentRetests(user.id, user.email),
      ]);
      setProfile(profileData);
      setResults(resultsData.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)));
      setRetests(retestsData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      setError('Unable to load student profile. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  // ── Error state ──
  if (!loading && error) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-12 text-center space-y-3">
          <AlertTriangle className="w-10 h-10 text-red-400 mx-auto" />
          <p className="text-sm font-bold text-slate-700">Unable to load student profile.</p>
          <p className="text-xs text-slate-500">{error}</p>
          <button
            onClick={load}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#06264A] text-white text-xs font-bold hover:bg-[#031A33] transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      </div>
    );
  }

  const displayStudent = profile || user;

  return (
    <div className="max-w-3xl mx-auto space-y-0 pb-16">

      {/* ── Profile Card ── */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

        {/* Header */}
        {loading ? (
          <SkeletonHeader />
        ) : (
          <div className="bg-[#06264A] px-6 py-6 sm:px-8 sm:py-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/10 border-2 border-[#F5A623] flex items-center justify-center text-white font-black text-2xl shrink-0">
                  {displayStudent?.name?.charAt(0)?.toUpperCase() || <User className="w-6 h-6" />}
                </div>
                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg font-bold text-white truncate">
                    {displayStudent?.name || 'Student Name'}
                  </h2>
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-0.5">
                    {displayStudent?.registrationNumber && (
                      <p className="text-[11px] text-slate-300 font-mono">
                        Reg: {displayStudent.registrationNumber}
                      </p>
                    )}
                    {displayStudent?.rollNumber && (
                      <p className="text-[11px] text-[#F5A623] font-mono">
                        Roll: {displayStudent.rollNumber}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge value={displayStudent?.status || 'Active'} map={STATUS_MAP} />
                    <Badge value={displayStudent?.examEligibility || 'Eligible'} map={ELIGIBILITY_MAP} />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-1.5 rounded-xl shrink-0">
                <ShieldCheck className="w-4 h-4 text-[#F5A623]" />
                <span className="text-[11px] text-white font-semibold">Verified Student</span>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-slate-200 overflow-x-auto bg-white">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
                tab === t
                  ? 'border-[#06264A] text-[#06264A]'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab Body */}
        <div className="p-6 sm:p-8">
          {loading ? (
            <SkeletonFields />
          ) : (
            <>
              {tab === 'Personal'     && <PersonalTab     student={displayStudent} />}
              {tab === 'Academic'     && <AcademicTab     student={displayStudent} />}
              {tab === 'Exam History' && <ExamHistoryTab  results={results} />}
              {tab === 'Results'      && <ResultsTab      results={results} />}
              {tab === 'Retests'      && <RetestsTab      retests={retests} />}
            </>
          )}
        </div>

        {/* Footer note */}
        {!loading && (
          <div className="px-6 sm:px-8 py-4 border-t border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3 h-3" />
              Profile modifications require administrator authorization.
            </span>
            <span>{UNIVERSITY_INFO.name} · {UNIVERSITY_INFO.location}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
