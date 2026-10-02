import React from 'react';
import { Bookmark, ChevronLeft, ChevronRight, RotateCcw, Check } from 'lucide-react';

export const QuestionCard = ({
  question,
  questionNumber = 1,
  totalQuestions = 10,
  sectionTitle = '',
  selectedOption = null,
  isMarkedForReview = false,
  isLocked = false,
  onSelectOption = () => {},
  onClearOption = () => {},
  onToggleMark = () => {},
  onNext = () => {},
  onPrev = () => {},
  isFirst = false,
  isLast = false
}) => {
  if (!question) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
        No question data loaded.
      </div>
    );
  }

  const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
      
      {/* Top Question Header */}
      <div className="bg-[#F5F7FA] px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-lg bg-[#06264A] text-white font-bold text-xs tracking-wider uppercase">
            Question {questionNumber} of {totalQuestions}
          </span>
          {sectionTitle && (
            <span className="text-xs font-bold text-[#06264A] bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md hidden sm:inline">
              {sectionTitle}
            </span>
          )}
          <span className="text-xs font-semibold text-slate-500">
            Marks: +{question.marks || 1} • Negative: 0
          </span>
        </div>

        <button
          type="button"
          onClick={onToggleMark}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
            isMarkedForReview
              ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
          }`}
        >
          <Bookmark className={`w-3.5 h-3.5 ${isMarkedForReview ? 'fill-current text-white' : 'text-amber-500'}`} />
          <span>{isMarkedForReview ? 'Marked for Review' : 'Mark for Review'}</span>
        </button>
      </div>

      {/* Main Question Body */}
      <div className="p-6 md:p-8 flex-1 overflow-y-auto space-y-6">
        <div className="text-slate-900 text-base md:text-lg font-medium leading-relaxed">
          {question.questionText}
        </div>

        {isLocked && (
          <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs font-semibold text-amber-900 flex items-center gap-2">
            <span>🔒 This section is locked. Answers are preserved and can no longer be modified.</span>
          </div>
        )}

        {/* Options List */}
        <div className="space-y-3 pt-2" role="radiogroup" aria-label="Question Options">
          {question.options.map((optText, optIndex) => {
            const isSelected = selectedOption === optIndex;

            return (
              <div
                key={optIndex}
                onClick={() => !isLocked && onSelectOption(optIndex)}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                  isLocked ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'
                } ${
                  isSelected
                    ? 'border-[#06264A] bg-blue-50/50 shadow-sm text-[#06264A]'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 text-slate-700'
                }`}
                role="radio"
                aria-checked={isSelected}
                tabIndex={isLocked ? -1 : 0}
                onKeyDown={(e) => {
                  if (!isLocked && (e.key === ' ' || e.key === 'Enter')) {
                    e.preventDefault();
                    onSelectOption(optIndex);
                  }
                }}
              >
                {/* Radio Circle & Letter */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                    isSelected
                      ? 'bg-[#06264A] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 border border-slate-300'
                  }`}
                >
                  {isSelected ? <Check className="w-4 h-4" /> : optionLetters[optIndex]}
                </div>

                <span className="text-sm md:text-base font-normal flex-1">
                  {optText}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Navigation Controls */}
      <div className="p-4 md:px-8 border-t border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPrev}
            disabled={isFirst}
            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold border flex items-center gap-1.5 transition-all ${
              isFirst
                ? 'opacity-40 cursor-not-allowed border-slate-200 text-slate-400'
                : 'border-slate-300 text-slate-700 hover:bg-slate-50 active:scale-95'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {selectedOption !== null && selectedOption !== undefined && (
            <button
              type="button"
              onClick={onClearOption}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1"
              title="Clear current selection"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Choice</span>
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onNext}
          className="px-5 py-2 rounded-xl text-xs md:text-sm font-bold bg-[#06264A] text-white hover:bg-[#0A3B72] active:scale-95 transition-all flex items-center gap-1.5 shadow-sm"
        >
          <span>{isLast ? 'Last Question' : 'Next'}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default QuestionCard;
