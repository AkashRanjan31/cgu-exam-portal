import api from './api';

export const resultService = {
  /**
   * Submit student examination and calculate marks
   */
  submitExamResult: async (submissionData) => {
    try {
      // Future backend:
      // const res = await api.post('/results/submit', submissionData);
      // return res.data;

      await new Promise(resolve => setTimeout(resolve, 400));
      const questions = JSON.parse(localStorage.getItem('cvrgu_questions') || '[]');
      const exams = JSON.parse(localStorage.getItem('cvrgu_exams') || '[]');

      const exam = exams.find(e => e.id === Number(submissionData.examId));
      const examQuestions = questions.filter(q => q.examId === Number(submissionData.examId));

      const answers = submissionData.answers || {}; // { [questionId]: selectedOptionIndex }
      let correct = 0;
      let wrong = 0;
      let attempted = 0;
      let earnedMarks = 0;
      const totalMarks = exam ? exam.totalMarks : examQuestions.length;
      const passingMarks = exam ? exam.passingMarks : Math.ceil(totalMarks * 0.4);

      // Detailed evaluation list for candidate review
      const questionReview = examQuestions.map((q) => {
        const studentAns = answers[q.id];
        const isAttempted = studentAns !== undefined && studentAns !== null;
        const isCorrect = isAttempted && Number(studentAns) === Number(q.correctAnswer);

        if (isAttempted) {
          attempted++;
          if (isCorrect) {
            correct++;
            earnedMarks += (q.marks || 1);
          } else {
            wrong++;
          }
        }

        return {
          questionId: q.id,
          questionNumber: q.questionNumber,
          questionText: q.questionText,
          options: q.options,
          // correctAnswer is intentionally omitted from the review object.
          // PRODUCTION: the backend must control whether answers are revealed
          // (e.g. only after the exam window closes for all students).
          // For the dev mock we include it so the result page works locally.
          ...(import.meta.env.DEV ? { correctAnswer: q.correctAnswer } : {}),
          studentAnswer: isAttempted ? studentAns : null,
          isCorrect,
          isAttempted,
          marks: q.marks || 1,
          explanation: import.meta.env.DEV ? (q.explanation || '') : ''
        };
      });

      const unattempted = examQuestions.length - attempted;
      const percentage = totalMarks > 0 ? parseFloat(((earnedMarks / totalMarks) * 100).toFixed(2)) : 0;
      const status = earnedMarks >= passingMarks ? 'PASS' : 'FAIL';

      const results = JSON.parse(localStorage.getItem('cvrgu_results') || '[]');
      const priorAttempts = results.filter(
        r => (r.studentId === submissionData.studentId || r.studentEmail === submissionData.studentEmail) &&
             r.examId === Number(submissionData.examId)
      );
      const attemptNumber = submissionData.attemptNumber || (priorAttempts.length + 1);
      const isRetest = attemptNumber > 1;

      // Calculate section-wise scores
      const sectionScores = {};
      if (exam && exam.sections && exam.sections.length > 0) {
        exam.sections.forEach(sec => {
          const secQuestions = examQuestions.filter(q => q.sectionId === sec.id);
          let secScore = 0;
          let secAttempted = 0;
          secQuestions.forEach(q => {
            const ans = answers[q.id];
            if (ans !== undefined && ans !== null) {
              secAttempted++;
              if (Number(ans) === Number(q.correctAnswer)) {
                secScore += (q.marks || 1);
              }
            }
          });
          sectionScores[sec.id] = {
            id: sec.id,
            title: sec.title,
            score: secScore,
            totalMarks: sec.totalMarks,
            totalQuestions: sec.totalQuestions,
            attempted: secAttempted,
            percentage: sec.totalMarks > 0 ? parseFloat(((secScore / sec.totalMarks) * 100).toFixed(2)) : 0
          };
        });
      }

      const newResult = {
        id: `res-${Date.now()}`,
        studentId: submissionData.studentId,
        studentName: submissionData.studentName,
        studentEmail: submissionData.studentEmail,
        rollNumber: submissionData.rollNumber,
        department: submissionData.department,
        examId: Number(submissionData.examId),
        examTitle: exam ? exam.title : 'Examination',
        examCode: exam ? exam.code : 'EXAM',
        attemptNumber,
        isRetest,
        retestRefCode: submissionData.retestRefCode || (isRetest ? `COE/CVRGU/RET-2026/${Math.floor(100 + Math.random() * 900)}` : null),
        totalQuestions: examQuestions.length,
        attempted,
        correct,
        wrong,
        unattempted,
        score: earnedMarks,
        totalMarks,
        passingMarks,
        percentage,
        status,
        submittedAt: new Date().toISOString(),
        violations: submissionData.violations || 0,
        autoSubmitted: Boolean(submissionData.autoSubmitted),
        sectionScores,
        questionReview
      };

      results.unshift(newResult);
      localStorage.setItem('cvrgu_results', JSON.stringify(results));

      return newResult;
    } catch (err) {
      console.error('Failed to submit exam result:', err);
      throw err;
    }
  },

  /**
   * Get all results for a specific student
   */
  getResultsByStudentId: async (studentId, email) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      const results = JSON.parse(localStorage.getItem('cvrgu_results') || '[]');
      return results.filter(
        r => r.studentId === studentId || (email && r.studentEmail?.toLowerCase() === email.toLowerCase())
      );
    } catch (err) {
      console.error('Failed to get student results:', err);
      throw err;
    }
  },

  /**
   * Get all results across the university (Admin)
   */
  getAllResults: async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 250));
      return JSON.parse(localStorage.getItem('cvrgu_results') || '[]');
    } catch (err) {
      console.error('Failed to get all results:', err);
      throw err;
    }
  },

  /**
   * Get specific result by ID
   */
  getResultById: async (id) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 150));
      const results = JSON.parse(localStorage.getItem('cvrgu_results') || '[]');
      const res = results.find(r => r.id === id);
      if (!res) throw new Error('Result not found.');
      return res;
    } catch (err) {
      console.error(`Failed to get result ${id}:`, err);
      throw err;
    }
  }
};
