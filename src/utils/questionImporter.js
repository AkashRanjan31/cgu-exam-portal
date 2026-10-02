import * as XLSX from 'xlsx';

/**
 * Standard CVRGU Excel / CSV Headers
 */
export const TEMPLATE_HEADERS = [
  'Section',
  'Section Order',
  'Question',
  'Option A',
  'Option B',
  'Option C',
  'Option D',
  'Correct Answer',
  'Marks',
  'Difficulty',
  'Explanation'
];

/**
 * High-quality reference template rows
 */
export const SAMPLE_TEMPLATE_ROWS = [
  {
    'Section': 'Aptitude',
    'Section Order': 1,
    'Question': 'What is 20% of 100?',
    'Option A': '10',
    'Option B': '20',
    'Option C': '30',
    'Option D': '40',
    'Correct Answer': 'B',
    'Marks': 1,
    'Difficulty': 'Easy',
    'Explanation': '20% of 100 is (20/100) * 100 = 20.'
  },
  {
    'Section': 'Aptitude',
    'Section Order': 1,
    'Question': 'A train running at 72 km/h crosses a 200m platform in 25 seconds. What is the length of the train?',
    'Option A': '250m',
    'Option B': '300m',
    'Option C': '350m',
    'Option D': '400m',
    'Correct Answer': 'B',
    'Marks': 2,
    'Difficulty': 'Medium',
    'Explanation': 'Speed = 72 * (5/18) = 20 m/s. Total distance = 20 * 25 = 500m. Length of train = 500 - 200 = 300m.'
  },
  {
    'Section': 'Reasoning',
    'Section Order': 2,
    'Question': 'If all Bloops are Razzies and all Razzies are Lazzies, are all Bloops definitely Lazzies?',
    'Option A': 'Yes',
    'Option B': 'No',
    'Option C': 'Cannot be determined',
    'Option D': 'None of the above',
    'Correct Answer': 'A',
    'Marks': 1,
    'Difficulty': 'Easy',
    'Explanation': 'By standard syllogism, subset relation is transitive.'
  },
  {
    'Section': 'Reasoning',
    'Section Order': 2,
    'Question': 'Find the next number in the sequence: 2, 6, 12, 20, 30, ?',
    'Option A': '40',
    'Option B': '42',
    'Option C': '44',
    'Option D': '46',
    'Correct Answer': 'B',
    'Marks': 2,
    'Difficulty': 'Medium',
    'Explanation': 'Differences are +4, +6, +8, +10, so next difference is +12. 30 + 12 = 42.'
  },
  {
    'Section': 'Technical',
    'Section Order': 3,
    'Question': 'Which data structure operates strictly on a Last-In-First-Out (LIFO) principle?',
    'Option A': 'Queue',
    'Option B': 'Stack',
    'Option C': 'Array',
    'Option D': 'Linked List',
    'Correct Answer': 'B',
    'Marks': 1,
    'Difficulty': 'Easy',
    'Explanation': 'A Stack restricts insertion and deletion to one end called top, enforcing LIFO.'
  },
  {
    'Section': 'Technical',
    'Section Order': 3,
    'Question': 'In CVRGU Online Examination System, section-locking is irreversible once a section is submitted or its timer expires.',
    'Option A': 'True',
    'Option B': 'False',
    'Option C': '',
    'Option D': '',
    'Correct Answer': 'A',
    'Marks': 1,
    'Difficulty': 'Easy',
    'Explanation': 'Locked sections cannot be reopened or edited by students.'
  }
];

/**
 * Generate and trigger download for Question Template (.xlsx or .csv)
 */
export const downloadQuestionTemplate = (format = 'xlsx') => {
  const ws = XLSX.utils.json_to_sheet(SAMPLE_TEMPLATE_ROWS, {
    header: TEMPLATE_HEADERS
  });

  // Set column widths for readability
  ws['!cols'] = [
    { wch: 15 }, // Section
    { wch: 14 }, // Section Order
    { wch: 45 }, // Question
    { wch: 20 }, // Option A
    { wch: 20 }, // Option B
    { wch: 20 }, // Option C
    { wch: 20 }, // Option D
    { wch: 15 }, // Correct Answer
    { wch: 8 },  // Marks
    { wch: 12 }, // Difficulty
    { wch: 35 }  // Explanation
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Questions');

  const filename = `cvrgu_question_template.${format}`;

  if (format === 'csv') {
    const csvData = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  } else {
    XLSX.writeFile(wb, filename);
  }
};

/**
 * Normalizes an arbitrary header name to our internal standard key
 */
const normalizeHeaderKey = (rawHeader) => {
  if (!rawHeader) return '';
  const clean = String(rawHeader).trim().toLowerCase().replace(/[^a-z0-9]/g, '');

  if (clean === 'section' || clean === 'sectionname' || clean === 'sec') return 'Section';
  if (clean.includes('sectionorder') || clean === 'secorder' || clean === 'order') return 'Section Order';
  if (clean.includes('question') || clean === 'qtext' || clean === 'problem') return 'Question';
  if (clean === 'optiona' || clean === 'opta' || clean === 'a') return 'Option A';
  if (clean === 'optionb' || clean === 'optb' || clean === 'b') return 'Option B';
  if (clean === 'optionc' || clean === 'optc' || clean === 'c') return 'Option C';
  if (clean === 'optiond' || clean === 'optd' || clean === 'd') return 'Option D';
  if (clean.includes('correct') || clean === 'ans' || clean === 'answer') return 'Correct Answer';
  if (clean.includes('mark') || clean === 'points' || clean === 'score') return 'Marks';
  if (clean.includes('diff') || clean === 'level') return 'Difficulty';
  if (clean.includes('exp') || clean.includes('rationale') || clean.includes('solution')) return 'Explanation';

  return rawHeader;
};

/**
 * Sanitise a spreadsheet cell value to prevent formula injection.
 * Strips leading =, +, -, @ characters that Excel/Sheets treat as formula prefixes.
 */
const sanitizeCell = (val) => {
  if (typeof val !== 'string') return val;
  return val.trim().replace(/^[=+\-@]+/, '');
};

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Parse an uploaded .xlsx, .xls, or .csv file
 */
export const parseSpreadsheetFile = async (file) => {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return Promise.reject(new Error('File exceeds the 5 MB size limit. Please reduce the file size and try again.'));
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          throw new Error('Spreadsheet has no worksheets.');
        }

        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          throw new Error('Spreadsheet is empty. No question rows detected.');
        }

        // Normalize rows with standardized headers and sanitize formula injection
        const normalizedRows = rawJson.map((row) => {
          const norm = {};
          Object.keys(row).forEach((key) => {
            const mappedKey = normalizeHeaderKey(key);
            norm[mappedKey] = sanitizeCell(
              typeof row[key] === 'string' ? row[key].trim() : row[key]
            );
          });
          return norm;
        });

        resolve(normalizedRows);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file from disk.'));
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Parse raw pasted text (TSV from Excel / Google Sheets or CSV).
 * Input is capped at 500 KB to mitigate the xlsx ReDoS vulnerability
 * (GHSA-5pgg-2g8v-p4x9) which triggers on very long lines in CSV mode.
 */
export const parsePastedText = (rawText) => {
  if (!rawText || !rawText.trim()) {
    throw new Error('Pasted content is empty.');
  }
  if (rawText.length > 500_000) {
    throw new Error('Pasted content exceeds 500 KB. Please use file upload instead.');
  }

  const workbook = XLSX.read(rawText, { type: 'string', raw: true });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const rawJson = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  if (!rawJson || rawJson.length === 0) {
    throw new Error('Could not parse any rows from pasted text.');
  }

  return rawJson.map((row) => {
    const norm = {};
    Object.keys(row).forEach((key) => {
      const mappedKey = normalizeHeaderKey(key);
      norm[mappedKey] = sanitizeCell(
        typeof row[key] === 'string' ? row[key].trim() : row[key]
      );
    });
    return norm;
  });
};

/**
 * Text similarity calculator (Levenshtein / normalized token overlap)
 */
export const calculateSimilarity = (str1, str2) => {
  if (!str1 || !str2) return 0;
  const s1 = String(str1).toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  const s2 = String(str2).toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();

  if (s1 === s2) return 1.0;

  const words1 = new Set(s1.split(/\s+/).filter(Boolean));
  const words2 = new Set(s2.split(/\s+/).filter(Boolean));

  if (words1.size === 0 || words2.size === 0) return 0;

  let intersection = 0;
  words1.forEach(w => {
    if (words2.has(w)) intersection++;
  });

  const union = new Set([...words1, ...words2]).size;
  return union > 0 ? intersection / union : 0;
};

/**
 * Normalize and validate correct answer letter / number
 * Returns 0 (A), 1 (B), 2 (C), 3 (D) or null if invalid
 */
export const parseCorrectAnswer = (val, isTrueFalse = false) => {
  if (val === undefined || val === null) return null;
  const s = String(val).trim().toUpperCase();

  if (s === 'A' || s === 'OPT A' || s === 'OPTION A' || s === '0') {
    return 0;
  }
  if (s === '1') {
    return isTrueFalse ? 0 : 0; // 1-based "1" -> 0
  }
  if (s === 'B' || s === 'OPT B' || s === 'OPTION B' || s === '2') {
    return 1;
  }
  if (s === 'C' || s === 'OPT C' || s === 'OPTION C' || s === '3') {
    return 2;
  }
  if (s === 'D' || s === 'OPT D' || s === 'OPTION D' || s === '4') {
    return 3;
  }

  // True / False string values
  if (s === 'TRUE' || s === 'T') return 0; // Option A is True
  if (s === 'FALSE' || s === 'F') return 1; // Option B is False

  return null;
};

/**
 * Validate each row and compute diagnostics
 */
export const validateQuestionRows = (rows, existingQuestions = [], lockToSection = null) => {
  const issues = [];
  const validQuestions = [];
  const duplicateCandidates = [];

  rows.forEach((row, index) => {
    const rowNum = index + 2; // Row 1 is header in Excel/CSV
    const rowErrors = [];

    const rawSection = (row['Section'] || '').trim();
    const section = lockToSection ? (lockToSection.title || lockToSection.name || rawSection) : rawSection;
    const sectionOrder = parseInt(row['Section Order'], 10) || 1;
    const questionText = (row['Question'] || '').trim();
    let optA = String(row['Option A'] || '').trim();
    let optB = String(row['Option B'] || '').trim();
    let optC = String(row['Option C'] || '').trim();
    let optD = String(row['Option D'] || '').trim();
    const rawAnswer = row['Correct Answer'];
    const marksVal = row['Marks'];
    const difficulty = (row['Difficulty'] || 'Easy').trim();
    const explanation = (row['Explanation'] || '').trim();

    // 1. Section check
    if (!section) {
      rowErrors.push('Section is missing.');
    }

    // 2. Question text check
    if (!questionText) {
      rowErrors.push('Question statement is missing.');
    }

    // 3. Question Type detection
    const isTrueFalse =
      (optA.toLowerCase() === 'true' && optB.toLowerCase() === 'false') ||
      (!optC && !optD && (String(rawAnswer).toLowerCase() === 'true' || String(rawAnswer).toLowerCase() === 'false'));

    if (isTrueFalse) {
      if (!optA) optA = 'True';
      if (!optB) optB = 'False';
      optC = '';
      optD = '';
    } else {
      if (!optA) rowErrors.push('Option A is missing.');
      if (!optB) rowErrors.push('Option B is missing.');
      if (!optC) rowErrors.push('Option C is missing.');
      if (!optD) rowErrors.push('Option D is missing.');
    }

    // 4. Correct Answer check
    const correctAnswerIndex = parseCorrectAnswer(rawAnswer, isTrueFalse);
    if (correctAnswerIndex === null || (isTrueFalse && correctAnswerIndex > 1)) {
      rowErrors.push(`Correct Answer "${rawAnswer ?? ''}" is invalid. Must be A, B, C, or D (or True/False).`);
    }

    // 5. Marks check
    const marks = Number(marksVal);
    if (isNaN(marks) || marks <= 0) {
      rowErrors.push(`Marks "${marksVal ?? ''}" is invalid. Must be a positive number.`);
    }

    // 6. Duplicate check against existing questions and current batch
    let duplicateMatch = null;
    if (questionText) {
      // Check in existing exam bank
      const matchInExisting = existingQuestions.find(eq => {
        return calculateSimilarity(eq.questionText, questionText) >= 0.82;
      });

      if (matchInExisting) {
        duplicateMatch = {
          source: 'Existing Examination Bank',
          existingText: matchInExisting.questionText,
          existingId: matchInExisting.id
        };
      } else {
        // Check in already parsed questions in this batch
        const matchInBatch = validQuestions.find(vq => {
          return calculateSimilarity(vq.questionText, questionText) >= 0.95;
        });
        if (matchInBatch) {
          duplicateMatch = {
            source: 'Current Upload Batch',
            existingText: matchInBatch.questionText,
            existingRow: matchInBatch.rowNumber
          };
        }
      }
    }

    if (rowErrors.length > 0) {
      issues.push({
        rowNumber: rowNum,
        questionText: questionText || 'Untitled Question',
        errors: rowErrors
      });
    } else {
      const qObj = {
        rowNumber: rowNum,
        section,
        sectionOrder,
        questionText,
        questionType: isTrueFalse ? 'true_false' : 'mcq',
        options: isTrueFalse ? ['True', 'False'] : [optA, optB, optC, optD],
        optionA: optA,
        optionB: optB,
        optionC: optC,
        optionD: optD,
        correctAnswer: correctAnswerIndex,
        marks: marks || 1,
        difficulty: ['Easy', 'Medium', 'Hard'].includes(difficulty) ? difficulty : 'Easy',
        explanation,
        isDuplicate: Boolean(duplicateMatch),
        duplicateMatch,
        duplicateResolution: 'import' // 'import' | 'skip'
      };

      if (duplicateMatch) {
        duplicateCandidates.push({
          rowNumber: rowNum,
          questionText,
          duplicateMatch,
          questionObj: qObj
        });
      }

      validQuestions.push(qObj);
    }
  });

  // Group sections
  const sectionMap = {};
  validQuestions.forEach(q => {
    if (!sectionMap[q.section]) {
      sectionMap[q.section] = {
        sectionName: q.section,
        sectionOrder: q.sectionOrder,
        questionsCount: 0,
        totalMarks: 0
      };
    }
    sectionMap[q.section].questionsCount += 1;
    sectionMap[q.section].totalMarks += q.marks;
  });

  const sectionsList = Object.values(sectionMap).sort((a, b) => a.sectionOrder - b.sectionOrder);

  const totalCalculatedMarks = validQuestions.reduce((sum, q) => sum + q.marks, 0);

  return {
    totalFound: rows.length,
    validCount: validQuestions.length,
    issuesCount: issues.length,
    issues,
    validQuestions,
    duplicateCandidates,
    sectionsList,
    totalMarks: totalCalculatedMarks
  };
};
