import React, { useState } from 'react';
import {
  X,
  Plus,
  Upload,
  Edit2,
  Trash2,
  FolderSync,
  Check,
  FileQuestion,
  Clock
} from 'lucide-react';
import { questionService } from '../../services/questionService';

export const SectionQuestionsDrawer = ({
  isOpen,
  onClose,
  section = null,
  examTitle,
  allQuestions = [],
  onOpenAddQuestion,
  onOpenUploadToSection,
  onOpenEditQuestion,
  onOpenMoveQuestion,
  onReload
}) => {
  const [deleteConfirmQ, setDeleteConfirmQ] = useState(null);

  if (!isOpen || !section) return null;

  // Filter questions strictly belonging to this section
  const sectionQuestions = allQuestions.filter(q => q.sectionId === section.id);
  const totalMarks = sectionQuestions.reduce((sum, q) => sum + (Number(q.marks) || 1), 0);
  const letters = ['A', 'B', 'C', 'D'];

  const handleDeleteQuestion = async (id) => {
    try {
      await questionService.deleteQuestion(id);
      setDeleteConfirmQ(null);
      onReload();
    } catch (err) {
      console.error('Failed to delete question:', err);
      alert('Failed to delete question');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
        
        {/* Top Header */}
        <div className="bg-[#06264A] text-white p-5 sm:px-6 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-[#F5A623] text-[#06264A] font-black text-[11px] uppercase">
                Section {section.order || 1}
              </span>
              <h2 className="font-black text-lg tracking-tight uppercase">
                {section.title || section.name}
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              {examTitle} • {section.description || 'Examination section questions'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Stats & Actions Bar */}
        <div className="p-4 sm:px-6 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 text-xs">
            <span className="font-extrabold text-[#06264A] bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
              {sectionQuestions.length} Questions
            </span>
            <span className="font-extrabold text-emerald-700 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
              {totalMarks} Marks
            </span>
            <span className="font-bold text-slate-600 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{section.durationMinutes || section.duration || 20} Mins</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenUploadToSection(section)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 font-bold text-xs text-slate-700 flex items-center gap-1.5 shadow-xs transition-all"
              title="Upload questions directly into this section via Excel/CSV"
            >
              <Upload className="w-3.5 h-3.5 text-[#06264A]" />
              <span>Upload to Section</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenAddQuestion(section)}
              className="px-3.5 py-1.5 rounded-xl bg-[#06264A] hover:bg-[#0A3B72] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all"
            >
              <Plus className="w-3.5 h-3.5 text-[#F5A623]" />
              <span>+ Add Question</span>
            </button>
          </div>
        </div>

        {/* Question List */}
        <div className="p-4 sm:px-6 flex-1 overflow-y-auto space-y-3 text-xs">
          {sectionQuestions.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-3">
              <FileQuestion className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="font-bold text-slate-700 text-sm">No Questions in this Section</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Add questions manually or upload an Excel/CSV file directly to automatically populate this section.
              </p>
              <div className="pt-2 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenUploadToSection(section)}
                  className="px-4 py-2 rounded-xl bg-[#06264A] text-white font-bold text-xs flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5 text-[#F5A623]" />
                  <span>Upload Questions</span>
                </button>
              </div>
            </div>
          ) : (
            sectionQuestions.map((q, idx) => {
              const isTF = q.questionType === 'true_false';
              const opts = isTF ? ['True', 'False'] : (q.options || []);

              return (
                <div
                  key={q.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-[#06264A] transition-colors space-y-2.5 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-xl bg-slate-100 font-mono font-bold text-[#06264A] flex items-center justify-center text-xs">
                        Q{idx + 1}
                      </span>
                      <span className="font-bold text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        +{q.marks || 1} Mark(s)
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {q.difficulty || 'Easy'}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onOpenEditQuestion(q)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50"
                        title="Edit question"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenMoveQuestion(q)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
                        title="Move to another section"
                      >
                        <FolderSync className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteConfirmQ(q)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50"
                        title="Delete question"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Question Text */}
                  <p className="font-bold text-slate-900 text-xs leading-relaxed">
                    {q.questionText}
                  </p>

                  {/* Options */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                    {opts.map((opt, oIdx) => {
                      const isCorrect = oIdx === q.correctAnswer;
                      return (
                        <div
                          key={oIdx}
                          className={`p-2 rounded-xl border flex items-center justify-between ${
                            isCorrect
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold'
                              : 'border-slate-200 bg-slate-50 text-slate-600'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="font-mono">{letters[oIdx]}.</span>
                            <span className="truncate">{opt}</span>
                          </div>
                          {isCorrect && <Check className="w-3 h-3 text-emerald-700 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>

                  {q.explanation && (
                    <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-100">
                      Rationale: {q.explanation}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Inline Delete Confirmation Popover/Modal */}
        {deleteConfirmQ && (
          <div className="p-4 bg-red-50 border-t border-red-200 text-red-900 flex items-center justify-between gap-3 text-xs shrink-0 animate-in slide-in-from-bottom">
            <div>
              <span className="font-bold block">Delete Question?</span>
              <span className="text-[11px] text-red-700 line-clamp-1">"{deleteConfirmQ.questionText}"</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmQ(null)}
                className="px-3 py-1 rounded-xl bg-white border border-red-200 font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteQuestion(deleteConfirmQ.id)}
                className="px-3 py-1 rounded-xl bg-red-600 text-white font-bold"
              >
                Delete
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 sm:px-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0 text-xs">
          <span className="text-slate-500 font-semibold">
            {sectionQuestions.length} questions belonging exclusively to {section.title || section.name}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#06264A] text-white font-bold hover:bg-[#0A3B72]"
          >
            Done Viewing
          </button>
        </div>

      </div>
    </div>
  );
};

export default SectionQuestionsDrawer;
