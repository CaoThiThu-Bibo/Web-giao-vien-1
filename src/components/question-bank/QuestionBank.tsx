import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Question, QuestionType, TrueFalseStatement, FillBlankItem, MatchingPair, RubricCriteria } from '../../types';
import { Modal } from '../common/Modal';
import { WordImportModal } from './WordImportModal';
import { downloadWordTemplate, parseQuestionsFromText } from '../../lib/wordQuestionParser';
import { GraduationExamModal } from './GraduationExamModal';
import { StudentExamRoomModal } from './StudentExamRoomModal';
import { standardGraduationExamQuestions } from '../../data/graduationExamData';
import { normalizeExamQuestionsTo10 } from '../../lib/examScoring';
import {
  FileQuestion,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Printer,
  Trash2,
  Edit2,
  BookOpen,
  Eye,
  Layers,
  CheckSquare,
  ArrowRightLeft,
  FileText,
  HelpCircle,
  ListOrdered,
  X,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  BookMarked,
  Info,
  Download,
  Upload,
  Award,
  GraduationCap,
  Calculator,
  Clock,
  Play,
  ChevronRight,
} from 'lucide-react';
import { ExamRoomHubModal, ExamRoomKey } from './ExamRoomHubModal';

export const QuestionBank: React.FC = () => {
  const { questions, addQuestion, updateQuestion, deleteQuestion } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedCognitive, setSelectedCognitive] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Modals
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [isWordImportModalOpen, setIsWordImportModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);
  const [isBuildExamModalOpen, setIsBuildExamModalOpen] = useState(false);
  const [isGraduationExamModalOpen, setIsGraduationExamModalOpen] = useState(false);
  const [isStudentExamModalOpen, setIsStudentExamModalOpen] = useState(false);
  const [isExamRoomHubOpen, setIsExamRoomHubOpen] = useState(false);
  const [selectedRoomMode, setSelectedRoomMode] = useState<ExamRoomKey>('all');
  const [isAutoScore10, setIsAutoScore10] = useState(true);

  // Quick single-question paste inside Add modal
  const [isQuickPasteOneOpen, setIsQuickPasteOneOpen] = useState(false);
  const [quickPasteOneText, setQuickPasteOneText] = useState('');

  // Selected questions for custom exam generation
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [generatedExamTitle, setGeneratedExamTitle] = useState('Đề kiểm tra định kỳ môn Lịch sử - TT 43/2021');

  // Form State for creating/editing questions
  const [formType, setFormType] = useState<QuestionType>('Trắc nghiệm đơn');
  const [formGrade, setFormGrade] = useState<10 | 11 | 12>(10);
  const [formTopic, setFormTopic] = useState('Lịch sử Việt Nam');
  const [formLesson, setFormLesson] = useState('Bài học trọng tâm');
  const [formKnowledgeDomain, setFormKnowledgeDomain] = useState('Kiến thức cốt lõi');
  const [formCognitiveLevel, setFormCognitiveLevel] = useState<'Nhận biết' | 'Thông hiểu' | 'Vận dụng' | 'Vận dụng cao'>('Nhận biết');
  const [formContent, setFormContent] = useState('');
  const [formExplanation, setFormExplanation] = useState('');
  const [formSource, setFormSource] = useState('SGK Lịch sử - Bộ GD&ĐT');
  const [formAuthor, setFormAuthor] = useState('Cao Thị Thu');

  // Fields for Trắc nghiệm đơn
  const [singleOptions, setSingleOptions] = useState({
    A: '',
    B: '',
    C: '',
    D: '',
  });
  const [singleCorrectAnswer, setSingleCorrectAnswer] = useState<'A' | 'B' | 'C' | 'D'>('A');

  // Fields for Trắc nghiệm đúng sai
  const [tfStatements, setTfStatements] = useState<TrueFalseStatement[]>([
    { id: 'a', statement: '', isCorrect: true, explanation: '' },
    { id: 'b', statement: '', isCorrect: true, explanation: '' },
    { id: 'c', statement: '', isCorrect: false, explanation: '' },
    { id: 'd', statement: '', isCorrect: true, explanation: '' },
  ]);

  // Fields for Điền từ
  const [blankItems, setBlankItems] = useState<FillBlankItem[]>([
    { id: 1, blankLabel: '[1]', correctWord: '' },
    { id: 2, blankLabel: '[2]', correctWord: '' },
  ]);
  const [wordBankInput, setWordBankInput] = useState('');

  // Fields for Nối từ
  const [matchingPairs, setMatchingPairs] = useState<MatchingPair[]>([
    { id: '1', left: '1. ', right: 'A. ', matchedKey: 'A' },
    { id: '2', left: '2. ', right: 'B. ', matchedKey: 'B' },
    { id: '3', left: '3. ', right: 'C. ', matchedKey: 'C' },
    { id: '4', left: '4. ', right: 'D. ', matchedKey: 'D' },
  ]);

  // Fields for Tự luận
  const [essayOutline, setEssayOutline] = useState('');
  const [rubricPoints, setRubricPoints] = useState<RubricCriteria[]>([
    { criteria: 'Nêu đúng hoàn cảnh và diễn biến chính', points: 3.0 },
    { criteria: 'Phân tích ý nghĩa lịch sử sâu sắc', points: 4.0 },
    { criteria: 'Rút ra bài học lịch sử liên hệ thực tiễn', points: 3.0 },
  ]);

  // Type count statistics
  const typeCounts = useMemo(() => {
    const counts = {
      all: questions.length,
      single: 0,
      tf: 0,
      blank: 0,
      match: 0,
      essay: 0,
    };
    questions.forEach((q) => {
      if (q.type === 'Trắc nghiệm đơn' || q.type === 'Trắc nghiệm') counts.single++;
      else if (q.type === 'Trắc nghiệm đúng sai') counts.tf++;
      else if (q.type === 'Điền từ') counts.blank++;
      else if (q.type === 'Nối từ') counts.match++;
      else if (q.type === 'Tự luận') counts.essay++;
    });
    return counts;
  }, [questions]);

  // Filtered questions
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchSearch =
        q.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.knowledgeDomain.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (q.explanation && q.explanation.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchGrade = selectedGrade === 'all' || q.grade.toString() === selectedGrade;
      const matchCognitive = selectedCognitive === 'all' || q.cognitiveLevel === selectedCognitive;

      let matchType = true;
      if (selectedType !== 'all') {
        if (selectedType === 'Trắc nghiệm đơn') {
          matchType = q.type === 'Trắc nghiệm đơn' || q.type === 'Trắc nghiệm';
        } else {
          matchType = q.type === selectedType;
        }
      }

      return matchSearch && matchGrade && matchCognitive && matchType;
    });
  }, [questions, searchQuery, selectedGrade, selectedCognitive, selectedType]);

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingQuestionId(null);
    setFormType('Trắc nghiệm đơn');
    setFormGrade(10);
    setFormTopic('Chương I: Lịch sử và Sử học');
    setFormLesson('Bài 1: Hiện thực lịch sử và nhận thức lịch sử');
    setFormKnowledgeDomain('Kiến thức cốt lõi');
    setFormCognitiveLevel('Nhận biết');
    setFormContent('');
    setFormExplanation('Căn cứ vào SGK Lịch sử GDPT 2018 và hướng dẫn ôn tập GDTX.');
    setFormSource('SGK Lịch sử 10 - Bộ GD&ĐT');
    setFormAuthor('Cao Thị Thu');

    // Default Single
    setSingleOptions({
      A: '',
      B: '',
      C: '',
      D: '',
    });
    setSingleCorrectAnswer('A');

    // Default TF
    setTfStatements([
      { id: 'a', statement: '', isCorrect: true, explanation: '' },
      { id: 'b', statement: '', isCorrect: true, explanation: '' },
      { id: 'c', statement: '', isCorrect: false, explanation: '' },
      { id: 'd', statement: '', isCorrect: true, explanation: '' },
    ]);

    // Default Blank
    setBlankItems([
      { id: 1, blankLabel: '[1]', correctWord: '' },
      { id: 2, blankLabel: '[2]', correctWord: '' },
      { id: 3, blankLabel: '[3]', correctWord: '' },
      { id: 4, blankLabel: '[4]', correctWord: '' },
    ]);
    setWordBankInput('');

    // Default Match
    setMatchingPairs([
      { id: '1', left: '1. ', right: 'A. ', matchedKey: 'A' },
      { id: '2', left: '2. ', right: 'B. ', matchedKey: 'B' },
      { id: '3', left: '3. ', right: 'C. ', matchedKey: 'C' },
      { id: '4', left: '4. ', right: 'D. ', matchedKey: 'D' },
    ]);

    // Default Essay
    setEssayOutline('');
    setRubricPoints([
      { criteria: 'Ý 1: Hoàn cảnh lịch sử và bối cảnh diễn ra', points: 2.5 },
      { criteria: 'Ý 2: Diễn biến tiêu biểu và kết quả đạt được', points: 3.5 },
      { criteria: 'Ý 3: Ý nghĩa lịch sử và bài học kinh nghiệm', points: 4.0 },
    ]);

    setIsAddEditModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (q: Question) => {
    setEditingQuestionId(q.id);
    const normalizedType: QuestionType = q.type === 'Trắc nghiệm' ? 'Trắc nghiệm đơn' : q.type;
    setFormType(normalizedType);
    setFormGrade(q.grade);
    setFormTopic(q.topic);
    setFormLesson(q.lesson);
    setFormKnowledgeDomain(q.knowledgeDomain);
    setFormCognitiveLevel(q.cognitiveLevel);
    setFormContent(q.content);
    setFormExplanation(q.explanation || '');
    setFormSource(q.source);
    setFormAuthor(q.author);

    // Options
    if (q.options && q.options.length >= 4) {
      setSingleOptions({
        A: q.options[0].replace(/^[A-D]\.\s*/, ''),
        B: q.options[1].replace(/^[A-D]\.\s*/, ''),
        C: q.options[2].replace(/^[A-D]\.\s*/, ''),
        D: q.options[3].replace(/^[A-D]\.\s*/, ''),
      });
      setSingleCorrectAnswer((q.correctAnswer as any) || 'A');
    }

    // TF
    if (q.trueFalseStatements && q.trueFalseStatements.length > 0) {
      setTfStatements(q.trueFalseStatements);
    } else {
      setTfStatements([
        { id: 'a', statement: '', isCorrect: true, explanation: '' },
        { id: 'b', statement: '', isCorrect: true, explanation: '' },
        { id: 'c', statement: '', isCorrect: false, explanation: '' },
        { id: 'd', statement: '', isCorrect: true, explanation: '' },
      ]);
    }

    // Blank
    if (q.blankItems && q.blankItems.length > 0) {
      setBlankItems(q.blankItems);
    } else {
      setBlankItems([
        { id: 1, blankLabel: '[1]', correctWord: '' },
        { id: 2, blankLabel: '[2]', correctWord: '' },
      ]);
    }
    setWordBankInput(q.wordBank ? q.wordBank.join(', ') : '');

    // Match
    if (q.matchingPairs && q.matchingPairs.length > 0) {
      setMatchingPairs(q.matchingPairs);
    } else {
      setMatchingPairs([
        { id: '1', left: '1. ', right: 'A. ', matchedKey: 'A' },
        { id: '2', left: '2. ', right: 'B. ', matchedKey: 'B' },
        { id: '3', left: '3. ', right: 'C. ', matchedKey: 'C' },
        { id: '4', left: '4. ', right: 'D. ', matchedKey: 'D' },
      ]);
    }

    // Essay
    setEssayOutline(q.essayOutline || q.correctAnswer || '');
    if (q.rubricPoints && q.rubricPoints.length > 0) {
      setRubricPoints(q.rubricPoints);
    } else {
      setRubricPoints([
        { criteria: 'Ý 1: Hoàn cảnh lịch sử', points: 3.0 },
        { criteria: 'Ý 2: Diễn biến và ý nghĩa', points: 4.0 },
        { criteria: 'Ý 3: Bài học thực tiễn', points: 3.0 },
      ]);
    }

    setIsAddEditModalOpen(true);
  };

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Quick parse 1 question from pasted text
  const handleQuickParseOne = () => {
    if (!quickPasteOneText.trim()) return;
    const parsed = parseQuestionsFromText(quickPasteOneText, formGrade, formTopic, formLesson, formAuthor);
    if (parsed.questions.length > 0) {
      const firstQ = parsed.questions[0];
      setFormType(firstQ.type);
      setFormContent(firstQ.content);
      if (firstQ.type === 'Trắc nghiệm đơn' && firstQ.options) {
        setSingleOptions({
          A: firstQ.options[0]?.replace(/^[A-D]\.\s*/, '') || '',
          B: firstQ.options[1]?.replace(/^[A-D]\.\s*/, '') || '',
          C: firstQ.options[2]?.replace(/^[A-D]\.\s*/, '') || '',
          D: firstQ.options[3]?.replace(/^[A-D]\.\s*/, '') || '',
        });
        setSingleCorrectAnswer((firstQ.correctAnswer as any) || 'A');
      } else if (firstQ.type === 'Trắc nghiệm đúng sai' && firstQ.trueFalseStatements) {
        setTfStatements(firstQ.trueFalseStatements);
      }
      if (firstQ.explanation) {
        setFormExplanation(firstQ.explanation);
      }
      setIsQuickPasteOneOpen(false);
      setQuickPasteOneText('');
      showToast('Đã tự động nhận diện và điền nội dung câu hỏi thành công!');
    } else {
      alert('Chưa nhận diện được cấu trúc câu hỏi. Hãy kiểm tra lại theo định dạng: Câu 1, các phương án A, B, C, D và Đáp án.');
    }
  };

  // Save Add/Edit Question
  const handleSaveQuestion = (e?: React.FormEvent, keepOpenAndResetNext: boolean = false) => {
    if (e) e.preventDefault();
    if (!formContent.trim()) return;

    let computedCorrectAnswer = '';
    let options: string[] | undefined = undefined;
    let trueFalseStatements: TrueFalseStatement[] | undefined = undefined;
    let validBlankItems: FillBlankItem[] | undefined = undefined;
    let wordBank: string[] | undefined = undefined;
    let validMatchingPairs: MatchingPair[] | undefined = undefined;
    let rubricPts: RubricCriteria[] | undefined = undefined;
    let finalEssayOutline: string | undefined = undefined;

    if (formType === 'Trắc nghiệm đơn') {
      options = [
        `A. ${singleOptions.A || 'Phương án A'}`,
        `B. ${singleOptions.B || 'Phương án B'}`,
        `C. ${singleOptions.C || 'Phương án C'}`,
        `D. ${singleOptions.D || 'Phương án D'}`,
      ];
      computedCorrectAnswer = singleCorrectAnswer;
    } else if (formType === 'Trắc nghiệm đúng sai') {
      trueFalseStatements = tfStatements;
      computedCorrectAnswer = tfStatements
        .map((s) => `${s.id}-${s.isCorrect ? 'ĐÚNG' : 'SAI'}`)
        .join(', ');
    } else if (formType === 'Điền từ') {
      validBlankItems = blankItems.filter((b) => b.correctWord.trim() !== '');
      wordBank = wordBankInput
        .split(',')
        .map((w) => w.trim())
        .filter(Boolean);
      computedCorrectAnswer = validBlankItems
        .map((b) => `${b.blankLabel} ${b.correctWord}`)
        .join('; ');
    } else if (formType === 'Nối từ') {
      validMatchingPairs = matchingPairs;
      computedCorrectAnswer = matchingPairs
        .map((m) => `${m.id} - ${m.matchedKey || 'A'}`)
        .join('; ');
    } else if (formType === 'Tự luận') {
      finalEssayOutline = essayOutline;
      rubricPts = rubricPoints;
      computedCorrectAnswer = essayOutline.slice(0, 160) + '...';
    }

    const payload: Omit<Question, 'id' | 'updatedAt'> = {
      grade: formGrade,
      topic: formTopic,
      lesson: formLesson,
      knowledgeDomain: formKnowledgeDomain,
      type: formType,
      cognitiveLevel: formCognitiveLevel,
      content: formContent,
      options,
      trueFalseStatements,
      blankItems: validBlankItems,
      wordBank,
      matchingPairs: validMatchingPairs,
      essayOutline: finalEssayOutline,
      rubricPoints: rubricPts,
      correctAnswer: computedCorrectAnswer,
      explanation: formExplanation,
      source: formSource,
      author: formAuthor,
    };

    if (editingQuestionId) {
      updateQuestion(editingQuestionId, payload);
    } else {
      addQuestion(payload);
    }

    if (keepOpenAndResetNext) {
      // Keep modal open, reset fields for next question while keeping metadata
      setEditingQuestionId(null);
      setFormContent('');
      setSingleOptions({ A: '', B: '', C: '', D: '' });
      setSingleCorrectAnswer('A');
      setTfStatements([
        { id: 'a', statement: '', isCorrect: true, explanation: '' },
        { id: 'b', statement: '', isCorrect: true, explanation: '' },
        { id: 'c', statement: '', isCorrect: false, explanation: '' },
        { id: 'd', statement: '', isCorrect: true, explanation: '' },
      ]);
      setQuickPasteOneText('');
      showToast('Đã lưu câu hỏi thành công! Mời cô nhập tiếp câu tiếp theo.');
    } else {
      setIsAddEditModalOpen(false);
      showToast('Đã lưu câu hỏi vào ngân hàng đề thành công!');
    }
  };

  const toggleSelectQuestion = (id: string) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAllFiltered = () => {
    setSelectedQuestionIds(filteredQuestions.map((q) => q.id));
  };

  const clearSelection = () => {
    setSelectedQuestionIds([]);
  };

  const handlePrintExam = () => {
    window.print();
  };

  const selectedQuestions = useMemo(() => {
    return questions.filter((q) => selectedQuestionIds.includes(q.id));
  }, [questions, selectedQuestionIds]);

  // Group selected questions by type for formal exam structure
  const groupedExamQuestions = useMemo(() => {
    const part1 = selectedQuestions.filter(
      (q) => q.type === 'Trắc nghiệm đơn' || q.type === 'Trắc nghiệm'
    );
    const part2 = selectedQuestions.filter((q) => q.type === 'Trắc nghiệm đúng sai');
    const part3 = selectedQuestions.filter(
      (q) => q.type === 'Điền từ' || q.type === 'Nối từ'
    );
    const part4 = selectedQuestions.filter((q) => q.type === 'Tự luận');
    return { part1, part2, part3, part4 };
  }, [selectedQuestions]);

  // Auto calculate and normalize scores to 10.0 points for selected questions
  const autoScores = useMemo(() => {
    return normalizeExamQuestionsTo10(selectedQuestions);
  }, [selectedQuestions]);

  // Quick helper for inserting blank placeholder into Content
  const handleInsertBlank = () => {
    const nextIndex = blankItems.length + 1;
    setFormContent((prev) => prev + ` [${nextIndex}] `);
    setBlankItems((prev) => [...prev, { id: nextIndex, blankLabel: `[${nextIndex}]`, correctWord: '' }]);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-[#073B66] text-[11px] font-bold">
              GDNN - GDTX Tiên Yên
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
              Định dạng 2025 (5 dạng câu hỏi)
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#073B66] font-serif flex items-center gap-2.5 mt-1.5">
            <FileQuestion className="w-6 h-6 text-[#0878C9]" />
            Ngân hàng câu hỏi & Đề kiểm tra Lịch sử
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Hỗ trợ 5 dạng: Trắc nghiệm 1 đáp án, Đúng/Sai chuẩn 2025, Điền từ, Nối từ và Tự luận (kèm biểu điểm rubric)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Download Word Template */}
          <button
            onClick={downloadWordTemplate}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-[#073B66] rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs border border-slate-200 cursor-pointer transition-colors"
            title="Tải file Word mẫu định dạng chuẩn Bộ GD&ĐT"
          >
            <Download className="w-4 h-4 text-[#0878C9]" />
            Tải file Word mẫu (.doc)
          </button>

          {/* Upload / Batch Import Word */}
          <button
            onClick={() => setIsWordImportModalOpen(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            title="Tải lên file Word (.docx) hoặc dán hàng loạt câu hỏi"
          >
            <Upload className="w-4 h-4" />
            Tải lên từ Word / Dán nhanh
          </button>

          {/* Chỗ luyện đề thi ôn thi tốt nghiệp THPT 12 (AI Soạn theo tư liệu & Chuẩn Bộ GD&ĐT) */}
          <button
            onClick={() => setIsGraduationExamModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 hover:from-amber-600 hover:to-red-700 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer border border-amber-300 ring-2 ring-amber-400/30"
            title="Chỗ luyện đề thi ôn thi tốt nghiệp: Tải lên đề thi, AI tự soạn đề theo dữ liệu cô cung cấp, và phòng chấm tự động thang 10 chuẩn Bộ GD&ĐT"
          >
            <GraduationCap className="w-4 h-4 text-amber-100" />
            <span>Luyện Đề Ôn Thi Tốt Nghiệp THPT 12</span>
            <span className="bg-white/25 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
              AI & Chuẩn Bộ
            </span>
          </button>

          {/* Phòng Thi Trực Tuyến Học Sinh (5 phòng chuyên biệt) */}
          <button
            onClick={() => setIsExamRoomHubOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 hover:from-emerald-700 hover:to-cyan-800 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer border border-emerald-300 ring-2 ring-emerald-400/30"
            title="Mở Không gian 5 Phòng thi trực tuyến chuyên biệt: Trắc nghiệm đơn, Đúng/Sai tư liệu, Điền từ, Ghép đôi, Tự luận"
          >
            <Clock className="w-4 h-4 text-emerald-100" />
            <span>Phòng Thi Trực Tuyến Học Sinh</span>
            <span className="bg-white/25 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
              5 Phòng Thi Riêng Biệt
            </span>
          </button>

          {selectedQuestionIds.length > 0 && (
            <button
              onClick={() => setIsBuildExamModalOpen(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              Tạo đề thi ({selectedQuestionIds.length} câu đã chọn)
            </button>
          )}

          <button
            onClick={handleOpenAdd}
            className="px-3.5 py-2 bg-[#0878C9] hover:bg-[#073B66] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Thêm câu hỏi mới
          </button>
        </div>
      </div>

      {/* QUICK 5-ROOM LAUNCH BAR */}
      <div className="bg-gradient-to-r from-sky-50 via-indigo-50/50 to-teal-50 border border-sky-200/80 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2.5 shadow-2xs font-sans">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#073B66] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
            5
          </div>
          <span className="text-xs font-black text-[#073B66] uppercase tracking-wide">
            5 Phòng Thi Chuyên Biệt Môn Lịch Sử:
          </span>
          <span className="text-[11px] text-slate-500 hidden lg:inline">
            (Bấm vào từng phòng để vào thi ngay theo dạng mong muốn)
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {/* Phòng 1 */}
          <button
            onClick={() => {
              setSelectedRoomMode('Trắc nghiệm đơn');
              setIsStudentExamModalOpen(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-blue-50 border border-blue-200 hover:border-blue-400 text-blue-900 text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all active:scale-95"
            title="Vào Phòng 1: Trắc nghiệm đơn (Nhiều lựa chọn A-B-C-D)"
          >
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>Phòng 1: TN Đơn</span>
            <span className="bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">15p</span>
          </button>

          {/* Phòng 2 */}
          <button
            onClick={() => {
              setSelectedRoomMode('Trắc nghiệm đúng sai');
              setIsStudentExamModalOpen(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-amber-50 border border-amber-200 hover:border-amber-400 text-amber-950 text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all active:scale-95"
            title="Vào Phòng 2: Đúng / Sai có ngữ liệu tư liệu (Chuẩn 2025)"
          >
            <FileText className="w-3.5 h-3.5 text-amber-600" />
            <span>Phòng 2: Đúng / Sai</span>
            <span className="bg-amber-100 text-amber-900 text-[10px] px-1.5 py-0.2 rounded-full font-bold">20p</span>
          </button>

          {/* Phòng 3 */}
          <button
            onClick={() => {
              setSelectedRoomMode('Điền từ');
              setIsStudentExamModalOpen(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 border border-emerald-200 hover:border-emerald-400 text-emerald-950 text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all active:scale-95"
            title="Vào Phòng 3: Điền từ vào chỗ trống (Ngân hàng từ khóa)"
          >
            <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span>Phòng 3: Điền Từ</span>
            <span className="bg-emerald-100 text-emerald-900 text-[10px] px-1.5 py-0.2 rounded-full font-bold">15p</span>
          </button>

          {/* Phòng 4 */}
          <button
            onClick={() => {
              setSelectedRoomMode('Nối từ');
              setIsStudentExamModalOpen(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-purple-50 border border-purple-200 hover:border-purple-400 text-purple-950 text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all active:scale-95"
            title="Vào Phòng 4: Ghép đôi sự kiện (Cột A - Cột B)"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-purple-600" />
            <span>Phòng 4: Ghép Đôi</span>
            <span className="bg-purple-100 text-purple-900 text-[10px] px-1.5 py-0.2 rounded-full font-bold">15p</span>
          </button>

          {/* Phòng 5 */}
          <button
            onClick={() => {
              setSelectedRoomMode('Tự luận');
              setIsStudentExamModalOpen(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 border border-rose-200 hover:border-rose-400 text-rose-950 text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all active:scale-95"
            title="Vào Phòng 5: Tự luận chuyên sâu (Bộ đếm từ, Rubric, AI chấm thử)"
          >
            <Award className="w-3.5 h-3.5 text-rose-600" />
            <span>Phòng 5: Tự Luận</span>
            <span className="bg-rose-100 text-rose-900 text-[10px] px-1.5 py-0.2 rounded-full font-bold">35p</span>
          </button>

          {/* Xem Trung Tâm Hub */}
          <button
            onClick={() => setIsExamRoomHubOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-[#073B66] hover:bg-[#0878C9] text-white text-xs font-black flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
            title="Xem danh mục và chọn học viên cho từng phòng"
          >
            <span>Chi tiết 5 phòng</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#073B66] text-white px-4 py-3 rounded-2xl shadow-xl border border-sky-400 flex items-center gap-2.5 text-xs font-bold animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Type Statistics Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 no-print">
        <button
          onClick={() => setSelectedType('all')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            selectedType === 'all'
              ? 'bg-[#073B66] text-white border-[#073B66] shadow-xs'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="text-[11px] font-medium opacity-80">Tất cả dạng</div>
          <div className="text-lg font-bold">{typeCounts.all} câu</div>
        </button>

        <button
          onClick={() => setSelectedType('Trắc nghiệm đơn')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            selectedType === 'Trắc nghiệm đơn'
              ? 'bg-[#0878C9] text-white border-[#0878C9] shadow-xs'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="text-[11px] font-medium opacity-80 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" />
            Trắc nghiệm đơn
          </div>
          <div className="text-lg font-bold">{typeCounts.single} câu</div>
        </button>

        <button
          onClick={() => setSelectedType('Trắc nghiệm đúng sai')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            selectedType === 'Trắc nghiệm đúng sai'
              ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="text-[11px] font-medium opacity-80 flex items-center gap-1">
            <CheckSquare className="w-3.5 h-3.5" />
            Đúng / Sai
          </div>
          <div className="text-lg font-bold">{typeCounts.tf} câu</div>
        </button>

        <button
          onClick={() => setSelectedType('Điền từ')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            selectedType === 'Điền từ'
              ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="text-[11px] font-medium opacity-80 flex items-center gap-1">
            <ListOrdered className="w-3.5 h-3.5" />
            Điền từ
          </div>
          <div className="text-lg font-bold">{typeCounts.blank} câu</div>
        </button>

        <button
          onClick={() => setSelectedType('Nối từ')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            selectedType === 'Nối từ'
              ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="text-[11px] font-medium opacity-80 flex items-center gap-1">
            <ArrowRightLeft className="w-3.5 h-3.5" />
            Nối từ / Ghép đôi
          </div>
          <div className="text-lg font-bold">{typeCounts.match} câu</div>
        </button>

        <button
          onClick={() => setSelectedType('Tự luận')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            selectedType === 'Tự luận'
              ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="text-[11px] font-medium opacity-80 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" />
            Tự luận & Rubric
          </div>
          <div className="text-lg font-bold">{typeCounts.essay} câu</div>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo nội dung câu hỏi, chủ đề, bài học hoặc từ khóa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0878C9]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Khối lớp:</span>
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-[#0878C9]"
          >
            <option value="all">Tất cả khối lớp</option>
            <option value="10">Lớp 10 (GDTX)</option>
            <option value="11">Lớp 11 (GDTX)</option>
            <option value="12">Lớp 12 (GDTX)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Mức độ nhận thức:</span>
          <select
            value={selectedCognitive}
            onChange={(e) => setSelectedCognitive(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-[#0878C9]"
          >
            <option value="all">Tất cả mức độ</option>
            <option value="Nhận biết">Nhận biết</option>
            <option value="Thông hiểu">Thông hiểu</option>
            <option value="Vận dụng">Vận dụng</option>
            <option value="Vận dụng cao">Vận dụng cao</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={selectAllFiltered}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
          >
            Chọn tất cả ({filteredQuestions.length})
          </button>
          {selectedQuestionIds.length > 0 && (
            <button
              onClick={clearSelection}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-rose-600 rounded-lg text-xs font-semibold cursor-pointer"
            >
              Bỏ chọn ({selectedQuestionIds.length})
            </button>
          )}
        </div>
      </div>

      {/* Question List */}
      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200">
            Không tìm thấy câu hỏi nào phù hợp với bộ lọc hiện tại.
          </div>
        ) : (
          filteredQuestions.map((q, idx) => {
            const isSelected = selectedQuestionIds.includes(q.id);
            const isSingle = q.type === 'Trắc nghiệm đơn' || q.type === 'Trắc nghiệm';
            const isTF = q.type === 'Trắc nghiệm đúng sai';
            const isBlank = q.type === 'Điền từ';
            const isMatch = q.type === 'Nối từ';
            const isEssay = q.type === 'Tự luận';

            return (
              <div
                key={q.id}
                className={`bg-white rounded-2xl p-4 sm:p-5 shadow-xs border transition-all ${
                  isSelected ? 'border-[#0878C9] bg-sky-50/20 shadow-sm' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Header info */}
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectQuestion(q.id)}
                      className="w-4 h-4 rounded-md text-[#0878C9] border-slate-300 focus:ring-[#0878C9] cursor-pointer"
                    />
                    <span className="px-2 py-0.5 rounded-md bg-sky-100 text-[#073B66] text-xs font-bold">
                      Lớp {q.grade}
                    </span>

                    {/* Type badge */}
                    <span
                      className={`px-2 py-0.5 rounded-md text-xs font-bold flex items-center gap-1 ${
                        isSingle
                          ? 'bg-blue-100 text-blue-700'
                          : isTF
                          ? 'bg-purple-100 text-purple-700'
                          : isBlank
                          ? 'bg-amber-100 text-amber-800'
                          : isMatch
                          ? 'bg-teal-100 text-teal-800'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {isSingle && <CheckCircle className="w-3 h-3" />}
                      {isTF && <CheckSquare className="w-3 h-3" />}
                      {isBlank && <ListOrdered className="w-3 h-3" />}
                      {isMatch && <ArrowRightLeft className="w-3 h-3" />}
                      {isEssay && <FileText className="w-3 h-3" />}
                      {isSingle ? 'Trắc nghiệm 1 đáp án' : q.type}
                    </span>

                    {/* Cognitive level badge */}
                    <span
                      className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                        q.cognitiveLevel === 'Nhận biết'
                          ? 'bg-slate-100 text-slate-700'
                          : q.cognitiveLevel === 'Thông hiểu'
                          ? 'bg-sky-100 text-sky-700'
                          : q.cognitiveLevel === 'Vận dụng'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {q.cognitiveLevel}
                    </span>

                    <span className="text-xs text-slate-500 font-serif italic truncate max-w-[280px]">
                      {q.topic} - {q.lesson}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleOpenEdit(q)}
                      className="p-1.5 text-slate-500 hover:text-[#0878C9] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Chỉnh sửa câu hỏi"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteQuestion(q.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Xóa câu hỏi"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Content / Stimulus */}
                <div className="mt-2 text-xs sm:text-sm font-serif text-slate-900 leading-relaxed">
                  <span className="font-bold text-[#073B66] mr-1.5 font-sans">Câu {idx + 1}:</span>
                  <span className="whitespace-pre-line font-medium">{q.content}</span>
                </div>

                {/* 1. DẠNG TRẮC NGHIỆM ĐƠN */}
                {isSingle && q.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-slate-100 text-xs">
                    {q.options.map((opt, i) => {
                      const letter = opt.trim().slice(0, 1);
                      const isCorrect = letter === q.correctAnswer;
                      return (
                        <div
                          key={i}
                          className={`p-2.5 rounded-xl border flex items-start gap-2.5 ${
                            isCorrect
                              ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-900 shadow-xs'
                              : 'bg-slate-50/60 border-slate-200 text-slate-700'
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold ${
                              isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {letter}
                          </span>
                          <span className="flex-1 font-serif">{opt.replace(/^[A-D]\.\s*/, '')}</span>
                          {isCorrect && (
                            <span className="text-[10px] bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                              Đúng
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 2. DẠNG TRẮC NGHIỆM ĐÚNG SAI (CHUẨN 2025) */}
                {isTF && q.trueFalseStatements && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-2">
                    <div className="text-[11px] font-bold text-purple-900 uppercase tracking-wide">
                      Mỗi ý sau đây là Đúng hay Sai theo chuẩn đánh giá năng lực:
                    </div>
                    <div className="space-y-1.5">
                      {q.trueFalseStatements.map((stmt) => (
                        <div
                          key={stmt.id}
                          className={`p-2.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${
                            stmt.isCorrect
                              ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                              : 'bg-rose-50/60 border-rose-200 text-rose-950'
                          }`}
                        >
                          <div className="flex items-start gap-2 flex-1">
                            <span className="w-5 h-5 rounded-md bg-purple-100 text-purple-900 font-bold flex items-center justify-center text-[11px] shrink-0 uppercase">
                              {stmt.id}
                            </span>
                            <div className="space-y-0.5">
                              <span className="font-serif leading-snug">{stmt.statement}</span>
                              {stmt.explanation && (
                                <p className="text-[11px] text-slate-500 italic">
                                  Giải thích: {stmt.explanation}
                                </p>
                              )}
                            </div>
                          </div>
                          <span
                            className={`px-2.5 py-1 rounded-lg text-xs font-extrabold uppercase shrink-0 text-center tracking-wider ${
                              stmt.isCorrect
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-rose-600 text-white shadow-xs'
                            }`}
                          >
                            {stmt.isCorrect ? '✓ ĐÚNG' : '✗ SAI'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. DẠNG BÀI TẬP ĐIỀN TỪ */}
                {isBlank && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-2.5 text-xs">
                    {q.wordBank && q.wordBank.length > 0 && (
                      <div className="p-2.5 bg-amber-50/80 rounded-xl border border-amber-200">
                        <span className="font-bold text-amber-900 text-[11px] uppercase mr-2">
                          Ngân hàng từ khóa gợi ý:
                        </span>
                        <div className="inline-flex flex-wrap gap-1.5 mt-1">
                          {q.wordBank.map((w, wi) => (
                            <span
                              key={wi}
                              className="px-2 py-0.5 bg-white border border-amber-300 rounded-md text-amber-900 font-medium text-[11px]"
                            >
                              {w}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="font-bold text-slate-700 mb-1.5 text-[11px] uppercase">
                        Đáp án từ cần điền vào các vị trí:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                        {q.blankItems?.map((b) => (
                          <div
                            key={b.id}
                            className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between gap-1.5"
                          >
                            <span className="font-bold text-[#0878C9] bg-sky-100 px-1.5 py-0.5 rounded text-[11px]">
                              {b.blankLabel}
                            </span>
                            <span className="font-bold text-emerald-700 text-xs truncate">
                              {b.correctWord}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. DẠNG BÀI TẬP NỐI TỪ / GHÉP ĐÔI */}
                {isMatch && q.matchingPairs && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-2.5 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                        <div className="font-bold text-[#073B66] text-[11px] uppercase pb-1 border-b border-slate-200">
                          Cột A (Sự kiện / Niên đại / Nhân vật)
                        </div>
                        {q.matchingPairs.map((p) => (
                          <div key={p.id} className="font-serif text-slate-800 leading-snug">
                            {p.left}
                          </div>
                        ))}
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                        <div className="font-bold text-teal-800 text-[11px] uppercase pb-1 border-b border-slate-200">
                          Cột B (Ý nghĩa / Tác phẩm / Chiến công)
                        </div>
                        {q.matchingPairs.map((p) => (
                          <div key={p.id} className="font-serif text-slate-800 leading-snug">
                            {p.right}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-2.5 bg-teal-50 border border-teal-200 rounded-xl flex flex-wrap items-center gap-3">
                      <span className="font-bold text-teal-900 text-[11px] uppercase">
                        Đáp án ghép nối chuẩn xác:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {q.matchingPairs.map((p) => (
                          <span
                            key={p.id}
                            className="px-2.5 py-1 bg-white border border-teal-300 rounded-lg font-extrabold text-teal-900 text-xs shadow-2xs"
                          >
                            {p.id} ➔ {p.matchedKey || 'A'}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. DẠNG TỰ LUẬN & BIỂU ĐIỂM */}
                {isEssay && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-2.5 text-xs">
                    {q.essayOutline && (
                      <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200">
                        <span className="font-bold text-amber-900 text-[11px] uppercase block mb-1">
                          Dàn ý hướng dẫn trả lời chi tiết:
                        </span>
                        <div className="text-slate-800 font-serif leading-relaxed whitespace-pre-line text-xs pl-1">
                          {q.essayOutline}
                        </div>
                      </div>
                    )}

                    {q.rubricPoints && q.rubricPoints.length > 0 && (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="font-bold text-[#073B66] text-[11px] uppercase block mb-1.5">
                          Biểu điểm phân hóa theo tiêu chí (Rubric):
                        </span>
                        <div className="space-y-1">
                          {q.rubricPoints.map((r, ri) => (
                            <div
                              key={ri}
                              className="flex items-center justify-between text-xs py-1 border-b border-slate-200/60 last:border-0"
                            >
                              <span className="font-serif text-slate-700">• {r.criteria}</span>
                              <span className="font-bold text-[#0878C9] bg-white px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                                {r.points.toFixed(1)} điểm
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Explanation note if available */}
                {q.explanation && (
                  <div className="mt-2.5 p-2.5 rounded-xl bg-sky-50/40 border border-sky-100 text-xs text-slate-600 font-serif italic">
                    <span className="font-bold text-[#073B66] font-sans not-italic mr-1">
                      Hướng dẫn tư duy / Chú giải:
                    </span>
                    {q.explanation}
                  </div>
                )}

                {/* Footer metadata */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2 font-serif italic">
                  <span>Nguồn: {q.source}</span>
                  <span>Biên soạn: Cô {q.author}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Add or Edit Question */}
      <Modal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        title={editingQuestionId ? 'Chỉnh sửa câu hỏi trong ngân hàng' : 'Thêm câu hỏi mới vào ngân hàng đề'}
        maxWidth="4xl"
      >
        <form onSubmit={handleSaveQuestion} className="space-y-4 text-xs max-h-[75vh] overflow-y-auto pr-1">
          {/* Question Type Selection Tabs */}
          <div>
            <label className="block text-slate-700 font-bold mb-1.5">
              Chọn dạng câu hỏi kiểm tra (*):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <button
                type="button"
                onClick={() => setFormType('Trắc nghiệm đơn')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  formType === 'Trắc nghiệm đơn'
                    ? 'bg-blue-50 border-blue-500 text-blue-900 font-bold ring-2 ring-blue-500/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CheckCircle className="w-4 h-4 text-blue-600" />
                <span>Trắc nghiệm 1 đáp án</span>
              </button>

              <button
                type="button"
                onClick={() => setFormType('Trắc nghiệm đúng sai')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  formType === 'Trắc nghiệm đúng sai'
                    ? 'bg-purple-50 border-purple-500 text-purple-900 font-bold ring-2 ring-purple-500/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CheckSquare className="w-4 h-4 text-purple-600" />
                <span>Trắc nghiệm Đúng / Sai</span>
              </button>

              <button
                type="button"
                onClick={() => setFormType('Điền từ')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  formType === 'Điền từ'
                    ? 'bg-amber-50 border-amber-500 text-amber-900 font-bold ring-2 ring-amber-500/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ListOrdered className="w-4 h-4 text-amber-600" />
                <span>Bài tập Điền từ</span>
              </button>

              <button
                type="button"
                onClick={() => setFormType('Nối từ')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  formType === 'Nối từ'
                    ? 'bg-teal-50 border-teal-500 text-teal-900 font-bold ring-2 ring-teal-500/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ArrowRightLeft className="w-4 h-4 text-teal-600" />
                <span>Nối từ / Ghép đôi</span>
              </button>

              <button
                type="button"
                onClick={() => setFormType('Tự luận')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  formType === 'Tự luận'
                    ? 'bg-rose-50 border-rose-500 text-rose-900 font-bold ring-2 ring-rose-500/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <FileText className="w-4 h-4 text-rose-600" />
                <span>Tự luận & Rubric</span>
              </button>
            </div>
          </div>

          {/* Classification Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Khối lớp (GDTX)</label>
              <select
                value={formGrade}
                onChange={(e) => setFormGrade(parseInt(e.target.value, 10) as any)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0878C9]"
              >
                <option value={10}>Lớp 10</option>
                <option value={11}>Lớp 11</option>
                <option value={12}>Lớp 12</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Mức độ nhận thức</label>
              <select
                value={formCognitiveLevel}
                onChange={(e) => setFormCognitiveLevel(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0878C9]"
              >
                <option value="Nhận biết">Nhận biết</option>
                <option value="Thông hiểu">Thông hiểu</option>
                <option value="Vận dụng">Vận dụng</option>
                <option value="Vận dụng cao">Vận dụng cao</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Nguồn tư liệu / SGK</label>
              <input
                type="text"
                value={formSource}
                onChange={(e) => setFormSource(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0878C9]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Chương / Chủ đề (*)</label>
              <input
                type="text"
                required
                value={formTopic}
                onChange={(e) => setFormTopic(e.target.value)}
                placeholder="Ví dụ: Chiến tranh bảo vệ Tổ quốc"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0878C9]"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Bài học & Phạm vi kiến thức</label>
              <input
                type="text"
                value={formLesson}
                onChange={(e) => setFormLesson(e.target.value)}
                placeholder="Ví dụ: Bài 7: Kháng chiến chống quân Mông - Nguyên"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0878C9]"
              />
            </div>
          </div>

          {/* Quick Paste 1-Question Assistant */}
          <div className="p-3 bg-gradient-to-r from-indigo-50/70 to-purple-50/70 border border-indigo-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Dán nhanh 1 câu từ Word (Tự động nhận diện nội dung & đáp án)
              </span>
              <button
                type="button"
                onClick={() => setIsQuickPasteOneOpen(!isQuickPasteOneOpen)}
                className="px-2.5 py-1 bg-white hover:bg-indigo-100 text-indigo-800 border border-indigo-300 rounded-lg font-bold text-xs cursor-pointer transition-colors shadow-2xs"
              >
                {isQuickPasteOneOpen ? 'Thu gọn' : 'Mở khung dán'}
              </button>
            </div>

            {isQuickPasteOneOpen && (
              <div className="space-y-2 pt-1 animate-in fade-in duration-150">
                <textarea
                  rows={4}
                  value={quickPasteOneText}
                  onChange={(e) => setQuickPasteOneText(e.target.value)}
                  placeholder={`Dán nguyên văn câu hỏi vào đây (bao gồm câu hỏi, A, B, C, D hoặc a, b, c, d và Đáp án):
Ví dụ:
Câu 1: Hiện thực lịch sử là gì?
A. Tất cả những gì đã diễn ra trong quá khứ...
B. Những câu chuyện truyền thuyết...
C. Toàn bộ nhận thức chủ quan...
D. Những dự đoán của con người...
Đáp án: A`}
                  className="w-full p-2.5 bg-white border border-indigo-200 rounded-lg outline-none text-xs font-serif leading-relaxed"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleQuickParseOne}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Tự động nhận diện & Điền vào form
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Question Prompt / Stimulus */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-slate-700 font-bold">
                {formType === 'Trắc nghiệm đúng sai'
                  ? 'Đoạn tư liệu / Đề bài dẫn (*)'
                  : formType === 'Điền từ'
                  ? 'Đoạn trích tư liệu (có vị trí khuyết [1], [2], [3]...) (*)'
                  : 'Nội dung câu hỏi (*)'}
              </label>
              {formType === 'Điền từ' && (
                <button
                  type="button"
                  onClick={handleInsertBlank}
                  className="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-md font-bold text-[11px] cursor-pointer"
                >
                  + Chèn chỗ trống [vị trí]
                </button>
              )}
            </div>
            <textarea
              rows={formType === 'Trắc nghiệm đúng sai' ? 4 : 3}
              required
              placeholder={
                formType === 'Trắc nghiệm đúng sai'
                  ? 'Nhập trích đoạn văn kiện lịch sử, nghị quyết hoặc tư liệu tình huống...'
                  : formType === 'Điền từ'
                  ? 'Ví dụ: Đầu mùa xuân năm [1], dưới sự chủ trì của lãnh tụ [2]...'
                  : 'Nhập nội dung câu hỏi lịch sử...'
              }
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0878C9] font-serif"
            />
          </div>

          {/* DYNAMIC FORMS BY QUESTION TYPE */}

          {/* 1. Trắc nghiệm đơn */}
          {formType === 'Trắc nghiệm đơn' && (
            <div className="space-y-3 p-3.5 bg-blue-50/40 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between">
                <label className="block text-slate-700 font-bold">4 Phương án lựa chọn:</label>
                <span className="text-[11px] text-blue-700 italic">
                  (Mẹo: Bấm trực tiếp vào chữ cái A, B, C, D để chọn làm đáp án đúng)
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(['A', 'B', 'C', 'D'] as const).map((letter) => (
                  <div key={letter} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSingleCorrectAnswer(letter)}
                      title={`Bấm để chọn ${letter} làm đáp án đúng`}
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 cursor-pointer transition-all hover:scale-105 ${
                        singleCorrectAnswer === letter
                          ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-300'
                          : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                    >
                      {letter}
                    </button>
                    <input
                      type="text"
                      required
                      placeholder={`Nội dung phương án ${letter}`}
                      value={singleOptions[letter]}
                      onChange={(e) =>
                        setSingleOptions({ ...singleOptions, [letter]: e.target.value })
                      }
                      className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0878C9]"
                    />
                  </div>
                ))}
              </div>

              <div className="pt-2 flex items-center gap-3">
                <span className="font-bold text-slate-700">Đáp án chính xác:</span>
                <div className="flex gap-2">
                  {(['A', 'B', 'C', 'D'] as const).map((letter) => (
                    <button
                      key={letter}
                      type="button"
                      onClick={() => setSingleCorrectAnswer(letter)}
                      className={`w-8 h-8 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
                        singleCorrectAnswer === letter
                          ? 'bg-emerald-600 text-white ring-2 ring-emerald-300 shadow-xs'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {letter}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. Trắc nghiệm đúng sai */}
          {formType === 'Trắc nghiệm đúng sai' && (
            <div className="space-y-3 p-3.5 bg-purple-50/40 rounded-xl border border-purple-200">
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-950">
                  Thiết lập 4 mệnh đề nhỏ (a, b, c, d) chuẩn đề thi tốt nghiệp THPT 2025:
                </span>
                <span className="text-[11px] text-purple-700 italic">Mỗi ý chọn Đúng hoặc Sai</span>
              </div>

              <div className="space-y-2.5">
                {tfStatements.map((stmt, sIdx) => (
                  <div key={stmt.id} className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-purple-100 text-purple-900 font-bold text-xs flex items-center justify-center shrink-0 uppercase">
                        {stmt.id}
                      </span>
                      <input
                        type="text"
                        required
                        placeholder={`Nội dung nhận định ý ${stmt.id})`}
                        value={stmt.statement}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTfStatements((prev) =>
                            prev.map((item, idx) => (idx === sIdx ? { ...item, statement: val } : item))
                          );
                        }}
                        className="flex-1 px-3 py-1.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 font-serif"
                      />

                      {/* True/False Toggle Buttons */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setTfStatements((prev) =>
                              prev.map((item, idx) => (idx === sIdx ? { ...item, isCorrect: true } : item))
                            );
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            stmt.isCorrect
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          Đúng
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setTfStatements((prev) =>
                              prev.map((item, idx) => (idx === sIdx ? { ...item, isCorrect: false } : item))
                            );
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            !stmt.isCorrect
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          Sai
                        </button>
                      </div>
                    </div>

                    <input
                      type="text"
                      placeholder={`Giải thích ngắn lý do ý ${stmt.id} là ${stmt.isCorrect ? 'ĐÚNG' : 'SAI'} (tùy chọn)`}
                      value={stmt.explanation || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTfStatements((prev) =>
                          prev.map((item, idx) => (idx === sIdx ? { ...item, explanation: val } : item))
                        );
                      }}
                      className="w-full px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] outline-none text-slate-600 italic"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Điền từ */}
          {formType === 'Điền từ' && (
            <div className="space-y-3 p-3.5 bg-amber-50/40 rounded-xl border border-amber-200">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Ngân hàng từ gợi ý (các từ phân cách bởi dấu phẩy):
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: 1930, Nguyễn Ái Quốc, Cửu Long, khủng hoảng, Tân Trào"
                  value={wordBankInput}
                  onChange={(e) => setWordBankInput(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-700">Đáp án cho từng chỗ trống:</span>
                  <button
                    type="button"
                    onClick={() => {
                      const newId = blankItems.length + 1;
                      setBlankItems((prev) => [
                        ...prev,
                        { id: newId, blankLabel: `[${newId}]`, correctWord: '' },
                      ]);
                    }}
                    className="text-xs text-amber-800 font-bold hover:underline cursor-pointer"
                  >
                    + Thêm chỗ trống
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {blankItems.map((b, bIdx) => (
                    <div key={b.id} className="p-2 bg-white rounded-xl border border-slate-200 flex items-center gap-2">
                      <span className="font-bold text-amber-900 bg-amber-100 px-2 py-1 rounded text-xs">
                        {b.blankLabel}
                      </span>
                      <input
                        type="text"
                        required
                        placeholder={`Từ đúng cho ${b.blankLabel}`}
                        value={b.correctWord}
                        onChange={(e) => {
                          const val = e.target.value;
                          setBlankItems((prev) =>
                            prev.map((item, idx) => (idx === bIdx ? { ...item, correctWord: val } : item))
                          );
                        }}
                        className="flex-1 px-2.5 py-1 border border-slate-200 rounded-lg outline-none text-xs font-semibold"
                      />
                      {blankItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setBlankItems((prev) => prev.filter((_, idx) => idx !== bIdx))}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 4. Nối từ */}
          {formType === 'Nối từ' && (
            <div className="space-y-3 p-3.5 bg-teal-50/40 rounded-xl border border-teal-200">
              <div className="flex items-center justify-between">
                <span className="font-bold text-teal-950">Các cặp nối Cột A và Cột B:</span>
                <button
                  type="button"
                  onClick={() => {
                    const newId = String(matchingPairs.length + 1);
                    setMatchingPairs((prev) => [
                      ...prev,
                      { id: newId, left: `${newId}. `, right: `${String.fromCharCode(64 + Number(newId))}. `, matchedKey: String.fromCharCode(64 + Number(newId)) },
                    ]);
                  }}
                  className="text-xs text-teal-800 font-bold hover:underline cursor-pointer"
                >
                  + Thêm cặp ghép
                </button>
              </div>

              <div className="space-y-2">
                {matchingPairs.map((pair, pIdx) => (
                  <div key={pair.id} className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-0.5">
                          Cột A ({pair.id}):
                        </label>
                        <input
                          type="text"
                          required
                          value={pair.left}
                          onChange={(e) => {
                            const val = e.target.value;
                            setMatchingPairs((prev) =>
                              prev.map((item, idx) => (idx === pIdx ? { ...item, left: val } : item))
                            );
                          }}
                          className="w-full px-2.5 py-1 border border-slate-200 rounded-lg outline-none font-serif text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-0.5">
                          Cột B:
                        </label>
                        <input
                          type="text"
                          required
                          value={pair.right}
                          onChange={(e) => {
                            const val = e.target.value;
                            setMatchingPairs((prev) =>
                              prev.map((item, idx) => (idx === pIdx ? { ...item, right: val } : item))
                            );
                          }}
                          className="w-full px-2.5 py-1 border border-slate-200 rounded-lg outline-none font-serif text-xs"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-600 font-medium">Ghép {pair.id} với:</span>
                        <input
                          type="text"
                          value={pair.matchedKey || 'A'}
                          onChange={(e) => {
                            const val = e.target.value.toUpperCase();
                            setMatchingPairs((prev) =>
                              prev.map((item, idx) => (idx === pIdx ? { ...item, matchedKey: val } : item))
                            );
                          }}
                          className="w-12 px-2 py-0.5 border border-slate-200 rounded font-bold text-center text-teal-800 uppercase"
                        />
                      </div>

                      {matchingPairs.length > 2 && (
                        <button
                          type="button"
                          onClick={() => setMatchingPairs((prev) => prev.filter((_, idx) => idx !== pIdx))}
                          className="text-xs text-rose-600 hover:underline cursor-pointer"
                        >
                          Xóa cặp này
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Tự luận */}
          {formType === 'Tự luận' && (
            <div className="space-y-3 p-3.5 bg-rose-50/40 rounded-xl border border-rose-200">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Dàn ý gợi ý trả lời chi tiết (*):
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Nhập các luận điểm chính, ý 1, ý 2, ý 3, phân tích ý nghĩa và bài học lịch sử..."
                  value={essayOutline}
                  onChange={(e) => setEssayOutline(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 font-serif"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-700">Biểu điểm chấm (Rubric):</span>
                  <button
                    type="button"
                    onClick={() => {
                      setRubricPoints((prev) => [
                        ...prev,
                        { criteria: 'Tiêu chí chấm bổ sung', points: 1.0 },
                      ]);
                    }}
                    className="text-xs text-rose-700 font-bold hover:underline cursor-pointer"
                  >
                    + Thêm tiêu chí chấm
                  </button>
                </div>

                <div className="space-y-2">
                  {rubricPoints.map((r, rIdx) => (
                    <div key={rIdx} className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-200">
                      <input
                        type="text"
                        placeholder="Nội dung tiêu chí đạt điểm"
                        value={r.criteria}
                        onChange={(e) => {
                          const val = e.target.value;
                          setRubricPoints((prev) =>
                            prev.map((item, idx) => (idx === rIdx ? { ...item, criteria: val } : item))
                          );
                        }}
                        className="flex-1 px-2.5 py-1 border border-slate-200 rounded-lg text-xs outline-none"
                      />
                      <input
                        type="number"
                        step="0.25"
                        min="0"
                        max="10"
                        value={r.points}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setRubricPoints((prev) =>
                            prev.map((item, idx) => (idx === rIdx ? { ...item, points: val } : item))
                          );
                        }}
                        className="w-20 px-2.5 py-1 border border-slate-200 rounded-lg text-xs font-bold text-[#0878C9] outline-none"
                      />
                      <span className="text-xs text-slate-500 font-medium">điểm</span>
                      {rubricPoints.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setRubricPoints((prev) => prev.filter((_, idx) => idx !== rIdx))}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Explanation */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Lời giải thích chi tiết / Chú giải tư liệu
            </label>
            <textarea
              rows={2}
              placeholder="Giải thích vì sao đáp án đúng, căn cứ vào trang nào trong SGK hoặc tài liệu..."
              value={formExplanation}
              onChange={(e) => setFormExplanation(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0878C9] italic font-serif"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsAddEditModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer transition-colors"
            >
              Hủy bỏ
            </button>

            <div className="flex flex-wrap items-center gap-2">
              {!editingQuestionId && (
                <button
                  type="button"
                  onClick={() => handleSaveQuestion(undefined, true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer transition-colors shadow-xs flex items-center gap-1.5"
                  title="Lưu câu này và giữ nguyên biểu mẫu để soạn tiếp câu tiếp theo"
                >
                  <Plus className="w-4 h-4" />
                  Lưu & Thêm câu tiếp theo
                </button>
              )}
              <button
                type="submit"
                className="px-5 py-2 bg-[#0878C9] hover:bg-[#073B66] text-white rounded-xl font-bold cursor-pointer transition-colors shadow-xs"
              >
                {editingQuestionId ? 'Cập nhật câu hỏi' : 'Lưu & Đóng'}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Modal: Assembled Exam Preview & Print */}
      <Modal
        isOpen={isBuildExamModalOpen}
        onClose={() => setIsBuildExamModalOpen(false)}
        title="Xem trước & Xuất bản đề kiểm tra hoàn chỉnh"
        maxWidth="4xl"
      >
        <div className="space-y-5 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print pb-3 border-b border-slate-200">
            <div>
              <label className="block text-slate-500 font-medium mb-1">Tiêu đề đề thi:</label>
              <input
                type="text"
                value={generatedExamTitle}
                onChange={(e) => setGeneratedExamTitle(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-xl font-bold text-sm text-[#073B66] w-80 outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* 10-Point Automatic Calculation Toggle */}
              <button
                type="button"
                onClick={() => setIsAutoScore10(!isAutoScore10)}
                className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                  isAutoScore10
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
                title="Tự động tính toán điểm từng câu để tổng điểm toàn bài luôn đạt 10,0 điểm"
              >
                <Calculator className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tự động tính thang 10,0đ</span>
                <span className="bg-emerald-600 text-white text-[10px] px-1.5 py-0.2 rounded font-extrabold">
                  {isAutoScore10 ? 'BẬT' : 'TẮT'}
                </span>
              </button>

              <button
                onClick={handlePrintExam}
                className="px-4 py-2 bg-[#073B66] hover:bg-[#0878C9] text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <Printer className="w-4 h-4" />
                In đề thi & Đáp án
              </button>
            </div>
          </div>

          {/* Exam Paper for Student */}
          <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-200 space-y-6">
            {/* Formal Header */}
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-300">
              <div className="text-center font-serif space-y-0.5">
                <div className="font-bold text-[11px] uppercase tracking-wide">
                  SỞ GIÁO DỤC VÀ ĐÀO TẠO QUẢNG NINH
                </div>
                <div className="font-extrabold text-xs uppercase text-[#073B66]">
                  TRUNG TÂM GDNN - GDTX TP QUẢNG NINH
                </div>
                <div className="font-bold text-[11px] text-slate-700">PHÂN HIỆU TIÊN YÊN</div>
              </div>

              <div className="text-center font-serif space-y-0.5">
                <div className="font-bold text-xs uppercase text-slate-900">
                  {generatedExamTitle}
                </div>
                <div className="text-[11px] text-slate-600 italic">
                  Thời gian làm bài: 45 phút (Không kể phát đề)
                </div>
                <div className="text-[11px] text-slate-600">Giáo viên ra đề: Cô Cao Thị Thu</div>
              </div>
            </div>

            {/* Student Info Box */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 flex flex-wrap items-center justify-between text-xs font-serif">
              <span>Họ và tên học viên: ............................................................................</span>
              <span>Lớp: ......................... Mã đề: 101</span>
              {isAutoScore10 && (
                <span className="text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-sans text-[11px]">
                  Tổng điểm toàn bài: 10,0 điểm
                </span>
              )}
            </div>

            {/* EXAM PARTS */}
            <div className="space-y-6 pt-2">
              {/* PHẦN I: TRẮC NGHIỆM ĐƠN */}
              {groupedExamQuestions.part1.length > 0 && (
                <div className="space-y-3">
                  <div className="font-bold text-[#073B66] uppercase text-xs pb-1 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="bg-[#073B66] text-white px-2 py-0.5 rounded text-[10px]">
                        PHẦN I
                      </span>
                      <span>
                        CÂU TRẮC NGHIỆM NHIỀU PHƯƠNG ÁN LỰA CHỌN ({groupedExamQuestions.part1.length} câu)
                      </span>
                    </div>
                    {isAutoScore10 && (
                      <span className="text-emerald-700 font-bold font-sans text-[11px]">
                        Tổng: {(groupedExamQuestions.part1.reduce((sum, q) => sum + (autoScores.questionPoints[q.id] || 0), 0)).toFixed(2)} điểm
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 italic">
                    Thí sinh trả lời từ câu 1 đến câu {groupedExamQuestions.part1.length}. Mỗi câu hỏi thí sinh chỉ chọn một phương án.
                  </p>

                  <div className="space-y-3 pl-2">
                    {groupedExamQuestions.part1.map((q, qIdx) => (
                      <div key={q.id} className="space-y-1.5 font-serif">
                        <div className="font-bold text-slate-900">
                          Câu {qIdx + 1}: {q.content}
                          {isAutoScore10 && (
                            <span className="text-emerald-700 font-sans font-bold text-[11px] ml-1.5">
                              ({autoScores.questionPoints[q.id]?.toFixed(2)} điểm)
                            </span>
                          )}
                        </div>
                        {q.options && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-3 text-slate-700 text-xs">
                            {q.options.map((opt, oi) => (
                              <div key={oi}>{opt}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PHẦN II: TRẮC NGHIỆM ĐÚNG SAI */}
              {groupedExamQuestions.part2.length > 0 && (
                <div className="space-y-3">
                  <div className="font-bold text-purple-900 uppercase text-xs pb-1 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="bg-purple-700 text-white px-2 py-0.5 rounded text-[10px]">
                        PHẦN II
                      </span>
                      <span>
                        CÂU TRẮC NGHIỆM ĐÚNG SAI ({groupedExamQuestions.part2.length} câu - Chuẩn format 2025)
                      </span>
                    </div>
                    {isAutoScore10 && (
                      <span className="text-purple-700 font-bold font-sans text-[11px]">
                        Tổng: {(groupedExamQuestions.part2.reduce((sum, q) => sum + (autoScores.questionPoints[q.id] || 0), 0)).toFixed(2)} điểm
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 italic">
                    Thí sinh trả lời từng câu. Trong mỗi ý a), b), c), d) ở mỗi câu, thí sinh chọn Đúng hoặc Sai.
                  </p>

                  <div className="space-y-4 pl-2">
                    {groupedExamQuestions.part2.map((q, qIdx) => (
                      <div key={q.id} className="space-y-2 font-serif">
                        <div className="font-bold text-slate-900 leading-relaxed whitespace-pre-line">
                          Câu {qIdx + 1}: {q.content}
                          {isAutoScore10 && (
                            <span className="text-purple-700 font-sans font-bold text-[11px] ml-1.5">
                              ({autoScores.questionPoints[q.id]?.toFixed(2)} điểm)
                            </span>
                          )}
                        </div>
                        <div className="pl-3 space-y-1.5">
                          {q.trueFalseStatements?.map((stmt) => (
                            <div
                              key={stmt.id}
                              className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 text-xs"
                            >
                              <span className="flex-1">
                                <strong className="mr-1.5 uppercase font-sans">{stmt.id})</strong>
                                {stmt.statement}
                              </span>
                              <div className="flex items-center gap-3 shrink-0 ml-3">
                                <span className="border border-slate-300 px-2.5 py-0.5 rounded text-[11px] text-slate-600 font-bold">
                                  [ ] Đúng
                                </span>
                                <span className="border border-slate-300 px-2.5 py-0.5 rounded text-[11px] text-slate-600 font-bold">
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
              )}

              {/* PHẦN III: ĐIỀN TỪ & NỐI TỪ */}
              {groupedExamQuestions.part3.length > 0 && (
                <div className="space-y-3">
                  <div className="font-bold text-amber-900 uppercase text-xs pb-1 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="bg-amber-700 text-white px-2 py-0.5 rounded text-[10px]">
                        PHẦN III
                      </span>
                      <span>BÀI TẬP ĐIỀN TỪ VÀ NỐI TỪ / GHÉP ĐÔI</span>
                    </div>
                    {isAutoScore10 && (
                      <span className="text-amber-700 font-bold font-sans text-[11px]">
                        Tổng: {(groupedExamQuestions.part3.reduce((sum, q) => sum + (autoScores.questionPoints[q.id] || 0), 0)).toFixed(2)} điểm
                      </span>
                    )}
                  </div>

                  <div className="space-y-4 pl-2">
                    {groupedExamQuestions.part3.map((q, qIdx) => (
                      <div key={q.id} className="space-y-2 font-serif">
                        <div className="font-bold text-slate-900">
                          Câu {qIdx + 1} ({q.type}): {q.content}
                          {isAutoScore10 && (
                            <span className="text-amber-700 font-sans font-bold text-[11px] ml-1.5">
                              ({autoScores.questionPoints[q.id]?.toFixed(2)} điểm)
                            </span>
                          )}
                        </div>

                        {/* If Blank */}
                        {q.type === 'Điền từ' && (
                          <div className="pl-3 space-y-2">
                            {q.wordBank && (
                              <div className="p-2 bg-white rounded border border-amber-200 text-xs text-amber-900">
                                <strong>Từ khóa cho trước: </strong>
                                {q.wordBank.join(' • ')}
                              </div>
                            )}
                            <div className="text-slate-600 text-xs">
                              <em>Trả lời:</em> [1]: ...........................; [2]: ...........................; [3]: ...........................; [4]: ...........................
                            </div>
                          </div>
                        )}

                        {/* If Match */}
                        {q.type === 'Nối từ' && q.matchingPairs && (
                          <div className="pl-3 space-y-2 text-xs">
                            <div className="grid grid-cols-2 gap-2 p-2.5 bg-white rounded-lg border border-slate-200">
                              <div className="space-y-1">
                                {q.matchingPairs.map((p) => (
                                  <div key={p.id}>{p.left}</div>
                                ))}
                              </div>
                              <div className="space-y-1">
                                {q.matchingPairs.map((p) => (
                                  <div key={p.id}>{p.right}</div>
                                ))}
                              </div>
                            </div>
                            <div className="text-slate-700 italic">
                              Học viên ghép cặp: 1 nối với [ ... ]; 2 nối với [ ... ]; 3 nối với [ ... ]; 4 nối với [ ... ]
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PHẦN IV: TỰ LUẬN */}
              {groupedExamQuestions.part4.length > 0 && (
                <div className="space-y-3">
                  <div className="font-bold text-rose-900 uppercase text-xs pb-1 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="bg-rose-700 text-white px-2 py-0.5 rounded text-[10px]">
                        PHẦN IV
                      </span>
                      <span>CÂU HỎI TỰ LUẬN ({groupedExamQuestions.part4.length} câu)</span>
                    </div>
                    {isAutoScore10 && (
                      <span className="text-rose-700 font-bold font-sans text-[11px]">
                        Tổng: {(groupedExamQuestions.part4.reduce((sum, q) => sum + (autoScores.questionPoints[q.id] || 0), 0)).toFixed(2)} điểm
                      </span>
                    )}
                  </div>

                  <div className="space-y-4 pl-2 font-serif">
                    {groupedExamQuestions.part4.map((q, qIdx) => (
                      <div key={q.id} className="space-y-2">
                        <div className="font-bold text-slate-900">
                          Câu {qIdx + 1}: {q.content}
                          {isAutoScore10 && (
                            <span className="text-rose-700 font-sans font-bold text-[11px] ml-1.5">
                              ({autoScores.questionPoints[q.id]?.toFixed(2)} điểm)
                            </span>
                          )}
                        </div>
                        <div className="h-28 border border-dashed border-slate-300 rounded-lg bg-white p-2 text-slate-400 italic text-[11px]">
                          (Học viên viết bài làm tự luận vào khoảng trống dưới đây...)
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Answer Key for Teacher */}
            <div className="pt-6 border-t-2 border-dashed border-slate-400 space-y-4 font-serif">
              <div className="text-center">
                <h4 className="font-extrabold text-emerald-800 uppercase text-sm tracking-wide">
                  ĐÁP ÁN VÀ HƯỚNG DẪN CHẤM CHI TIẾT (DÀNH CHO GIÁO VIÊN)
                </h4>
                <p className="text-xs text-slate-500 italic mt-0.5">
                  Môn Lịch sử - Giáo viên biên soạn: Cô Cao Thị Thu
                </p>
              </div>

              <div className="space-y-3 text-xs">
                {selectedQuestions.map((q, idx) => (
                  <div key={q.id} className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#073B66]">
                        Câu {idx + 1} ({q.type}) {isAutoScore10 ? `- ${autoScores.questionPoints[q.id]?.toFixed(2)} điểm` : ''}:
                      </span>
                      <span className="font-extrabold text-emerald-700">{q.correctAnswer}</span>
                    </div>

                    {q.explanation && (
                      <p className="text-slate-600 text-[11px] italic pl-2 border-l-2 border-emerald-400">
                        {q.explanation}
                      </p>
                    )}

                    {q.essayOutline && (
                      <div className="text-[11px] text-slate-700 whitespace-pre-line pl-2 border-l-2 border-rose-400 mt-1">
                        {q.essayOutline}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal: Word Batch Import */}
      <WordImportModal
        isOpen={isWordImportModalOpen}
        onClose={() => setIsWordImportModalOpen(false)}
        onImportQuestions={(newQuestions) => {
          newQuestions.forEach((q) => addQuestion(q));
          showToast(`Đã nhập thành công ${newQuestions.length} câu hỏi từ Word vào ngân hàng đề!`);
        }}
      />

      {/* Modal: Chỗ luyện đề thi ôn thi tốt nghiệp THPT 12 */}
      <GraduationExamModal
        isOpen={isGraduationExamModalOpen}
        onClose={() => setIsGraduationExamModalOpen(false)}
        onImportToBank={(examQuestions) => {
          const listToAdd = examQuestions || standardGraduationExamQuestions;
          let added = 0;
          listToAdd.forEach((sq) => {
            if (!questions.some((q) => q.id === sq.id)) {
              addQuestion(sq);
              added++;
            }
          });
          showToast(`Đã lưu thành công ${added} câu hỏi Đề ôn thi tốt nghiệp vào Ngân hàng câu hỏi!`);
        }}
      />

      {/* Modal: Trung Tâm 5 Phòng Thi Trực Tuyến Chuyên Biệt */}
      <ExamRoomHubModal
        isOpen={isExamRoomHubOpen}
        onClose={() => setIsExamRoomHubOpen(false)}
        onSelectRoom={(roomKey, durationMinutes, classId, studentId) => {
          setSelectedRoomMode(roomKey);
          setIsExamRoomHubOpen(false);
          setIsStudentExamModalOpen(true);
        }}
      />

      {/* Modal: Phòng Thi Trực Tuyến Học Sinh (5 dạng câu & Đếm ngược thời gian) */}
      <StudentExamRoomModal
        isOpen={isStudentExamModalOpen}
        onClose={() => setIsStudentExamModalOpen(false)}
        roomMode={selectedRoomMode}
        examTitle={
          selectedQuestionIds.length > 0
            ? `Bài thi trực tuyến (${selectedQuestionIds.length} câu tuyển chọn) - Môn Lịch sử`
            : undefined
        }
        initialQuestions={selectedQuestionIds.length > 0 ? selectedQuestions : undefined}
        defaultDurationMinutes={45}
      />
    </div>
  );
};
