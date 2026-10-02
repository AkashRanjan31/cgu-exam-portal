import React from 'react';
import { Clock, ArrowRight, CheckCircle2, Lock, Layers, ShieldCheck, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ExamCard = ({
  exam,
  isCompleted = false,
  retestStatus = null
}) => {
  const isUpcoming = exam.status === 'Upcoming';
  const hasSections = exam.sections && exam.sections.length > 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-academic transition-all flex flex-col justify-between group">
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-blue-50 text-[#06264A] border border-blue-100">
            {exam.code || 'EXAM'}
          </span>

          {retestStatus?.isAuthorized ? (
            <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              Retest Authorized (Att. {retestStatus.attemptNumber || 2})
            </span>
          ) : retestStatus?.isPending ? (
            <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300">
              <Clock className="w-3.5 h-3.5" />
              COE Review Pending
            </span>
          ) : isCompleted ? (
            <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Completed
            </span>
          ) : isUpcoming ? (
            <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              <Clock className="w-3.5 h-3.5" />
              Upcoming
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
              Available
            </span>
          )}
        </div>

        {/* Title and Subject */}
        <h3 className="text-lg font-bold text-[#06264A] group-hover:text-[#0A3B72] transition-colors leading-snug">
          {exam.title}
        </h3>
        <div className="flex flex-wrap items-center gap-2 mt-1.5">
          <p className="text-xs font-medium text-slate-500">
            {exam.subject}
          </p>
          {hasSections && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#06264A] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              <Layers className="w-3 h-3 text-[#F5A623]" />
              {exam.sections.length} Locked Sections
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
          {exam.description || 'Standard university evaluation examination administered under CVRGU examination guidelines.'}
        </p>

        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-2 py-4 my-3 border-y border-slate-100 text-center text-xs">
          <div>
            <span className="text-slate-400 block text-[11px] uppercase tracking-wider">Questions</span>
            <span className="font-bold text-slate-700 text-sm mt-0.5 block">{exam.totalQuestions}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px] uppercase tracking-wider">Duration</span>
            <span className="font-bold text-slate-700 text-sm mt-0.5 block">{exam.durationMinutes} Mins</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px] uppercase tracking-wider">Total Marks</span>
            <span className="font-bold text-slate-700 text-sm mt-0.5 block">{exam.totalMarks}</span>
          </div>
        </div>
      </div>

      {/* Action CTA */}
      <div className="pt-2">
        {retestStatus?.isAuthorized ? (
          <Link
            to={`/student/instructions/${exam.id}`}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm active:scale-98 transition-all group-hover:shadow-md"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Start Retest (Attempt {retestStatus.attemptNumber || 2})</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        ) : retestStatus?.isPending ? (
          <Link
            to="/student/results"
            className="w-full py-2.5 px-4 rounded-xl border border-amber-500 bg-amber-50 text-amber-900 font-semibold text-xs flex items-center justify-center gap-2 hover:bg-amber-100 transition-colors"
          >
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Petition Pending • View Result</span>
          </Link>
        ) : isCompleted ? (
          <Link
            to="/student/results"
            className="w-full py-2.5 px-4 rounded-xl border border-emerald-600 text-emerald-700 font-semibold text-xs flex items-center justify-center gap-2 hover:bg-emerald-50 transition-colors"
          >
            <span>View Result & Analytics</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        ) : isUpcoming ? (
          <div className="w-full py-2.5 px-4 rounded-xl bg-slate-100 text-slate-400 font-semibold text-xs flex items-center justify-center gap-2 cursor-not-allowed">
            <Lock className="w-3.5 h-3.5" />
            <span>Scheduled for Later</span>
          </div>
        ) : (
          <Link
            to={`/student/instructions/${exam.id}`}
            className="w-full py-2.5 px-4 rounded-xl bg-[#06264A] hover:bg-[#0A3B72] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm active:scale-98 transition-all group-hover:shadow-md"
          >
            <span>Start Examination</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>
    </div>
  );
};

export default ExamCard;
