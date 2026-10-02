import React, { useState } from 'react';
import { X, ArrowRight, FolderSync } from 'lucide-react';
import { questionService } from '../../services/questionService';

export const MoveQuestionModal = ({
  isOpen,
  onClose,
  targetQuestion = null, // if single question
  selectedQuestionIds = [], // if bulk move
  availableSections = [],
  onMoveSuccess
}) => {
  const [selectedSection, setSelectedSection] = useState(
    availableSections[0]?.title || 'Aptitude'
  );
  const [isCustomSection, setIsCustomSection] = useState(false);
  const [customSectionName, setCustomSectionName] = useState('');
  const [moving, setMoving] = useState(false);

  if (!isOpen) return null;

  const isBulk = selectedQuestionIds.length > 0 && !targetQuestion;
  const currentSectionName = targetQuestion?.sectionTitle || targetQuestion?.section || 'Current Section';

  const handleMove = async () => {
    const destinationTitle = isCustomSection ? customSectionName.trim() : selectedSection;
    if (!destinationTitle) {
      alert('Please specify a destination section.');
      return;
    }

    setMoving(true);
    try {
      if (isBulk) {
        await questionService.bulkMove(selectedQuestionIds, null, destinationTitle);
      } else if (targetQuestion) {
        await questionService.moveQuestion(targetQuestion.id, null, destinationTitle);
      }
      onMoveSuccess();
      onClose();
    } catch (err) {
      alert(err.message || 'Failed to move question.');
    } finally {
      setMoving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#06264A] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-white/10 text-[#F5A623]">
              <FolderSync className="w-5 h-5" />
            </span>
            <h3 className="font-extrabold text-base">
              {isBulk ? `Move ${selectedQuestionIds.length} Selected Questions` : 'Move Question'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs">
          
          {!isBulk && targetQuestion && (
            <div className="space-y-1.5">
              <span className="font-bold text-slate-500 uppercase tracking-wider block">Question</span>
              <p className="font-bold text-slate-900 line-clamp-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                "{targetQuestion.questionText}"
              </p>
            </div>
          )}

          {!isBulk && (
            <div>
              <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Current Section
              </span>
              <div className="px-3 py-2 rounded-xl bg-slate-100 font-bold text-slate-700">
                {currentSectionName}
              </div>
            </div>
          )}

          {isBulk && (
            <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 font-medium">
              You are re-categorizing <strong>{selectedQuestionIds.length} questions</strong> into a new evaluation section.
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Move To Section *
            </label>

            {!isCustomSection ? (
              <select
                value={selectedSection}
                onChange={(e) => {
                  if (e.target.value === '__NEW__') {
                    setIsCustomSection(true);
                  } else {
                    setSelectedSection(e.target.value);
                  }
                }}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-bold text-slate-800 text-xs"
              >
                {availableSections.map((sec) => (
                  <option key={sec.id || sec.title} value={sec.title}>
                    {sec.title}
                  </option>
                ))}
                {availableSections.length === 0 && (
                  <>
                    <option value="Aptitude">Aptitude</option>
                    <option value="Reasoning">Reasoning</option>
                    <option value="Technical">Technical</option>
                  </>
                )}
                <option value="__NEW__">+ Create New Section...</option>
              </select>
            ) : (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={customSectionName}
                  onChange={(e) => setCustomSectionName(e.target.value)}
                  placeholder="Enter new section name (e.g. Reasoning)"
                  className="w-full p-2.5 rounded-xl border border-blue-400 bg-blue-50/40 text-xs font-bold"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setIsCustomSection(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 border border-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

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
            disabled={moving}
            onClick={handleMove}
            className="px-5 py-2 rounded-xl bg-[#06264A] hover:bg-[#0A3B72] text-white font-bold flex items-center gap-1.5 shadow-sm"
          >
            {moving ? (
              <span>Moving...</span>
            ) : (
              <>
                <span>{isBulk ? 'Move Questions' : 'Move Question'}</span>
                <ArrowRight className="w-4 h-4 text-[#F5A623]" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default MoveQuestionModal;
