import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  Save,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { questionService } from '../../services/questionService';

export const QuestionEditorModal = ({
  isOpen,
  onClose,
  examId,
  examTitle,
  editingQuestion = null,
  availableSections = [],
  onSaveSuccess,
  totalExamQuestions = 0
}) => {
  const [formData, setFormData] = useState({
    questionText: '',
    section: '',
    newSection: '',
    questionType: 'mcq', // 'mcq' | 'true_false'
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 0,
    marks: 1,
    difficulty: 'Easy',
    explanation: ''
  });

  const [isAddingNewSection, setIsAddingNewSection] = useState(false);
  const [saveBanner, setSaveBanner] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedCount, setSavedCount] = useState(0);

  // Initialize form
  useEffect(() => {
    if (!isOpen) return;
    if (editingQuestion) {
      const isTF = editingQuestion.questionType === 'true_false';
      const opts = editingQuestion.options || [];
      setFormData({
        questionText: editingQuestion.questionText || '',
        section: editingQuestion.sectionTitle || editingQuestion.section || (availableSections[0]?.title || 'Aptitude'),
        newSection: '',
        questionType: isTF ? 'true_false' : 'mcq',
        optionA: opts[0] || editingQuestion.optionA || '',
        optionB: opts[1] || editingQuestion.optionB || '',
        optionC: opts[2] || editingQuestion.optionC || '',
        optionD: opts[3] || editingQuestion.optionD || '',
        correctAnswer: editingQuestion.correctAnswer ?? 0,
        marks: editingQuestion.marks || 1,
        difficulty: editingQuestion.difficulty || 'Easy',
        explanation: editingQuestion.explanation || ''
      });
      setIsAddingNewSection(false);
    } else {
      const defaultSec = availableSections[0]?.title || 'Aptitude';
      setFormData({
        questionText: '',
        section: defaultSec,
        newSection: '',
        questionType: 'mcq',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctAnswer: 0,
        marks: 1,
        difficulty: 'Easy',
        explanation: ''
      });
      setIsAddingNewSection(false);
    }
  }, [editingQuestion, availableSections, isOpen]);

  if (!isOpen) return null;

  const handleTypeToggle = (type) => {
    if (type === 'true_false') {
      setFormData(prev => ({
        ...prev,
        questionType: 'true_false',
        optionA: 'True',
        optionB: 'False',
        optionC: '',
        optionD: '',
        correctAnswer: prev.correctAnswer > 1 ? 0 : prev.correctAnswer
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        questionType: 'mcq',
        optionA: prev.optionA === 'True' ? '' : prev.optionA,
        optionB: prev.optionB === 'False' ? '' : prev.optionB
      }));
    }
  };

  const handleSave = async (andAddAnother = false) => {
    // Basic validation
    if (!formData.questionText.trim()) {
      alert('Please enter the question statement.');
      return;
    }

    const effectiveSection = isAddingNewSection ? formData.newSection.trim() : formData.section.trim();
    if (!effectiveSection) {
      alert('Please select or enter an academic section.');
      return;
    }

    if (formData.questionType === 'mcq') {
      if (!formData.optionA.trim() || !formData.optionB.trim() || !formData.optionC.trim() || !formData.optionD.trim()) {
        alert('Please provide text for all 4 options (A, B, C, D).');
        return;
      }
    }

    setSaving(true);
    try {
      const optionsArray = formData.questionType === 'true_false'
        ? ['True', 'False']
        : [formData.optionA, formData.optionB, formData.optionC, formData.optionD];

      const payload = {
        examId: Number(examId),
        sectionTitle: effectiveSection,
        questionText: formData.questionText.trim(),
        questionType: formData.questionType,
        options: optionsArray,
        optionA: optionsArray[0] || '',
        optionB: optionsArray[1] || '',
        optionC: optionsArray[2] || '',
        optionD: optionsArray[3] || '',
        correctAnswer: Number(formData.correctAnswer),
        marks: Number(formData.marks) || 1,
        difficulty: formData.difficulty,
        explanation: formData.explanation.trim()
      };

      if (editingQuestion) {
        await questionService.updateQuestion(editingQuestion.id, payload);
        onSaveSuccess();
        onClose();
      } else {
        await questionService.createQuestion(payload);
        const newCount = savedCount + 1;
        setSavedCount(newCount);
        onSaveSuccess();

        if (andAddAnother) {
          // Reset form for next question, keeping the active section
          setFormData(prev => ({
            questionText: '',
            section: effectiveSection,
            newSection: '',
            questionType: prev.questionType,
            optionA: prev.questionType === 'true_false' ? 'True' : '',
            optionB: prev.questionType === 'true_false' ? 'False' : '',
            optionC: '',
            optionD: '',
            correctAnswer: 0,
            marks: prev.marks,
            difficulty: prev.difficulty,
            explanation: ''
          }));
          setIsAddingNewSection(false);
          setSaveBanner(`Question ${newCount} saved ✓ Now entering Question ${newCount + 1}.`);
          setTimeout(() => setSaveBanner(null), 4000);
        } else {
          onClose();
        }
      }
    } catch (err) {
      alert(err.message || 'Failed to save question.');
    } finally {
      setSaving(false);
    }
  };

  const letters = ['A', 'B', 'C', 'D'];
  const previewOptions = formData.questionType === 'true_false'
    ? [formData.optionA || 'True', formData.optionB || 'False']
    : [
        formData.optionA || 'Option A statement...',
        formData.optionB || 'Option B statement...',
        formData.optionC || 'Option C statement...',
        formData.optionD || 'Option D statement...'
      ];

  const currentDisplayNumber = editingQuestion
    ? (editingQuestion.questionNumber || 1)
    : (totalExamQuestions + savedCount + 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in my-6 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-[#06264A] text-white p-4 sm:px-6 flex items-center justify-between shrink-0">
          <div>
            <h2 className="font-extrabold text-base sm:text-lg">
              {editingQuestion ? 'Edit Examination Question' : '+ Manual Question Entry'}
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              {examTitle} • Question #{currentDisplayNumber}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Save & Add Another Success Banner */}
        {saveBanner && (
          <div className="bg-emerald-600 text-white px-6 py-2.5 text-xs font-bold flex items-center justify-between animate-in slide-in-from-top duration-200 shrink-0">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              <span>{saveBanner}</span>
            </div>
            <button
              type="button"
              onClick={() => setSaveBanner(null)}
              className="text-emerald-100 hover:text-white text-xs"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Split Layout: Left Editor | Right Live Preview */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-y-auto divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
          
          {/* Left Column: Editor (7 cols) */}
          <div className="lg:col-span-7 p-5 sm:p-6 space-y-4 text-xs overflow-y-auto">
            
            {/* Section & Type Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Section *
                </label>
                {!isAddingNewSection ? (
                  <div className="space-y-1">
                    <select
                      value={formData.section}
                      onChange={(e) => {
                        if (e.target.value === '__NEW__') {
                          setIsAddingNewSection(true);
                        } else {
                          setFormData({ ...formData, section: e.target.value });
                        }
                      }}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-semibold text-slate-800 focus:border-[#06264A] text-xs"
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
                      <option value="__NEW__">+ Add New Section...</option>
                    </select>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={formData.newSection}
                      onChange={(e) => setFormData({ ...formData, newSection: e.target.value })}
                      placeholder="e.g. Quantitative Aptitude"
                      className="w-full p-2.5 rounded-xl border border-blue-400 bg-blue-50/40 text-xs font-semibold"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setIsAddingNewSection(false)}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-600 border border-slate-200"
                      title="Back to existing sections"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Question Type Toggle */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Question Type
                </label>
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => handleTypeToggle('mcq')}
                    className={`py-1.5 px-2 rounded-lg font-bold transition-all ${
                      formData.questionType === 'mcq'
                        ? 'bg-[#06264A] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Multiple Choice
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeToggle('true_false')}
                    className={`py-1.5 px-2 rounded-lg font-bold transition-all ${
                      formData.questionType === 'true_false'
                        ? 'bg-[#06264A] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    True / False
                  </button>
                </div>
              </div>
            </div>

            {/* Question Text */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Question Text *
              </label>
              <textarea
                value={formData.questionText}
                onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                rows={3}
                placeholder="Enter the full question statement..."
                className="w-full p-3 rounded-2xl border border-slate-300 focus:outline-hidden focus:border-[#06264A] text-xs font-medium"
              />
            </div>

            {/* Answer Options & Direct Correct Answer Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block font-bold text-slate-700 uppercase tracking-wider">
                  Options & Correct Answer Selection *
                </label>
                <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Click option letter to set correct answer
                </span>
              </div>

              {formData.questionType === 'true_false' ? (
                /* True / False Options */
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'True', index: 0 },
                    { label: 'False', index: 1 }
                  ].map((item) => (
                    <div
                      key={item.index}
                      onClick={() => setFormData({ ...formData, correctAnswer: item.index })}
                      className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                        formData.correctAnswer === item.index
                          ? 'border-emerald-600 bg-emerald-50/80 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <span className="font-extrabold text-slate-800 text-sm">{item.label}</span>
                      {formData.correctAnswer === item.index ? (
                        <span className="p-1 rounded-full bg-emerald-600 text-white">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span className="w-4 h-4 rounded-full border border-slate-300"></span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                /* MCQ Options (A - D) */
                <div className="space-y-2">
                  {[
                    { key: 'optionA', letter: 'A', idx: 0 },
                    { key: 'optionB', letter: 'B', idx: 1 },
                    { key: 'optionC', letter: 'C', idx: 2 },
                    { key: 'optionD', letter: 'D', idx: 3 }
                  ].map((opt) => (
                    <div
                      key={opt.key}
                      className={`p-2.5 rounded-2xl border-2 transition-all flex items-center gap-2 ${
                        formData.correctAnswer === opt.idx
                          ? 'border-emerald-500 bg-emerald-50/60 shadow-xs'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      {/* Clickable Letter to set as Correct Answer */}
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, correctAnswer: opt.idx })}
                        className={`w-7 h-7 rounded-xl font-bold flex items-center justify-center shrink-0 transition-colors ${
                          formData.correctAnswer === opt.idx
                            ? 'bg-emerald-600 text-white ring-2 ring-emerald-300'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                        title="Click to select this as correct answer"
                      >
                        {formData.correctAnswer === opt.idx ? '✓' : opt.letter}
                      </button>

                      <input
                        type="text"
                        value={formData[opt.key]}
                        onChange={(e) => setFormData({ ...formData, [opt.key]: e.target.value })}
                        placeholder={`Option ${opt.letter} text...`}
                        className="w-full bg-transparent text-xs focus:outline-hidden font-medium text-slate-800"
                      />

                      {formData.correctAnswer === opt.idx && (
                        <span className="text-[11px] font-bold text-emerald-700 uppercase shrink-0 px-2 py-0.5 rounded-md bg-emerald-100">
                          Correct
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Marks & Difficulty */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Marks
                </label>
                <input
                  type="number"
                  min={1}
                  value={formData.marks}
                  onChange={(e) => setFormData({ ...formData, marks: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Difficulty
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-semibold"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            {/* Explanation */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Faculty Explanation (Optional)
              </label>
              <textarea
                value={formData.explanation}
                onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                rows={2}
                placeholder="Rationale to be displayed to candidate during evaluation review..."
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium"
              />
            </div>

          </div>

          {/* Right Column: Live Question Preview (5 cols) */}
          <div className="lg:col-span-5 p-5 sm:p-6 bg-slate-50 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" /> Candidate Live Preview
                </span>
                <span className="font-bold text-xs bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                  +{formData.marks || 1} Mark(s)
                </span>
              </div>

              {/* Student Exam Card Preview */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-academic space-y-4">
                
                {/* Meta Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-[11px]">
                  <span className="font-bold px-2 py-0.5 rounded-md bg-[#06264A] text-white">
                    {isAddingNewSection ? (formData.newSection || 'New Section') : (formData.section || 'General Section')}
                  </span>
                  <span className="font-semibold text-slate-500">
                    Difficulty: <strong className="text-slate-800">{formData.difficulty}</strong>
                  </span>
                </div>

                {/* Question Statement */}
                <div>
                  <span className="font-mono text-xs font-extrabold text-[#06264A] block mb-1">
                    QUESTION {currentDisplayNumber}
                  </span>
                  <p className="text-sm font-bold text-slate-900 leading-relaxed">
                    {formData.questionText || 'Your question statement will appear here as you type...'}
                  </p>
                </div>

                {/* Options List */}
                <div className="space-y-2 pt-1">
                  {previewOptions.map((opt, i) => {
                    const isCorrect = i === formData.correctAnswer;
                    return (
                      <div
                        key={i}
                        className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                          isCorrect
                            ? 'border-emerald-500 bg-emerald-50/70 text-emerald-900 font-bold'
                            : 'border-slate-200 bg-slate-50/70 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-md bg-white border border-slate-300 font-mono text-xs font-bold flex items-center justify-center">
                            {letters[i]}
                          </span>
                          <span className="text-xs">{opt}</span>
                        </div>
                        {isCorrect && (
                          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                            <span>✓</span>
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation in Preview */}
                {formData.explanation && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-[11px] text-amber-900 space-y-0.5">
                    <strong className="block text-[#06264A]">Explanation:</strong>
                    <p>{formData.explanation}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 text-center text-[11px] text-slate-400">
              ⚡ Changes sync instantly to candidate preview
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 sm:px-6 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 font-semibold hover:bg-slate-100 text-slate-700"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            {!editingQuestion && (
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSave(true)}
                className="px-4 py-2.5 rounded-xl border-2 border-[#06264A] text-[#06264A] font-bold text-xs hover:bg-[#06264A]/5 flex items-center gap-1.5 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Save & Add Another</span>
              </button>
            )}

            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave(false)}
              className="px-5 py-2.5 rounded-xl bg-[#06264A] hover:bg-[#0A3B72] text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-all"
            >
              {saving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span>{editingQuestion ? 'Update Question' : 'Save Question'}</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default QuestionEditorModal;
