import api from './api';

export const sectionService = {
  /**
   * Get all sections for an examination with dynamically calculated question counts and total marks
   * Corresponds to: GET /api/exams/:examId/sections
   */
  getSectionsByExamId: async (examId) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 150));
      const exams = JSON.parse(localStorage.getItem('cvrgu_exams') || '[]');
      const exam = exams.find(e => Number(e.id) === Number(examId));
      if (!exam) throw new Error(`Examination ${examId} not found.`);

      const allQuestions = JSON.parse(localStorage.getItem('cvrgu_questions') || '[]');
      const examQuestions = allQuestions.filter(q => Number(q.examId) === Number(examId));

      const sections = exam.sections || [];

      // Sort sections by order (1-indexed)
      const sortedSections = [...sections].sort((a, b) => (a.order || 0) - (b.order || 0));

      // Calculate dynamic stats per section
      const hydratedSections = sortedSections.map((sec, index) => {
        const secQuestions = examQuestions.filter(q => q.sectionId === sec.id);
        const questionCount = secQuestions.length;
        const totalMarks = secQuestions.reduce((sum, q) => sum + (Number(q.marks) || 1), 0);

        return {
          ...sec,
          order: sec.order || (index + 1),
          duration: sec.durationMinutes || sec.duration || 20,
          durationMinutes: sec.durationMinutes || sec.duration || 20,
          questionCount,
          totalQuestions: questionCount,
          totalMarks,
          status: sec.status || 'AVAILABLE' // 'LOCKED' | 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED'
        };
      });

      return hydratedSections;
    } catch (err) {
      console.error(`Failed to fetch sections for exam ${examId}:`, err);
      throw err;
    }
  },

  /**
   * Create a new section in an examination
   * Corresponds to: POST /api/exams/:examId/sections
   */
  createSection: async (examId, sectionData) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      const exams = JSON.parse(localStorage.getItem('cvrgu_exams') || '[]');
      const examIndex = exams.findIndex(e => Number(e.id) === Number(examId));
      if (examIndex === -1) throw new Error(`Examination ${examId} not found.`);

      const exam = exams[examIndex];
      if (!exam.sections) exam.sections = [];

      const cleanTitle = sectionData.name || sectionData.title || 'New Section';
      const slug = cleanTitle.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      const uniqueId = `sec-${slug}-${Date.now().toString().slice(-4)}`;

      const newSection = {
        id: uniqueId,
        examId: Number(examId),
        title: cleanTitle,
        name: cleanTitle,
        description: sectionData.description || `Assessment section for ${cleanTitle}`,
        durationMinutes: Number(sectionData.duration || sectionData.durationMinutes || 20),
        duration: Number(sectionData.duration || sectionData.durationMinutes || 20),
        order: Number(sectionData.order) || (exam.sections.length + 1),
        totalQuestions: 0,
        questionCount: 0,
        totalMarks: 0,
        passingMarks: 4,
        status: 'AVAILABLE'
      };

      exam.sections.push(newSection);

      // Re-normalize order
      exam.sections.sort((a, b) => (a.order || 0) - (b.order || 0));
      exam.sections.forEach((s, idx) => { s.order = idx + 1; });

      localStorage.setItem('cvrgu_exams', JSON.stringify(exams));
      return newSection;
    } catch (err) {
      console.error('Failed to create section:', err);
      throw err;
    }
  },

  /**
   * Update an existing section's title, description, duration, or order
   * Corresponds to: PUT /api/sections/:sectionId
   */
  updateSection: async (sectionId, updatedData) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      const exams = JSON.parse(localStorage.getItem('cvrgu_exams') || '[]');
      let targetExam = null;
      let targetSec = null;

      for (const ex of exams) {
        if (ex.sections) {
          const s = ex.sections.find(sec => sec.id === sectionId);
          if (s) {
            targetExam = ex;
            targetSec = s;
            break;
          }
        }
      }

      if (!targetSec) throw new Error(`Section ${sectionId} not found.`);

      const oldTitle = targetSec.title;
      const newTitle = updatedData.name || updatedData.title || targetSec.title;

      targetSec.title = newTitle;
      targetSec.name = newTitle;
      targetSec.description = updatedData.description ?? targetSec.description;
      targetSec.durationMinutes = Number(updatedData.duration || updatedData.durationMinutes || targetSec.durationMinutes || 20);
      targetSec.duration = targetSec.durationMinutes;
      if (updatedData.order) {
        targetSec.order = Number(updatedData.order);
      }

      // If renamed, atomically update questions referencing this sectionId
      if (oldTitle !== newTitle) {
        const questions = JSON.parse(localStorage.getItem('cvrgu_questions') || '[]');
        let questionsUpdated = false;
        questions.forEach(q => {
          if (q.sectionId === sectionId) {
            q.sectionTitle = newTitle;
            questionsUpdated = true;
          }
        });
        if (questionsUpdated) {
          localStorage.setItem('cvrgu_questions', JSON.stringify(questions));
        }
      }

      // Re-normalize orders
      targetExam.sections.sort((a, b) => (a.order || 0) - (b.order || 0));
      targetExam.sections.forEach((s, idx) => { s.order = idx + 1; });

      localStorage.setItem('cvrgu_exams', JSON.stringify(exams));
      return targetSec;
    } catch (err) {
      console.error(`Failed to update section ${sectionId}:`, err);
      throw err;
    }
  },

  /**
   * Reorder all sections for an examination
   * Corresponds to: PUT /api/sections/:sectionId/reorder
   */
  reorderSections: async (examId, orderedSectionIds) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 150));
      const exams = JSON.parse(localStorage.getItem('cvrgu_exams') || '[]');
      const exam = exams.find(e => Number(e.id) === Number(examId));
      if (!exam || !exam.sections) throw new Error(`Examination ${examId} not found.`);

      const sectionMap = new Map(exam.sections.map(s => [s.id, s]));
      const newSectionsList = [];

      orderedSectionIds.forEach((secId, idx) => {
        const sec = sectionMap.get(secId);
        if (sec) {
          sec.order = idx + 1;
          newSectionsList.push(sec);
          sectionMap.delete(secId);
        }
      });

      // Append any sections not explicitly in list
      sectionMap.forEach((sec) => {
        sec.order = newSectionsList.length + 1;
        newSectionsList.push(sec);
      });

      exam.sections = newSectionsList;
      localStorage.setItem('cvrgu_exams', JSON.stringify(exams));
      return exam.sections;
    } catch (err) {
      console.error(`Failed to reorder sections for exam ${examId}:`, err);
      throw err;
    }
  },

  /**
   * Delete a section safely:
   * - If empty: deletes immediately.
   * - If questions exist:
   *    - resolution 'move': reassigns questions to targetSectionId then deletes section.
   *    - resolution 'delete_questions': deletes questions permanently then deletes section.
   * Corresponds to: DELETE /api/sections/:sectionId
   */
  deleteSection: async (sectionId, resolution = 'move', targetSectionId = null) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 250));
      const exams = JSON.parse(localStorage.getItem('cvrgu_exams') || '[]');
      let targetExam = null;
      let targetSecIndex = -1;

      for (const ex of exams) {
        if (ex.sections) {
          const idx = ex.sections.findIndex(s => s.id === sectionId);
          if (idx !== -1) {
            targetExam = ex;
            targetSecIndex = idx;
            break;
          }
        }
      }

      if (!targetExam || targetSecIndex === -1) {
        throw new Error(`Section ${sectionId} not found.`);
      }

      let questions = JSON.parse(localStorage.getItem('cvrgu_questions') || '[]');
      const affectedQuestions = questions.filter(q => q.sectionId === sectionId);

      if (affectedQuestions.length > 0) {
        if (resolution === 'move') {
          if (!targetSectionId) {
            throw new Error('Target destination section is required to relocate questions.');
          }
          const destinationSec = targetExam.sections.find(s => s.id === targetSectionId);
          if (!destinationSec) {
            throw new Error(`Target destination section ${targetSectionId} not found.`);
          }

          // Move questions to destination
          questions.forEach(q => {
            if (q.sectionId === sectionId) {
              q.sectionId = destinationSec.id;
              q.sectionTitle = destinationSec.title || destinationSec.name;
            }
          });
          localStorage.setItem('cvrgu_questions', JSON.stringify(questions));
        } else if (resolution === 'delete_questions') {
          // Permanently delete questions belonging to this section
          questions = questions.filter(q => q.sectionId !== sectionId);
          localStorage.setItem('cvrgu_questions', JSON.stringify(questions));
        }
      }

      // Remove the section
      targetExam.sections.splice(targetSecIndex, 1);

      // Re-order remaining sections
      targetExam.sections.forEach((s, idx) => { s.order = idx + 1; });

      // Recount exam total questions & marks
      const examQuestions = questions.filter(q => Number(q.examId) === Number(targetExam.id));
      targetExam.totalQuestions = examQuestions.length;
      targetExam.totalMarks = examQuestions.reduce((sum, q) => sum + (Number(q.marks) || 1), 0);

      localStorage.setItem('cvrgu_exams', JSON.stringify(exams));

      return {
        success: true,
        deletedSectionId: sectionId,
        questionsMoved: resolution === 'move' ? affectedQuestions.length : 0,
        questionsDeleted: resolution === 'delete_questions' ? affectedQuestions.length : 0
      };
    } catch (err) {
      console.error(`Failed to delete section ${sectionId}:`, err);
      throw err;
    }
  },

  /**
   * Get all questions for a specific section
   * Corresponds to: GET /api/sections/:sectionId/questions
   */
  getSectionQuestions: async (sectionId) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 150));
      const questions = JSON.parse(localStorage.getItem('cvrgu_questions') || '[]');
      return questions.filter(q => q.sectionId === sectionId);
    } catch (err) {
      console.error(`Failed to fetch questions for section ${sectionId}:`, err);
      throw err;
    }
  }
};

export default sectionService;
