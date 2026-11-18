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
  const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'manual'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState('');
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [isAiParsing, setIsAiParsing] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [grade, setGrade] = useState<10 | 11 | 12>(12);
  const [topic, setTopic] = useState('Lịch sử Việt Nam');
  const [lesson, setLesson] = useState('Chương trình GDNN - GDTX');
  const [parseResult, setParseResult] = useState<ParsedQuestionResult | null>(null);
  const [editableQuestions, setEditableQuestions] = useState<Omit<Question, 'id' | 'updatedAt'>[]>([]);
  const [savedStatusMap, setSavedStatusMap] = useState<Record<number, string>>({});
  const [syncedToBankMap, setSyncedToBankMap] = useState<Record<number, boolean>>({});
  const [isSuccessImport, setIsSuccessImport] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Manual composer states ("Nhập câu hỏi thủ công")
  const [manualType, setManualType] = useState<'single' | 'tf'>('single');
  const [manualLevel, setManualLevel] = useState<'Nhận biết' | 'Thông hiểu' | 'Vận dụng' | 'Vận dụng cao'>('Thông hiểu');
  const [manualContent, setManualContent] = useState('');
  const [manualOptA, setManualOptA] = useState('');
  const [manualOptB, setManualOptB] = useState('');
  const [manualOptC, setManualOptC] = useState('');
  const [manualOptD, setManualOptD] = useState('');
  const [manualCorrectSingle, setManualCorrectSingle] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [manualTfStatements, setManualTfStatements] = useState<TrueFalseStatement[]>([
    { id: 'a', statement: '', isCorrect: true },
    { id: 'b', statement: '', isCorrect: false },
    { id: 'c', statement: '', isCorrect: true },
    { id: 'd', statement: '', isCorrect: false },
  ]);
  const [manualExplanation, setManualExplanation] = useState('');
  const [manualError, setManualError] = useState<string | null>(null);
  const [manualSuccessBanner, setManualSuccessBanner] = useState<string | null>(null);
  const [saveManualDirectlyToBank, setSaveManualDirectlyToBank] = useState<boolean>(true);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const processFileObject = async (file: File) => {
    setSelectedFile(file);
    setIsLoadingFile(true);
    setUploadError(null);
    setParseResult(null);

    try {
      const text = await extractTextFromFile(file);
      setRawText(text);
      const res = parseQuestionsFromText(text, grade, topic, lesson);
      if (res.questions.length === 0) {
        setUploadError(
          `Đã đọc được file "${file.name}" nhưng bộ tách nhanh chưa nhận diện được mẫu Câu 1: ... A. B. C. D. Cô hãy chọn Phương án 1 (Copy & Dán) hoặc bấm "AI Tự động tách câu hỏi".`
        );
      } else {
        setParseResult(res);
        setEditableQuestions(res.questions);
        setSavedStatusMap({});
        setSyncedToBankMap({});
        showToast(`Đã nhận diện thành công ${res.questions.length} câu hỏi từ file Word!`);
      }
    } catch (err: any) {
      setUploadError(
        err?.message ||
          'Không thể đọc file Word này (thường do file .doc đời cũ). Cô vui lòng dùng Phương án 1: Copy & Dán văn bản trực tiếp hoặc bấm Nhập câu hỏi thủ công.'
      );
    } finally {
      setIsLoadingFile(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    await processFileObject(file);
  };

  const handleParseNow = () => {
    setUploadError(null);
    if (!rawText.trim()) {
      setUploadError('Ô văn bản đang trống. Cô hãy dán câu hỏi hoặc bấm "Dán đề mẫu chuẩn".');
      return;
    }
    const res = parseQuestionsFromText(rawText, grade, topic, lesson);
    if (res.questions.length === 0) {
      setUploadError(
        'Bộ tách nhanh chưa nhận diện được mẫu Câu 1: ... A. B. C. D. Cô có thể bấm nút "AI Tự động tách câu hỏi" ngay bên cạnh hoặc dùng tab "Nhập câu hỏi thủ công".'
      );
      return;
    }
    setParseResult(res);
    setEditableQuestions(res.questions);
    setSavedStatusMap({});
    setSyncedToBankMap({});
    showToast(`Đã phân tích thành công ${res.questions.length} câu hỏi!`);
  };

  const handleAiParseText = async () => {
    if (!rawText.trim()) {
      setUploadError('Cô vui lòng dán nội dung câu hỏi vào ô văn bản trước khi dùng AI tách.');
      return;
    }
    setIsAiParsing(true);
    setUploadError(null);
    try {
      const resp = await fetch('/api/gemini/parse-exam-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText, examTitle: `${topic} - ${lesson}` }),
      });
      const json = await resp.json();
      if (!resp.ok || !json.success || !json.data) {
        throw new Error(json.message || 'AI chưa tách được câu hỏi từ văn bản này.');
      }
      const p1: Omit<Question, 'id' | 'updatedAt'>[] = (json.data.part1 || []).map((q: any) => ({
        grade,
        topic,
        lesson,
        knowledgeDomain: 'Kiến thức cốt lõi',
        type: 'Trắc nghiệm đơn' as QuestionType,
        cognitiveLevel: q.cognitiveLevel || 'Thông hiểu',
        content: q.content || '',
        options: Array.isArray(q.options) ? q.options : ['A. ', 'B. ', 'C. ', 'D. '],
        correctAnswer: (q.correctAnswer || 'A').toString().trim().charAt(0).toUpperCase(),
        explanation: q.explanation || 'AI hỗ trợ tách từ tài liệu giáo viên.',
        source: 'Cô Cao Thị Thu biên soạn',
        author: 'Cao Thị Thu',
      }));
      const p2: Omit<Question, 'id' | 'updatedAt'>[] = (json.data.part2 || []).map((q: any) => {
        const stmts: TrueFalseStatement[] = (q.trueFalseStatements || []).map((s: any, idx: number) => ({
          id: (s.id || ['a', 'b', 'c', 'd'][idx] || 'a') as 'a' | 'b' | 'c' | 'd',
          statement: s.statement || '',
          isCorrect: Boolean(s.isCorrect),
        }));
        return {
          grade,
          topic,
          lesson,
          knowledgeDomain: 'Đọc hiểu và đánh giá sử liệu',
          type: 'Trắc nghiệm đúng sai' as QuestionType,
          cognitiveLevel: 'Thông hiểu',
          content: q.content || '',
          trueFalseStatements: stmts,
          correctAnswer: stmts.map((s) => `${s.id}-${s.isCorrect ? 'ĐÚNG' : 'SAI'}`).join(', '),
          explanation: 'AI hỗ trợ tách từ tài liệu giáo viên.',
          source: 'Cô Cao Thị Thu biên soạn',
          author: 'Cao Thị Thu',
        };
      });
      const combined = [...p1, ...p2];
      if (combined.length === 0) {
        throw new Error('AI không tìm thấy câu hỏi rõ ràng trong văn bản.');
      }
      setEditableQuestions(combined);
      setSavedStatusMap({});
      setSyncedToBankMap({});
      showToast(`AI đã tự động tách thành công ${combined.length} câu hỏi!`);
    } catch (err: any) {
      setUploadError(err?.message || 'Không thể dùng AI tách câu hỏi lúc này.');
    } finally {
      setIsAiParsing(false);
    }
  };

  const handlePasteSampleText = () => {
    setRawText(`Câu 1: Tổ chức Liên hợp quốc chính thức được thành lập vào năm nào?
A. Năm 1945.
B. Năm 1947.
C. Năm 1949.
D. Năm 1954.
Đáp án: A

Câu 2: Đọc đoạn tư liệu sau đây về Chiến dịch Điện Biên Phủ (1954):
"Với phương châm 'đánh chắc, tiến chắc', quân và dân ta đã chiến đấu suốt 56 ngày đêm, đập tan tập đoàn cứ điểm mạnh nhất Đông Dương của thực dân Pháp ngày 7/5/1954."
a) Chiến dịch Điện Biên Phủ diễn ra trong vòng 56 ngày đêm năm 1954. - Đúng
b) Đại tướng Võ Nguyên Giáp giữ nguyên phương châm "đánh nhanh, thắng nhanh". - Sai
c) Thắng lợi Điện Biên Phủ buộc Pháp ký Hiệp định Giơ-ne-vơ 1954. - Đúng
d) Chiến thắng Điện Biên Phủ kết thúc hoàn toàn sự can thiệp của Mỹ ở Việt Nam. - Sai`);
    setUploadError(null);
    showToast('Đã dán đề mẫu chuẩn! Cô bấm "Phân tích câu hỏi ngay" để xem kết quả.');
  };

  const handleSaveManualQuestion = () => {
    setManualError(null);
    setManualSuccessBanner(null);

    if (!manualContent.trim()) {
      setManualError('Cô vui lòng nhập nội dung câu hỏi trước khi bấm Lưu câu hỏi.');
      return;
    }

    let newQ: Omit<Question, 'id' | 'updatedAt'>;
    if (manualType === 'single') {
      if (!manualOptA.trim() || !manualOptB.trim() || !manualOptC.trim() || !manualOptD.trim()) {
        setManualError('Cô vui lòng nhập đầy đủ cả 4 phương án A, B, C, D trước khi lưu.');
        return;
      }
      const cleanOpt = (letter: string, val: string) =>
        `${letter}. ${val.trim().replace(/^[A-D][.)]\s*/i, '')}`;
      newQ = {
        grade,
        topic: topic.trim() || 'Lịch sử Việt Nam',
        lesson: lesson.trim() || 'Chương trình GDNN - GDTX',
        knowledgeDomain: 'Kiến thức cốt lõi',
        type: 'Trắc nghiệm đơn',
        cognitiveLevel: manualLevel,
        content: manualContent.trim(),
        options: [
          cleanOpt('A', manualOptA),
          cleanOpt('B', manualOptB),
          cleanOpt('C', manualOptC),
          cleanOpt('D', manualOptD),
        ],
        correctAnswer: manualCorrectSingle,
        explanation: manualExplanation.trim() || 'Căn cứ vào SGK Lịch sử GDPT 2018.',
        source: 'Cô Cao Thị Thu biên soạn thủ công',
        author: 'Cao Thị Thu',
      };
    } else {
      const filledCount = manualTfStatements.filter((s) => s.statement.trim().length > 0).length;
      if (filledCount < 4) {
        setManualError('Câu Đúng/Sai cần nhập đủ 4 nhận định a), b), c), d) và chọn Đúng/Sai.');
        return;
      }
      const formattedStmts = manualTfStatements.map((s) => ({
        ...s,
        statement: s.statement.trim(),
      }));
      newQ = {
        grade,
        topic: topic.trim() || 'Lịch sử Việt Nam',
        lesson: lesson.trim() || 'Chương trình GDNN - GDTX',
        knowledgeDomain: 'Đọc hiểu và đánh giá sử liệu',
        type: 'Trắc nghiệm đúng sai',
        cognitiveLevel: manualLevel,
        content: manualContent.trim(),
        trueFalseStatements: formattedStmts,
        correctAnswer: formattedStmts
          .map((s) => `${s.id}-${s.isCorrect ? 'ĐÚNG' : 'SAI'}`)
          .join(', '),
        explanation: manualExplanation.trim() || 'Căn cứ vào tư liệu lịch sử trích dẫn.',
        source: 'Cô Cao Thị Thu biên soạn thủ công',
        author: 'Cao Thị Thu',
      };
    }

    const nextIdx = editableQuestions.length;
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    setEditableQuestions((prev) => [...prev, newQ]);
    setSavedStatusMap((prev) => ({ ...prev, [nextIdx]: timeStr }));

    if (saveManualDirectlyToBank) {
      onImportQuestions([newQ]);
      setSyncedToBankMap((prev) => ({ ...prev, [nextIdx]: true }));
    }

    const msg = `Đã lưu Câu ${nextIdx + 1} (Đáp án: ${newQ.correctAnswer})${
      saveManualDirectlyToBank ? ' vào Ngân hàng câu hỏi' : ' vào danh sách chờ'
    }!`;
    setManualSuccessBanner(msg);
    showToast(msg);

    // Reset form for next manual question
    setManualContent('');
    setManualOptA('');
    setManualOptB('');
    setManualOptC('');
    setManualOptD('');
    setManualCorrectSingle('A');
    setManualTfStatements([
      { id: 'a', statement: '', isCorrect: true },
      { id: 'b', statement: '', isCorrect: false },
      { id: 'c', statement: '', isCorrect: true },
      { id: 'd', statement: '', isCorrect: false },
    ]);
    setManualExplanation('');
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

  // Confirm import all unsynced edited questions
  const handleConfirmImport = () => {
    if (editableQuestions.length === 0) return;
    const unsynced = editableQuestions.filter((_, idx) => !syncedToBankMap[idx]);
    if (unsynced.length > 0) {
      onImportQuestions(unsynced);
    }
    setIsSuccessImport(true);
    setTimeout(() => {
      setIsSuccessImport(false);
      onClose();
      // Reset
      setSelectedFile(null);
      setRawText('');
      setUploadError(null);
      setParseResult(null);
      setEditableQuestions([]);
      setSavedStatusMap({});
      setSyncedToBankMap({});
    }, 1100);
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

        {/* Method Switch: File Upload vs Phương án 1 (Copy-Paste) vs Nhập câu hỏi thủ công */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2.5">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'upload'
                ? 'bg-[#073B66] text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Tải file Word (.docx, .doc)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('paste')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'paste'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-indigo-50 text-indigo-800 border border-indigo-200 hover:bg-indigo-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Phương án 1: Copy & Dán văn bản (Khi Word lỗi)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`px-4 py-2 rounded-xl font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'manual'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-teal-50 text-teal-800 border border-teal-300 hover:bg-teal-100'
            }`}
          >
            <Plus className="w-4 h-4" />
            Nhập câu hỏi thủ công
          </button>
        </div>

        {/* Inline Error Card with Instant Fallback Buttons */}
        {uploadError && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 space-y-2.5">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs whitespace-pre-line leading-relaxed font-medium">
                {uploadError}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 pl-6">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('paste');
                  setUploadError(null);
                }}
                className="px-3 py-1.5 bg-white hover:bg-rose-100 text-rose-900 border border-rose-300 rounded-lg font-bold text-[11px] flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                Dùng Phương án 1: Copy & Dán văn bản
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('manual');
                  setUploadError(null);
                }}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Mở form Nhập câu hỏi thủ công
              </button>
            </div>
          </div>
        )}

        {/* Tab 1: Upload File (with Drag & Drop) */}
        {activeTab === 'upload' && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingFile(true);
            }}
            onDragLeave={() => setIsDraggingFile(false)}
            onDrop={async (e) => {
              e.preventDefault();
              setIsDraggingFile(false);
              const dropped = e.dataTransfer.files?.[0];
              if (dropped) await processFileObject(dropped);
            }}
            className={`p-6 border-2 border-dashed rounded-2xl text-center space-y-3 transition-colors ${
              isDraggingFile
                ? 'border-[#0878C9] bg-sky-100/50'
                : 'border-sky-300 bg-sky-50/30'
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-sky-100 text-[#0878C9] flex items-center justify-center mx-auto shadow-2xs">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm">
                Kéo thả hoặc chọn file Word chứa danh sách câu hỏi từ máy tính
              </p>
              <p className="text-slate-500 text-xs mt-0.5">
                Hỗ trợ định dạng: <strong className="text-slate-700">.docx, .doc (HTML), .txt, .rtf</strong>. Nếu file .doc cũ không đọc được, hãy chuyển ngay sang <strong>Phương án 1: Copy & Dán</strong> hoặc <strong>Nhập câu hỏi thủ công</strong>.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0878C9] hover:bg-[#073B66] text-white rounded-xl font-bold cursor-pointer shadow-xs transition-colors">
                <Upload className="w-4 h-4" />
                <span>{selectedFile ? `Đã chọn: ${selectedFile.name}` : 'Chọn file từ máy tính'}</span>
                <input
                  type="file"
                  accept=".docx,.doc,.txt,.rtf,.html,.htm"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={() => setActiveTab('paste')}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white hover:bg-indigo-50 text-indigo-800 border border-indigo-200 rounded-xl font-bold cursor-pointer transition-colors"
              >
                <FileText className="w-4 h-4" />
                Phương án 1: Copy & Dán
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('manual')}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold cursor-pointer shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                Nhập câu hỏi thủ công
              </button>
            </div>

            {isLoadingFile && (
              <div className="flex items-center justify-center gap-2 text-slate-600 text-xs pt-1">
                <RefreshCw className="w-4 h-4 animate-spin text-[#0878C9]" />
                Đang đọc và phân tích cấu trúc file Word...
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Phương án 1 — Copy & Dán Raw Text + AI Fallback */}
        {activeTab === 'paste' && (
          <div className="p-4 bg-white border border-indigo-200 rounded-2xl space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <label className="font-bold text-indigo-950 text-sm block">
                  Phương án 1 (Khi không tải được Word): Copy toàn bộ từ Word/PDF/Zalo và dán vào đây
                </label>
                <p className="text-[11px] text-slate-500">
                  Mở file trên máy → nhấn Ctrl+A → Ctrl+C → dán xuống bên dưới. Hỗ trợ cả bảng đáp án ở cuối đề.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handlePasteSampleText}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer transition-colors"
                >
                  + Dán đề mẫu chuẩn
                </button>
                <button
                  type="button"
                  onClick={handleAiParseText}
                  disabled={isAiParsing}
                  className="px-3.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-300 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-60"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  {isAiParsing ? 'AI đang tách...' : 'AI Tự động tách câu hỏi'}
                </button>
                <button
                  type="button"
                  onClick={handleParseNow}
                  className="px-3.5 py-1.5 bg-[#0878C9] hover:bg-[#073B66] text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Phân tích câu hỏi ngay
                </button>
              </div>
            </div>
            <textarea
              rows={8}
              value={rawText}
              onChange={(e) => {
                setRawText(e.target.value);
                setUploadError(null);
              }}
              placeholder={`Ví dụ định dạng dán vào:\n\nCâu 1: Hiện thực lịch sử là gì?\nA. Tất cả những gì đã diễn ra trong quá khứ...\nB. Những câu chuyện truyền thuyết...\nC. Toàn bộ nhận thức chủ quan...\nD. Những dự đoán của con người...\nĐáp án: A`}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 font-serif text-xs leading-relaxed"
            />
          </div>
        )}

        {/* Tab 3: Nhập câu hỏi thủ công + Khu vực Chọn đáp án + Nút Lưu câu hỏi */}
        {activeTab === 'manual' && (
          <div className="p-4 bg-white border border-teal-200 rounded-2xl space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-200">
              <div>
                <h4 className="font-bold text-teal-950 text-sm flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-teal-700" />
                  Nhập câu hỏi thủ công (Không cần file Word)
                </h4>
                <p className="text-[11px] text-slate-500">
                  Nhập câu hỏi, chọn đáp án đúng ở khu vực Chọn đáp án bên dưới, rồi bấm nút <strong>Lưu câu hỏi</strong>.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setManualType('single');
                    setManualError(null);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer transition-all ${
                    manualType === 'single'
                      ? 'bg-[#073B66] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Trắc nghiệm 1 đáp án (A/B/C/D)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setManualType('tf');
                    setManualError(null);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer transition-all ${
                    manualType === 'tf'
                      ? 'bg-purple-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Trắc nghiệm Đúng/Sai 2025
                </button>
              </div>
            </div>

            {manualError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{manualError}</span>
              </div>
            )}

            {manualSuccessBanner && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{manualSuccessBanner}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {manualType === 'single'
                    ? 'Nội dung câu hỏi (*):'
                    : 'Đoạn trích tư liệu / Lời dẫn câu hỏi (*):'}
                </label>
                <textarea
                  rows={3}
                  value={manualContent}
                  onChange={(e) => setManualContent(e.target.value)}
                  placeholder={
                    manualType === 'single'
                      ? 'Nhập nội dung câu hỏi trắc nghiệm...'
                      : 'Nhập đoạn trích tư liệu lịch sử hoặc bối cảnh...'
                  }
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-serif text-xs leading-relaxed outline-none focus:bg-white focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mức độ nhận thức:
                </label>
                <select
                  value={manualLevel}
                  onChange={(e) => setManualLevel(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Nhận biết">Nhận biết</option>
                  <option value="Thông hiểu">Thông hiểu</option>
                  <option value="Vận dụng">Vận dụng</option>
                  <option value="Vận dụng cao">Vận dụng cao</option>
                </select>
              </div>
            </div>

            {manualType === 'single' ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(
                    [
                      { key: 'A', val: manualOptA, setter: setManualOptA },
                      { key: 'B', val: manualOptB, setter: setManualOptB },
                      { key: 'C', val: manualOptC, setter: setManualOptC },
                      { key: 'D', val: manualOptD, setter: setManualOptD },
                    ] as const
                  ).map((opt) => {
                    const isRight = manualCorrectSingle === opt.key;
                    return (
                      <div
                        key={opt.key}
                        className={`p-2 rounded-xl border flex items-center gap-2 transition-all ${
                          isRight
                            ? 'bg-emerald-50 border-emerald-400'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setManualCorrectSingle(opt.key)}
                          className={`w-8 h-8 rounded-lg font-black text-xs shrink-0 cursor-pointer transition-colors ${
                            isRight
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                          }`}
                          title={`Chọn ${opt.key} làm đáp án đúng`}
                        >
                          {opt.key}
                        </button>
                        <input
                          type="text"
                          value={opt.val}
                          onChange={(e) => opt.setter(e.target.value)}
                          placeholder={`Nhập phương án ${opt.key}...`}
                          className="flex-1 bg-transparent border-none outline-none text-xs font-serif text-slate-900"
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Khu vực Chọn đáp án nổi bật */}
                <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold text-emerald-950 text-xs flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4 text-emerald-700" />
                    Chọn đáp án đúng cho câu hỏi này (*):
                  </span>
                  <div className="flex items-center gap-1.5">
                    {(['A', 'B', 'C', 'D'] as const).map((letter) => (
                      <button
                        key={letter}
                        type="button"
                        onClick={() => setManualCorrectSingle(letter)}
                        className={`px-3.5 py-2 rounded-xl font-black text-xs cursor-pointer transition-all ${
                          manualCorrectSingle === letter
                            ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-300'
                            : 'bg-white text-slate-700 border border-slate-300 hover:bg-emerald-100'
                        }`}
                      >
                        Đáp án {letter}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="p-2.5 bg-purple-50 border border-purple-200 rounded-xl flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold text-purple-950 text-xs flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4 text-purple-700" />
                    Chọn đáp án Đúng / Sai cho từng ý nhận định a, b, c, d (*):
                  </span>
                  <span className="text-[11px] font-bold text-purple-800">
                    Đang chọn:{' '}
                    {manualTfStatements
                      .map((s) => `${s.id}-${s.isCorrect ? 'Đúng' : 'Sai'}`)
                      .join(', ')}
                  </span>
                </div>

                <div className="space-y-2">
                  {manualTfStatements.map((stmt, idx) => (
                    <div
                      key={stmt.id}
                      className="p-2 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center gap-2"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <span className="w-7 h-7 rounded-lg bg-purple-100 text-purple-900 font-black text-xs shrink-0 flex items-center justify-center uppercase">
                          {stmt.id})
                        </span>
                        <input
                          type="text"
                          value={stmt.statement}
                          onChange={(e) => {
                            const val = e.target.value;
                            setManualTfStatements((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, statement: val } : item))
                            );
                          }}
                          placeholder={`Nhập nhận định ý ${stmt.id}...`}
                          className="flex-1 bg-transparent border-none outline-none text-xs font-serif text-slate-900"
                        />
                      </div>
                      <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() =>
                            setManualTfStatements((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, isCorrect: true } : item))
                            )
                          }
                          className={`px-3 py-1.5 rounded-lg text-xs font-black cursor-pointer ${
                            stmt.isCorrect
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white border border-slate-300 text-slate-600 hover:bg-emerald-50'
                          }`}
                        >
                          ĐÚNG
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setManualTfStatements((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, isCorrect: false } : item))
                            )
                          }
                          className={`px-3 py-1.5 rounded-lg text-xs font-black cursor-pointer ${
                            !stmt.isCorrect
                              ? 'bg-rose-600 text-white'
                              : 'bg-white border border-slate-300 text-slate-600 hover:bg-rose-50'
                          }`}
                        >
                          SAI
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <input
                type="text"
                value={manualExplanation}
                onChange={(e) => setManualExplanation(e.target.value)}
                placeholder="Giải thích đáp án / Chú dẫn SGK (tùy chọn)..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-serif text-slate-700 outline-none focus:bg-white"
              />
            </div>

            {/* Footer với checkbox & nút [ Lưu câu hỏi ] */}
            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={saveManualDirectlyToBank}
                  onChange={(e) => setSaveManualDirectlyToBank(e.target.checked)}
                  className="w-4 h-4 accent-teal-600 rounded cursor-pointer"
                />
                <span>Lưu thẳng vào Ngân hàng câu hỏi ngay khi bấm Lưu</span>
              </label>

              <button
                type="button"
                onClick={handleSaveManualQuestion}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <Save className="w-4 h-4" />
                Lưu câu hỏi
              </button>
            </div>
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
                  onClick={() => setActiveTab('manual')}
                  className="px-3.5 py-2 bg-white hover:bg-teal-50 text-teal-800 border border-teal-300 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                  title="Mở form Nhập câu hỏi thủ công"
                >
                  <Plus className="w-3.5 h-3.5 text-teal-600" />
                  Nhập câu hỏi thủ công
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
                            Chọn đáp án đúng (*):
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
                        {/* Button [ 💾 Lưu câu hỏi ] */}
                        <button
                          type="button"
                          onClick={() => handleSaveQuestion(qi)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-95"
                        >
                          <Save className="w-3.5 h-3.5 text-white" />
                          <span>Lưu câu hỏi</span>
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
