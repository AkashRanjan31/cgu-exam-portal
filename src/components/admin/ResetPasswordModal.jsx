import React, { useState, useCallback } from 'react';
import { userService } from '../../services/userService';
import {
  X, ShieldAlert, KeyRound, Mail, Copy, CheckCircle2,
  AlertTriangle, Loader2, Lock, Eye, EyeOff
} from 'lucide-react';

// Steps: 'select' → 'confirm' → 'done'
const METHODS = [
  {
    id: 'temporary_password',
    label: 'Generate Temporary Password',
    description: 'A secure temporary password is generated and shown to you once. The student must change it on next login.',
    icon: KeyRound,
  },
  {
    id: 'reset_link',
    label: 'Send Password Reset Link',
    description: 'A secure, single-use reset link is emailed to the student\'s university email address.',
    icon: Mail,
  },
];

export const ResetPasswordModal = ({ student, onClose }) => {
  const [step, setStep]         = useState('select');   // 'select' | 'confirm' | 'done'
  const [method, setMethod]     = useState('temporary_password');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [result, setResult]     = useState(null);       // { temporaryPassword?, message? }
  const [copied, setCopied]     = useState(false);
  const [showTmp, setShowTmp]   = useState(false);

  const handleContinue = () => { setError(null); setStep('confirm'); };

  const handleReset = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await userService.adminResetStudentPassword(student.id, method);
      setResult(res);
      setStep('done');
    } catch (err) {
      setError(err.message || 'Unable to reset the student\'s password. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [student.id, method]);

  const handleCopy = () => {
    if (!result?.temporaryPassword) return;
    navigator.clipboard.writeText(result.temporaryPassword).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  // On close after 'done', wipe temporary password from state
  const handleClose = () => {
    setResult(null);
    setShowTmp(false);
    onClose();
  };

  const StudentInfo = () => (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1 text-xs">
      <div className="flex justify-between">
        <span className="text-slate-500 font-medium">Student</span>
        <span className="font-bold text-slate-800">{student.name}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-slate-500 font-medium">Registration No.</span>
        <span className="font-mono text-slate-700">{student.registrationNumber || student.rollNumber || '—'}</span>
      </div>
      <div className="flex justify-between gap-4">
        <span className="text-slate-500 font-medium shrink-0">University Email</span>
        <span className="font-mono text-slate-700 break-all text-right">{student.email}</span>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Reset Student Password</h3>
              <p className="text-[10px] text-slate-500">Security-sensitive operation</p>
            </div>
          </div>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">

          {/* ── STEP: SELECT ── */}
          {step === 'select' && (
            <>
              <StudentInfo />

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Choose Reset Method
                </p>
                <div className="space-y-2">
                  {METHODS.map(m => {
                    const Icon = m.icon;
                    const active = method === m.id;
                    return (
                      <button
                        key={m.id}
                        onClick={() => setMethod(m.id)}
                        className={`w-full text-left p-3.5 rounded-xl border-2 transition-all flex items-start gap-3 ${
                          active
                            ? 'border-[#06264A] bg-[#06264A]/5'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${active ? 'bg-[#06264A] text-white' : 'bg-slate-100 text-slate-500'}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className={`text-xs font-bold ${active ? 'text-[#06264A]' : 'text-slate-700'}`}>{m.label}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{m.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[10px] text-amber-800 flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>The student's current password will be invalidated. They will be required to set a new password on next login.</span>
              </div>
            </>
          )}

          {/* ── STEP: CONFIRM ── */}
          {step === 'confirm' && (
            <>
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" /> Confirm Password Reset
                </p>
                <p>You are about to reset the password for this student account. This action will be recorded in the audit log.</p>
              </div>

              <StudentInfo />

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs">
                <span className="text-slate-500 font-medium">Reset Method: </span>
                <span className="font-bold text-slate-800">
                  {METHODS.find(m => m.id === method)?.label}
                </span>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />{error}
                </div>
              )}
            </>
          )}

          {/* ── STEP: DONE ── */}
          {step === 'done' && (
            <>
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="font-semibold">Student password reset successfully.</span>
              </div>

              <StudentInfo />

              {/* Temporary password — shown once */}
              {result?.temporaryPassword && (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Temporary Password — Copy Now
                  </p>
                  <div className="border-2 border-amber-300 bg-amber-50 rounded-xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`font-mono text-sm font-bold text-slate-800 tracking-widest flex-1 ${showTmp ? '' : 'blur-sm select-none'}`}>
                        {result.temporaryPassword}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => setShowTmp(v => !v)}
                          className="p-1.5 rounded-lg hover:bg-amber-100 text-amber-700 transition-colors"
                          title={showTmp ? 'Hide' : 'Reveal'}
                        >
                          {showTmp ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={handleCopy}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                            copied
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-200 text-amber-900 hover:bg-amber-300'
                          }`}
                        >
                          {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          {copied ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>
                    <p className="text-[10px] text-amber-800 flex items-center gap-1.5 font-semibold">
                      <AlertTriangle className="w-3 h-3 shrink-0" />
                      This password will not be displayed again after closing this dialog.
                    </p>
                  </div>
                  <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-[10px] text-blue-800 flex items-start gap-1.5">
                    <Lock className="w-3 h-3 shrink-0 mt-0.5" />
                    The student will be required to set a new password on their next login.
                  </div>
                </div>
              )}

              {/* Reset link confirmation */}
              {result?.method === 'reset_link' && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-start gap-2">
                  <Mail className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{result.message}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex gap-3 shrink-0">
          {step === 'select' && (
            <>
              <button onClick={handleClose}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleContinue}
                className="flex-1 py-2.5 rounded-xl bg-[#06264A] text-white text-xs font-bold hover:bg-[#031A33] transition-colors">
                Continue
              </button>
            </>
          )}

          {step === 'confirm' && (
            <>
              <button onClick={() => { setStep('select'); setError(null); }} disabled={loading}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50">
                Back
              </button>
              <button onClick={handleReset} disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </>
          )}

          {step === 'done' && (
            <button onClick={handleClose}
              className="flex-1 py-2.5 rounded-xl bg-[#06264A] text-white text-xs font-bold hover:bg-[#031A33] transition-colors">
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordModal;
