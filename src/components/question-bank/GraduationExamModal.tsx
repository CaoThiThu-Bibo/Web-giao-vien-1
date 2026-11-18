import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { standardGraduationExamQuestions } from '../../data/graduationExamData';
import { calculateGraduationExamScore, MOET_TF_BAREM } from '../../lib/examScoring';
import { Question } from '../../types';
import {
  downloadWordTemplate,
  extractTextFromFile,
  parseQuestionsFromText,
} from '../../lib/wordQuestionParser';
import { StudentExamRoomModal } from './StudentExamRoomModal';
import {
  Award,
  CheckCircle,
  XCircle,
  FileText,
  Printer,
  Sparkles,
  Calculator,
  Layers,
  Save,
  BookOpen,
  HelpCircle,
  RotateCcw,
  CheckCheck,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  CheckSquare,
  Upload,
  Plus,
  RefreshCw,
  FolderOpen,
  Trash2,
  FileCheck,
  GraduationCap,
  Sparkle,
  Copy,
  BookMarked,
  ArrowRight,
  Download,
  Edit3,
  ClipboardPaste,
  Wand2,
  Image as ImageIcon,
} from 'lucide-react';

export interface GraduationExamItem {
  id: string;
  title: string;
  code: string;
  source: 'BGDDT_2025' | 'AI_GENERATED' | 'WORD_UPLOAD' | 'CUSTOM';
  createdAt: string;
  topic: string;
  note?: string;
  part1: Question[]; // Single choice questions (usually 24)
  part2: Question[]; // True/false questions with stimulus/documents (usually 4)
}

interface GraduationExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportToBank?: (questions?: Question[]) => void;
}

export const GraduationExamModal: React.FC<GraduationExamModalProps> = ({
  isOpen,
  onClose,
  onImportToBank,
}) => {
  const { userRole, classes, students, updateStudentScore, exams, addExam, addQuestion } = useApp();

  // Active Tab:
  // 'library' | 'ai-studio' | 'upload' | 'manual' | 'exam' | 'grading' | 'key'
  const [activeTab, setActiveTab] = useState<
    'library' | 'ai-studio' | 'upload' | 'manual' | 'exam' | 'grading' | 'key'
  >('grading');

  const [isStudentExamRoomOpen, setIsStudentExamRoomOpen] = useState(false);

  // Default Standard MOET 2025 Exam
  const defaultMoetExam: GraduationExamItem = useMemo(() => {
    const p1 = standardGraduationExamQuestions.filter((q) => q.type === 'Trắc nghiệm đơn');
    const p2 = standardGraduationExamQuestions.filter((q) => q.type === 'Trắc nghiệm đúng sai');
    return {
      id: 'exam_moet_standard_2025',
      title: 'Đề thi tham khảo tốt nghiệp THPT 2025 - Bộ GD&ĐT (Mã đề 121)',
      code: 'MÃ 121',
      source: 'BGDDT_2025',
      createdAt: '2025-03-01',
      topic: 'Lịch sử Việt Nam & Thế giới từ năm 1945 đến nay',
      note: 'Chuẩn 100% cấu trúc định dạng Quyết định 764/QĐ-BGDĐT: 24 câu trắc nghiệm 4 chọn 1 + 4 câu Đúng/Sai tư liệu.',
      part1: p1,
      part2: p2,
    };
  }, []);

  // Multi-exam Library State
  const [examLibrary, setExamLibrary] = useState<GraduationExamItem[]>(() => {
    try {
      const saved = localStorage.getItem('suhocso_graduation_exams_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load saved graduation exams:', e);
    }
    return [defaultMoetExam];
  });

  const [activeExamId, setActiveExamId] = useState<string>(
    examLibrary[0]?.id || defaultMoetExam.id
  );

  // Active exam object
  const currentExam = useMemo(() => {
    return (
      examLibrary.find((e) => e.id === activeExamId) ||
      examLibrary[0] ||
      defaultMoetExam
    );
  }, [examLibrary, activeExamId, defaultMoetExam]);

  // Persist examLibrary
  useEffect(() => {
    try {
      localStorage.setItem('suhocso_graduation_exams_v2', JSON.stringify(examLibrary));
    } catch (e) {}
  }, [examLibrary]);

  // Answers State for Live Grading on current exam
  // Part 1: questionIndex (0..N-1) -> 'A' | 'B' | 'C' | 'D'
  const [part1Answers, setPart1Answers] = useState<Record<number, string>>({});
  // Part 2: questionIndex (0..M-1) -> { a?: boolean, b?: boolean, c?: boolean, d?: boolean }
  const [part2Answers, setPart2Answers] = useState<
    Record<number, Record<'a' | 'b' | 'c' | 'd', boolean | undefined>>
  >({
    0: { a: undefined, b: undefined, c: undefined, d: undefined },
    1: { a: undefined, b: undefined, c: undefined, d: undefined },
    2: { a: undefined, b: undefined, c: undefined, d: undefined },
    3: { a: undefined, b: undefined, c: undefined, d: undefined },
  });

  // Reset answers when switching exams
  const handleSelectExam = (examId: string, switchTabTo: 'exam' | 'grading' = 'grading') => {
    setActiveExamId(examId);
    setPart1Answers({});
    setPart2Answers({
      0: { a: undefined, b: undefined, c: undefined, d: undefined },
      1: { a: undefined, b: undefined, c: undefined, d: undefined },
      2: { a: undefined, b: undefined, c: undefined, d: undefined },
      3: { a: undefined, b: undefined, c: undefined, d: undefined },
    });
    setSaveSuccessMsg(null);
    setActiveTab(switchTabTo);
  };

  // Target class & student to save score into Gradebook
  const grade12Classes = useMemo(() => classes.filter((c) => c.grade === 12), [classes]);
  const [selectedClassId, setSelectedClassId] = useState<string>(
    grade12Classes[0]?.id || classes[0]?.id || ''
  );
  const classStudents = useMemo(
    () => students.filter((s) => s.classId === selectedClassId),
    [students, selectedClassId]
  );
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    classStudents[0]?.id || ''
  );
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Divide current exam questions
  const part1Questions = currentExam.part1;
  const part2Questions = currentExam.part2;

  const part1CorrectAnswers = useMemo(
    () => part1Questions.map((q) => q.correctAnswer),
    [part1Questions]
  );

  // Real-time calculation of score
  const scoreResult = useMemo(() => {
    return calculateGraduationExamScore(
      part1Answers,
      part1CorrectAnswers,
      part2Answers,
      part2Questions
    );
  }, [part1Answers, part1CorrectAnswers, part2Answers, part2Questions]);

  // Handle Fill 100% correct answers (for demo / test)
  const handleFillAllCorrect = () => {
    const p1: Record<number, string> = {};
    part1Questions.forEach((q, idx) => {
      p1[idx] = q.correctAnswer;
    });
    setPart1Answers(p1);

    const p2: Record<number, Record<'a' | 'b' | 'c' | 'd', boolean>> = {};
    part2Questions.forEach((q, idx) => {
      p2[idx] = {
        a: q.trueFalseStatements?.find((s) => s.id === 'a')?.isCorrect ?? true,
        b: q.trueFalseStatements?.find((s) => s.id === 'b')?.isCorrect ?? true,
        c: q.trueFalseStatements?.find((s) => s.id === 'c')?.isCorrect ?? false,
        d: q.trueFalseStatements?.find((s) => s.id === 'd')?.isCorrect ?? true,
      };
    });
    setPart2Answers(p2);
  };

  // Handle Fill realistic student answers (approx 7.5 - 8.0 score)
  const handleFillGoodSample = () => {
    const p1: Record<number, string> = {};
    part1Questions.forEach((q, idx) => {
      // 20 correct, 4 wrong
      if (idx === 3) p1[idx] = 'C';
      else if (idx === 9) p1[idx] = 'B';
      else if (idx === 16) p1[idx] = 'C';
      else if (idx === 21) p1[idx] = 'B';
      else p1[idx] = q.correctAnswer;
    });
    setPart1Answers(p1);

    const p2: Record<number, Record<'a' | 'b' | 'c' | 'd', boolean>> = {};
    part2Questions.forEach((q, idx) => {
      const getReal = (key: 'a' | 'b' | 'c' | 'd') =>
        q.trueFalseStatements?.find((s) => s.id === key)?.isCorrect ?? true;
      if (idx === 0) {
        // 4 correct -> 1.0đ
        p2[idx] = { a: getReal('a'), b: getReal('b'), c: getReal('c'), d: getReal('d') };
      } else if (idx === 1) {
        // 3 correct -> 0.5đ
        p2[idx] = { a: getReal('a'), b: getReal('b'), c: !getReal('c'), d: getReal('d') };
      } else if (idx === 2) {
        // 3 correct -> 0.5đ
        p2[idx] = { a: getReal('a'), b: !getReal('b'), c: getReal('c'), d: getReal('d') };
      } else {
        // 2 correct -> 0.25đ
        p2[idx] = { a: getReal('a'), b: !getReal('b'), c: !getReal('c'), d: getReal('d') };
      }
    });
    setPart2Answers(p2);
  };

  // Reset answers
  const handleResetAnswers = () => {
    setPart1Answers({});
    setPart2Answers({
      0: { a: undefined, b: undefined, c: undefined, d: undefined },
      1: { a: undefined, b: undefined, c: undefined, d: undefined },
      2: { a: undefined, b: undefined, c: undefined, d: undefined },
      3: { a: undefined, b: undefined, c: undefined, d: undefined },
    });
    setSaveSuccessMsg(null);
  };

  // Print Exam
  const handlePrint = () => {
    window.print();
  };

  // Save student score into AppContext Gradebook
  const handleSaveToGradebook = () => {
    if (!selectedStudentId) {
      alert('Vui lòng chọn học viên cần lưu điểm!');
      return;
    }

    let exam = exams.find(
      (e) =>
        e.classId === selectedClassId &&
        (e.title.includes('Tốt nghiệp') || e.title.includes('Khảo sát') || e.code.includes('TN'))
    );

    let examId = exam?.id;
    if (!examId) {
      examId = `ex_mock_tn_${Date.now()}`;
      addExam({
        code: `KT_TN12_${Date.now().toString().slice(-4)}`,
        title: currentExam.title,
        classId: selectedClassId,
        className: classes.find((c) => c.id === selectedClassId)?.name || 'Khối 12',
        grade: 12,
        date: new Date().toISOString().split('T')[0],
        type: '1 tiết (45 phút)',
        format: 'Trắc nghiệm',
        maxScore: 10,
        weight: 2,
        description: `Chấm điểm tự động chuẩn Bộ GD&ĐT (${part1Questions.length} câu Phần I + ${part2Questions.length} câu Phần II)`,
      });
    }

    updateStudentScore(
      selectedStudentId,
      examId,
      scoreResult.totalScore,
      `Chấm Đề tốt nghiệp (${currentExam.code}): ${scoreResult.evaluationText}`
    );

    const st = students.find((s) => s.id === selectedStudentId);
    setSaveSuccessMsg(
      `Đã cập nhật điểm ${scoreResult.totalScore.toFixed(2)} (${scoreResult.evaluationLevel}) vào Sổ điểm điện tử cho học viên ${
        st?.fullName || ''
      }!`
    );
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  // =========================================================================
  // AI EXAM GENERATOR STATE & LOGIC
  // =========================================================================
  const [aiExamTitle, setAiExamTitle] = useState(
    'Đề ôn thi tốt nghiệp Lịch sử 12 - Giai đoạn 1945 - 1975'
  );
  const [aiTopic, setAiTopic] = useState('Lịch sử Việt Nam thế kỷ XX (1919 - 1975)');
  const [aiSourceText, setAiSourceText] = useState('');
  const [aiNumPart1, setAiNumPart1] = useState(24);
  const [aiNumPart2, setAiNumPart2] = useState(4);
  const [aiNotes, setAiNotes] = useState(
    'Bám sát chuẩn năng lực lịch sử, khai thác sâu văn kiện và tư liệu lịch sử cho học viên GDTX Tiên Yên.'
  );
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiGenerationStatus, setAiGenerationStatus] = useState('');
  const [aiGeneratedExamPreview, setAiGeneratedExamPreview] = useState<GraduationExamItem | null>(
    null
  );

  // Preset sample texts for cô giáo to test immediately
  const sampleDataPresets = [
    {
      title: 'Chiến dịch Điện Biên Phủ 1954',
      topic: 'Cuộc kháng chiến chống thực dân Pháp (1945 - 1954)',
      text: `Tập đoàn cứ điểm Điện Biên Phủ gồm 49 cứ điểm, chia làm 3 phân khu: Bắc, Trung tâm và Nam. Pháp và Mỹ coi Điện Biên Phủ là "pháo đài bất khả xâm phạm".
Sau 56 ngày đêm "khoét núi, ngủ hầm, mưa dầm, cơm vắt", quân và dân ta dưới sự chỉ đạo của Trung ương Đảng và Đại tướng Võ Nguyên Giáp (với phương châm "đánh chắc, tiến chắc") đã tiêu diệt hoàn toàn tập đoàn cứ điểm này vào ngày 7/5/1954.
Chiến thắng giáng đòn quyết định vào kế hoạch Na-va, làm phá sản ý chí xâm lược của thực dân Pháp, buộc Pháp phải ký Hiệp định Giơ-ne-vơ công nhận độc lập, chủ quyền, thống nhất và toàn vẹn lãnh thổ của 3 nước Đông Dương.`,
    },
    {
      title: 'Đại thắng mùa Xuân 1975 & Chiến dịch Hồ Chí Minh',
      topic: 'Cuộc kháng chiến chống Mỹ, cứu nước (1954 - 1975)',
      text: `Sau chiến thắng Phước Long (1/1975), Bộ Chính trị đề ra kế hoạch giải phóng miền Nam trong hai năm 1975 - 1976, nếu thời cơ đến thì giải phóng ngay trong năm 1975.
Cuộc Tổng tiến công và nổi dậy mở màn bằng Chiến dịch Tây Nguyên (4/3 - 24/3/1975) với đòn điểm huyệt Buôn Ma Thuột, biến cuộc rút chạy của địch thành tan rã hỗn loạn. Tiếp đó là Chiến dịch Huế - Đà Nẵng (21/3 - 29/3/1975).
Đỉnh cao là Chiến dịch Hồ Chí Minh lịch sử (26/4 - 30/4/1975). Đúng 11 giờ 30 phút ngày 30/4/1975, lá cờ cách mạng tung bay trên nóc Dinh Độc Lập, miền Nam hoàn toàn giải phóng, non sông thu về một mối.`,
    },
    {
      title: 'Đường lối Đổi mới của Đảng từ năm 1986',
      topic: 'Việt Nam trên con đường đổi mới và hội nhập (1986 - nay)',
      text: `Tháng 12/1986, Đại hội đại biểu toàn quốc lần thứ VI của Đảng họp tại Hà Nội đã khởi xướng đường lối đổi mới toàn diện đất nước.
Đảng thẳng thắn "nhìn thẳng vào sự thật, đánh giá đúng sự thật, nói rõ sự thật", thừa nhận những sai lầm chủ quan trong việc duy trì cơ chế tập trung quan liêu, bao cấp.
Trọng tâm đổi mới là phát triển nền kinh tế hàng hóa nhiều thành phần vận hành theo cơ chế thị trường định hướng xã hội chủ nghĩa, đồng thời thực hiện ba chương trình kinh tế lớn: Lương thực - thực phẩm, Hàng tiêu dùng và Hàng xuất khẩu. Về đối ngoại: Việt Nam muốn là bạn với tất cả các nước trong cộng đồng quốc tế.`,
    },
  ];

  const handleApplyPreset = (preset: (typeof sampleDataPresets)[0]) => {
    setAiExamTitle(`Đề ôn thi tốt nghiệp 2025: ${preset.title}`);
    setAiTopic(preset.topic);
    setAiSourceText(preset.text);
  };

  // Call Server-side API to generate Graduation Exam
  const handleGenerateExamWithAi = async () => {
    setIsGeneratingAi(true);
    setAiGenerationStatus('Đang gửi tư liệu và kết nối máy chủ Gemini 3.8 Flash...');
    setAiGeneratedExamPreview(null);

    try {
      const response = await fetch('/api/gemini/generate-graduation-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: aiTopic,
          sourceText: aiSourceText,
          grade: 12,
          numPart1: aiNumPart1,
          numPart2: aiNumPart2,
          examTitle: aiExamTitle,
          notes: aiNotes,
        }),
      });

      if (!response.ok) {
        throw new Error(`Máy chủ phản hồi mã lỗi: ${response.status}`);
      }

      setAiGenerationStatus('Đang hoàn thiện 24 câu trắc nghiệm và 4 câu Đúng/Sai tư liệu...');
      const result = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.message || 'Không thể tạo đề thi từ máy chủ.');
      }

      const generatedData = result.data;

      // Transform raw items into Question format
      const formattedPart1: Question[] = (generatedData.part1 || []).map(
        (q: any, idx: number) => ({
          id: `ai_p1_${Date.now()}_${idx + 1}`,
          grade: 12,
          topic: aiTopic,
          lesson: `Phần I: Câu ${idx + 1}`,
          knowledgeDomain: q.cognitiveLevel || 'Nhận biết',
          type: 'Trắc nghiệm đơn',
          cognitiveLevel: q.cognitiveLevel || 'Nhận biết',
          content: q.content,
          options: q.options || [],
          correctAnswer: q.correctAnswer || 'A',
          explanation: q.explanation || 'Căn cứ vào SGK và tư liệu giáo viên cung cấp.',
          source: 'AI Biên soạn theo tư liệu Cô Cao Thị Thu',
          author: 'Cô Cao Thị Thu & AI',
          updatedAt: new Date().toISOString().split('T')[0],
        })
      );

      const formattedPart2: Question[] = (generatedData.part2 || []).map(
        (q: any, idx: number) => ({
          id: `ai_p2_${Date.now()}_${idx + 1}`,
          grade: 12,
          topic: q.topic || aiTopic,
          lesson: `Phần II: Câu ${idx + 1}`,
          knowledgeDomain: q.knowledgeDomain || 'Tư liệu lịch sử',
          type: 'Trắc nghiệm đúng sai',
          cognitiveLevel: q.cognitiveLevel || 'Thông hiểu',
          content: q.content,
          trueFalseStatements: q.trueFalseStatements || [
            { id: 'a', statement: 'Ý kiến a', isCorrect: true, explanation: '' },
            { id: 'b', statement: 'Ý kiến b', isCorrect: false, explanation: '' },
            { id: 'c', statement: 'Ý kiến c', isCorrect: true, explanation: '' },
            { id: 'd', statement: 'Ý kiến d', isCorrect: false, explanation: '' },
          ],
          correctAnswer: (q.trueFalseStatements || [])
            .map((s: any) => `${s.id}-${s.isCorrect ? 'Đ' : 'S'}`)
            .join(', '),
          explanation: 'Đối chiếu với đoạn trích tư liệu lịch sử được cung cấp.',
          source: 'AI Trích dẫn tư liệu chuẩn Bộ GD&ĐT',
          author: 'Cô Cao Thị Thu & AI',
          updatedAt: new Date().toISOString().split('T')[0],
        })
      );

      const newExamItem: GraduationExamItem = {
        id: `exam_ai_${Date.now()}`,
        title: generatedData.examTitle || aiExamTitle,
        code: `AI-${Math.floor(100 + Math.random() * 900)}`,
        source: 'AI_GENERATED',
        createdAt: new Date().toISOString().split('T')[0],
        topic: aiTopic,
        note: aiSourceText
          ? `Biên soạn từ tư liệu giáo viên cung cấp: "${aiSourceText.slice(0, 80)}..."`
          : 'Được tạo tự động theo chương trình GDPT 2018 Lịch sử 12.',
        part1: formattedPart1,
        part2: formattedPart2,
      };

      setAiGeneratedExamPreview(newExamItem);
      setAiGenerationStatus('Đã tạo thành công đề thi chuẩn Bộ GD&ĐT!');
    } catch (err: any) {
      alert('Có lỗi khi tạo đề thi: ' + (err?.message || 'Lỗi không xác định'));
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Add AI generated exam into Library
  const handleSaveAiExamToLibrary = () => {
    if (!aiGeneratedExamPreview) return;
    setExamLibrary((prev) => [aiGeneratedExamPreview, ...prev]);
    setActiveExamId(aiGeneratedExamPreview.id);
    setActiveTab('grading');
    alert(`Đã lưu "${aiGeneratedExamPreview.title}" vào Thư viện luyện thi và chuyển sang Phòng chấm điểm!`);
  };

  // =========================================================================
  // WORD / TEXT / AI FALLBACK IMPORT EXAM STATE & LOGIC
  // =========================================================================
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadRawText, setUploadRawText] = useState('');
  const [uploadTitle, setUploadTitle] = useState('Đề ôn thi tốt nghiệp tải lên từ Word');
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [isAiParsingUpload, setIsAiParsingUpload] = useState(false);
  const [isDraggingUpload, setIsDraggingUpload] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadInfo, setUploadInfo] = useState<string | null>(null);
  const [uploadPreviewExam, setUploadPreviewExam] = useState<GraduationExamItem | null>(null);
  const uploadTextareaRef = useRef<HTMLTextAreaElement>(null);

  const readFileAsBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const res = String(reader.result || '');
        const commaIdx = res.indexOf(',');
        resolve(commaIdx >= 0 ? res.slice(commaIdx + 1) : res);
      };
      reader.onerror = () => reject(new Error('Không thể đọc dữ liệu file.'));
      reader.readAsDataURL(file);
    });

  const handleAiParseFallback = async (opts?: {
    fileBase64?: string;
    mimeType?: string;
    fileName?: string;
  }) => {
    const hasFile = !!(opts?.fileBase64 && opts?.mimeType);
    if (!hasFile && !uploadRawText.trim()) {
      setUploadError(
        'Cô vui lòng dán nội dung đề thi vào ô bên phải hoặc chọn file Ảnh/PDF trước khi dùng AI tách câu hỏi.'
      );
      return;
    }

    setIsAiParsingUpload(true);
    setUploadError(null);
    setUploadInfo(
      hasFile
        ? `Đang dùng AI quét và trích xuất câu hỏi từ "${opts?.fileName || 'tài liệu'}"...`
        : 'Đang dùng AI phân tích văn bản và tự động tách Phần I + Phần II...'
    );

    try {
      const response = await fetch('/api/gemini/parse-exam-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText: hasFile ? '' : uploadRawText,
          fileBase64: opts?.fileBase64 || '',
          mimeType: opts?.mimeType || '',
          examTitle: uploadTitle,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success || !result.data) {
        throw new Error(
          result.message || 'Không thể kết nối AI tách đề lúc này. Cô thử dùng bộ tách nhanh hoặc Nhập câu hỏi thủ công.'
        );
      }

      const data = result.data;
      const today = new Date().toISOString().split('T')[0];

      const p1: Question[] = (data.part1 || []).map((q: any, idx: number) => ({
        id: `ai_up_p1_${Date.now()}_${idx + 1}`,
        grade: 12,
        topic: 'Lịch sử 12 Ôn thi tốt nghiệp',
        lesson: 'Đề tách bằng AI',
        knowledgeDomain: 'Trắc nghiệm kiến thức lịch sử',
        type: 'Trắc nghiệm đơn',
        cognitiveLevel: q.cognitiveLevel || 'Thông hiểu',
        content: q.content || '',
        options:
          Array.isArray(q.options) && q.options.length >= 2
            ? q.options
            : ['A. Phương án A', 'B. Phương án B', 'C. Phương án C', 'D. Phương án D'],
        correctAnswer: (q.correctAnswer || 'A').toString().trim().charAt(0).toUpperCase(),
        explanation: q.explanation || 'AI trích xuất từ tài liệu giáo viên cung cấp.',
        source: opts?.fileName ? `AI quét từ ${opts.fileName}` : 'AI tách từ văn bản giáo viên',
        author: 'Cô Cao Thị Thu',
        updatedAt: today,
      }));

      const p2: Question[] = (data.part2 || []).map((q: any, idx: number) => {
        const stmts = (q.trueFalseStatements || []).map((s: any, sIdx: number) => ({
          id: (s.id || ['a', 'b', 'c', 'd'][sIdx] || 'a').toLowerCase() as 'a' | 'b' | 'c' | 'd',
          statement: s.statement || '',
          isCorrect: Boolean(s.isCorrect),
          explanation: s.explanation || '',
        }));
        return {
          id: `ai_up_p2_${Date.now()}_${idx + 1}`,
          grade: 12,
          topic: q.topic || 'Tư liệu lịch sử 12',
          lesson: 'Đề tách bằng AI',
          knowledgeDomain: q.knowledgeDomain || 'Trắc nghiệm đúng sai theo năng lực',
          type: 'Trắc nghiệm đúng sai',
          cognitiveLevel: 'Thông hiểu',
          content: q.content || '',
          trueFalseStatements: stmts,
          correctAnswer: stmts.map((s: any) => `${s.id}-${s.isCorrect ? 'ĐÚNG' : 'SAI'}`).join(', '),
          explanation: 'AI trích xuất từ tài liệu giáo viên cung cấp.',
          source: opts?.fileName ? `AI quét từ ${opts.fileName}` : 'AI tách từ văn bản giáo viên',
          author: 'Cô Cao Thị Thu',
          updatedAt: today,
        };
      });

      if (p1.length === 0 && p2.length === 0) {
        throw new Error('AI chưa tìm thấy câu hỏi rõ ràng trong tài liệu này. Cô hãy thử chụp rõ nét hơn hoặc nhập trực tiếp ở tab Nhập câu hỏi.');
      }

      const newExam: GraduationExamItem = {
        id: `exam_upload_${Date.now()}`,
        title: data.examTitle || uploadTitle || 'Đề thi tốt nghiệp (AI tách)',
        code: `AI-DOC-${Math.floor(100 + Math.random() * 900)}`,
        source: 'WORD_UPLOAD',
        createdAt: today,
        topic: 'Đề thi số hóa thông minh',
        note: `AI đã tách được ${p1.length} câu Phần I và ${p2.length} câu Phần II.`,
        part1: p1,
        part2: p2,
      };

      setUploadPreviewExam(newExam);
      setUploadInfo(
        `AI đã nhận diện thành công ${p1.length} câu Phần I và ${p2.length} câu Phần II. Cô kiểm tra nhanh rồi bấm "Lưu vào Thư viện đề thi" nhé!`
      );
    } catch (err: any) {
      setUploadInfo(null);
      setUploadError(err?.message || 'Lỗi khi dùng AI tách câu hỏi.');
    } finally {
      setIsAiParsingUpload(false);
    }
  };

  const handleProcessUploadedFile = async (file: File) => {
    setUploadFile(file);
    setUploadError(null);
    setUploadInfo(null);
    setIsReadingFile(true);

    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const baseTitle = file.name.replace(/\.[^/.]+$/, '');
    setUploadTitle(baseTitle);

    try {
      // Nếu là PDF hoặc Ảnh chụp đề thi -> chạy luồng AI OCR/PDF trực tiếp
      if (ext === 'pdf' || ['png', 'jpg', 'jpeg', 'webp'].includes(ext)) {
        const mimeMap: Record<string, string> = {
          pdf: 'application/pdf',
          png: 'image/png',
          jpg: 'image/jpeg',
          jpeg: 'image/jpeg',
          webp: 'image/webp',
        };
        const fileBase64 = await readFileAsBase64(file);
        setIsReadingFile(false);
        await handleAiParseFallback({
          fileBase64,
          mimeType: file.type || mimeMap[ext] || 'application/octet-stream',
          fileName: file.name,
        });
        return;
      }

      const text = await extractTextFromFile(file);
      setUploadRawText(text);
      const ok = processImportedText(text, baseTitle);
      if (ok) {
        setUploadInfo(`Đã đọc và tách thành công câu hỏi từ file "${file.name}".`);
      }
    } catch (err: any) {
      setUploadError(err?.message || 'Không thể đọc được file này.');
    } finally {
      setIsReadingFile(false);
    }
  };

  const handleUploadFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset input value so re-selecting the exact same file works cleanly
    e.target.value = '';
    if (!file) return;
    await handleProcessUploadedFile(file);
  };

  const processImportedText = (text: string, title: string): boolean => {
    setUploadError(null);
    if (!text.trim()) {
      setUploadError('Ô văn bản đang trống. Cô hãy dán nội dung đề thi hoặc bấm "Dán đề mẫu chuẩn" để thử nghiệm.');
      return false;
    }

    const parsed = parseQuestionsFromText(
      text,
      12,
      'Lịch sử 12 Ôn thi tốt nghiệp',
      'Đề thi tải lên',
      'Cao Thị Thu'
    );

    const today = new Date().toISOString().split('T')[0];
    const p1: Question[] = parsed.questions
      .filter((q) => q.type === 'Trắc nghiệm đơn' || q.type === 'Trắc nghiệm')
      .map((q, idx) => ({
        ...q,
        id: `up_p1_${Date.now()}_${idx + 1}`,
        updatedAt: today,
      }));
    const p2: Question[] = parsed.questions
      .filter((q) => q.type === 'Trắc nghiệm đúng sai')
      .map((q, idx) => ({
        ...q,
        id: `up_p2_${Date.now()}_${idx + 1}`,
        updatedAt: today,
      }));

    if (p1.length === 0 && p2.length === 0) {
      setUploadError(
        'Bộ tách nhanh chưa nhận diện được câu hỏi theo mẫu chuẩn (Câu 1: ... A. B. C. D. hoặc a) b) c) d) Đúng/Sai). Cô hãy bấm nút "AI Tự động tách câu hỏi" bên dưới để AI tự nhận diện văn bản lộn xộn, hoặc chuyển sang tab "Nhập câu hỏi"!'
      );
      return false;
    }

    const newExam: GraduationExamItem = {
      id: `exam_upload_${Date.now()}`,
      title: title || 'Đề thi tốt nghiệp tải lên',
      code: `WORD-${Math.floor(100 + Math.random() * 900)}`,
      source: 'WORD_UPLOAD',
      createdAt: today,
      topic: 'Đề thi nhập từ file giáo viên',
      note: `Tự động tách được ${p1.length} câu trắc nghiệm đơn và ${p2.length} câu trắc nghiệm đúng sai.`,
      part1: p1,
      part2: p2,
    };

    setUploadPreviewExam(newExam);
    setUploadInfo(`Đã tách được ${p1.length} câu Phần I và ${p2.length} câu Phần II.`);
    return true;
  };

  const handlePasteSampleGraduationText = () => {
    const sample = `PHẦN I. CÂU TRẮC NGHIỆM NHIỀU PHƯƠNG ÁN LỰA CHỌN
Câu 1: Tổ chức Liên hợp quốc chính thức được thành lập vào năm nào?
A. Năm 1945.
B. Năm 1947.
C. Năm 1949.
D. Năm 1954.
Đáp án: A

Câu 2: Trong Cách mạng tháng Tám năm 1945 ở Việt Nam, địa phương nào giành được chính quyền ở tỉnh lỵ sớm nhất cả nước?
A. Hà Nội, Huế, Sài Gòn, Hải Phòng.
B. Bắc Giang, Hải Dương, Hà Tĩnh, Quảng Nam.
C. Thái Nguyên, Tuyên Quang, Cao Bằng, Lạng Sơn.
D. Quảng Ninh, Hải Phòng, Nam Định, Thanh Hóa.
Đáp án: B

PHẦN II. CÂU TRẮC NGHIỆM ĐÚNG SAI
Câu 1: Đọc đoạn tư liệu sau đây về Chiến dịch Điện Biên Phủ (1954):
"Với phương châm 'đánh chắc, tiến chắc', quân và dân ta đã chiến đấu suốt 56 ngày đêm, đập tan tập đoàn cứ điểm mạnh nhất Đông Dương của thực dân Pháp ngày 7/5/1954."
a) Chiến dịch Điện Biên Phủ diễn ra trong vòng 56 ngày đêm năm 1954. - Đúng
b) Đại tướng Võ Nguyên Giáp quyết định giữ nguyên phương châm "đánh nhanh, thắng nhanh" đến cùng. - Sai
c) Thắng lợi Điện Biên Phủ tạo điều kiện quyết định buộc Pháp ký Hiệp định Giơ-ne-vơ 1954. - Đúng
d) Chiến thắng Điện Biên Phủ chấm dứt hoàn toàn sự can thiệp của đế quốc Mỹ vào miền Nam. - Sai`;
    setUploadRawText(sample);
    setUploadTitle('Đề ôn thi thử Lịch sử 12 (Mẫu chuẩn)');
    setUploadError(null);
    setUploadInfo('Đã dán đề mẫu chuẩn gồm cả Phần I và Phần II. Cô bấm "Phân tích & Tách câu hỏi" để kiểm tra!');
  };

  const handleSaveUploadExamToLibrary = () => {
    if (!uploadPreviewExam) return;
    const finalizedExam: GraduationExamItem = {
      ...uploadPreviewExam,
      title: uploadTitle.trim() || uploadPreviewExam.title,
    };
    setExamLibrary((prev) => [finalizedExam, ...prev]);
    setActiveExamId(finalizedExam.id);
    setActiveTab('grading');
    setUploadInfo(null);
  };

  // =========================================================================
  // MANUAL QUESTION ENTRY & EXAM BUILDER STATE ("NHẬP CÂU HỎI")
  // =========================================================================
  const [manualTargetExamId, setManualTargetExamId] = useState<string>('NEW');
  const [manualTitle, setManualTitle] = useState('Đề luyện thi tốt nghiệp THPT Lịch sử 12 (Cô Thu biên soạn)');
  const [manualTopic, setManualTopic] = useState('Lịch sử Việt Nam & Thế giới (1945 - nay)');
  const [manualPart1, setManualPart1] = useState<Question[]>([]);
  const [manualPart2, setManualPart2] = useState<Question[]>([]);
  const [manualComposerType, setManualComposerType] = useState<'part1' | 'part2'>('part1');
  const [editingManualQuestion, setEditingManualQuestion] = useState<{
    part: 'part1' | 'part2';
    id: string;
  } | null>(null);
  const [manualStatusMsg, setManualStatusMsg] = useState<string | null>(null);
  const [manualErrorMsg, setManualErrorMsg] = useState<string | null>(null);
  const [autoSaveToQuestionBank, setAutoSaveToQuestionBank] = useState<boolean>(true);

  // Form states - Part I (Trắc nghiệm 4 chọn 1)
  const [m1Content, setM1Content] = useState('');
  const [m1OptA, setM1OptA] = useState('');
  const [m1OptB, setM1OptB] = useState('');
  const [m1OptC, setM1OptC] = useState('');
  const [m1OptD, setM1OptD] = useState('');
  const [m1Correct, setM1Correct] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [m1Level, setM1Level] = useState<'Nhận biết' | 'Thông hiểu' | 'Vận dụng' | 'Vận dụng cao'>('Thông hiểu');
  const [m1Explanation, setM1Explanation] = useState('');

  // Form states - Part II (Đúng/Sai có ngữ liệu)
  const [m2Content, setM2Content] = useState('');
  const [m2Topic, setM2Topic] = useState('Tư liệu lịch sử Việt Nam hiện đại');
  const [m2Statements, setM2Statements] = useState<
    { id: 'a' | 'b' | 'c' | 'd'; statement: string; isCorrect: boolean }[]
  >([
    { id: 'a', statement: '', isCorrect: true },
    { id: 'b', statement: '', isCorrect: false },
    { id: 'c', statement: '', isCorrect: true },
    { id: 'd', statement: '', isCorrect: false },
  ]);
  const [m2Explanation, setM2Explanation] = useState('');

  const resetPart1Composer = () => {
    setM1Content('');
    setM1OptA('');
    setM1OptB('');
    setM1OptC('');
    setM1OptD('');
    setM1Correct('A');
    setM1Level('Thông hiểu');
    setM1Explanation('');
    setEditingManualQuestion(null);
  };

  const resetPart2Composer = () => {
    setM2Content('');
    setM2Statements([
      { id: 'a', statement: '', isCorrect: true },
      { id: 'b', statement: '', isCorrect: false },
      { id: 'c', statement: '', isCorrect: true },
      { id: 'd', statement: '', isCorrect: false },
    ]);
    setM2Explanation('');
    setEditingManualQuestion(null);
  };

  const handleLoadExamToManual = (exam: GraduationExamItem, cloneFromMoet = false) => {
    setManualErrorMsg(null);
    if (cloneFromMoet || exam.id === defaultMoetExam.id) {
      setManualTargetExamId('NEW');
      setManualTitle(`${exam.title} (Bản chỉnh sửa)`);
    } else {
      setManualTargetExamId(exam.id);
      setManualTitle(exam.title);
    }
    setManualTopic(exam.topic);
    setManualPart1(exam.part1.map((q) => ({ ...q })));
    setManualPart2(exam.part2.map((q) => ({ ...q })));
    resetPart1Composer();
    resetPart2Composer();
    setManualStatusMsg(`Đã mở "${exam.title}" vào trình Nhập & Sửa câu hỏi.`);
    setActiveTab('manual');
  };

  const persistManualQuestionsToExamLibrary = (
    nextPart1: Question[],
    nextPart2: Question[]
  ) => {
    const today = new Date().toISOString().split('T')[0];
    const isExistingCustom =
      manualTargetExamId !== 'NEW' &&
      manualTargetExamId !== defaultMoetExam.id &&
      examLibrary.some((e) => e.id === manualTargetExamId);

    if (isExistingCustom) {
      setExamLibrary((prev) =>
        prev.map((e) =>
          e.id === manualTargetExamId
            ? {
                ...e,
                title: manualTitle.trim() || e.title,
                topic: manualTopic.trim() || e.topic,
                note: `Giáo viên nhập thủ công: ${nextPart1.length} câu Phần I + ${nextPart2.length} câu Phần II.`,
                part1: nextPart1,
                part2: nextPart2,
              }
            : e
        )
      );
      setActiveExamId(manualTargetExamId);
      return manualTargetExamId;
    }

    const newExamId = `exam_manual_${Date.now()}`;
    const newExam: GraduationExamItem = {
      id: newExamId,
      title: manualTitle.trim() || 'Đề ôn thi tốt nghiệp tự soạn',
      code: `SOẠN-${Math.floor(100 + Math.random() * 900)}`,
      source: 'CUSTOM',
      createdAt: today,
      topic: manualTopic.trim() || 'Lịch sử lớp 12',
      note: `Giáo viên nhập thủ công: ${nextPart1.length} câu Phần I + ${nextPart2.length} câu Phần II.`,
      part1: nextPart1,
      part2: nextPart2,
    };
    setExamLibrary((prev) => [newExam, ...prev]);
    setManualTargetExamId(newExamId);
    setActiveExamId(newExamId);
    return newExamId;
  };

  const handleSubmitManualPart1 = () => {
    setManualErrorMsg(null);
    setManualStatusMsg(null);

    if (!m1Content.trim()) {
      setManualErrorMsg('Cô vui lòng nhập nội dung câu hỏi Phần I trước khi lưu.');
      return;
    }
    if (!m1OptA.trim() || !m1OptB.trim() || !m1OptC.trim() || !m1OptD.trim()) {
      setManualErrorMsg('Cô vui lòng nhập đầy đủ cả 4 phương án A, B, C, D và chọn đáp án đúng.');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const cleanOpt = (letter: string, val: string) =>
      `${letter}. ${val.trim().replace(/^[A-D][.)]\s*/i, '')}`;

    if (editingManualQuestion?.part === 'part1') {
      const nextPart1 = manualPart1.map((q) =>
        q.id === editingManualQuestion.id
          ? {
              ...q,
              topic: manualTopic,
              cognitiveLevel: m1Level,
              content: m1Content.trim(),
              options: [
                cleanOpt('A', m1OptA),
                cleanOpt('B', m1OptB),
                cleanOpt('C', m1OptC),
                cleanOpt('D', m1OptD),
              ],
              correctAnswer: m1Correct,
              explanation: m1Explanation.trim() || q.explanation,
              updatedAt: today,
            }
          : q
      );
      setManualPart1(nextPart1);
      persistManualQuestionsToExamLibrary(nextPart1, manualPart2);
      setManualStatusMsg(`Đã lưu cập nhật câu hỏi Phần I (Đáp án đúng: ${m1Correct})!`);
      resetPart1Composer();
      return;
    }

    const newQ: Question = {
      id: `manual_p1_${Date.now()}_${manualPart1.length + 1}`,
      grade: 12,
      topic: manualTopic,
      lesson: `Phần I - Câu ${manualPart1.length + 1}`,
      knowledgeDomain: m1Level,
      type: 'Trắc nghiệm đơn',
      cognitiveLevel: m1Level,
      content: m1Content.trim(),
      options: [
        cleanOpt('A', m1OptA),
        cleanOpt('B', m1OptB),
        cleanOpt('C', m1OptC),
        cleanOpt('D', m1OptD),
      ],
      correctAnswer: m1Correct,
      explanation: m1Explanation.trim() || 'Căn cứ vào SGK Lịch sử 12 GDPT 2018.',
      source: 'Cô Cao Thị Thu biên soạn thủ công',
      author: 'Cô Cao Thị Thu',
      updatedAt: today,
    };

    const nextPart1 = [...manualPart1, newQ];
    setManualPart1(nextPart1);
    persistManualQuestionsToExamLibrary(nextPart1, manualPart2);
    if (autoSaveToQuestionBank) {
      const { id: _ignoredId, updatedAt: _ignoredDate, ...bankPayload } = newQ;
      addQuestion(bankPayload);
    }
    setManualStatusMsg(
      `Đã lưu Câu ${nextPart1.length} (Phần I • Đáp án ${m1Correct}) vào bộ đề${
        autoSaveToQuestionBank ? ' và Ngân hàng câu hỏi' : ''
      }!`
    );
    resetPart1Composer();
  };

  const handleSubmitManualPart2 = () => {
    setManualErrorMsg(null);
    setManualStatusMsg(null);

    if (!m2Content.trim()) {
      setManualErrorMsg('Cô vui lòng nhập đoạn trích tư liệu hoặc lời dẫn câu hỏi Phần II.');
      return;
    }
    const filledStmts = m2Statements.filter((s) => s.statement.trim().length > 0);
    if (filledStmts.length < 4) {
      setManualErrorMsg('Câu Đúng/Sai chuẩn Bộ GD&ĐT cần nhập đủ cả 4 ý nhận định a), b), c), d).');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const formattedStatements = m2Statements.map((s) => ({
      id: s.id,
      statement: s.statement.trim(),
      isCorrect: s.isCorrect,
    }));
    const answerStr = formattedStatements
      .map((s) => `${s.id}-${s.isCorrect ? 'ĐÚNG' : 'SAI'}`)
      .join(', ');

    if (editingManualQuestion?.part === 'part2') {
      const nextPart2 = manualPart2.map((q) =>
        q.id === editingManualQuestion.id
          ? {
              ...q,
              topic: m2Topic.trim() || manualTopic,
              content: m2Content.trim(),
              trueFalseStatements: formattedStatements,
              correctAnswer: answerStr,
              explanation: m2Explanation.trim() || q.explanation,
              updatedAt: today,
            }
          : q
      );
      setManualPart2(nextPart2);
      persistManualQuestionsToExamLibrary(manualPart1, nextPart2);
      setManualStatusMsg('Đã lưu cập nhật câu hỏi Đúng/Sai Phần II!');
      resetPart2Composer();
      return;
    }

    const newQ: Question = {
      id: `manual_p2_${Date.now()}_${manualPart2.length + 1}`,
      grade: 12,
      topic: m2Topic.trim() || manualTopic,
      lesson: `Phần II - Câu ${manualPart2.length + 1}`,
      knowledgeDomain: 'Trắc nghiệm đúng sai theo năng lực',
      type: 'Trắc nghiệm đúng sai',
      cognitiveLevel: 'Thông hiểu',
      content: m2Content.trim(),
      trueFalseStatements: formattedStatements,
      correctAnswer: answerStr,
      explanation: m2Explanation.trim() || 'Đối chiếu với tư liệu lịch sử và kiến thức SGK.',
      source: 'Cô Cao Thị Thu biên soạn thủ công',
      author: 'Cô Cao Thị Thu',
      updatedAt: today,
    };

    const nextPart2 = [...manualPart2, newQ];
    setManualPart2(nextPart2);
    persistManualQuestionsToExamLibrary(manualPart1, nextPart2);
    if (autoSaveToQuestionBank) {
      const { id: _ignoredId, updatedAt: _ignoredDate, ...bankPayload } = newQ;
      addQuestion(bankPayload);
    }
    setManualStatusMsg(
      `Đã lưu Câu ${nextPart2.length} (Phần II Đúng/Sai) vào bộ đề${
        autoSaveToQuestionBank ? ' và Ngân hàng câu hỏi' : ''
      }!`
    );
    resetPart2Composer();
  };

  const handleEditManualQuestionItem = (part: 'part1' | 'part2', q: Question) => {
    setManualErrorMsg(null);
    setManualStatusMsg(null);
    setEditingManualQuestion({ part, id: q.id });

    if (part === 'part1') {
      setManualComposerType('part1');
      setM1Content(q.content);
      const stripPrefix = (opt?: string) => (opt || '').replace(/^[A-D][.)]\s*/i, '').trim();
      setM1OptA(stripPrefix(q.options?.[0]));
      setM1OptB(stripPrefix(q.options?.[1]));
      setM1OptC(stripPrefix(q.options?.[2]));
      setM1OptD(stripPrefix(q.options?.[3]));
      const ans = (q.correctAnswer || 'A').toUpperCase();
      setM1Correct((['A', 'B', 'C', 'D'].includes(ans) ? ans : 'A') as 'A' | 'B' | 'C' | 'D');
      setM1Level((q.cognitiveLevel as any) || 'Thông hiểu');
      setM1Explanation(q.explanation || '');
    } else {
      setManualComposerType('part2');
      setM2Content(q.content);
      setM2Topic(q.topic || manualTopic);
      const stmts = q.trueFalseStatements || [];
      setM2Statements(
        (['a', 'b', 'c', 'd'] as const).map((id, idx) => ({
          id,
          statement: stmts[idx]?.statement || '',
          isCorrect: stmts[idx]?.isCorrect ?? (idx % 2 === 0),
        }))
      );
      setM2Explanation(q.explanation || '');
    }
  };

  const handleSaveManualExamToLibrary = (alsoImportToBank = false) => {
    setManualErrorMsg(null);
    if (manualPart1.length === 0 && manualPart2.length === 0) {
      setManualErrorMsg('Cô cần nhập ít nhất 1 câu hỏi (Phần I hoặc Phần II) trước khi lưu bộ đề.');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const isUpdatingExisting =
      manualTargetExamId !== 'NEW' &&
      manualTargetExamId !== defaultMoetExam.id &&
      examLibrary.some((e) => e.id === manualTargetExamId);

    let savedId = manualTargetExamId;
    if (isUpdatingExisting) {
      setExamLibrary((prev) =>
        prev.map((e) =>
          e.id === manualTargetExamId
            ? {
                ...e,
                title: manualTitle.trim() || e.title,
                topic: manualTopic.trim() || e.topic,
                note: `Đã cập nhật: ${manualPart1.length} câu Phần I + ${manualPart2.length} câu Phần II.`,
                part1: manualPart1,
                part2: manualPart2,
              }
            : e
        )
      );
    } else {
      savedId = `exam_manual_${Date.now()}`;
      const newExam: GraduationExamItem = {
        id: savedId,
        title: manualTitle.trim() || 'Đề ôn thi tốt nghiệp tự soạn',
        code: `SOẠN-${Math.floor(100 + Math.random() * 900)}`,
        source: 'CUSTOM',
        createdAt: today,
        topic: manualTopic.trim() || 'Lịch sử lớp 12',
        note: `Giáo viên nhập trực tiếp: ${manualPart1.length} câu Phần I + ${manualPart2.length} câu Phần II.`,
        part1: manualPart1,
        part2: manualPart2,
      };
      setExamLibrary((prev) => [newExam, ...prev]);
    }

    if (alsoImportToBank && onImportToBank) {
      onImportToBank([...manualPart1, ...manualPart2]);
    }

    setActiveExamId(savedId);
    setActiveTab('grading');
    setManualStatusMsg(null);
  };

  // Delete an exam from library (except default MOET)
  const handleDeleteExam = (id: string) => {
    if (id === defaultMoetExam.id) {
      alert('Không thể xóa Đề tham khảo chuẩn Bộ GD&ĐT 2025 mặc định.');
      return;
    }
    if (confirm('Cô có chắc chắn muốn xóa bộ đề thi này khỏi thư viện?')) {
      setExamLibrary((prev) => prev.filter((e) => e.id !== id));
      if (activeExamId === id) {
        setActiveExamId(defaultMoetExam.id);
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="CHỖ LUYỆN ĐỀ THI ÔN THI TỐT NGHIỆP THPT LỚP 12 MÔN LỊCH SỬ"
      maxWidth="6xl"
    >
      <div className="space-y-4 text-xs font-sans">
        {/* Ministry Standard Badge & Summary Header */}
        <div className="p-4 bg-gradient-to-r from-[#073B66] via-[#0878C9] to-sky-700 text-white rounded-2xl shadow-sm space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-amber-400 text-slate-900 font-extrabold px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider shadow-xs">
                  Quyết định 764/QĐ-BGDĐT 2025
                </span>
                <span className="bg-white/20 text-white px-2 py-0.5 rounded text-[10px] font-medium">
                  {currentExam.code}
                </span>
                <span className="bg-emerald-500 text-white px-2 py-0.5 rounded text-[10px] font-bold">
                  Thang điểm chuẩn: 10,0
                </span>
                <span className="bg-purple-500 text-white px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-200" />
                  AI Tự soạn từ tư liệu
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold tracking-tight">
                {currentExam.title}
              </h3>
              <p className="text-sky-100 text-[11px]">
                {currentExam.topic} • Giáo viên: Cô Cao Thị Thu (Phân hiệu Tiên Yên)
              </p>
            </div>

            {/* Quick Live Score Badge */}
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20 shrink-0 text-center min-w-[170px]">
              <div className="text-[10px] uppercase font-bold text-sky-200">Tổng điểm tự động</div>
              <div className="text-2xl font-black text-amber-300">
                {scoreResult.totalScore.toFixed(2)}{' '}
                <span className="text-xs font-normal text-white/80">/ 10,0</span>
              </div>
              <div className="text-[10px] font-semibold text-white/90">
                {scoreResult.evaluationText}
              </div>
            </div>
          </div>

          {/* Quick Specifications Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-white/15 text-[11px]">
            <div className="bg-black/15 px-3 py-1.5 rounded-lg flex items-center justify-between">
              <span>Phần I: Trắc nghiệm 4 chọn 1</span>
              <strong className="text-amber-300">
                {part1Questions.length} câu × 0,25đ = {(part1Questions.length * 0.25).toFixed(1)}đ
              </strong>
            </div>
            <div className="bg-black/15 px-3 py-1.5 rounded-lg flex items-center justify-between">
              <span>Phần II: Đúng/Sai bậc thang</span>
              <strong className="text-amber-300">
                {part2Questions.length} câu × 1,0đ = {(part2Questions.length * 1.0).toFixed(1)}đ
              </strong>
            </div>
            <div className="bg-black/15 px-3 py-1.5 rounded-lg flex items-center justify-between">
              <span>Barem Đúng/Sai của Bộ</span>
              <strong className="text-sky-200">1: 0.1đ | 2: 0.25đ | 3: 0.5đ | 4: 1.0đ</strong>
            </div>
          </div>
        </div>

        {/* 6 Tabs Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2 no-print">
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Tab 1: Library */}
            <button
              onClick={() => setActiveTab('library')}
              className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                activeTab === 'library'
                  ? 'bg-sky-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <FolderOpen className="w-4 h-4" />
              Thư viện đề ({examLibrary.length})
            </button>

            {userRole !== 'student' && (
              <>
                {/* Tab 2: AI Generator */}
                <button
                  onClick={() => setActiveTab('ai-studio')}
                  className={`px-3 py-2 rounded-xl font-extrabold flex items-center gap-1.5 cursor-pointer transition-all ${
                    activeTab === 'ai-studio'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs'
                      : 'bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  AI Soạn đề từ tư liệu
                </button>

                {/* Tab 3: Upload Word */}
                <button
                  onClick={() => setActiveTab('upload')}
                  className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                    activeTab === 'upload'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  Tải lên đề từ Word
                </button>

                {/* Tab 4: Manual Question Entry ("Nhập câu hỏi thủ công") */}
                <button
                  onClick={() => setActiveTab('manual')}
                  className={`px-3.5 py-2 rounded-xl font-extrabold flex items-center gap-1.5 cursor-pointer transition-all ${
                    activeTab === 'manual'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-teal-50 text-teal-800 border border-teal-300 hover:bg-teal-100'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  Nhập câu hỏi thủ công
                </button>
              </>
            )}

            {/* Tab 4: Grading Room */}
            <button
              onClick={() => setActiveTab('grading')}
              className={`px-3.5 py-2 rounded-xl font-extrabold flex items-center gap-1.5 cursor-pointer transition-all ${
                activeTab === 'grading'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <Calculator className="w-4 h-4 text-emerald-600" />
              Phòng Luyện thi & Chấm điểm (Thang 10)
            </button>

            {/* Tab 5: Complete Exam */}
            <button
              onClick={() => setActiveTab('exam')}
              className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                activeTab === 'exam'
                  ? 'bg-[#073B66] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              Xem & In đề thi
            </button>

            {/* Tab 6: Key (Teacher only) */}
            {userRole !== 'student' && (
              <button
                onClick={() => setActiveTab('key')}
                className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                  activeTab === 'key'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <CheckSquare className="w-4 h-4" />
                Đáp án & Barem
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsStudentExamRoomOpen(true)}
              className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              title="Mở phòng làm bài thi trực tuyến có đếm ngược thời gian và chấm điểm chi tiết tự động cho học sinh"
            >
              <Award className="w-4 h-4 text-amber-200" />
              Làm bài thi (Học sinh)
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              In đề thi
            </button>

            {onImportToBank && userRole !== 'student' && (
              <button
                onClick={() => {
                  const allQ = [...part1Questions, ...part2Questions];
                  onImportToBank(allQ);
                  alert(`Đã lưu ${allQ.length} câu hỏi của bộ đề này vào Ngân hàng câu hỏi!`);
                }}
                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                title="Lưu trọn bộ câu hỏi này vào Ngân hàng câu hỏi của Trung tâm"
              >
                <Layers className="w-4 h-4" />
                Lưu vào Ngân hàng
              </button>
            )}
          </div>
        </div>

        {/* =========================================================================
            TAB 1: EXAM LIBRARY
           ========================================================================= */}
        {activeTab === 'library' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-sky-50/60 rounded-2xl border border-sky-200">
              <div>
                <h4 className="font-bold text-[#073B66] text-sm flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-[#0878C9]" />
                  Kho Đề Ôn Thi Tốt Nghiệp THPT Môn Lịch Sử (Lớp 12 GDTX)
                </h4>
                <p className="text-slate-600 text-xs mt-0.5">
                  Quản lý các bộ đề thi thử: đề chuẩn Bộ GD&ĐT, đề AI tự soạn theo tư liệu, và đề tải lên từ file Word của cô.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {userRole !== 'student' && (
                  <>
                    <button
                      onClick={() => setActiveTab('manual')}
                      className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Nhập câu hỏi thủ công
                    </button>
                    <button
                      onClick={() => setActiveTab('ai-studio')}
                      className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Soạn đề bằng AI
                    </button>
                    <button
                      onClick={() => setActiveTab('upload')}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Tải đề từ Word
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {examLibrary.map((item) => {
                const isActive = item.id === activeExamId;
                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isActive
                        ? 'bg-sky-50/40 border-[#0878C9] shadow-sm ring-2 ring-sky-300'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            item.source === 'BGDDT_2025'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : item.source === 'AI_GENERATED'
                              ? 'bg-purple-100 text-purple-900 border border-purple-300'
                              : 'bg-indigo-100 text-indigo-900 border border-indigo-300'
                          }`}
                        >
                          {item.source === 'BGDDT_2025'
                            ? 'Chuẩn Bộ 2025'
                            : item.source === 'AI_GENERATED'
                            ? 'AI Soạn từ tư liệu'
                            : 'Nhập từ Word'}
                        </span>
                        <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-bold">
                          {item.code}
                        </span>
                        <span className="text-[10px] text-slate-400">{item.createdAt}</span>
                      </div>

                      {item.id !== defaultMoetExam.id && (
                        <button
                          onClick={() => handleDeleteExam(item.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                          title="Xóa đề này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <h5 className="font-bold text-slate-900 text-xs line-clamp-1">{item.title}</h5>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 italic font-serif">
                      {item.note || item.topic}
                    </p>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-3 text-slate-600">
                        <span>
                          Phần I: <strong>{item.part1.length} câu</strong>
                        </span>
                        <span>
                          Phần II: <strong>{item.part2.length} câu</strong>
                        </span>
                        <span className="text-emerald-700 font-bold">Tổng 10,0đ</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {userRole !== 'student' && (
                          <button
                            onClick={() => handleLoadExamToManual(item)}
                            className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-lg font-bold text-[11px] cursor-pointer flex items-center gap-1"
                            title="Mở bộ đề này để thêm hoặc chỉnh sửa từng câu hỏi"
                          >
                            <Edit3 className="w-3 h-3" />
                            Sửa / Thêm câu
                          </button>
                        )}
                        <button
                          onClick={() => handleSelectExam(item.id, 'exam')}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-[11px] cursor-pointer"
                        >
                          Xem đề
                        </button>
                        <button
                          onClick={() => handleSelectExam(item.id, 'grading')}
                          className={`px-3 py-1 rounded-lg font-extrabold text-[11px] cursor-pointer shadow-xs transition-colors ${
                            isActive
                              ? 'bg-emerald-600 text-white'
                              : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900'
                          }`}
                        >
                          {isActive ? '✓ Đang luyện tập' : 'Luyện đề này'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: AI EXAM GENERATOR (FROM TEACHER-PROVIDED DATA)
           ========================================================================= */}
        {activeTab === 'ai-studio' && (
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-purple-900 via-indigo-900 to-[#073B66] text-white rounded-2xl shadow-sm space-y-2">
              <div className="flex items-center gap-2">
                <span className="bg-amber-400 text-slate-900 px-2 py-0.5 rounded-full text-[10px] font-black uppercase">
                  Trợ lý AI Sư phạm Lịch sử
                </span>
                <span className="bg-white/20 text-white px-2 py-0.5 rounded text-[10px]">
                  Mô hình Gemini 3.8 Flash
                </span>
              </div>
              <h4 className="text-base font-bold">
                Tự động soạn đề thi tốt nghiệp THPT chuẩn cấu trúc 2025 từ tư liệu cô cung cấp
              </h4>
              <p className="text-purple-200 text-xs leading-relaxed">
                Cô chỉ cần dán bài giảng, văn bản tài liệu, sách giáo khoa hoặc trích đoạn sự kiện lịch sử vào ô bên dưới. AI sẽ tự động phân tích và tạo trọn vẹn 24 câu trắc nghiệm đơn (0,25đ/câu) và 4 câu Đúng/Sai dựa trên tư liệu theo đúng barem chính thức của Bộ GD&ĐT!
              </p>
            </div>

            {/* Quick Sample Presets */}
            <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 space-y-1.5">
              <span className="text-[11px] font-bold text-purple-900 uppercase">
                Tư liệu mẫu tham khảo nhanh (Cô có thể bấm vào để thử nghiệm ngay):
              </span>
              <div className="flex flex-wrap gap-2">
                {sampleDataPresets.map((pr, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(pr)}
                    className="px-2.5 py-1 bg-white hover:bg-purple-100 text-purple-900 border border-purple-300 rounded-lg text-xs font-medium cursor-pointer transition-colors shadow-2xs flex items-center gap-1"
                  >
                    <BookMarked className="w-3 h-3 text-purple-600" />
                    {pr.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3 p-4 bg-white rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tiêu đề đề thi:
                  </label>
                  <input
                    type="text"
                    value={aiExamTitle}
                    onChange={(e) => setAiExamTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="Ví dụ: Đề ôn thi tốt nghiệp THPT Lịch sử - Chuyên đề Cách mạng 1945"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Chủ đề kiến thức:
                  </label>
                  <input
                    type="text"
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="Ví dụ: Lịch sử Việt Nam từ 1919 đến 1975"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Số câu Phần I (4 chọn 1):
                    </label>
                    <select
                      value={aiNumPart1}
                      onChange={(e) => setAiNumPart1(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-purple-500 outline-none"
                    >
                      <option value={24}>24 câu (Chuẩn Bộ - 6,0đ)</option>
                      <option value={12}>12 câu (Rút gọn - 3,0đ)</option>
                      <option value={20}>20 câu (5,0đ)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Số câu Phần II (Đúng/Sai tư liệu):
                    </label>
                    <select
                      value={aiNumPart2}
                      onChange={(e) => setAiNumPart2(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-purple-500 outline-none"
                    >
                      <option value={4}>4 câu (Chuẩn Bộ - 4,0đ)</option>
                      <option value={2}>2 câu (2,0đ)</option>
                      <option value={6}>6 câu (6,0đ)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ghi chú sư phạm & yêu cầu nâng cao:
                  </label>
                  <input
                    type="text"
                    value={aiNotes}
                    onChange={(e) => setAiNotes(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="Ví dụ: Thêm câu hỏi liên hệ thực tế, bám sát học viên GDTX Tiên Yên..."
                  />
                </div>
              </div>

              {/* Source Text Input */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2 flex flex-col">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-purple-900 uppercase flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-purple-600" />
                    Tư liệu / Dữ liệu cô giáo cung cấp để AI soạn đề:
                  </label>
                  {aiSourceText && (
                    <button
                      onClick={() => setAiSourceText('')}
                      className="text-[11px] text-rose-600 hover:underline cursor-pointer"
                    >
                      Xóa nội dung
                    </button>
                  )}
                </div>

                <textarea
                  value={aiSourceText}
                  onChange={(e) => setAiSourceText(e.target.value)}
                  rows={8}
                  className="w-full flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-serif leading-relaxed focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="Cô dán nội dung bài học SGK, tư liệu trích dẫn, mốc niên đại, hoặc bài giảng cô muốn học sinh ôn tập tại đây... (Ví dụ: đoạn trích Tuyên ngôn Độc lập, diễn biến chiến dịch, văn kiện Đại hội Đảng...)"
                />

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-400">
                    Độ dài: {aiSourceText.length} ký tự
                  </span>
                  <button
                    onClick={handleGenerateExamWithAi}
                    disabled={isGeneratingAi}
                    className={`px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-extrabold text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all ${
                      isGeneratingAi ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {isGeneratingAi ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                        <span>Đang xử lý...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>AI Tự Soạn Đề Thi Ngay</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Loading / Status Display */}
            {isGeneratingAi && (
              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 flex items-center gap-3 text-purple-900 text-xs font-bold animate-pulse">
                <RefreshCw className="w-5 h-5 animate-spin text-purple-600 shrink-0" />
                <div>
                  <div className="text-sm font-bold">Hệ thống AI đang xử lý tư liệu của cô...</div>
                  <div className="text-[11px] font-normal text-purple-700">{aiGenerationStatus}</div>
                </div>
              </div>
            )}

            {/* Generated Exam Preview Card */}
            {aiGeneratedExamPreview && (
              <div className="p-5 bg-white rounded-2xl border-2 border-purple-400 shadow-md space-y-4 animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-purple-200">
                  <div>
                    <span className="bg-purple-100 text-purple-900 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase">
                      Kết quả AI soạn thảo
                    </span>
                    <h5 className="text-sm font-bold text-slate-900 mt-1">
                      {aiGeneratedExamPreview.title}
                    </h5>
                    <p className="text-xs text-slate-500">
                      Đã hoàn thành {aiGeneratedExamPreview.part1.length} câu Phần I (6,0đ) và{' '}
                      {aiGeneratedExamPreview.part2.length} câu Đúng/Sai tư liệu Phần II (4,0đ).
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveAiExamToLibrary}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      Lưu vào Thư viện & Bắt đầu Luyện thi
                    </button>
                  </div>
                </div>

                {/* Question Samples */}
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  <div className="font-bold text-[#073B66] text-xs uppercase pb-1 border-b border-slate-200">
                    Mẫu một số câu hỏi trắc nghiệm vừa được AI tạo:
                  </div>
                  {aiGeneratedExamPreview.part1.slice(0, 3).map((q, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      <div className="font-bold text-slate-800">
                        <span className="text-[#0878C9]">Câu {idx + 1}:</span> {q.content}
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 mt-2 pl-2">
                        {q.options?.map((opt, oi) => (
                          <div
                            key={oi}
                            className={`p-1 rounded text-[11px] ${
                              opt.startsWith(q.correctAnswer)
                                ? 'font-bold text-emerald-800 bg-emerald-50'
                                : 'text-slate-600'
                            }`}
                          >
                            {opt}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {aiGeneratedExamPreview.part2.slice(0, 1).map((q, idx) => (
                    <div key={idx} className="p-3 bg-purple-50/60 rounded-xl border border-purple-200 text-xs">
                      <div className="font-bold text-purple-900 mb-1">
                        Câu Đúng/Sai dựa trên đoạn trích:
                      </div>
                      <p className="italic font-serif text-slate-700 text-[11px] bg-white p-2 rounded-lg border border-purple-100">
                        "{q.content}"
                      </p>
                      <div className="space-y-1 mt-2">
                        {q.trueFalseStatements?.map((stmt) => (
                          <div
                            key={stmt.id}
                            className="flex items-center justify-between text-[11px] p-1.5 bg-white rounded border border-slate-200"
                          >
                            <span>
                              <strong>{stmt.id})</strong> {stmt.statement}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                stmt.isCorrect
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {stmt.isCorrect ? 'ĐÚNG' : 'SAI'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 3: UPLOAD FROM WORD OR RAW TEXT / PDF / IMAGE FALLBACKS
           ========================================================================= */}
        {activeTab === 'upload' && (
          <div className="space-y-4">
            <div className="p-4 bg-indigo-50/80 rounded-2xl border border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <h4 className="font-bold text-indigo-900 text-sm flex items-center gap-2">
                  <Upload className="w-4 h-4 text-indigo-700" />
                  Tải lên đề thi từ Word (.docx/.doc), PDF, Ảnh chụp hoặc Dán văn bản
                </h4>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Hệ thống tự động tách câu hỏi <strong>Phần I (4 chọn 1)</strong> và <strong>Phần II (Đúng/Sai tư liệu)</strong>. Nếu máy tính/điện thoại không tải được file Word, cô có thể dán trực tiếp văn bản, tải ảnh chụp đề, hoặc bấm <strong>Nhập câu hỏi</strong> từng câu.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={downloadWordTemplate}
                  className="px-3 py-2 bg-white hover:bg-slate-100 text-indigo-800 border border-indigo-200 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  Tải file Word mẫu
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('manual')}
                  className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Nhập câu hỏi thủ công
                </button>
              </div>
            </div>

            {/* Inline Error & Instant Fallback Guidance */}
            {uploadError && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 space-y-2.5">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="text-xs whitespace-pre-line leading-relaxed font-medium">
                    {uploadError}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 pl-6">
                  <button
                    type="button"
                    onClick={() => uploadTextareaRef.current?.focus()}
                    className="px-3 py-1.5 bg-white hover:bg-rose-100 text-rose-900 border border-rose-300 rounded-lg font-bold text-[11px] flex items-center gap-1.5 cursor-pointer"
                  >
                    <ClipboardPaste className="w-3.5 h-3.5" />
                    Chuyển sang Copy & Dán văn bản
                  </button>
                  {uploadRawText.trim() && (
                    <button
                      type="button"
                      onClick={() => handleAiParseFallback()}
                      disabled={isAiParsingUpload}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                      AI Tự động tách từ văn bản đã dán
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setActiveTab('manual')}
                    className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Mở form Nhập câu hỏi trực tiếp
                  </button>
                </div>
              </div>
            )}

            {/* Status / Success Banner */}
            {uploadInfo && !uploadError && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{uploadInfo}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* File upload box with Drag & Drop + PDF/Image support */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingUpload(true);
                }}
                onDragLeave={() => setIsDraggingUpload(false)}
                onDrop={async (e) => {
                  e.preventDefault();
                  setIsDraggingUpload(false);
                  const droppedFile = e.dataTransfer.files?.[0];
                  if (droppedFile) {
                    await handleProcessUploadedFile(droppedFile);
                  }
                }}
                className={`p-5 bg-white rounded-2xl border-2 border-dashed transition-colors flex flex-col items-center justify-center text-center space-y-3 ${
                  isDraggingUpload
                    ? 'border-indigo-500 bg-indigo-50/40'
                    : 'border-indigo-200 hover:border-indigo-400'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  {isReadingFile || isAiParsingUpload ? (
                    <RefreshCw className="w-6 h-6 animate-spin" />
                  ) : (
                    <Upload className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h5 className="font-bold text-slate-800 text-xs">
                    Kéo thả hoặc chọn file Word (.docx, .doc), PDF hoặc Ảnh đề thi
                  </h5>
                  <p className="text-slate-500 text-[11px] mt-1 leading-relaxed">
                    Hỗ trợ <strong>.docx, .doc (HTML), .txt, .rtf</strong> và nhận diện thông minh <strong>.pdf, .jpg, .png</strong> qua AI.
                  </p>
                </div>

                <label className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs cursor-pointer shadow-xs transition-colors flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isReadingFile ? 'Đang đọc file...' : 'Chọn file từ máy tính / điện thoại'}</span>
                  <input
                    type="file"
                    accept=".docx,.doc,.txt,.rtf,.html,.htm,.pdf,.png,.jpg,.jpeg,.webp"
                    onChange={handleUploadFileChange}
                    className="hidden"
                  />
                </label>

                {uploadFile && (
                  <div className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg">
                    ✓ Đã chọn: {uploadFile.name}
                  </div>
                )}

                <div className="w-full pt-2 border-t border-slate-100 text-left space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-700">
                    Phương án dự phòng nếu không tải được file Word:
                  </div>
                  <ul className="text-[11px] text-slate-600 space-y-1 list-disc pl-4">
                    <li>
                      <strong>File .doc đời cũ (97–2003):</strong> Mở Word → nhấn <kbd className="px-1 bg-slate-100 border border-slate-300 rounded">Ctrl+A</kbd> → <kbd className="px-1 bg-slate-100 border border-slate-300 rounded">Ctrl+C</kbd> và dán vào ô bên phải.
                    </li>
                    <li>
                      <strong>Chỉ có đề giấy / PDF / Zalo:</strong> Chụp ảnh đề thi hoặc chọn file PDF ở nút trên để AI tự bóc tách.
                    </li>
                    <li>
                      <strong>Muốn soạn nhanh không cần file:</strong> Bấm tab <button type="button" onClick={() => setActiveTab('manual')} className="text-teal-700 font-bold underline cursor-pointer">Nhập câu hỏi</button> để gõ từng câu.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Paste Text Box + AI Smart Extract Fallback (Phương án 1) */}
              <div className="p-4 bg-white rounded-2xl border border-indigo-200 space-y-2.5 flex flex-col">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                    <ClipboardPaste className="w-3.5 h-3.5 text-indigo-600" />
                    Phương án 1 (Khi Word lỗi): Copy & Dán toàn bộ văn bản đề thi
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePasteSampleGraduationText}
                      className="text-[11px] font-bold text-indigo-700 hover:underline cursor-pointer"
                    >
                      + Dán đề mẫu chuẩn
                    </button>
                    {uploadRawText && (
                      <button
                        type="button"
                        onClick={() => {
                          setUploadRawText('');
                          setUploadError(null);
                          setUploadInfo(null);
                        }}
                        className="text-[11px] text-slate-400 hover:text-rose-600 cursor-pointer"
                      >
                        Xóa trắng
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="Tên bộ đề thi..."
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <textarea
                  ref={uploadTextareaRef}
                  value={uploadRawText}
                  onChange={(e) => setUploadRawText(e.target.value)}
                  rows={8}
                  className="w-full flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-serif leading-relaxed focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Dán nội dung đề thi từ Word / PDF / Zalo vào đây... Hỗ trợ cả bảng đáp án ở cuối đề và các phương án xếp ngang (A. ... B. ... C. ... D. ...)."
                />

                <div className="flex flex-wrap items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => handleAiParseFallback()}
                    disabled={isAiParsingUpload}
                    className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-300 rounded-xl font-bold text-xs cursor-pointer transition-colors flex items-center gap-1.5 disabled:opacity-60"
                    title="Dùng AI tự tách nếu văn bản bị mất định dạng hoặc lộn xộn"
                  >
                    <Wand2 className="w-3.5 h-3.5 text-purple-600" />
                    {isAiParsingUpload ? 'AI đang tách...' : 'AI Tự động tách câu hỏi'}
                  </button>
                  <button
                    type="button"
                    onClick={() => processImportedText(uploadRawText, uploadTitle)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs cursor-pointer shadow-xs transition-colors"
                  >
                    Phân tích & Tách câu hỏi
                  </button>
                </div>
              </div>
            </div>

            {/* Uploaded Preview with Edit / Delete / Quick Key Fix */}
            {uploadPreviewExam && (
              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-200">
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs">
                      {uploadTitle || uploadPreviewExam.title}
                    </h5>
                    <p className="text-[11px] text-slate-500">{uploadPreviewExam.note}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleLoadExamToManual({ ...uploadPreviewExam, title: uploadTitle }, false)}
                      className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Chỉnh sửa / Nhập thêm câu
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveUploadExamToLibrary}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Lưu vào Thư viện đề thi
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-sky-50 rounded-xl border border-sky-200">
                    <span className="font-bold text-[#073B66]">
                      Phần I (Trắc nghiệm đơn): {uploadPreviewExam.part1.length} câu
                    </span>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
                    <span className="font-bold text-purple-900">
                      Phần II (Đúng/Sai tư liệu): {uploadPreviewExam.part2.length} câu
                    </span>
                  </div>
                </div>

                {/* Compact list of parsed questions for fast verification */}
                <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                  {uploadPreviewExam.part1.map((q, idx) => (
                    <div
                      key={q.id}
                      className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-[#0878C9]">Phần I - Câu {idx + 1}:</span>{' '}
                        <span className="text-slate-800 font-serif">{q.content}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {(['A', 'B', 'C', 'D'] as const).map((letter) => (
                          <button
                            key={letter}
                            type="button"
                            onClick={() =>
                              setUploadPreviewExam((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      part1: prev.part1.map((item) =>
                                        item.id === q.id ? { ...item, correctAnswer: letter } : item
                                      ),
                                    }
                                  : prev
                              )
                            }
                            className={`w-7 h-7 rounded-lg font-bold text-[11px] cursor-pointer ${
                              q.correctAnswer === letter
                                ? 'bg-emerald-600 text-white'
                                : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {letter}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() =>
                            setUploadPreviewExam((prev) =>
                              prev
                                ? { ...prev, part1: prev.part1.filter((item) => item.id !== q.id) }
                                : prev
                            )
                          }
                          className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer"
                          title="Xóa câu này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {uploadPreviewExam.part2.map((q, idx) => (
                    <div
                      key={q.id}
                      className="p-2.5 bg-purple-50/40 rounded-xl border border-purple-200 flex items-start justify-between gap-2"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-purple-800">Phần II - Câu {idx + 1}:</span>{' '}
                        <span className="text-slate-800 font-serif line-clamp-2">{q.content}</span>
                        <div className="text-[11px] text-purple-700 font-semibold mt-0.5">
                          Đáp án: {q.correctAnswer}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setUploadPreviewExam((prev) =>
                            prev
                              ? { ...prev, part2: prev.part2.filter((item) => item.id !== q.id) }
                              : prev
                          )
                        }
                        className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer shrink-0"
                        title="Xóa câu này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 3B: MANUAL QUESTION ENTRY & EXAM COMPOSER ("NHẬP CÂU HỎI")
           ========================================================================= */}
        {activeTab === 'manual' && userRole !== 'student' && (
          <div className="space-y-4">
            {/* Header & Exam Metadata */}
            <div className="p-4 bg-teal-50/80 rounded-2xl border border-teal-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-bold text-teal-950 text-sm flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-teal-700" />
                    Nhập Câu Hỏi Trực Tiếp & Biên Soạn Bộ Đề Ôn Thi Tốt Nghiệp (Không Cần File Word)
                  </h4>
                  <p className="text-slate-600 text-xs mt-0.5">
                    Cô nhập từng câu Phần I (4 chọn 1) hoặc Phần II (Đúng/Sai có tư liệu) vào bản nháp bên dưới, sau đó bấm lưu thẳng vào Thư viện & Ngân hàng câu hỏi.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <select
                    value={manualTargetExamId}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'NEW') {
                        setManualTargetExamId('NEW');
                        setManualTitle('Đề luyện thi tốt nghiệp THPT Lịch sử 12 (Cô Thu biên soạn)');
                        setManualPart1([]);
                        setManualPart2([]);
                      } else {
                        const found = examLibrary.find((ex) => ex.id === val);
                        if (found) handleLoadExamToManual(found);
                      }
                    }}
                    className="px-3 py-2 bg-white border border-teal-300 rounded-xl text-xs font-bold text-teal-900 cursor-pointer"
                  >
                    <option value="NEW">+ Tạo bộ đề thi mới hoàn toàn</option>
                    {examLibrary.map((ex) => (
                      <option key={ex.id} value={ex.id}>
                        {ex.id === defaultMoetExam.id
                          ? `Nhân bản để sửa: ${ex.code}`
                          : `Chỉnh sửa / Thêm câu: ${ex.title.slice(0, 38)}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Tên bộ đề thi:
                  </label>
                  <input
                    type="text"
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-teal-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Ví dụ: Đề ôn tập Chuyên đề Cách mạng tháng Tám - Lớp 12"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Chủ đề / Phạm vi kiến thức:
                  </label>
                  <input
                    type="text"
                    value={manualTopic}
                    onChange={(e) => setManualTopic(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-teal-200 rounded-xl text-xs text-slate-800 outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Ví dụ: Lịch sử Việt Nam từ 1945 đến nay"
                  />
                </div>
              </div>
            </div>

            {manualErrorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{manualErrorMsg}</span>
              </div>
            )}

            {manualStatusMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{manualStatusMsg}</span>
              </div>
            )}

            {/* Two-Column Workspace: Left = Question Form, Right = Draft Questions List */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* LEFT: Composer Form */}
              <div className="lg:col-span-7 p-4 bg-white rounded-2xl border border-slate-200 space-y-3.5">
                {/* Switch Phần I / Phần II */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-200">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setManualComposerType('part1');
                        setManualErrorMsg(null);
                      }}
                      className={`px-3.5 py-2 rounded-xl font-bold text-xs cursor-pointer transition-all ${
                        manualComposerType === 'part1'
                          ? 'bg-[#073B66] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Phần I: Trắc nghiệm 4 chọn 1
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setManualComposerType('part2');
                        setManualErrorMsg(null);
                      }}
                      className={`px-3.5 py-2 rounded-xl font-bold text-xs cursor-pointer transition-all ${
                        manualComposerType === 'part2'
                          ? 'bg-purple-700 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Phần II: Đúng / Sai tư liệu
                    </button>
                  </div>

                  {editingManualQuestion && (
                    <button
                      type="button"
                      onClick={() => {
                        resetPart1Composer();
                        resetPart2Composer();
                      }}
                      className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                    >
                      Hủy chế độ sửa câu
                    </button>
                  )}
                </div>

                {/* COMPOSER PART 1 */}
                {manualComposerType === 'part1' ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nội dung câu hỏi (Phần I):
                      </label>
                      <textarea
                        rows={3}
                        value={m1Content}
                        onChange={(e) => setM1Content(e.target.value)}
                        placeholder="Ví dụ: Hội nghị I-an-ta (tháng 2/1945) được triệu tập với sự tham dự của nguyên thủ ba cường quốc nào?"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-serif leading-relaxed outline-none focus:ring-2 focus:ring-[#0878C9] focus:bg-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">
                          Nhập 4 phương án A, B, C, D:
                        </span>
                        <span className="text-[11px] font-bold text-emerald-700">
                          Đáp án đang chọn: {m1Correct}
                        </span>
                      </div>

                      {(
                        [
                          { key: 'A', val: m1OptA, setter: setM1OptA },
                          { key: 'B', val: m1OptB, setter: setM1OptB },
                          { key: 'C', val: m1OptC, setter: setM1OptC },
                          { key: 'D', val: m1OptD, setter: setM1OptD },
                        ] as const
                      ).map((opt) => {
                        const isRight = m1Correct === opt.key;
                        return (
                          <div
                            key={opt.key}
                            className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                              isRight
                                ? 'bg-emerald-50 border-emerald-400'
                                : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => setM1Correct(opt.key)}
                              className={`w-9 h-9 rounded-lg font-black text-xs shrink-0 cursor-pointer transition-colors ${
                                isRight
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                              }`}
                              title={`Đặt ${opt.key} làm đáp án đúng`}
                            >
                              {opt.key}
                            </button>
                            <input
                              type="text"
                              value={opt.val}
                              onChange={(e) => opt.setter(e.target.value)}
                              placeholder={`Nhập nội dung phương án ${opt.key}...`}
                              className="flex-1 bg-transparent border-none outline-none text-xs font-serif text-slate-900"
                            />
                            {isRight && (
                              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded shrink-0">
                                Đáp án đúng
                              </span>
                            )}
                          </div>
                        );
                      })}

                      {/* Explicit Answer Selector Bar */}
                      <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                          <CheckSquare className="w-4 h-4 text-emerald-700" />
                          Chọn đáp án đúng cho câu hỏi này (*):
                        </span>
                        <div className="flex items-center gap-1.5">
                          {(['A', 'B', 'C', 'D'] as const).map((letter) => (
                            <button
                              key={letter}
                              type="button"
                              onClick={() => setM1Correct(letter)}
                              className={`px-3.5 py-2 rounded-xl font-black text-xs cursor-pointer transition-all ${
                                m1Correct === letter
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Mức độ nhận thức:
                        </label>
                        <select
                          value={m1Level}
                          onChange={(e) => setM1Level(e.target.value as any)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                        >
                          <option value="Nhận biết">Nhận biết</option>
                          <option value="Thông hiểu">Thông hiểu</option>
                          <option value="Vận dụng">Vận dụng</option>
                          <option value="Vận dụng cao">Vận dụng cao</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Giải thích đáp án (tùy chọn):
                        </label>
                        <input
                          type="text"
                          value={m1Explanation}
                          onChange={(e) => setM1Explanation(e.target.value)}
                          placeholder="Gợi ý giải thích ngắn gọn..."
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={autoSaveToQuestionBank}
                          onChange={(e) => setAutoSaveToQuestionBank(e.target.checked)}
                          className="w-4 h-4 accent-teal-600 rounded cursor-pointer"
                        />
                        <span>Đồng thời lưu vào Ngân hàng câu hỏi</span>
                      </label>

                      <button
                        type="button"
                        onClick={handleSubmitManualPart1}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Save className="w-4 h-4" />
                        {editingManualQuestion?.part === 'part1'
                          ? 'Lưu cập nhật câu hỏi'
                          : 'Lưu câu hỏi'}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* COMPOSER PART 2 */
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Đoạn trích tư liệu / Lời dẫn câu hỏi (Phần II):
                      </label>
                      <textarea
                        rows={4}
                        value={m2Content}
                        onChange={(e) => setM2Content(e.target.value)}
                        placeholder='Ví dụ: Đọc đoạn trích sau trong Tuyên ngôn Độc lập (2/9/1945): "Nước Việt Nam có quyền hưởng tự do và độc lập..."'
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-serif leading-relaxed outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="p-3 bg-purple-50/80 rounded-xl border border-purple-200 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                          <CheckSquare className="w-4 h-4 text-purple-700" />
                          Chọn đáp án Đúng / Sai cho 4 ý nhận định a, b, c, d (*):
                        </span>
                        <span className="text-[11px] font-bold text-purple-800">
                          Đáp án đang chọn:{' '}
                          {m2Statements.map((s) => `${s.id}-${s.isCorrect ? 'Đúng' : 'Sai'}`).join(', ')}
                        </span>
                      </div>
                      {m2Statements.map((stmt, idx) => (
                        <div
                          key={stmt.id}
                          className="p-2 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center gap-2"
                        >
                          <div className="flex items-center gap-2 flex-1">
                            <span className="w-7 h-7 rounded-lg bg-purple-100 text-purple-900 font-black text-xs flex items-center justify-center shrink-0">
                              {stmt.id})
                            </span>
                            <input
                              type="text"
                              value={stmt.statement}
                              onChange={(e) => {
                                const val = e.target.value;
                                setM2Statements((prev) =>
                                  prev.map((item, i) => (i === idx ? { ...item, statement: val } : item))
                                );
                              }}
                              placeholder={`Nhập nhận định ${stmt.id}...`}
                              className="flex-1 bg-transparent border-none outline-none text-xs font-serif text-slate-900"
                            />
                          </div>

                          <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                            <button
                              type="button"
                              onClick={() =>
                                setM2Statements((prev) =>
                                  prev.map((item, i) => (i === idx ? { ...item, isCorrect: true } : item))
                                )
                              }
                              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer ${
                                stmt.isCorrect
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-white border border-slate-300 text-slate-600 hover:bg-emerald-50'
                              }`}
                            >
                              Đúng
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setM2Statements((prev) =>
                                  prev.map((item, i) => (i === idx ? { ...item, isCorrect: false } : item))
                                )
                              }
                              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer ${
                                !stmt.isCorrect
                                  ? 'bg-rose-600 text-white'
                                  : 'bg-white border border-slate-300 text-slate-600 hover:bg-rose-50'
                              }`}
                            >
                              Sai
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Chủ đề tư liệu:
                        </label>
                        <input
                          type="text"
                          value={m2Topic}
                          onChange={(e) => setM2Topic(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Giải thích chung (tùy chọn):
                        </label>
                        <input
                          type="text"
                          value={m2Explanation}
                          onChange={(e) => setM2Explanation(e.target.value)}
                          placeholder="Ghi chú căn cứ SGK..."
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={autoSaveToQuestionBank}
                          onChange={(e) => setAutoSaveToQuestionBank(e.target.checked)}
                          className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                        />
                        <span>Đồng thời lưu vào Ngân hàng câu hỏi</span>
                      </label>

                      <button
                        type="button"
                        onClick={handleSubmitManualPart2}
                        className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Save className="w-4 h-4" />
                        {editingManualQuestion?.part === 'part2'
                          ? 'Lưu cập nhật câu hỏi'
                          : 'Lưu câu hỏi'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT: Live Draft List & Save Actions */}
              <div className="lg:col-span-5 p-4 bg-white rounded-2xl border border-slate-200 flex flex-col justify-between space-y-3">
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div>
                      <h5 className="font-bold text-slate-900 text-xs">
                        Danh sách câu hỏi đã lưu ({manualPart1.length + manualPart2.length} câu)
                      </h5>
                      <p className="text-[11px] text-slate-500">
                        Phần I: {manualPart1.length} câu ({(manualPart1.length * 0.25).toFixed(2)}đ) • Phần II: {manualPart2.length} câu ({(manualPart2.length * 1.0).toFixed(1)}đ)
                      </p>
                    </div>
                  </div>

                  {manualPart1.length === 0 && manualPart2.length === 0 ? (
                    <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500 space-y-1.5">
                      <BookOpen className="w-7 h-7 text-slate-300 mx-auto" />
                      <p className="text-xs font-medium">
                        Chưa có câu hỏi nào. Cô nhập câu hỏi và chọn đáp án ở khung bên trái, sau đó bấm nút <strong>Lưu câu hỏi</strong> nhé!
                      </p>
                    </div>
                  ) : (
                    <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
                      {manualPart1.map((q, idx) => (
                        <div
                          key={q.id}
                          className="p-2.5 bg-sky-50/50 rounded-xl border border-sky-200 flex items-start justify-between gap-2"
                        >
                          <div className="flex-1 min-w-0 space-y-0.5">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="font-bold text-[#073B66] text-[11px]">
                                Phần I - Câu {idx + 1}
                              </span>
                              <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold text-[10px]">
                                Đáp án: {q.correctAnswer}
                              </span>
                              <span className="bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded font-semibold text-[10px]">
                                ✓ Đã lưu
                              </span>
                            </div>
                            <p className="text-xs text-slate-800 font-serif line-clamp-2">{q.content}</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleEditManualQuestionItem('part1', q)}
                              className="p-1.5 text-slate-500 hover:text-sky-700 hover:bg-white rounded-lg cursor-pointer"
                              title="Sửa câu này"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const nextP1 = manualPart1.filter((item) => item.id !== q.id);
                                setManualPart1(nextP1);
                                persistManualQuestionsToExamLibrary(nextP1, manualPart2);
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg cursor-pointer"
                              title="Xóa câu này"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {manualPart2.map((q, idx) => (
                        <div
                          key={q.id}
                          className="p-2.5 bg-purple-50/50 rounded-xl border border-purple-200 flex items-start justify-between gap-2"
                        >
                          <div className="flex-1 min-w-0 space-y-0.5">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="font-bold text-purple-900 text-[11px]">
                                Phần II - Câu {idx + 1}
                              </span>
                              <span className="bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded font-bold text-[10px]">
                                {q.correctAnswer}
                              </span>
                              <span className="bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded font-semibold text-[10px]">
                                ✓ Đã lưu
                              </span>
                            </div>
                            <p className="text-xs text-slate-800 font-serif line-clamp-2">{q.content}</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleEditManualQuestionItem('part2', q)}
                              className="p-1.5 text-slate-500 hover:text-purple-800 hover:bg-white rounded-lg cursor-pointer"
                              title="Sửa câu này"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const nextP2 = manualPart2.filter((item) => item.id !== q.id);
                                setManualPart2(nextP2);
                                persistManualQuestionsToExamLibrary(manualPart1, nextP2);
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg cursor-pointer"
                              title="Xóa câu này"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-200 space-y-2">
                  <button
                    type="button"
                    onClick={() => handleSaveManualExamToLibrary(false)}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Save className="w-4 h-4" />
                    Lưu bộ đề vào Thư viện & Mở Chấm điểm
                  </button>
                  {onImportToBank && (
                    <button
                      type="button"
                      onClick={() => handleSaveManualExamToLibrary(true)}
                      className="w-full py-2 bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      Lưu bộ đề & Đồng bộ vào Ngân hàng câu hỏi
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 4: COMPLETE EXAM VIEW & PRINT FORMAT
           ========================================================================= */}
        {activeTab === 'exam' && (
          <div className="p-6 bg-white rounded-2xl border border-slate-200 space-y-6 shadow-xs">
            {/* Formal Vietnamese Exam Header */}
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-300">
              <div className="text-center font-serif space-y-0.5">
                <div className="font-bold text-[11px] uppercase tracking-wide">
                  SỞ GIÁO DỤC VÀ ĐÀO TẠO QUẢNG NINH
                </div>
                <div className="font-extrabold text-xs uppercase text-[#073B66]">
                  TRUNG TÂM GDNN - GDTX TP QUẢNG NINH
                </div>
                <div className="font-bold text-[11px] text-slate-700">PHÂN HIỆU TIÊN YÊN</div>
                <div className="text-[10px] italic text-slate-500 mt-1">
                  Đề ôn thi tốt nghiệp THPT Lớp 12
                </div>
              </div>

              <div className="text-center font-serif space-y-0.5">
                <div className="font-extrabold text-xs uppercase text-slate-900">
                  KỲ THI TỐT NGHIỆP TRUNG HỌC PHỔ THÔNG NĂM 2025
                </div>
                <div className="font-bold text-xs text-[#0878C9]">
                  BÀI THI: LỊCH SỬ (CHƯƠNG TRÌNH GDTX CẤP THPT)
                </div>
                <div className="text-[11px] text-slate-600 italic">
                  Thời gian làm bài: 50 phút (Không kể thời gian phát đề)
                </div>
                <div className="text-[11px] text-slate-600 font-medium">
                  Mã đề: {currentExam.code} • Giáo viên ra đề: Cô Cao Thị Thu
                </div>
              </div>
            </div>

            {/* Candidate Info Box */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between text-xs font-serif">
              <span>Họ và tên thí sinh: ............................................................................</span>
              <span>Số báo danh: ..................... Phòng thi: ............</span>
            </div>

            {/* Official Scoring Guide Note */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                CẤU TRÚC ĐỀ THI VÀ QUY ĐỊNH TÍNH ĐIỂM (TỔNG ĐIỂM: 10,0 ĐIỂM):
              </div>
              <ul className="list-disc pl-5 space-y-0.5">
                <li>
                  <strong>Phần I (6,0 điểm):</strong> Gồm {part1Questions.length} câu hỏi trắc nghiệm nhiều phương án lựa chọn. Mỗi câu trả lời đúng được <strong>0,25 điểm</strong>.
                </li>
                <li>
                  <strong>Phần II (4,0 điểm):</strong> Gồm {part2Questions.length} câu hỏi trắc nghiệm Đúng/Sai có ngữ liệu lịch sử. Điểm tính theo barem bậc thang chính thức của Bộ GD&ĐT:
                  <span className="font-bold text-emerald-800 ml-1">
                    Đúng 1 ý = 0,10đ • Đúng 2 ý = 0,25đ • Đúng 3 ý = 0,50đ • Đúng cả 4 ý = 1,00đ.
                  </span>
                </li>
              </ul>
            </div>

            {/* PHẦN I: TRẮC NGHIỆM ĐƠN */}
            <div className="space-y-4 pt-2">
              <div className="font-bold text-[#073B66] uppercase text-xs pb-1 border-b-2 border-[#073B66] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="bg-[#073B66] text-white px-2 py-0.5 rounded text-[10px]">
                    PHẦN I
                  </span>
                  <span>CÂU TRẮC NGHIỆM NHIỀU PHƯƠNG ÁN LỰA CHỌN</span>
                </div>
                <span className="text-slate-500 font-semibold lowercase">
                  ({part1Questions.length} câu • 0,25đ / câu)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 italic font-serif">
                Thí sinh trả lời từ câu 1 đến câu {part1Questions.length}. Mỗi câu hỏi thí sinh chỉ chọn một phương án đúng nhất.
              </p>

              <div className="space-y-3.5 pl-2">
                {part1Questions.map((q, qIdx) => (
                  <div key={q.id || qIdx} className="space-y-1.5 font-serif">
                    <div className="font-bold text-slate-900 leading-relaxed">
                      <span className="text-[#0878C9]">Câu {qIdx + 1}.</span> {q.content}
                    </div>
                    {q.options && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-3 text-slate-800 text-xs">
                        {q.options.map((opt, oi) => (
                          <div
                            key={oi}
                            className="p-1.5 rounded-lg border border-transparent hover:border-slate-200 transition-colors"
                          >
                            {opt}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* PHẦN II: TRẮC NGHIỆM ĐÚNG SAI */}
            <div className="space-y-4 pt-4 border-t-2 border-slate-300">
              <div className="font-bold text-purple-900 uppercase text-xs pb-1 border-b-2 border-purple-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="bg-purple-800 text-white px-2 py-0.5 rounded text-[10px]">
                    PHẦN II
                  </span>
                  <span>CÂU TRẮC NGHIỆM ĐÚNG SAI (CHUẨN TƯ LIỆU BỘ GD&ĐT)</span>
                </div>
                <span className="text-slate-500 font-semibold lowercase">
                  ({part2Questions.length} câu • tối đa 1,0đ / câu)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 italic font-serif">
                Thí sinh trả lời từ câu 1 đến câu {part2Questions.length}. Trong mỗi ý a), b), c), d) ở mỗi câu, thí sinh chọn Đúng hoặc Sai.
              </p>

              <div className="space-y-6 pl-2">
                {part2Questions.map((q, qIdx) => (
                  <div
                    key={q.id || qIdx}
                    className="space-y-2.5 font-serif p-4 bg-slate-50/80 rounded-2xl border border-slate-200"
                  >
                    <div className="font-bold text-slate-900 leading-relaxed whitespace-pre-line">
                      <span className="text-purple-800 font-extrabold">Câu {qIdx + 1} (Phần II).</span>{' '}
                      {q.content}
                    </div>

                    <div className="space-y-2 pt-1 font-sans">
                      {q.trueFalseStatements?.map((stmt) => (
                        <div
                          key={stmt.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-white rounded-xl border border-slate-200 text-xs hover:border-purple-300 transition-colors"
                        >
                          <div className="flex-1 font-serif leading-relaxed">
                            <strong className="mr-1.5 uppercase font-sans text-purple-800">
                              {stmt.id})
                            </strong>
                            {stmt.statement}
                          </div>
                          <div className="flex items-center gap-3 shrink-0 ml-2">
                            <span className="border border-slate-300 px-3 py-1 rounded-lg text-xs font-bold text-slate-600">
                              [ ] Đúng
                            </span>
                            <span className="border border-slate-300 px-3 py-1 rounded-lg text-xs font-bold text-slate-600">
                              [ ] Sai
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center pt-6 border-t border-slate-200 text-slate-500 italic text-[11px] font-serif">
              ---------- HẾT ----------
              <div className="mt-1 text-[10px]">
                Cán bộ coi thi không giải thích gì thêm • Giám thị 1: ....................................... Giám thị 2: .......................................
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 5: INTERACTIVE LIVE GRADING ROOM (AUTOMATIC SCORING ENGINE)
           ========================================================================= */}
        {activeTab === 'grading' && (
          <div className="space-y-5">
            {/* Live Score Board Card */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Auto-Grading Live Calculator
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600 font-medium font-mono">
                      Đang luyện: {currentExam.title} ({currentExam.code})
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">
                    Bảng điều khiển chấm bài và tính điểm tức thời (Tổng 10,0 điểm)
                  </h4>
                </div>

                {/* Preset Controls */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleFillAllCorrect}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl font-bold flex items-center gap-1 cursor-pointer transition-colors border border-emerald-200"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Điền 100% Đúng (10đ)
                  </button>

                  <button
                    onClick={handleFillGoodSample}
                    className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 rounded-xl font-bold flex items-center gap-1 cursor-pointer transition-colors border border-sky-200"
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    Chấm thử học sinh khá (~8đ)
                  </button>

                  <button
                    onClick={handleResetAnswers}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Làm sạch
                  </button>
                </div>
              </div>

              {/* Real-time score metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-sky-50 rounded-xl border border-sky-200 text-center">
                  <div className="text-[11px] text-sky-700 font-medium">
                    Điểm Phần I ({part1Questions.length} câu)
                  </div>
                  <div className="text-xl font-black text-[#073B66] mt-0.5">
                    {scoreResult.part1Score.toFixed(2)}
                    <span className="text-xs font-normal text-slate-500">
                      {' '}
                      / {(part1Questions.length * 0.25).toFixed(1)}
                    </span>
                  </div>
                  <div className="text-[10px] text-sky-600 font-semibold mt-0.5">
                    {scoreResult.part1CorrectCount} / {part1Questions.length} câu đúng (×0,25đ)
                  </div>
                </div>

                <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-center">
                  <div className="text-[11px] text-purple-700 font-medium">
                    Điểm Phần II ({part2Questions.length} câu Đ/S)
                  </div>
                  <div className="text-xl font-black text-purple-900 mt-0.5">
                    {scoreResult.part2Score.toFixed(2)}
                    <span className="text-xs font-normal text-slate-500">
                      {' '}
                      / {(part2Questions.length * 1.0).toFixed(1)}
                    </span>
                  </div>
                  <div className="text-[10px] text-purple-600 font-semibold mt-0.5">
                    Barem bậc thang Bộ GD&ĐT
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                  <div className="text-[11px] text-emerald-700 font-medium">TỔNG ĐIỂM TOÀN BÀI</div>
                  <div className="text-2xl font-black text-emerald-700 mt-0.5">
                    {scoreResult.totalScore.toFixed(2)}
                    <span className="text-xs font-normal text-slate-500"> / 10,0</span>
                  </div>
                  <div className="text-[10px] text-emerald-800 font-extrabold uppercase mt-0.5">
                    Mức: {scoreResult.evaluationLevel}
                  </div>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-center flex flex-col justify-center">
                  <div className="text-[11px] text-amber-800 font-medium">Xếp loại Thông tư 43</div>
                  <div className="text-sm font-bold text-amber-900 mt-1">
                    {scoreResult.evaluationText}
                  </div>
                  <div className="text-[10px] text-amber-700 mt-0.5">
                    {scoreResult.totalScore >= 5.0 ? '✓ Đủ chuẩn tốt nghiệp' : '⚠ Cần phụ đạo thêm'}
                  </div>
                </div>
              </div>

              {/* Pedagogical Comment Card */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5">
                <BookOpen className="w-4 h-4 text-[#0878C9] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-800">
                    Nhận xét sư phạm tự động dành cho học viên GDTX:
                  </span>
                  <p className="text-slate-600 italic leading-relaxed">
                    "{scoreResult.pedagogicalComment}"
                  </p>
                </div>
              </div>

              {/* Save directly to Gradebook */}
              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-slate-700">Lưu kết quả vào sổ điểm:</span>
                  <select
                    value={selectedClassId}
                    onChange={(e) => {
                      setSelectedClassId(e.target.value);
                      const stds = students.filter((s) => s.classId === e.target.value);
                      setSelectedStudentId(stds[0]?.id || '');
                    }}
                    className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-[#073B66]"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} (Khối {c.grade})
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 max-w-[200px]"
                  >
                    {classStudents.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.code} - {s.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  {saveSuccessMsg && (
                    <span className="text-emerald-700 font-bold text-xs flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> {saveSuccessMsg}
                    </span>
                  )}
                  <button
                    onClick={handleSaveToGradebook}
                    className="px-3.5 py-1.5 bg-[#0878C9] hover:bg-[#073B66] text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors shrink-0"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Lưu điểm vào Sổ điểm
                  </button>
                </div>
              </div>
            </div>

            {/* INTERACTIVE QUESTION TICKING */}
            <div className="space-y-6">
              {/* PART 1 TICKING */}
              <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <h4 className="font-bold text-[#073B66] uppercase text-xs flex items-center gap-2">
                    <span className="bg-[#073B66] text-white px-2 py-0.5 rounded text-[10px]">
                      Phần I
                    </span>
                    <span>
                      Chấm điểm {part1Questions.length} câu trắc nghiệm đơn (0,25 điểm / câu đúng)
                    </span>
                  </h4>
                  <span className="text-xs font-bold text-emerald-700">
                    Đã chấm: {Object.keys(part1Answers).length} / {part1Questions.length} câu
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {part1Questions.map((q, qIdx) => {
                    const studentAns = part1Answers[qIdx];
                    const isCorrect = studentAns === q.correctAnswer;
                    const isAnswered = studentAns !== undefined && studentAns !== '';

                    return (
                      <div
                        key={q.id || qIdx}
                        className={`p-3 rounded-xl border transition-all ${
                          !isAnswered
                            ? 'bg-slate-50 border-slate-200'
                            : isCorrect
                            ? 'bg-emerald-50/50 border-emerald-300'
                            : 'bg-rose-50/50 border-rose-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <span className="font-bold text-slate-800 text-[11px] leading-snug">
                            <span className="text-[#0878C9]">Câu {qIdx + 1}:</span>{' '}
                            {q.content.slice(0, 75)}...
                          </span>
                          <span className="text-[10px] font-bold shrink-0">
                            {isAnswered ? (
                              isCorrect ? (
                                <span className="text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                                  +0,25đ
                                </span>
                              ) : (
                                <span className="text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
                                  0,0đ
                                </span>
                              )
                            ) : (
                              <span className="text-slate-400">Chưa làm</span>
                            )}
                          </span>
                        </div>

                        {/* A / B / C / D Buttons */}
                        <div className="flex items-center gap-1.5">
                          {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                            const isSelected = studentAns === optKey;
                            const isRightKey = q.correctAnswer === optKey;

                            let btnStyle = 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100';
                            if (isSelected) {
                              if (isCorrect) {
                                btnStyle = 'bg-emerald-600 text-white border-emerald-600 font-extrabold';
                              } else {
                                btnStyle = 'bg-rose-600 text-white border-rose-600 font-extrabold';
                              }
                            } else if (isAnswered && !isCorrect && isRightKey) {
                              btnStyle = 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold';
                            }

                            return (
                              <button
                                key={optKey}
                                type="button"
                                onClick={() =>
                                  setPart1Answers((prev) => ({
                                    ...prev,
                                    [qIdx]: optKey,
                                  }))
                                }
                                className={`flex-1 py-1 rounded-lg border text-xs font-bold transition-all cursor-pointer ${btnStyle}`}
                              >
                                {optKey}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* PART 2 TICKING */}
              <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <h4 className="font-bold text-purple-900 uppercase text-xs flex items-center gap-2">
                    <span className="bg-purple-800 text-white px-2 py-0.5 rounded text-[10px]">
                      Phần II
                    </span>
                    <span>
                      Chấm điểm {part2Questions.length} câu trắc nghiệm Đúng/Sai (Barem bậc thang 4 mức)
                    </span>
                  </h4>
                  <span className="text-xs font-bold text-purple-700">
                    Tổng điểm Phần II: {scoreResult.part2Score.toFixed(2)} /{' '}
                    {(part2Questions.length * 1.0).toFixed(1)}đ
                  </span>
                </div>

                <div className="space-y-4">
                  {part2Questions.map((q, qIdx) => {
                    const detail = scoreResult.part2Details[qIdx];
                    const currentAnswers = part2Answers[qIdx] || {};

                    return (
                      <div
                        key={q.id || qIdx}
                        className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200 space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <span className="font-bold text-slate-800 text-xs">
                            <span className="text-purple-800 font-extrabold">
                              Câu {qIdx + 1} (Phần II):
                            </span>{' '}
                            {q.topic} - {q.knowledgeDomain}
                          </span>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[11px] text-slate-600">
                              Đúng: <strong>{detail?.correctCount ?? 0} / 4 ý</strong>
                            </span>
                            <span className="bg-purple-100 text-purple-900 px-2.5 py-0.5 rounded-full font-bold text-xs border border-purple-200">
                              Điểm: {detail?.score.toFixed(2) ?? '0.00'} / 1,0đ
                            </span>
                          </div>
                        </div>

                        {/* Statement items */}
                        <div className="space-y-2">
                          {q.trueFalseStatements?.map((stmt) => {
                            const studentVal = currentAnswers[stmt.id];
                            const isCorrect = studentVal === stmt.isCorrect;
                            const isAnswered = studentVal !== undefined;

                            return (
                              <div
                                key={stmt.id}
                                className={`p-2.5 bg-white rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs transition-colors ${
                                  !isAnswered
                                    ? 'border-slate-200'
                                    : isCorrect
                                    ? 'border-emerald-300 bg-emerald-50/30'
                                    : 'border-rose-300 bg-rose-50/30'
                                }`}
                              >
                                <div className="flex-1">
                                  <strong className="mr-1.5 uppercase font-sans text-purple-800">
                                    {stmt.id})
                                  </strong>
                                  <span className="text-slate-700">{stmt.statement}</span>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                  {/* Toggle ĐÚNG */}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setPart2Answers((prev) => ({
                                        ...prev,
                                        [qIdx]: {
                                          ...prev[qIdx],
                                          [stmt.id]: true,
                                        },
                                      }))
                                    }
                                    className={`px-3 py-1 rounded-lg border text-[11px] font-bold cursor-pointer transition-all ${
                                      studentVal === true
                                        ? stmt.isCorrect === true
                                          ? 'bg-emerald-600 text-white border-emerald-600'
                                          : 'bg-rose-600 text-white border-rose-600'
                                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                                    }`}
                                  >
                                    Đúng {studentVal === true && (stmt.isCorrect ? '✓' : '✗')}
                                  </button>

                                  {/* Toggle SAI */}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setPart2Answers((prev) => ({
                                        ...prev,
                                        [qIdx]: {
                                          ...prev[qIdx],
                                          [stmt.id]: false,
                                        },
                                      }))
                                    }
                                    className={`px-3 py-1 rounded-lg border text-[11px] font-bold cursor-pointer transition-all ${
                                      studentVal === false
                                        ? stmt.isCorrect === false
                                          ? 'bg-emerald-600 text-white border-emerald-600'
                                          : 'bg-rose-600 text-white border-rose-600'
                                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                                    }`}
                                  >
                                    Sai {studentVal === false && (!stmt.isCorrect ? '✓' : '✗')}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 6: ANSWER KEY & MOET STEPWISE BAREM EXPLANATION
           ========================================================================= */}
        {activeTab === 'key' && (
          <div className="space-y-5">
            {/* MOET Official Stepwise Table */}
            <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-200 space-y-3">
              <h4 className="font-extrabold text-purple-900 text-xs uppercase flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-purple-700" />
                BẢNG BAREM ĐIỂM BẬC THANG CHÍNH THỨC CỦA BỘ GD&ĐT DÀNH CHO CÂU ĐÚNG / SAI (PHẦN II)
              </h4>
              <p className="text-slate-600 text-[11px]">
                Quy định tại Đề thi tham khảo và Hướng dẫn chấm thi tốt nghiệp THPT từ năm 2025:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 bg-white rounded-xl border border-purple-200 text-center">
                  <div className="text-[11px] text-slate-500 font-medium">Chỉ đúng 01 ý</div>
                  <div className="text-lg font-black text-purple-800">0,10 điểm</div>
                  <div className="text-[10px] text-slate-400">Tối thiểu</div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-purple-200 text-center">
                  <div className="text-[11px] text-slate-500 font-medium">Đúng được 02 ý</div>
                  <div className="text-lg font-black text-purple-800">0,25 điểm</div>
                  <div className="text-[10px] text-slate-400">Khởi điểm</div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-purple-200 text-center">
                  <div className="text-[11px] text-slate-500 font-medium">Đúng được 03 ý</div>
                  <div className="text-lg font-black text-purple-800">0,50 điểm</div>
                  <div className="text-[10px] text-slate-400">Trung bình khá</div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-emerald-300 bg-emerald-50/40 text-center">
                  <div className="text-[11px] text-emerald-800 font-medium">Đúng cả 04 ý</div>
                  <div className="text-lg font-black text-emerald-700">1,00 điểm</div>
                  <div className="text-[10px] text-emerald-600 font-bold">Điểm tối đa / câu</div>
                </div>
              </div>
            </div>

            {/* Answer Grid for Part 1 */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
              <h4 className="font-bold text-[#073B66] text-xs uppercase">
                Bảng Đáp án Phần I (24 câu trắc nghiệm nhiều phương án)
              </h4>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                {part1Questions.map((q, idx) => (
                  <div
                    key={q.id || idx}
                    className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-center"
                  >
                    <div className="text-[10px] text-slate-500 font-medium">Câu {idx + 1}</div>
                    <div className="text-sm font-black text-[#0878C9]">{q.correctAnswer}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed Explanations for Part 2 */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-4">
              <h4 className="font-bold text-purple-900 text-xs uppercase">
                Đáp án và Hướng dẫn chấm chi tiết Phần II (Trắc nghiệm Đúng/Sai)
              </h4>
              <div className="space-y-4">
                {part2Questions.map((q, idx) => (
                  <div key={q.id || idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="font-bold text-slate-800 text-xs">
                      <span className="text-purple-800">Câu {idx + 1} (Phần II):</span> {q.topic}
                    </div>
                    <div className="space-y-1.5 pl-2 font-serif text-[11px]">
                      {q.trueFalseStatements?.map((s) => (
                        <div key={s.id} className="flex items-start gap-2">
                          <span
                            className={`px-1.5 py-0.2 rounded font-bold uppercase shrink-0 text-[10px] ${
                              s.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {s.isCorrect ? 'ĐÚNG' : 'SAI'}
                          </span>
                          <div>
                            <strong>{s.id})</strong> {s.statement}
                            {s.explanation && (
                              <span className="text-slate-500 italic block mt-0.5">
                                Giải thích: {s.explanation}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Phòng Làm Bài Thi Trực Tuyến Học Sinh (Có đếm ngược thời gian) */}
      <StudentExamRoomModal
        isOpen={isStudentExamRoomOpen}
        onClose={() => setIsStudentExamRoomOpen(false)}
        examTitle={currentExam.title}
        initialQuestions={[...part1Questions, ...part2Questions]}
        defaultDurationMinutes={50}
        initialClassId={selectedClassId}
        initialStudentId={selectedStudentId}
        initialTeacherMode={false}
        initialProctoringPreview={userRole !== 'student'}
      />
    </Modal>
  );
};
