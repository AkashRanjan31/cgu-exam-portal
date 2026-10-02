import React, { useState, useEffect, useCallback } from 'react';
import { userService } from '../../services/userService';
import { DEPARTMENTS } from '../../utils/constants';
import { ResetPasswordModal } from './ResetPasswordModal';
import {
  X, User, AlertTriangle, CheckCircle2, XCircle, RefreshCw,
  FileText, BarChart2, Loader2, Lock, Pencil, Save, KeyRound,
  Eye, EyeOff, ShieldAlert, Copy, Wand2
} from 'lucide-react';

const TABS = ['Personal', 'Academic', 'Exam History', 'Results', 'Retests', 'Security'];

const PROGRAMS = ['B.Tech', 'M.Tech', 'MBA', 'MCA', 'BCA', 'B.Sc', 'M.Sc', 'Ph.D'];
const SEMESTERS = ['1st Semester', '2nd Semester', '3rd Semester', '4th Semester',
  '5th Semester', '6th Semester', '7th Semester', '8th Semester'];
const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'];
const ENROLLMENT_STATUSES = ['Enrolled', 'On Leave', 'Withdrawn', 'Graduated', 'Suspended'];
const ACADEMIC_STATUSES = ['Regular', 'Detained', 'Backlog', 'Lateral Entry'];

// ── Shared badge maps ─────────────────────────────────────────────────────────
const STATUS_MAP = {
  Active:    { cls: 'bg-emerald-100 text-emerald-800', icon: CheckCircle2 },
  Suspended: { cls: 'bg-red-100 text-red-800',         icon: XCircle },
  Inactive:  { cls: 'bg-slate-100 text-slate-600',     icon: null },
  _default:  { cls: 'bg-slate-100 text-slate-600' },
};
const ELIGIBILITY_MAP = {
  Eligible:               { cls: 'bg-emerald-100 text-emerald-800' },
  'Not Eligible':         { cls: 'bg-red-100 text-red-800' },
  'Pending Verification': { cls: 'bg-amber-100 text-amber-800' },
  Blocked:                { cls: 'bg-red-200 text-red-900' },
  _default:               { cls: 'bg-slate-100 text-slate-600' },
};
const RESULT_MAP = {
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
const Field = ({ label, value, mono, full }) => (
  <div className={full ? 'col-span-2' : ''}>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
    <p className={`text-xs font-semibold break-all ${mono ? 'font-mono' : ''} ${value ? 'text-slate-800' : 'text-slate-400 font-normal italic'}`}>
      {value || 'Not provided'}
    </p>
  </div>
);

const SectionHeading = ({ children }) => (
  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-2 pb-1 border-b border-slate-100 col-span-2">
    {children}
  </p>
);

const fmt  = (iso) => iso ? new Date(iso).toLocaleDateString('en-IN',  { day: '2-digit', month: 'short', year: 'numeric' }) : null;
const fmtDT = (iso) => iso ? new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : null;

// ── Validation helpers ────────────────────────────────────────────────────────
const validate = (form) => {
  const errs = {};
  if (!form.name?.trim()) errs.name = 'Full name is required.';
  if (form.alternateEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.alternateEmail))
    errs.alternateEmail = 'Enter a valid email address.';
  if (form.mobile && !/^[6-9]\d{9}$/.test(form.mobile.replace(/\s/g, '')))
    errs.mobile = 'Enter a valid 10-digit Indian mobile number.';
  if (form.dateOfBirth) {
    const d = new Date(form.dateOfBirth);
    if (isNaN(d.getTime())) errs.dateOfBirth = 'Enter a valid date.';
    else if (d > new Date()) errs.dateOfBirth = 'Date of birth cannot be in the future.';
  }
  return errs;
};

// ── Password Management Tab ──────────────────────────────────────────────────
const CHAR_SET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$!';
const genPassword = () =>
  Array.from({ length: 14 }, () => CHAR_SET[Math.floor(Math.random() * CHAR_SET.length)]).join('');

const pwStrength = (pw) => {
  if (!pw) return null;
  let score = 0;
  if (pw.length >= 8)  score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/\d/.test(pw))    score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 2) return { label: 'Weak',   cls: 'bg-red-500',    w: 'w-1/4' };
  if (score <= 4) return { label: 'Fair',   cls: 'bg-amber-400',  w: 'w-2/4' };
  if (score <= 5) return { label: 'Good',   cls: 'bg-blue-500',   w: 'w-3/4' };
  return              { label: 'Strong', cls: 'bg-emerald-500', w: 'w-full' };
};

const PasswordManagementTab = ({ student, onPasswordChanged }) => {
  const [newPw,     setNewPw]     = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showNew,   setShowNew]   = useState(false);
  const [showConf,  setShowConf]  = useState(false);
  const [forceChange, setForceChange] = useState(true);
  const [errors,    setErrors]    = useState({});
  const [confirm,   setConfirm]   = useState(false);  // confirmation dialog
  const [saving,    setSaving]    = useState(false);
  const [done,      setDone]      = useState(null);    // { password?, method }
  const [copied,    setCopied]    = useState(false);
  const [currentPwInfo, setCurrentPwInfo] = useState(false);

  const strength = pwStrength(newPw);

  const handleGenerate = () => {
    const p = genPassword();
    setNewPw(p);
    setConfirmPw(p);
    setShowNew(true);
    setErrors({});
  };

  const validateForm = () => {
    const e = {};
    if (!newPw) { e.newPw = 'New password is required.'; }
    else if (newPw.length < 8) { e.newPw = 'Password must be at least 8 characters.'; }
    else if (!/[A-Z]/.test(newPw)) { e.newPw = 'Password must contain at least one uppercase letter.'; }
    else if (!/\d/.test(newPw)) { e.newPw = 'Password must contain at least one number.'; }
    if (newPw && confirmPw !== newPw) { e.confirmPw = 'Passwords do not match.'; }
    return e;
  };

  const handleSetPassword = () => {
    const e = validateForm();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setConfirm(true);
  };

  const handleConfirm = async () => {
    setSaving(true);
    try {
      await userService.adminResetStudentPassword(student.id, 'temporary_password', {
        password: newPw,
        mustChangePassword: forceChange,
      });
      const wasGenerated = newPw.length === 14; // heuristic for display
      setDone({ password: forceChange || wasGenerated ? newPw : null });
      setConfirm(false);
      setNewPw('');
      setConfirmPw('');
      if (onPasswordChanged) onPasswordChanged();
    } catch (err) {
      setErrors({ _global: err.message || 'Failed to update password. Please try again.' });
      setConfirm(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = () => {
    if (!done?.password) return;
    navigator.clipboard.writeText(done.password).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  const handleDone = () => {
    setDone(null);
    setCopied(false);
  };

  // ── Success state ──
  if (done) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="text-xs font-bold text-emerald-800">Password updated successfully.</p>
            <p className="text-[10px] text-emerald-700 mt-0.5">{student.name} · {student.registrationNumber || student.rollNumber}</p>
          </div>
        </div>

        {done.password && (
          <div className="border-2 border-amber-300 bg-amber-50 rounded-xl p-4 space-y-3">
            <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">New Password — Copy Now</p>
            <div className="flex items-center gap-2">
              <span className={`font-mono text-sm font-bold text-slate-800 flex-1 tracking-widest ${showNew ? '' : 'blur-sm select-none'}`}>
                {done.password}
              </span>
              <button onClick={() => setShowNew(v => !v)}
                className="p-1.5 rounded-lg hover:bg-amber-100 text-amber-700 transition-colors">
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button onClick={handleCopy}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  copied ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-200 text-amber-900 hover:bg-amber-300'
                }`}>
                {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="text-[10px] text-amber-800 font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-3 h-3 shrink-0" />
              This password will not be displayed again after closing.
            </p>
          </div>
        )}

        {forceChange && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-[10px] text-blue-800 flex items-start gap-2">
            <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            Student will be required to set a new password on next login.
          </div>
        )}

        <button onClick={handleDone}
          className="w-full py-2.5 rounded-xl bg-[#06264A] text-white text-xs font-bold hover:bg-[#031A33] transition-colors">
          Done
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* Global error */}
      {errors._global && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />{errors._global}
        </div>
      )}

      {/* Current password — protected */}
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Security &amp; Password</p>
        </div>
        <div className="p-4 space-y-4">

          {/* Current password row */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Current Password
            </label>
            <button
              onClick={() => setCurrentPwInfo(v => !v)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors group"
            >
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-sm tracking-[0.3em] text-slate-400 select-none">••••••••••••••••</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full">Protected</span>
            </button>
            {currentPwInfo && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-xl text-[10px] text-blue-800 flex items-start gap-2">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>Current passwords cannot be viewed. Passwords are securely stored and cannot be retrieved by administrators.</span>
              </div>
            )}
          </div>

          <div className="border-t border-slate-100" />

          {/* New password */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPw}
                onChange={e => { setNewPw(e.target.value); setErrors(v => ({ ...v, newPw: undefined })); }}
                placeholder="Enter or generate a new password"
                className={`w-full text-xs px-3 py-2.5 pr-10 rounded-xl border focus:outline-none focus:border-[#06264A] transition-colors ${
                  errors.newPw ? 'border-red-400 bg-red-50' : 'border-slate-200'
                }`}
              />
              <button onClick={() => setShowNew(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.newPw && <p className="text-[10px] text-red-600 mt-0.5">{errors.newPw}</p>}
            {/* Strength bar */}
            {newPw && strength && (
              <div className="mt-1.5 space-y-0.5">
                <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${strength.cls} ${strength.w}`} />
                </div>
                <p className={`text-[10px] font-semibold ${
                  strength.label === 'Weak' ? 'text-red-600' :
                  strength.label === 'Fair' ? 'text-amber-600' :
                  strength.label === 'Good' ? 'text-blue-600' : 'text-emerald-600'
                }`}>{strength.label} password</p>
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConf ? 'text' : 'password'}
                value={confirmPw}
                onChange={e => { setConfirmPw(e.target.value); setErrors(v => ({ ...v, confirmPw: undefined })); }}
                placeholder="Re-enter the new password"
                className={`w-full text-xs px-3 py-2.5 pr-10 rounded-xl border focus:outline-none focus:border-[#06264A] transition-colors ${
                  errors.confirmPw ? 'border-red-400 bg-red-50' : 'border-slate-200'
                }`}
              />
              <button onClick={() => setShowConf(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showConf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPw && <p className="text-[10px] text-red-600 mt-0.5">{errors.confirmPw}</p>}
            {confirmPw && newPw && confirmPw === newPw && (
              <p className="text-[10px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Passwords match
              </p>
            )}
          </div>

          {/* Generate button */}
          <button onClick={handleGenerate}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border-2 border-dashed border-slate-300 text-xs font-semibold text-slate-600 hover:border-[#06264A] hover:text-[#06264A] transition-colors">
            <Wand2 className="w-3.5 h-3.5" /> Generate Secure Password
          </button>

          {/* Force change toggle */}
          <label className="flex items-center gap-3 cursor-pointer select-none p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors">
            <input
              type="checkbox"
              checked={forceChange}
              onChange={e => setForceChange(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-[#06264A] focus:ring-[#06264A]"
            />
            <div>
              <p className="text-xs font-semibold text-slate-700">Require student to change password at next login</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Recommended when setting a temporary password</p>
            </div>
          </label>

          {/* Set password button */}
          <button onClick={handleSetPassword}
            className="w-full py-2.5 rounded-xl bg-[#06264A] text-white text-xs font-bold hover:bg-[#031A33] transition-colors flex items-center justify-center gap-2">
            <KeyRound className="w-3.5 h-3.5" /> Set New Password
          </button>

        </div>
      </div>

      {/* Password policy reminder */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[10px] text-slate-500 space-y-1">
        <p className="font-bold text-slate-600">Password Requirements</p>
        <ul className="space-y-0.5 list-disc list-inside">
          <li>Minimum 8 characters</li>
          <li>At least one uppercase letter</li>
          <li>At least one number</li>
          <li>Avoid predictable values (name, roll number, date of birth)</li>
        </ul>
      </div>

      {/* Confirmation dialog */}
      {confirm && (
        <div className="fixed inset-0 bg-black/40 z-[80] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-4 h-4 text-red-600" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">Change Student Password?</h4>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Student</span>
                <span className="font-bold text-slate-800">{student.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Registration No.</span>
                <span className="font-mono text-slate-700">{student.registrationNumber || student.rollNumber}</span>
              </div>
            </div>
            <p className="text-xs text-slate-600">
              You are about to replace the student's current password. The previous password will no longer work.
            </p>
            {forceChange && (
              <p className="text-[10px] text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                Student will be required to set a new password on next login.
              </p>
            )}
            <div className="flex gap-2 pt-1">
              <button onClick={() => setConfirm(false)} disabled={saving}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50">
                Cancel
              </button>
              <button onClick={handleConfirm} disabled={saving}
                className="flex-1 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 flex items-center justify-center gap-1.5 disabled:opacity-60">
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {saving ? 'Saving...' : 'Confirm Change'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Edit Profile Modal ────────────────────────────────────────────────────────
const EditProfileModal = ({ student, onSave, onClose }) => {
  const [form, setForm] = useState({
    name:             student.name || '',
    alternateEmail:   student.alternateEmail || '',
    mobile:           student.mobile || '',
    dateOfBirth:      student.dateOfBirth ? student.dateOfBirth.slice(0, 10) : '',
    gender:           student.gender || '',
    department:       student.department || '',
    program:          student.program || '',
    specialization:   student.specialization || '',
    batch:            student.batch || student.year || '',
    admissionYear:    student.admissionYear || '',
    semester:         student.semester || '',
    section:          student.section || '',
    enrollmentStatus: student.enrollmentStatus || '',
    academicStatus:   student.academicStatus || '',
  });
  const [errors, setErrors]   = useState({});
  const [saving, setSaving]   = useState(false);
  const [dirty, setDirty]     = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setDirty(true); setErrors(e => ({ ...e, [k]: undefined })); };

  const handleClose = () => { if (dirty) setConfirmDiscard(true); else onClose(); };

  const handleSave = async () => {
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      const updated = await userService.updateStudentProfile(student.id, form);
      onSave(updated);
    } catch (err) {
      setErrors({ _global: err.message || 'Failed to save. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const Input = ({ field, label, type = 'text', placeholder }) => (
    <div>
      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{label}</label>
      <input
        type={type}
        value={form[field]}
        onChange={e => set(field, e.target.value)}
        placeholder={placeholder}
        className={`w-full text-xs px-3 py-2 rounded-xl border focus:outline-none focus:border-[#06264A] transition-colors ${errors[field] ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
      />
      {errors[field] && <p className="text-[10px] text-red-600 mt-0.5">{errors[field]}</p>}
    </div>
  );

  const Select = ({ field, label, options }) => (
    <div>
      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{label}</label>
      <select
        value={form[field]}
        onChange={e => set(field, e.target.value)}
        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#06264A]"
      >
        <option value="">— Select —</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  const LockedField = ({ label, value }) => (
    <div>
      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
        {label} <Lock className="w-3 h-3 text-slate-400" />
      </label>
      <div className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-mono flex items-center justify-between">
        <span className="truncate">{value || '—'}</span>
        <Lock className="w-3 h-3 text-slate-300 shrink-0 ml-2" />
      </div>
      <p className="text-[10px] text-slate-400 mt-0.5">Protected — contact COE to modify</p>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-start justify-end">
      <div className="relative h-full w-full max-w-xl bg-white shadow-2xl flex flex-col">

        {/* Header */}
        <div className="bg-[#06264A] px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-sm font-bold text-white">Edit Student Profile</h3>
            <p className="text-[11px] text-[#F5A623] font-mono mt-0.5">{student.email}</p>
          </div>
          <button onClick={handleClose} className="text-white/70 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global error */}
        {errors._global && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />{errors._global}
          </div>
        )}

        {/* Form body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* Personal */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 pb-1 border-b border-slate-100">Personal Information</p>
            <div className="space-y-3">
              <Input field="name" label="Full Name *" placeholder="Student full name" />
              <Input field="alternateEmail" label="Alternate Email" type="email" placeholder="personal@example.com" />
              <Input field="mobile" label="Mobile Number" placeholder="10-digit mobile number" />
              <Input field="dateOfBirth" label="Date of Birth" type="date" />
              <Select field="gender" label="Gender" options={GENDERS} />
            </div>
          </div>

          {/* Academic */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 pb-1 border-b border-slate-100">Academic Information</p>
            <div className="space-y-3">
              <Select field="department" label="Department" options={DEPARTMENTS} />
              <Select field="program" label="Program" options={PROGRAMS} />
              <Input field="specialization" label="Specialization" placeholder="e.g. Artificial Intelligence" />
              <Input field="batch" label="Batch" placeholder="e.g. 2023–2027" />
              <Input field="admissionYear" label="Admission Year" placeholder="e.g. 2023" />
              <Select field="semester" label="Current Semester" options={SEMESTERS} />
              <Input field="section" label="Section" placeholder="e.g. A, B, C" />
            </div>
          </div>

          {/* Enrollment */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 pb-1 border-b border-slate-100">Enrollment Information</p>
            <div className="space-y-3">
              <Select field="enrollmentStatus" label="Enrollment Status" options={ENROLLMENT_STATUSES} />
              <Select field="academicStatus" label="Academic Status" options={ACADEMIC_STATUSES} />
            </div>
          </div>

          {/* Protected */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 pb-1 border-b border-slate-100">Protected Identifiers</p>
            <div className="space-y-3">
              <LockedField label="Registration Number" value={student.registrationNumber} />
              <LockedField label="Roll Number" value={student.rollNumber} />
              <LockedField label="University Email" value={student.email} />
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex gap-3 shrink-0 bg-white">
          <button onClick={handleClose} disabled={saving}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-[#06264A] text-white text-xs font-bold hover:bg-[#031A33] transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Discard confirmation */}
      {confirmDiscard && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-80 space-y-4">
            <h4 className="text-sm font-bold text-slate-800">Discard unsaved changes?</h4>
            <p className="text-xs text-slate-500">Your edits have not been saved and will be lost.</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDiscard(false)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                Continue Editing
              </button>
              <button onClick={onClose}
                className="flex-1 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700">
                Discard Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Main Drawer ───────────────────────────────────────────────────────────────
export const StudentProfileDrawer = ({ studentId, onClose }) => {
  const [student, setStudent]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [tab, setTab]           = useState('Personal');
  const [editing, setEditing]   = useState(false);
  const [resetting, setResetting] = useState(false);
  const [toast, setToast]       = useState(null);

  const load = useCallback(() => {
    if (!studentId) return;
    setLoading(true);
    setError(null);
    userService.getStudentDetail(studentId)
      .then(setStudent)
      .catch(() => setError('Unable to load student profile. Please try again.'))
      .finally(() => setLoading(false));
  }, [studentId]);

  useEffect(() => { load(); }, [load]);

  const handleSaved = (updated) => {
    setStudent(prev => ({ ...prev, ...updated }));
    setEditing(false);
    setToast('Student profile updated successfully.');
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white shadow-2xl z-50 flex flex-col">

        {/* ── Header ── */}
        <div className="bg-[#06264A] px-6 py-5 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-white/10 border-2 border-[#F5A623] flex items-center justify-center text-white font-black text-lg shrink-0">
                {student?.name?.charAt(0)?.toUpperCase() || <User className="w-5 h-5" />}
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-white truncate">
                  {loading ? 'Loading...' : (student?.name || 'Student Profile')}
                </h2>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                  {student?.registrationNumber && (
                    <span className="text-[11px] text-slate-300 font-mono">Reg: {student.registrationNumber}</span>
                  )}
                  {student?.rollNumber && (
                    <span className="text-[11px] text-[#F5A623] font-mono">Roll: {student.rollNumber}</span>
                  )}
                </div>
                {!loading && student && (
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge value={student.status || 'Active'} map={STATUS_MAP} />
                    <Badge value={student.examEligibility || 'Eligible'} map={ELIGIBILITY_MAP} />
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {!loading && !error && student && (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F5A623] text-[#06264A] text-xs font-bold hover:bg-amber-400 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit Profile
                </button>
              )}
              {!loading && !error && student && (
                <button
                  onClick={() => setResetting(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors"
                  title="Reset student password — security action"
                >
                  <KeyRound className="w-3.5 h-3.5" /> Reset Password
                </button>
              )}
              <button onClick={onClose} className="text-white/70 hover:text-white transition-colors p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Toast ── */}
        {toast && (
          <div className="mx-4 mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2 shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />{toast}
          </div>
        )}

        {/* ── Tabs ── */}
        <div className="flex border-b border-slate-200 bg-white shrink-0 overflow-x-auto">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
                tab === t ? 'border-[#06264A] text-[#06264A]' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}>
              {t}
            </button>
          ))}
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <Loader2 className="w-8 h-8 text-[#06264A] animate-spin" />
              <p className="text-xs text-slate-500">Loading student profile...</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
              <AlertTriangle className="w-8 h-8 text-red-400" />
              <p className="text-xs text-red-600 font-semibold">{error}</p>
              <button onClick={load} className="text-xs text-[#06264A] underline">Retry</button>
            </div>
          )}

          {!loading && !error && student && (
            <>
              {/* ── PERSONAL ── */}
              {tab === 'Personal' && (
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <SectionHeading>Personal Information</SectionHeading>
                  <Field label="Full Name"        value={student.name} />
                  <Field label="Roll Number"      value={student.rollNumber} mono />
                  <Field label="Registration No." value={student.registrationNumber} mono />

                  <SectionHeading>Contact Information</SectionHeading>
                  <Field label="University Email"  value={student.email} mono full />
                  <Field label="Alternate Email"   value={student.alternateEmail} />
                  <Field label="Mobile Number"     value={student.mobile} />

                  <SectionHeading>Personal Details</SectionHeading>
                  <Field label="Date of Birth" value={fmt(student.dateOfBirth)} />
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
                  <Field label="Account Created" value={fmt(student.createdAt || student.registeredDate)} />
                  <Field label="Last Login"      value={fmtDT(student.lastLoginAt)} />
                </div>
              )}

              {/* ── ACADEMIC ── */}
              {tab === 'Academic' && (
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <SectionHeading>Program Details</SectionHeading>
                  <Field label="Program"        value={student.program} />
                  <Field label="Department"     value={student.department} />
                  <Field label="Specialization" value={student.specialization} />
                  <Field label="Batch"          value={student.batch || student.year} />
                  <Field label="Admission Year" value={student.admissionYear} />

                  <SectionHeading>Current Standing</SectionHeading>
                  <Field label="Semester"          value={student.semester} />
                  <Field label="Section"           value={student.section} />
                  <Field label="Enrollment Status" value={student.enrollmentStatus || student.status} />
                  <Field label="Academic Status"   value={student.academicStatus} />
                  <Field label="Enrollment Date"   value={fmt(student.registeredDate || student.createdAt)} />
                </div>
              )}

              {/* ── EXAM HISTORY ── */}
              {tab === 'Exam History' && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500 flex items-center gap-2 mb-3">
                    <BarChart2 className="w-4 h-4" />
                    {student.examsTaken} exam{student.examsTaken !== 1 ? 's' : ''} on record
                  </p>
                  {!student.results?.length && (
                    <div className="text-center py-12 text-slate-400">
                      <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                      <p className="text-xs">No examination history found.</p>
                    </div>
                  )}
                  {student.results?.map(r => (
                    <div key={r.id} className="border border-slate-200 rounded-xl p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-bold text-slate-800">{r.examTitle}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{r.examCode} · Attempt {r.attemptNumber}</p>
                        </div>
                        <Badge value={r.status} map={RESULT_MAP} />
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-600">
                        <span><span className="font-bold">Score:</span> {r.score}/{r.totalMarks}</span>
                        <span><span className="font-bold">%:</span> {r.percentage}%</span>
                        <span><span className="font-bold">Date:</span> {fmt(r.submittedAt)}</span>
                      </div>
                      {r.violations > 0 && (
                        <p className="text-[10px] text-amber-700 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {r.violations} proctoring violation{r.violations > 1 ? 's' : ''} recorded
                        </p>
                      )}
                      {r.autoSubmitted && (
                        <p className="text-[10px] text-red-600 font-semibold">Auto-submitted by proctoring system</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* ── RESULTS ── */}
              {tab === 'Results' && (
                <div className="space-y-4">
                  {!student.results?.length && (
                    <div className="text-center py-12 text-slate-400">
                      <BarChart2 className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                      <p className="text-xs">No results available.</p>
                    </div>
                  )}
                  {student.results?.map(r => (
                    <div key={r.id} className="border border-slate-200 rounded-xl overflow-hidden">
                      <div className="bg-slate-50 px-4 py-3 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{r.examTitle}</p>
                          <p className="text-[10px] text-slate-500">{fmt(r.submittedAt)} · Attempt {r.attemptNumber}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-bold text-[#06264A]">{r.score}/{r.totalMarks} ({r.percentage}%)</span>
                          <Badge value={r.status} map={RESULT_MAP} />
                        </div>
                      </div>
                      {r.sectionScores && Object.keys(r.sectionScores).length > 0 && (
                        <div className="px-4 py-3 space-y-1.5">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Section-wise Performance</p>
                          {Object.values(r.sectionScores).map(sec => (
                            <div key={sec.id || sec.title} className="flex items-center justify-between text-xs">
                              <span className="text-slate-600 truncate max-w-[65%]">{sec.title || sec.name}</span>
                              <span className="font-semibold text-slate-800 shrink-0">{sec.score}/{sec.totalMarks}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* ── RETESTS ── */}
              {tab === 'Retests' && (
                <div className="space-y-3">
                  {/* Active retest banner */}
                  {student.retests?.some(r => r.status === 'Approved') && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      This student has an active retest authorization.
                    </div>
                  )}
                  {!student.retests?.length && (
                    <div className="text-center py-12 text-slate-400">
                      <RefreshCw className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                      <p className="text-xs">No retest petitions on record.</p>
                    </div>
                  )}
                  {student.retests?.map(rt => (
                    <div key={rt.id} className="border border-slate-200 rounded-xl p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{rt.examTitle}</p>
                          <p className="text-[10px] font-mono text-slate-500">{rt.refCode}</p>
                        </div>
                        <Badge value={rt.status} map={RETEST_MAP} />
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600">
                        <span><span className="font-bold">Requested:</span> {fmt(rt.createdAt)}</span>
                        <span><span className="font-bold">Attempt Allowed:</span> {rt.attemptAllowed}</span>
                        {rt.scheduledWindow && rt.scheduledWindow !== 'Pending COE Scheduling' && (
                          <span className="col-span-2"><span className="font-bold">Window:</span> {rt.scheduledWindow}</span>
                        )}
                        {rt.approvedBy && rt.approvedBy !== 'Pending COE Review' && (
                          <span className="col-span-2"><span className="font-bold">Approved by:</span> {rt.approvedBy}</span>
                        )}
                      </div>
                      <div className="bg-slate-50 rounded-lg p-2.5 text-[10px] text-slate-600">
                        <span className="font-bold">Reason: </span>{rt.reason}
                      </div>
                      {rt.remarks && (
                        <p className="text-[10px] text-slate-500 italic">COE Remarks: {rt.remarks}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {/* ── SECURITY ── */}
              {tab === 'Security' && (
                <PasswordManagementTab
                  student={student}
                  onPasswordChanged={() => {
                    setToast('Student password updated successfully.');
                    setTimeout(() => setToast(null), 4000);
                  }}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Edit Profile modal — rendered outside drawer so it overlays fully */}
      {editing && student && (
        <EditProfileModal
          student={student}
          onSave={handleSaved}
          onClose={() => setEditing(false)}
        />
      )}

      {/* Reset Password modal — security-sensitive, separate from edit flow */}
      {resetting && student && (
        <ResetPasswordModal
          student={student}
          onClose={() => setResetting(false)}
        />
      )}
    </>
  );
};

export default StudentProfileDrawer;
