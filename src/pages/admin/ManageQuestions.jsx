import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { questionService } from '../../services/questionService';
import { examService } from '../../services/examService';
import { downloadQuestionTemplate } from '../../utils/questionImporter';
import { BulkUploadModal } from '../../components/admin/BulkUploadModal';
import { QuestionEditorModal } from '../../components/admin/QuestionEditorModal';
import { MoveQuestionModal } from '../../components/admin/MoveQuestionModal';
import {
  FileQuestion,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  Upload,
  Download,
  ClipboardPaste,
  Copy,
  Search,
  Layers,
  FolderSync,
  Eye,
  CheckSquare,
  Square,
  ChevronDown,
  FileSpreadsheet
} from 'lucide-react';

export const ManageQuestions = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const examIdParam = searchParams.get('examId');

  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState(examIdParam || '1');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSectionFilter, setSelectedSectionFilter] = useState('ALL');
  const [selectedDifficultyFilter, setSelectedDifficultyFilter] = useState('ALL');

  // Numbering Mode: 'global' vs 'section'
  const [numberingMode, setNumberingMode] = useState('global');

  // Multi-select state
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);

  // Modals state
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [targetQuestionForMove, setTargetQuestionForMove] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [targetQuestionForDelete, setTargetQuestionForDelete] = useState(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const [previewQuestion, setPreviewQuestion] = useState(null);
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);

  const fetchQuestions = useCallback(async (examId) => {
    setLoading(true);
    try {
      const data = await questionService.getQuestionsByExamId(examId);
      setQuestions(data);
    } catch (err) {
      console.error('Failed to load questions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load exams
  useEffect(() => {
    const initExams = async () => {
      try {
        const allExams = await examService.getExams();
        setExams(allExams);
        if (allExams.length > 0 && !examIdParam) {
          setSelectedExamId(String(allExams[0].id));
        }
      } catch (err) {
        console.error('Failed to load exams:', err);
      }
    };
    initExams();
  }, [examIdParam]);

  // Load questions and numbering mode whenever selected exam changes
  useEffect(() => {
    if (selectedExamId) {
      fetchQuestions(selectedExamId);
      const savedMode = questionService.getNumberingMode(selectedExamId);
      setNumberingMode(savedMode);
      setSelectedQuestionIds([]);
    }
  }, [selectedExamId, fetchQuestions]);

  const currentExam = useMemo(() => {
    return exams.find(e => e.id === Number(selectedExamId)) || {
      title: 'Examination',
      code: 'EXAM',
      sections: []
    };
  }, [exams, selectedExamId]);

  // Available sections in current questions or exam
  const availableSections = useMemo(() => {
    const secMap = new Map();
    // From exam config
    if (currentExam.sections) {
      currentExam.sections.forEach(s => secMap.set(s.title, s));
    }
    // From loaded questions
    questions.forEach(q => {
      const title = q.sectionTitle || q.section;
      if (title && !secMap.has(title)) {
        secMap.set(title, { id: q.sectionId, title });
      }
    });
    return Array.from(secMap.values());
  }, [currentExam, questions]);

  // Compute question numbers based on numbering mode (Global vs Section-Wise)
  const numberedQuestions = useMemo(() => {
    if (numberingMode === 'section') {
      // Group by section and number Q1-Qn per section
      const sectionCounters = {};
      return questions.map(q => {
        const sec = q.sectionTitle || q.section || 'General';
        sectionCounters[sec] = (sectionCounters[sec] || 0) + 1;
        return {
          ...q,
          displayNumber: `Q${sectionCounters[sec]}`
        };
      });
    } else {
      // Global numbering: Q1-Qn continuous
      return questions.map((q, idx) => ({
        ...q,
        displayNumber: `Q${idx + 1}`
      }));
    }
  }, [questions, numberingMode]);

  // Filtered questions
  const filteredQuestions = useMemo(() => {
    return numberedQuestions.filter(q => {
      // Search filter
      const matchesSearch =
        !searchTerm.trim() ||
        q.questionText?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.explanation?.toLowerCase().includes(searchTerm.toLowerCase());

      // Section filter
      const qSec = q.sectionTitle || q.section || '';
      const matchesSection =
        selectedSectionFilter === 'ALL' ||
        qSec.toLowerCase() === selectedSectionFilter.toLowerCase();

      // Difficulty filter
      const matchesDifficulty =
        selectedDifficultyFilter === 'ALL' ||
        q.difficulty?.toLowerCase() === selectedDifficultyFilter.toLowerCase();

      return matchesSearch && matchesSection && matchesDifficulty;
    });
  }, [numberedQuestions, searchTerm, selectedSectionFilter, selectedDifficultyFilter]);

  // Toggle numbering mode
  const handleToggleNumbering = (mode) => {
    setNumberingMode(mode);
    questionService.setNumberingMode(selectedExamId, mode);
  };

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedQuestionIds.length === filteredQuestions.length) {
      setSelectedQuestionIds([]);
    } else {
      setSelectedQuestionIds(filteredQuestions.map(q => q.id));
    }
  };

  const handleToggleSelectOne = (id) => {
    setSelectedQuestionIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Actions
  const handleOpenAdd = () => {
    setEditingQuestion(null);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (q) => {
    setEditingQuestion(q);
    setIsEditorOpen(true);
  };

  const handleDuplicate = async (q) => {
    try {
      await questionService.duplicateQuestion(q.id);
      fetchQuestions(selectedExamId);
    } catch (err) {
      console.error('Failed to duplicate question:', err);
      alert('Failed to duplicate question');
    }
  };

  const handleOpenMoveSingle = (q) => {
    setTargetQuestionForMove(q);
    setSelectedQuestionIds([]);
    setIsMoveModalOpen(true);
  };

  const handleOpenMoveBulk = () => {
    setTargetQuestionForMove(null);
    setIsMoveModalOpen(true);
  };

  const handleConfirmDeleteSingle = (q) => {
    setTargetQuestionForDelete(q);
    setIsBulkDeleting(false);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDeleteBulk = () => {
    setTargetQuestionForDelete(null);
    setIsBulkDeleting(true);
    setIsDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    try {
      if (isBulkDeleting) {
        for (const id of selectedQuestionIds) {
          await questionService.deleteQuestion(id);
        }
        setSelectedQuestionIds([]);
      } else if (targetQuestionForDelete) {
        await questionService.deleteQuestion(targetQuestionForDelete.id);
      }
      setIsDeleteModalOpen(false);
      fetchQuestions(selectedExamId);
    } catch (err) {
      console.error('Failed to delete question(s):', err);
      alert('Failed to delete question(s)');
    }
  };

  const letters = ['A', 'B', 'C', 'D'];
  const totalMarks = questions.reduce((sum, q) => sum + (Number(q.marks) || 1), 0);

  return (
    <div className="space-y-6 pb-20">
      
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#06264A] text-white flex items-center justify-center font-bold shadow-md">
              <FileSpreadsheet className="w-5 h-5 text-[#F5A623]" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-[#06264A]">Question Bank Management</h1>
              <p className="text-xs text-slate-500">
                Bulk upload, curate, validate, and structure examination questions by academic sections
              </p>
            </div>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          
          <Link
            to={`/admin/sections?examId=${selectedExamId}`}
            className="px-3.5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 font-bold text-xs text-slate-700 flex items-center gap-1.5 transition-all shadow-xs"
            title="Configure examination structure, section timers, and reorder"
          >
            <Layers className="w-4 h-4 text-[#06264A]" />
            <span>Sections Structure</span>
          </Link>

          {/* Template Download with Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 font-bold text-xs text-slate-700 flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Download Template</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showTemplateDropdown && (
              <div className="absolute right-0 mt-1.5 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-30 animate-in fade-in">
                <button
                  type="button"
                  onClick={() => { downloadQuestionTemplate('xlsx'); setShowTemplateDropdown(false); }}
                  className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-[#06264A] flex items-center justify-between"
                >
                  <span>Excel Format (.xlsx)</span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-sm bg-emerald-100 text-emerald-800">
                    Recommended
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => { downloadQuestionTemplate('csv'); setShowTemplateDropdown(false); }}
                  className="w-full px-4 py-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  CSV Plain Text (.csv)
                </button>
              </div>
            )}
          </div>

          {/* 📁 Upload All Questions (Primary!) */}
          <button
            type="button"
            onClick={() => setIsBulkUploadOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#06264A] hover:bg-[#0A3B72] text-white font-extrabold text-xs flex items-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            <Upload className="w-4 h-4 text-[#F5A623]" />
            <span>📁 Upload All Questions</span>
          </button>

          {/* 📋 Paste Questions */}
          <button
            type="button"
            onClick={() => setIsBulkUploadOpen(true)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
          >
            <ClipboardPaste className="w-4 h-4 text-slate-500" />
            <span>📋 Paste Questions</span>
          </button>

          {/* + Add Question (Manual) */}
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Question</span>
          </button>

        </div>
      </div>

      {/* Control Bar: Active Exam Selector & Numbering Mode Configurator */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-academic items-center">
        
        {/* Exam Selection */}
        <div className="md:col-span-6 flex items-center gap-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
            Active Examination:
          </span>
          <select
            value={selectedExamId}
            onChange={(e) => {
              setSelectedExamId(e.target.value);
              setSearchParams({ examId: e.target.value });
            }}
            className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-xs text-[#06264A] bg-slate-50 focus:border-[#06264A]"
          >
            {exams.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.title} ({ex.code}) • {ex.durationMinutes}m
              </option>
            ))}
          </select>
        </div>

        {/* Numbering Mode Toggle (Section 8 requirement) */}
        <div className="md:col-span-6 flex flex-wrap items-center justify-end gap-3">
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl text-xs">
            <span className="font-bold text-slate-500 px-2 text-[11px] uppercase">
              Numbering:
            </span>
            <button
              type="button"
              onClick={() => handleToggleNumbering('global')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                numberingMode === 'global'
                  ? 'bg-[#06264A] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Global continuous numbering (Q1 - Qn)"
            >
              Global (Q1 - Q{questions.length || 'n'})
            </button>
            <button
              type="button"
              onClick={() => handleToggleNumbering('section')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                numberingMode === 'section'
                  ? 'bg-[#06264A] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Section-wise numbering (Q1 - Qn per section)"
            >
              Section-Wise (Q1-Qn per Section)
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs font-extrabold px-3 py-1.5 rounded-xl bg-blue-50 text-[#06264A] border border-blue-200">
            <span>Questions: {questions.length}</span>
            <span>•</span>
            <span>Total Marks: {totalMarks}</span>
          </div>
        </div>

      </div>

      {/* Filter & Search Bar (Section 15 requirement) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-xs">
        
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute inset-y-0 left-3 my-auto pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search questions by text or keywords..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:border-[#06264A]"
          />
        </div>

        {/* Section Filter & Difficulty Filter */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          
          {/* Section Filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Section:</span>
            <select
              value={selectedSectionFilter}
              onChange={(e) => setSelectedSectionFilter(e.target.value)}
              className="p-2 rounded-xl border border-slate-300 font-semibold text-slate-700 bg-white"
            >
              <option value="ALL">All Sections</option>
              {availableSections.map((sec) => (
                <option key={sec.id || sec.title} value={sec.title}>
                  {sec.title}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Difficulty:</span>
            <select
              value={selectedDifficultyFilter}
              onChange={(e) => setSelectedDifficultyFilter(e.target.value)}
              className="p-2 rounded-xl border border-slate-300 font-semibold text-slate-700 bg-white"
            >
              <option value="ALL">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

        </div>

      </div>

      {/* Bulk Action Selection Toolbar (Section 17 requirement) */}
      {selectedQuestionIds.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-[#06264A] text-white flex flex-wrap items-center justify-between gap-3 shadow-lg animate-in slide-in-from-top duration-150">
          <div className="flex items-center gap-2 font-bold text-xs">
            <span className="w-6 h-6 rounded-full bg-[#F5A623] text-[#06264A] flex items-center justify-center text-xs font-black">
              {selectedQuestionIds.length}
            </span>
            <span>Questions Selected</span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={handleOpenMoveBulk}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold flex items-center gap-1.5 transition-colors"
            >
              <FolderSync className="w-3.5 h-3.5 text-[#F5A623]" />
              <span>Move Selected to Section</span>
            </button>

            <button
              type="button"
              onClick={handleConfirmDeleteBulk}
              className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedQuestionIds([])}
              className="px-2.5 py-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Questions Table (Section 14 requirement) */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-academic">
        {loading ? (
          <div className="p-16 text-center text-slate-500 space-y-3">
            <div className="w-8 h-8 border-4 border-[#06264A] border-t-[#F5A623] rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-bold text-slate-700">Loading Examination Bank...</p>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="p-16 text-center text-slate-500 space-y-3">
            <FileQuestion className="w-14 h-14 text-slate-300 mx-auto" />
            <h3 className="font-extrabold text-slate-800 text-base">
              {questions.length === 0 ? 'No Questions in this Examination Bank' : 'No matching questions found'}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {questions.length === 0
                ? 'Use "Upload All Questions" to import your entire question roster at once from Excel or CSV.'
                : 'Try adjusting your search criteria or section filter.'}
            </p>
            {questions.length === 0 && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsBulkUploadOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-[#06264A] text-white font-bold text-xs inline-flex items-center gap-2 hover:bg-[#0A3B72]"
                >
                  <Upload className="w-4 h-4 text-[#F5A623]" />
                  <span>Upload from Excel / CSV</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F7FA] text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-4 px-4 w-10 text-center">
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="p-1 hover:text-[#06264A]"
                      title="Select / Deselect all"
                    >
                      {selectedQuestionIds.length === filteredQuestions.length && filteredQuestions.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-[#06264A]" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  </th>
                  <th className="py-4 px-3 w-16 text-center">#</th>
                  <th className="py-4 px-6 min-w-[320px]">Question</th>
                  <th className="py-4 px-4">Section</th>
                  <th className="py-4 px-4 text-center">Marks</th>
                  <th className="py-4 px-4 text-center">Difficulty</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredQuestions.map((q) => {
                  const isSelected = selectedQuestionIds.includes(q.id);
                  const isTF = q.questionType === 'true_false';
                  const opts = isTF ? ['True', 'False'] : (q.options || []);

                  return (
                    <tr
                      key={q.id}
                      className={`transition-colors ${
                        isSelected ? 'bg-blue-50/50' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-4 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectOne(q.id)}
                          className="w-4 h-4 rounded-md text-[#06264A] focus:ring-0 cursor-pointer"
                        />
                      </td>

                      {/* Configured Numbering */}
                      <td className="py-4 px-3 text-center font-mono font-extrabold text-slate-700">
                        {q.displayNumber}
                      </td>

                      {/* Question Text & Options Summary */}
                      <td className="py-4 px-6">
                        <div className="space-y-1.5">
                          <p className="font-bold text-slate-900 text-xs leading-snug">
                            {q.questionText}
                          </p>

                          {/* Options pills */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                            {opts.map((opt, oIdx) => {
                              const isCorrect = oIdx === q.correctAnswer;
                              return (
                                <span
                                  key={oIdx}
                                  className={`text-[10px] px-2 py-0.5 rounded-md font-medium flex items-center gap-1 ${
                                    isCorrect
                                      ? 'bg-emerald-100 text-emerald-800 font-bold border border-emerald-300'
                                      : 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  <span className="font-mono">{letters[oIdx]}.</span>
                                  <span className="truncate max-w-[120px]">{opt}</span>
                                  {isCorrect && <Check className="w-3 h-3 text-emerald-700" />}
                                </span>
                              );
                            })}
                          </div>

                          {q.explanation && (
                            <p className="text-[11px] text-slate-400 italic line-clamp-1">
                              Rationale: {q.explanation}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Section */}
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-blue-50 text-[#06264A] font-bold text-[11px] border border-blue-200/60 inline-block">
                          {q.sectionTitle || q.section || 'General'}
                        </span>
                      </td>

                      {/* Marks */}
                      <td className="py-4 px-4 text-center font-black text-slate-700">
                        +{q.marks || 1}
                      </td>

                      {/* Difficulty */}
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            q.difficulty === 'Easy'
                              ? 'bg-emerald-100 text-emerald-800'
                              : q.difficulty === 'Medium'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {q.difficulty || 'Easy'}
                        </span>
                      </td>

                      {/* Actions: Edit, Duplicate, Move, Delete, Preview */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          
                          {/* Preview Action */}
                          <button
                            type="button"
                            onClick={() => setPreviewQuestion(q)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#06264A] hover:bg-slate-100"
                            title="Preview question"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit Action */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(q)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50"
                            title="Edit question"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Duplicate Action (Section 18) */}
                          <button
                            type="button"
                            onClick={() => handleDuplicate(q)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                            title="Duplicate question"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          {/* Move Question Action (Section 16) */}
                          <button
                            type="button"
                            onClick={() => handleOpenMoveSingle(q)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
                            title="Move to another section"
                          >
                            <FolderSync className="w-4 h-4" />
                          </button>

                          {/* Delete Action (Section 19) */}
                          <button
                            type="button"
                            onClick={() => handleConfirmDeleteSingle(q)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50"
                            title="Delete question"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bulk Upload & Paste Modal (Sections 1, 3, 4, 5, 6, 7) */}
      <BulkUploadModal
        isOpen={isBulkUploadOpen}
        onClose={() => setIsBulkUploadOpen(false)}
        examId={selectedExamId}
        examTitle={currentExam.title}
        existingQuestions={questions}
        onUploadSuccess={() => fetchQuestions(selectedExamId)}
      />

      {/* Question Editor with Split Live Preview (Sections 10, 11, 12, 13) */}
      <QuestionEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        examId={selectedExamId}
        examTitle={currentExam.title}
        editingQuestion={editingQuestion}
        availableSections={availableSections}
        onSaveSuccess={() => fetchQuestions(selectedExamId)}
        totalExamQuestions={questions.length}
      />

      {/* Move Question Modal (Sections 16, 17) */}
      <MoveQuestionModal
        isOpen={isMoveModalOpen}
        onClose={() => setIsMoveModalOpen(false)}
        targetQuestion={targetQuestionForMove}
        selectedQuestionIds={selectedQuestionIds}
        availableSections={availableSections}
        onMoveSuccess={() => {
          setSelectedQuestionIds([]);
          fetchQuestions(selectedExamId);
        }}
      />

      {/* Delete Confirmation Modal (Section 19) */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-4 text-xs">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-extrabold text-base text-slate-900">
                {isBulkDeleting ? `Delete ${selectedQuestionIds.length} Questions?` : 'Delete Question?'}
              </h3>
              <p className="text-slate-500">
                This question will be permanently removed from the university examination bank.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-5 py-2 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeDelete}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Preview Modal */}
      {previewQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-[#06264A] text-white p-5 flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-[#F5A623]">
                  {previewQuestion.displayNumber || `Question #${previewQuestion.id}`}
                </span>
                <p className="text-xs text-slate-300">
                  Section: {previewQuestion.sectionTitle || previewQuestion.section}
                </p>
              </div>
              <button
                onClick={() => setPreviewQuestion(null)}
                className="text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-sm font-bold text-slate-900 leading-relaxed">
                {previewQuestion.questionText}
              </p>

              <div className="space-y-2">
                {(previewQuestion.questionType === 'true_false'
                  ? ['True', 'False']
                  : (previewQuestion.options || [])
                ).map((opt, oIdx) => {
                  const isCorrect = oIdx === previewQuestion.correctAnswer;
                  return (
                    <div
                      key={oIdx}
                      className={`p-3 rounded-xl border flex items-center justify-between ${
                        isCorrect
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold'
                          : 'border-slate-200 bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold">{letters[oIdx]}.</span>
                        <span>{opt}</span>
                      </div>
                      {isCorrect && <span className="font-bold text-emerald-600">✓ Correct</span>}
                    </div>
                  );
                })}
              </div>

              {previewQuestion.explanation && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                  <strong className="block text-[#06264A]">Faculty Explanation:</strong>
                  <span>{previewQuestion.explanation}</span>
                </div>
              )}
            </div>

            <div className="bg-slate-50 p-4 px-6 border-t border-slate-200 text-right">
              <button
                type="button"
                onClick={() => setPreviewQuestion(null)}
                className="px-4 py-2 rounded-xl bg-[#06264A] text-white font-bold text-xs"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManageQuestions;
