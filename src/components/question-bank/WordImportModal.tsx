import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Question, QuestionType, TrueFalseStatement } from '../../types';
import {
  downloadWordTemplate,
  extractTextFromFile,
  parseQuestionsFromText,
  ParsedQuestionResult,
} from '../../lib/wordQuestionParser';
import {
  FileText,
  Download,
  Upload,
  CheckCircle,
  CheckSquare,
  AlertCircle,
  FileCheck,
  RefreshCw,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Save,
  Trash2,
  CheckCircle2,
  Edit3,
  Layers,
  Check,
  ChevronDown,
  ChevronUp,
  Plus,
} from 'lucide-react';

interface WordImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportQuestions: (questions: Omit<Question, 'id' | 'updatedAt'>[]) => void;
}

export const WordImportModal: React.FC<WordImportModalProps> = ({
  isOpen,
  onClose,
  onImportQuestions,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState('');
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [grade, setGrade] = useState<10 | 11 | 12>(10);
  const [topic, setTopic] = useState('Lịch sử Việt Nam');
  const [lesson, setLesson] = useState('Chương trình GDNN - GDTX');
  const [parseResult, setParseResult] = useState<ParsedQuestionResult | null>(null);
  const [editableQuestions, setEditableQuestions] = useState<Omit<Question, 'id' | 'updatedAt'>[]>([]);
  const [savedStatusMap, setSavedStatusMap] = useState<Record<number, string>>({});
  const [isSuccessImport, setIsSuccessImport] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setIsLoadingFile(true);
    setParseResult(null);

    try {
      const text = await extractTextFromFile(file);
      setRawText(text);
      // Auto parse
      const res = parseQuestionsFromText(text, grade, topic, lesson);
      setParseResult(res);
      setEditableQuestions(res.questions);
      setSavedStatusMap({});
      showToast(`Đã nhận diện thành công ${res.questions.length} câu hỏi từ file Word!`);
    } catch (err: any) {
      alert('Không thể đọc file Word này: ' + (err.message || 'Lỗi không xác định'));
    } finally {
      setIsLoadingFile(false);
    }
  };

  const handleParseNow = () => {
    if (!rawText.trim()) return;
    const res = parseQuestionsFromText(rawText, grade, topic, lesson);
    setParseResult(res);
    setEditableQuestions(res.questions);
    setSavedStatusMap({});
    showToast(`Đã phân tích thành công ${res.questions.length} câu hỏi!`);
  };

  // ---------------------------------------------------------------------------
  // INTERACTIVE EDITING HELPERS FOR EACH QUESTION
  // ---------------------------------------------------------------------------
  const handleUpdateQuestionField = (
    index: number,
    field: keyof Omit<Question, 'id' | 'updatedAt'>,
    value: any
  ) => {
    setEditableQuestions((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // Set correct answer for Single Choice question (A, B, C, D)
  const handleSetSingleCorrect = (index: number, letter: string) => {
    setEditableQuestions((prev) => {
      const copy = [...prev];
      const q = copy[index];
      copy[index] = { ...q, correctAnswer: letter.toUpperCase() };
      return copy;
    });
  };

  // Update option text for Single Choice
  const handleUpdateSingleOption = (
    questionIndex: number,
    optIndex: number,
    letter: string,
    text: string
  ) => {
    setEditableQuestions((prev) => {
      const copy = [...prev];
      const q = copy[questionIndex];
      const newOpts = [...(q.options || ['A. ', 'B. ', 'C. ', 'D. '])];
      newOpts[optIndex] = `${letter}. ${text}`;
      copy[questionIndex] = { ...q, options: newOpts };
      return copy;
    });
  };

  // Helper format True/False answer string: e.g. "a-ĐÚNG, b-SAI, c-ĐÚNG, d-ĐÚNG"
  const formatTfAnswer = (statements: TrueFalseStatement[]): string => {
    return statements
      .map((s) => `${s.id}-${s.isCorrect ? 'ĐÚNG' : 'SAI'}`)
      .join(', ');
  };

  // Toggle True / False for a statement (a, b, c, d)
  const handleToggleTfStatement = (
    questionIndex: number,
    stmtIndex: number,
    isCorrect: boolean
  ) => {
    setEditableQuestions((prev) => {
      const copy = [...prev];
      const q = copy[questionIndex];
      if (!q.trueFalseStatements) return prev;

      const newStatements = q.trueFalseStatements.map((stmt, idx) =>
        idx === stmtIndex ? { ...stmt, isCorrect } : stmt
      );

      copy[questionIndex] = {
        ...q,
        trueFalseStatements: newStatements,
        correctAnswer: formatTfAnswer(newStatements),
      };
      return copy;
    });
  };

  // Update statement text for True/False
  const handleUpdateTfStatementText = (
    questionIndex: number,
    stmtIndex: number,
    statement: string
  ) => {
    setEditableQuestions((prev) => {
      const copy = [...prev];
      const q = copy[questionIndex];
      if (!q.trueFalseStatements) return prev;

      const newStatements = q.trueFalseStatements.map((stmt, idx) =>
        idx === stmtIndex ? { ...stmt, statement } : stmt
      );

      copy[questionIndex] = { ...q, trueFalseStatements: newStatements };
      return copy;
    });
  };

  // Save changes for an individual question
  const handleSaveQuestion = (index: number) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    setSavedStatusMap((prev) => ({
      ...prev,
      [index]: timeStr,
    }));
    showToast(`Đã lưu thành công nội dung & đáp án Câu ${index + 1}!`);
  };

  // Remove question from list
  const handleRemoveQuestion = (index: number) => {
    if (confirm(`Cô có chắc chắn muốn xóa Câu ${index + 1} khỏi danh sách nhập này không?`)) {
      setEditableQuestions((prev) => prev.filter((_, i) => i !== index));
      setSavedStatusMap((prev) => {
        const next: Record<number, string> = {};
        Object.entries(prev).forEach(([k, v]) => {
          const num = parseInt(k, 10);
          if (num < index) next[num] = v;
          else if (num > index) next[num - 1] = v;
        });
        return next;
      });
      showToast(`Đã xóa Câu ${index + 1}.`);
    }
  };

  // Add a new question directly into editable questions list
  const handleAddNewQuestionInWordModal = (type: QuestionType = 'Trắc nghiệm đơn') => {
    let newQ: Omit<Question, 'id' | 'updatedAt'>;
    if (type === 'Trắc nghiệm đúng sai') {
      newQ = {
        grade,
        topic,
        lesson,
        knowledgeDomain: 'Đọc hiểu và đánh giá sử liệu',
        type: 'Trắc nghiệm đúng sai',
        cognitiveLevel: 'Thông hiểu',
        content: `Đọc đoạn tư liệu sau đây:\n"Nhập đoạn trích tư liệu lịch sử hoặc hoàn cảnh lịch sử tại đây..."`,
        trueFalseStatements: [
          { id: 'a', statement: 'Nội dung nhận định ý a...', isCorrect: true },
          { id: 'b', statement: 'Nội dung nhận định ý b...', isCorrect: true },
          { id: 'c', statement: 'Nội dung nhận định ý c...', isCorrect: false },
          { id: 'd', statement: 'Nội dung nhận định ý d...', isCorrect: true },
        ],
        correctAnswer: 'a-ĐÚNG, b-ĐÚNG, c-SAI, d-ĐÚNG',
        explanation: 'Căn cứ vào tư liệu lịch sử trích dẫn.',
        source: 'Cô Cao Thị Thu biên soạn',
        author: 'Cao Thị Thu',
      };
    } else {
      newQ = {
        grade,
        topic,
        lesson,
        knowledgeDomain: 'Kiến thức cốt lõi',
        type: 'Trắc nghiệm đơn',
        cognitiveLevel: 'Nhận biết',
        content: `Câu hỏi trắc nghiệm mới số ${editableQuestions.length + 1}: Nhập nội dung câu hỏi tại đây...`,
        options: [
          'A. Phương án lựa chọn A',
          'B. Phương án lựa chọn B',
          'C. Phương án lựa chọn C',
          'D. Phương án lựa chọn D',
        ],
        correctAnswer: 'A',
        explanation: 'Căn cứ vào SGK Lịch sử GDPT 2018.',
        source: 'Cô Cao Thị Thu biên soạn',
        author: 'Cao Thị Thu',
      };
    }
    setEditableQuestions((prev) => [...prev, newQ]);
    showToast(`Đã thêm Câu ${editableQuestions.length + 1} mới! Cô có thể hiệu chỉnh nội dung và chọn đáp án.`);
  };

  // Confirm import all edited questions
  const handleConfirmImport = () => {
    if (editableQuestions.length === 0) return;
    onImportQuestions(editableQuestions);
    setIsSuccessImport(true);
    setTimeout(() => {
      setIsSuccessImport(false);
      onClose();
      // Reset
      setSelectedFile(null);
      setRawText('');
      setParseResult(null);
      setEditableQuestions([]);
    }, 1200);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nhập câu hỏi tự động từ file Word (.docx, .doc) & Chỉnh sửa trực tiếp"
      maxWidth="6xl"
    >
      <div className="space-y-4 text-xs font-sans">
        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#073B66] text-white px-4 py-2.5 rounded-2xl shadow-xl border border-sky-400 flex items-center gap-2 text-xs font-bold animate-in slide-in-from-bottom-3 duration-200">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Banner download template */}
        <div className="p-3.5 bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#0878C9] text-white shadow-2xs">
                <FileText className="w-4 h-4" />
              </span>
              <h4 className="font-bold text-[#073B66] text-sm">
                File Word mẫu chuẩn Lịch sử (Trắc nghiệm 1 đáp án & Đúng/Sai 2025)
              </h4>
            </div>
            <p className="text-slate-600 text-xs pl-8 font-serif leading-relaxed">
              Tải file mẫu về máy, dán câu hỏi của cô vào đúng cấu trúc. Sau khi phân tích, cô có thể bấm nút đổi đáp án và sửa nội dung trực tiếp từng câu trước khi lưu.
            </p>
          </div>

          <button
            type="button"
            onClick={downloadWordTemplate}
            className="px-4 py-2 bg-[#0878C9] hover:bg-[#073B66] text-white rounded-xl font-bold flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            Tải file Word mẫu (.doc)
          </button>
        </div>

        {/* Global Settings: Grade & Topic */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Áp dụng cho Khối lớp:</label>
            <select
              value={grade}
              onChange={(e) => {
                const g = parseInt(e.target.value, 10) as 10 | 11 | 12;
                setGrade(g);
                if (rawText) {
                  const res = parseQuestionsFromText(rawText, g, topic, lesson);
                  setParseResult(res);
                  setEditableQuestions(res.questions);
                }
              }}
              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg outline-none font-medium"
            >
              <option value={10}>Lớp 10 (GDTX)</option>
              <option value={11}>Lớp 11 (GDTX)</option>
              <option value={12}>Lớp 12 (GDTX)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Chương / Chủ đề:</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg outline-none font-medium"
              placeholder="Ví dụ: Kháng chiến chống Pháp"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Bài học:</label>
            <input
              type="text"
              value={lesson}
              onChange={(e) => setLesson(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg outline-none font-medium"
              placeholder="Ví dụ: Ôn tập định kỳ GDTX"
            />
          </div>
        </div>

        {/* Method Switch: File Upload vs Copy-Paste */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'upload'
                ? 'bg-[#073B66] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Cách 1: Tải lên file Word (.docx, .doc, .txt)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('paste')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'paste'
                ? 'bg-[#073B66] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Cách 2: Dán trực tiếp văn bản câu hỏi (Copy - Paste)
          </button>
        </div>

        {/* Tab 1: Upload File */}
        {activeTab === 'upload' && (
          <div className="p-6 border-2 border-dashed border-sky-300 bg-sky-50/30 rounded-2xl text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-sky-100 text-[#0878C9] flex items-center justify-center mx-auto shadow-2xs">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm">
                Chọn file Word chứa danh sách câu hỏi từ máy tính
              </p>
              <p className="text-slate-500 text-xs mt-0.5">
                Hỗ trợ định dạng Microsoft Word: <strong className="text-slate-700">.docx, .doc, .txt</strong>
              </p>
            </div>

            <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0878C9] hover:bg-[#073B66] text-white rounded-xl font-bold cursor-pointer shadow-xs transition-colors">
              <Upload className="w-4 h-4" />
              <span>{selectedFile ? `Đã chọn: ${selectedFile.name}` : 'Chọn file từ máy tính'}</span>
              <input
                type="file"
                accept=".docx,.doc,.txt"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {isLoadingFile && (
              <div className="flex items-center justify-center gap-2 text-slate-600 text-xs pt-1">
                <RefreshCw className="w-4 h-4 animate-spin text-[#0878C9]" />
                Đang đọc và phân tích cấu trúc file Word...
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Paste Raw Text */}
        {activeTab === 'paste' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700">
                Dán toàn bộ văn bản câu hỏi từ Word vào đây:
              </label>
              <button
                type="button"
                onClick={handleParseNow}
                className="px-3.5 py-1.5 bg-[#0878C9] hover:bg-[#073B66] text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Phân tích câu hỏi ngay
              </button>
            </div>
            <textarea
              rows={7}
              value={rawText}
              onChange={(e) => {
                setRawText(e.target.value);
                setParseResult(null);
                setEditableQuestions([]);
              }}
              placeholder={`Ví dụ định dạng dán vào:

Câu 1: Hiện thực lịch sử là gì?
A. Tất cả những gì đã diễn ra trong quá khứ...
B. Những câu chuyện truyền thuyết...
C. Toàn bộ nhận thức chủ quan...
D. Những dự đoán của con người...
Đáp án: A

Câu 2: Đọc đoạn tư liệu sau trích trong Tuyên ngôn Độc lập...
a) Tuyên ngôn Độc lập mở đầu bằng việc trích dẫn bản Tuyên ngôn của Mỹ - Đúng
b) Bản Tuyên ngôn được đọc tại Tân Trào - Sai
c) Văn kiện phát triển quyền con người thành quyền dân tộc - Đúng
d) Tuyên bố chấm dứt chế độ phong kiến - Đúng`}
              className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0878C9] font-serif text-xs leading-relaxed"
            />
          </div>
        )}

        {/* ================================================================= */}
        {/* PARSE RESULTS & INTERACTIVE QUESTION EDITOR                       */}
        {/* ================================================================= */}
        {editableQuestions.length > 0 && (
          <div className="space-y-3 pt-3 border-t border-slate-200">
            {/* Action Bar & Stats */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 p-3.5 bg-gradient-to-r from-slate-100 via-sky-50 to-indigo-50 rounded-2xl border border-slate-200">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-black text-[#073B66] text-sm">
                  Đã phân tích được:
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-black text-xs flex items-center gap-1 shadow-2xs">
                  <CheckCircle className="w-3.5 h-3.5" />
                  {editableQuestions.length} câu hỏi
                </span>
                <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold text-[11px]">
                  {editableQuestions.filter((q) => q.type === 'Trắc nghiệm đơn' || q.type === 'Trắc nghiệm').length} câu trắc nghiệm đơn
                </span>
                <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-bold text-[11px]">
                  {editableQuestions.filter((q) => q.type === 'Trắc nghiệm đúng sai').length} câu Đúng/Sai 2025
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAddNewQuestionInWordModal('Trắc nghiệm đơn')}
                  className="px-3.5 py-2 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                  title="Thêm một câu hỏi trắc nghiệm mới vào danh sách"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-600" />
                  Thêm câu hỏi mới
                </button>

                <button
                  type="button"
                  onClick={handleConfirmImport}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-black text-xs flex items-center gap-2 cursor-pointer shadow-md hover:shadow-lg transition-all"
                >
                  <FileCheck className="w-4 h-4" />
                  Lưu & Nhập tất cả {editableQuestions.length} câu vào Ngân hàng đề
                </button>
              </div>
            </div>

            {/* Error alerts if any during raw parsing */}
            {parseResult && parseResult.errors.length > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] space-y-1">
                <div className="font-bold flex items-center gap-1 text-amber-950">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Chú ý từ bộ phân tích (Cô có thể sửa trực tiếp các câu bên dưới):
                </div>
                {parseResult.errors.slice(0, 3).map((err, ei) => (
                  <div key={ei} className="pl-4">• {err}</div>
                ))}
              </div>
            )}

            {/* Guideline for Teacher */}
            <div className="p-2.5 bg-sky-50/80 border border-sky-200 rounded-xl text-sky-900 text-[11px] flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 font-medium">
                <Edit3 className="w-3.5 h-3.5 text-[#0878C9] shrink-0" />
                Cô có thể sửa trực tiếp nội dung câu hỏi, bấm nút chọn đáp án đúng (A/B/C/D hoặc ĐÚNG/SAI) và bấm <strong>"Lưu câu này"</strong> sau mỗi câu.
              </span>
            </div>

            {/* Question Editor List */}
            <div className="max-h-[55vh] overflow-y-auto space-y-3.5 pr-1">
              {editableQuestions.map((q, qi) => {
                const isSingle = q.type === 'Trắc nghiệm đơn' || q.type === 'Trắc nghiệm';
                const isTF = q.type === 'Trắc nghiệm đúng sai';
                const isSaved = !!savedStatusMap[qi];

                return (
                  <div
                    key={qi}
                    className={`p-4 rounded-2xl border-2 transition-all space-y-3 ${
                      isSaved
                        ? 'bg-white border-emerald-300 shadow-2xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                    }`}
                  >
                    {/* Header: Question Number, Type, Cognitive Level & Delete */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-[#073B66] text-white flex items-center justify-center font-black text-xs shadow-2xs">
                          {qi + 1}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] uppercase ${
                            isSingle
                              ? 'bg-blue-100 text-blue-900 border border-blue-200'
                              : 'bg-purple-100 text-purple-900 border border-purple-200'
                          }`}
                        >
                          {q.type}
                        </span>

                        <select
                          value={q.cognitiveLevel || 'Nhận biết'}
                          onChange={(e) =>
                            handleUpdateQuestionField(
                              qi,
                              'cognitiveLevel',
                              e.target.value as any
                            )
                          }
                          className="px-2 py-0.5 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-medium outline-none text-slate-700 cursor-pointer"
                        >
                          <option value="Nhận biết">Mức: Nhận biết</option>
                          <option value="Thông hiểu">Mức: Thông hiểu</option>
                          <option value="Vận dụng">Mức: Vận dụng</option>
                          <option value="Vận dụng cao">Mức: Vận dụng cao</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Current Answer Display */}
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="text-slate-500 font-medium">Đáp án chuẩn:</span>
                          <span className="px-2 py-0.5 rounded-md font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
                            {q.correctAnswer}
                          </span>
                        </div>

                        {/* Delete Question button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(qi)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Xóa câu hỏi này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Content / Question Text Editor */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-700">
                        {isTF ? 'Đoạn trích tư liệu lịch sử / Nội dung câu hỏi:' : 'Nội dung câu hỏi:'}
                      </label>
                      <textarea
                        rows={isTF ? 3 : 2}
                        value={q.content}
                        onChange={(e) =>
                          handleUpdateQuestionField(qi, 'content', e.target.value)
                        }
                        className="w-full p-2.5 bg-slate-50/70 border border-slate-200 rounded-xl font-serif text-xs leading-relaxed focus:bg-white focus:ring-2 focus:ring-[#0878C9] outline-none transition-all"
                        placeholder="Nhập nội dung câu hỏi..."
                      />
                    </div>

                    {/* 1. DẠNG TRẮC NGHIỆM ĐƠN (CHỌN 1 ĐÁP ÁN) */}
                    {isSingle && (
                      <div className="space-y-2.5 pt-1">
                        {/* Quick Selection Buttons for Single Choice */}
                        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-blue-50/60 border border-blue-200 rounded-xl">
                          <span className="font-bold text-[#073B66] text-xs flex items-center gap-1.5">
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                            Bấm chọn đáp án đúng cho câu này:
                          </span>

                          <div className="flex items-center gap-1.5">
                            {(['A', 'B', 'C', 'D'] as const).map((letter) => {
                              const isSelected =
                                q.correctAnswer?.trim().toUpperCase() === letter;
                              return (
                                <button
                                  key={letter}
                                  type="button"
                                  onClick={() => handleSetSingleCorrect(qi, letter)}
                                  className={`w-9 h-8 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center justify-center ${
                                    isSelected
                                      ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-300 scale-105'
                                      : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                                  }`}
                                >
                                  {letter}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Options Inputs A, B, C, D */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {(['A', 'B', 'C', 'D'] as const).map((letter, optIdx) => {
                            const rawOpt = q.options?.[optIdx] || '';
                            const cleanText = rawOpt.replace(/^[A-D]\.\s*/, '');
                            const isThisCorrect =
                              q.correctAnswer?.trim().toUpperCase() === letter;

                            return (
                              <div
                                key={letter}
                                className={`p-2 rounded-xl border flex items-center gap-2 transition-all ${
                                  isThisCorrect
                                    ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-200'
                                    : 'bg-white border-slate-200'
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={() => handleSetSingleCorrect(qi, letter)}
                                  className={`w-6 h-6 rounded-lg font-bold text-xs shrink-0 cursor-pointer transition-colors flex items-center justify-center ${
                                    isThisCorrect
                                      ? 'bg-emerald-600 text-white shadow-xs'
                                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                  }`}
                                  title="Đặt làm đáp án đúng"
                                >
                                  {letter}
                                </button>
                                <input
                                  type="text"
                                  value={cleanText}
                                  onChange={(e) =>
                                    handleUpdateSingleOption(
                                      qi,
                                      optIdx,
                                      letter,
                                      e.target.value
                                    )
                                  }
                                  className="flex-1 bg-transparent border-none outline-none text-xs font-serif text-slate-900"
                                  placeholder={`Nội dung phương án ${letter}...`}
                                />
                                {isThisCorrect && (
                                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded shrink-0">
                                    Đúng ✓
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* 2. DẠNG TRẮC NGHIỆM ĐÚNG SAI (CHUẨN BGD&ĐT 2025) */}
                    {isTF && (
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between text-[11px] font-bold text-purple-900 uppercase">
                          <span>Chỉnh sửa nội dung 4 ý & Bấm nút [ ĐÚNG ] hoặc [ SAI ] cho từng ý:</span>
                        </div>

                        <div className="space-y-2">
                          {q.trueFalseStatements?.map((stmt, stmtIdx) => (
                            <div
                              key={stmt.id}
                              className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:border-slate-300 hover:bg-white transition-all"
                            >
                              <div className="flex items-center gap-2 flex-1">
                                <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-900 font-black text-xs shrink-0 flex items-center justify-center uppercase">
                                  {stmt.id})
                                </span>
                                <input
                                  type="text"
                                  value={stmt.statement}
                                  onChange={(e) =>
                                    handleUpdateTfStatementText(
                                      qi,
                                      stmtIdx,
                                      e.target.value
                                    )
                                  }
                                  className="flex-1 bg-transparent border-none outline-none text-xs font-serif text-slate-900"
                                  placeholder={`Nội dung nhận định ${stmt.id}...`}
                                />
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                                {/* Button ĐÚNG */}
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleToggleTfStatement(qi, stmtIdx, true)
                                  }
                                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                                    stmt.isCorrect === true
                                      ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-300'
                                      : 'bg-slate-100 text-slate-500 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200'
                                  }`}
                                >
                                  ĐÚNG {stmt.isCorrect === true && '✓'}
                                </button>

                                {/* Button SAI */}
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleToggleTfStatement(qi, stmtIdx, false)
                                  }
                                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                                    stmt.isCorrect === false
                                      ? 'bg-rose-600 text-white shadow-xs ring-2 ring-rose-300'
                                      : 'bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-800 border border-slate-200'
                                  }`}
                                >
                                  SAI {stmt.isCorrect === false && '✗'}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Explanation Input (Optional) */}
                    <div>
                      <input
                        type="text"
                        value={q.explanation || ''}
                        onChange={(e) =>
                          handleUpdateQuestionField(qi, 'explanation', e.target.value)
                        }
                        placeholder="Lời giải thích / Chú dẫn SGK Lịch sử (tùy chọn)..."
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs italic font-serif text-slate-700 outline-none focus:bg-white"
                      />
                    </div>

                    {/* Save Footer for THIS Individual Question */}
                    <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {/* Button [ 💾 Lưu câu X ] */}
                        <button
                          type="button"
                          onClick={() => handleSaveQuestion(qi)}
                          className="px-3.5 py-1.5 bg-[#073B66] hover:bg-[#0878C9] text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-95"
                        >
                          <Save className="w-3.5 h-3.5 text-amber-300" />
                          <span>Lưu câu {qi + 1}</span>
                        </button>

                        {/* Confirmation label: ✓ Đã lưu lúc [HH:MM:SS] */}
                        {savedStatusMap[qi] && (
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-3 py-1 rounded-xl flex items-center gap-1 animate-in fade-in">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            ✓ Đã lưu lúc [{savedStatusMap[qi]}]
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2.5">
                        <div className="text-slate-500 text-[11px] flex items-center gap-1.5">
                          <span>Đáp án hiện tại:</span>
                          <strong className="text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {q.correctAnswer}
                          </strong>
                        </div>

                        {/* Button [ 🗑️ Xóa câu này ] */}
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(qi)}
                          className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          title="Xóa câu này khỏi danh sách"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                          <span>Xóa câu này</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Success Banner */}
        {isSuccessImport && (
          <div className="p-3 bg-emerald-600 text-white rounded-xl text-center font-bold text-xs flex items-center justify-center gap-2 animate-in fade-in">
            <CheckCircle className="w-4 h-4" />
            Đã nhập thành công toàn bộ câu hỏi đã chỉnh sửa vào Ngân hàng đề kiểm tra!
          </div>
        )}

        {/* Modal Bottom Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-200">
          <span className="text-xs text-slate-500">
            {editableQuestions.length > 0
              ? `Đang có ${editableQuestions.length} câu hỏi sẵn sàng lưu vào ngân hàng đề.`
              : 'Hãy chọn file Word hoặc dán nội dung câu hỏi để bắt đầu.'}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer transition-colors text-xs"
            >
              Đóng
            </button>

            {editableQuestions.length > 0 && (
              <button
                type="button"
                onClick={handleConfirmImport}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-black flex items-center gap-2 cursor-pointer shadow-md hover:shadow-lg transition-all text-xs"
              >
                <FileCheck className="w-4 h-4" />
                Lưu & Nhập tất cả {editableQuestions.length} câu vào Ngân hàng đề
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
