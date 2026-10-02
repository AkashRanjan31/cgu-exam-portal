import React from 'react';
import { AlertTriangle, ShieldAlert, XCircle, ArrowRight, Lock } from 'lucide-react';
import { getViolationDetails } from '../utils/examSecurity';

export const SecurityWarningModal = ({
  isOpen,
  violations = 1,
  maxViolations = 3,
  reason = 'Tab switch or window focus lost',
  onAcknowledge = () => {}
}) => {
  if (!isOpen) return null;

  const details = getViolationDetails(violations);
  const isAutoSubmitted = violations >= maxViolations;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 transition-all duration-300">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border-2 border-red-500/30 overflow-hidden text-center animate-in fade-in zoom-in duration-200">
        
        {/* Top Header Banner */}
        <div className={`p-6 ${isAutoSubmitted ? 'bg-red-600 text-white' : violations === 2 ? 'bg-amber-600 text-white' : 'bg-[#06264A] text-white'}`}>
          <div className="mx-auto w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-3 shadow-inner">
            {isAutoSubmitted ? (
              <XCircle className="w-10 h-10 text-white animate-bounce" />
            ) : violations === 2 ? (
              <ShieldAlert className="w-10 h-10 text-white animate-pulse" />
            ) : (
              <AlertTriangle className="w-10 h-10 text-amber-300 animate-pulse" />
            )}
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            {details.title}
          </h2>
          <p className="text-xs font-medium uppercase tracking-widest opacity-80 mt-1">
            CVRGU Proctoring Engine
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-left">
            <p className="text-xs font-semibold text-red-800 uppercase tracking-wider mb-1">
              Detected Breach
            </p>
            <p className="text-sm font-medium text-red-950">
              {reason || 'Tab switching / window focus lost / leaving fullscreen'}
            </p>
          </div>

          <p className="text-slate-700 text-sm leading-relaxed">
            {details.message}
          </p>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <p className="text-xs text-slate-500 font-medium">
              Security Violation Tally
            </p>
            <div className="flex items-center justify-center gap-2 mt-2">
              {[1, 2, 3].map((strike) => (
                <div
                  key={strike}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    strike <= violations
                      ? strike === 3
                        ? 'bg-red-600 text-white scale-110 shadow-lg'
                        : 'bg-amber-500 text-white scale-105 shadow-md'
                      : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  {strike}
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-600 font-semibold mt-2">
              {violations} of {maxViolations} Violations Recorded
            </p>
          </div>

          <p className="text-xs font-medium text-slate-500 italic">
            {details.subtext}
          </p>

          {/* Action Button */}
          {!isAutoSubmitted ? (
            <button
              onClick={onAcknowledge}
              className="w-full mt-2 py-3 px-5 rounded-xl font-bold text-white bg-[#06264A] hover:bg-[#0A3B72] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-navy/20"
            >
              <span>Return to Examination & Fullscreen</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="pt-2 text-center text-red-700 font-semibold text-sm flex items-center justify-center gap-2">
              <Lock className="w-4 h-4 animate-spin" />
              <span>Redirecting to result evaluation...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecurityWarningModal;
