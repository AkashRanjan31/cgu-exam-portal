import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { examService } from '../../services/examService';
import { sectionService } from '../../services/sectionService';
import { questionService } from '../../services/questionService';
import { AddEditSectionModal } from '../../components/admin/AddEditSectionModal';
import { DeleteSectionModal } from '../../components/admin/DeleteSectionModal';
import { SectionQuestionsDrawer } from '../../components/admin/SectionQuestionsDrawer';
import { BulkUploadModal } from '../../components/admin/BulkUploadModal';
import { QuestionEditorModal } from '../../components/admin/QuestionEditorModal';
import { MoveQuestionModal } from '../../components/admin/MoveQuestionModal';
import {
  Layers,
  Clock,
  Plus,
  Upload,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  Eye,
  GripVertical,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export const ManageSections = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const examIdParam = searchParams.get('examId');

  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState(examIdParam || '1');
  const [sections, setSections] = useState([]);
  const [allQuestions, setAllQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [targetSectionForDelete, setTargetSectionForDelete] = useState(null);

  const [isQuestionsDrawerOpen, setIsQuestionsDrawerOpen] = useState(false);
  const [activeViewingSection, setActiveViewingSection] = useState(null);

  // Upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadLockSection, setUploadLockSection] = useState(null);

  // Question editing / move from drawer
  const [isQuestionEditorOpen, setIsQuestionEditorOpen] = useState(false);
  const [editingQuestionObj, setEditingQuestionObj] = useState(null);

  const [isMoveQuestionModalOpen, setIsMoveQuestionModalOpen] = useState(false);
  const [targetQuestionForMove, setTargetQuestionForMove] = useState(null);

  // Drag-and-drop state
  const [draggedIndex, setDraggedIndex] = useState(null);

  // Load all exams
  useEffect(() => {
    const initData = async () => {
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
    initData();
  }, [examIdParam]);

  const loadExamStructure = useCallback(async (examId) => {
    setLoading(true);
    try {
      const [secData, questData] = await Promise.all([
        sectionService.getSectionsByExamId(examId),
        questionService.getQuestionsByExamId(examId)
      ]);
      setSections(secData);
      setAllQuestions(questData);
    } catch (err) {
      console.error('Failed to load exam structure:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch sections & questions when selected exam changes
  useEffect(() => {
    if (selectedExamId) {
      loadExamStructure(selectedExamId);
    }
  }, [selectedExamId, loadExamStructure]);

  const activeExam = useMemo(() => {
    return exams.find(e => e.id === Number(selectedExamId)) || {
      id: 1,
      title: 'University Examination',
      code: 'EXAM',
      subject: 'Department of Computer Science'
    };
  }, [exams, selectedExamId]);

  // Up / Down Reorder
  const handleMoveOrder = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const newSections = [...sections];
    const [moved] = newSections.splice(index, 1);
    newSections.splice(targetIndex, 0, moved);

    const orderedIds = newSections.map(s => s.id);
    try {
      await sectionService.reorderSections(selectedExamId, orderedIds);
      loadExamStructure(selectedExamId);
    } catch (err) {
      console.error('Failed to reorder sections:', err);
      alert('Failed to reorder sections');
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newSections = [...sections];
    const [draggedItem] = newSections.splice(draggedIndex, 1);
    newSections.splice(dropIndex, 0, draggedItem);

    setDraggedIndex(null);
    const orderedIds = newSections.map(s => s.id);
    try {
      await sectionService.reorderSections(selectedExamId, orderedIds);
      loadExamStructure(selectedExamId);
    } catch (err) {
      console.error('Failed to reorder sections:', err);
      alert('Failed to reorder sections');
    }
  };

  // Add / Edit Section Handlers
  const handleOpenAddSection = () => {
    setEditingSection(null);
    setIsAddEditModalOpen(true);
  };

  const handleOpenEditSection = (sec) => {
    setEditingSection(sec);
    setIsAddEditModalOpen(true);
  };

  // Delete Section
  const handleOpenDeleteSection = (sec) => {
    setTargetSectionForDelete(sec);
    setIsDeleteModalOpen(true);
  };

  // View Questions in Drawer
  const handleOpenViewQuestions = (sec) => {
    setActiveViewingSection(sec);
    setIsQuestionsDrawerOpen(true);
  };

  // Global Upload
  const handleOpenGlobalUpload = () => {
    setUploadLockSection(null);
    setIsUploadModalOpen(true);
  };

  // Section-specific Upload
  const handleOpenSectionUpload = (sec) => {
    setUploadLockSection(sec);
    setIsUploadModalOpen(true);
  };

  // Add question from drawer
  const handleOpenAddQuestionToSection = (sec) => {
    setEditingQuestionObj(sec ? { section: sec.title || sec.name, sectionId: sec.id } : null);
    setIsQuestionEditorOpen(true);
  };

  // Edit question from drawer
  const handleOpenEditQuestion = (q) => {
    setEditingQuestionObj(q);
    setIsQuestionEditorOpen(true);
  };

  // Move question from drawer
  const handleOpenMoveQuestion = (q) => {
    setTargetQuestionForMove(q);
    setIsMoveQuestionModalOpen(true);
  };

  // Aggregate Totals
  const totalQuestions = sections.reduce((sum, s) => sum + (s.questionCount || 0), 0);
  const totalMarks = sections.reduce((sum, s) => sum + (s.totalMarks || 0), 0);
  const totalDuration = sections.reduce((sum, s) => sum + (Number(s.durationMinutes) || 0), 0);

  return (
    <div className="space-y-6 pb-20">
      
      {/* Top Banner & Exam Selector */}
      <div className="bg-[#06264A] text-white p-6 sm:p-8 rounded-3xl shadow-academic flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#F5A623] mb-1">
            <Layers className="w-4 h-4" />
            <span>CVRGU Examination Architecture Controller</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight uppercase">
            {activeExam.title} ({activeExam.code})
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            {activeExam.subject} • Configure sequential section locking, timers, and question rosters
          </p>
        </div>

        {/* Exam Quick Dropdown */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="bg-white/10 p-1.5 rounded-2xl border border-white/10 flex items-center gap-2 text-xs">
            <span className="text-slate-300 font-bold px-2 text-[11px] uppercase">Exam:</span>
            <select
              value={selectedExamId}
              onChange={(e) => {
                setSelectedExamId(e.target.value);
                setSearchParams({ examId: e.target.value });
              }}
              className="bg-[#031A33] text-white p-2 rounded-xl border border-white/10 font-bold text-xs focus:outline-hidden"
            >
              {exams.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.title} ({ex.code})
                </option>
              ))}
            </select>
          </div>

          <Link
            to={`/admin/questions?examId=${selectedExamId}`}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Full Question Bank</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Examination Structure Summary Bar (Section 16 requirement) */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-academic space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Architecture Overview
            </span>
            <h2 className="text-lg font-black text-[#06264A] tracking-tight">
              EXAMINATION STRUCTURE
            </h2>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleOpenGlobalUpload}
              className="px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all"
            >
              <Upload className="w-4 h-4 text-[#06264A]" />
              <span>Upload All Questions</span>
            </button>

            <button
              type="button"
              onClick={handleOpenAddSection}
              className="px-4 py-2.5 rounded-xl bg-[#06264A] hover:bg-[#0A3B72] text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 text-[#F5A623]" />
              <span>+ Add Section</span>
            </button>
          </div>
        </div>

        {/* Sequential Sequence Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100">
            <span className="text-[10px] font-bold text-blue-700 uppercase block">Sections</span>
            <span className="text-xl font-black text-[#06264A] mt-0.5 block">
              {sections.length} Active
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-100">
            <span className="text-[10px] font-bold text-indigo-700 uppercase block">Total Questions</span>
            <span className="text-xl font-black text-indigo-900 mt-0.5 block">
              {totalQuestions} Qs
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100">
            <span className="text-[10px] font-bold text-emerald-700 uppercase block">Total Marks</span>
            <span className="text-xl font-black text-emerald-800 mt-0.5 block">
              {totalMarks} Marks
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-100">
            <span className="text-[10px] font-bold text-amber-700 uppercase block">Total Duration</span>
            <span className="text-xl font-black text-amber-900 mt-0.5 block">
              {totalDuration} Mins
            </span>
          </div>
        </div>

        {/* Sequential Lock Notice */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 text-xs flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-[#06264A] shrink-0" />
          <span>
            <strong>Strict Sequential Locking Policy:</strong> Students advance strictly in the order displayed below. Once a section is submitted or its timer concludes, it is permanently locked and cannot be reopened.
          </span>
        </div>
      </div>

      {/* Sections Roster (Section 22 requirement) */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white rounded-3xl p-16 border border-slate-200 text-center text-slate-500 space-y-3">
            <div className="w-8 h-8 border-4 border-[#06264A] border-t-[#F5A623] rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-bold text-slate-700">Loading Examination Structure...</p>
          </div>
        ) : sections.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl p-16 border border-slate-200 text-center text-slate-500 space-y-3">
            <Layers className="w-14 h-14 text-slate-300 mx-auto" />
            <h3 className="font-extrabold text-slate-800 text-base">No Sections Configured Yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Create sections manually (e.g. Aptitude, Reasoning, Technical) or upload an Excel/CSV file to generate them automatically.
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleOpenAddSection}
                className="px-5 py-2.5 rounded-xl bg-[#06264A] text-white font-bold text-xs inline-flex items-center gap-2 hover:bg-[#0A3B72]"
              >
                <Plus className="w-4 h-4 text-[#F5A623]" />
                <span>+ Add Section</span>
              </button>
              <button
                type="button"
                onClick={handleOpenGlobalUpload}
                className="px-5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-700 font-bold text-xs inline-flex items-center gap-2 hover:bg-slate-100"
              >
                <Upload className="w-4 h-4 text-[#06264A]" />
                <span>Upload Excel File</span>
              </button>
            </div>
          </div>
        ) : (
          /* Sequential Section Cards */
          sections.map((sec, idx) => (
            <div
              key={sec.id}
              draggable
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDrop={(e) => handleDrop(e, idx)}
              className={`bg-white rounded-3xl p-5 sm:p-6 border-2 transition-all shadow-sm hover:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                draggedIndex === idx ? 'opacity-40 border-dashed border-[#06264A]' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Left Side: Order, Drag, Title & Metrics */}
              <div className="flex items-start sm:items-center gap-4">
                
                {/* Reorder Arrows & Drag Handle */}
                <div className="flex flex-col items-center justify-center gap-1 text-slate-400 bg-slate-50 p-1.5 rounded-2xl border border-slate-200 shrink-0">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMoveOrder(idx, -1)}
                    className="p-1 rounded-lg hover:bg-slate-200 text-slate-600 disabled:opacity-20 transition-colors"
                    title="Move section earlier in student sequence"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>

                  <GripVertical className="w-3.5 h-3.5 text-slate-300 cursor-grab" title="Drag to reorder" />

                  <button
                    type="button"
                    disabled={idx === sections.length - 1}
                    onClick={() => handleMoveOrder(idx, 1)}
                    className="p-1 rounded-lg hover:bg-slate-200 text-slate-600 disabled:opacity-20 transition-colors"
                    title="Move section later in student sequence"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Section Details */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[#06264A] text-white font-mono font-extrabold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <h3 className="font-extrabold text-base text-slate-900 uppercase tracking-tight">
                      {sec.title || sec.name}
                    </h3>
                  </div>

                  {/* Section Metrics */}
                  <div className="flex flex-wrap items-center gap-2 text-xs pt-0.5">
                    <span className="font-bold text-[#06264A] bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-200/60">
                      {sec.questionCount} Questions
                    </span>
                    <span className="font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200/60">
                      {sec.totalMarks} Marks
                    </span>
                    <span className="font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-xl flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{sec.durationMinutes} Minutes</span>
                    </span>
                  </div>

                  {sec.description && (
                    <p className="text-[11px] text-slate-400 italic line-clamp-1 pt-0.5">
                      {sec.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Side: Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                
                {/* View Questions Button */}
                <button
                  type="button"
                  onClick={() => handleOpenViewQuestions(sec)}
                  className="px-4 py-2 rounded-xl bg-[#06264A] hover:bg-[#0A3B72] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
                  title="Inspect and curate questions inside this section"
                >
                  <Eye className="w-3.5 h-3.5 text-[#F5A623]" />
                  <span>View Questions ({sec.questionCount})</span>
                </button>

                {/* Edit Button */}
                <button
                  type="button"
                  onClick={() => handleOpenEditSection(sec)}
                  className="px-3 py-2 rounded-xl border border-slate-300 hover:bg-amber-50 hover:border-amber-300 text-slate-700 hover:text-amber-800 font-bold text-xs flex items-center gap-1 transition-all"
                  title="Edit section name, duration, description"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => handleOpenDeleteSection(sec)}
                  className="p-2 rounded-xl border border-slate-200 hover:bg-red-50 hover:border-red-300 text-slate-400 hover:text-red-600 transition-colors"
                  title="Delete this section"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Section Modal */}
      <AddEditSectionModal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        examId={selectedExamId}
        examTitle={activeExam.title}
        editingSection={editingSection}
        nextOrder={sections.length + 1}
        onSuccess={() => loadExamStructure(selectedExamId)}
      />

      {/* Delete Section Modal (Safe relocation) */}
      <DeleteSectionModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        section={targetSectionForDelete}
        availableSections={sections}
        onDeleteSuccess={() => loadExamStructure(selectedExamId)}
      />

      {/* View Questions in Section Drawer */}
      <SectionQuestionsDrawer
        isOpen={isQuestionsDrawerOpen}
        onClose={() => setIsQuestionsDrawerOpen(false)}
        section={activeViewingSection}
        examId={selectedExamId}
        examTitle={activeExam.title}
        allQuestions={allQuestions}
        availableSections={sections}
        onOpenAddQuestion={handleOpenAddQuestionToSection}
        onOpenUploadToSection={handleOpenSectionUpload}
        onOpenEditQuestion={handleOpenEditQuestion}
        onOpenMoveQuestion={handleOpenMoveQuestion}
        onReload={() => loadExamStructure(selectedExamId)}
      />

      {/* Bulk Upload Modal (Both Global and Section-Specific) */}
      <BulkUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        examId={selectedExamId}
        examTitle={activeExam.title}
        existingQuestions={allQuestions}
        lockToSection={uploadLockSection}
        onUploadSuccess={() => loadExamStructure(selectedExamId)}
      />

      {/* Question Editor with Live Preview */}
      <QuestionEditorModal
        isOpen={isQuestionEditorOpen}
        onClose={() => setIsQuestionEditorOpen(false)}
        examId={selectedExamId}
        examTitle={activeExam.title}
        editingQuestion={editingQuestionObj}
        availableSections={sections}
        onSaveSuccess={() => loadExamStructure(selectedExamId)}
        totalExamQuestions={allQuestions.length}
      />

      {/* Move Question Modal */}
      <MoveQuestionModal
        isOpen={isMoveQuestionModalOpen}
        onClose={() => setIsMoveQuestionModalOpen(false)}
        targetQuestion={targetQuestionForMove}
        selectedQuestionIds={[]}
        availableSections={sections}
        onMoveSuccess={() => loadExamStructure(selectedExamId)}
      />

    </div>
  );
};

export default ManageSections;
