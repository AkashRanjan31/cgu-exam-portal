import api from './api';

export const questionService = {
  /**
   * Get all questions for a specific exam
   * Corresponds to: GET /api/questions/exam/:examId
   */
  getQuestionsByExamId: async (examId) => {
    try {
      // Prepared for future backend:
      // const res = await api.get(`/questions/exam/${examId}`);
      // return res.data;

      await new Promise(resolve => setTimeout(resolve, 150));
      const questions = JSON.parse(localStorage.getItem('cvrgu_questions') || '[]');
      return questions.filter(q => Number(q.examId) === Number(examId));
    } catch (err) {
      console.error(`Failed to fetch questions for exam ${examId}:`, err);
      throw err;
    }
  },

  /**
   * Get all questions across all exams (for Admin)
   */
  getAllQuestions: async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 150));
      return JSON.parse(localStorage.getItem('cvrgu_questions') || '[]');
    } catch (err) {
      console.error('Failed to get all questions:', err);
      throw err;
    }
  },

  /**
   * Create single question (Admin)
   * Corresponds to: POST /api/questions
   */
  createQuestion: async (questionData) => {
    try {
      // Future backend:
      // const res = await api.post('/questions', questionData);
      // return res.data;

      await new Promise(resolve => setTimeout(resolve, 200));
      const questions = JSON.parse(localStorage.getItem('cvrgu_questions') || '[]');
      const exams = JSON.parse(localStorage.getItem('cvrgu_exams') || '[]');
      const examIndex = exams.findIndex(e => e.id === Number(questionData.examId));

      let sectionId = questionData.sectionId;
      let sectionTitle = questionData.sectionTitle || questionData.section || 'General Section';

      if (examIndex !== -1) {
        const exam = exams[examIndex];
        if (!exam.sections) exam.sections = [];

        // Check if section exists
        let existingSec = exam.sections.find(
          s => s.id === sectionId || s.title?.toLowerCase() === sectionTitle.toLowerCase()
        );

        if (!existingSec) {
          const generatedSecId = sectionId || `sec-${sectionTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;
          existingSec = {
            id: generatedSecId,
            title: sectionTitle,
            durationMinutes: 20,
            totalQuestions: 1,
            totalMarks: Number(questionData.marks || 1),
            passingMarks: Math.ceil(Number(questionData.marks || 1) * 0.4),
            description: `Evaluation section for ${sectionTitle}`
          };
          exam.sections.push(existingSec);
        }

        sectionId = existingSec.id;
        sectionTitle = existingSec.title;
      }

      const newQuestion = {
        id: Date.now(),
        examId: Number(questionData.examId),
        sectionId: sectionId || 'sec-1',
        sectionTitle: sectionTitle,
        questionNumber: questionData.questionNumber || (questions.filter(q => q.examId === Number(questionData.examId)).length + 1),
        questionText: questionData.questionText,
        questionType: questionData.questionType || 'mcq',
        options: questionData.options || [
          questionData.optionA || '',
          questionData.optionB || '',
          questionData.optionC || '',
          questionData.optionD || ''
        ],
        optionA: questionData.optionA || (questionData.options ? questionData.options[0] : ''),
        optionB: questionData.optionB || (questionData.options ? questionData.options[1] : ''),
        optionC: questionData.optionC || (questionData.options ? questionData.options[2] : ''),
        optionD: questionData.optionD || (questionData.options ? questionData.options[3] : ''),
        correctAnswer: Number(questionData.correctAnswer ?? 0),
        marks: Number(questionData.marks || 1),
        difficulty: questionData.difficulty || 'Easy',
        explanation: questionData.explanation || '',
        order: questionData.order || (questions.length + 1)
      };

      questions.push(newQuestion);
      localStorage.setItem('cvrgu_questions', JSON.stringify(questions));

      // Recalculate exam totals
      if (examIndex !== -1) {
        const examQuestions = questions.filter(q => q.examId === Number(questionData.examId));
        exams[examIndex].totalQuestions = examQuestions.length;
        exams[examIndex].totalMarks = examQuestions.reduce((sum, q) => sum + (Number(q.marks) || 1), 0);
        localStorage.setItem('cvrgu_exams', JSON.stringify(exams));
      }

      return newQuestion;
    } catch (err) {
      console.error('Failed to create question:', err);
      throw err;
    }
  },

  /**
   * Update question (Admin)
   * Corresponds to: PUT /api/questions/:questionId
   */
  updateQuestion: async (id, updatedData) => {
    try {
      // Future backend:
      // const res = await api.put(`/questions/${id}`, updatedData);
      // return res.data;

      await new Promise(resolve => setTimeout(resolve, 200));
      const questions = JSON.parse(localStorage.getItem('cvrgu_questions') || '[]');
      const index = questions.findIndex(q => q.id === Number(id));
      if (index === -1) throw new Error('Question not found');

      const current = questions[index];
      const mergedOptions = updatedData.options || [
        updatedData.optionA ?? current.optionA,
        updatedData.optionB ?? current.optionB,
        updatedData.optionC ?? current.optionC,
        updatedData.optionD ?? current.optionD
      ];

      questions[index] = {
        ...current,
        ...updatedData,
        sectionId: updatedData.sectionId || current.sectionId,
        sectionTitle: updatedData.sectionTitle || current.sectionTitle,
        options: mergedOptions,
        optionA: mergedOptions[0] || '',
        optionB: mergedOptions[1] || '',
        optionC: mergedOptions[2] || '',
        optionD: mergedOptions[3] || '',
        correctAnswer: Number(updatedData.correctAnswer ?? current.correctAnswer),
        marks: Number(updatedData.marks ?? current.marks)
      };

      localStorage.setItem('cvrgu_questions', JSON.stringify(questions));

      // Recalculate exam totals
      const exams = JSON.parse(localStorage.getItem('cvrgu_exams') || '[]');
      const examIndex = exams.findIndex(e => e.id === Number(questions[index].examId));
      if (examIndex !== -1) {
        const examQuestions = questions.filter(q => q.examId === Number(questions[index].examId));
        exams[examIndex].totalMarks = examQuestions.reduce((sum, q) => sum + (Number(q.marks) || 1), 0);
        localStorage.setItem('cvrgu_exams', JSON.stringify(exams));
      }

      return questions[index];
    } catch (err) {
      console.error('Failed to update question:', err);
      throw err;
    }
  },

  /**
   * Delete question (Admin)
   * Corresponds to: DELETE /api/questions/:questionId
   */
  deleteQuestion: async (id) => {
    try {
      // Future backend:
      // const res = await api.delete(`/questions/${id}`);
      // return res.data;

      await new Promise(resolve => setTimeout(resolve, 200));
      let questions = JSON.parse(localStorage.getItem('cvrgu_questions') || '[]');
      const target = questions.find(q => q.id === Number(id));
      if (!target) throw new Error('Question not found');

      questions = questions.filter(q => q.id !== Number(id));
      localStorage.setItem('cvrgu_questions', JSON.stringify(questions));

      // Adjust exam totals
      const exams = JSON.parse(localStorage.getItem('cvrgu_exams') || '[]');
      const examIndex = exams.findIndex(e => e.id === Number(target.examId));
      if (examIndex !== -1) {
        const examQuestions = questions.filter(q => q.examId === Number(target.examId));
        exams[examIndex].totalQuestions = examQuestions.length;
        exams[examIndex].totalMarks = examQuestions.reduce((sum, q) => sum + (Number(q.marks) || 1), 0);
        localStorage.setItem('cvrgu_exams', JSON.stringify(exams));
      }

      return { success: true };
    } catch (err) {
      console.error('Failed to delete question:', err);
      throw err;
    }
  },

  /**
   * Move an individual question to a new section
   * Corresponds to: PUT /api/questions/:questionId/move
   */
  moveQuestion: async (questionId, targetSectionId, targetSectionTitle) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      const questions = JSON.parse(localStorage.getItem('cvrgu_questions') || '[]');
      const qIndex = questions.findIndex(q => q.id === Number(questionId));
      if (qIndex === -1) throw new Error('Question not found');

      const targetQuestion = questions[qIndex];
      const exams = JSON.parse(localStorage.getItem('cvrgu_exams') || '[]');
      const examIndex = exams.findIndex(e => e.id === Number(targetQuestion.examId));

      let resolvedSectionId = targetSectionId;
      let resolvedSectionTitle = targetSectionTitle;

      if (examIndex !== -1) {
        const exam = exams[examIndex];
        if (!exam.sections) exam.sections = [];
        let existingSec = exam.sections.find(
          s => s.id === targetSectionId || s.title?.toLowerCase() === targetSectionTitle?.toLowerCase()
        );

        if (!existingSec && targetSectionTitle) {
          resolvedSectionId = targetSectionId || `sec-${targetSectionTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;
          existingSec = {
            id: resolvedSectionId,
            title: targetSectionTitle,
            durationMinutes: 20,
            totalQuestions: 1,
            totalMarks: targetQuestion.marks || 1,
            passingMarks: Math.ceil((targetQuestion.marks || 1) * 0.4),
            description: `Section for ${targetSectionTitle}`
          };
          exam.sections.push(existingSec);
          localStorage.setItem('cvrgu_exams', JSON.stringify(exams));
        }

        if (existingSec) {
          resolvedSectionId = existingSec.id;
          resolvedSectionTitle = existingSec.title;
        }
      }

      questions[qIndex].sectionId = resolvedSectionId;
      questions[qIndex].sectionTitle = resolvedSectionTitle;

      localStorage.setItem('cvrgu_questions', JSON.stringify(questions));
      return questions[qIndex];
    } catch (err) {
      console.error('Failed to move question:', err);
      throw err;
    }
  },

  /**
   * Bulk move multiple questions to a target section
   * Corresponds to: PUT /api/questions/bulk-move
   */
  bulkMove: async (questionIds, targetSectionId, targetSectionTitle) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 250));
      const questions = JSON.parse(localStorage.getItem('cvrgu_questions') || '[]');
      const idsSet = new Set(questionIds.map(Number));

      const affected = questions.filter(q => idsSet.has(q.id));
      if (affected.length === 0) return { updatedCount: 0 };

      const examId = affected[0].examId;
      const exams = JSON.parse(localStorage.getItem('cvrgu_exams') || '[]');
      const examIndex = exams.findIndex(e => e.id === Number(examId));

      let resolvedSectionId = targetSectionId;
      let resolvedSectionTitle = targetSectionTitle;

      if (examIndex !== -1) {
        const exam = exams[examIndex];
        if (!exam.sections) exam.sections = [];
        let existingSec = exam.sections.find(
          s => s.id === targetSectionId || s.title?.toLowerCase() === targetSectionTitle?.toLowerCase()
        );

        if (!existingSec && targetSectionTitle) {
          resolvedSectionId = targetSectionId || `sec-${targetSectionTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;
          existingSec = {
            id: resolvedSectionId,
            title: targetSectionTitle,
            durationMinutes: 20,
            totalQuestions: affected.length,
            totalMarks: affected.reduce((sum, q) => sum + (q.marks || 1), 0),
            passingMarks: 4,
            description: `Section for ${targetSectionTitle}`
          };
          exam.sections.push(existingSec);
          localStorage.setItem('cvrgu_exams', JSON.stringify(exams));
        }

        if (existingSec) {
          resolvedSectionId = existingSec.id;
          resolvedSectionTitle = existingSec.title;
        }
      }

      questions.forEach(q => {
        if (idsSet.has(q.id)) {
          q.sectionId = resolvedSectionId;
          q.sectionTitle = resolvedSectionTitle;
        }
      });

      localStorage.setItem('cvrgu_questions', JSON.stringify(questions));
      return { updatedCount: affected.length };
    } catch (err) {
      console.error('Failed to bulk move questions:', err);
      throw err;
    }
  },

  /**
   * Duplicate an existing question
   */
  duplicateQuestion: async (questionId) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      const questions = JSON.parse(localStorage.getItem('cvrgu_questions') || '[]');
      const source = questions.find(q => q.id === Number(questionId));
      if (!source) throw new Error('Question not found to duplicate');

      const cloned = {
        ...source,
        id: Date.now(),
        questionText: `${source.questionText} (Copy)`,
        questionNumber: (questions.filter(q => q.examId === source.examId).length + 1)
      };

      questions.push(cloned);
      localStorage.setItem('cvrgu_questions', JSON.stringify(questions));

      // Recalculate exam count
      const exams = JSON.parse(localStorage.getItem('cvrgu_exams') || '[]');
      const examIndex = exams.findIndex(e => e.id === Number(source.examId));
      if (examIndex !== -1) {
        const examQuestions = questions.filter(q => q.examId === Number(source.examId));
        exams[examIndex].totalQuestions = examQuestions.length;
        exams[examIndex].totalMarks = examQuestions.reduce((sum, q) => sum + (Number(q.marks) || 1), 0);
        localStorage.setItem('cvrgu_exams', JSON.stringify(exams));
      }

      return cloned;
    } catch (err) {
      console.error('Failed to duplicate question:', err);
      throw err;
    }
  },

  /**
   * Bulk upload questions from validated parsed data
   * Corresponds to: POST /api/questions/bulk-upload
   */
  bulkUpload: async (examId, validatedQuestions, options = {}) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 350));
      const questions = JSON.parse(localStorage.getItem('cvrgu_questions') || '[]');
      const exams = JSON.parse(localStorage.getItem('cvrgu_exams') || '[]');
      const examIndex = exams.findIndex(e => e.id === Number(examId));

      if (examIndex === -1) throw new Error(`Exam ID ${examId} not found.`);
      const exam = exams[examIndex];
      if (!exam.sections) exam.sections = [];

      // Filter out skipped duplicates if requested
      const toImport = validatedQuestions.filter(q => q.duplicateResolution !== 'skip');

      // If locked to a specific section (Section-Specific Upload)
      const forcedSection = options.lockToSection;

      // Map section names to sectionIds
      const sectionNameToId = {};
      const sectionNameToTitle = {};
      exam.sections.forEach(s => {
        sectionNameToId[s.title.toLowerCase()] = s.id;
        sectionNameToTitle[s.title.toLowerCase()] = s.title;
      });

      if (forcedSection) {
        // Ensure forced section exists in exam
        let targetSec = exam.sections.find(s => s.id === forcedSection.id || s.title.toLowerCase() === forcedSection.title.toLowerCase());
        if (!targetSec) {
          targetSec = {
            id: forcedSection.id || `sec-${forcedSection.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`,
            title: forcedSection.title,
            durationMinutes: forcedSection.durationMinutes || 20,
            order: exam.sections.length + 1,
            totalQuestions: 0,
            totalMarks: 0,
            passingMarks: 4,
            description: `Assessment section for ${forcedSection.title}`
          };
          exam.sections.push(targetSec);
        }
        forcedSection.id = targetSec.id;
        forcedSection.title = targetSec.title;
      } else {
        // Register new sections in exam if any don't exist
        toImport.forEach(q => {
          const normSec = q.section.toLowerCase();
          if (!sectionNameToId[normSec]) {
            const newSecId = `sec-${normSec.replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;
            const newOrder = q.sectionOrder ? Number(q.sectionOrder) : (exam.sections.length + 1);
            const newSection = {
              id: newSecId,
              title: q.section,
              durationMinutes: 20,
              order: newOrder,
              totalQuestions: 0,
              totalMarks: 0,
              passingMarks: 4,
              description: `Assessment section for ${q.section}`
            };
            exam.sections.push(newSection);
            sectionNameToId[normSec] = newSecId;
            sectionNameToTitle[normSec] = q.section;
          }
        });
      }

      // Re-order sections by order
      exam.sections.sort((a, b) => (a.order || 0) - (b.order || 0));
      exam.sections.forEach((s, idx) => { s.order = idx + 1; });

      // Determine starting question number
      const existingExamQuestions = questions.filter(q => q.examId === Number(examId));
      let currentNumber = existingExamQuestions.length + 1;

      const newQuestionsList = toImport.map((q, idx) => {
        const secId = forcedSection ? forcedSection.id : (sectionNameToId[q.section.toLowerCase()] || 'sec-1');
        const secTitle = forcedSection ? forcedSection.title : (sectionNameToTitle[q.section.toLowerCase()] || q.section);
        return {
          id: Date.now() + idx,
          examId: Number(examId),
          sectionId: secId,
          sectionTitle: secTitle,
          questionNumber: currentNumber++,
          questionText: q.questionText,
          questionType: q.questionType || 'mcq',
          options: q.options || [q.optionA, q.optionB, q.optionC, q.optionD],
          optionA: q.optionA || '',
          optionB: q.optionB || '',
          optionC: q.optionC || '',
          optionD: q.optionD || '',
          correctAnswer: Number(q.correctAnswer),
          marks: Number(q.marks || 1),
          difficulty: q.difficulty || 'Easy',
          explanation: q.explanation || '',
          order: questions.length + idx + 1
        };
      });

      // Update questions storage
      const combined = [...questions, ...newQuestionsList];
      localStorage.setItem('cvrgu_questions', JSON.stringify(combined));

      // Recalculate exam sections and total counts
      const updatedExamQuestions = combined.filter(q => q.examId === Number(examId));
      exam.totalQuestions = updatedExamQuestions.length;
      exam.totalMarks = updatedExamQuestions.reduce((sum, q) => sum + (Number(q.marks) || 1), 0);

      // Recount section specifics
      exam.sections.forEach(sec => {
        const secQs = updatedExamQuestions.filter(q => q.sectionId === sec.id);
        sec.totalQuestions = secQs.length;
        sec.totalMarks = secQs.reduce((sum, q) => sum + (Number(q.marks) || 1), 0);
        sec.passingMarks = Math.max(1, Math.ceil(sec.totalMarks * 0.4));
      });

      localStorage.setItem('cvrgu_exams', JSON.stringify(exams));

      return {
        importedCount: newQuestionsList.length,
        skippedCount: validatedQuestions.length - toImport.length,
        totalQuestions: exam.totalQuestions,
        totalMarks: exam.totalMarks
      };
    } catch (err) {
      console.error('Failed to bulk upload questions:', err);
      throw err;
    }
  },

  /**
   * Save Question Numbering Setting ('global' vs 'section')
   */
  setNumberingMode: (examId, mode) => {
    localStorage.setItem(`cvrgu_numbering_mode_${examId}`, mode);
  },

  /**
   * Get Question Numbering Setting ('global' by default)
   */
  getNumberingMode: (examId) => {
    return localStorage.getItem(`cvrgu_numbering_mode_${examId}`) || 'global';
  }
};

export default questionService;
