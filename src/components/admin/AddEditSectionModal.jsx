import React, { useState, useEffect } from 'react';
import { X, Layers, Clock, Hash, Check } from 'lucide-react';
import { sectionService } from '../../services/sectionService';

export const AddEditSectionModal = ({
  isOpen,
  onClose,
  examId,
  examTitle,
  editingSection = null,
  nextOrder = 1,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: 20,
    order: 1
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (editingSection) {
      setFormData({
        name: editingSection.title || editingSection.name || '',
        description: editingSection.description || '',
        duration: editingSection.durationMinutes || editingSection.duration || 20,
        order: editingSection.order || 1
      });
    } else {
      setFormData({
        name: '',
        description: '',
        duration: 20,
        order: nextOrder
      });
    }
  }, [editingSection, nextOrder, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Section Name is required.');
      return;
    }

    const durationNum = parseInt(formData.duration, 10);
    if (isNaN(durationNum) || durationNum <= 0) {
      alert('Duration must be a positive number of minutes.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingSection) {
        await sectionService.updateSection(editingSection.id, {
          name: formData.name.trim(),
          description: formData.description.trim(),
          duration: durationNum,
          order: parseInt(formData.order, 10) || 1
        });
      } else {
        await sectionService.createSection(examId, {
          name: formData.name.trim(),
          description: formData.description.trim(),
          duration: durationNum,
          order: parseInt(formData.order, 10) || nextOrder
        });
      }
      onSuccess();
      onClose();
    } catch (err) {
      alert(err.message || 'Failed to save section.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#06264A] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-white/10 text-[#F5A623]">
              <Layers className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-extrabold text-base">
                {editingSection ? 'Edit Section' : '+ Add Examination Section'}
              </h3>
              <p className="text-[11px] text-slate-300">
                {examTitle}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          {/* Section Name */}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Section Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Aptitude, Logical Reasoning, Technical..."
              className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 focus:outline-hidden focus:border-[#06264A] text-xs"
              required
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Description / Instructions (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              placeholder="e.g. Quantitative aptitude questions testing basic numeracy and arithmetic..."
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:border-[#06264A] text-xs font-medium"
            />
          </div>

          {/* Duration & Order */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Duration (Minutes) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  max={300}
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-800 text-xs"
                  required
                />
                <Clock className="w-4 h-4 text-slate-400 absolute inset-y-0 left-2.5 my-auto pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Section Order
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-800 text-xs"
                  required
                />
                <Hash className="w-4 h-4 text-slate-400 absolute inset-y-0 left-2.5 my-auto pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
            ℹ️ <strong>Independent Section Timer:</strong> Students will receive strictly {formData.duration || 20} minutes for this section. Upon timer conclusion, this section auto-locks irreversibly.
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 font-semibold hover:bg-slate-100 text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-[#06264A] hover:bg-[#0A3B72] text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              {submitting ? (
                <span>Saving...</span>
              ) : (
                <>
                  <Check className="w-4 h-4 text-[#F5A623]" />
                  <span>{editingSection ? 'Save Changes' : 'Create Section'}</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default AddEditSectionModal;
