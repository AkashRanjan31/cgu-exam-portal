import React, { useState } from 'react';
import { X, Trash2, AlertTriangle, FolderSync } from 'lucide-react';
import { sectionService } from '../../services/sectionService';

export const DeleteSectionModal = ({
  isOpen,
  onClose,
  section = null,
  availableSections = [],
  onDeleteSuccess
}) => {
  const [resolution, setResolution] = useState('move'); // 'move' | 'delete_questions'
  const otherSections = availableSections.filter(s => s.id !== section?.id);
  const [targetSectionId, setTargetSectionId] = useState(otherSections[0]?.id || '');
  const [deleting, setDeleting] = useState(false);

  if (!isOpen || !section) return null;

  const questionCount = section.questionCount || section.totalQuestions || 0;
  const hasQuestions = questionCount > 0;

  const handleDelete = async () => {
    if (hasQuestions && resolution === 'move' && !targetSectionId) {
      alert('Please select a destination section to relocate questions.');
      return;
    }

    setDeleting(true);
    try {
      await sectionService.deleteSection(
        section.id,
        hasQuestions ? resolution : 'delete_questions',
        hasQuestions && resolution === 'move' ? targetSectionId : null
      );
      onDeleteSuccess();
      onClose();
    } catch (err) {
      alert(err.message || 'Failed to delete section.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#06264A] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-red-500/20 text-red-400">
              <Trash2 className="w-5 h-5" />
            </span>
            <h3 className="font-extrabold text-base">
              Delete Section
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs">
          
          <div className="space-y-1">
            <span className="font-bold text-slate-500 uppercase tracking-wider block">Target Section</span>
            <div className="p-3 rounded-xl bg-slate-100 font-extrabold text-slate-800 text-sm">
              {section.title || section.name}
            </div>
          </div>

          {!hasQuestions ? (
            /* Empty Section Deletion */
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 space-y-1">
              <p className="font-bold text-slate-800">This section is currently empty.</p>
              <p>Removing it will update the sequential order of your examination paper.</p>
            </div>
          ) : (
            /* Non-Empty Section Relocation Warning */
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                <div className="flex items-center gap-2 font-bold text-[#06264A]">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>This section contains {questionCount} question(s).</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  What should happen to these questions before this section is deleted?
                </p>
              </div>

              {/* Radio options */}
              <div className="space-y-2">
                
                {/* Option 1: Move */}
                <label className={`p-3 rounded-2xl border-2 cursor-pointer flex flex-col gap-2 transition-all ${
                  resolution === 'move'
                    ? 'border-[#06264A] bg-blue-50/40 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}>
                  <div className="flex items-center gap-2.5 font-bold text-slate-800">
                    <input
                      type="radio"
                      name="deleteResolution"
                      value="move"
                      checked={resolution === 'move'}
                      onChange={() => setResolution('move')}
                      className="text-[#06264A] focus:ring-0"
                    />
                    <span>Move questions to another section (Recommended)</span>
                  </div>

                  {resolution === 'move' && (
                    <div className="pl-6 pt-1 space-y-1">
                      <span className="text-[11px] text-slate-500 font-semibold block">
                        Select Destination Section:
                      </span>
                      {otherSections.length > 0 ? (
                        <select
                          value={targetSectionId}
                          onChange={(e) => setTargetSectionId(e.target.value)}
                          className="w-full p-2 rounded-xl border border-slate-300 font-bold text-xs bg-white"
                        >
                          {otherSections.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.title || s.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-red-600 text-[11px] font-bold">
                          No other section exists in this examination. You must delete questions or cancel.
                        </p>
                      )}
                    </div>
                  )}
                </label>

                {/* Option 2: Delete Permanently */}
                <label className={`p-3 rounded-2xl border-2 cursor-pointer flex items-center gap-2.5 transition-all ${
                  resolution === 'delete_questions'
                    ? 'border-red-500 bg-red-50/40 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}>
                  <input
                    type="radio"
                    name="deleteResolution"
                    value="delete_questions"
                    checked={resolution === 'delete_questions'}
                    onChange={() => setResolution('delete_questions')}
                    className="text-red-600 focus:ring-0"
                  />
                  <div>
                    <span className="font-bold text-red-800 block">Delete questions permanently</span>
                    <span className="text-[11px] text-slate-500">
                      All {questionCount} questions in this section will be removed from the exam bank.
                    </span>
                  </div>
                </label>

              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 px-6 border-t border-slate-200 flex items-center justify-end gap-3 text-xs">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 font-semibold hover:bg-slate-100 text-slate-700"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={deleting || (hasQuestions && resolution === 'move' && !targetSectionId && otherSections.length === 0)}
            onClick={handleDelete}
            className={`px-5 py-2.5 rounded-xl font-bold text-white flex items-center gap-1.5 shadow-sm transition-all ${
              hasQuestions && resolution === 'delete_questions'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-[#06264A] hover:bg-[#0A3B72]'
            }`}
          >
            {deleting ? (
              <span>Deleting...</span>
            ) : hasQuestions && resolution === 'move' ? (
              <>
                <FolderSync className="w-4 h-4 text-[#F5A623]" />
                <span>Move Questions & Delete Section</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Delete Section</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default DeleteSectionModal;
