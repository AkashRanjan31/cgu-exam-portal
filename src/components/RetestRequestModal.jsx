import React, { useState } from 'react';
import { retestService } from '../services/retestService';
import { AlertCircle, FileText, Send, X } from 'lucide-react';

export const RetestRequestModal = ({
  isOpen,
  exam,
  user,
  onClose = () => {},
  onSuccess = () => {}
}) => {
  const [reason, setReason] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !exam) return null;

  const presetReasons = [
    'Campus lab terminal power outage during examination',
    'Network connectivity loss during active section',
    'Browser process freeze / operating system crash',
    'Proctoring violation triggered by OS notification popup'
  ];

  const handleSelectTag = (tag) => {
    setSelectedTag(tag);
    setReason(tag);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide specific grounds explaining why a retest is required.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await retestService.requestRetest({
        examId: exam.id,
        examTitle: exam.title,
        examCode: exam.code || 'EXAM',
        studentId: user?.id || 's1',
        studentName: user?.name || 'Candidate',
        studentEmail: user?.email || 'student@cgu-odisha.ac.in',
        rollNumber: user?.rollNumber || 'XXX XXXXXXX',
        department: user?.department || 'Computer Science & Engineering',
        reason
      });

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit retest petition');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#06264A] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-[#F5A623]" />
            </div>
            <div>
              <h3 className="font-bold text-base">Petition for Retest Examination</h3>
              <p className="text-xs text-slate-300">
                To: {UNIVERSITY_INFO.authorityTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="text-slate-300 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
            <div className="flex items-center justify-between font-bold text-[#06264A]">
              <span>{exam.title} ({exam.code})</span>
              <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-blue-200">Attempt Limit: 2</span>
            </div>
            <p className="text-slate-600 text-[11px]">
              Retests are strictly authority-controlled and will only be activated after verification by the Controller of Examinations.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Selection Tags */}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Common Grounds (Quick Select)
            </label>
            <div className="space-y-1.5">
              {presetReasons.map((r, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectTag(r)}
                  className={`w-full text-left p-2.5 rounded-xl border text-[11px] transition-all ${
                    selectedTag === r
                      ? 'border-[#06264A] bg-blue-50 text-[#06264A] font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Reason Textarea */}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Specific Explanation & Incident Details *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="State the terminal number, exact time, and nature of the technical or administrative impediment..."
              className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:border-[#06264A]"
              required
            />
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Official COE Reference will be generated</span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2 rounded-xl border border-slate-300 font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-[#06264A] hover:bg-[#0A3B72] text-white font-bold flex items-center gap-1.5 shadow-sm"
              >
                {submitting ? (
                  <span>Submitting Petition...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit to COE</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};

export default RetestRequestModal;
