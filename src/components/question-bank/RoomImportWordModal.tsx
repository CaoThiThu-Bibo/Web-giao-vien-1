// ============================================================================
// MODAL: NHẬP CÂU HỎI THEO KHỐI LỚP (10, 11, 12) TỪ WORD HOẶC COPY DÁN
// Dành cho Cô Cao Thị Thu - Trung tâm GDNN - GDTX Tiên Yên
// ============================================================================

import React, { useState } from 'react';
import { Question, QuestionType, TrueFalseStatement } from '../../types';
import {
  downloadWordTemplate,
  extractTextFromFile,
  parseQuestionsFromText,
  ParsedQuestionResult,
} from '../../lib/wordQuestionParser';
import { ExamRoomKey } from './ExamRoomHubModal';
import {
  FileText,
  Download,
  Upload,
  CheckCircle,
  CheckSquare,
  AlertCircle,
  FileCheck,
  Sparkles,
  Save,
  Trash2,
  CheckCircle2,
  Edit3,
  Layers,
  Check,
  Plus,
  X,
  BookOpen,
  ArrowRight,
  ClipboardPaste,
  GraduationCap,
} from 'lucide-react';
import {
  getTopicsForGrade,
  getLessonsForTopic,
} from '../../data/historyCurriculum';

interface RoomImportWordModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomMode: ExamRoomKey;
  roomTitle: string;
  defaultGrade?: 10 | 11 | 12;
  onImportQuestions: (questions: Question[]) => void;
}

export const RoomImportWordModal: React.FC<RoomImportWordModalProps> = ({
  isOpen,
  onClose,
  roomMode,
  roomTitle,
  defaultGrade = 12,
  onImportQuestions,
}) => {
  const [activeInputMethod, setActiveInputMethod] = useState<'word' | 'paste'>('word');
  const [selectedGrade, setSelectedGrade] = useState<10 | 11 | 12>(defaultGrade);
  const [topic, setTopic] = useState<string>(() => getTopicsForGrade(defaultGrade)[0] || 'Chủ đề 1');
  const [lesson, setLesson] = useState<string>(() => getLessonsForTopic(defaultGrade, getTopicsForGrade(defaultGrade)[0])[0] || 'Bài 1');

  // Handle grade change and sync topic/lesson
  const handleGradeChange = (newGrade: 10 | 11 | 12) => {
    setSelectedGrade(newGrade);
    const newTopic = getTopicsForGrade(newGrade)[0] || '';
    setTopic(newTopic);
    const newLesson = getLessonsForTopic(newGrade, newTopic)[0] || '';
    setLesson(newLesson);
    setParsedQuestions((prev) =>
      prev.map((q) => ({
        ...q,
        grade: newGrade,
        topic: newTopic,
        lesson: newLesson,
      }))
    );
  };

  // Handle topic change and sync lessons
  const handleTopicChange = (newTopic: string) => {
    setTopic(newTopic);
    const newLesson = getLessonsForTopic(selectedGrade, newTopic)[0] || '';
    setLesson(newLesson);
    setParsedQuestions((prev) =>
      prev.map((q) => ({
        ...q,
        topic: newTopic,
        lesson: newLesson,
      }))
    );
  };

  // Handle lesson change
  const handleLessonChange = (newLesson: string) => {
    setLesson(newLesson);
    setParsedQuestions((prev) =>
      prev.map((q) => ({
        ...q,
        lesson: newLesson,
      }))
    );
  };

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoadingFile, setIsLoadingFile] = useState<boolean>(false);
  const [fileReadError, setFileReadError] = useState<string | null>(null);

  // Paste Text State
  const [pastedText, setPastedText] = useState<string>('');

  // Parsed Questions List for Teacher Review & Editing
  const [parsedQuestions, setParsedQuestions] = useState<Question[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [savedStatusMap, setSavedStatusMap] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  if (!isOpen) return null;

  // Handle file select
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setSelectedFile(file);
    setIsLoadingFile(true);
    setFileReadError(null);
    setParseErrors([]);

    try {
      const text = await extractTextFromFile(file);
      setPastedText(text);

      // Parse questions
      const res = parseQuestionsFromText(text, selectedGrade, topic, lesson, 'Cao Thị Thu', roomMode);
      const converted: Question[] = res.questions.map((q, idx) => ({
        ...q,
        id: `q_import_${Date.now()}_${idx}`,
        grade: selectedGrade,
        updatedAt: new Date().toISOString().split('T')[0],
      }));

      setParsedQuestions(converted);
      setParseErrors(res.errors);
      setSavedStatusMap({});
      if (converted.length > 0) {
        showToast(`Đã nhận diện thành công ${converted.length} câu hỏi cho Khối ${selectedGrade} từ file Word!`);
      } else {
        setFileReadError('Đã đọc file nhưng chưa tách được câu hỏi đúng mẫu. Cô chuyển sang tab "Copy & Dán văn bản" để chỉnh nhanh hoặc bấm "Nhập câu hỏi thủ công".');
      }
    } catch (err: any) {
      setFileReadError(err.message || 'Không thể đọc file Word này.');
    } finally {
      setIsLoadingFile(false);
    }
  };

  // Handle parsing pasted text
  const handleParsePastedText = () => {
    if (!pastedText.trim()) {
      alert('Cô vui lòng dán nội dung văn bản đề thi vào ô trước khi phân tích!');
      return;
    }

    const res = parseQuestionsFromText(pastedText, selectedGrade, topic, lesson, 'Cao Thị Thu', roomMode);
    const converted: Question[] = res.questions.map((q, idx) => ({
      ...q,
      id: `q_import_${Date.now()}_${idx}`,
      grade: selectedGrade,
      updatedAt: new Date().toISOString().split('T')[0],
    }));

    setParsedQuestions(converted);
    setParseErrors(res.errors);
    setSavedStatusMap({});
    showToast(`Đã phân tích thành công ${converted.length} câu hỏi cho Khối ${selectedGrade}!`);
  };

  // Sample text paste helper
  const handlePasteSampleText = () => {
    if (roomMode === 'Tự luận') {
      const essaySample = `Câu 1: Phân tích mục tiêu và nguyên tắc hoạt động cốt lõi của tổ chức Liên hợp quốc được ghi trong Hiến chương năm 1945. Theo em, nguyên tắc nào có ý nghĩa quan trọng nhất đối với việc bảo vệ chủ quyền biển đảo Việt Nam hiện nay?
Dàn ý:
1. Nêu đúng 4 mục tiêu cơ bản của Liên hợp quốc (3.0 điểm)
2. Phân tích 5 nguyên tắc hoạt động trong Hiến chương (4.0 điểm)
3. Chọn nguyên tắc giải quyết tranh chấp bằng biện pháp hòa bình và liên hệ bảo vệ chủ quyền biển đảo Việt Nam (3.0 điểm)
Giải thích: Nhấn mạnh Hiến chương năm 1945 và Công ước Luật Biển UNCLOS 1982.

Câu 2: Trình bày đóng góp tiêu biểu của quân và dân vùng mỏ Quảng Ninh trong sự nghiệp kháng chiến chống thực dân Pháp và đế quốc Mỹ?
Dàn ý:
1. Truyền thống đấu tranh của công nhân Vùng mỏ và chiến thắng Đường 18 (4.0 điểm)
2. Chiến thắng trận đầu ngày 2 và 5/8/1964 đánh bại không quân Mỹ tại Hạ Long (4.0 điểm)
3. Ý nghĩa của truyền thống "Kỷ luật và Đồng tâm" đối với học sinh Quảng Ninh hôm nay (2.0 điểm)`;
      setPastedText(essaySample);
      showToast('Đã dán văn bản mẫu đề Tự luận kèm Dàn ý & Biểu điểm Rubric!');
      return;
    }

    const sample = `Câu 1: Chiến dịch nào trong kháng chiến chống thực dân Pháp (1945 - 1954) đã làm phá sản hoàn toàn kế hoạch quân sự Nava?
A. Chiến dịch Việt Bắc thu - đông 1947.
B. Chiến dịch Biên giới thu - đông 1950.
C. Chiến dịch Tây Bắc thu - đông 1952.
D. Chiến dịch Điện Biên Phủ năm 1954.
Đáp án: D
Giải thích: Thắng lợi Điện Biên Phủ giáng đòn quyết định đập tan ý chí xâm lược của thực dân Pháp.

Câu 2: Cơ quan nào giữ vai trò trọng yếu trong việc duy trì hòa bình và an ninh thế giới của tổ chức Liên hợp quốc?
A. Đại hội đồng.
B. Hội đồng Bảo an.
C. Ban Thư ký.
D. Tòa án Công lý Quốc tế.
Đáp án: B
Giải thích: Hội đồng Bảo an gồm 5 ủy viên thường trực chịu trách nhiệm chính về hòa bình và an ninh quốc tế.

Câu 3: Đọc đoạn tư liệu sau đây về Hiệp định Paris 1973:
"Hiệp định Paris buộc quân đội Mỹ và các nước đồng minh phải rút hết khỏi miền Nam Việt Nam trong thời hạn 60 ngày, phá hủy các căn cứ quân sự và cam kết tôn trọng độc lập, chủ quyền, thống nhất và toàn vẹn lãnh thổ của nước Việt Nam."
a) Hiệp định Paris được ký kết chính thức vào ngày 27-01-1973 tại Paris (Pháp). - Đúng
b) Hiệp định quy định Mỹ được giữ lại các căn cứ quân sự chiến lược ở miền Nam. - Sai
c) Thắng lợi của Hiệp định Paris đã tạo thời cơ thuận lợi để quân dân ta tiến lên giải phóng hoàn toàn miền Nam. - Đúng
d) Người phụ nữ duy nhất ký vào bản Hiệp định Paris 1973 là bà Nguyễn Thị Bình. - Đúng
Đáp án: a-Đ, b-S, c-Đ, d-Đ`;

    setPastedText(sample);
    showToast('Đã dán văn bản mẫu gồm trắc nghiệm đơn và đúng/sai!');
  };

  // Quick edit handlers for questions
  const handleSetSingleChoiceAnswer = (qId: string, letter: 'A' | 'B' | 'C' | 'D') => {
    setParsedQuestions((prev) =>
      prev.map((q) => (q.id === qId ? { ...q, correctAnswer: letter } : q))
    );
  };

  const handleToggleTfStatement = (qId: string, stmtIdx: number, isCorrect: boolean) => {
    setParsedQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== qId || !q.trueFalseStatements) return q;
        const newStmts = q.trueFalseStatements.map((stmt, idx) =>
          idx === stmtIdx ? { ...stmt, isCorrect } : stmt
        );
        const ansString = newStmts
          .map((s) => `${s.id}-${s.isCorrect ? 'ĐÚNG' : 'SAI'}`)
          .join(', ');
        return {
          ...q,
          trueFalseStatements: newStmts,
          correctAnswer: ansString,
        };
      })
    );
  };

  const handleUpdateContent = (qId: string, content: string) => {
    setParsedQuestions((prev) =>
      prev.map((q) => (q.id === qId ? { ...q, content } : q))
    );
  };

  const handleUpdateOption = (qId: string, optIdx: number, letter: string, text: string) => {
    setParsedQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== qId) return q;
        const opts = [...(q.options || ['A. ', 'B. ', 'C. ', 'D. '])];
        opts[optIdx] = `${letter}. ${text}`;
        return { ...q, options: opts };
      })
    );
  };

  const handleSaveIndividual = (qId: string, idx: number) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setSavedStatusMap((prev) => ({ ...prev, [qId]: timeStr }));
    showToast(`Đã lưu nội dung & đáp án Câu ${idx + 1}!`);
  };

  const handleDeleteIndividual = (qId: string) => {
    setParsedQuestions((prev) => prev.filter((q) => q.id !== qId));
    showToast('Đã xóa câu khỏi danh sách.');
  };

  // Add 1 blank manual question tailored to roomMode
  const handleAddManualSingleQuestion = () => {
    const today = new Date().toISOString().split('T')[0];
    const newQ: Question =
      roomMode === 'Tự luận'
        ? {
            id: `q_manual_${Date.now()}`,
            grade: selectedGrade,
            topic: topic || 'Kiến thức cốt lõi',
            lesson: lesson || 'Ôn tập GDTX',
            knowledgeDomain: 'Tự luận phân tích & vận dụng',
            type: 'Tự luận',
            cognitiveLevel: 'Vận dụng',
            content: `Câu hỏi tự luận mới cho Khối ${selectedGrade}: Nhập đề bài phân tích / đánh giá tại đây...`,
            essayOutline:
              'DÀN Ý GỢI Ý TRẢ LỜI:\n1. Hoàn cảnh & vấn đề trọng tâm (3.0 điểm)\n2. Phân tích nội dung & ý nghĩa lịch sử (4.0 điểm)\n3. Bài học kinh nghiệm & liên hệ thực tế (3.0 điểm)',
            rubricPoints: [
              { criteria: 'Ý 1: Nêu đúng hoàn cảnh & bối cảnh lịch sử', points: 3.0 },
              { criteria: 'Ý 2: Phân tích nội dung trọng tâm & ý nghĩa', points: 4.0 },
              { criteria: 'Ý 3: Rút ra bài học kinh nghiệm & liên hệ', points: 3.0 },
            ],
            correctAnswer: 'Trình bày đủ 3 ý theo dàn ý và biểu điểm Rubric.',
            explanation: 'Căn cứ vào SGK Lịch sử GDPT 2018.',
            source: 'Cô Cao Thị Thu biên soạn',
            author: 'Cao Thị Thu',
            updatedAt: today,
          }
        : {
            id: `q_manual_${Date.now()}`,
            grade: selectedGrade,
            topic: topic || 'Kiến thức cốt lõi',
            lesson: lesson || 'Ôn tập GDTX',
            knowledgeDomain: 'Kiến thức trọng tâm',
            type: roomMode === 'Trắc nghiệm đúng sai' ? 'Trắc nghiệm đúng sai' : 'Trắc nghiệm đơn',
            cognitiveLevel: 'Nhận biết',
            content: `Câu hỏi mới cho Khối ${selectedGrade}: Nhập nội dung câu hỏi tại đây...`,
            options: [
              'A. Phương án A',
              'B. Phương án B',
              'C. Phương án C',
              'D. Phương án D',
            ],
            correctAnswer: 'A',
            explanation: 'Căn cứ vào SGK Lịch sử GDPT 2018.',
            source: 'Cô Cao Thị Thu biên soạn',
            author: 'Cao Thị Thu',
            updatedAt: today,
          };

    setParsedQuestions((prev) => [newQ, ...prev]);
    showToast(
      `Đã thêm 1 câu ${roomMode === 'Tự luận' ? 'Tự luận' : 'mới'} cho Khối ${selectedGrade}!`
    );
  };

  // Confirm import all questions into the room
  const handleConfirmImport = () => {
    if (parsedQuestions.length === 0) {
      alert('Chưa có câu hỏi nào được phân tích để đưa vào phòng thi!');
      return;
    }

    onImportQuestions(parsedQuestions);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 font-sans overflow-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-70 bg-[#073B66] text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-sky-400 flex items-center gap-2 text-xs font-bold animate-in slide-in-from-top-3">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* ----------------------------------------------------------------- */}
        {/* HEADER: TITLE, ROOM CONTEXT & CLOSE                               */}
        {/* ----------------------------------------------------------------- */}
        <header className="px-5 py-4 bg-gradient-to-r from-[#073B66] via-[#0878C9] to-teal-700 text-white flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shadow-inner shrink-0">
              📥
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-white/20 text-sky-200">
                  Soạn & Nhập Đề Nhanh
                </span>
                <span className="text-xs text-sky-100">
                  {roomTitle}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black tracking-tight">
                Nhập Câu Hỏi Theo Khối Lớp Từ File Word Hoặc Copy Dán
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-rose-600 rounded-xl text-white cursor-pointer transition-colors"
            title="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* ----------------------------------------------------------------- */}
        {/* CONTROLS BAR: GRADE SELECTOR (10, 11, 12) & INPUT METHOD          */}
        {/* ----------------------------------------------------------------- */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* STEP 1: CHOOSE TARGET GRADE (KHỐI 10, 11, 12) */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase text-slate-700 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-[#0878C9]" />
              <span>Khối Lớp Áp Dụng:</span>
            </span>

            <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs">
              <button
                type="button"
                onClick={() => handleGradeChange(10)}
                className={`px-3.5 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedGrade === 10
                    ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-300'
                    : 'bg-transparent text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>🟢 Lớp 10</span>
              </button>

              <button
                type="button"
                onClick={() => handleGradeChange(11)}
                className={`px-3.5 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedGrade === 11
                    ? 'bg-sky-600 text-white shadow-xs ring-2 ring-sky-300'
                    : 'bg-transparent text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>🔵 Lớp 11</span>
              </button>

              <button
                type="button"
                onClick={() => handleGradeChange(12)}
                className={`px-3.5 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedGrade === 12
                    ? 'bg-purple-600 text-white shadow-xs ring-2 ring-purple-300'
                    : 'bg-transparent text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>🟣 Lớp 12</span>
              </button>
            </div>
          </div>

          {/* STEP 2: CHOOSE INPUT METHOD TABS */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveInputMethod('word')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeInputMethod === 'word'
                  ? 'bg-[#073B66] text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Tải file Word (.docx, .doc)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveInputMethod('paste')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeInputMethod === 'paste'
                  ? 'bg-[#073B66] text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <ClipboardPaste className="w-3.5 h-3.5" />
              <span>Copy & Dán văn bản</span>
            </button>

            <button
              type="button"
              onClick={handleAddManualSingleQuestion}
              className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
              title="Nhập câu hỏi thủ công, chọn đáp án và lưu câu hỏi trực tiếp"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nhập câu hỏi thủ công</span>
            </button>
          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* SUB-BAR: PHÂN LOẠI CHƯƠNG / CHỦ ĐỀ & BÀI HỌC ÁP DỤNG HÀNG LOẠT    */}
        {/* ----------------------------------------------------------------- */}
        <div className="px-4 py-2.5 bg-blue-50/80 border-b border-blue-200/90 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-bold text-[#073B66] uppercase text-[11px] flex items-center gap-1.5 shrink-0">
              <BookOpen className="w-3.5 h-3.5 text-blue-700" />
              <span>Gán phân loại đề thi:</span>
            </span>

            {/* 1. Chọn Chương / Chủ đề */}
            <div className="flex items-center gap-1.5 bg-white border border-blue-300 rounded-xl px-2.5 py-1 shadow-2xs">
              <span className="text-[11px] font-bold text-blue-900 shrink-0">
                📚 Chương / Chủ đề:
              </span>
              <select
                value={topic}
                onChange={(e) => handleTopicChange(e.target.value)}
                className="bg-transparent border-none text-xs font-bold text-[#073B66] outline-none max-w-[200px] sm:max-w-[280px] cursor-pointer"
                title="Chọn Chương / Chủ đề áp dụng cho các câu hỏi nhập vào"
              >
                {getTopicsForGrade(selectedGrade).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
                {topic && !getTopicsForGrade(selectedGrade).includes(topic) && (
                  <option value={topic}>{topic}</option>
                )}
              </select>
            </div>

            {/* 2. Chọn Bài học */}
            <div className="flex items-center gap-1.5 bg-white border border-emerald-300 rounded-xl px-2.5 py-1 shadow-2xs">
              <span className="text-[11px] font-bold text-emerald-900 shrink-0">
                📖 Bài học:
              </span>
              <select
                value={lesson}
                onChange={(e) => handleLessonChange(e.target.value)}
                className="bg-transparent border-none text-xs font-bold text-emerald-800 outline-none max-w-[200px] sm:max-w-[280px] cursor-pointer"
                title="Chọn Bài học áp dụng cho các câu hỏi nhập vào"
              >
                {getLessonsForTopic(selectedGrade, topic).map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
                {lesson && !getLessonsForTopic(selectedGrade, topic).includes(lesson) && (
                  <option value={lesson}>{lesson}</option>
                )}
              </select>
            </div>
          </div>

          <span className="text-[11px] text-slate-500 italic">
            * Toàn bộ câu hỏi phân tích từ file Word sẽ tự động gắn đúng Chủ đề & Bài học này.
          </span>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* INPUT WORKSPACE: FILE DROP OR RAW TEXT AREA                       */}
        {/* ----------------------------------------------------------------- */}
        <div className="p-4 sm:p-5 border-b border-slate-200 shrink-0 bg-white">
          {activeInputMethod === 'word' ? (
            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border-2 border-dashed border-sky-300 rounded-2xl bg-sky-50/50">
              <div className="flex-1 text-center sm:text-left space-y-1">
                <span className="font-black text-sm text-[#073B66] flex items-center justify-center sm:justify-start gap-1.5">
                  <FileText className="w-4 h-4 text-sky-600" />
                  <span>Chọn file Word (.docx, .doc, .txt) từ máy tính Cô:</span>
                </span>
                <p className="text-xs text-slate-500">
                  Hệ thống tự động phân tích và gán vào <strong>Khối Lớp {selectedGrade}</strong> cho phòng thi này.
                </p>
                {selectedFile && (
                  <div className="text-xs font-bold text-emerald-700 pt-1">
                    ✓ Đã chọn file: <strong>{selectedFile.name}</strong> ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <label className="px-5 py-2.5 bg-[#0878C9] hover:bg-[#073B66] text-white rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer shadow-sm transition-all active:scale-95">
                  <Upload className="w-4 h-4" />
                  <span>{isLoadingFile ? 'Đang đọc file...' : 'Tải file Word lên'}</span>
                  <input
                    type="file"
                    accept=".docx,.doc,.txt,.rtf,.html,.htm"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={downloadWordTemplate}
                  className="px-3.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  title="Tải file Word mẫu chuẩn (.doc) để xem cấu trúc"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Tải file Word mẫu</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                  <ClipboardPaste className="w-3.5 h-3.5 text-[#0878C9]" />
                  <span>Dán văn bản câu hỏi từ Word vào ô bên dưới:</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePasteSampleText}
                    className="text-[11px] font-bold text-sky-700 hover:underline cursor-pointer"
                  >
                    + Dán đoạn mẫu thử nghiệm
                  </button>
                  <button
                    type="button"
                    onClick={() => setPastedText('')}
                    className="text-[11px] text-slate-400 hover:text-rose-600 cursor-pointer"
                  >
                    Xóa trắng ô
                  </button>
                </div>
              </div>

              <textarea
                rows={4}
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Dán nội dung câu hỏi tại đây... Ví dụ:&#10;Câu 1: Chiến dịch nào...?&#10;A. Phương án A&#10;B. Phương án B&#10;C. Phương án C&#10;D. Phương án D&#10;Đáp án: A"
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-serif leading-relaxed outline-none focus:ring-2 focus:ring-[#0878C9] focus:bg-white"
              />

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleParsePastedText}
                  className="px-5 py-2 bg-gradient-to-r from-[#073B66] to-[#0878C9] hover:from-[#052C4D] hover:to-[#076BB3] text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm cursor-pointer transition-all active:scale-95"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Phân tích câu hỏi Khối {selectedGrade} ngay</span>
                </button>
              </div>
            </div>
          )}

          {/* File read error notice with instant fallbacks */}
          {fileReadError && (
            <div className="mt-3 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="whitespace-pre-line leading-relaxed font-medium">{fileReadError}</div>
              </div>
              <div className="flex flex-wrap items-center gap-2 pl-6">
                <button
                  type="button"
                  onClick={() => setActiveInputMethod('paste')}
                  className="px-3 py-1.5 bg-white hover:bg-rose-100 text-rose-900 border border-rose-300 rounded-lg font-bold text-[11px] cursor-pointer"
                >
                  Chuyển sang Copy & Dán văn bản
                </button>
                <button
                  type="button"
                  onClick={handleAddManualSingleQuestion}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] cursor-pointer"
                >
                  + Nhập câu hỏi thủ công
                </button>
              </div>
            </div>
          )}

          {/* Parse errors notice if any */}
          {parseErrors.length > 0 && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs space-y-1">
              <span className="font-bold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                Một số lưu ý khi phân tích file:
              </span>
              <ul className="list-disc pl-5 space-y-0.5 text-[11px]">
                {parseErrors.slice(0, 3).map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* PARSED QUESTIONS LIST: INTERACTIVE BUTTONS & EDITING              */}
        {/* ----------------------------------------------------------------- */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-slate-50/60 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className="font-black text-sm text-[#073B66] flex items-center gap-2">
                <span>Danh Sách Câu Hỏi Đã Phân Tích ({parsedQuestions.length} câu)</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-900 border border-purple-200">
                  Khối Lớp {selectedGrade}
                </span>
              </h4>
              <p className="text-[11px] text-slate-500">
                Cô có thể bấm vào các nút <strong>[ A ] [ B ] [ C ] [ D ]</strong> hoặc <strong>[ ĐÚNG / SAI ]</strong> để tích chọn đáp án đúng, sửa văn bản và bấm Lưu.
              </p>
            </div>

            {parsedQuestions.length > 0 && (
              <button
                type="button"
                onClick={handleConfirmImport}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-md cursor-pointer transition-all active:scale-95"
              >
                <Save className="w-4 h-4 text-amber-200" />
                <span>Đưa tất cả ({parsedQuestions.length} câu) vào Phòng thi</span>
              </button>
            )}
          </div>

          {parsedQuestions.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-300 text-slate-500 space-y-2">
              <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-medium">
                Chưa có câu hỏi nào được phân tích. Cô hãy chọn tải file Word hoặc copy dán văn bản ở trên nhé!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {parsedQuestions.map((q, idx) => {
                const isSingle = q.type === 'Trắc nghiệm đơn' || q.type === 'Trắc nghiệm';
                const isTF = q.type === 'Trắc nghiệm đúng sai';
                const isEssay = q.type === 'Tự luận';
                const isSaved = !!savedStatusMap[q.id];

                return (
                  <div
                    key={q.id || idx}
                    className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3 transition-all hover:border-slate-300"
                  >
                    {/* Top bar of question card */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-xl bg-[#073B66] text-white flex items-center justify-center font-black text-xs">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-xs text-[#0878C9] uppercase">
                          {q.type}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
                          Khối {q.grade || selectedGrade}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200 truncate max-w-[150px]" title={q.topic || topic}>
                          📚 {q.topic || topic}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 truncate max-w-[150px]" title={q.lesson || lesson}>
                          📖 {q.lesson || lesson}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Change grade for this specific question */}
                        <select
                          value={q.grade || selectedGrade}
                          onChange={(e) => {
                            const val = Number(e.target.value) as 10 | 11 | 12;
                            setParsedQuestions((prev) =>
                              prev.map((item) => (item.id === q.id ? { ...item, grade: val } : item))
                            );
                          }}
                          className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 cursor-pointer"
                        >
                          <option value={10}>Lớp 10</option>
                          <option value={11}>Lớp 11</option>
                          <option value={12}>Lớp 12</option>
                        </select>

                        {/* Save this question */}
                        <button
                          type="button"
                          onClick={() => handleSaveIndividual(q.id, idx)}
                          className="px-3 py-1.5 bg-[#073B66] hover:bg-[#0878C9] text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Save className="w-3.5 h-3.5 text-amber-300" />
                          <span>Lưu câu hỏi</span>
                        </button>

                        {/* Delete this question */}
                        <button
                          type="button"
                          onClick={() => handleDeleteIndividual(q.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl cursor-pointer transition-colors"
                          title="Xóa câu này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Question Content Input */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-600">
                        Nội dung câu hỏi / Trích dẫn tư liệu:
                      </label>
                      <textarea
                        rows={2}
                        value={q.content}
                        onChange={(e) => handleUpdateContent(q.id, e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-serif text-xs sm:text-sm leading-relaxed outline-none focus:ring-2 focus:ring-[#0878C9] focus:bg-white"
                      />
                    </div>

                    {/* 1. DẠNG TRẮC NGHIỆM ĐƠN: 4 NÚT CHỌN ĐÁP ÁN (A, B, C, D) */}
                    {isSingle && (
                      <div className="space-y-2.5 pt-1">
                        <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-sky-50 rounded-xl border border-sky-200 text-xs">
                          <span className="font-bold text-[#073B66] flex items-center gap-1">
                            <CheckSquare className="w-4 h-4 text-sky-600" />
                            <span>Bấm chọn đáp án đúng:</span>
                          </span>

                          <div className="flex items-center gap-1.5">
                            {(['A', 'B', 'C', 'D'] as const).map((letter) => {
                              const isCorrect = q.correctAnswer?.toUpperCase() === letter;
                              return (
                                <button
                                  key={letter}
                                  type="button"
                                  onClick={() => handleSetSingleChoiceAnswer(q.id, letter)}
                                  className={`w-9 h-8 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center justify-center ${
                                    isCorrect
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

                        {/* 4 Options Input */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {(['A', 'B', 'C', 'D'] as const).map((letter, optIdx) => {
                            const optText = q.options?.[optIdx] || '';
                            const cleanText = optText.replace(/^[A-D]\.\s*/, '');
                            const isCorrect = q.correctAnswer?.toUpperCase() === letter;

                            return (
                              <div
                                key={letter}
                                className={`p-2 rounded-xl border flex items-center gap-2 transition-all ${
                                  isCorrect
                                    ? 'bg-emerald-50 border-emerald-400 ring-1 ring-emerald-300'
                                    : 'bg-slate-50 border-slate-200'
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={() => handleSetSingleChoiceAnswer(q.id, letter)}
                                  className={`w-6 h-6 rounded-lg font-black text-xs shrink-0 cursor-pointer flex items-center justify-center ${
                                    isCorrect
                                      ? 'bg-emerald-600 text-white shadow-xs'
                                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                  }`}
                                >
                                  {letter}
                                </button>
                                <input
                                  type="text"
                                  value={cleanText}
                                  onChange={(e) =>
                                    handleUpdateOption(q.id, optIdx, letter, e.target.value)
                                  }
                                  placeholder={`Phương án ${letter}...`}
                                  className="flex-1 bg-transparent border-none outline-none text-xs font-serif text-slate-900"
                                />
                                {isCorrect && (
                                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded shrink-0">
                                    Đúng ✓
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* 2. DẠNG TRẮC NGHIỆM ĐÚNG SAI: CÁC NÚT [ ĐÚNG ] / [ SAI ] */}
                    {isTF && q.trueFalseStatements && (
                      <div className="space-y-2 pt-1">
                        <span className="text-[11px] font-bold text-slate-600 uppercase block">
                          Nhận định và đáp án Đúng / Sai (Bấm nút để đổi đáp án):
                        </span>

                        <div className="space-y-1.5">
                          {q.trueFalseStatements.map((stmt, stmtIdx) => (
                            <div
                              key={stmt.id}
                              className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                            >
                              <div className="flex items-center gap-2 flex-1">
                                <strong className="w-6 h-6 rounded-lg bg-purple-100 text-purple-900 font-black text-xs shrink-0 flex items-center justify-center">
                                  {stmt.id})
                                </strong>
                                <input
                                  type="text"
                                  value={stmt.statement}
                                  onChange={(e) => {
                                    const text = e.target.value;
                                    setParsedQuestions((prev) =>
                                      prev.map((item) => {
                                        if (item.id !== q.id || !item.trueFalseStatements) return item;
                                        const stmts = [...item.trueFalseStatements];
                                        stmts[stmtIdx] = { ...stmts[stmtIdx], statement: text };
                                        return { ...item, trueFalseStatements: stmts };
                                      })
                                    );
                                  }}
                                  className="flex-1 bg-transparent border-none outline-none text-xs font-serif"
                                />
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                                <button
                                  type="button"
                                  onClick={() => handleToggleTfStatement(q.id, stmtIdx, true)}
                                  className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                                    stmt.isCorrect === true
                                      ? 'bg-emerald-600 text-white shadow-xs ring-1 ring-emerald-300'
                                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-emerald-50'
                                  }`}
                                >
                                  ĐÚNG {stmt.isCorrect === true && '✓'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleTfStatement(q.id, stmtIdx, false)}
                                  className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                                    stmt.isCorrect === false
                                      ? 'bg-rose-600 text-white shadow-xs ring-1 ring-rose-300'
                                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-rose-50'
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

                    {/* 3. DẠNG TỰ LUẬN: DÀN Ý & BIỂU ĐIỂM RUBRIC */}
                    {isEssay && (
                      <div className="space-y-2.5 pt-1">
                        <div>
                          <label className="block text-[11px] font-bold text-rose-900 mb-1">
                            Dàn ý gợi ý trả lời & Biểu điểm Rubric:
                          </label>
                          <textarea
                            rows={4}
                            value={q.essayOutline || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setParsedQuestions((prev) =>
                                prev.map((item) =>
                                  item.id === q.id ? { ...item, essayOutline: val } : item
                                )
                              );
                            }}
                            placeholder="Nhập dàn ý gợi ý các ý chính kèm điểm..."
                            className="w-full p-2.5 bg-rose-50/40 border border-rose-200 rounded-xl font-serif text-xs leading-relaxed outline-none focus:ring-2 focus:ring-rose-400"
                          />
                        </div>
                        {q.rubricPoints && q.rubricPoints.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {q.rubricPoints.map((r, rIdx) => (
                              <div
                                key={rIdx}
                                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] flex items-center justify-between gap-2"
                              >
                                <span className="truncate">{r.criteria}</span>
                                <span className="font-bold text-rose-700 shrink-0 tabular-nums">
                                  {r.points}đ
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Footer of card */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                      <div className="flex items-center gap-2">
                        {isSaved && (
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            ✓ Đã lưu lúc [{savedStatusMap[q.id]}]
                          </span>
                        )}
                      </div>

                      <div className="text-slate-500 text-xs flex items-center gap-1.5">
                        <span>Đáp án chuẩn:</span>
                        <strong className="text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {q.correctAnswer}
                        </strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* FOOTER ACTIONS: CANCEL & IMPORT ALL                                */}
        {/* ----------------------------------------------------------------- */}
        <footer className="px-5 py-3.5 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-600">
            Tổng cộng: <strong>{parsedQuestions.length} câu hỏi</strong> sẽ được đưa vào{' '}
            <strong>Khối {selectedGrade}</strong> trong phòng thi.
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>

            <button
              type="button"
              disabled={parsedQuestions.length === 0}
              onClick={handleConfirmImport}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-md transition-all cursor-pointer active:scale-95"
            >
              <Save className="w-4 h-4 text-amber-200" />
              <span>Đưa tất cả ({parsedQuestions.length} câu) vào Phòng thi</span>
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};
