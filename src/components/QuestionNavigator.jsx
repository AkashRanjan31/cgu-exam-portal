import React from 'react';
import { Lock } from 'lucide-react';

export const QuestionNavigator = ({
  currentIndex = 0,
  answers = {},
  markedForReview = [],
  questions = [],
  activeSection = null,
  sections = [],
  lockedSectionIds = [],
  onSelectQuestion = () => {}
}) => {
  // Questions in this section
  const answeredCount = questions.filter((q) => answers[q.id] !== undefined).length;
  const markedCount = questions.filter((q) => markedForReview.includes(q.id)).length;
  const unansweredCount = Math.max(0, questions.length - answeredCount);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col h-full">
      
      {/* Active Section Header */}
      <div className="pb-3 border-b border-slate-100 mb-3 space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#F5A623] bg-[#06264A] px-2 py-0.5 rounded">
            Active Section
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {currentIndex + 1} of {questions.length}
          </span>
        </div>
        <h3 className="text-xs font-bold text-[#06264A] truncate">
          {activeSection?.title || 'Current Section'}
        </h3>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 text-[11px] mb-3 p-2 bg-[#F5F7FA] rounded-xl border border-slate-200">
        <div className="flex items-center gap-1.5 text-slate-700">
          <span className="w-3 h-3 rounded-sm bg-[#06264A] inline-block shadow-xs"></span>
          <span>Current</span>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-800">
          <span className="w-3 h-3 rounded-sm bg-emerald-600 inline-block shadow-xs"></span>
          <span>Answered ({answeredCount})</span>
        </div>
        <div className="flex items-center gap-1.5 text-amber-800">
          <span className="w-3 h-3 rounded-sm bg-[#F5A623] inline-block shadow-xs"></span>
          <span>Review ({markedCount})</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-600">
          <span className="w-3 h-3 rounded-sm bg-slate-200 border border-slate-300 inline-block shadow-xs"></span>
          <span>Unanswered ({unansweredCount})</span>
        </div>
      </div>

      {/* Grid of question buttons for the active section */}
      <div className="grid grid-cols-5 gap-2 overflow-y-auto max-h-[300px] p-1">
        {questions.map((q, index) => {
          const qId = q.id;
          const isCurrent = currentIndex === index;
          const isAnswered = answers[qId] !== undefined;
          const isMarked = markedForReview.includes(qId);

          let btnClass = 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200';
          let statusText = 'Not Answered';

          if (isCurrent) {
            btnClass = 'bg-[#06264A] text-white ring-2 ring-[#F5A623] ring-offset-1 font-bold shadow-md';
            statusText = 'Current Question';
          } else if (isMarked) {
            btnClass = 'bg-[#F5A623] text-white font-bold shadow-xs hover:bg-amber-600';
            statusText = isAnswered ? 'Answered & Marked for Review' : 'Marked for Review';
          } else if (isAnswered) {
            btnClass = 'bg-emerald-600 text-white font-bold shadow-xs hover:bg-emerald-700';
            statusText = 'Answered';
          }

          return (
            <button
              key={qId || index}
              type="button"
              onClick={() => onSelectQuestion(index)}
              title={`Question ${q.questionNumber || (index + 1)} - ${statusText}`}
              aria-label={`Question ${q.questionNumber || (index + 1)}, ${statusText}`}
              className={`relative h-10 w-full rounded-xl border text-xs font-semibold flex items-center justify-center transition-all active:scale-95 ${btnClass}`}
            >
              <span>{q.questionNumber || (index + 1)}</span>
              {isMarked && !isCurrent && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </button>
          );
        })}
      </div>

      {/* Sections Summary List */}
      {sections.length > 1 && (
        <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Examination Sections
          </span>
          <div className="space-y-1">
            {sections.map((sec) => {
              const isLocked = lockedSectionIds.includes(sec.id);
              const isCurrent = sec.id === activeSection?.id;
              return (
                <div
                  key={sec.id}
                  className={`p-2 rounded-lg text-[11px] flex items-center justify-between border ${
                    isCurrent
                      ? 'bg-blue-50 border-blue-200 text-[#06264A] font-bold'
                      : isLocked
                      ? 'bg-emerald-50/50 border-emerald-200 text-emerald-800'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  <span className="truncate max-w-[150px]">{sec.title}</span>
                  {isLocked ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                      <Lock className="w-3 h-3" /> Locked
                    </span>
                  ) : isCurrent ? (
                    <span className="text-[10px] font-bold text-blue-700">In Progress</span>
                  ) : (
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Future
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Section Progress Footer */}
      <div className="mt-auto pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1.5">
        <div className="flex justify-between items-center text-[11px] font-medium">
          <span>Section Progress</span>
          <span className="text-[#06264A] font-bold">
            {questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0}%
          </span>
        </div>
        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-emerald-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${questions.length > 0 ? (answeredCount / questions.length) * 100 : 0}%` }}
          ></div>
        </div>
      </div>

    </div>
  );
};

export default QuestionNavigator;
