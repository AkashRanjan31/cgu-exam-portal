import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { examService } from '../../services/examService';
import { DEPARTMENTS } from '../../utils/constants';
import {
  Plus,
  Edit2,
  Trash2,
  HelpCircle,
  X,
  Layers
} from 'lucide-react';

export const ManageExams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    subject: DEPARTMENTS[0],
    code: 'CS305',
    description: '',
    durationMinutes: 60,
    totalQuestions: 20,
    totalMarks: 20,
    passingMarks: 8,
    status: 'Available',
    isPublished: true
  });

  const fetchExams = React.useCallback(async () => {
    try {
      const data = await examService.getExams();
      setExams(data);
    } catch (err) {
      console.error('Failed to load exams:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  const handleOpenCreateModal = () => {
    setEditingExam(null);
    setFormData({
      title: '',
      subject: DEPARTMENTS[0],
      code: `CS${Math.floor(300 + Math.random() * 99)}`,
      description: '',
      durationMinutes: 60,
      totalQuestions: 20,
      totalMarks: 20,
      passingMarks: 8,
      status: 'Available',
      isPublished: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (exam) => {
    setEditingExam(exam);
    setFormData({
      title: exam.title,
      subject: exam.subject,
      code: exam.code || 'EXAM',
      description: exam.description || '',
      durationMinutes: exam.durationMinutes,
      totalQuestions: exam.totalQuestions,
      totalMarks: exam.totalMarks,
      passingMarks: exam.passingMarks,
      status: exam.status,
      isPublished: exam.isPublished
    });
    setIsModalOpen(true);
  };

  const handleSaveExam = async (e) => {
    e.preventDefault();
    try {
      if (editingExam) {
        await examService.updateExam(editingExam.id, formData);
      } else {
        await examService.createExam(formData);
      }
      setIsModalOpen(false);
      fetchExams();
    } catch (err) {
      console.error('Error saving exam:', err);
      alert('Error saving exam');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this examination?')) {
      try {
        await examService.deleteExam(id);
        fetchExams();
      } catch (err) {
        console.error('Failed to delete examination:', err);
        alert('Failed to delete examination');
      }
    }
  };

  const handleTogglePublish = async (id) => {
    try {
      await examService.togglePublish(id);
      fetchExams();
    } catch (err) {
      console.error('Failed to toggle publish status:', err);
      alert('Failed to toggle publish status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#06264A] border-t-[#F5A623] rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-semibold text-slate-500">Loading university examination catalog...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#06264A]">Examination Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure semester examination papers, test durations, and publishing status
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/admin/sections"
            className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Layers className="w-4 h-4 text-[#06264A]" />
            <span>Sections Structure</span>
          </Link>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 rounded-xl bg-[#06264A] hover:bg-[#0A3B72] text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 text-[#F5A623]" />
            <span>Add New Examination</span>
          </button>
        </div>
      </div>

      {/* Exam Table (Section 26 requirement) */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-academic">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F7FA] text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-4 px-6">Examination & Code</th>
                <th className="py-4 px-6">Subject / Department</th>
                <th className="py-4 px-6 text-center">Duration</th>
                <th className="py-4 px-6 text-center">Questions</th>
                <th className="py-4 px-6 text-center">Marks (Pass)</th>
                <th className="py-4 px-6 text-center">Publish Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {exams.map((exam) => (
                <tr key={exam.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6">
                    <span className="font-bold text-slate-900 block text-sm">{exam.title}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] font-mono text-slate-500">{exam.code}</span>
                      {exam.sections && exam.sections.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                          <Layers className="w-2.5 h-2.5" />
                          {exam.sections.length} Sections
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-slate-600">
                    {exam.subject}
                  </td>
                  <td className="py-4 px-6 text-center font-semibold text-slate-700">
                    {exam.durationMinutes} mins
                  </td>
                  <td className="py-4 px-6 text-center font-bold text-slate-800">
                    {exam.totalQuestions}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="font-bold text-slate-900">{exam.totalMarks}</span>
                    <span className="text-slate-400 text-[11px]"> ({exam.passingMarks})</span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <button
                      onClick={() => handleTogglePublish(exam.id)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
                        exam.isPublished
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {exam.isPublished ? 'Published' : 'Draft / Hidden'}
                    </button>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/admin/sections?examId=${exam.id}`}
                        title="Manage Examination Sections & Timers"
                        className="px-2.5 py-1 rounded-xl bg-blue-50 text-[#06264A] hover:bg-[#06264A] hover:text-white font-bold text-[11px] flex items-center gap-1 transition-colors border border-blue-200"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Sections</span>
                      </Link>

                      <Link
                        to={`/admin/questions?examId=${exam.id}`}
                        title="Manage Questions"
                        className="p-1.5 rounded-lg text-slate-600 hover:text-[#06264A] hover:bg-blue-50"
                      >
                        <HelpCircle className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleOpenEditModal(exam)}
                        title="Edit Examination"
                        className="p-1.5 rounded-lg text-slate-600 hover:text-amber-600 hover:bg-amber-50"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(exam.id)}
                        title="Delete Examination"
                        className="p-1.5 rounded-lg text-slate-600 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Create / Edit Exam */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in">
            <div className="bg-[#06264A] text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-base">
                {editingExam ? 'Edit Examination' : 'Create Examination Paper'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExam} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Exam Name *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Data Structures & Algorithms"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:border-[#06264A]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Subject Code *</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g. CS301"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:border-[#06264A]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Department *</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  placeholder="Overview of syllabus, modules, or examination guidelines..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:border-[#06264A]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    min={5}
                    max={180}
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Total Marks</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.totalMarks}
                    onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Passing Marks</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.passingMarks}
                    onChange={(e) => setFormData({ ...formData, passingMarks: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="w-4 h-4 rounded text-[#06264A]"
                  />
                  <span className="font-semibold text-slate-700">Publish immediately to students</span>
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#06264A] text-white font-bold hover:bg-[#0A3B72]"
                >
                  {editingExam ? 'Update Examination' : 'Save Examination'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManageExams;
