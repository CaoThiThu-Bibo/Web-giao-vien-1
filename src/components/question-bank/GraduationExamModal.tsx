import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { standardGraduationExamQuestions } from '../../data/graduationExamData';
import { calculateGraduationExamScore, MOET_TF_BAREM } from '../../lib/examScoring';
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
} from 'lucide-react';

interface GraduationExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportToBank?: () => void;
}

export const GraduationExamModal: React.FC<GraduationExamModalProps> = ({
  isOpen,
  onClose,
  onImportToBank,
}) => {
  const { classes, students, updateStudentScore, exams, addExam } = useApp();

  const [activeTab, setActiveTab] = useState<'exam' | 'grading' | 'key'>('exam');

  // Answers State for Live Grading
  // Part 1: questionIndex (0..23) -> 'A' | 'B' | 'C' | 'D'
  const [part1Answers, setPart1Answers] = useState<Record<number, string>>({});
  // Part 2: questionIndex (0..3) -> { a?: boolean, b?: boolean, c?: boolean, d?: boolean }
  const [part2Answers, setPart2Answers] = useState<
    Record<number, Record<'a' | 'b' | 'c' | 'd', boolean | undefined>>
  >({
    0: { a: undefined, b: undefined, c: undefined, d: undefined },
    1: { a: undefined, b: undefined, c: undefined, d: undefined },
    2: { a: undefined, b: undefined, c: undefined, d: undefined },
    3: { a: undefined, b: undefined, c: undefined, d: undefined },
  });

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

  // Divide standard questions
  const part1Questions = useMemo(
    () => standardGraduationExamQuestions.filter((q) => q.type === 'Trắc nghiệm đơn'),
    []
  );
  const part2Questions = useMemo(
    () => standardGraduationExamQuestions.filter((q) => q.type === 'Trắc nghiệm đúng sai'),
    []
  );

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

  // Handle Fill 100% correct answers (for demo / testing)
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

    // Find or create an exam for "Thi thử tốt nghiệp THPT Lịch sử"
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
        title: 'Đề ôn thi tốt nghiệp THPT 2025 - Bộ GD&ĐT',
        classId: selectedClassId,
        className: classes.find((c) => c.id === selectedClassId)?.name || 'Khối 12',
        grade: 12,
        date: new Date().toISOString().split('T')[0],
        type: '1 tiết (45 phút)',
        format: 'Trắc nghiệm',
        maxScore: 10,
        weight: 2,
        description: 'Chấm điểm tự động chuẩn Bộ GD&ĐT (24 câu Phần I + 4 câu Phần II)',
      });
    }

    updateStudentScore(
      selectedStudentId,
      examId,
      scoreResult.totalScore,
      `Chấm tự động Đề tốt nghiệp: ${scoreResult.evaluationText}`
    );

    const st = students.find((s) => s.id === selectedStudentId);
    setSaveSuccessMsg(
      `Đã cập nhật điểm ${scoreResult.totalScore} (${scoreResult.evaluationLevel}) vào Sổ điểm điện tử cho học viên ${
        st?.fullName || ''
      }!`
    );
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="CẤU TRÚC ĐỀ ÔN THI TỐT NGHIỆP THPT LỚP 12 MÔN LỊCH SỬ - BỘ GD&ĐT"
      maxWidth="6xl"
    >
      <div className="space-y-4 text-xs font-sans">
        {/* Ministry Standard Badge & Summary Header */}
        <div className="p-4 bg-gradient-to-r from-[#073B66] via-[#0878C9] to-sky-700 text-white rounded-2xl shadow-sm space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="bg-amber-400 text-slate-900 font-extrabold px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider shadow-xs">
                  Quyết định 764/QĐ-BGDĐT
                </span>
                <span className="bg-white/20 text-white px-2 py-0.5 rounded text-[10px] font-medium">
                  Áp dụng từ năm 2025
                </span>
                <span className="bg-emerald-500 text-white px-2 py-0.5 rounded text-[10px] font-bold">
                  Thang điểm chuẩn: 10,0
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold tracking-tight">
                Cấu trúc đề ôn thi Tốt nghiệp THPT môn Lịch sử (50 phút - 28 câu)
              </h3>
              <p className="text-sky-100 text-[11px]">
                Biên soạn chuẩn khung Bộ GD&ĐT dành cho học viên GDTX Phân hiệu Tiên Yên • Giáo viên: Cô Cao Thị Thu
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
              <strong className="text-amber-300">24 câu × 0,25đ = 6,0đ</strong>
            </div>
            <div className="bg-black/15 px-3 py-1.5 rounded-lg flex items-center justify-between">
              <span>Phần II: Đúng / Sai bậc thang</span>
              <strong className="text-amber-300">4 câu × 1,0đ = 4,0đ</strong>
            </div>
            <div className="bg-black/15 px-3 py-1.5 rounded-lg flex items-center justify-between">
              <span>Barem Đúng/Sai của Bộ</span>
              <strong className="text-sky-200">1: 0.1đ | 2: 0.25đ | 3: 0.5đ | 4: 1.0đ</strong>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2 no-print">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('exam')}
              className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                activeTab === 'exam'
                  ? 'bg-[#073B66] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              Đề thi hoàn chỉnh (28 câu)
            </button>

            <button
              onClick={() => setActiveTab('grading')}
              className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                activeTab === 'grading'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Calculator className="w-4 h-4 text-emerald-200" />
              Phòng Chấm điểm tự động (Thang 10)
            </button>

            <button
              onClick={() => setActiveTab('key')}
              className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                activeTab === 'key'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              Đáp án & Barem điểm chi tiết
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              In đề thi & Barem
            </button>

            {onImportToBank && (
              <button
                onClick={onImportToBank}
                className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                title="Lưu trọn bộ 28 câu này vào Ngân hàng câu hỏi của Trung tâm"
              >
                <Layers className="w-4 h-4" />
                Lưu vào Ngân hàng câu hỏi
              </button>
            )}
          </div>
        </div>

        {/* =========================================================================
            TAB 1: COMPLETE EXAM VIEW & PRINT FORMAT
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
                  Đề thi thử tốt nghiệp THPT Lớp 12 - Năm 2025
                </div>
              </div>

              <div className="text-center font-serif space-y-0.5">
                <div className="font-extrabold text-xs uppercase text-slate-900">
                  KỲ THI TỐT NGHIỆP TRUNG HỌC PHỔ THÔNG NĂM 2025
                </div>
                <div className="font-bold text-xs text-[#0878C9]">
                  BÀI THI: LỊCH SỬ (CHƯƠNG TRÌNH GDTX 2018)
                </div>
                <div className="text-[11px] text-slate-600 italic">
                  Thời gian làm bài: 50 phút (Không kể thời gian phát đề)
                </div>
                <div className="text-[11px] text-slate-600 font-medium">
                  Mã đề thi: 121 • Giáo viên ra đề: Cô Cao Thị Thu
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
                  <strong>Phần I (6,0 điểm):</strong> Gồm 24 câu hỏi trắc nghiệm nhiều phương án lựa chọn (từ Câu 1 đến Câu 24). Mỗi câu trả lời đúng thí sinh được <strong>0,25 điểm</strong>.
                </li>
                <li>
                  <strong>Phần II (4,0 điểm):</strong> Gồm 4 câu hỏi trắc nghiệm Đúng/Sai (từ Câu 1 đến Câu 4). Mỗi câu hỏi có 4 ý a), b), c), d). Điểm tính theo barem bậc thang chính thức của Bộ GD&ĐT:
                  <span className="font-bold text-emerald-800 ml-1">
                    Đúng 1 ý = 0,10đ • Đúng 2 ý = 0,25đ • Đúng 3 ý = 0,50đ • Đúng cả 4 ý = 1,00đ.
                  </span>
                </li>
              </ul>
            </div>

            {/* PHẦN I: 24 CÂU TRẮC NGHIỆM ĐƠN */}
            <div className="space-y-4 pt-2">
              <div className="font-bold text-[#073B66] uppercase text-xs pb-1 border-b-2 border-[#073B66] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="bg-[#073B66] text-white px-2 py-0.5 rounded text-[10px]">
                    PHẦN I
                  </span>
                  <span>CÂU TRẮC NGHIỆM NHIỀU PHƯƠNG ÁN LỰA CHỌN</span>
                </div>
                <span className="text-slate-500 font-semibold lowercase">
                  (24 câu • 6,0 điểm • 0,25đ / câu)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 italic font-serif">
                Thí sinh trả lời từ câu 1 đến câu 24. Mỗi câu hỏi thí sinh chỉ chọn một phương án đúng nhất.
              </p>

              <div className="space-y-3.5 pl-2">
                {part1Questions.map((q, qIdx) => (
                  <div key={q.id} className="space-y-1.5 font-serif">
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

            {/* PHẦN II: 4 CÂU TRẮC NGHIỆM ĐÚNG SAI */}
            <div className="space-y-4 pt-4 border-t-2 border-slate-300">
              <div className="font-bold text-purple-900 uppercase text-xs pb-1 border-b-2 border-purple-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="bg-purple-800 text-white px-2 py-0.5 rounded text-[10px]">
                    PHẦN II
                  </span>
                  <span>CÂU TRẮC NGHIỆM ĐÚNG SAI (CHUẨN TƯ LIỆU BỘ GD&ĐT)</span>
                </div>
                <span className="text-slate-500 font-semibold lowercase">
                  (4 câu • 4,0 điểm • tối đa 1,0đ / câu)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 italic font-serif">
                Thí sinh trả lời từ câu 1 đến câu 4. Trong mỗi ý a), b), c), d) ở mỗi câu, thí sinh chọn Đúng hoặc Sai.
              </p>

              <div className="space-y-6 pl-2">
                {part2Questions.map((q, qIdx) => (
                  <div key={q.id} className="space-y-2.5 font-serif p-4 bg-slate-50/80 rounded-2xl border border-slate-200">
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
            TAB 2: INTERACTIVE LIVE GRADING ROOM (AUTOMATIC SCORING ENGINE)
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
                    <span className="text-slate-600 font-medium">
                      Tự động tính chuẩn barem Bộ GD&ĐT
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
                  <div className="text-[11px] text-sky-700 font-medium">Điểm Phần I (24 câu)</div>
                  <div className="text-xl font-black text-[#073B66] mt-0.5">
                    {scoreResult.part1Score.toFixed(2)}
                    <span className="text-xs font-normal text-slate-500"> / 6,0</span>
                  </div>
                  <div className="text-[10px] text-sky-600 font-semibold mt-0.5">
                    {scoreResult.part1CorrectCount} / 24 câu đúng (×0,25đ)
                  </div>
                </div>

                <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-center">
                  <div className="text-[11px] text-purple-700 font-medium">Điểm Phần II (4 câu Đ/S)</div>
                  <div className="text-xl font-black text-purple-900 mt-0.5">
                    {scoreResult.part2Score.toFixed(2)}
                    <span className="text-xs font-normal text-slate-500"> / 4,0</span>
                  </div>
                  <div className="text-[10px] text-purple-600 font-semibold mt-0.5">
                    Tính theo barem bậc thang
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
                    <span>Chấm điểm 24 câu trắc nghiệm đơn (0,25 điểm / câu đúng)</span>
                  </h4>
                  <span className="text-xs font-bold text-emerald-700">
                    Đã chấm: {Object.keys(part1Answers).length} / 24 câu
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {part1Questions.map((q, qIdx) => {
                    const studentAns = part1Answers[qIdx];
                    const isCorrect = studentAns === q.correctAnswer;
                    const isAnswered = studentAns !== undefined && studentAns !== '';

                    return (
                      <div
                        key={q.id}
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
                            <span className="text-[#0878C9]">Câu {qIdx + 1}:</span> {q.content.slice(0, 75)}...
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
                    <span>Chấm điểm 4 câu trắc nghiệm Đúng/Sai (Barem bậc thang 4 mức)</span>
                  </h4>
                  <span className="text-xs font-bold text-purple-700">
                    Tổng điểm Phần II: {scoreResult.part2Score.toFixed(2)} / 4,0đ
                  </span>
                </div>

                <div className="space-y-4">
                  {part2Questions.map((q, qIdx) => {
                    const detail = scoreResult.part2Details[qIdx];
                    const currentAnswers = part2Answers[qIdx] || {};

                    return (
                      <div
                        key={q.id}
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
            TAB 3: ANSWER KEY & MOET STEPWISE BAREM EXPLANATION
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
                  <div className="text-[11px] text-slate-500 font-medium">Chỉ đúng 02 ý</div>
                  <div className="text-lg font-black text-purple-800">0,25 điểm</div>
                  <div className="text-[10px] text-slate-400">Khá</div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-purple-200 text-center">
                  <div className="text-[11px] text-slate-500 font-medium">Chỉ đúng 03 ý</div>
                  <div className="text-lg font-black text-purple-800">0,50 điểm</div>
                  <div className="text-[10px] text-slate-400">Tốt</div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-emerald-300 text-center bg-emerald-50/40">
                  <div className="text-[11px] text-emerald-700 font-medium">Đúng cả 04 ý</div>
                  <div className="text-xl font-black text-emerald-700">1,00 điểm</div>
                  <div className="text-[10px] text-emerald-600 font-bold">Điểm tuyệt đối</div>
                </div>
              </div>
            </div>

            {/* Answer Matrix for Part 1 (24 questions) */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
              <h4 className="font-bold text-[#073B66] text-xs uppercase flex items-center justify-between">
                <span>Đáp án 24 câu trắc nghiệm đơn (Phần I - 6,0 điểm)</span>
                <span className="text-[11px] text-slate-500 font-normal">Mỗi câu đúng: 0,25đ</span>
              </h4>

              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                {part1Questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-center font-serif"
                  >
                    <div className="text-[10px] text-slate-500 font-sans">Câu {idx + 1}</div>
                    <div className="text-sm font-extrabold text-[#0878C9]">{q.correctAnswer}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed Explanation for Part 2 (4 questions) */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-4">
              <h4 className="font-bold text-purple-900 text-xs uppercase">
                Hướng dẫn chấm chi tiết 4 câu trắc nghiệm Đúng / Sai (Phần II - 4,0 điểm)
              </h4>

              <div className="space-y-4">
                {part2Questions.map((q, idx) => (
                  <div key={q.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="font-bold text-slate-800 text-xs">
                      <span className="text-purple-800">Câu {idx + 1} (Phần II):</span> {q.topic}
                    </div>

                    <div className="space-y-1.5 pl-2">
                      {q.trueFalseStatements?.map((stmt) => (
                        <div key={stmt.id} className="text-xs">
                          <span className="font-bold uppercase text-purple-800 mr-1.5">
                            Ý {stmt.id}):
                          </span>
                          <span
                            className={`font-black px-1.5 py-0.5 rounded text-[10px] mr-2 ${
                              stmt.isCorrect
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {stmt.isCorrect ? 'ĐÚNG' : 'SAI'}
                          </span>
                          <span className="text-slate-600 italic">
                            — {stmt.explanation || 'Căn cứ SGK Lịch sử 12.'}
                          </span>
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
    </Modal>
  );
};
