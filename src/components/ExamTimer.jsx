import React from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { formatExamTime } from '../utils/examSecurity';

export const ExamTimer = ({ remainingSeconds = 0 }) => {
  const isCritical = remainingSeconds <= 300; // Under 5 minutes
  const isUrgent = remainingSeconds <= 60; // Under 1 minute

  return (
    <div
      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-mono font-bold tracking-wider transition-all duration-300 ${
        isUrgent
          ? 'bg-red-600 text-white border-red-700 shadow-lg animate-pulse scale-105'
          : isCritical
          ? 'bg-red-50 text-red-700 border-red-300 shadow-md animate-timer-critical'
          : 'bg-[#F5F7FA] text-[#06264A] border-slate-200'
      }`}
    >
      {isCritical ? (
        <AlertCircle className={`w-4 h-4 ${isUrgent ? 'text-white' : 'text-red-600 animate-spin'}`} />
      ) : (
        <Clock className="w-4 h-4 text-[#06264A]" />
      )}
      <span className="text-base sm:text-lg">
        {formatExamTime(remainingSeconds)}
      </span>
      {isCritical && (
        <span className={`text-[10px] font-sans font-semibold px-1.5 py-0.5 rounded uppercase hidden md:inline ${
          isUrgent ? 'bg-white/20 text-white' : 'bg-red-100 text-red-800'
        }`}>
          {isUrgent ? 'Urgent' : 'Low Time'}
        </span>
      )}
    </div>
  );
};

export default ExamTimer;
