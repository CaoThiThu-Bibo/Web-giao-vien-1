import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Question, QuestionType, EvaluationLevel } from '../../types';
import { standardGraduationExamQuestions } from '../../data/graduationExamData';
import { ExamRoomKey, EXAM_ROOMS_DATA } from './ExamRoomHubModal';
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Flag,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  Type,
  Sun,
  Moon,
  BookOpen,
  Send,
  Save,
  Award,
  Layers,
  ArrowRightLeft,
  ListOrdered,
  FileText,
  HelpCircle,
  Sparkles,
  Volume2,
  VolumeX,
  X,
  CheckSquare,
  Highlighter,
  Eraser,
  CheckCircle2,
  PenTool,
  Bookmark,
  Share2,
  Wand2,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export interface StudentExamRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  examTitle?: string;
  initialQuestions?: Question[];
  defaultDurationMinutes?: number;
  initialClassId?: string;
  initialStudentId?: string;
  roomMode?: ExamRoomKey;
}

export const StudentExamRoomModal: React.FC<StudentExamRoomModalProps> = ({
  isOpen,
  onClose,
  examTitle = 'Bài thi trực tuyến môn Lịch sử - Chương trình GDTX cấp THPT',
  initialQuestions,
  defaultDurationMinutes = 45,
  initialClassId,
  initialStudentId,
  roomMode = 'all',
}) => {
  const { classes, students, questions: bankQuestions, updateStudentScore, exams, addExam } = useApp();

  // -------------------------------------------------------------------------
  // 1. ACTIVE ROOM MODE STATE & SWITCHER
  // -------------------------------------------------------------------------
  const [activeRoomMode, setActiveRoomMode] = useState<ExamRoomKey>(roomMode);

  useEffect(() => {
    if (roomMode) {
      setActiveRoomMode(roomMode);
    }
  }, [roomMode]);

  // Merge bank questions and standard graduation questions for rich availability
  const combinedQuestionPool = useMemo(() => {
    const map = new Map<string, Question>();
    // First, user bank questions
    bankQuestions.forEach((q) => map.set(q.id, q));
    // Second, standard graduation exam questions
    standardGraduationExamQuestions.forEach((q) => {
      if (!map.has(q.id)) {
        map.set(q.id, q);
      }
    });
    return Array.from(map.values());
  }, [bankQuestions]);

  // -------------------------------------------------------------------------
  // 2. QUESTIONS FILTERING FOR THE CURRENT ROOM
  // -------------------------------------------------------------------------
  const examQuestions: Question[] = useMemo(() => {
    if (initialQuestions && initialQuestions.length > 0 && activeRoomMode === 'all') {
      return initialQuestions;
    }

    if (activeRoomMode === 'Trắc nghiệm đơn') {
      const list = combinedQuestionPool.filter(
        (q) => q.type === 'Trắc nghiệm đơn' || q.type === 'Trắc nghiệm'
      );
      return list.length > 0 ? list : combinedQuestionPool.slice(0, 15);
    }

    if (activeRoomMode === 'Trắc nghiệm đúng sai') {
      const list = combinedQuestionPool.filter((q) => q.type === 'Trắc nghiệm đúng sai');
      return list.length > 0 ? list : combinedQuestionPool.slice(0, 4);
    }

    if (activeRoomMode === 'Điền từ') {
      const list = combinedQuestionPool.filter((q) => q.type === 'Điền từ');
      return list.length > 0 ? list : combinedQuestionPool.slice(0, 4);
    }

    if (activeRoomMode === 'Nối từ') {
      const list = combinedQuestionPool.filter((q) => q.type === 'Nối từ');
      return list.length > 0 ? list : combinedQuestionPool.slice(0, 4);
    }

    if (activeRoomMode === 'Tự luận') {
      const list = combinedQuestionPool.filter((q) => q.type === 'Tự luận');
      return list.length > 0 ? list : combinedQuestionPool.slice(0, 2);
    }

    // Default 'all' - Comprehensive test
    const single = combinedQuestionPool.filter((q) => q.type === 'Trắc nghiệm đơn' || q.type === 'Trắc nghiệm').slice(0, 8);
    const tf = combinedQuestionPool.filter((q) => q.type === 'Trắc nghiệm đúng sai').slice(0, 2);
    const blank = combinedQuestionPool.filter((q) => q.type === 'Điền từ').slice(0, 1);
    const match = combinedQuestionPool.filter((q) => q.type === 'Nối từ').slice(0, 1);
    const essay = combinedQuestionPool.filter((q) => q.type === 'Tự luận').slice(0, 1);

    const merged = [...single, ...tf, ...blank, ...match, ...essay];
    return merged.length > 0 ? merged : combinedQuestionPool.slice(0, 12);
  }, [initialQuestions, combinedQuestionPool, activeRoomMode]);

  // Dynamic Room Title
  const computedRoomTitle = useMemo(() => {
    switch (activeRoomMode) {
      case 'Trắc nghiệm đơn':
        return '🏛️ Phòng 1: Đấu Trường Trắc Nghiệm Đơn (A - B - C - D) • Phản Xạ Tốc Độ';
      case 'Trắc nghiệm đúng sai':
        return '📜 Phòng 2: Phân Tích Tư Liệu Đúng / Sai • Chuẩn Cấu Trúc BGD&ĐT 2025';
      case 'Điền từ':
        return '✏️ Phòng 3: Điền Khuyết Sự Kiện Lịch Sử • Khắc Sâu Thuật Ngữ';
      case 'Nối từ':
        return '🔗 Phòng 4: Ghép Đôi & Nối Cặp Sự Kiện Lịch Sử • Tư Duy Logic';
      case 'Tự luận':
        return '🖋️ Phòng 5: Diễn Đàn Tự Luận Chuyên Sâu • Đếm Từ & Rubric Biểu Điểm';
      default:
        return examTitle;
    }
  }, [activeRoomMode, examTitle]);

  // -------------------------------------------------------------------------
  // 3. STUDENT & CLASS STATE
  // -------------------------------------------------------------------------
  const [selectedClassId, setSelectedClassId] = useState<string>(
    initialClassId || classes[0]?.id || ''
  );
  const classStudents = useMemo(
    () => students.filter((s) => s.classId === selectedClassId),
    [students, selectedClassId]
  );
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    initialStudentId || classStudents[0]?.id || ''
  );

  useEffect(() => {
    if (classStudents.length > 0 && !classStudents.some((s) => s.id === selectedStudentId)) {
      setSelectedStudentId(classStudents[0].id);
    }
  }, [classStudents, selectedStudentId]);

  const currentStudent = useMemo(
    () => students.find((s) => s.id === selectedStudentId) || classStudents[0],
    [students, selectedStudentId, classStudents]
  );

  // -------------------------------------------------------------------------
  // 4. DISPLAY OPTIONS & ACCESSIBILITY (FONT, THEME, VIEW MODE)
  // -------------------------------------------------------------------------
  const [displayMode, setDisplayMode] = useState<'scroll' | 'single'>('single');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');
  const [theme, setTheme] = useState<'sepia' | 'white' | 'dark'>('sepia');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const modalContainerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      modalContainerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // -------------------------------------------------------------------------
  // 5. TIMER & TIME MANAGEMENT ENGINE
  // -------------------------------------------------------------------------
  const getRoomDefaultMinutes = (mode: ExamRoomKey): number => {
    switch (mode) {
      case 'Trắc nghiệm đơn':
        return 15;
      case 'Trắc nghiệm đúng sai':
        return 20;
      case 'Điền từ':
        return 15;
      case 'Nối từ':
        return 15;
      case 'Tự luận':
        return 35;
      default:
        return defaultDurationMinutes || 45;
    }
  };

  const [durationMinutes, setDurationMinutes] = useState<number>(getRoomDefaultMinutes(activeRoomMode));
  const [secondsRemaining, setSecondsRemaining] = useState<number>(
    getRoomDefaultMinutes(activeRoomMode) * 60
  );
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [isTimeWarningShown, setIsTimeWarningShown] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeSpentSeconds, setTimeSpentSeconds] = useState(0);

  // Reset timer whenever room changes or modal opens
  useEffect(() => {
    if (isOpen) {
      const min = getRoomDefaultMinutes(activeRoomMode);
      setDurationMinutes(min);
      setSecondsRemaining(min * 60);
      setTimeSpentSeconds(0);
      setIsSubmitted(false);
      setIsTimeWarningShown(false);
      setIsTimerPaused(false);
      setCurrentQuestionIndex(0);
    }
  }, [isOpen, activeRoomMode]);

  // Timer Tick
  useEffect(() => {
    if (!isOpen || isSubmitted || isTimerPaused || durationMinutes === 0) return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoSubmit();
          return 0;
        }
        if (prev === 301) {
          setIsTimeWarningShown(true);
        }
        return prev - 1;
      });
      setTimeSpentSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, isSubmitted, isTimerPaused, durationMinutes]);

  const formattedTime = useMemo(() => {
    if (durationMinutes === 0) return 'Không giới hạn';
    const m = Math.floor(secondsRemaining / 60);
    const s = secondsRemaining % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }, [secondsRemaining, durationMinutes]);

  const timerStatusColor = useMemo(() => {
    if (durationMinutes === 0) return 'text-slate-600 bg-slate-100 border-slate-300';
    if (secondsRemaining <= 300) {
      return 'text-rose-700 bg-rose-100 border-rose-300 animate-pulse ring-2 ring-rose-400';
    }
    if (secondsRemaining <= durationMinutes * 60 * 0.4) {
      return 'text-amber-700 bg-amber-100 border-amber-300';
    }
    return 'text-emerald-700 bg-emerald-100 border-emerald-300';
  }, [secondsRemaining, durationMinutes]);

  const handleAddExtraTime = (extraMinutes: number) => {
    setSecondsRemaining((prev) => prev + extraMinutes * 60);
    alert(`Đã cộng thêm ${extraMinutes} phút làm bài cho học sinh!`);
  };

  // -------------------------------------------------------------------------
  // 6. STUDENT ANSWERS & SPECIALIZED INTERACTION STATE
  // -------------------------------------------------------------------------
  // Single choice: questionId -> 'A' | 'B' | 'C' | 'D'
  const [singleAnswers, setSingleAnswers] = useState<Record<string, string>>({});

  // True/False: questionId -> { a?: boolean, b?: boolean, c?: boolean, d?: boolean }
  const [tfAnswers, setTfAnswers] = useState<
    Record<string, Record<'a' | 'b' | 'c' | 'd', boolean | undefined>>
  >({});

  // Highlighting tool for True/False stimulus text
  const [highlighterColor, setHighlighterColor] = useState<'yellow' | 'cyan' | 'none'>('yellow');
  const [highlightedKeywords, setHighlightedKeywords] = useState<Record<string, string[]>>({});

  const toggleHighlightKeyword = (qId: string, word: string) => {
    setHighlightedKeywords((prev) => {
      const cur = prev[qId] || [];
      return {
        ...prev,
        [qId]: cur.includes(word) ? cur.filter((w) => w !== word) : [...cur, word],
      };
    });
  };

  // Fill in the blank: questionId -> Record<blankLabel, word>
  const [blankAnswers, setBlankAnswers] = useState<Record<string, Record<string, string>>>({});
  const [activeBlankSlot, setActiveBlankSlot] = useState<{ qId: string; blankLabel: string } | null>(null);

  // Matching: questionId -> Record<pairId, matchedKey>
  const [matchingAnswers, setMatchingAnswers] = useState<Record<string, Record<string, string>>>({});
  const [selectedLeftMatch, setSelectedLeftMatch] = useState<{ qId: string; pairId: string } | null>(null);

  // Essay: questionId -> essay text
  const [essayAnswers, setEssayAnswers] = useState<Record<string, string>>({});
  const [lastAutoSavedTime, setLastAutoSavedTime] = useState<string>('Vừa mới lưu');
  const [aiFeedbackMap, setAiFeedbackMap] = useState<Record<string, { score: number; comment: string }>>({});

  // Flagged for review
  const [flaggedQuestionIds, setFlaggedQuestionIds] = useState<string[]>([]);

  const toggleFlagQuestion = (qId: string) => {
    setFlaggedQuestionIds((prev) =>
      prev.includes(qId) ? prev.filter((id) => id !== qId) : [...prev, qId]
    );
  };

  // Simulated auto-save for essay
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setLastAutoSavedTime(
        `${now.getHours().toString().padStart(2, '0')}:${now
          .getMinutes()
          .toString()
          .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
      );
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const isQuestionAnswered = (q: Question): boolean => {
    if (q.type === 'Trắc nghiệm đơn' || q.type === 'Trắc nghiệm') {
      return !!singleAnswers[q.id];
    }
    if (q.type === 'Trắc nghiệm đúng sai') {
      const ans = tfAnswers[q.id];
      if (!ans) return false;
      return ['a', 'b', 'c', 'd'].some((k) => (ans as any)[k] !== undefined);
    }
    if (q.type === 'Điền từ') {
      const ans = blankAnswers[q.id];
      if (!ans) return false;
      return Object.values(ans).some((v) => v.trim() !== '');
    }
    if (q.type === 'Nối từ') {
      const ans = matchingAnswers[q.id];
      if (!ans) return false;
      return Object.keys(ans).length > 0;
    }
    if (q.type === 'Tự luận') {
      return !!essayAnswers[q.id] && essayAnswers[q.id].trim().length > 10;
    }
    return false;
  };

  const answeredCount = useMemo(() => {
    return examQuestions.filter(isQuestionAnswered).length;
  }, [examQuestions, singleAnswers, tfAnswers, blankAnswers, matchingAnswers, essayAnswers]);

  // -------------------------------------------------------------------------
  // 7. SCORING & PEDAGOGICAL EVALUATION ENGINE (ROOM-SPECIFIC SCALED TO 10.0)
  // -------------------------------------------------------------------------
  interface SectionScoreDetail {
    type: QuestionType;
    score: number;
    maxScore: number;
    questionCount: number;
    details: string;
  }

  const evaluationResult = useMemo(() => {
    if (examQuestions.length === 0) {
      return {
        totalScore: 0,
        maxScore: 10,
        sectionBreakdown: [],
        evaluationLevel: 'Chưa đạt' as EvaluationLevel,
        evaluationText: 'Chưa có dữ liệu bài thi.',
        pedagogicalComment: '',
      };
    }

    const singleQuestions = examQuestions.filter(
      (q) => q.type === 'Trắc nghiệm đơn' || q.type === 'Trắc nghiệm'
    );
    const tfQuestions = examQuestions.filter((q) => q.type === 'Trắc nghiệm đúng sai');
    const blankQuestions = examQuestions.filter((q) => q.type === 'Điền từ');
    const matchQuestions = examQuestions.filter((q) => q.type === 'Nối từ');
    const essayQuestions = examQuestions.filter((q) => q.type === 'Tự luận');

    let sectionBreakdown: SectionScoreDetail[] = [];
    let finalScore = 0;

    // CASE 1: ROOM 1 - TRẮC NGHIỆM ĐƠN (Hệ 10.0 hoàn toàn)
    if (activeRoomMode === 'Trắc nghiệm đơn') {
      let singleCorrect = 0;
      singleQuestions.forEach((q) => {
        const studentAns = singleAnswers[q.id];
        if (studentAns && studentAns.trim().toUpperCase() === q.correctAnswer.trim().toUpperCase()) {
          singleCorrect++;
        }
      });
      finalScore = singleQuestions.length > 0 ? (singleCorrect / singleQuestions.length) * 10.0 : 0;
      sectionBreakdown.push({
        type: 'Trắc nghiệm đơn',
        score: finalScore,
        maxScore: 10.0,
        questionCount: singleQuestions.length,
        details: `Đúng ${singleCorrect} / ${singleQuestions.length} câu (Mỗi câu = ${(
          10 / (singleQuestions.length || 1)
        ).toFixed(2)}đ)`,
      });
    }

    // CASE 2: ROOM 2 - ĐÚNG / SAI TƯ LIỆU (Barem bậc thang chuẩn Bộ GD&ĐT quy về hệ 10)
    else if (activeRoomMode === 'Trắc nghiệm đúng sai') {
      let rawTfPoints = 0;
      let maxRawTfPoints = tfQuestions.length * 1.0;
      tfQuestions.forEach((q) => {
        const userAns = tfAnswers[q.id] || {};
        let correctStatements = 0;
        q.trueFalseStatements?.forEach((stmt) => {
          const studentVal = userAns[stmt.id];
          if (studentVal !== undefined && studentVal === stmt.isCorrect) {
            correctStatements++;
          }
        });
        if (correctStatements === 1) rawTfPoints += 0.1;
        else if (correctStatements === 2) rawTfPoints += 0.25;
        else if (correctStatements === 3) rawTfPoints += 0.5;
        else if (correctStatements === 4) rawTfPoints += 1.0;
      });
      finalScore = maxRawTfPoints > 0 ? (rawTfPoints / maxRawTfPoints) * 10.0 : 0;
      sectionBreakdown.push({
        type: 'Trắc nghiệm đúng sai',
        score: finalScore,
        maxScore: 10.0,
        questionCount: tfQuestions.length,
        details: `Điểm bậc thang Bộ: ${rawTfPoints.toFixed(2)} / ${maxRawTfPoints.toFixed(2)}đ gốc -> Quy đổi hệ 10: ${finalScore.toFixed(2)}đ`,
      });
    }

    // CASE 3: ROOM 3 - ĐIỀN TỪ (Quy về hệ 10)
    else if (activeRoomMode === 'Điền từ') {
      let blankCorrectTotal = 0;
      let blankSlotsTotal = 0;
      blankQuestions.forEach((q) => {
        const userAns = blankAnswers[q.id] || {};
        const slots = q.blankItems || [];
        blankSlotsTotal += slots.length;
        slots.forEach((slot) => {
          const typed = (userAns[slot.blankLabel] || '').trim().toLowerCase();
          const expected = slot.correctWord.trim().toLowerCase();
          if (typed && (typed === expected || expected.includes(typed))) {
            blankCorrectTotal++;
          }
        });
      });
      finalScore = blankSlotsTotal > 0 ? (blankCorrectTotal / blankSlotsTotal) * 10.0 : 0;
      sectionBreakdown.push({
        type: 'Điền từ',
        score: finalScore,
        maxScore: 10.0,
        questionCount: blankQuestions.length,
        details: `Đúng ${blankCorrectTotal} / ${blankSlotsTotal} vị trí khuyết (Mỗi vị trí = ${(
          10 / (blankSlotsTotal || 1)
        ).toFixed(2)}đ)`,
      });
    }

    // CASE 4: ROOM 4 - GHÉP ĐÔI / NỐI TỪ (Quy về hệ 10)
    else if (activeRoomMode === 'Nối từ') {
      let matchCorrectTotal = 0;
      let matchPairsTotal = 0;
      matchQuestions.forEach((q) => {
        const userAns = matchingAnswers[q.id] || {};
        const pairs = q.matchingPairs || [];
        matchPairsTotal += pairs.length;
        pairs.forEach((p) => {
          const studentMatched = userAns[p.id];
          if (studentMatched && studentMatched === (p.matchedKey || 'A')) {
            matchCorrectTotal++;
          }
        });
      });
      finalScore = matchPairsTotal > 0 ? (matchCorrectTotal / matchPairsTotal) * 10.0 : 0;
      sectionBreakdown.push({
        type: 'Nối từ',
        score: finalScore,
        maxScore: 10.0,
        questionCount: matchQuestions.length,
        details: `Ghép đúng ${matchCorrectTotal} / ${matchPairsTotal} cặp sự kiện logic`,
      });
    }

    // CASE 5: ROOM 5 - TỰ LUẬN (Quy về hệ 10)
    else if (activeRoomMode === 'Tự luận') {
      let essayTotal = 0;
      essayQuestions.forEach((q) => {
        const text = (essayAnswers[q.id] || '').trim();
        const wordCount = text ? text.split(/\s+/).length : 0;
        let qScore = 0;
        if (wordCount >= 120) qScore = 9.0;
        else if (wordCount >= 80) qScore = 7.5;
        else if (wordCount >= 50) qScore = 6.0;
        else if (wordCount > 15) qScore = 4.5;
        else qScore = 2.0;

        // If AI feedback exists, prefer it
        if (aiFeedbackMap[q.id]) {
          qScore = aiFeedbackMap[q.id].score;
        }
        essayTotal += qScore;
      });
      finalScore = essayQuestions.length > 0 ? essayTotal / essayQuestions.length : 0;
      sectionBreakdown.push({
        type: 'Tự luận',
        score: finalScore,
        maxScore: 10.0,
        questionCount: essayQuestions.length,
        details: `Chấm thử Rubric: ${finalScore.toFixed(1)}/10đ (Đang lưu bài để Cô Thu duyệt chính thức)`,
      });
    }

    // CASE 6: TỔNG HỢP CẢ 5 DẠNG (ALL)
    else {
      let singleScore = 0;
      let singleMax = singleQuestions.length > 0 ? (singleQuestions.length === 24 ? 6.0 : 4.0) : 0;
      const ptPerSingle = singleQuestions.length > 0 ? singleMax / singleQuestions.length : 0;
      let singleCorrect = 0;
      singleQuestions.forEach((q) => {
        if (singleAnswers[q.id]?.toUpperCase() === q.correctAnswer.toUpperCase()) {
          singleScore += ptPerSingle;
          singleCorrect++;
        }
      });
      if (singleQuestions.length > 0) {
        sectionBreakdown.push({
          type: 'Trắc nghiệm đơn',
          score: singleScore,
          maxScore: singleMax,
          questionCount: singleQuestions.length,
          details: `Đúng ${singleCorrect} / ${singleQuestions.length} câu`,
        });
      }

      let tfScore = 0;
      let tfMax = tfQuestions.length > 0 ? (tfQuestions.length === 4 ? 4.0 : 3.0) : 0;
      const ptPerTf = tfQuestions.length > 0 ? tfMax / tfQuestions.length : 0;
      tfQuestions.forEach((q) => {
        const userAns = tfAnswers[q.id] || {};
        let correct = 0;
        q.trueFalseStatements?.forEach((stmt) => {
          if (userAns[stmt.id] !== undefined && userAns[stmt.id] === stmt.isCorrect) correct++;
        });
        let ratio = correct === 4 ? 1.0 : correct === 3 ? 0.5 : correct === 2 ? 0.25 : correct === 1 ? 0.1 : 0;
        tfScore += ratio * ptPerTf;
      });
      if (tfQuestions.length > 0) {
        sectionBreakdown.push({
          type: 'Trắc nghiệm đúng sai',
          score: tfScore,
          maxScore: tfMax,
          questionCount: tfQuestions.length,
          details: `Barem bậc thang: ${tfScore.toFixed(2)} / ${tfMax.toFixed(2)}đ`,
        });
      }

      let blankScore = 0;
      let blankMax = blankQuestions.length > 0 ? 1.5 : 0;
      let blankCorrect = 0, blankTotal = 0;
      blankQuestions.forEach((q) => {
        const userAns = blankAnswers[q.id] || {};
        (q.blankItems || []).forEach((slot) => {
          blankTotal++;
          if ((userAns[slot.blankLabel] || '').trim().toLowerCase() === slot.correctWord.trim().toLowerCase()) {
            blankCorrect++;
          }
        });
      });
      if (blankTotal > 0) blankScore = (blankCorrect / blankTotal) * blankMax;
      if (blankQuestions.length > 0) {
        sectionBreakdown.push({
          type: 'Điền từ',
          score: blankScore,
          maxScore: blankMax,
          questionCount: blankQuestions.length,
          details: `Đúng ${blankCorrect} / ${blankTotal} từ khuyết`,
        });
      }

      let matchScore = 0;
      let matchMax = matchQuestions.length > 0 ? 1.5 : 0;
      let matchCorrect = 0, matchTotal = 0;
      matchQuestions.forEach((q) => {
        const userAns = matchingAnswers[q.id] || {};
        (q.matchingPairs || []).forEach((p) => {
          matchTotal++;
          if (userAns[p.id] === (p.matchedKey || 'A')) matchCorrect++;
        });
      });
      if (matchTotal > 0) matchScore = (matchCorrect / matchTotal) * matchMax;
      if (matchQuestions.length > 0) {
        sectionBreakdown.push({
          type: 'Nối từ',
          score: matchScore,
          maxScore: matchMax,
          questionCount: matchQuestions.length,
          details: `Ghép đúng ${matchCorrect} / ${matchTotal} cặp`,
        });
      }

      const totalRaw = singleScore + tfScore + blankScore + matchScore;
      const totalMax = singleMax + tfMax + blankMax + matchMax;
      finalScore = totalMax > 0 ? (totalRaw / totalMax) * 10.0 : 0;
    }

    finalScore = Math.min(10.0, Math.max(0, Math.round(finalScore * 100) / 100));

    // Evaluation Comment
    let evaluationLevel: EvaluationLevel = 'Chưa đạt';
    let evaluationText = '';
    let pedagogicalComment = '';

    if (finalScore >= 8.0) {
      evaluationLevel = 'Tốt';
      evaluationText = 'Mức Tốt (Thông tư 43/2021 - GDTX)';
      pedagogicalComment =
        'Học viên nắm rất vững kiến thức lịch sử, phản xạ chuẩn xác và phân tích sâu sắc. Rất đáng khen ngợi!';
    } else if (finalScore >= 6.5) {
      evaluationLevel = 'Khá';
      evaluationText = 'Mức Khá (Thông tư 43/2021 - GDTX)';
      pedagogicalComment =
        'Học viên làm bài tốt, nắm chắc các sự kiện trọng tâm. Cần chú ý củng cố thêm các bẫy câu hỏi và các mốc chi tiết.';
    } else if (finalScore >= 5.0) {
      evaluationLevel = 'Đạt';
      evaluationText = 'Mức Đạt (Thông tư 43/2021 - GDTX)';
      pedagogicalComment =
        'Học viên đạt yêu cầu tối thiểu. Cô Thu khuyến khích em dành thêm 15 phút mỗi ngày làm lại dạng đề này để nâng cao điểm số.';
    } else {
      evaluationLevel = 'Chưa đạt';
      evaluationText = 'Mức Chưa đạt (Cần phụ đạo)';
      pedagogicalComment =
        'Học viên còn nhầm lẫn nhiều kiến thức cốt lõi. Cô Thu sẽ sắp xếp hướng dẫn ôn tập lại sơ đồ tư duy của chuyên đề này.';
    }

    return {
      totalScore: finalScore,
      maxScore: 10.0,
      sectionBreakdown,
      evaluationLevel,
      evaluationText,
      pedagogicalComment,
    };
  }, [
    examQuestions,
    singleAnswers,
    tfAnswers,
    blankAnswers,
    matchingAnswers,
    essayAnswers,
    activeRoomMode,
    aiFeedbackMap,
  ]);

  // -------------------------------------------------------------------------
  // 8. SUBMISSION & SAVE TO GRADEBOOK
  // -------------------------------------------------------------------------
  const [isConfirmSubmitOpen, setIsConfirmSubmitOpen] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const handleSubmitExam = () => {
    setIsConfirmSubmitOpen(false);
    setIsSubmitted(true);
    setIsTimerPaused(true);
  };

  const handleAutoSubmit = () => {
    setIsSubmitted(true);
    setIsTimerPaused(true);
    alert('⏱ Đã hết thời gian làm bài! Hệ thống tự động thu bài và chuyển sang xem bảng điểm.');
  };

  const handleSaveScoreToGradebook = () => {
    if (!currentStudent) {
      alert('Chưa có thông tin học viên để lưu điểm!');
      return;
    }

    const examTitleSaved = `${computedRoomTitle} (${durationMinutes}p)`;
    const examCode = `KT_ROOM_${activeRoomMode === 'Trắc nghiệm đơn' ? 'TN' : activeRoomMode === 'Trắc nghiệm đúng sai' ? 'DS' : activeRoomMode === 'Điền từ' ? 'DT' : activeRoomMode === 'Nối từ' ? 'ND' : activeRoomMode === 'Tự luận' ? 'TL' : 'ALL'}_${Date.now().toString().slice(-4)}`;

    const examId = `ex_room_${Date.now()}`;
    addExam({
      code: examCode,
      title: examTitleSaved,
      classId: selectedClassId,
      className: classes.find((c) => c.id === selectedClassId)?.name || 'Lớp GDTX',
      grade: currentStudent.grade || 12,
      date: new Date().toISOString().split('T')[0],
      type: durationMinutes <= 20 ? '15 phút' : '1 tiết (45 phút)',
      format: activeRoomMode === 'Tự luận' ? 'Tự luận' : activeRoomMode === 'all' ? 'Kết hợp' : 'Trắc nghiệm',
      maxScore: 10,
      weight: 1,
      description: `Kiểm tra tại ${computedRoomTitle}`,
    });

    updateStudentScore(
      currentStudent.id,
      examId,
      evaluationResult.totalScore,
      `${computedRoomTitle}: ${evaluationResult.evaluationText} - ${evaluationResult.pedagogicalComment.slice(0, 40)}...`
    );

    setSaveSuccessMsg(
      `Đã lưu điểm ${evaluationResult.totalScore.toFixed(2)} (${evaluationResult.evaluationLevel}) vào Sổ điểm điện tử cho học viên ${currentStudent.fullName}!`
    );
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  // Keyboard shortcut listener for Single Choice Room
  useEffect(() => {
    if (!isOpen || isSubmitted || displayMode !== 'single') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      const activeQ = examQuestions[currentQuestionIndex];
      if (!activeQ) return;

      const key = e.key.toUpperCase();
      if (['A', 'B', 'C', 'D'].includes(key) && (activeQ.type === 'Trắc nghiệm đơn' || activeQ.type === 'Trắc nghiệm')) {
        setSingleAnswers((prev) => ({ ...prev, [activeQ.id]: key }));
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        if (currentQuestionIndex < examQuestions.length - 1) {
          setCurrentQuestionIndex((prev) => prev + 1);
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        if (currentQuestionIndex > 0) {
          setCurrentQuestionIndex((prev) => prev - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitted, displayMode, currentQuestionIndex, examQuestions]);

  if (!isOpen) return null;

  // Theme-based CSS classes
  const themeClasses = {
    sepia: 'bg-[#FBF8EF] text-[#2C2416] border-[#E8DFC8]',
    white: 'bg-white text-slate-800 border-slate-200',
    dark: 'bg-[#181C24] text-slate-100 border-slate-700',
  }[theme];

  const themeCardClasses = {
    sepia: 'bg-[#FFFDF9] border-[#E4D9C0] shadow-xs',
    white: 'bg-white border-slate-200 shadow-xs',
    dark: 'bg-[#222733] border-slate-700 shadow-xs text-slate-100',
  }[theme];

  const fontSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  }[fontSize];

  return (
    <div
      ref={modalContainerRef}
      className={`fixed inset-0 z-50 flex flex-col overflow-hidden ${themeClasses} font-serif`}
    >
      {/* ------------------------------------------------------------------- */}
      {/* 1. TOP STICKY HEADER: EXAM INFO, ROOM SWITCHER & CONTROLS           */}
      {/* ------------------------------------------------------------------- */}
      <header
        className={`px-4 py-2.5 border-b shrink-0 flex flex-col gap-2 ${
          theme === 'dark' ? 'bg-[#141820] border-slate-700' : 'bg-white/95 border-slate-200'
        } backdrop-blur-md shadow-xs no-print`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Title & Student Info */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#073B66] to-[#0878C9] text-white flex items-center justify-center font-bold shadow-xs">
              <Award className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-sans text-[11px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-[#073B66]">
                  GDTX Tiên Yên
                </span>
                <span className="font-sans text-[11px] font-medium text-slate-500">
                  Học viên: <strong>{currentStudent?.fullName || 'Học viên'}</strong> ({currentStudent?.code})
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold truncate max-w-[280px] sm:max-w-lg font-sans">
                {computedRoomTitle}
              </h2>
            </div>
          </div>

          {/* Center: Smart Countdown Timer */}
          <div className="flex items-center gap-2 font-sans">
            <div
              className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 font-bold transition-all ${timerStatusColor}`}
            >
              <Clock className="w-4 h-4 shrink-0" />
              <div className="flex flex-col text-left">
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                  {durationMinutes === 0 ? 'Thời gian' : 'Thời gian còn lại'}
                </span>
                <span className="text-base font-black tracking-wider leading-none">
                  {formattedTime}
                </span>
              </div>
            </div>

            {/* Teacher actions to add time (GDTX support) */}
            <div className="hidden sm:flex items-center gap-1 text-[11px]">
              <button
                onClick={() => handleAddExtraTime(5)}
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold cursor-pointer transition-colors"
                title="Cộng thêm 5 phút cho học viên"
              >
                +5p
              </button>
              <button
                onClick={() => handleAddExtraTime(10)}
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold cursor-pointer transition-colors"
                title="Cộng thêm 10 phút cho học viên"
              >
                +10p
              </button>
            </div>
          </div>

          {/* Right: Accessibility Controls & Actions */}
          <div className="flex items-center gap-2 font-sans">
            {/* View Mode Toggle */}
            <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5 border border-slate-200 dark:border-slate-700 text-xs font-bold">
              <button
                onClick={() => setDisplayMode('single')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  displayMode === 'single'
                    ? 'bg-white dark:bg-slate-700 text-[#073B66] dark:text-sky-300 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Tập trung 1 câu duy nhất"
              >
                Tập trung
              </button>
              <button
                onClick={() => setDisplayMode('scroll')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  displayMode === 'scroll'
                    ? 'bg-white dark:bg-slate-700 text-[#073B66] dark:text-sky-300 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Xem cuộn tất cả câu hỏi"
              >
                Cuộn trang
              </button>
            </div>

            {/* Font Size Selector */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5 border border-slate-200 dark:border-slate-700 text-xs">
              <button
                onClick={() =>
                  setFontSize((prev) =>
                    prev === 'xl' ? 'lg' : prev === 'lg' ? 'md' : 'sm'
                  )
                }
                className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg cursor-pointer transition-colors"
                title="Giảm cỡ chữ"
              >
                <Type className="w-3.5 h-3.5" />
              </button>
              <span className="px-1.5 font-bold uppercase text-[10px] text-slate-600 dark:text-slate-300">
                {fontSize}
              </span>
              <button
                onClick={() =>
                  setFontSize((prev) =>
                    prev === 'sm' ? 'md' : prev === 'md' ? 'lg' : 'xl'
                  )
                }
                className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg cursor-pointer transition-colors font-bold"
                title="Tăng cỡ chữ"
              >
                A+
              </button>
            </div>

            {/* Theme switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5 border border-slate-200 dark:border-slate-700 text-xs">
              <button
                onClick={() => setTheme('sepia')}
                className={`p-1.5 rounded-lg cursor-pointer ${
                  theme === 'sepia'
                    ? 'bg-[#F5EEDC] text-amber-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Màu ấm Sepia (Bảo vệ mắt)"
              >
                <Sun className="w-3.5 h-3.5 text-amber-600" />
              </button>
              <button
                onClick={() => setTheme('white')}
                className={`p-1.5 rounded-lg cursor-pointer ${
                  theme === 'white'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Giao diện Trắng tiêu chuẩn"
              >
                <div className="w-3.5 h-3.5 rounded-full border border-slate-400 bg-white" />
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`p-1.5 rounded-lg cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-slate-700 text-sky-300 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Chế độ Tối (Ban đêm)"
              >
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
              </button>
            </div>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-600 dark:text-slate-300 cursor-pointer transition-colors"
              title="Bật/Tắt toàn màn hình"
            >
              {isFullscreen ? (
                <Minimize className="w-4 h-4" />
              ) : (
                <Maximize className="w-4 h-4" />
              )}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 rounded-xl cursor-pointer transition-colors"
              title="Đóng phòng thi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* ROOM SELECTOR QUICK-SWITCH BAR                                    */}
        {/* ----------------------------------------------------------------- */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 font-sans border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1">
            Chuyển phòng:
          </span>

          <button
            onClick={() => setActiveRoomMode('Trắc nghiệm đơn')}
            className={`px-3 py-1 rounded-xl font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeRoomMode === 'Trắc nghiệm đơn'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Phòng 1: Trắc nghiệm đơn
          </button>

          <button
            onClick={() => setActiveRoomMode('Trắc nghiệm đúng sai')}
            className={`px-3 py-1 rounded-xl font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeRoomMode === 'Trắc nghiệm đúng sai'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Phòng 2: Đúng / Sai tư liệu
          </button>

          <button
            onClick={() => setActiveRoomMode('Điền từ')}
            className={`px-3 py-1 rounded-xl font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeRoomMode === 'Điền từ'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            Phòng 3: Điền từ
          </button>

          <button
            onClick={() => setActiveRoomMode('Nối từ')}
            className={`px-3 py-1 rounded-xl font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeRoomMode === 'Nối từ'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            Phòng 4: Ghép đôi
          </button>

          <button
            onClick={() => setActiveRoomMode('Tự luận')}
            className={`px-3 py-1 rounded-xl font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeRoomMode === 'Tự luận'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            Phòng 5: Tự luận
          </button>

          <button
            onClick={() => setActiveRoomMode('all')}
            className={`px-3 py-1 rounded-xl font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeRoomMode === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Tất cả (5 Dạng gộp)
          </button>
        </div>
      </header>

      {/* ------------------------------------------------------------------- */}
      {/* 2. MAIN BODY: EXAM IN PROGRESS OR DETAILED SCORECARD                */}
      {/* ------------------------------------------------------------------- */}
      <div className="flex-1 flex overflow-hidden">
        {!isSubmitted ? (
          <>
            {/* Left Area: Questions Render Container */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-6">
              {/* MODE 1: SINGLE QUESTION FOCUS VIEW */}
              {displayMode === 'single' && (
                <div className="max-w-4xl mx-auto space-y-4">
                  {/* Progress Indicator */}
                  <div className="flex items-center justify-between text-xs text-slate-500 font-sans pb-2">
                    <span className="font-bold text-[#073B66] dark:text-sky-300">
                      Câu {currentQuestionIndex + 1} / {examQuestions.length}
                    </span>
                    <span className="flex items-center gap-2">
                      <span>Đã làm: <strong>{answeredCount}</strong> / {examQuestions.length}</span>
                      <span className="text-slate-300">•</span>
                      <span>Hoàn thành: <strong>{Math.round((answeredCount / (examQuestions.length || 1)) * 100)}%</strong></span>
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#0878C9] h-full transition-all duration-300"
                      style={{
                        width: `${((currentQuestionIndex + 1) / (examQuestions.length || 1)) * 100}%`,
                      }}
                    />
                  </div>

                  {/* The Current Active Question Card */}
                  {examQuestions[currentQuestionIndex] &&
                    renderQuestionCard(
                      examQuestions[currentQuestionIndex],
                      currentQuestionIndex,
                      true
                    )}

                  {/* Bottom Navigation & Submit Actions */}
                  <div className="flex items-center justify-between pt-4 font-sans border-t border-slate-200 dark:border-slate-700">
                    <button
                      onClick={() =>
                        setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
                      }
                      disabled={currentQuestionIndex === 0}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Câu trước
                    </button>

                    <div className="flex items-center gap-2">
                      {/* Flag for review button */}
                      <button
                        onClick={() =>
                          toggleFlagQuestion(examQuestions[currentQuestionIndex].id)
                        }
                        className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                          flaggedQuestionIds.includes(
                            examQuestions[currentQuestionIndex].id
                          )
                            ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-xs'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Flag
                          className={`w-3.5 h-3.5 ${
                            flaggedQuestionIds.includes(
                              examQuestions[currentQuestionIndex].id
                            )
                              ? 'fill-amber-600 text-amber-600'
                              : 'text-slate-400'
                          }`}
                        />
                        {flaggedQuestionIds.includes(
                          examQuestions[currentQuestionIndex].id
                        )
                          ? 'Đã gắn cờ'
                          : 'Gắn cờ xem lại'}
                      </button>
                    </div>

                    {currentQuestionIndex < examQuestions.length - 1 ? (
                      <button
                        onClick={() =>
                          setCurrentQuestionIndex((prev) =>
                            Math.min(examQuestions.length - 1, prev + 1)
                          )
                        }
                        className="px-5 py-2.5 bg-[#0878C9] hover:bg-[#073B66] text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
                      >
                        Câu tiếp theo
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setIsConfirmSubmitOpen(true)}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
                      >
                        <Send className="w-4 h-4" />
                        Hoàn thành & Nộp bài
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* MODE 2: SCROLL VIEW (ALL QUESTIONS ON ONE PAGE) */}
              {displayMode === 'scroll' && (
                <div className="max-w-4xl mx-auto space-y-6">
                  {examQuestions.map((q, idx) => (
                    <div key={q.id || idx} id={`q_card_${idx}`}>
                      {renderQuestionCard(q, idx, false)}
                    </div>
                  ))}
                  <div className="text-center pt-6 font-sans">
                    <button
                      onClick={() => setIsConfirmSubmitOpen(true)}
                      className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm shadow-md hover:shadow-lg transition-all cursor-pointer inline-flex items-center gap-2"
                    >
                      <Send className="w-5 h-5" />
                      Hoàn thành bài thi và Nộp bài ngay
                    </button>
                  </div>
                </div>
              )}
            </main>

            {/* Right Side: Question Navigation Matrix */}
            <aside
              className={`w-full md:w-72 border-t md:border-t-0 md:border-l p-4 flex flex-col justify-between shrink-0 font-sans ${
                theme === 'dark' ? 'bg-[#141820] border-slate-700' : 'bg-white/80 border-slate-200'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                  <h4 className="font-bold text-xs uppercase text-[#073B66] dark:text-sky-300">
                    Bảng câu hỏi ({examQuestions.length})
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    {flaggedQuestionIds.length > 0 && (
                      <span className="text-amber-600 font-bold flex items-center gap-1">
                        <Flag className="w-3 h-3 fill-amber-500" /> {flaggedQuestionIds.length} cờ
                      </span>
                    )}
                  </span>
                </div>

                {/* Grid of numbers */}
                <div className="grid grid-cols-5 gap-1.5 max-h-[50vh] overflow-y-auto pr-1">
                  {examQuestions.map((q, idx) => {
                    const isAnswered = isQuestionAnswered(q);
                    const isFlagged = flaggedQuestionIds.includes(q.id);
                    const isCurrent = displayMode === 'single' && currentQuestionIndex === idx;

                    let btnStyle = 'bg-slate-100 text-slate-700 border-slate-200';
                    if (isAnswered) {
                      btnStyle = 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-2xs';
                    }
                    if (isFlagged) {
                      btnStyle = 'bg-amber-400 text-amber-950 border-amber-500 font-bold ring-2 ring-amber-300';
                    }
                    if (isCurrent) {
                      btnStyle += ' ring-2 ring-[#0878C9] border-[#0878C9] scale-105';
                    }

                    return (
                      <button
                        key={q.id || idx}
                        onClick={() => {
                          if (displayMode === 'single') {
                            setCurrentQuestionIndex(idx);
                          } else {
                            document
                              .getElementById(`q_card_${idx}`)
                              ?.scrollIntoView({ behavior: 'smooth' });
                          }
                        }}
                        className={`py-2 rounded-xl border text-xs font-bold transition-all relative cursor-pointer ${btnStyle}`}
                      >
                        {idx + 1}
                        {isFlagged && (
                          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-1.5 text-[11px] text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded bg-emerald-600 shrink-0" />
                    <span>Đã hoàn thành</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded bg-slate-100 border border-slate-300 shrink-0" />
                    <span>Chưa làm</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded bg-amber-400 border border-amber-500 shrink-0" />
                    <span>Cần xem lại (🚩)</span>
                  </div>
                </div>

                {/* Room Shortcuts notice */}
                {activeRoomMode === 'Trắc nghiệm đơn' && (
                  <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-[11px] text-blue-900 dark:text-blue-300">
                    💡 <strong>Phím tắt nhanh:</strong> Bấm trực tiếp <strong>A, B, C, D</strong> trên bàn phím để chọn đáp án tức thì!
                  </div>
                )}
              </div>

              {/* Submit CTA */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setIsConfirmSubmitOpen(true)}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  Nộp bài thi
                </button>
              </div>
            </aside>
          </>
        ) : (
          /* =============================================================== */
          /* DETAILED SCORECARD & PEDAGOGICAL REVIEW                         */
          /* =============================================================== */
          <main className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
            {/* Top Score Banner */}
            <div className="bg-gradient-to-r from-[#073B66] via-[#0878C9] to-teal-700 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 font-sans">
              <div className="space-y-2 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  <span>KẾT QUẢ ĐÁNH GIÁ CHUYÊN BIỆT: {computedRoomTitle}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black font-serif">
                  {currentStudent?.fullName || 'Học viên'} ({currentStudent?.code || 'GDTX'})
                </h3>
                <p className="text-xs sm:text-sm text-sky-100 max-w-xl">
                  {evaluationResult.pedagogicalComment}
                </p>
                <div className="text-xs text-sky-200 pt-1">
                  Đánh giá theo: <strong>{evaluationResult.evaluationText}</strong> • Thời gian làm: {Math.floor(timeSpentSeconds / 60)} phút {timeSpentSeconds % 60} giây
                </div>
              </div>

              {/* Score Dial */}
              <div className="flex flex-col items-center shrink-0">
                <div className="w-28 h-28 rounded-3xl bg-white text-slate-900 flex flex-col items-center justify-center shadow-2xl border-4 border-amber-300">
                  <span className="text-3xl sm:text-4xl font-black text-[#073B66] leading-none">
                    {evaluationResult.totalScore.toFixed(2)}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400 mt-1 uppercase">
                    Thang điểm 10
                  </span>
                </div>
                <span
                  className={`mt-2 px-3 py-0.5 rounded-full text-xs font-black uppercase ${
                    evaluationResult.evaluationLevel === 'Tốt'
                      ? 'bg-emerald-400 text-slate-950'
                      : evaluationResult.evaluationLevel === 'Khá'
                      ? 'bg-blue-300 text-slate-950'
                      : evaluationResult.evaluationLevel === 'Đạt'
                      ? 'bg-amber-300 text-slate-950'
                      : 'bg-rose-400 text-slate-950'
                  }`}
                >
                  Xếp loại: {evaluationResult.evaluationLevel}
                </span>
              </div>
            </div>

            {/* Actions: Save Score / Retake */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white/80 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 font-sans">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveScoreToGradebook}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
                >
                  <Save className="w-4 h-4" />
                  Lưu điểm vào Sổ điểm điện tử
                </button>
                {saveSuccessMsg && (
                  <span className="text-xs font-bold text-emerald-700 animate-in fade-in">
                    ✓ {saveSuccessMsg}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setSecondsRemaining(durationMinutes > 0 ? durationMinutes * 60 : 0);
                  }}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Làm lại bài thi này
                </button>
                <button
                  onClick={onClose}
                  className="px-3.5 py-2 bg-[#073B66] hover:bg-[#0878C9] text-white rounded-xl font-bold text-xs cursor-pointer transition-colors"
                >
                  Đóng phòng thi
                </button>
              </div>
            </div>

            {/* Section Breakdown Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 font-sans">
              {evaluationResult.sectionBreakdown.map((sec, i) => (
                <div key={i} className={`p-4 rounded-2xl border ${themeCardClasses}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-[#073B66] dark:text-sky-300">
                      {sec.type}
                    </span>
                    <span className="text-xs font-black text-emerald-700 dark:text-emerald-400">
                      {sec.score.toFixed(2)} / {sec.maxScore.toFixed(2)}đ
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">{sec.details}</p>
                </div>
              ))}
            </div>

            {/* Answer Key Review with Teacher Explanations */}
            <div className={`p-5 rounded-3xl border space-y-4 ${themeCardClasses}`}>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700 font-sans">
                <div>
                  <h4 className="font-bold text-sm text-[#073B66] dark:text-sky-300">
                    Chi tiết bài làm & Lời giải thích lịch sử của Cô Thu
                  </h4>
                  <p className="text-xs text-slate-500">
                    Đối chiếu câu trả lời của em với đáp án chuẩn và chú giải tư liệu SGK.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {examQuestions.map((q, idx) => (
                  <div
                    key={q.id || idx}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-2 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        <span className="text-[#0878C9] font-sans">Câu {idx + 1}:</span> {q.content}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200 shrink-0">
                        {q.type}
                      </span>
                    </div>

                    {/* Single choice review */}
                    {(q.type === 'Trắc nghiệm đơn' || q.type === 'Trắc nghiệm') && q.options && (
                      <div className="space-y-1 pl-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 font-sans">
                          {q.options.map((opt, oi) => {
                            const letter = opt.trim().slice(0, 1);
                            const isUserPick = singleAnswers[q.id] === letter;
                            const isRight = q.correctAnswer === letter;

                            let optColor = 'bg-white dark:bg-slate-700 border-slate-200 text-slate-700';
                            if (isRight) {
                              optColor = 'bg-emerald-100 border-emerald-300 text-emerald-900 font-bold';
                            } else if (isUserPick && !isRight) {
                              optColor = 'bg-rose-100 border-rose-300 text-rose-900 font-bold';
                            }

                            return (
                              <div key={oi} className={`p-2 rounded-xl border text-xs ${optColor}`}>
                                {opt} {isUserPick && '(Em chọn)'} {isRight && '✓ Đáp án đúng'}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* True/False review */}
                    {q.type === 'Trắc nghiệm đúng sai' && q.trueFalseStatements && (
                      <div className="space-y-1.5 font-sans pl-2">
                        {q.trueFalseStatements.map((stmt) => {
                          const userVal = (tfAnswers[q.id] || {})[stmt.id];
                          const isMatch = userVal === stmt.isCorrect;
                          return (
                            <div
                              key={stmt.id}
                              className={`p-2 rounded-xl border flex items-center justify-between text-xs ${
                                isMatch
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                                  : 'bg-rose-50 border-rose-200 text-rose-900'
                              }`}
                            >
                              <span>
                                <strong>{stmt.id})</strong> {stmt.statement}
                              </span>
                              <span className="font-bold">
                                Em chọn: {userVal === true ? 'Đúng' : userVal === false ? 'Sai' : 'Bỏ trống'} • Chuẩn:{' '}
                                {stmt.isCorrect ? 'ĐÚNG' : 'SAI'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Fill blank review */}
                    {q.type === 'Điền từ' && q.blankItems && (
                      <div className="space-y-1 pl-2 font-sans">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {q.blankItems.map((slot) => {
                            const val = (blankAnswers[q.id] || {})[slot.blankLabel] || '';
                            const isMatch = val.trim().toLowerCase() === slot.correctWord.trim().toLowerCase();
                            return (
                              <div
                                key={slot.id}
                                className={`p-2 rounded-xl border ${
                                  isMatch
                                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                                    : 'bg-rose-50 border-rose-300 text-rose-900'
                                }`}
                              >
                                <span className="font-bold">{slot.blankLabel}:</span> {val || '(Chưa điền)'}
                                {!isMatch && (
                                  <div className="text-[10px] text-emerald-700 font-bold mt-0.5">
                                    Đúng: {slot.correctWord}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Teacher Explanation */}
                    {q.explanation && (
                      <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-sky-900 dark:text-sky-200 italic font-serif">
                        💡 <strong>Giải thích sư phạm:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </main>
        )}
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 3. CONFIRM SUBMIT MODAL (ALERTS UNANSWERED QUESTIONS)               */}
      {/* ------------------------------------------------------------------- */}
      {isConfirmSubmitOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Xác nhận nộp bài thi
              </h3>
              <p className="text-xs text-slate-500">
                Em đã làm được <strong>{answeredCount}</strong> / {examQuestions.length} câu hỏi.
              </p>
            </div>

            {answeredCount < examQuestions.length && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium">
                ⚠️ Chú ý: Em vẫn còn <strong>{examQuestions.length - answeredCount} câu chưa làm</strong>.
                Nếu nộp bài bây giờ, những câu chưa làm sẽ được tính 0 điểm.
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setIsConfirmSubmitOpen(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer transition-colors"
              >
                Quay lại làm tiếp
              </button>
              <button
                onClick={handleSubmitExam}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs cursor-pointer transition-colors shadow-xs"
              >
                Xác nhận nộp bài
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // -------------------------------------------------------------------------
  // 9. RENDER QUESTION CARD HELPERS (SPECIALIZED FOR EACH OF THE 5 ROOMS)
  // -------------------------------------------------------------------------
  function renderQuestionCard(q: Question, idx: number, isFocusView: boolean) {
    const isSingle = q.type === 'Trắc nghiệm đơn' || q.type === 'Trắc nghiệm';
    const isTF = q.type === 'Trắc nghiệm đúng sai';
    const isBlank = q.type === 'Điền từ';
    const isMatch = q.type === 'Nối từ';
    const isEssay = q.type === 'Tự luận';

    return (
      <div
        className={`p-5 sm:p-6 rounded-3xl border transition-all ${themeCardClasses} ${fontSizeClasses}`}
      >
        {/* Header: Type and question number */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200/60 dark:border-slate-700/60 font-sans mb-3">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-[#073B66] text-white flex items-center justify-center font-bold text-xs">
              {idx + 1}
            </span>
            <span className="font-bold text-xs text-[#0878C9] uppercase">
              {isSingle
                ? 'Phòng 1: Trắc nghiệm 1 đáp án'
                : isTF
                ? 'Phòng 2: Đúng / Sai tư liệu chuẩn 2025'
                : isBlank
                ? 'Phòng 3: Điền từ vào chỗ trống'
                : isMatch
                ? 'Phòng 4: Ghép đôi sự kiện'
                : 'Phòng 5: Tự luận chuyên sâu'}
            </span>
            <span className="text-[11px] text-slate-400 font-normal">
              ({q.cognitiveLevel || 'Nhận biết'})
            </span>
          </div>

          <div className="flex items-center gap-2">
            {flaggedQuestionIds.includes(q.id) && (
              <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Flag className="w-3 h-3 fill-amber-500" /> Cần xem lại
              </span>
            )}
          </div>
        </div>

        {/* Content & Stimulus */}
        <div className="space-y-3">
          {/* 1. DẠNG TRẮC NGHIỆM ĐƠN */}
          {isSingle && (
            <div>
              <div className="font-serif leading-relaxed text-slate-900 dark:text-slate-100 whitespace-pre-line font-medium mb-3">
                {q.content}
              </div>

              {q.options && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 font-sans">
                  {(['A', 'B', 'C', 'D'] as const).map((letter, optIdx) => {
                    const optText = q.options?.[optIdx] || '';
                    const cleanText = optText.replace(/^[A-D]\.\s*/, '');
                    const isSelected = singleAnswers[q.id] === letter;

                    return (
                      <button
                        key={letter}
                        type="button"
                        onClick={() =>
                          setSingleAnswers((prev) => ({
                            ...prev,
                            [q.id]: letter,
                          }))
                        }
                        className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-sky-50 dark:bg-sky-950/60 border-[#0878C9] ring-2 ring-sky-300 dark:ring-sky-700 shadow-sm'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-[#0878C9] text-white'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                          }`}
                        >
                          {letter}
                        </span>
                        <span className="flex-1 font-serif leading-snug">{cleanText}</span>
                        {isSelected && (
                          <CheckCircle className="w-4 h-4 text-[#0878C9] shrink-0 mt-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 2. DẠNG ĐÚNG / SAI CÓ TƯ LIỆU VÀ BÚT DẠ QUANG HIGHLIGHT */}
          {isTF && (
            <div className="space-y-4">
              {/* Document Reading Pane with Highlighter Bar */}
              <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/70 pb-2 font-sans">
                  <span className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-amber-600" />
                    ĐOẠN TRÍCH TƯ LIỆU LỊCH SỬ (ĐỌC KỸ TRƯỚC KHI TRẢ LỜI):
                  </span>

                  {/* Highlighter selection tool */}
                  <div className="flex items-center gap-1 text-[11px]">
                    <span className="text-slate-500 font-medium">Bút đánh dấu:</span>
                    <button
                      type="button"
                      onClick={() => setHighlighterColor('yellow')}
                      className={`px-2 py-0.5 rounded-md font-bold cursor-pointer border ${
                        highlighterColor === 'yellow'
                          ? 'bg-amber-200 text-amber-950 border-amber-400 ring-1 ring-amber-400'
                          : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      Bút vàng
                    </button>
                    <button
                      type="button"
                      onClick={() => setHighlighterColor('cyan')}
                      className={`px-2 py-0.5 rounded-md font-bold cursor-pointer border ${
                        highlighterColor === 'cyan'
                          ? 'bg-sky-200 text-sky-950 border-sky-400 ring-1 ring-sky-400'
                          : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      Bút xanh
                    </button>
                  </div>
                </div>

                {/* Stimulus text */}
                <div className="font-serif leading-relaxed text-slate-900 dark:text-slate-100 whitespace-pre-line text-sm sm:text-base italic pl-2 border-l-4 border-amber-500 bg-white/70 dark:bg-slate-800/60 p-3 rounded-r-xl">
                  {q.content}
                </div>

                {/* MOET Staircase Live Tracker */}
                <div className="flex items-center justify-between text-[11px] font-sans text-amber-900 dark:text-amber-300 pt-1">
                  <span>Barem điểm Bộ GD&ĐT:</span>
                  <div className="flex items-center gap-2 font-bold">
                    <span>1 ý = 0.1đ</span>
                    <span>•</span>
                    <span>2 ý = 0.25đ</span>
                    <span>•</span>
                    <span>3 ý = 0.5đ</span>
                    <span>•</span>
                    <span className="text-emerald-700 dark:text-emerald-400">4 ý = 1.0đ</span>
                  </div>
                </div>
              </div>

              {/* 4 Statements a, b, c, d with [ĐÚNG] and [SAI] buttons */}
              {q.trueFalseStatements && (
                <div className="space-y-2.5 font-sans">
                  <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase">
                    Xác định mỗi nhận định sau là ĐÚNG hay SAI căn cứ vào tư liệu lịch sử trên:
                  </div>

                  <div className="space-y-2">
                    {q.trueFalseStatements.map((stmt) => {
                      const currentPick = (tfAnswers[q.id] || {})[stmt.id];

                      return (
                        <div
                          key={stmt.id}
                          className="p-3.5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:border-slate-300"
                        >
                          <div className="flex-1 font-serif leading-relaxed text-xs sm:text-sm">
                            <strong className="mr-2 uppercase font-sans text-purple-800 dark:text-purple-300 text-sm">
                              {stmt.id})
                            </strong>
                            {stmt.statement}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {/* Button ĐÚNG */}
                            <button
                              type="button"
                              onClick={() =>
                                setTfAnswers((prev) => ({
                                  ...prev,
                                  [q.id]: {
                                    ...prev[q.id],
                                    [stmt.id]: true,
                                  },
                                }))
                              }
                              className={`px-5 py-2 rounded-xl border text-xs font-black transition-all cursor-pointer ${
                                currentPick === true
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-300'
                                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 hover:bg-emerald-50 hover:text-emerald-800'
                              }`}
                            >
                              ĐÚNG {currentPick === true && '✓'}
                            </button>

                            {/* Button SAI */}
                            <button
                              type="button"
                              onClick={() =>
                                setTfAnswers((prev) => ({
                                  ...prev,
                                  [q.id]: {
                                    ...prev[q.id],
                                    [stmt.id]: false,
                                  },
                                }))
                              }
                              className={`px-5 py-2 rounded-xl border text-xs font-black transition-all cursor-pointer ${
                                currentPick === false
                                  ? 'bg-rose-600 text-white border-rose-600 shadow-xs ring-2 ring-rose-300'
                                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 hover:bg-rose-50 hover:text-rose-800'
                              }`}
                            >
                              SAI {currentPick === false && '✗'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. DẠNG ĐIỀN TỪ VÀO CHỖ TRỐNG CÓ WORD BANK TƯƠNG TÁC */}
          {isBlank && (
            <div className="space-y-3 font-sans">
              <div className="font-serif leading-relaxed text-slate-900 dark:text-slate-100 whitespace-pre-line text-sm sm:text-base mb-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                {q.content}
              </div>

              {/* Word Bank chips */}
              {q.wordBank && q.wordBank.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-amber-900 dark:text-amber-300 text-xs flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      Ngân hàng từ khóa gợi ý (Bấm vào từ để điền trực tiếp):
                    </span>
                    <span className="text-[10px] text-amber-800">
                      Bấm từ sẽ tự điền vào ô trống tiếp theo
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {q.wordBank.map((w, wi) => (
                      <button
                        key={wi}
                        type="button"
                        onClick={() => {
                          const currentSlots = blankAnswers[q.id] || {};
                          const slots = q.blankItems || [];
                          // Fill into active slot if exists, otherwise first empty
                          let targetSlot = activeBlankSlot && activeBlankSlot.qId === q.id
                            ? slots.find((s) => s.blankLabel === activeBlankSlot.blankLabel)
                            : slots.find((s) => !currentSlots[s.blankLabel]);

                          if (!targetSlot && slots.length > 0) {
                            targetSlot = slots[0];
                          }

                          if (targetSlot) {
                            setBlankAnswers((prev) => ({
                              ...prev,
                              [q.id]: {
                                ...prev[q.id],
                                [targetSlot.blankLabel]: w,
                              },
                            }));
                          }
                        }}
                        className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 rounded-xl text-xs font-bold text-amber-900 dark:text-amber-200 hover:bg-amber-100 hover:border-amber-400 cursor-pointer shadow-2xs transition-all active:scale-95"
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Blank slots inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {q.blankItems?.map((slot) => {
                  const val = (blankAnswers[q.id] || {})[slot.blankLabel] || '';
                  const isActive = activeBlankSlot?.qId === q.id && activeBlankSlot?.blankLabel === slot.blankLabel;

                  return (
                    <div
                      key={slot.id}
                      className={`p-3 bg-white dark:bg-slate-800 rounded-2xl border transition-all flex items-center gap-2.5 ${
                        isActive
                          ? 'border-emerald-500 ring-2 ring-emerald-300 shadow-xs'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-900 font-bold text-xs shrink-0">
                        {slot.blankLabel}
                      </span>
                      <input
                        type="text"
                        value={val}
                        onFocus={() => setActiveBlankSlot({ qId: q.id, blankLabel: slot.blankLabel })}
                        onChange={(e) =>
                          setBlankAnswers((prev) => ({
                            ...prev,
                            [q.id]: {
                              ...prev[q.id],
                              [slot.blankLabel]: e.target.value,
                            },
                          }))
                        }
                        placeholder="Gõ hoặc bấm từ gợi ý ở trên..."
                        className="flex-1 bg-transparent border-none outline-none text-xs font-serif text-slate-900 dark:text-slate-100"
                      />
                      {val && (
                        <button
                          type="button"
                          onClick={() =>
                            setBlankAnswers((prev) => ({
                              ...prev,
                              [q.id]: {
                                ...prev[q.id],
                                [slot.blankLabel]: '',
                              },
                            }))
                          }
                          className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                          title="Xóa ô này"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. DẠNG GHÉP ĐÔI / NỐI TỪ VỚI THAO TÁC TRỰC QUAN */}
          {isMatch && (
            <div className="space-y-3 font-sans">
              <div className="font-serif leading-relaxed text-slate-900 dark:text-slate-100 mb-2 font-medium">
                {q.content}
              </div>

              <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-[11px] text-purple-900 dark:text-purple-300 font-bold flex items-center gap-1.5">
                <ArrowRightLeft className="w-4 h-4 text-purple-600 shrink-0" />
                Hướng dẫn: Chọn đáp án tương ứng từ Cột B để ghép với từng mục ở Cột A:
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Column A (Left items with selector) */}
                <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2.5">
                  <div className="font-bold text-xs text-[#073B66] dark:text-sky-300 pb-2 border-b">
                    Cột A: Mốc sự kiện / Nhân vật
                  </div>
                  {q.matchingPairs?.map((p) => {
                    const currentMatched = (matchingAnswers[q.id] || {})[p.id];
                    return (
                      <div
                        key={p.id}
                        className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs transition-all ${
                          currentMatched
                            ? 'bg-purple-50/70 dark:bg-purple-950/40 border-purple-300'
                            : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200'
                        }`}
                      >
                        <span className="font-serif font-medium">{p.left}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <select
                            value={currentMatched || ''}
                            onChange={(e) =>
                              setMatchingAnswers((prev) => ({
                                ...prev,
                                [q.id]: {
                                  ...prev[q.id],
                                  [p.id]: e.target.value,
                                },
                              }))
                            }
                            className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-purple-300 rounded-lg font-bold text-xs cursor-pointer outline-none focus:ring-2 focus:ring-purple-400"
                          >
                            <option value="">Ghép với Cột B...</option>
                            <option value="A">Nối với A</option>
                            <option value="B">Nối với B</option>
                            <option value="C">Nối với C</option>
                            <option value="D">Nối với D</option>
                          </select>
                          {currentMatched && (
                            <button
                              type="button"
                              onClick={() =>
                                setMatchingAnswers((prev) => {
                                  const updated = { ...prev[q.id] };
                                  delete updated[p.id];
                                  return { ...prev, [q.id]: updated };
                                })
                              }
                              className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                              title="Hủy ghép"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Column B (Right items) */}
                <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2.5">
                  <div className="font-bold text-xs text-purple-900 dark:text-purple-300 pb-2 border-b">
                    Cột B: Ý nghĩa / Kết quả lịch sử
                  </div>
                  {q.matchingPairs?.map((p) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-xs font-serif leading-relaxed"
                    >
                      {p.right}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 5. DẠNG TỰ LUẬN CHUYÊN SÂU VỚI BỘ ĐẾM TỪ VÀ RUBRIC LIVE */}
          {isEssay && (
            <div className="space-y-3 font-sans">
              <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 space-y-2">
                <span className="text-xs font-bold text-rose-900 dark:text-rose-300 uppercase block">
                  ĐỀ BÀI TỰ LUẬN PHÁT TRIỂN NĂNG LỰC LỊCH SỬ:
                </span>
                <div className="font-serif text-sm sm:text-base leading-relaxed text-slate-900 dark:text-slate-100 font-medium">
                  {q.content}
                </div>
              </div>

              {/* Rubric Points Reference */}
              {q.rubricPoints && q.rubricPoints.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs">
                  <div className="font-bold text-[#073B66] dark:text-sky-300 flex items-center justify-between">
                    <span>Biểu điểm Rubric đánh giá (Thang 10 điểm):</span>
                    <span className="text-[11px] text-slate-500 font-normal">Cô Thu sẽ duyệt theo barem này</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {q.rubricPoints.map((rb, rbi) => (
                      <div key={rbi} className="p-2 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[11px]">
                        <span className="font-black text-rose-700 block mb-0.5">+{rb.points} điểm</span>
                        <span className="text-slate-600 dark:text-slate-300 font-serif">{rb.criteria}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Essay Outline Accordion */}
              {q.essayOutline && (
                <details className="p-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 text-xs">
                  <summary className="font-bold text-amber-900 dark:text-amber-300 cursor-pointer flex items-center justify-between">
                    <span>💡 Gợi ý dàn ý và dẫn chứng lịch sử</span>
                    <span className="text-[11px] underline">Xem / Ẩn</span>
                  </summary>
                  <div className="mt-2 text-slate-700 dark:text-slate-200 font-serif whitespace-pre-line text-xs pl-2 border-l-2 border-amber-400">
                    {q.essayOutline}
                  </div>
                </details>
              )}

              {/* Live Textarea with Word Count and Auto-Save Status */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700 dark:text-slate-200">Bài làm của em:</span>
                    <span className="text-[11px] text-emerald-600 font-medium">
                      ✓ Tự động lưu nháp: {lastAutoSavedTime}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500">
                      Số từ: <strong>{(essayAnswers[q.id] || '').trim() ? (essayAnswers[q.id] || '').trim().split(/\s+/).length : 0}</strong> / 250 từ khuyến nghị
                    </span>
                  </div>
                </div>

                <textarea
                  value={essayAnswers[q.id] || ''}
                  onChange={(e) =>
                    setEssayAnswers((prev) => ({
                      ...prev,
                      [q.id]: e.target.value,
                    }))
                  }
                  rows={9}
                  placeholder="Em hãy trình bày các luận điểm lịch sử của mình tại đây (hệ thống tự động lưu bài làm sau mỗi 15 giây)..."
                  className="w-full p-4 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-serif leading-relaxed outline-none focus:ring-2 focus:ring-[#0878C9] shadow-inner"
                />

                {/* AI Instant Feedback & Mock Rubric Scoring */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const text = (essayAnswers[q.id] || '').trim();
                      const wordCount = text ? text.split(/\s+/).length : 0;
                      let mockScore = 5.0;
                      let comment = '';
                      if (wordCount >= 100) {
                        mockScore = 8.5;
                        comment = 'Bài làm đầy đủ các luận điểm, diễn đạt lưu loát và có dẫn chứng lịch sử tiêu biểu!';
                      } else if (wordCount >= 50) {
                        mockScore = 6.5;
                        comment = 'Bài làm đúng hướng, nhưng cần mở rộng thêm phần liên hệ thực tiễn và bài học kinh nghiệm.';
                      } else {
                        mockScore = 4.0;
                        comment = 'Bài viết còn quá ngắn. Em hãy bổ sung thêm các mốc thời gian và ý nghĩa lịch sử theo dàn ý gợi ý!';
                      }
                      setAiFeedbackMap((prev) => ({ ...prev, [q.id]: { score: mockScore, comment } }));
                    }}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs hover:shadow-sm cursor-pointer"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    AI Chấm thử & Gợi ý cải thiện
                  </button>

                  {aiFeedbackMap[q.id] && (
                    <span className="text-xs font-bold text-purple-700 dark:text-purple-300">
                      Sơ bộ: {aiFeedbackMap[q.id].score}/10đ • {aiFeedbackMap[q.id].comment}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
};
