import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { standardGraduationExamQuestions } from '../../data/graduationExamData';
import { calculateGraduationExamScore, MOET_TF_BAREM } from '../../lib/examScoring';
import { Question } from '../../types';
import { extractTextFromFile, parseQuestionsFromText } from '../../lib/wordQuestionParser';
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
  const { classes, students, updateStudentScore, exams, addExam, addQuestion } = useApp();

  // Active Tab:
  // 'library' | 'ai-studio' | 'upload' | 'exam' | 'grading' | 'key'
  const [activeTab, setActiveTab] = useState<
    'library' | 'ai-studio' | 'upload' | 'exam' | 'grading' | 'key'
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
  // WORD / TEXT IMPORT EXAM STATE & LOGIC
  // =========================================================================
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadRawText, setUploadRawText] = useState('');
  const [uploadTitle, setUploadTitle] = useState('Đề ôn thi tốt nghiệp tải lên từ Word');
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [uploadPreviewExam, setUploadPreviewExam] = useState<GraduationExamItem | null>(null);

  const handleUploadFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFile(file);
    setIsReadingFile(true);
    try {
      const text = await extractTextFromFile(file);
      setUploadRawText(text);
      setUploadTitle(file.name.replace(/\.[^/.]+$/, ''));
      processImportedText(text, file.name.replace(/\.[^/.]+$/, ''));
    } catch (err: any) {
      alert('Không thể đọc file: ' + err.message);
    } finally {
      setIsReadingFile(false);
    }
  };

  const processImportedText = (text: string, title: string) => {
    const parsed = parseQuestionsFromText(
      text,
      12,
      'Lịch sử 12 Ôn thi tốt nghiệp',
      'Đề thi tải lên',
      'Cao Thị Thu'
    );

    const p1: Question[] = parsed.questions
      .filter((q) => q.type === 'Trắc nghiệm đơn' || q.type === 'Trắc nghiệm')
      .map((q, idx) => ({
        ...q,
        id: `up_p1_${Date.now()}_${idx + 1}`,
        updatedAt: new Date().toISOString().split('T')[0],
      }));
    const p2: Question[] = parsed.questions
      .filter((q) => q.type === 'Trắc nghiệm đúng sai')
      .map((q, idx) => ({
        ...q,
        id: `up_p2_${Date.now()}_${idx + 1}`,
        updatedAt: new Date().toISOString().split('T')[0],
      }));

    if (p1.length === 0 && p2.length === 0) {
      alert(
        'Chưa nhận diện được câu hỏi trắc nghiệm nào từ nội dung. Hãy kiểm tra lại theo cú pháp Câu 1: A, B, C, D hoặc a), b), c), d) - Đúng/Sai.'
      );
      return;
    }

    const newExam: GraduationExamItem = {
      id: `exam_upload_${Date.now()}`,
      title: title || 'Đề thi tốt nghiệp tải lên',
      code: `WORD-${Math.floor(100 + Math.random() * 900)}`,
      source: 'WORD_UPLOAD',
      createdAt: new Date().toISOString().split('T')[0],
      topic: 'Đề thi nhập từ file giáo viên',
      note: `Tự động tách được ${p1.length} câu trắc nghiệm đơn và ${p2.length} câu trắc nghiệm đúng sai.`,
      part1: p1,
      part2: p2,
    };

    setUploadPreviewExam(newExam);
  };

  const handleSaveUploadExamToLibrary = () => {
    if (!uploadPreviewExam) return;
    setExamLibrary((prev) => [uploadPreviewExam, ...prev]);
    setActiveExamId(uploadPreviewExam.id);
    setActiveTab('grading');
    alert(`Đã lưu "${uploadPreviewExam.title}" vào Thư viện luyện thi và chuyển sang Phòng chấm điểm!`);
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

            {/* Tab 6: Key */}
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

            {onImportToBank && (
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

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('ai-studio')}
                  className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Soạn đề mới bằng AI
                </button>
                <button
                  onClick={() => setActiveTab('upload')}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Tải đề từ Word
                </button>
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
            TAB 3: UPLOAD FROM WORD OR RAW TEXT
           ========================================================================= */}
        {activeTab === 'upload' && (
          <div className="space-y-4">
            <div className="p-4 bg-indigo-50/80 rounded-2xl border border-indigo-200 space-y-1.5">
              <h4 className="font-bold text-indigo-900 text-sm flex items-center gap-2">
                <Upload className="w-4 h-4 text-indigo-700" />
                Tải lên đề thi tốt nghiệp từ file Word (.docx) hoặc dán toàn bộ văn bản đề thi
              </h4>
              <p className="text-slate-600 text-xs leading-relaxed">
                Hệ thống tự động phân loại các câu hỏi dạng <strong>Trắc nghiệm 1 đáp án (Phần I)</strong> và dạng <strong>Trắc nghiệm Đúng/Sai có ngữ liệu (Phần II)</strong> để đưa vào phòng chấm điểm tự động.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* File upload box */}
              <div className="p-5 bg-white rounded-2xl border-2 border-dashed border-indigo-200 hover:border-indigo-400 transition-colors flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h5 className="font-bold text-slate-800 text-xs">Chọn file Word (.docx, .doc)</h5>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Hỗ trợ file soạn sẵn của cô hoặc tải file mẫu để xem cú pháp
                  </p>
                </div>

                <label className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs cursor-pointer shadow-xs transition-colors">
                  Chọn file từ máy tính
                  <input
                    type="file"
                    accept=".docx,.doc,.txt"
                    onChange={handleUploadFileChange}
                    className="hidden"
                  />
                </label>

                {uploadFile && (
                  <div className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg">
                    ✓ Đã chọn: {uploadFile.name}
                  </div>
                )}
              </div>

              {/* Paste Text Box */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2 flex flex-col">
                <label className="text-xs font-bold text-slate-700">
                  Hoặc dán toàn bộ văn bản đề thi vào đây:
                </label>
                <textarea
                  value={uploadRawText}
                  onChange={(e) => setUploadRawText(e.target.value)}
                  rows={8}
                  className="w-full flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-serif leading-relaxed focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Dán đề thi gồm Câu 1: ... A, B, C, D... và Phần II: Câu 1 ... a), b), c), d) - Đúng/Sai..."
                />
                <button
                  type="button"
                  onClick={() => processImportedText(uploadRawText, uploadTitle)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs cursor-pointer shadow-xs transition-colors self-end"
                >
                  Phân tích & Tách câu hỏi
                </button>
              </div>
            </div>

            {/* Uploaded Preview */}
            {uploadPreviewExam && (
              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs">
                      {uploadPreviewExam.title}
                    </h5>
                    <p className="text-[11px] text-slate-500">{uploadPreviewExam.note}</p>
                  </div>
                  <button
                    onClick={handleSaveUploadExamToLibrary}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Lưu vào Thư viện đề thi
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
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
              </div>
            )}
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
      />
    </Modal>
  );
};
