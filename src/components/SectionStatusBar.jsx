import React from 'react';
import { Lock, CheckCircle2, ArrowRight } from 'lucide-react';
import ExamTimer from './ExamTimer';

export const SectionStatusBar = ({
  sections = [],
  activeSectionIndex = 0,
  lockedSectionIds = [],
  sectionRemainingTime = 0,
  onLockAndProceed = () => {},
  isLastSection = false,
  onOpenSubmitModal = () => {}
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
      {/* Top row: Section tabs & current section timer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        {/* Section Pipeline Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {sections.map((sec, idx) => {
            const isActive = idx === activeSectionIndex;
            const isLocked = lockedSectionIds.includes(sec.id) || idx < activeSectionIndex;
            const isFuture = idx > activeSectionIndex;

            let badgeStyle = 'bg-slate-100 text-slate-500 border-slate-200';
            if (isActive) {
              badgeStyle = 'bg-[#06264A] text-white border-[#06264A] shadow-sm font-bold ring-2 ring-[#F5A623]';
            } else if (isLocked) {
              badgeStyle = 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold';
            } else if (isFuture) {
              badgeStyle = 'bg-slate-50 text-slate-400 border-dashed border-slate-300';
            }

            return (
              <div
                key={sec.id || idx}
                className={`px-3 py-2 rounded-xl border text-xs flex items-center gap-2 shrink-0 transition-all ${badgeStyle}`}
                title={
                  isLocked
                    ? 'Section completed and permanently locked'
                    : isFuture
                    ? 'Future section locked (Sequential access only)'
                    : 'Active section currently in progress'
                }
              >
                {isLocked ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : isFuture ? (
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-[#F5A623] animate-ping"></span>
                )}
                <div className="text-left leading-none">
                  <span className="block text-[10px] uppercase opacity-75 font-semibold">
                    {idx === 0 ? 'Section A' : idx === 1 ? 'Section B' : `Section ${idx + 1}`}
                  </span>
                  <span className="text-xs truncate max-w-[140px] sm:max-w-[180px] block mt-0.5">
                    {sec.title}
                  </span>
                </div>
                {isLocked && <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1 py-0.5 rounded font-mono font-bold">Locked</span>}
              </div>
            );
          })}
        </div>

        {/* Section Timer & Section Action CTA */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase hidden md:inline">
              Section Timer:
            </span>
            <ExamTimer remainingSeconds={sectionRemainingTime} />
          </div>

          {!isLastSection ? (
            <button
              type="button"
              onClick={onLockAndProceed}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
              title="Lock this section and advance to next section"
            >
              <span>Lock Section & Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenSubmitModal}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <span>Submit Examination</span>
              <CheckCircle2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Advisory Bar on Section Rules */}
      <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-amber-600" />
          <span><strong>Section Rule:</strong> Locked sections cannot be reopened. Future sections unlock sequentially.</span>
        </span>
        <span className="text-slate-400 font-mono text-[10px]">
          Active: {sections[activeSectionIndex]?.title} ({sections[activeSectionIndex]?.durationMinutes} Mins Allocated)
        </span>
      </div>
    </div>
  );
};

export default SectionStatusBar;
