import React from 'react';
import { AlertCircle, CheckCircle2, HelpCircle, X } from 'lucide-react';

export const SubmitModal = ({
  isOpen,
  totalQuestions = 0,
  attempted = 0,
  unattempted = 0,
  onCancel = () => {},
  onConfirm = () => {},
  isSubmitting = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all animate-in fade-in">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#06264A] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-[#F5A623]" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Submit Examination?</h3>
              <p className="text-xs text-slate-300">C. V. Raman Global University</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="text-slate-300 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            Are you sure you want to submit your examination? Once submitted, your answers will be locked and cannot be changed.
          </p>

          {/* Breakdown Stats */}
          <div className="grid grid-cols-3 gap-3 py-2">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
              <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider">Total</span>
              <span className="text-xl font-bold text-[#06264A]">{totalQuestions}</span>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
              <span className="text-xs font-semibold text-emerald-700 block uppercase tracking-wider">Attempted</span>
              <span className="text-xl font-bold text-emerald-700">{attempted}</span>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
              <span className="text-xs font-semibold text-amber-700 block uppercase tracking-wider">Unattempted</span>
              <span className="text-xl font-bold text-amber-700">{unattempted}</span>
            </div>
          </div>

          {unattempted > 0 && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs">
              <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                You have <strong>{unattempted} unattempted question{unattempted > 1 ? 's' : ''}</strong> remaining. You may go back to review or answer them before submitting.
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 active:scale-95 transition-all"
            >
              Review Answers
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Final Exam</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitModal;
