import React from 'react';
import { Shield, ShieldAlert, AlertTriangle } from 'lucide-react';

export const SecurityIndicator = ({ violations = 0, maxViolations = 3 }) => {
  if (violations === 0) {
    return (
      <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold tracking-wide transition-all shadow-sm">
        <Shield className="w-4 h-4 text-emerald-600 animate-pulse" />
        <span className="hidden sm:inline">Exam Secured</span>
        <span className="bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded text-[11px] font-bold">
          0 / {maxViolations} Strikes
        </span>
      </div>
    );
  }

  if (violations === 1) {
    return (
      <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs font-semibold tracking-wide transition-all shadow-sm animate-bounce">
        <AlertTriangle className="w-4 h-4 text-amber-600" />
        <span>Security Warning</span>
        <span className="bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded text-[11px] font-bold">
          1 / {maxViolations}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-100 border border-red-400 text-red-900 text-xs font-bold tracking-wide shadow-md animate-pulse">
      <ShieldAlert className="w-4 h-4 text-red-600" />
      <span>FINAL WARNING</span>
      <span className="bg-red-600 text-white px-2 py-0.5 rounded text-[11px] font-black">
        {violations} / {maxViolations}
      </span>
    </div>
  );
};

export default SecurityIndicator;
