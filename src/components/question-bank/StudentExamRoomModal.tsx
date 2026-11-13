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
  Plus,
  Trash2,
  Edit3,
  Check,
  Upload,
  GraduationCap,
  ClipboardPaste,
  School,
  Users,
  Download,
  FileDown,
  ShieldAlert,
  Lock,
  Eye,
} from 'lucide-react';
import { RoomImportWordModal } from './RoomImportWordModal';
import { initialQuestions as defaultBankQuestions } from '../../data/initialData';
import {
  EssayTeacherEditor,
  EssayStudentWorkspace,
  EssayScorecardReviewCard,
  scoreEssayByRubric,
} from './EssayWorkspace';
import {
  ExamProctoringPreStartGate,
  ExamProctoringWarningOverlay,
  ExamProctoringWatermark,
  ExamProctoringScorecardReport,
  ProctoringViolation,
  ProctoringViolationType,
  playProctoringAlertBeep,
} from './ExamProctoringLayer';
import {
  getTopicsForGrade,
  getLessonsForTopic,
  getAllLessonsForGrade,
} from '../../data/historyCurriculum';

// Extract lesson number like 1 from "Bài 1: Liên hợp quốc..." or "Bài 01", "Bài 1"
export const extractLessonNumber = (text?: string): number | null => {
  if (!text) return null;
  const match = text.match(/bài\s*(\d+)/i);
  return match ? parseInt(match[1], 10) : null;
};

// Extract topic number like 1 from "Chủ đề 1: Thế giới..." or "Chương 1"
export const extractTopicNumber = (text?: string): number | null => {
  if (!text) return null;
  const match = text.match(/(?:chủ đề|chương)\s*(\d+)/i);
  return match ? parseInt(match[1], 10) : null;
};

// Smart matching for lesson filter
export const isQuestionMatchingLesson = (q: Question, filterLesson: string): boolean => {
  if (!filterLesson || filterLesson === 'all') return true;

  const fLower = filterLesson.toLowerCase().trim();
  const qLessonLower = (q.lesson || '').toLowerCase().trim();

  // 1. Exact match
  if (qLessonLower === fLower) return true;

  // 2. Substring match either way
  if (qLessonLower && (qLessonLower.includes(fLower) || fLower.includes(qLessonLower))) return true;

  // 3. Lesson number match (e.g. "Bài 1" matches "Bài 1: Liên hợp quốc..." or "Bài 01")
  const fNum = extractLessonNumber(filterLesson);
  const qNum = extractLessonNumber(q.lesson);
  if (fNum !== null && qNum !== null && fNum === qNum) {
    return true;
  }

  // 4. Keyword heuristics for key history lessons
  const combinedQ = `${q.lesson || ''} ${q.topic || ''} ${q.knowledgeDomain || ''} ${q.content || ''}`.toLowerCase();

  // Bài 1 Lịch sử 12: Liên Hợp Quốc
  if (fLower.includes('liên hợp quốc') || fLower.includes('liên hop quoc')) {
    if (
      combinedQ.includes('liên hợp quốc') ||
      combinedQ.includes('liên hop quoc') ||
      combinedQ.includes('hiến chương') ||
      combinedQ.includes('san francisco') ||
      combinedQ.includes('xan phran-xi-xcô') ||
      combinedQ.includes('hội đồng bảo an') ||
      combinedQ.includes('unesco') ||
      q.id?.startsWith('tn_12_01') ||
      q.id === 'tf_12_00'
    ) {
      return true;
    }
  }

  // Bài 2: I-an-ta và Chiến tranh lạnh
  if (fLower.includes('i-an-ta') || fLower.includes('chiến tranh lạnh')) {
    if (combinedQ.includes('i-an-ta') || combinedQ.includes('chiến tranh lạnh') || combinedQ.includes('yalta') || q.id === 'tn_12_02') {
      return true;
    }
  }

  // ASEAN
  if (fLower.includes('asean')) {
    if (combinedQ.includes('asean') || combinedQ.includes('đông nam á') || combinedQ.includes('băng cốc')) {
      return true;
    }
  }

  return false;
};

// Smart matching for topic filter
export const isQuestionMatchingTopic = (q: Question, filterTopic: string): boolean => {
  if (!filterTopic || filterTopic === 'all') return true;

  const fLower = filterTopic.toLowerCase().trim();
  const qTopicLower = (q.topic || '').toLowerCase().trim();

  // 1. Exact match
  if (qTopicLower === fLower) return true;

  // 2. Substring match
  if (qTopicLower && (qTopicLower.includes(fLower) || fLower.includes(qTopicLower))) return true;

  // 3. Topic number match (e.g. "Chủ đề 1" matches "Chủ đề 1: Thế giới...")
  const fNum = extractTopicNumber(filterTopic);
  const qNum = extractTopicNumber(q.topic);
  if (fNum !== null && qNum !== null && fNum === qNum) {
    return true;
  }

  // 4. Keyword heuristics
  const combinedQ = `${q.topic || ''} ${q.lesson || ''} ${q.knowledgeDomain || ''}`.toLowerCase();
  if (fLower.includes('thế giới trong và sau') || fLower.includes('chiến tranh lạnh') || fLower.includes('thế giới từ năm 1945')) {
    if (combinedQ.includes('thế giới') || combinedQ.includes('chiến tranh lạnh') || combinedQ.includes('liên hợp quốc') || combinedQ.includes('1945')) {
      return true;
    }
  }

  if (fLower.includes('asean')) {
    if (combinedQ.includes('asean')) return true;
  }

  if (fLower.includes('cách mạng tháng tám') || fLower.includes('kháng chiến chống pháp')) {
    if (combinedQ.includes('cách mạng tháng tám') || combinedQ.includes('kháng chiến chống pháp') || combinedQ.includes('pháp') || combinedQ.includes('điện biên phủ')) {
      return true;
    }
  }

  if (fLower.includes('kháng chiến chống mỹ')) {
    if (combinedQ.includes('chống mỹ') || combinedQ.includes('mỹ') || combinedQ.includes('xuân 1975') || combinedQ.includes('giải phóng')) {
      return true;
    }
  }

  if (fLower.includes('đổi mới')) {
    if (combinedQ.includes('đổi mới') || combinedQ.includes('1986')) {
      return true;
    }
  }

  return false;
};

export interface StudentExamRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  examTitle?: string;
  initialQuestions?: Question[];
  defaultDurationMinutes?: number;
  initialClassId?: string;
  initialStudentId?: string;
  roomMode?: ExamRoomKey;
  initialTeacherMode?: boolean;
  initialProctoringPreview?: boolean;
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
  initialTeacherMode = true,
  initialProctoringPreview = false,
}) => {
  const {
    userRole,
    classes,
    students,
    questions: bankQuestions,
    updateStudentScore,
    exams,
    addExam,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    addNotification,
  } = useApp();

  // -------------------------------------------------------------------------
  // 1. ACTIVE ROOM MODE STATE & SWITCHER
  // -------------------------------------------------------------------------
  const [activeRoomMode, setActiveRoomMode] = useState<ExamRoomKey>(roomMode);
  const [isTeacherMode, setIsTeacherMode] = useState<boolean>(initialTeacherMode);
  const [isProctorPreview, setIsProctorPreview] = useState<boolean>(initialProctoringPreview);

  useEffect(() => {
    setIsProctorPreview(!!initialProctoringPreview);
  }, [initialProctoringPreview, isOpen]);

  // Giáo viên thực sự chỉ khi tài khoản không phải Học sinh và không đang bật Xem thử Thí sinh
  const effectiveTeacherMode = userRole !== 'student' && isTeacherMode && !isProctorPreview;
  // Thí sinh đang làm bài (Học sinh thực tế hoặc Giáo viên đang xem thử góc nhìn Thí sinh)
  const isStudentTakingExam = userRole === 'student' || isProctorPreview;
  // Kích hoạt Giám sát Toàn màn hình (Phương án 1) cho cả 5+1 phòng thi đối với thí sinh
  const isProctoringEnabled = isStudentTakingExam;

  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [studentViewCardIds, setStudentViewCardIds] = useState<Record<string, boolean>>({});
  const [savedQuestionStatus, setSavedQuestionStatus] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    if (roomMode) {
      setActiveRoomMode(roomMode);
    }
  }, [roomMode]);

  useEffect(() => {
    if (initialTeacherMode !== undefined) {
      setIsTeacherMode(initialTeacherMode);
    }
  }, [initialTeacherMode]);

  // Merge bank questions and standard graduation questions with canonical metadata
  const combinedQuestionPool = useMemo(() => {
    const map = new Map<string, Question>();
    // 1. Seed standard graduation questions as authoritative baseline
    standardGraduationExamQuestions.forEach((q) => {
      map.set(q.id, { ...q });
    });
    // 2. Merge user bank questions, standardizing topic and lesson if matched
    bankQuestions.forEach((bq) => {
      if (map.has(bq.id)) {
        const std = map.get(bq.id)!;
        map.set(bq.id, {
          ...bq,
          topic: std.topic || bq.topic,
          lesson: std.lesson || bq.lesson,
          grade: bq.grade || std.grade || 12,
        });
      } else {
        // Auto-heal Grade 12 Bài 1 if entered with old title
        const isB1 =
          (bq.grade === 12 || !bq.grade) &&
          ((bq.lesson && (bq.lesson.includes('Liên Hợp Quốc') || bq.lesson.includes('Liên hợp quốc') || bq.lesson.includes('Bài 1'))) ||
            (bq.topic && (bq.topic.includes('1945') || bq.topic.includes('Chiến tranh lạnh'))));
        if (isB1 && !bq.lesson?.includes('Mục tiêu, nguyên tắc và vai trò')) {
          map.set(bq.id, {
            ...bq,
            grade: 12,
            topic: 'Chủ đề 1: Thế giới trong và sau Chiến tranh lạnh',
            lesson: 'Bài 1: Liên hợp quốc - Mục tiêu, nguyên tắc và vai trò',
          });
        } else {
          map.set(bq.id, bq);
        }
      }
    });
    return Array.from(map.values());
  }, [bankQuestions]);

  // Initial questions for current room (Strictly type-matched; never fall back to wrong room type!)
  const baseQuestionsForRoom: Question[] = useMemo(() => {
    if (initialQuestions && initialQuestions.length > 0 && activeRoomMode === 'all') {
      return initialQuestions;
    }

    if (activeRoomMode === 'Trắc nghiệm đơn') {
      const list = combinedQuestionPool.filter(
        (q) => q.type === 'Trắc nghiệm đơn' || q.type === 'Trắc nghiệm'
      );
      return list.length > 0
        ? list
        : defaultBankQuestions.filter(
            (q) => q.type === 'Trắc nghiệm đơn' || q.type === 'Trắc nghiệm'
          );
    }

    if (activeRoomMode === 'Trắc nghiệm đúng sai') {
      const list = combinedQuestionPool.filter((q) => q.type === 'Trắc nghiệm đúng sai');
      return list.length > 0
        ? list
        : defaultBankQuestions.filter((q) => q.type === 'Trắc nghiệm đúng sai');
    }

    if (activeRoomMode === 'Điền từ') {
      const list = combinedQuestionPool.filter((q) => q.type === 'Điền từ');
      return list.length > 0
        ? list
        : defaultBankQuestions.filter((q) => q.type === 'Điền từ');
    }

    if (activeRoomMode === 'Nối từ') {
      const list = combinedQuestionPool.filter((q) => q.type === 'Nối từ');
      return list.length > 0
        ? list
        : defaultBankQuestions.filter((q) => q.type === 'Nối từ');
    }

    if (activeRoomMode === 'Tự luận') {
      const list = combinedQuestionPool.filter((q) => q.type === 'Tự luận');
      return list.length > 0
        ? list
        : defaultBankQuestions.filter((q) => q.type === 'Tự luận');
    }

    // Default 'all' - Comprehensive test
    const single = combinedQuestionPool.filter((q) => q.type === 'Trắc nghiệm đơn' || q.type === 'Trắc nghiệm').slice(0, 8);
    const tf = combinedQuestionPool.filter((q) => q.type === 'Trắc nghiệm đúng sai').slice(0, 2);
    const blank = combinedQuestionPool.filter((q) => q.type === 'Điền từ').slice(0, 1);
    const match = combinedQuestionPool.filter((q) => q.type === 'Nối từ').slice(0, 1);
    const essayPool = combinedQuestionPool.filter((q) => q.type === 'Tự luận');
    const essay = (essayPool.length > 0 ? essayPool : defaultBankQuestions.filter((q) => q.type === 'Tự luận')).slice(0, 1);

    const merged = [...single, ...tf, ...blank, ...match, ...essay];
    return merged.length > 0 ? merged : combinedQuestionPool.slice(0, 12);
  }, [initialQuestions, combinedQuestionPool, activeRoomMode]);

  // -------------------------------------------------------------------------
  // STUDENT & CLASS STATE
  // -------------------------------------------------------------------------
  const [selectedClassId, setSelectedClassId] = useState<string>(
    initialClassId || classes.find((c) => c.code === '12A3' || c.grade === 12)?.id || classes[0]?.id || ''
  );
  const classStudents = useMemo(
    () => (selectedClassId === 'all' ? students : students.filter((s) => s.classId === selectedClassId)),
    [students, selectedClassId]
  );
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    initialStudentId || classStudents[0]?.id || students[0]?.id || ''
  );

  useEffect(() => {
    if (initialClassId) {
      setSelectedClassId(initialClassId);
    }
  }, [initialClassId]);

  useEffect(() => {
    if (initialStudentId) {
      setSelectedStudentId(initialStudentId);
    }
  }, [initialStudentId]);

  useEffect(() => {
    if (classStudents.length > 0 && !classStudents.some((s) => s.id === selectedStudentId)) {
      setSelectedStudentId(classStudents[0].id);
    }
  }, [classStudents, selectedStudentId]);

  const currentStudent = useMemo(
    () => students.find((s) => s.id === selectedStudentId) || classStudents[0] || students[0],
    [students, selectedStudentId, classStudents]
  );

  // MUTABLE ROOM QUESTIONS (Allows adding, editing, saving, deleting in room)
  const [roomQuestions, setRoomQuestions] = useState<Question[]>(() => baseQuestionsForRoom);
  const [selectedGradeTab, setSelectedGradeTab] = useState<'all' | 10 | 11 | 12>('all');
  const [selectedTopicFilter, setSelectedTopicFilter] = useState<string>('all');
  const [selectedLessonFilter, setSelectedLessonFilter] = useState<string>('all');
  const [isRoomImportModalOpen, setIsRoomImportModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setRoomQuestions(baseQuestionsForRoom);
      setCurrentQuestionIndex(0);
      setSavedQuestionStatus({});
      setStudentViewCardIds({});
      setEditingCardId(null);
      setSelectedTopicFilter('all');
      setSelectedLessonFilter('all');

      // Auto-initialize Grade & Class
      if (initialClassId) {
        setSelectedClassId(initialClassId);
        const cls = classes.find((c) => c.id === initialClassId);
        if (cls?.grade) {
          setSelectedGradeTab(cls.grade);
        }
      } else if (currentStudent?.classId) {
        setSelectedClassId(currentStudent.classId);
        if (currentStudent.grade) {
          setSelectedGradeTab(currentStudent.grade);
        }
      } else {
        const defaultClass = classes.find((c) => c.code === '12A3' || c.grade === 12) || classes[0];
        if (defaultClass) {
          setSelectedClassId(defaultClass.id);
          setSelectedGradeTab(defaultClass.grade || 12);
        }
      }
    }
  }, [isOpen, activeRoomMode]);

  // When grade tab changes, reset topic and lesson filter
  useEffect(() => {
    setSelectedTopicFilter('all');
    setSelectedLessonFilter('all');
    setCurrentQuestionIndex(0);
  }, [selectedGradeTab]);

  const handleSelectGradeTab = (grade: 'all' | 10 | 11 | 12) => {
    setSelectedGradeTab(grade);
    setSelectedTopicFilter('all');
    setSelectedLessonFilter('all');
    setCurrentQuestionIndex(0);

    if (grade !== 'all') {
      const currentClassObj = classes.find((c) => c.id === selectedClassId);
      if (!currentClassObj || currentClassObj.grade !== grade) {
        const matchingClass = classes.find((c) => c.grade === grade);
        if (matchingClass) {
          setSelectedClassId(matchingClass.id);
          const stList = students.filter((s) => s.classId === matchingClass.id);
          if (stList.length > 0) {
            setSelectedStudentId(stList[0].id);
          }
        }
      }
    }
  };

  const handleSelectClass = (classId: string) => {
    setSelectedClassId(classId);
    if (classId !== 'all') {
      const cls = classes.find((c) => c.id === classId);
      if (cls && cls.grade) {
        if (selectedGradeTab !== cls.grade) {
          setSelectedGradeTab(cls.grade);
          setSelectedTopicFilter('all');
          setSelectedLessonFilter('all');
        }
      }
      const stList = students.filter((s) => s.classId === classId);
      if (stList.length > 0) {
        setSelectedStudentId(stList[0].id);
      }
    }
    setCurrentQuestionIndex(0);
  };

  const handleResetFilters = () => {
    setSelectedGradeTab('all');
    setSelectedClassId('all');
    setSelectedTopicFilter('all');
    setSelectedLessonFilter('all');
    setCurrentQuestionIndex(0);
  };

  // Grade counts in the current room
  const gradeCounts = useMemo(() => {
    return {
      10: roomQuestions.filter((q) => (q.grade || 12) === 10).length,
      11: roomQuestions.filter((q) => (q.grade || 12) === 11).length,
      12: roomQuestions.filter((q) => (q.grade || 12) === 12).length,
    };
  }, [roomQuestions]);

  // Available topics for active filter
  const availableTopicsForFilter = useMemo(() => {
    if (selectedGradeTab === 'all') {
      return Array.from(
        new Set([
          ...getTopicsForGrade(12),
          ...getTopicsForGrade(11),
          ...getTopicsForGrade(10),
          ...roomQuestions.map((q) => q.topic).filter(Boolean),
        ])
      );
    }
    return Array.from(
      new Set([
        ...getTopicsForGrade(selectedGradeTab),
        ...roomQuestions
          .filter((q) => (q.grade || 12) === selectedGradeTab && q.topic)
          .map((q) => q.topic!),
      ])
    );
  }, [selectedGradeTab, roomQuestions]);

  // Available lessons for active filter
  const availableLessonsForFilter = useMemo(() => {
    const currentGrade = (selectedGradeTab === 'all' ? 12 : selectedGradeTab) as 10 | 11 | 12;
    if (selectedTopicFilter === 'all') {
      if (selectedGradeTab === 'all') {
        return Array.from(
          new Set([
            ...getAllLessonsForGrade(12),
            ...getAllLessonsForGrade(11),
            ...getAllLessonsForGrade(10),
            ...roomQuestions.map((q) => q.lesson).filter(Boolean),
          ])
        );
      }
      return Array.from(
        new Set([
          ...getAllLessonsForGrade(selectedGradeTab),
          ...roomQuestions
            .filter((q) => (q.grade || 12) === selectedGradeTab && q.lesson)
            .map((q) => q.lesson!),
        ])
      );
    }
    return Array.from(
      new Set([
        ...getLessonsForTopic(currentGrade, selectedTopicFilter),
        ...roomQuestions
          .filter(
            (q) =>
              (selectedGradeTab === 'all' || (q.grade || 12) === selectedGradeTab) &&
              (isQuestionMatchingTopic(q, selectedTopicFilter) ||
                (q.topic && q.topic.toLowerCase().trim() === selectedTopicFilter.toLowerCase().trim())) &&
              q.lesson
          )
          .map((q) => q.lesson!),
      ])
    );
  }, [selectedGradeTab, selectedTopicFilter, roomQuestions]);

  // Question counts for each topic in the current grade selection
  const topicCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    availableTopicsForFilter.forEach((topic) => {
      counts[topic] = roomQuestions.filter((q) => {
        const matchGrade = selectedGradeTab === 'all' || (q.grade || 12) === selectedGradeTab;
        return matchGrade && isQuestionMatchingTopic(q, topic);
      }).length;
    });
    return counts;
  }, [availableTopicsForFilter, roomQuestions, selectedGradeTab]);

  // Question counts for each lesson in the current grade/topic selection
  const lessonCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    availableLessonsForFilter.forEach((lesson) => {
      counts[lesson] = roomQuestions.filter((q) => {
        const matchGrade = selectedGradeTab === 'all' || (q.grade || 12) === selectedGradeTab;
        const matchTopic = selectedTopicFilter === 'all' || isQuestionMatchingTopic(q, selectedTopicFilter);
        return matchGrade && matchTopic && isQuestionMatchingLesson(q, lesson);
      }).length;
    });
    return counts;
  }, [availableLessonsForFilter, roomQuestions, selectedGradeTab, selectedTopicFilter]);

  // Questions filtered by Grade, Chương / Chủ đề & Bài học (Smart Matching)
  const displayedQuestions = useMemo(() => {
    let list = roomQuestions;
    if (selectedGradeTab !== 'all') {
      list = list.filter((q) => (q.grade || 12) === selectedGradeTab);
    }
    if (selectedLessonFilter !== 'all') {
      // Prioritize lesson match: if user selects a specific lesson, find all questions belonging to that lesson
      list = list.filter((q) => isQuestionMatchingLesson(q, selectedLessonFilter));
    } else if (selectedTopicFilter !== 'all') {
      // If only topic is selected (all lessons in topic)
      list = list.filter((q) => isQuestionMatchingTopic(q, selectedTopicFilter));
    }
    return list;
  }, [roomQuestions, selectedGradeTab, selectedTopicFilter, selectedLessonFilter]);

  const handleImportQuestionsFromModal = (importedQuestions: Question[]) => {
    setRoomQuestions((prev) => [...prev, ...importedQuestions]);
    importedQuestions.forEach((q) => {
      if (!bankQuestions.some((bq) => bq.id === q.id)) {
        addQuestion(q);
      }
    });
    setIsTeacherMode(true);
    setCurrentQuestionIndex(0);
    showToast(`Đã đưa thành công ${importedQuestions.length} câu hỏi mới vào phòng thi và lưu vào Ngân hàng đề!`);
  };

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
  // 3. DISPLAY OPTIONS & ACCESSIBILITY (FONT, THEME, VIEW MODE)
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
  // 4. TIMER & TIME MANAGEMENT ENGINE
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

  // -------------------------------------------------------------------------
  // 4.5. PROCTORING & ANTI-CHEATING ENGINE (PHƯƠNG ÁN 1 - TOÀN MÀN HÌNH)
  // -------------------------------------------------------------------------
  const [isExamSessionStarted, setIsExamSessionStarted] = useState(false);
  const [proctoringViolations, setProctoringViolations] = useState<ProctoringViolation[]>([]);
  const [isProctoringWarningOpen, setIsProctoringWarningOpen] = useState(false);
  const [latestViolation, setLatestViolation] = useState<ProctoringViolation | null>(null);
  const [fullscreenGranted, setFullscreenGranted] = useState(false);

  const lastBlurTimestampRef = useRef<number | null>(null);
  const lastViolationEpochRef = useRef<number>(0);
  const initialViewportRef = useRef<{ width: number; height: number } | null>(null);
  const isRequestingFullscreenRef = useRef<boolean>(false);

  const isProctoringLive = isOpen && isProctoringEnabled && isExamSessionStarted && !isSubmitted;

  // Reset proctoring & timer state whenever room changes or modal opens
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
      setIsExamSessionStarted(false);
      setProctoringViolations([]);
      setIsProctoringWarningOpen(false);
      setLatestViolation(null);
      setFullscreenGranted(false);
      lastBlurTimestampRef.current = null;
      lastViolationEpochRef.current = 0;
    }
  }, [isOpen, activeRoomMode, isProctorPreview, userRole]);

  const recordViolation = (
    type: ProctoringViolationType,
    label: string,
    detail: string,
    durationSeconds?: number,
    lockScreen: boolean = true
  ) => {
    const nowEpoch = Date.now();
    // Debounce tab_switch / window_blur duplicates within 750ms
    if (
      (type === 'tab_switch' || type === 'window_blur') &&
      nowEpoch - lastViolationEpochRef.current < 750
    ) {
      return;
    }
    lastViolationEpochRef.current = nowEpoch;

    const nowDate = new Date();
    const timestamp = `${nowDate.getHours().toString().padStart(2, '0')}:${nowDate
      .getMinutes()
      .toString()
      .padStart(2, '0')}:${nowDate.getSeconds().toString().padStart(2, '0')}`;

    const entry: ProctoringViolation = {
      id: `vio_${nowEpoch}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp,
      type,
      label,
      detail,
      durationSeconds,
    };

    setProctoringViolations((prev) => {
      const next = [...prev, entry];
      playProctoringAlertBeep(next.length >= 3);
      return next;
    });
    setLatestViolation(entry);
    if (lockScreen) {
      setIsProctoringWarningOpen(true);
    } else {
      showToast(`⚠️ Giám sát: ${label}`);
    }
  };

  const recordViolationRef = useRef(recordViolation);
  recordViolationRef.current = recordViolation;

  const handleStartProctoredExam = () => {
    initialViewportRef.current = {
      width: window.innerWidth,
      height: window.innerHeight,
    };
    isRequestingFullscreenRef.current = true;

    if (modalContainerRef.current?.requestFullscreen) {
      modalContainerRef.current
        .requestFullscreen()
        .then(() => {
          setIsFullscreen(true);
          setFullscreenGranted(true);
        })
        .catch(() => {
          setFullscreenGranted(false);
        })
        .finally(() => {
          setTimeout(() => {
            isRequestingFullscreenRef.current = false;
          }, 450);
        });
    } else {
      isRequestingFullscreenRef.current = false;
    }

    setIsExamSessionStarted(true);
  };

  const handleResumeProctoredExam = () => {
    setIsProctoringWarningOpen(false);
    initialViewportRef.current = {
      width: window.innerWidth,
      height: window.innerHeight,
    };
    isRequestingFullscreenRef.current = true;

    if (modalContainerRef.current?.requestFullscreen && !document.fullscreenElement) {
      modalContainerRef.current
        .requestFullscreen()
        .then(() => {
          setIsFullscreen(true);
          setFullscreenGranted(true);
        })
        .catch(() => {})
        .finally(() => {
          setTimeout(() => {
            isRequestingFullscreenRef.current = false;
          }, 450);
        });
    } else {
      isRequestingFullscreenRef.current = false;
    }
  };

  // Global Proctoring Listeners (Fullscreen, Visibility/Tab, Window Blur, Split Screen, Anti-Copy/Shortcuts)
  useEffect(() => {
    if (!isProctoringLive) return;

    const handleFullscreenChange = () => {
      const activeFs = !!document.fullscreenElement;
      setIsFullscreen(activeFs);
      if (!activeFs && fullscreenGranted && !isRequestingFullscreenRef.current) {
        recordViolationRef.current(
          'fullscreen_exit',
          'Thoát chế độ Toàn màn hình (ESC)',
          'Thí sinh đã thoát khỏi chế độ Toàn màn hình khi chưa nộp bài thi.',
          undefined,
          true
        );
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        lastBlurTimestampRef.current = Date.now();
      } else if (document.visibilityState === 'visible' && lastBlurTimestampRef.current) {
        const awaySec = Math.max(1, Math.round((Date.now() - lastBlurTimestampRef.current) / 1000));
        lastBlurTimestampRef.current = null;
        recordViolationRef.current(
          'tab_switch',
          'Chuyển Tab / Ẩn cửa sổ phòng thi',
          'Thí sinh đã chuyển sang tab trình duyệt khác hoặc ẩn màn hình thi.',
          awaySec,
          true
        );
      }
    };

    const handleWindowBlur = () => {
      if (!lastBlurTimestampRef.current) {
        lastBlurTimestampRef.current = Date.now();
      }
    };

    const handleWindowFocus = () => {
      if (lastBlurTimestampRef.current && document.visibilityState === 'visible') {
        const elapsedMs = Date.now() - lastBlurTimestampRef.current;
        lastBlurTimestampRef.current = null;
        if (elapsedMs >= 650) {
          const awaySec = Math.max(1, Math.round(elapsedMs / 1000));
          recordViolationRef.current(
            'window_blur',
            'Rời khỏi cửa sổ phòng thi',
            'Thí sinh đã mở hoặc chuyển tiêu điểm sang ứng dụng/cửa sổ khác ngoài bài thi.',
            awaySec,
            true
          );
        }
      }
    };

    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    const handleResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (isRequestingFullscreenRef.current) return;
        const initW = initialViewportRef.current?.width || window.innerWidth;
        const availW = window.screen?.availWidth || initW;
        if (window.innerWidth < availW * 0.7 && window.innerWidth < initW * 0.78) {
          recordViolationRef.current(
            'split_screen',
            'Thu hẹp / Chia đôi màn hình',
            'Phát hiện kích thước cửa sổ bị thu hẹp bất thường (dấu hiệu chia đôi màn hình).',
            undefined,
            true
          );
        }
      }, 450);
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      showToast('Chế độ Giám sát: Đã khóa chuột phải trong phòng thi!');
    };

    const handleCopyOrCut = (e: ClipboardEvent) => {
      e.preventDefault();
      recordViolationRef.current(
        'copy_attempt',
        'Sao chép nội dung đề thi',
        'Thí sinh đã cố gắng sao chép (Copy/Cut) nội dung câu hỏi trong phòng thi.',
        undefined,
        false
      );
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      recordViolationRef.current(
        'copy_attempt',
        'Dán văn bản ngoài vào bài làm',
        'Hệ thống đã chặn thao tác dán (Paste) dữ liệu từ bên ngoài vào bài thi.',
        undefined,
        false
      );
    };

    const handleKeyDownBlock = (e: KeyboardEvent) => {
      const k = e.key.toUpperCase();
      const ctrlOrMeta = e.ctrlKey || e.metaKey;
      const isBlockedShortcut =
        e.key === 'F12' ||
        (ctrlOrMeta && e.shiftKey && ['I', 'J', 'C', 'K'].includes(k)) ||
        (ctrlOrMeta && ['U', 'P', 'S', 'C', 'X'].includes(k));

      if (isBlockedShortcut) {
        e.preventDefault();
        e.stopPropagation();
        recordViolationRef.current(
          'shortcut_block',
          `Sử dụng phím tắt bị khóa (${e.key === 'F12' ? 'F12' : `Ctrl+${k}`})`,
          'Phím tắt kiểm tra mã nguồn, in đề hoặc sao chép bị vô hiệu hóa khi đang thi.',
          undefined,
          false
        );
      }
    };

    const handleKeyUpPrintScreen = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen') {
        recordViolationRef.current(
          'shortcut_block',
          'Nhấn phím chụp ảnh màn hình (PrintScreen)',
          'Hệ thống ghi nhận thao tác nhấn phím PrintScreen trong lúc làm bài thi.',
          undefined,
          false
        );
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('resize', handleResize);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopyOrCut);
    document.addEventListener('cut', handleCopyOrCut);
    document.addEventListener('paste', handlePaste);
    window.addEventListener('keydown', handleKeyDownBlock, true);
    window.addEventListener('keyup', handleKeyUpPrintScreen, true);

    return () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopyOrCut);
      document.removeEventListener('cut', handleCopyOrCut);
      document.removeEventListener('paste', handlePaste);
      window.removeEventListener('keydown', handleKeyDownBlock, true);
      window.removeEventListener('keyup', handleKeyUpPrintScreen, true);
    };
  }, [isProctoringLive, fullscreenGranted]);

  // Timer Tick - CHỈ CHẠY CHO HỌC SINH ĐANG LÀM BÀI SAU KHI BẮT ĐẦU PHIÊN THI
  useEffect(() => {
    if (
      !isOpen ||
      isSubmitted ||
      isTimerPaused ||
      durationMinutes === 0 ||
      !isStudentTakingExam ||
      !isExamSessionStarted ||
      isProctoringWarningOpen
    ) {
      return;
    }

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
  }, [
    isOpen,
    isSubmitted,
    isTimerPaused,
    durationMinutes,
    isStudentTakingExam,
    isExamSessionStarted,
    isProctoringWarningOpen,
  ]);

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
    showToast(`Đã cộng thêm ${extraMinutes} phút làm bài cho học sinh!`);
  };

  // -------------------------------------------------------------------------
  // 5. STUDENT ANSWERS & SPECIALIZED INTERACTION STATE
  // -------------------------------------------------------------------------
  const [singleAnswers, setSingleAnswers] = useState<Record<string, string>>({});
  const [tfAnswers, setTfAnswers] = useState<
    Record<string, Record<'a' | 'b' | 'c' | 'd', boolean | undefined>>
  >({});
  const [highlighterColor, setHighlighterColor] = useState<'yellow' | 'cyan' | 'none'>('yellow');
  const [blankAnswers, setBlankAnswers] = useState<Record<string, Record<string, string>>>({});
  const [activeBlankSlot, setActiveBlankSlot] = useState<{ qId: string; blankLabel: string } | null>(null);
  const [matchingAnswers, setMatchingAnswers] = useState<Record<string, Record<string, string>>>({});
  const [essayAnswers, setEssayAnswers] = useState<Record<string, string>>({});
  const [lastAutoSavedTime, setLastAutoSavedTime] = useState<string>('Vừa mới lưu');
  const [aiFeedbackMap, setAiFeedbackMap] = useState<Record<string, { score: number; comment: string }>>({});
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
    return displayedQuestions.filter(isQuestionAnswered).length;
  }, [displayedQuestions, singleAnswers, tfAnswers, blankAnswers, matchingAnswers, essayAnswers]);

  // -------------------------------------------------------------------------
  // 6. QUESTION CREATION & EDITING HELPERS FOR TEACHER
  // -------------------------------------------------------------------------
  // Add a brand new question tailored to the active room and selected grade
  const handleAddNewQuestionToRoom = () => {
    const newId = `q_custom_${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];
    const targetGrade = (selectedGradeTab === 'all' ? 12 : selectedGradeTab) as 10 | 11 | 12;
    const standardTopics = getTopicsForGrade(targetGrade);
    const targetTopic =
      selectedTopicFilter !== 'all'
        ? selectedTopicFilter
        : standardTopics[0] || `Chủ đề trọng tâm lớp ${targetGrade}`;
    const standardLessons = getLessonsForTopic(targetGrade, targetTopic);
    const targetLesson =
      selectedLessonFilter !== 'all'
        ? selectedLessonFilter
        : standardLessons[0] || `Bài ôn tập trọng tâm lớp ${targetGrade}`;

    let newQ: Question;

    if (activeRoomMode === 'Trắc nghiệm đơn') {
      newQ = {
        id: newId,
        grade: targetGrade,
        topic: targetTopic,
        lesson: targetLesson,
        knowledgeDomain: 'Kiến thức cốt lõi',
        type: 'Trắc nghiệm đơn',
        cognitiveLevel: 'Nhận biết',
        content: `Câu hỏi trắc nghiệm mới số ${roomQuestions.length + 1} (Khối ${targetGrade}): Nhập nội dung câu hỏi tại đây...`,
        options: [
          'A. Phương án lựa chọn A',
          'B. Phương án lựa chọn B',
          'C. Phương án lựa chọn C',
          'D. Phương án lựa chọn D',
        ],
        correctAnswer: 'A',
        explanation: 'Căn cứ vào SGK Lịch sử GDPT 2018 và hướng dẫn ôn tập GDTX.',
        source: 'Cô Cao Thị Thu biên soạn',
        author: 'Cao Thị Thu',
        updatedAt: today,
      };
    } else if (activeRoomMode === 'Trắc nghiệm đúng sai') {
      newQ = {
        id: newId,
        grade: targetGrade,
        topic: targetTopic,
        lesson: targetLesson,
        knowledgeDomain: 'Đọc hiểu và đánh giá sử liệu',
        type: 'Trắc nghiệm đúng sai',
        cognitiveLevel: 'Thông hiểu',
        content: `Đọc đoạn tư liệu sau đây (Khối ${targetGrade}):\n"Nhập đoạn trích văn kiện, lời kêu gọi hoặc sự kiện lịch sử tại đây..."`,
        trueFalseStatements: [
          { id: 'a', statement: 'Nội dung nhận định ý a...', isCorrect: true },
          { id: 'b', statement: 'Nội dung nhận định ý b...', isCorrect: true },
          { id: 'c', statement: 'Nội dung nhận định ý c...', isCorrect: false },
          { id: 'd', statement: 'Nội dung nhận định ý d...', isCorrect: true },
        ],
        correctAnswer: 'a-ĐÚNG, b-ĐÚNG, c-SAI, d-ĐÚNG',
        explanation: 'Căn cứ vào văn bản tư liệu lịch sử trích dẫn.',
        source: 'Cô Cao Thị Thu biên soạn',
        author: 'Cao Thị Thu',
        updatedAt: today,
      };
    } else if (activeRoomMode === 'Điền từ') {
      newQ = {
        id: newId,
        grade: targetGrade,
        topic: targetTopic,
        lesson: targetLesson,
        knowledgeDomain: 'Sự kiện và nhân vật',
        type: 'Điền từ',
        cognitiveLevel: 'Thông hiểu',
        content: `Điền các cụm từ thích hợp vào chỗ trống [1], [2] trong đoạn văn sau:\n\n"Năm [1], sự kiện lịch sử trọng tâm đã diễn ra tại [2] thắng lợi."`,
        wordBank: ['1945', 'Hà Nội', '1954', 'Điện Biên Phủ'],
        blankItems: [
          { id: 1, blankLabel: '[1]', correctWord: '1945' },
          { id: 2, blankLabel: '[2]', correctWord: 'Hà Nội' },
        ],
        correctAnswer: '[1] 1945; [2] Hà Nội',
        explanation: 'Ghi nhớ chuẩn xác mốc lịch sử.',
        source: 'Cô Cao Thị Thu biên soạn',
        author: 'Cao Thị Thu',
        updatedAt: today,
      };
    } else if (activeRoomMode === 'Nối từ') {
      newQ = {
        id: newId,
        grade: targetGrade,
        topic: targetTopic,
        lesson: targetLesson,
        knowledgeDomain: 'Ghép nối nhân quả',
        type: 'Nối từ',
        cognitiveLevel: 'Vận dụng',
        content: `Nối mốc thời gian ở Cột A với sự kiện/ý nghĩa lịch sử lớp ${targetGrade} ở Cột B:`,
        matchingPairs: [
          { id: '1', left: '1. Mốc thời gian thứ nhất', right: 'A. Sự kiện lịch sử A', matchedKey: 'A' },
          { id: '2', left: '2. Mốc thời gian thứ hai', right: 'B. Sự kiện lịch sử B', matchedKey: 'B' },
        ],
        correctAnswer: '1 - A; 2 - B',
        explanation: 'Liên hệ đúng tiến trình sự kiện.',
        source: 'Cô Cao Thị Thu biên soạn',
        author: 'Cao Thị Thu',
        updatedAt: today,
      };
    } else if (activeRoomMode === 'Tự luận') {
      newQ = {
        id: newId,
        grade: targetGrade,
        topic: targetTopic,
        lesson: targetLesson,
        knowledgeDomain: 'Vận dụng cao',
        type: 'Tự luận',
        cognitiveLevel: 'Vận dụng cao',
        content: `Đề bài (Khối ${targetGrade}): Phân tích nguyên nhân thắng lợi và bài học lịch sử của sự kiện...`,
        essayOutline: 'DÀN Ý GỢI Ý:\n1. Bối cảnh lịch sử (3.0đ)\n2. Ý nghĩa lịch sử (4.0đ)\n3. Bài học kinh nghiệm (3.0đ)',
        rubricPoints: [
          { criteria: 'Ý 1: Nêu đúng hoàn cảnh và bối cảnh lịch sử', points: 3.0 },
          { criteria: 'Ý 2: Phân tích sâu sắc ý nghĩa lịch sử', points: 4.0 },
          { criteria: 'Ý 3: Rút ra bài học kinh nghiệm liên hệ thực tế', points: 3.0 },
        ],
        correctAnswer: 'Trình bày đủ 3 ý theo dàn ý gợi ý.',
        explanation: 'Lập luận mạch lạc, có dẫn chứng rõ ràng.',
        source: 'Cô Cao Thị Thu biên soạn',
        author: 'Cao Thị Thu',
        updatedAt: today,
      };
    } else {
      // Dành cho Phòng tổng hợp 'all'
      newQ = {
        id: newId,
        grade: targetGrade,
        topic: targetTopic,
        lesson: targetLesson,
        knowledgeDomain: 'Kiến thức cốt lõi',
        type: 'Trắc nghiệm đơn',
        cognitiveLevel: 'Nhận biết',
        content: `Câu hỏi mới số ${roomQuestions.length + 1} (Khối ${targetGrade}): Nhập nội dung câu hỏi tại đây...`,
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
        updatedAt: today,
      };
    }

    const nextFocusedIdx = displayedQuestions.length;
    setRoomQuestions((prev) => {
      const updated = [...prev, newQ];
      return updated;
    });
    setEditingCardId(newId);
    setStudentViewCardIds((prev) => ({ ...prev, [newId]: false }));
    setIsTeacherMode(true);
    setIsSubmitted(false);
    setCurrentQuestionIndex(nextFocusedIdx);
    showToast(`Đã thêm 1 câu ${newQ.type} mới (Khối ${targetGrade}) vào phòng! Cô có thể soạn nội dung và biểu điểm ngay.`);
  };

  const handleSeedSampleEssays = () => {
    const sampleEssays = defaultBankQuestions.filter((q) => q.type === 'Tự luận');
    setRoomQuestions((prev) => {
      const existingIds = new Set(prev.map((q) => q.id));
      const toAdd = sampleEssays.filter((q) => !existingIds.has(q.id));
      return [...prev, ...toAdd];
    });
    sampleEssays.forEach((q) => {
      if (!bankQuestions.some((bq) => bq.id === q.id)) {
        addQuestion(q);
      }
    });
    setSelectedGradeTab('all');
    setSelectedTopicFilter('all');
    setSelectedLessonFilter('all');
    setCurrentQuestionIndex(0);
    showToast(`Đã nạp ${sampleEssays.length} đề Tự luận chuẩn GDPT 2018 (Khối 10, 11, 12)!`);
  };

  // Update a question field in local roomQuestions
  const handleUpdateQuestion = (qId: string, updates: Partial<Question>) => {
    setRoomQuestions((prev) =>
      prev.map((q) => (q.id === qId ? { ...q, ...updates } : q))
    );
  };

  // Set correct answer for Single Choice
  const handleSetSingleChoiceAnswer = (qId: string, letter: string) => {
    setRoomQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== qId) return q;
        return { ...q, correctAnswer: letter.toUpperCase() };
      })
    );
  };

  // Update option text for Single Choice
  const handleUpdateSingleChoiceOption = (
    qId: string,
    optIdx: number,
    letter: string,
    newText: string
  ) => {
    setRoomQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== qId) return q;
        const newOpts = [...(q.options || ['A. ', 'B. ', 'C. ', 'D. '])];
        newOpts[optIdx] = `${letter}. ${newText}`;
        return { ...q, options: newOpts };
      })
    );
  };

  // Toggle True/False statement
  const handleToggleTfStatement = (qId: string, stmtIdx: number, isCorrect: boolean) => {
    setRoomQuestions((prev) =>
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

  // Update True/False statement text
  const handleUpdateTfStatementText = (
    qId: string,
    stmtIdx: number,
    statement: string
  ) => {
    setRoomQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== qId || !q.trueFalseStatements) return q;
        const newStmts = q.trueFalseStatements.map((stmt, idx) =>
          idx === stmtIdx ? { ...stmt, statement } : stmt
        );
        return { ...q, trueFalseStatements: newStmts };
      })
    );
  };

  // Save an individual question
  const handleSaveIndividualQuestion = (qId: string, idx: number) => {
    const targetQ = roomQuestions.find((q) => q.id === qId);
    if (!targetQ) return;

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    // Update in Bank Questions directly
    if (bankQuestions.some((q) => q.id === targetQ.id)) {
      updateQuestion(targetQ.id, targetQ);
    } else {
      addQuestion(targetQ);
    }

    setSavedQuestionStatus((prev) => ({
      ...prev,
      [qId]: timeStr,
    }));
    showToast(`Đã lưu thành công nội dung & đáp án Câu ${idx + 1}!`);
  };

  // Delete an individual question
  const handleDeleteIndividualQuestion = (qId: string, idx: number) => {
    if (confirm(`Cô có chắc chắn muốn xóa Câu ${idx + 1} khỏi phòng thi này không?`)) {
      setRoomQuestions((prev) => prev.filter((q) => q.id !== qId));
      if (bankQuestions.some((q) => q.id === qId)) {
        deleteQuestion(qId);
      }
      showToast(`Đã xóa Câu ${idx + 1}.`);
    }
  };

  // Sync / Save ALL room questions to Bank
  const handleSyncAllToBank = () => {
    if (roomQuestions.length === 0) return;
    let added = 0;
    let updated = 0;
    roomQuestions.forEach((q) => {
      if (bankQuestions.some((bq) => bq.id === q.id)) {
        updateQuestion(q.id, q);
        updated++;
      } else {
        addQuestion(q);
        added++;
      }
    });

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    const newSavedMap: Record<string, string> = {};
    roomQuestions.forEach((q) => {
      newSavedMap[q.id] = timeStr;
    });
    setSavedQuestionStatus(newSavedMap);

    showToast(`Đã lưu & đồng bộ thành công ${roomQuestions.length} câu vào Ngân hàng đề (${added} câu mới, ${updated} câu cập nhật)!`);
  };

  // Export current room questions to Microsoft Word (.doc) with complete answer key
  const handleExportRoomToWord = () => {
    const questionsToExport = displayedQuestions.length > 0 ? displayedQuestions : roomQuestions;
    if (questionsToExport.length === 0) {
      showToast('Chưa có câu hỏi nào trong bộ lọc này để xuất ra file Word!');
      return;
    }

    const currentGrade = selectedGradeTab === 'all' ? 12 : selectedGradeTab;
    const dateStr = new Date().toLocaleDateString('vi-VN');

    let htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <title>Đề thi Lịch sử - GDTX Tiên Yên</title>
        <style>
          body { font-family: 'Times New Roman', serif; font-size: 13pt; line-height: 1.35; color: #000; }
          .header-table { width: 100%; border-collapse: collapse; margin-bottom: 18px; }
          .header-table td { vertical-align: top; text-align: center; font-size: 11pt; }
          .title { font-size: 15pt; font-weight: bold; text-align: center; margin: 12px 0 4px 0; text-transform: uppercase; }
          .subtitle { font-size: 12pt; font-style: italic; text-align: center; margin-bottom: 16px; }
          .section-heading { font-size: 13pt; font-weight: bold; margin-top: 14px; margin-bottom: 8px; border-bottom: 1px solid #333; padding-bottom: 2px; }
          .question-box { margin-bottom: 14px; page-break-inside: avoid; }
          .question-title { font-weight: bold; margin-bottom: 4px; }
          .options-table { width: 100%; margin-top: 4px; border-collapse: collapse; }
          .options-table td { width: 50%; padding: 3px 6px; font-size: 12pt; vertical-align: top; }
          .key-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11pt; }
          .key-table th, .key-table td { border: 1px solid #333; padding: 5px 8px; text-align: left; }
          .key-table th { background-color: #f2f2f2; text-align: center; font-weight: bold; }
        </style>
      </head>
      <body>
        <table class="header-table">
          <tr>
            <td style="width: 50%;">
              <strong>SỞ GD&ĐT TỈNH QUẢNG NINH</strong><br/>
              <strong>TRUNG TÂM GDNN - GDTX TP QUẢNG NINH</strong><br/>
              <em>Phân hiệu Tiên Yên</em><br/>
              ------------------
            </td>
            <td style="width: 50%;">
              <strong>KỲ THI KHẢO SÁT & ÔN TẬP GDTX 2024 - 2025</strong><br/>
              <strong>MÔN: LỊCH SỬ - KHỐI ${currentGrade}</strong><br/>
              <em>Thời gian làm bài: ${durationMinutes || 45} phút (Không kể phát đề)</em><br/>
              ------------------
            </td>
          </tr>
        </table>

        <div class="title">${computedRoomTitle.replace(/^[^\w\s\u00C0-\u1EF9]+/, '').trim()}</div>
        <div class="subtitle">
          Giáo viên biên soạn: <strong>Cô Cao Thị Thu</strong> | Ngày xuất đề: ${dateStr}<br/>
          ${selectedTopicFilter !== 'all' ? `Chuyên đề: <strong>${selectedTopicFilter}</strong> - ` : ''}
          ${selectedLessonFilter !== 'all' ? `Bài học: <strong>${selectedLessonFilter}</strong>` : ''}
          (Tổng số câu hỏi: <strong>${questionsToExport.length}</strong> câu)
        </div>

        <div style="margin-bottom: 15px; font-style: italic; font-size: 11pt;">
          Họ và tên thí sinh: .................................................................................... Lớp: ......................... SBD: ....................
        </div>
    `;

    const isEssayExport =
      activeRoomMode === 'Tự luận' || questionsToExport.every((q) => q.type === 'Tự luận');

    htmlContent += `
        <div class="section-heading">${
          isEssayExport
            ? 'PHẦN I. ĐỀ KIỂM TRA TỰ LUẬN MÔN LỊCH SỬ'
            : 'PHẦN I. NỘI DUNG CÂU HỎI ĐỀ THI'
        }</div>
    `;

    questionsToExport.forEach((q, idx) => {
      const rubricTotal =
        q.rubricPoints && q.rubricPoints.length > 0
          ? q.rubricPoints.reduce((acc, r) => acc + (r.points || 0), 0)
          : 10;
      htmlContent += `<div class="question-box">`;
      htmlContent += `<div class="question-title">Câu ${idx + 1}${
        q.type === 'Tự luận' ? ` (${rubricTotal.toFixed(1)} điểm)` : ''
      }. ${q.content || ''}</div>`;

      if (q.type === 'Trắc nghiệm đơn' || q.type === 'Trắc nghiệm') {
        const opts = q.options || [];
        htmlContent += `<table class="options-table">`;
        for (let i = 0; i < opts.length; i += 2) {
          htmlContent += `<tr>`;
          htmlContent += `<td>${opts[i] || ''}</td>`;
          htmlContent += `<td>${opts[i + 1] || ''}</td>`;
          htmlContent += `</tr>`;
        }
        htmlContent += `</table>`;
      } else if (q.type === 'Trắc nghiệm đúng sai') {
        const stmts = q.trueFalseStatements || [];
        htmlContent += `<div style="margin-left: 15px;">`;
        stmts.forEach((s) => {
          htmlContent += `<div><strong>${s.id})</strong> ${s.statement}</div>`;
        });
        htmlContent += `</div>`;
      } else if (q.type === 'Điền từ') {
        if (q.wordBank && q.wordBank.length > 0) {
          htmlContent += `<div style="margin-left: 15px; font-style: italic;">Từ gợi ý: [${q.wordBank.join(', ')}]</div>`;
        }
      } else if (q.type === 'Nối từ') {
        const pairs = q.matchingPairs || [];
        htmlContent += `<table style="width: 100%; margin-top: 4px; border-collapse: collapse;">`;
        pairs.forEach((p) => {
          htmlContent += `<tr><td style="width: 50%; padding: 2px 4px;">${p.left}</td><td style="width: 50%; padding: 2px 4px;">${p.right}</td></tr>`;
        });
        htmlContent += `</table>`;
      } else if (q.type === 'Tự luận') {
        htmlContent += `<div style="margin-top: 8px; height: 22px; border-bottom: 1px dotted #999;"></div>`;
        htmlContent += `<div style="margin-top: 8px; height: 22px; border-bottom: 1px dotted #999;"></div>`;
        htmlContent += `<div style="margin-top: 8px; height: 22px; border-bottom: 1px dotted #999;"></div>`;
        htmlContent += `<div style="margin-top: 8px; height: 22px; border-bottom: 1px dotted #999;"></div>`;
      }

      htmlContent += `</div>`;
    });

    htmlContent += `
        <br style="page-break-before: always;" />
        <div class="section-heading">${
          isEssayExport
            ? 'PHẦN II. HƯỚNG DẪN CHẤM, DÀN Ý & BIỂU ĐIỂM RUBRIC CHI TIẾT'
            : 'PHẦN II. BẢNG ĐÁP ÁN & HƯỚNG DẪN GIẢI CHI TIẾT'
        }</div>
        <table class="key-table">
          <thead>
            <tr>
              <th style="width: 10%;">Câu</th>
              <th style="width: ${isEssayExport ? '42%' : '25%'};">${
      isEssayExport ? 'Nội dung dàn ý & Đáp án gợi ý' : 'Đáp án chuẩn'
    }</th>
              <th style="width: ${isEssayExport ? '48%' : '65%'};">${
      isEssayExport ? 'Biểu điểm Rubric & Lưu ý chấm' : 'Hướng dẫn giải thích & Kiến thức cốt lõi'
    }</th>
            </tr>
          </thead>
          <tbody>
    `;

    questionsToExport.forEach((q, idx) => {
      if (q.type === 'Tự luận') {
        const outlineHtml = (q.essayOutline || q.correctAnswer || '-').replace(/\n/g, '<br/>');
        const rubricHtml =
          q.rubricPoints && q.rubricPoints.length > 0
            ? q.rubricPoints
                .map((r, ri) => `<div>• <strong>Ý ${ri + 1} (${r.points.toFixed(2)}đ):</strong> ${r.criteria}</div>`)
                .join('')
            : '';
        htmlContent += `
          <tr>
            <td style="text-align: center; font-weight: bold;">Câu ${idx + 1}</td>
            <td style="vertical-align: top;">${outlineHtml}</td>
            <td style="vertical-align: top;">
              ${rubricHtml}
              ${q.explanation ? `<div style="margin-top: 6px; font-style: italic;">Lưu ý: ${q.explanation}</div>` : ''}
            </td>
          </tr>
        `;
      } else {
        htmlContent += `
          <tr>
            <td style="text-align: center; font-weight: bold;">Câu ${idx + 1}</td>
            <td style="font-weight: bold; color: #003366;">${q.correctAnswer || '-'}</td>
            <td>${q.explanation || 'Kiến thức chuẩn theo SGK Lịch sử GDPT 2018.'}</td>
          </tr>
        `;
      }
    });

    htmlContent += `
          </tbody>
        </table>
        <div style="margin-top: 25px; text-align: right; font-style: italic; font-size: 11pt;">
          <strong>GIÁO VIÊN BỘ MÔN LỊCH SỬ</strong><br/>
          <em>(Đã ký duyệt)</em><br/><br/><br/>
          <strong>Cô Cao Thị Thu</strong>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', htmlContent], {
      type: 'application/msword;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeTitle = (selectedLessonFilter !== 'all' ? selectedLessonFilter : computedRoomTitle)
      .replace(/[^a-zA-Z0-9_\u00C0-\u1EF9]/g, '_')
      .slice(0, 35);
    link.href = url;
    link.download = `De_Thi_Lich_Su_Khoi${currentGrade}_${safeTitle}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`Đã xuất thành công ${questionsToExport.length} câu hỏi ra file Word (.doc)!`);
  };

  // -------------------------------------------------------------------------
  // 7. SCORING & PEDAGOGICAL EVALUATION ENGINE
  // -------------------------------------------------------------------------
  interface SectionScoreDetail {
    type: QuestionType;
    score: number;
    maxScore: number;
    questionCount: number;
    details: string;
  }

  const evaluationResult = useMemo(() => {
    if (roomQuestions.length === 0) {
      return {
        totalScore: 0,
        maxScore: 10,
        sectionBreakdown: [],
        evaluationLevel: 'Chưa đạt' as EvaluationLevel,
        evaluationText: 'Chưa có dữ liệu bài thi.',
        pedagogicalComment: '',
      };
    }

    const singleQuestions = roomQuestions.filter(
      (q) => q.type === 'Trắc nghiệm đơn' || q.type === 'Trắc nghiệm'
    );
    const tfQuestions = roomQuestions.filter((q) => q.type === 'Trắc nghiệm đúng sai');
    const blankQuestions = roomQuestions.filter((q) => q.type === 'Điền từ');
    const matchQuestions = roomQuestions.filter((q) => q.type === 'Nối từ');
    const essayQuestions = roomQuestions.filter((q) => q.type === 'Tự luận');

    let sectionBreakdown: SectionScoreDetail[] = [];
    let finalScore = 0;

    // CASE 1: ROOM 1 - TRẮC NGHIỆM ĐƠN
    if (activeRoomMode === 'Trắc nghiệm đơn') {
      let singleCorrect = 0;
      singleQuestions.forEach((q) => {
        const studentAns = singleAnswers[q.id];
        if (studentAns && q.correctAnswer && studentAns.trim().toUpperCase() === q.correctAnswer.trim().toUpperCase()) {
          singleCorrect++;
        }
      });
      finalScore = singleQuestions.length > 0 ? (singleCorrect / singleQuestions.length) * 10.0 : 0;
      sectionBreakdown.push({
        type: 'Trắc nghiệm đơn',
        score: finalScore,
        maxScore: 10.0,
        questionCount: singleQuestions.length,
        details: `Đúng ${singleCorrect} / ${singleQuestions.length} câu`,
      });
    }

    // CASE 2: ROOM 2 - ĐÚNG / SAI TƯ LIỆU
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
        details: `Barem bậc thang Bộ GD&ĐT: ${rawTfPoints.toFixed(2)}/${maxRawTfPoints.toFixed(2)}đ gốc -> Hệ 10: ${finalScore.toFixed(2)}đ`,
      });
    }

    // CASE 3: ROOM 3 - ĐIỀN TỪ
    else if (activeRoomMode === 'Điền từ') {
      let blankCorrectTotal = 0;
      let blankSlotsTotal = 0;
      blankQuestions.forEach((q) => {
        const userAns = blankAnswers[q.id] || {};
        const slots = q.blankItems || [];
        blankSlotsTotal += slots.length;
        slots.forEach((slot) => {
          const typed = (userAns[slot.blankLabel] || '').trim().toLowerCase();
          const expected = (slot.correctWord || '').trim().toLowerCase();
          if (typed && expected && (typed === expected || expected.includes(typed))) {
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
        details: `Đúng ${blankCorrectTotal} / ${blankSlotsTotal} vị trí khuyết`,
      });
    }

    // CASE 4: ROOM 4 - GHÉP ĐÔI / NỐI TỪ
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
        details: `Ghép đúng ${matchCorrectTotal} / ${matchPairsTotal} cặp sự kiện`,
      });
    }

    // CASE 5: ROOM 5 - TỰ LUẬN
    else if (activeRoomMode === 'Tự luận') {
      let essayTotal = 0;
      let totalMatchedCriteria = 0;
      let totalRubricCriteria = 0;
      essayQuestions.forEach((q) => {
        const matchRes = scoreEssayByRubric(q, essayAnswers[q.id] || '');
        let qScore = matchRes.score;
        totalMatchedCriteria += matchRes.matchedCriteriaCount;
        totalRubricCriteria += matchRes.totalCriteriaCount;

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
        details: `Chấm thử theo Rubric (${totalMatchedCriteria}/${totalRubricCriteria} ý trọng tâm): ${finalScore.toFixed(2)}/10đ — Chờ Cô Thu duyệt chính thức`,
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
    roomQuestions,
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

  const notifyProctoringViolationsIfAny = () => {
    if (isProctoringEnabled && proctoringViolations.length > 0) {
      const stdName = currentStudent?.fullName || 'Học viên';
      const clsName = classes.find((c) => c.id === selectedClassId)?.name || 'GDTX';
      const summaryTimes = proctoringViolations
        .slice(0, 4)
        .map((v) => `${v.timestamp} (${v.label})`)
        .join('; ');
      addNotification({
        title:
          proctoringViolations.length >= 3
            ? `Cảnh báo quy chế thi: ${stdName} (${proctoringViolations.length} vi phạm)`
            : `Nhắc nhở phòng thi: ${stdName} (${proctoringViolations.length} lần rời màn hình)`,
        content: `Lớp ${clsName} · ${computedRoomTitle}: Ghi nhận ${proctoringViolations.length} lần (${summaryTimes}).`,
        date: new Date().toLocaleDateString('vi-VN'),
        type: 'exam',
        read: false,
      });
    }
  };

  const exitFullscreenSafely = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleSubmitExam = () => {
    setIsConfirmSubmitOpen(false);
    setIsProctoringWarningOpen(false);
    setIsSubmitted(true);
    setIsTimerPaused(true);
    exitFullscreenSafely();
    notifyProctoringViolationsIfAny();
  };

  const handleAutoSubmit = () => {
    setIsProctoringWarningOpen(false);
    setIsSubmitted(true);
    setIsTimerPaused(true);
    exitFullscreenSafely();
    notifyProctoringViolationsIfAny();
    alert('⏱ Đã hết thời gian làm bài! Hệ thống tự động thu bài và chuyển sang xem bảng điểm.');
  };

  const handleSaveScoreToGradebook = () => {
    if (!currentStudent) {
      alert('Chưa có thông tin học viên để lưu điểm!');
      return;
    }

    const examTitleSaved = `${computedRoomTitle} (${durationMinutes}p)`;
    const examCode = `KT_ROOM_${activeRoomMode === 'Trắc nghiệm đơn' ? 'TN' : activeRoomMode === 'Trắc nghiệm đúng sai' ? 'DS' : activeRoomMode === 'Điền từ' ? 'DT' : activeRoomMode === 'Nối từ' ? 'ND' : activeRoomMode === 'Tự luận' ? 'TL' : 'ALL'}_${Date.now().toString().slice(-4)}`;

    const violationNote =
      proctoringViolations.length > 0
        ? ` | Giám sát: ${proctoringViolations.length} vi phạm`
        : ' | Giám sát: Hợp lệ';

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
      description: `Kiểm tra tại ${computedRoomTitle}${violationNote}`,
    });

    updateStudentScore(
      currentStudent.id,
      examId,
      evaluationResult.totalScore,
      `${computedRoomTitle}: ${evaluationResult.evaluationText}${violationNote}`
    );

    setSaveSuccessMsg(
      `Đã lưu điểm ${evaluationResult.totalScore.toFixed(2)} (${evaluationResult.evaluationLevel}) vào Sổ điểm điện tử cho học viên ${currentStudent.fullName}!`
    );
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  // Keyboard shortcut listener for Single Choice Room (when not typing in textarea)
  useEffect(() => {
    if (!isOpen || isSubmitted || displayMode !== 'single' || effectiveTeacherMode) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      const activeQ = roomQuestions[currentQuestionIndex];
      if (!activeQ) return;

      const key = e.key.toUpperCase();
      if (['A', 'B', 'C', 'D'].includes(key) && (activeQ.type === 'Trắc nghiệm đơn' || activeQ.type === 'Trắc nghiệm')) {
        setSingleAnswers((prev) => ({ ...prev, [activeQ.id]: key }));
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        if (currentQuestionIndex < roomQuestions.length - 1) {
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
  }, [isOpen, isSubmitted, displayMode, currentQuestionIndex, roomQuestions, effectiveTeacherMode]);

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
      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#073B66] text-white px-4 py-2.5 rounded-2xl shadow-xl border border-sky-400 flex items-center gap-2.5 text-xs font-bold animate-in slide-in-from-bottom-3 duration-200 font-sans">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

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
                  {isStudentTakingExam ? (
                    <>
                      Học viên: <strong>{currentStudent?.fullName || 'Học viên'}</strong> {currentStudent?.code ? `(${currentStudent.code})` : ''}
                    </>
                  ) : (
                    <>
                      Tài khoản: <strong>Cô Cao Thị Thu</strong> (Giáo viên Lịch sử)
                    </>
                  )}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold truncate max-w-[280px] sm:max-w-lg font-sans">
                {computedRoomTitle}
              </h2>
            </div>
          </div>

          {/* Center: Smart Countdown Timer & Proctoring Status (CHỈ HIỂN THỊ ĐỐI VỚI THÍ SINH LÀM BÀI) */}
          {isStudentTakingExam ? (
            <div className="flex flex-wrap items-center gap-2 font-sans">
              <div
                className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 font-bold transition-all ${timerStatusColor}`}
              >
                <Clock className="w-4 h-4 shrink-0" />
                <div className="flex flex-col text-left">
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                    {durationMinutes === 0 ? 'Thời gian' : 'Thời gian còn lại'}
                  </span>
                  <span className="text-base font-black tracking-wider leading-none tabular-nums">
                    {formattedTime}
                  </span>
                </div>
              </div>

              {/* Proctoring Live Indicator */}
              {isExamSessionStarted && !isSubmitted && (
                <div
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 tabular-nums whitespace-nowrap shrink-0 ${
                    proctoringViolations.length === 0
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
                      : proctoringViolations.length < 3
                      ? 'bg-amber-50 border-amber-300 text-amber-900 dark:bg-amber-950/40 dark:border-amber-700 dark:text-amber-300'
                      : 'bg-rose-50 border-rose-300 text-rose-900 dark:bg-rose-950/40 dark:border-rose-700 dark:text-rose-300'
                  }`}
                  title="Chế độ Giám sát Toàn màn hình (Phương án 1) đang hoạt động"
                >
                  {proctoringViolations.length >= 3 ? (
                    <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                  <span>Giám sát: {proctoringViolations.length} vi phạm</span>
                </div>
              )}

              {/* Chỉ cho Giáo viên đang xem thử cộng thêm giờ */}
              {userRole !== 'student' && (
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
              )}
            </div>
          ) : (
            /* Đối với Giáo viên: Hoàn toàn không hiện đồng hồ đếm ngược, hiển thị huy hiệu Soạn & Sửa đề không tính giờ */
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 text-amber-900 dark:text-amber-200 text-xs font-semibold font-sans">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>Chế độ Giáo viên Soạn & Hiệu chỉnh đề (Không tính thời gian)</span>
            </div>
          )}

          {/* Right: Actions (Teacher tools hidden completely during Student Exam) */}
          <div className="flex items-center gap-2 font-sans">
            {!isStudentTakingExam && (
              <>
                {/* BUTTON 0: NHẬP FILE WORD / COPY DÁN THEO KHỐI LỚP */}
                <button
                  onClick={() => setIsRoomImportModalOpen(true)}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm cursor-pointer transition-all active:scale-95"
                  title="Nhập câu hỏi theo từng khối lớp 10, 11, 12 từ file Word (.docx) hoặc copy dán trực tiếp"
                >
                  <Upload className="w-3.5 h-3.5 text-amber-300" />
                  <span>Nhập file Word / Copy dán</span>
                </button>

                {/* BUTTON 1: THÊM CÂU HỎI MỚI VÀO PHÒNG NÀY */}
                <button
                  onClick={handleAddNewQuestionToRoom}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm cursor-pointer transition-all active:scale-95"
                  title="Thêm một câu hỏi mới trực tiếp vào phòng thi này"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm câu hỏi mới</span>
                </button>

                {/* BUTTON 2: LƯU & NHẬP TẤT CẢ VÀO NGÂN HÀNG ĐỀ */}
                <button
                  onClick={handleSyncAllToBank}
                  className="px-3.5 py-1.5 bg-[#073B66] hover:bg-[#0878C9] text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
                  title="Lưu và nhập toàn bộ câu hỏi của phòng này vào Ngân hàng đề thi"
                >
                  <Save className="w-3.5 h-3.5 text-amber-300" />
                  <span>Lưu & Nhập tất cả {roomQuestions.length} câu vào Ngân hàng đề</span>
                </button>

                {/* BUTTON 2.5: XUẤT ĐỀ THI RA FILE WORD (.DOC) */}
                <button
                  onClick={handleExportRoomToWord}
                  className="px-3 py-1.5 bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-800 hover:to-emerald-800 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm cursor-pointer transition-all active:scale-95"
                  title="Xuất đề thi ra file Microsoft Word (.doc) có đầy đủ đáp án và lời giải chi tiết"
                >
                  <Download className="w-3.5 h-3.5 text-amber-300" />
                  <span className="hidden xl:inline">Xuất đề Word</span>
                </button>

                {/* BUTTON 3: TOGGLE TEACHER EDIT MODE */}
                <button
                  onClick={() => setIsTeacherMode(!isTeacherMode)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                    isTeacherMode
                      ? 'bg-amber-100 border-amber-400 text-amber-950 font-black shadow-xs ring-2 ring-amber-300'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
                  }`}
                  title="Bật/Tắt chế độ Giáo viên Soạn & Sửa đề thi trực tiếp"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                  <span>{isTeacherMode ? 'Đang Soạn/Sửa đề' : 'Chế độ Sửa đề'}</span>
                </button>

                {/* BUTTON 4: THỬ GIÁM SÁT THÍ SINH */}
                <button
                  onClick={() => {
                    setIsTeacherMode(false);
                    setIsProctorPreview(true);
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-sky-50 hover:bg-sky-100 text-[#073B66] border border-sky-200 cursor-pointer transition-colors whitespace-nowrap shrink-0"
                  title="Xem thử trực tiếp giao diện Giám sát Toàn màn hình như thí sinh"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0878C9]" />
                  <span>Thử Giám sát</span>
                </button>
              </>
            )}

            {/* Teacher-only quick exit from Proctor Preview */}
            {isProctorPreview && userRole !== 'student' && (
              <button
                onClick={() => {
                  exitFullscreenSafely();
                  setIsProctorPreview(false);
                  setIsTeacherMode(true);
                  setIsExamSessionStarted(false);
                  setIsProctoringWarningOpen(false);
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 cursor-pointer transition-colors whitespace-nowrap shrink-0"
                title="Quay lại chế độ Giáo viên Soạn & Sửa đề"
              >
                Thoát thử Thí sinh
              </button>
            )}

            {/* View Mode Toggle */}
            <div className="hidden lg:flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5 border border-slate-200 dark:border-slate-700 text-xs font-bold">
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

            {/* Theme switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5 border border-slate-200 dark:border-slate-700 text-xs">
              <button
                onClick={() => setTheme('sepia')}
                className={`p-1.5 rounded-lg cursor-pointer ${
                  theme === 'sepia'
                    ? 'bg-[#F5EEDC] text-amber-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Màu ấm Sepia"
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
                title="Trắng tiêu chuẩn"
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
                title="Chế độ Tối"
              >
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
              </button>
            </div>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-600 dark:text-slate-300 cursor-pointer transition-colors"
              title="Toàn màn hình"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>

            {/* Close */}
            <button
              onClick={() => {
                exitFullscreenSafely();
                onClose();
              }}
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
        <div className="flex items-center justify-between gap-2 overflow-x-auto py-1 font-sans border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1">
              Phòng thi:
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
              Tất cả (5 Dạng)
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
              Tổng số: <strong>{roomQuestions.length} câu</strong>
            </span>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------------- */}
      {/* 2. MAIN BODY: EXAM QUESTIONS OR TEACHER EDIT MODE                   */}
      {/* ------------------------------------------------------------------- */}
      <div className="flex-1 flex overflow-hidden">
        {!isSubmitted && isProctoringEnabled && !isExamSessionStarted ? (
          <ExamProctoringPreStartGate
            roomTitle={computedRoomTitle}
            studentName={currentStudent?.fullName || 'Học viên'}
            studentCode={currentStudent?.code}
            className={
              currentStudent?.className ||
              classes.find((c) => c.id === selectedClassId)?.name ||
              '12A3'
            }
            durationMinutes={durationMinutes}
            questionCount={displayedQuestions.length || roomQuestions.length}
            theme={theme}
            isTeacherPreview={isProctorPreview && userRole !== 'student'}
            onStartExam={handleStartProctoredExam}
            onCancel={() => {
              if (isProctorPreview && userRole !== 'student') {
                setIsProctorPreview(false);
                setIsTeacherMode(true);
              } else {
                exitFullscreenSafely();
                onClose();
              }
            }}
          />
        ) : !isSubmitted ? (
          <>
            {/* Left Area: Questions Render Container */}
            <main
              className={`flex-1 overflow-y-auto p-4 sm:p-6 relative ${
                isProctoringLive ? 'select-none' : ''
              }`}
            >
              {isProctoringLive && (
                <ExamProctoringWatermark
                  studentName={currentStudent?.fullName || 'Học viên'}
                  studentCode={currentStudent?.code}
                  className={
                    currentStudent?.className ||
                    classes.find((c) => c.id === selectedClassId)?.name ||
                    '12A3'
                  }
                  roomLabel={computedRoomTitle}
                />
              )}

              <div
                className={`relative z-20 transition-all duration-150 ${
                  isProctoringLive && isProctoringWarningOpen
                    ? 'filter blur-md pointer-events-none select-none'
                    : ''
                }`}
              >
              {/* TEACHER TOOLS BAR (ONLY IN TEACHER MODE) */}
              {effectiveTeacherMode && (
                <div className="max-w-4xl mx-auto mb-3 p-3.5 sm:p-4 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100 dark:from-amber-950/40 dark:via-slate-800 dark:to-amber-950/30 border-2 border-amber-400 dark:border-amber-600/60 rounded-2xl font-sans text-xs shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 text-amber-950 dark:text-amber-200 font-bold">
                      <span className="p-2 bg-amber-400 text-amber-950 rounded-xl shadow-2xs">
                        <Edit3 className="w-4 h-4 stroke-[2.5]" />
                      </span>
                      <div>
                        <span className="text-sm font-black text-[#073B66] dark:text-amber-300 block">
                          Khu Vực Soạn & Hiệu Chỉnh Đề Thi (Cô Cao Thị Thu):
                        </span>
                        <p className="text-[11px] text-amber-900 dark:text-amber-200/80 font-normal">
                          Soạn & sửa câu hỏi theo Khối, Lớp và Bài học. Sau mỗi câu bấm <strong>[ 💾 Lưu câu ]</strong> hoặc lưu tất cả vào Ngân hàng đề.
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsRoomImportModalOpen(true)}
                        className="px-3.5 py-2 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white rounded-xl font-black flex items-center gap-1.5 cursor-pointer shadow-sm transition-all active:scale-95"
                        title="Nhập câu hỏi theo từng khối lớp từ file Word (.docx) hoặc copy dán trực tiếp"
                      >
                        <Upload className="w-4 h-4 text-amber-300" />
                        <span>Nhập file Word / Copy dán</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleAddNewQuestionToRoom}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black flex items-center gap-1.5 cursor-pointer shadow-sm transition-all active:scale-95"
                      >
                        <Plus className="w-4 h-4 text-white" />
                        <span>Thêm câu mới</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleSyncAllToBank}
                        className="px-3.5 py-2 bg-[#073B66] hover:bg-[#0878C9] text-white rounded-xl font-black flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                      >
                        <Save className="w-3.5 h-3.5 text-amber-300" />
                        <span>Lưu & Nhập tất cả ({roomQuestions.length} câu)</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleExportRoomToWord}
                        className="px-3.5 py-2 bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-800 text-white rounded-xl font-black flex items-center gap-1.5 cursor-pointer shadow-sm transition-all active:scale-95"
                        title="Xuất câu hỏi trong phòng thi ra file Word (.doc) kèm barem đáp án"
                      >
                        <Download className="w-3.5 h-3.5 text-amber-300" />
                        <span>Xuất đề Word (.doc)</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* THANH ĐIỀU HƯỚNG THÔNG MINH 3 TẦNG: KHỐI -> LỚP -> BÀI HỌC (HIỂN THỊ CẢ CHO HỌC SINH VÀ GIÁO VIÊN) */}
              <div
                className={`max-w-4xl mx-auto mb-5 p-3.5 sm:p-4 rounded-2xl font-sans text-xs shadow-sm space-y-3 transition-all ${
                  effectiveTeacherMode
                    ? 'bg-white/95 dark:bg-slate-800/90 border-2 border-amber-300 dark:border-amber-700'
                    : 'bg-gradient-to-r from-sky-50/90 via-white to-blue-50/80 dark:from-slate-850 dark:via-slate-800 dark:to-slate-850 border-2 border-[#0878C9]/40 dark:border-sky-700/60'
                }`}
              >
                {/* Header for Student Mode */}
                {!effectiveTeacherMode && (
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-sky-100 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-[#073B66] text-white font-black text-[11px] flex items-center gap-1.5 shadow-2xs">
                        <GraduationCap className="w-3.5 h-3.5 text-amber-300" />
                        🎯 BỘ LỌC ĐỀ ÔN TẬP: CHỌN KHỐI • LỚP • BÀI HỌC
                      </span>
                      <span className="text-[11px] text-slate-500 hidden sm:inline">
                        Lựa chọn đúng khối lớp và bài học để ôn luyện trọng tâm
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] bg-white dark:bg-slate-800 px-3 py-1 rounded-xl border border-sky-200 dark:border-slate-700 text-slate-700 dark:text-slate-200">
                      <span className="font-bold text-[#073B66] dark:text-sky-300 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-[#0878C9]" />
                        Học sinh:
                      </span>
                      <strong>{currentStudent?.fullName || 'Học viên'}</strong>
                      <span className="text-slate-300">•</span>
                      <span className="px-1.5 py-0.5 rounded-md bg-sky-100 dark:bg-sky-900/40 text-[#073B66] dark:text-sky-200 font-bold">
                        {currentStudent?.className || (classes.find((c) => c.id === selectedClassId)?.name ?? '12A3')}
                      </span>
                    </div>
                  </div>
                )}

                {/* TẦNG 1: NÚT CHỌN KHỐI (GRADE TABS) */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1 mr-1 shrink-0">
                    <GraduationCap className="w-4 h-4 text-[#0878C9]" />
                    Tầng 1 - Chọn Khối:
                  </span>

                  <button
                    type="button"
                    onClick={() => handleSelectGradeTab('all')}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                      selectedGradeTab === 'all'
                        ? 'bg-[#073B66] text-white shadow-xs ring-2 ring-[#073B66]/30'
                        : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 border border-slate-200 dark:border-slate-600'
                    }`}
                  >
                    <span>Tất cả các khối</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20 dark:bg-slate-600 text-inherit font-mono font-bold">
                      {roomQuestions.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectGradeTab(10)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                      selectedGradeTab === 10
                        ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-500/30'
                        : 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 border border-emerald-200 dark:border-emerald-700/60'
                    }`}
                  >
                    <span>🟢 Khối 10 (GDTX)</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 font-mono font-bold">
                      {gradeCounts[10]} câu
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectGradeTab(11)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                      selectedGradeTab === 11
                        ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-500/30'
                        : 'bg-white dark:bg-slate-700 text-blue-800 dark:text-blue-300 hover:bg-blue-50 border border-blue-200 dark:border-blue-700/60'
                    }`}
                  >
                    <span>🔵 Khối 11 (GDTX)</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-900 dark:text-blue-200 font-mono font-bold">
                      {gradeCounts[11]} câu
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectGradeTab(12)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                      selectedGradeTab === 12
                        ? 'bg-purple-600 text-white shadow-xs ring-2 ring-purple-500/30'
                        : 'bg-white dark:bg-slate-700 text-purple-800 dark:text-purple-300 hover:bg-purple-50 border border-purple-200 dark:border-purple-700/60'
                    }`}
                  >
                    <span>🟣 Khối 12 (GDTX)</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-900 dark:text-purple-200 font-mono font-bold">
                      {gradeCounts[12]} câu
                    </span>
                  </button>
                </div>

                {/* TẦNG 2 & TẦNG 3: CHỌN LỚP VÀ CHỌN BÀI HỌC */}
                <div className="flex flex-wrap items-center gap-2 pt-2.5 border-t border-slate-200/80 dark:border-slate-700/80">
                  {/* TẦNG 2: NÚT CHỌN LỚP */}
                  <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-2.5 py-1.5 shadow-2xs hover:border-[#0878C9] transition-colors">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 shrink-0">
                      <School className="w-3.5 h-3.5 text-[#0878C9]" />
                      <span>🏫 Tầng 2 - Lớp:</span>
                    </span>
                    <select
                      value={selectedClassId}
                      onChange={(e) => handleSelectClass(e.target.value)}
                      className="bg-transparent border-none text-xs font-bold text-[#073B66] dark:text-sky-200 outline-none cursor-pointer max-w-[170px] sm:max-w-[210px]"
                      title="Chọn lớp học tương ứng với khối để đồng bộ kết quả làm bài"
                    >
                      <option value="all">-- Tất cả các lớp --</option>
                      {selectedGradeTab === 'all' ? (
                        <>
                          <optgroup label="Khối 12 (GDTX)">
                            {classes
                              .filter((c) => c.grade === 12)
                              .map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.name}
                                </option>
                              ))}
                          </optgroup>
                          <optgroup label="Khối 11 (GDTX)">
                            {classes
                              .filter((c) => c.grade === 11)
                              .map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.name}
                                </option>
                              ))}
                          </optgroup>
                          <optgroup label="Khối 10 (GDTX)">
                            {classes
                              .filter((c) => c.grade === 10)
                              .map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.name}
                                </option>
                              ))}
                          </optgroup>
                        </>
                      ) : (
                        classes
                          .filter((c) => c.grade === selectedGradeTab)
                          .map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))
                      )}
                    </select>
                  </div>

                  {/* TẦNG 3: NÚT CHỌN CHƯƠNG / CHỦ ĐỀ */}
                  <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-2.5 py-1.5 shadow-2xs hover:border-[#0878C9] transition-colors">
                    <span className="text-[11px] font-bold text-blue-900 dark:text-sky-300 flex items-center gap-1 shrink-0">
                      <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                      <span>📚 Tầng 3 - Chủ đề:</span>
                    </span>
                    <select
                      value={selectedTopicFilter}
                      onChange={(e) => {
                        setSelectedTopicFilter(e.target.value);
                        setSelectedLessonFilter('all');
                        setCurrentQuestionIndex(0);
                      }}
                      className="bg-transparent border-none text-xs font-bold text-[#073B66] dark:text-sky-200 outline-none max-w-[170px] sm:max-w-[240px] cursor-pointer"
                      title="Lọc câu hỏi theo Chương / Chủ đề"
                    >
                      <option value="all">
                        -- Tất cả Chương / Chủ đề ({roomQuestions.filter((q) => selectedGradeTab === 'all' || (q.grade || 12) === selectedGradeTab).length} câu) --
                      </option>
                      {availableTopicsForFilter.map((topic) => {
                        const count = topicCounts[topic] || 0;
                        return (
                          <option key={topic} value={topic}>
                            {topic} {count > 0 ? `(${count} câu)` : '(0 câu)'}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* TẦNG 3: NÚT CHỌN BÀI HỌC CỤ THỂ */}
                  <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-2.5 py-1.5 shadow-2xs hover:border-[#0878C9] transition-colors">
                    <span className="text-[11px] font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1 shrink-0">
                      <FileText className="w-3.5 h-3.5 text-emerald-600" />
                      <span>📖 Bài học:</span>
                    </span>
                    <select
                      value={selectedLessonFilter}
                      onChange={(e) => {
                        setSelectedLessonFilter(e.target.value);
                        setCurrentQuestionIndex(0);
                      }}
                      className="bg-transparent border-none text-xs font-bold text-emerald-800 dark:text-emerald-200 outline-none max-w-[170px] sm:max-w-[240px] cursor-pointer"
                      title="Lọc câu hỏi theo từng Bài học cụ thể"
                    >
                      <option value="all">
                        -- Tất cả Bài học ({displayedQuestions.length} câu) --
                      </option>
                      {availableLessonsForFilter.map((lesson) => {
                        const count = lessonCounts[lesson] || 0;
                        return (
                          <option key={lesson} value={lesson}>
                            {lesson} {count > 0 ? `(${count} câu)` : '(0 câu)'}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* HUY HIỆU HIỂN THỊ TRẠNG THÁI SỐ CÂU HỎI */}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50/90 dark:bg-slate-800 border border-blue-200 dark:border-blue-900/50 text-blue-950 dark:text-sky-300 font-bold text-xs shadow-2xs">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>🎯 Đang hiển thị: <strong className="text-blue-700 dark:text-sky-200">{displayedQuestions.length}</strong> / {roomQuestions.length} câu</span>
                  </div>

                  {/* NÚT BỎ LỌC NHANH / XEM TOÀN BỘ ĐỀ */}
                  {(selectedTopicFilter !== 'all' || selectedLessonFilter !== 'all' || selectedGradeTab !== 'all' || selectedClassId !== 'all') && (
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="px-3 py-1.5 bg-gradient-to-r from-sky-500 to-[#0878C9] hover:from-sky-600 hover:to-[#073B66] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs active:scale-95"
                      title="Xóa bộ lọc, hiển thị toàn bộ câu hỏi trong phòng thi"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Xem toàn bộ đề ({roomQuestions.length} câu)</span>
                    </button>
                  )}
                </div>
              </div>

              {/* MODE 1: SINGLE QUESTION FOCUS VIEW */}
              {displayMode === 'single' && (() => {
                const activeList = displayedQuestions;
                const safeQuestionIndex = activeList.length > 0
                  ? Math.min(Math.max(0, currentQuestionIndex), activeList.length - 1)
                  : 0;
                const currentQuestion = activeList[safeQuestionIndex];

                if (!currentQuestion || activeList.length === 0) {
                  const availableLessonsWithQuestions = availableLessonsForFilter.filter(
                    (l) => (lessonCounts[l] || 0) > 0
                  );

                  return (
                    <div className="max-w-4xl mx-auto p-8 text-center bg-white dark:bg-slate-800 rounded-3xl border-2 border-dashed border-sky-300 dark:border-slate-700 space-y-5 font-sans shadow-sm">
                      <div className="w-14 h-14 rounded-2xl bg-sky-100 dark:bg-sky-950/50 text-[#073B66] dark:text-sky-300 flex items-center justify-center mx-auto shadow-xs">
                        <BookOpen className="w-7 h-7" />
                      </div>
                      <div className="max-w-xl mx-auto space-y-2">
                        <h4 className="font-black text-lg text-slate-900 dark:text-white">
                          Chưa có câu hỏi nào {selectedGradeTab !== 'all' ? `thuộc Khối ${selectedGradeTab}` : ''} {selectedLessonFilter !== 'all' ? `cho (${selectedLessonFilter})` : ''}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          {effectiveTeacherMode
                            ? 'Cô Thu có thể bấm [ ➕ Thêm câu mới ] để soạn trực tiếp câu hỏi cho bài này, hoặc bấm [ 📥 Nhập file Word ] để đưa trọn bộ câu hỏi vào hệ thống.'
                            : 'Em hãy chọn bài học khác có sẵn câu hỏi bên dưới hoặc bấm nút [ 🔄 Xem toàn bộ đề ] để làm bài ngay nhé!'}
                        </p>
                      </div>

                      {/* Gợi ý các bài có sẵn câu hỏi để học sinh/giáo viên bấm chọn ngay */}
                      {availableLessonsWithQuestions.length > 0 && (
                        <div className="bg-sky-50 dark:bg-slate-750 p-4 rounded-2xl border border-sky-100 dark:border-slate-700 max-w-2xl mx-auto">
                          <span className="text-xs font-bold text-[#073B66] dark:text-sky-300 block mb-2">
                            👉 Gợi ý các bài học đang có sẵn câu hỏi:
                          </span>
                          <div className="flex flex-wrap items-center justify-center gap-1.5">
                            {availableLessonsWithQuestions.slice(0, 6).map((l) => (
                              <button
                                key={l}
                                type="button"
                                onClick={() => {
                                  setSelectedLessonFilter(l);
                                  setCurrentQuestionIndex(0);
                                }}
                                className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-[#073B66] hover:text-white text-[#073B66] dark:text-sky-200 border border-sky-200 dark:border-slate-600 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1"
                              >
                                <span>{l}</span>
                                <span className="px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-slate-700 text-blue-900 dark:text-sky-200 text-[10px]">
                                  {lessonCounts[l] || 0} câu
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                        {roomQuestions.length > 0 && (
                          <button
                            type="button"
                            onClick={handleResetFilters}
                            className="px-5 py-2.5 bg-gradient-to-r from-sky-600 to-[#0878C9] hover:from-sky-700 hover:to-[#073B66] text-white rounded-xl font-black text-xs inline-flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-95"
                          >
                            <RotateCcw className="w-4 h-4" />
                            <span>Xem toàn bộ đề ({roomQuestions.length} câu)</span>
                          </button>
                        )}
                        {activeRoomMode === 'Tự luận' && roomQuestions.length === 0 && (
                          <button
                            type="button"
                            onClick={handleSeedSampleEssays}
                            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs inline-flex items-center gap-2 cursor-pointer shadow-sm transition-all"
                          >
                            <Sparkles className="w-4 h-4 text-amber-300" />
                            <span>Nạp bộ đề Tự luận mẫu (Khối 10–12)</span>
                          </button>
                        )}
                        {effectiveTeacherMode && (
                          <>
                            <button
                              type="button"
                              onClick={() => setIsRoomImportModalOpen(true)}
                              className="px-4 py-2.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 text-white rounded-xl font-bold text-xs inline-flex items-center gap-2 cursor-pointer shadow-sm transition-all"
                            >
                              <Upload className="w-4 h-4 text-amber-300" />
                              <span>Nhập file Word / Copy dán</span>
                            </button>
                            <button
                              type="button"
                              onClick={handleAddNewQuestionToRoom}
                              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs inline-flex items-center gap-2 cursor-pointer shadow-sm transition-all"
                            >
                              <Plus className="w-4 h-4" />
                              <span>{activeRoomMode === 'Tự luận' ? 'Soạn câu Tự luận mới' : 'Thêm câu mới'}</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="max-w-4xl mx-auto space-y-4">
                    {/* Progress Indicator */}
                    <div className="flex items-center justify-between text-xs text-slate-500 font-sans pb-2">
                      <span className="font-bold text-[#073B66] dark:text-sky-300 flex items-center gap-2">
                        <span>Câu {safeQuestionIndex + 1} / {activeList.length}</span>
                        {selectedGradeTab !== 'all' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                            Khối {selectedGradeTab}
                          </span>
                        )}
                      </span>
                      <span className="flex items-center gap-2">
                        <span>Đã làm: <strong>{answeredCount}</strong> / {activeList.length}</span>
                        <span className="text-slate-300">•</span>
                        <span>Hoàn thành: <strong>{Math.round((answeredCount / (activeList.length || 1)) * 100)}%</strong></span>
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#0878C9] h-full transition-all duration-300"
                        style={{
                          width: `${((safeQuestionIndex + 1) / (activeList.length || 1)) * 100}%`,
                        }}
                      />
                    </div>

                    {/* The Current Active Question Card */}
                    {renderQuestionCard(currentQuestion, safeQuestionIndex, true)}

                    {/* Bottom Navigation & Submit Actions */}
                    <div className="flex items-center justify-between pt-4 font-sans border-t border-slate-200 dark:border-slate-700">
                      <button
                        onClick={() =>
                          setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
                        }
                        disabled={safeQuestionIndex === 0}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Câu trước
                      </button>

                      <div className="flex items-center gap-2">
                        {effectiveTeacherMode && (
                          <>
                            <button
                              onClick={() => setIsRoomImportModalOpen(true)}
                              className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-300 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                            >
                              <Upload className="w-3.5 h-3.5 text-blue-700" />
                              Nhập Word
                            </button>

                            <button
                              onClick={handleAddNewQuestionToRoom}
                              className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                            >
                              <Plus className="w-3.5 h-3.5 text-emerald-700" />
                              Thêm câu mới
                            </button>
                          </>
                        )}

                        {/* Flag for review button */}
                        <button
                          onClick={() => toggleFlagQuestion(currentQuestion.id)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                            flaggedQuestionIds.includes(currentQuestion.id)
                              ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-xs'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <Flag
                            className={`w-3.5 h-3.5 ${
                              flaggedQuestionIds.includes(currentQuestion.id)
                                ? 'fill-amber-600 text-amber-600'
                                : 'text-slate-400'
                            }`}
                          />
                          {flaggedQuestionIds.includes(currentQuestion.id)
                            ? 'Đã gắn cờ'
                            : 'Gắn cờ'}
                        </button>
                      </div>

                      {safeQuestionIndex < activeList.length - 1 ? (
                        <button
                          onClick={() =>
                            setCurrentQuestionIndex((prev) =>
                              Math.min(activeList.length - 1, prev + 1)
                            )
                          }
                          className="px-5 py-2.5 bg-[#0878C9] hover:bg-[#073B66] text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
                        >
                          Câu tiếp theo
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      ) : isStudentTakingExam ? (
                        <button
                          onClick={() => setIsConfirmSubmitOpen(true)}
                          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
                        >
                          <Send className="w-4 h-4" />
                          Hoàn thành & Nộp bài
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleExportRoomToWord}
                            className="px-4 py-2.5 bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-800 text-white rounded-xl font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-95"
                            title="Xuất đề thi ra file Microsoft Word (.doc) có đầy đủ đáp án và lời giải chi tiết"
                          >
                            <Download className="w-4 h-4 text-amber-300" />
                            <span>Xuất đề Word (.doc)</span>
                          </button>
                          <button
                            onClick={handleSyncAllToBank}
                            className="px-5 py-2.5 bg-gradient-to-r from-[#073B66] to-[#0878C9] hover:from-[#0878C9] hover:to-[#073B66] text-white rounded-xl font-black text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all active:scale-95"
                            title="Lưu và nhập toàn bộ câu hỏi của phòng thi này vào Ngân hàng đề thi"
                          >
                            <Save className="w-4 h-4 text-amber-300" />
                            <span>Lưu & Nhập tất cả ({roomQuestions.length} câu) vào Ngân hàng đề</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* MODE 2: SCROLL VIEW (ALL QUESTIONS ON ONE PAGE) */}
              {displayMode === 'scroll' && (
                <div className="max-w-4xl mx-auto space-y-6">
                  {displayedQuestions.map((q, idx) => (
                    <div key={q.id || idx} id={`q_card_${idx}`}>
                      {renderQuestionCard(q, idx, false)}
                    </div>
                  ))}

                  {/* Bottom Global Actions */}
                  <div className="p-4 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 font-sans">
                    {effectiveTeacherMode && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setIsRoomImportModalOpen(true)}
                          className="px-5 py-2.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 text-white rounded-2xl font-black text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
                        >
                          <Upload className="w-4 h-4 text-amber-300" />
                          Nhập file Word / Copy dán
                        </button>

                        <button
                          onClick={handleAddNewQuestionToRoom}
                          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Thêm câu mới
                        </button>
                      </div>
                    )}

                    {effectiveTeacherMode && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleExportRoomToWord}
                          className="px-5 py-2.5 bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-800 text-white rounded-2xl font-black text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
                        >
                          <Download className="w-4 h-4 text-amber-300" />
                          Xuất đề Word (.doc)
                        </button>
                        <button
                          onClick={handleSyncAllToBank}
                          className="px-5 py-2.5 bg-[#073B66] hover:bg-[#0878C9] text-white rounded-2xl font-black text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
                        >
                          <Save className="w-4 h-4 text-amber-300" />
                          Lưu & Nhập tất cả ({roomQuestions.length} câu) vào Ngân hàng đề
                        </button>
                      </div>
                    )}

                    {isStudentTakingExam && (
                      <button
                        onClick={() => setIsConfirmSubmitOpen(true)}
                        className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 text-white rounded-2xl font-black text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        Hoàn thành & Nộp bài thi
                      </button>
                    )}
                  </div>
                </div>
              )}
              </div>
            </main>

            {/* Right Side: Question Navigation Matrix */}
            <aside
              className={`w-full md:w-72 border-t md:border-t-0 md:border-l p-4 flex flex-col justify-between shrink-0 font-sans transition-all duration-150 ${
                theme === 'dark' ? 'bg-[#141820] border-slate-700' : 'bg-white/80 border-slate-200'
              } ${
                isProctoringLive && isProctoringWarningOpen
                  ? 'filter blur-md pointer-events-none select-none'
                  : ''
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                  <h4 className="font-bold text-xs uppercase text-[#073B66] dark:text-sky-300">
                    Bảng câu hỏi ({displayedQuestions.length})
                  </h4>
                  {!isStudentTakingExam && (
                    <button
                      onClick={handleAddNewQuestionToRoom}
                      className="p-1 text-emerald-700 hover:bg-emerald-50 rounded-lg font-bold text-[11px] flex items-center gap-0.5 cursor-pointer"
                      title="Thêm câu hỏi mới"
                    >
                      <Plus className="w-3.5 h-3.5" /> Thêm
                    </button>
                  )}
                </div>

                {/* Grid of numbers */}
                <div className="grid grid-cols-5 gap-1.5 max-h-[45vh] overflow-y-auto pr-1">
                  {displayedQuestions.map((q, idx) => {
                    const isAnswered = isQuestionAnswered(q);
                    const isFlagged = flaggedQuestionIds.includes(q.id);
                    const isCurrent = displayMode === 'single' && currentQuestionIndex === idx;
                    const isSaved = !!savedQuestionStatus[q.id];

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
                        {isSaved && (
                          <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full" />
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
                    💡 <strong>Phím tắt:</strong> Bấm <strong>A, B, C, D</strong> để chọn đáp án tức thì!
                  </div>
                )}
              </div>

              {/* Submit CTA */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
                {!isStudentTakingExam && (
                  <>
                    <button
                      onClick={handleExportRoomToWord}
                      className="w-full py-2 bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                      title="Xuất file đề thi Word (.doc) kèm đáp án chi tiết"
                    >
                      <Download className="w-3.5 h-3.5 text-amber-300" />
                      Xuất đề thi Word (.doc)
                    </button>
                    <button
                      onClick={handleSyncAllToBank}
                      className="w-full py-2 bg-[#073B66] hover:bg-[#0878C9] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                    >
                      <Save className="w-3.5 h-3.5 text-amber-300" />
                      Lưu & Nhập tất cả vào Ngân hàng đề
                    </button>
                  </>
                )}
                {isStudentTakingExam && (
                  <button
                    onClick={() => setIsConfirmSubmitOpen(true)}
                    className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    Nộp bài thi
                  </button>
                )}
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
                    setTimeSpentSeconds(0);
                    setProctoringViolations([]);
                    setIsProctoringWarningOpen(false);
                    setLatestViolation(null);
                    setFullscreenGranted(false);
                    if (isProctoringEnabled) {
                      setIsExamSessionStarted(false);
                    }
                  }}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Làm lại bài thi này
                </button>
                <button
                  onClick={() => {
                    exitFullscreenSafely();
                    onClose();
                  }}
                  className="px-3.5 py-2 bg-[#073B66] hover:bg-[#0878C9] text-white rounded-xl font-bold text-xs cursor-pointer transition-colors"
                >
                  Đóng phòng thi
                </button>
              </div>
            </div>

            {/* Proctoring Report & Violation Log on Scorecard */}
            <ExamProctoringScorecardReport
              violations={proctoringViolations}
              wasProctored={isProctoringEnabled}
              themeCardClasses={themeCardClasses}
            />

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
                {roomQuestions.map((q, idx) => (
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

                    {/* Essay review with side-by-side outline & interactive rubric checklist */}
                    {q.type === 'Tự luận' && (
                      <EssayScorecardReviewCard
                        question={q}
                        studentAnswer={essayAnswers[q.id] || ''}
                        onPracticeAgain={() => {
                          setIsSubmitted(false);
                          setSecondsRemaining(durationMinutes > 0 ? durationMinutes * 60 : 0);
                          setCurrentQuestionIndex(idx);
                        }}
                      />
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
                Em đã làm được <strong>{answeredCount}</strong> / {roomQuestions.length} câu hỏi.
              </p>
            </div>

            {answeredCount < roomQuestions.length && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium">
                ⚠️ Chú ý: Em vẫn còn <strong>{roomQuestions.length - answeredCount} câu chưa làm</strong>.
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

      {/* Room Import Word / Fast Paste Modal for Grades 10, 11, 12 */}
      <RoomImportWordModal
        isOpen={isRoomImportModalOpen}
        onClose={() => setIsRoomImportModalOpen(false)}
        roomMode={activeRoomMode}
        roomTitle={computedRoomTitle}
        defaultGrade={selectedGradeTab === 'all' ? 12 : selectedGradeTab}
        onImportQuestions={handleImportQuestionsFromModal}
      />

      {/* Fullscreen Anti-Cheating Warning Overlay (Phương án 1) */}
      {isProctoringLive && isProctoringWarningOpen && (
        <ExamProctoringWarningOverlay
          violationCount={proctoringViolations.length}
          latestViolation={latestViolation}
          fullscreenSupported={
            typeof document !== 'undefined' && !!document.documentElement?.requestFullscreen
          }
          onResumeExam={handleResumeProctoredExam}
          onRequestSubmitEarly={() => {
            setIsProctoringWarningOpen(false);
            setIsConfirmSubmitOpen(true);
          }}
        />
      )}
    </div>
  );

  // -------------------------------------------------------------------------
  // 9. RENDER QUESTION CARD HELPERS (SUPPORTS TEACHER EDITING & STUDENT MODE)
  // -------------------------------------------------------------------------
  function renderQuestionCard(q: Question, idx: number, isFocusView: boolean) {
    const isSingle = q.type === 'Trắc nghiệm đơn' || q.type === 'Trắc nghiệm';
    const isTF = q.type === 'Trắc nghiệm đúng sai';
    const isBlank = q.type === 'Điền từ';
    const isMatch = q.type === 'Nối từ';
    const isEssay = q.type === 'Tự luận';

    const isCardPreviewingStudent = !!studentViewCardIds[q.id];
    const isCardEditing =
      !isStudentTakingExam && !isCardPreviewingStudent && (isTeacherMode || editingCardId === q.id);
    const isCardSaved = !!savedQuestionStatus[q.id];

    return (
      <div
        className={`p-5 sm:p-6 rounded-3xl border transition-all ${themeCardClasses} ${fontSizeClasses} ${
          isCardEditing ? 'border-amber-400 ring-2 ring-amber-100 dark:ring-amber-950/40' : ''
        }`}
      >
        {/* Header: Type and question number, Teacher Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200/60 dark:border-slate-700/60 font-sans mb-3">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-[#073B66] text-white flex items-center justify-center font-black text-xs shadow-2xs">
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

            {/* Grade Badge & Change Selector for Cô Thu */}
            {isCardEditing ? (
              <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 px-2 py-0.5 rounded-lg text-xs font-bold text-amber-950 dark:text-amber-200">
                <GraduationCap className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                <span className="text-[11px]">Khối:</span>
                <select
                  value={q.grade || 12}
                  onChange={(e) => {
                    const newGrade = Number(e.target.value) as 10 | 11 | 12;
                    const topicsForNewGrade = getTopicsForGrade(newGrade);
                    const newTopic = topicsForNewGrade[0] || q.topic;
                    const lessonsForNewTopic = getLessonsForTopic(newGrade, newTopic);
                    handleUpdateQuestion(q.id, {
                      grade: newGrade,
                      topic: newTopic,
                      lesson: lessonsForNewTopic[0] || q.lesson,
                    });
                  }}
                  className="bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 rounded px-1.5 py-0.5 font-bold text-xs text-amber-950 dark:text-amber-200 outline-none cursor-pointer"
                >
                  <option value={10}>Lớp 10</option>
                  <option value={11}>Lớp 11</option>
                  <option value={12}>Lớp 12</option>
                </select>
              </div>
            ) : (
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                  q.grade === 10
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : q.grade === 11
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                    : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                }`}
              >
                Khối {q.grade || 12}
              </span>
            )}

            {/* 1. NÚT PHÂN LOẠI CHƯƠNG / CHỦ ĐỀ TRÊN CÂU HỎI */}
            {isCardEditing ? (
              <div className="flex items-center gap-1 bg-blue-50 dark:bg-blue-950/40 border border-blue-300 dark:border-blue-700 px-2 py-0.5 rounded-lg text-xs font-bold text-blue-950 dark:text-blue-200">
                <BookOpen className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400 shrink-0" />
                <span className="text-[11px] shrink-0">Chủ đề:</span>
                <select
                  value={q.topic || ''}
                  onChange={(e) => {
                    const newTopic = e.target.value;
                    const lessonsForTopic = getLessonsForTopic(q.grade || 12, newTopic);
                    handleUpdateQuestion(q.id, {
                      topic: newTopic,
                      lesson: lessonsForTopic[0] || q.lesson || 'Bài học trọng tâm',
                    });
                  }}
                  className="bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-700 rounded px-1.5 py-0.5 font-bold text-xs text-blue-950 dark:text-blue-200 outline-none cursor-pointer max-w-[160px] sm:max-w-[210px]"
                  title="Chọn Chương / Chủ đề cho câu hỏi này"
                >
                  {getTopicsForGrade(q.grade || 12).map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                  {q.topic && !getTopicsForGrade(q.grade || 12).includes(q.topic) && (
                    <option value={q.topic}>{q.topic}</option>
                  )}
                </select>
              </div>
            ) : (
              <span
                className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300 truncate max-w-[150px] sm:max-w-[220px]"
                title={q.topic}
              >
                📚 {q.topic || 'Chủ đề'}
              </span>
            )}

            {/* 2. NÚT PHÂN LOẠI BÀI HỌC TRÊN CÂU HỎI */}
            {isCardEditing ? (
              <div className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 px-2 py-0.5 rounded-lg text-xs font-bold text-emerald-950 dark:text-emerald-200">
                <FileText className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                <span className="text-[11px] shrink-0">Bài học:</span>
                <select
                  value={q.lesson || ''}
                  onChange={(e) =>
                    handleUpdateQuestion(q.id, {
                      lesson: e.target.value,
                    })
                  }
                  className="bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 rounded px-1.5 py-0.5 font-bold text-xs text-emerald-950 dark:text-emerald-200 outline-none cursor-pointer max-w-[160px] sm:max-w-[210px]"
                  title="Chọn Bài học cụ thể cho câu hỏi này"
                >
                  {getLessonsForTopic(q.grade || 12, q.topic || '').map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                  {q.lesson &&
                    !getLessonsForTopic(q.grade || 12, q.topic || '').includes(q.lesson) && (
                      <option value={q.lesson}>{q.lesson}</option>
                    )}
                </select>
              </div>
            ) : (
              <span
                className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 truncate max-w-[150px] sm:max-w-[220px]"
                title={q.lesson}
              >
                📖 {q.lesson || 'Bài học'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isStudentTakingExam && (
              <>
                {/* Toggle Card Edit Mode / Back from Student Preview */}
                <button
                  type="button"
                  onClick={() => {
                    if (isCardPreviewingStudent) {
                      setStudentViewCardIds((prev) => ({ ...prev, [q.id]: false }));
                      setEditingCardId(q.id);
                    } else if (isTeacherMode) {
                      setStudentViewCardIds((prev) => ({ ...prev, [q.id]: true }));
                    } else {
                      setEditingCardId(editingCardId === q.id ? null : q.id);
                    }
                  }}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                    isCardEditing
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                  title={
                    isCardPreviewingStudent
                      ? 'Quay lại chế độ Soạn câu này'
                      : isTeacherMode
                      ? 'Xem thử góc nhìn Học sinh cho câu này'
                      : 'Chỉnh sửa nội dung và đáp án câu này'
                  }
                >
                  {isCardPreviewingStudent ? <Edit3 className="w-3.5 h-3.5" /> : isCardEditing && isTeacherMode ? <Eye className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
                  <span>
                    {isCardPreviewingStudent
                      ? 'Sửa lại câu này'
                      : isCardEditing && isTeacherMode
                      ? 'Xem góc nhìn HS'
                      : isCardEditing
                      ? 'Đang sửa'
                      : 'Sửa câu này'}
                  </span>
                </button>

                {/* Delete Question Button */}
                <button
                  type="button"
                  onClick={() => handleDeleteIndividualQuestion(q.id, idx)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  title="Xóa câu hỏi này khỏi phòng thi"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}

            {flaggedQuestionIds.includes(q.id) && (
              <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Flag className="w-3 h-3 fill-amber-500" /> Cần xem lại
              </span>
            )}
          </div>
        </div>

        {/* Content & Stimulus */}
        <div className="space-y-3">
          {!isStudentTakingExam && isCardPreviewingStudent && (
            <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-xs font-sans">
              <span className="font-semibold text-[#073B66] dark:text-sky-200 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-[#0878C9]" />
                Đang xem thử giao diện làm bài của Học sinh cho câu này
              </span>
              <button
                type="button"
                onClick={() => {
                  setStudentViewCardIds((prev) => ({ ...prev, [q.id]: false }));
                  setEditingCardId(q.id);
                }}
                className="px-2.5 py-1 rounded-lg bg-[#073B66] text-white font-bold text-[11px] hover:bg-[#0878C9] cursor-pointer"
              >
                Quay lại Soạn đề
              </button>
            </div>
          )}

          {/* TEACHER EDITING OF QUESTION CONTENT (Non-essay uses inline textarea; Essay uses EssayTeacherEditor) */}
          {isCardEditing && isEssay ? (
            <EssayTeacherEditor
              question={q}
              index={idx}
              onUpdateQuestion={handleUpdateQuestion}
              onPreviewStudentCard={() =>
                setStudentViewCardIds((prev) => ({ ...prev, [q.id]: true }))
              }
            />
          ) : isCardEditing ? (
            <div className="space-y-1 font-sans">
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-200">
                {isTF ? 'Đoạn trích tư liệu lịch sử / Nội dung câu hỏi:' : 'Nội dung câu hỏi:'}
              </label>
              <textarea
                rows={isTF ? 3 : 2}
                value={q.content}
                onChange={(e) => handleUpdateQuestion(q.id, { content: e.target.value })}
                className="w-full p-2.5 bg-white dark:bg-slate-800 border border-amber-300 rounded-xl font-serif text-xs sm:text-sm leading-relaxed outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="Nhập nội dung câu hỏi..."
              />
            </div>
          ) : (
            <div className="font-serif leading-relaxed text-slate-900 dark:text-slate-100 whitespace-pre-line font-medium mb-3">
              {q.content}
            </div>
          )}

          {/* 1. DẠNG TRẮC NGHIỆM ĐƠN */}
          {isSingle && (
            <div className="space-y-3">
              {/* Teacher Edit Answer Selection Buttons */}
              {isCardEditing && (
                <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-blue-50/70 border border-blue-200 rounded-xl font-sans">
                  <span className="font-bold text-[#073B66] text-xs flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4 text-blue-600" />
                    Bấm chọn đáp án đúng cho câu này:
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
              )}

              {/* Options */}
              {q.options && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 font-sans">
                  {(['A', 'B', 'C', 'D'] as const).map((letter, optIdx) => {
                    const optText = q.options?.[optIdx] || '';
                    const cleanText = optText.replace(/^[A-D]\.\s*/, '');
                    const isSelected = singleAnswers[q.id] === letter;
                    const isCorrectAnswer = q.correctAnswer?.toUpperCase() === letter;

                    if (isCardEditing) {
                      return (
                        <div
                          key={letter}
                          className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                            isCorrectAnswer
                              ? 'bg-emerald-50/70 border-emerald-400 ring-1 ring-emerald-300'
                              : 'bg-white dark:bg-slate-800 border-slate-200'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => handleSetSingleChoiceAnswer(q.id, letter)}
                            className={`w-6 h-6 rounded-lg font-black text-xs shrink-0 cursor-pointer transition-colors flex items-center justify-center ${
                              isCorrectAnswer
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
                              handleUpdateSingleChoiceOption(q.id, optIdx, letter, e.target.value)
                            }
                            className="flex-1 bg-transparent border-none outline-none text-xs font-serif text-slate-900 dark:text-white"
                            placeholder={`Nội dung phương án ${letter}...`}
                          />
                          {isCorrectAnswer && (
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded shrink-0">
                              Đúng ✓
                            </span>
                          )}
                        </div>
                      );
                    }

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

          {/* 2. DẠNG ĐÚNG / SAI CÓ TƯ LIỆU VÀ NÚT BẤM [ ĐÚNG ] / [ SAI ] */}
          {isTF && (
            <div className="space-y-4">
              {!isCardEditing && (
                <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 space-y-2.5 font-sans">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/70 pb-2">
                    <span className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-amber-600" />
                      ĐOẠN TRÍCH TƯ LIỆU LỊCH SỬ:
                    </span>
                    <div className="flex items-center gap-1 text-[11px]">
                      <span className="text-slate-500 font-medium">Bút dạ quang:</span>
                      <button
                        type="button"
                        onClick={() => setHighlighterColor('yellow')}
                        className={`px-2 py-0.5 rounded-md font-bold cursor-pointer border ${
                          highlighterColor === 'yellow'
                            ? 'bg-amber-200 text-amber-950 border-amber-400'
                            : 'bg-white text-slate-600 border-slate-200'
                        }`}
                      >
                        Vàng
                      </button>
                      <button
                        type="button"
                        onClick={() => setHighlighterColor('cyan')}
                        className={`px-2 py-0.5 rounded-md font-bold cursor-pointer border ${
                          highlighterColor === 'cyan'
                            ? 'bg-sky-200 text-sky-950 border-sky-400'
                            : 'bg-white text-slate-600 border-slate-200'
                        }`}
                      >
                        Xanh
                      </button>
                    </div>
                  </div>
                  <div className="font-serif leading-relaxed text-slate-900 dark:text-slate-100 whitespace-pre-line text-sm sm:text-base italic pl-2 border-l-4 border-amber-500 bg-white/70 dark:bg-slate-800/60 p-3 rounded-r-xl">
                    {q.content}
                  </div>
                </div>
              )}

              {/* 4 Statements a, b, c, d */}
              {q.trueFalseStatements && (
                <div className="space-y-2 font-sans">
                  <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase flex items-center justify-between">
                    <span>Xác định mỗi nhận định sau là ĐÚNG hay SAI:</span>
                    {isCardEditing && (
                      <span className="text-amber-700 font-bold">
                        (Bấm trực tiếp nút ĐÚNG/SAI bên dưới để cập nhật đáp án chuẩn)
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    {q.trueFalseStatements.map((stmt, stmtIdx) => {
                      const studentPick = (tfAnswers[q.id] || {})[stmt.id];
                      const activeCorrect = stmt.isCorrect;

                      return (
                        <div
                          key={stmt.id}
                          className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:border-slate-300"
                        >
                          <div className="flex items-center gap-2 flex-1">
                            <strong className="w-6 h-6 rounded-lg bg-purple-100 text-purple-900 font-black text-xs shrink-0 flex items-center justify-center uppercase font-sans">
                              {stmt.id})
                            </strong>
                            {isCardEditing ? (
                              <input
                                type="text"
                                value={stmt.statement}
                                onChange={(e) =>
                                  handleUpdateTfStatementText(q.id, stmtIdx, e.target.value)
                                }
                                className="flex-1 bg-transparent border-none outline-none text-xs font-serif text-slate-900 dark:text-white"
                                placeholder={`Nhận định ${stmt.id}...`}
                              />
                            ) : (
                              <span className="font-serif leading-relaxed text-xs sm:text-sm">
                                {stmt.statement}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                            {/* BUTTON ĐÚNG */}
                            <button
                              type="button"
                              onClick={() => {
                                if (isCardEditing) {
                                  handleToggleTfStatement(q.id, stmtIdx, true);
                                } else {
                                  setTfAnswers((prev) => ({
                                    ...prev,
                                    [q.id]: {
                                      ...prev[q.id],
                                      [stmt.id]: true,
                                    },
                                  }));
                                }
                              }}
                              className={`px-4 py-1.5 rounded-xl border text-xs font-black transition-all cursor-pointer ${
                                (isCardEditing ? activeCorrect === true : studentPick === true)
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-300'
                                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 hover:bg-emerald-50 hover:text-emerald-800'
                              }`}
                            >
                              ĐÚNG {(isCardEditing ? activeCorrect === true : studentPick === true) && '✓'}
                            </button>

                            {/* BUTTON SAI */}
                            <button
                              type="button"
                              onClick={() => {
                                if (isCardEditing) {
                                  handleToggleTfStatement(q.id, stmtIdx, false);
                                } else {
                                  setTfAnswers((prev) => ({
                                    ...prev,
                                    [q.id]: {
                                      ...prev[q.id],
                                      [stmt.id]: false,
                                    },
                                  }));
                                }
                              }}
                              className={`px-4 py-1.5 rounded-xl border text-xs font-black transition-all cursor-pointer ${
                                (isCardEditing ? activeCorrect === false : studentPick === false)
                                  ? 'bg-rose-600 text-white border-rose-600 shadow-xs ring-2 ring-rose-300'
                                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 hover:bg-rose-50 hover:text-rose-800'
                              }`}
                            >
                              SAI {(isCardEditing ? activeCorrect === false : studentPick === false) && '✗'}
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

          {/* 3. DẠNG ĐIỀN TỪ VÀO CHỖ TRỐNG */}
          {isBlank && (
            <div className="space-y-3 font-sans">
              {q.wordBank && q.wordBank.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                  <span className="font-bold text-amber-900 dark:text-amber-300 text-xs block mb-1.5">
                    Ngân hàng từ khóa gợi ý (Bấm vào từ để điền trực tiếp):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {q.wordBank.map((w, wi) => (
                      <button
                        key={wi}
                        type="button"
                        onClick={() => {
                          const currentSlots = blankAnswers[q.id] || {};
                          const slots = q.blankItems || [];
                          let targetSlot = activeBlankSlot && activeBlankSlot.qId === q.id
                            ? slots.find((s) => s.blankLabel === activeBlankSlot.blankLabel)
                            : slots.find((s) => !currentSlots[s.blankLabel]);
                          if (!targetSlot && slots.length > 0) targetSlot = slots[0];
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
                        className="px-3 py-1 bg-white dark:bg-slate-800 border border-amber-300 rounded-xl text-xs font-bold text-amber-900 hover:bg-amber-100 cursor-pointer shadow-2xs"
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Blank slots */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {q.blankItems?.map((slot) => {
                  const val = (blankAnswers[q.id] || {})[slot.blankLabel] || '';
                  return (
                    <div
                      key={slot.id}
                      className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-2.5"
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
                        placeholder="Gõ hoặc bấm từ gợi ý..."
                        className="flex-1 bg-transparent border-none outline-none text-xs font-serif text-slate-900 dark:text-slate-100 select-text"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. DẠNG GHÉP ĐÔI / NỐI TỪ */}
          {isMatch && (
            <div className="space-y-3 font-sans">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="font-bold text-xs text-[#073B66] dark:text-sky-300 pb-2 border-b">
                    Cột A: Mốc sự kiện / Nhân vật
                  </div>
                  {q.matchingPairs?.map((p) => {
                    const currentMatched = (matchingAnswers[q.id] || {})[p.id];
                    return (
                      <div
                        key={p.id}
                        className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-700/50 flex items-center justify-between gap-2 text-xs"
                      >
                        <span className="font-serif">{p.left}</span>
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
                          className="px-2 py-1 bg-white dark:bg-slate-800 border border-purple-300 rounded-lg font-bold text-xs"
                        >
                          <option value="">Ghép Cột B...</option>
                          <option value="A">Nối A</option>
                          <option value="B">Nối B</option>
                          <option value="C">Nối C</option>
                          <option value="D">Nối D</option>
                        </select>
                      </div>
                    );
                  })}
                </div>

                <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="font-bold text-xs text-purple-900 dark:text-purple-300 pb-2 border-b">
                    Cột B: Ý nghĩa / Kết quả
                  </div>
                  {q.matchingPairs?.map((p) => (
                    <div
                      key={p.id}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 text-xs font-serif"
                    >
                      {p.right}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 5. DẠNG TỰ LUẬN (STUDENT / STUDY WORKSPACE) */}
          {isEssay && !isCardEditing && (
            <EssayStudentWorkspace
              question={q}
              answerText={essayAnswers[q.id] || ''}
              onChangeAnswer={(val) =>
                setEssayAnswers((prev) => ({
                  ...prev,
                  [q.id]: val,
                }))
              }
              lastAutoSavedTime={lastAutoSavedTime}
              isProctoringLocked={isStudentTakingExam && isProctoringLive}
              isTeacherUser={!isStudentTakingExam}
            />
          )}
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* FOOTER OF QUESTION CARD: [ 💾 LƯU CÂU X ] & [ 🗑️ XÓA CÂU NÀY ]        */}
        {/* ------------------------------------------------------------------- */}
        {!isStudentTakingExam && (
          <div className="pt-3 mt-3 border-t border-slate-200/80 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-2.5 font-sans">
            <div className="flex items-center gap-2">
              {/* BUTTON LƯU CÂU X */}
              <button
                type="button"
                onClick={() => handleSaveIndividualQuestion(q.id, idx)}
                className="px-4 py-2 bg-[#073B66] hover:bg-[#0878C9] text-white rounded-xl font-black text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
              >
                <Save className="w-3.5 h-3.5 text-amber-300" />
                <span>Lưu câu {idx + 1}</span>
              </button>

              {/* NHÃN XÁC NHẬN: ✓ Đã lưu lúc [HH:MM:SS] */}
              {savedQuestionStatus[q.id] && (
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-3 py-1 rounded-xl flex items-center gap-1 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ✓ Đã lưu lúc [{savedQuestionStatus[q.id]}]
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="text-slate-500 text-xs flex items-center gap-1.5">
                <span>{isEssay ? 'Trọng tâm:' : 'Đáp án chuẩn:'}</span>
                <strong
                  className="text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 max-w-[260px] truncate"
                  title={q.correctAnswer}
                >
                  {q.correctAnswer}
                </strong>
              </div>

              {/* BUTTON XÓA CÂU NÀY */}
              <button
                type="button"
                onClick={() => handleDeleteIndividualQuestion(q.id, idx)}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                title="Xóa câu này khỏi phòng thi"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Xóa câu này</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
};
