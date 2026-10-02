import React, { useState, useRef, useMemo } from 'react';
import {
  X,
  Upload,
  FileSpreadsheet,
  Download,
  AlertCircle,
  AlertTriangle,
  ClipboardPaste,
  ArrowRight,
  HelpCircle,
  FileText
} from 'lucide-react';
import {
  downloadQuestionTemplate,
  parseSpreadsheetFile,
  parsePastedText,
  validateQuestionRows
} from '../../utils/questionImporter';
import { questionService } from '../../services/questionService';

export const BulkUploadModal = ({
  isOpen,
  onClose,
  examId,
  examTitle,
  existingQuestions = [],
  lockToSection = null,
  onUploadSuccess
}) => {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'paste'
  const [pastedText, setPastedText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [parseError, setParseError] = useState(null);

  // Parsed results & preview state
  const [parsedData, setParsedData] = useState(null);
  const [previewTab, setPreviewTab] = useState('summary'); // 'summary' | 'questions' | 'issues' | 'duplicates'
  const [fileName, setFileName] = useState('');

  const fileInputRef = useRef(null);

  const importableCount = useMemo(
    () => parsedData?.validQuestions.filter(q => q.duplicateResolution !== 'skip').length ?? 0,
    [parsedData]
  );

  if (!isOpen) return null;

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParsing(true);
    setParseError(null);
    setFileName(file.name);

    try {
      const rows = await parseSpreadsheetFile(file);
      const validationResult = validateQuestionRows(rows, existingQuestions, lockToSection);
      setParsedData(validationResult);
      setPreviewTab(validationResult.issuesCount > 0 ? 'issues' : 'summary');
    } catch (err) {
      setParseError(err.message || 'Failed to parse spreadsheet file.');
      setParsedData(null);
    } finally {
      setParsing(false);
    }
  };

  const handleProcessPasted = () => {
    if (!pastedText.trim()) {
      setParseError('Please paste your questions table first.');
      return;
    }

    setParsing(true);
    setParseError(null);
    setFileName('Pasted Clipboard Content');

    try {
      const rows = parsePastedText(pastedText);
      const validationResult = validateQuestionRows(rows, existingQuestions, lockToSection);
      setParsedData(validationResult);
      setPreviewTab(validationResult.issuesCount > 0 ? 'issues' : 'summary');
    } catch (err) {
      setParseError(err.message || 'Failed to process pasted text.');
      setParsedData(null);
    } finally {
      setParsing(false);
    }
  };

  const handleDuplicateResolution = (rowNumber, action) => {
    if (!parsedData) return;
    const updatedValid = parsedData.validQuestions.map(q => {
      if (q.rowNumber === rowNumber) {
        return { ...q, duplicateResolution: action };
      }
      return q;
    });

    setParsedData({
      ...parsedData,
      validQuestions: updatedValid
    });
  };

  const handleConfirmImport = async () => {
    if (!parsedData || parsedData.validQuestions.length === 0) return;

    setImporting(true);
    try {
      await questionService.bulkUpload(examId, parsedData.validQuestions, { lockToSection });
      onUploadSuccess();
      onClose();
    } catch (err) {
      setParseError(err.message || 'Import failed. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  const handleReset = () => {
    setParsedData(null);
    setParseError(null);
    setPastedText('');
    setFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const letters = ['A', 'B', 'C', 'D'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in my-8 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-[#06264A] text-white p-5 sm:px-8 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-white/10 text-[#F5A623]">
                <FileSpreadsheet className="w-5 h-5" />
              </span>
              <h2 className="font-extrabold text-base sm:text-lg">
                {lockToSection ? `Upload Questions to: ${lockToSection.title || lockToSection.name}` : 'Upload All Questions — Examination Bank Importer'}
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Target Examination: <strong className="text-white">{examTitle}</strong>
              {lockToSection && (
                <span className="ml-2 px-2 py-0.5 rounded bg-[#F5A623] text-[#06264A] font-extrabold text-[10px] uppercase">
                  Locked to {lockToSection.title || lockToSection.name}
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-white/10 p-1 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => downloadQuestionTemplate('xlsx')}
                className="px-2.5 py-1 rounded-lg bg-[#F5A623] hover:bg-amber-400 text-[#06264A] font-bold flex items-center gap-1 transition-all"
                title="Download standard Excel .xlsx template"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Template (.xlsx)</span>
              </button>
              <button
                type="button"
                onClick={() => downloadQuestionTemplate('csv')}
                className="px-2.5 py-1 rounded-lg hover:bg-white/10 text-white font-medium flex items-center gap-1 transition-all"
                title="Download CSV template"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Template (.csv)</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:px-8 overflow-y-auto flex-1 space-y-5 text-xs">

          {/* Initial Intake: Upload File or Paste */}
          {!parsedData ? (
            <div className="space-y-5">
              {/* Tab Selector */}
              <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                <button
                  type="button"
                  onClick={() => { setActiveTab('upload'); setParseError(null); }}
                  className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
                    activeTab === 'upload'
                      ? 'bg-[#06264A] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Spreadsheet File (.xlsx, .csv)</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('paste'); setParseError(null); }}
                  className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
                    activeTab === 'paste'
                      ? 'bg-[#06264A] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <ClipboardPaste className="w-4 h-4" />
                  <span>Paste Questions (from Excel / Sheet)</span>
                </button>
              </div>

              {parseError && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold text-red-900">Upload Parsing Issue</strong>
                    <span>{parseError}</span>
                  </div>
                </div>
              )}

              {/* Upload Tab View */}
              {activeTab === 'upload' ? (
                <div className="space-y-4">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-[#06264A] rounded-3xl p-10 text-center cursor-pointer bg-slate-50/60 hover:bg-blue-50/30 transition-all space-y-3 group"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-[#06264A]/5 text-[#06264A] flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                      <Upload className="w-8 h-8 text-[#06264A]" />
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-slate-800">
                        Click to select or drag and drop your questions spreadsheet
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Supports <span className="font-bold text-[#06264A]">.xlsx</span>, <span className="font-bold text-[#06264A]">.xls</span>, and <span className="font-bold text-[#06264A]">.csv</span> files
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx, .xls, .csv"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>

                  {/* Template instruction card */}
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
                    <HelpCircle className="w-5 h-5 text-[#F5A623] shrink-0 mt-0.5" />
                    <div className="space-y-1 leading-relaxed">
                      <strong className="block font-bold text-[#06264A]">Spreadsheet Format Guidance:</strong>
                      <p>
                        Include columns: <code className="font-bold text-[#06264A]">Section</code>, <code className="font-bold text-[#06264A]">Section Order</code>, <code className="font-bold text-[#06264A]">Question</code>, <code className="font-bold text-[#06264A]">Option A - D</code>, <code className="font-bold text-[#06264A]">Correct Answer (A/B/C/D)</code>, <code className="font-bold text-[#06264A]">Marks</code>, <code className="font-bold text-[#06264A]">Difficulty</code>, and <code className="font-bold text-[#06264A]">Explanation</code>.
                      </p>
                      <p>
                        Need an example? Click the <strong>Template (.xlsx)</strong> button at the top right to download our pre-formatted template.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Paste Tab View */
                <div className="space-y-4">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Paste rows directly from Excel or Google Sheets (Ctrl + V)
                    </label>
                    <textarea
                      value={pastedText}
                      onChange={(e) => setPastedText(e.target.value)}
                      rows={8}
                      placeholder={`Section\tSection Order\tQuestion\tOption A\tOption B\tOption C\tOption D\tCorrect Answer\tMarks\tDifficulty\tExplanation\nAptitude\t1\tWhat is 20% of 100?\t10\t20\t30\t40\tB\t1\tEasy\t20% of 100 is 20.`}
                      className="w-full p-3 font-mono text-xs rounded-2xl border border-slate-300 focus:outline-hidden focus:border-[#06264A] bg-slate-50"
                    />
                  </div>

                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      disabled={!pastedText.trim() || parsing}
                      onClick={handleProcessPasted}
                      className="px-5 py-2.5 rounded-xl bg-[#06264A] text-white font-bold hover:bg-[#0A3B72] flex items-center gap-2 disabled:opacity-50 transition-all"
                    >
                      {parsing ? (
                        <span>Processing pasted rows...</span>
                      ) : (
                        <>
                          <span>Parse & Inspect Questions</span>
                          <ArrowRight className="w-4 h-4 text-[#F5A623]" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* IMPORT PREVIEW VIEW (After automatic processing) */
            <div className="space-y-5">
              
              {/* File Info & Reset Action */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-5 h-5 text-[#06264A]" />
                  <div>
                    <p className="font-bold text-slate-800">{fileName}</p>
                    <p className="text-[11px] text-slate-500">File processed automatically into structured questions.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 font-bold hover:bg-slate-100 text-slate-700 transition-colors"
                >
                  Choose Different File
                </button>
              </div>

              {/* Statistics Overview Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-100">
                  <span className="text-[11px] font-bold text-blue-800 uppercase block">Found</span>
                  <p className="text-xl font-black text-[#06264A] mt-1">
                    ✓ {parsedData.totalFound} Questions
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-100">
                  <span className="text-[11px] font-bold text-indigo-800 uppercase block">Sections</span>
                  <p className="text-xl font-black text-indigo-900 mt-1">
                    ✓ {parsedData.sectionsList.length} Detected
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase block">Valid</span>
                  <p className="text-xl font-black text-emerald-800 mt-1">
                    ✓ {parsedData.validCount} Ready
                  </p>
                </div>

                <div className={`p-3.5 rounded-2xl border ${
                  parsedData.issuesCount > 0 ? 'bg-red-50 border-red-200 text-red-900' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                  <span className="text-[11px] font-bold uppercase block">Attention</span>
                  <p className="text-xl font-black mt-1">
                    {parsedData.issuesCount > 0 ? `⚠ ${parsedData.issuesCount} Need Review` : '✓ 0 Errors'}
                  </p>
                </div>
              </div>

              {/* Sub-Tabs for Preview Details */}
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <button
                  type="button"
                  onClick={() => setPreviewTab('summary')}
                  className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                    previewTab === 'summary'
                      ? 'bg-[#06264A] text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Section Breakdown ({parsedData.sectionsList.length})
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewTab('questions')}
                  className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                    previewTab === 'questions'
                      ? 'bg-[#06264A] text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Questions List ({parsedData.validQuestions.length})
                </button>

                {parsedData.issuesCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setPreviewTab('issues')}
                    className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                      previewTab === 'issues'
                        ? 'bg-red-600 text-white'
                        : 'bg-red-50 text-red-700 hover:bg-red-100'
                    }`}
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Row Errors ({parsedData.issuesCount})</span>
                  </button>
                )}

                {parsedData.duplicateCandidates.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setPreviewTab('duplicates')}
                    className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                      previewTab === 'duplicates'
                        ? 'bg-amber-500 text-white'
                        : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Possible Duplicates ({parsedData.duplicateCandidates.length})</span>
                  </button>
                )}
              </div>

              {/* Sub-tab: Section Breakdown Table */}
              {previewTab === 'summary' && (
                <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-200/70 text-slate-700 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-5">Section</th>
                        <th className="py-3 px-5 text-center">Questions</th>
                        <th className="py-3 px-5 text-center">Marks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {parsedData.sectionsList.map((sec, idx) => (
                        <tr key={idx} className="bg-white hover:bg-slate-50">
                          <td className="py-3 px-5 font-bold text-[#06264A]">
                            {sec.sectionName}
                          </td>
                          <td className="py-3 px-5 text-center font-semibold text-slate-700">
                            {sec.questionsCount}
                          </td>
                          <td className="py-3 px-5 text-center font-bold text-emerald-700">
                            {sec.totalMarks}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-blue-50/70 font-extrabold text-[#06264A]">
                        <td className="py-3 px-5 uppercase">Total Summary</td>
                        <td className="py-3 px-5 text-center">{parsedData.validCount} Questions</td>
                        <td className="py-3 px-5 text-center">{parsedData.totalMarks} Marks</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* Sub-tab: Questions Detailed List */}
              {previewTab === 'questions' && (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {parsedData.validQuestions.map((q, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-[#06264A] transition-colors space-y-2"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-2">
                          <span className="font-bold font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                            Row {q.rowNumber}
                          </span>
                          <span className="font-bold px-2 py-0.5 rounded-md bg-blue-100 text-[#06264A]">
                            {q.section}
                          </span>
                          <span className="font-semibold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900">
                            {q.difficulty}
                          </span>
                        </div>
                        <span className="font-bold text-emerald-700">+{q.marks} Mark(s)</span>
                      </div>

                      <p className="font-bold text-slate-900">{q.questionText}</p>

                      {/* Options */}
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        {q.options.map((opt, oIdx) => (
                          <div
                            key={oIdx}
                            className={`p-2 rounded-xl border flex items-center gap-2 ${
                              oIdx === q.correctAnswer
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold'
                                : 'border-slate-200 bg-slate-50 text-slate-600'
                            }`}
                          >
                            <span className="font-mono">{letters[oIdx]}.</span>
                            <span className="truncate">{opt}</span>
                            {oIdx === q.correctAnswer && <span className="ml-auto">✓</span>}
                          </div>
                        ))}
                      </div>

                      {q.explanation && (
                        <p className="text-[11px] text-slate-500 italic">
                          Explanation: {q.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Sub-tab: Validation Issues / Row Errors */}
              {previewTab === 'issues' && (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {parsedData.issues.map((iss, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-900 space-y-1.5"
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span>Row {iss.rowNumber}</span>
                        <span className="text-[11px] font-normal text-slate-500 italic truncate max-w-xs">
                          {iss.questionText}
                        </span>
                      </div>
                      <ul className="list-disc pl-5 text-xs space-y-0.5 text-red-800">
                        {iss.errors.map((err, eIdx) => (
                          <li key={eIdx}>❌ {err}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* Sub-tab: Duplicate Detection */}
              {previewTab === 'duplicates' && (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {parsedData.duplicateCandidates.map((dup, dIdx) => (
                    <div
                      key={dIdx}
                      className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-bold text-[#06264A]">
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                          <span>⚠ Possible Duplicate Detected (Row {dup.rowNumber})</span>
                        </div>
                        <span className="text-[11px] bg-amber-200/60 px-2 py-0.5 rounded-md font-semibold">
                          Source: {dup.duplicateMatch.source}
                        </span>
                      </div>

                      <p className="font-bold text-slate-800 text-xs">
                        "{dup.questionText}"
                      </p>

                      <p className="text-[11px] text-slate-600 italic">
                        Similar to: "{dup.duplicateMatch.existingText}"
                      </p>

                      {/* Duplicate resolution actions */}
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-amber-200/60">
                        <button
                          type="button"
                          onClick={() => handleDuplicateResolution(dup.rowNumber, 'skip')}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                            dup.questionObj.duplicateResolution === 'skip'
                              ? 'bg-red-600 text-white'
                              : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          Skip Question
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDuplicateResolution(dup.rowNumber, 'import')}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                            dup.questionObj.duplicateResolution === 'import'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          Import Anyway
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 sm:px-8 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 font-semibold hover:bg-slate-100 text-slate-700"
          >
            Cancel
          </button>

          {parsedData && (
            <button
              type="button"
              disabled={importing || importableCount === 0}
              onClick={handleConfirmImport}
              className="px-6 py-2.5 rounded-xl bg-[#06264A] hover:bg-[#0A3B72] text-white font-extrabold text-xs shadow-md flex items-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
            >
              {importing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Importing Questions...</span>
                </>
              ) : (
                <>
                  <span>Confirm Import ({importableCount} Questions)</span>
                  <ArrowRight className="w-4 h-4 text-[#F5A623]" />
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default BulkUploadModal;
