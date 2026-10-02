import api from './api';

export const examService = {
  /**
   * Get all exams
   */
  getExams: async () => {
    try {
      // Future backend:
      // const res = await api.get('/exams');
      // return res.data;

      await new Promise(resolve => setTimeout(resolve, 300));
      const exams = JSON.parse(localStorage.getItem('cvrgu_exams') || '[]');
      return exams;
    } catch (err) {
      console.error('Failed to fetch exams:', err);
      throw err;
    }
  },

  /**
   * Alias for getExams
   */
  getAllExams: async () => {
    return examService.getExams();
  },

  /**
   * Get single exam by ID
   */
  getExamById: async (id) => {
    try {
      // Future backend:
      // const res = await api.get(`/exams/${id}`);
      // return res.data;

      await new Promise(resolve => setTimeout(resolve, 200));
      const exams = JSON.parse(localStorage.getItem('cvrgu_exams') || '[]');
      const exam = exams.find(e => e.id === Number(id));
      if (!exam) throw new Error('Examination not found.');
      return exam;
    } catch (err) {
      console.error(`Failed to fetch exam ${id}:`, err);
      throw err;
    }
  },

  /**
   * Create a new exam (Admin)
   */
  createExam: async (examData) => {
    try {
      // Future backend:
      // const res = await api.post('/exams', examData);
      // return res.data;

      await new Promise(resolve => setTimeout(resolve, 400));
      const exams = JSON.parse(localStorage.getItem('cvrgu_exams') || '[]');
      const newExam = {
        ...examData,
        id: Date.now(),
        totalQuestions: Number(examData.totalQuestions || 0),
        durationMinutes: Number(examData.durationMinutes || 60),
        totalMarks: Number(examData.totalMarks || 20),
        passingMarks: Number(examData.passingMarks || 8),
        status: examData.status || 'Available',
        isPublished: examData.isPublished ?? true,
        scheduledDate: examData.scheduledDate || new Date().toISOString()
      };
      exams.unshift(newExam);
      localStorage.setItem('cvrgu_exams', JSON.stringify(exams));
      return newExam;
    } catch (err) {
      console.error('Failed to create exam:', err);
      throw err;
    }
  },

  /**
   * Update existing exam (Admin)
   */
  updateExam: async (id, updatedData) => {
    try {
      // Future backend:
      // const res = await api.put(`/exams/${id}`, updatedData);
      // return res.data;

      await new Promise(resolve => setTimeout(resolve, 300));
      const exams = JSON.parse(localStorage.getItem('cvrgu_exams') || '[]');
      const index = exams.findIndex(e => e.id === Number(id));
      if (index === -1) throw new Error('Exam not found');

      exams[index] = { ...exams[index], ...updatedData };
      localStorage.setItem('cvrgu_exams', JSON.stringify(exams));
      return exams[index];
    } catch (err) {
      console.error('Failed to update exam:', err);
      throw err;
    }
  },

  /**
   * Delete exam (Admin)
   */
  deleteExam: async (id) => {
    try {
      // Future backend:
      // const res = await api.delete(`/exams/${id}`);
      // return res.data;

      await new Promise(resolve => setTimeout(resolve, 300));
      let exams = JSON.parse(localStorage.getItem('cvrgu_exams') || '[]');
      exams = exams.filter(e => e.id !== Number(id));
      localStorage.setItem('cvrgu_exams', JSON.stringify(exams));
      return { success: true };
    } catch (err) {
      console.error('Failed to delete exam:', err);
      throw err;
    }
  },

  /**
   * Toggle publish status (Admin)
   */
  togglePublish: async (id) => {
    try {
      const exams = JSON.parse(localStorage.getItem('cvrgu_exams') || '[]');
      const exam = exams.find(e => e.id === Number(id));
      if (exam) {
        exam.isPublished = !exam.isPublished;
        localStorage.setItem('cvrgu_exams', JSON.stringify(exams));
        return exam;
      }
      throw new Error('Exam not found');
    } catch (err) {
      console.error('Failed to toggle publish status:', err);
      throw err;
    }
  }
};
