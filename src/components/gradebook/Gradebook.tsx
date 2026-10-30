import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { useApp } from '../../context/AppContext';
import { Exam, Student, EvaluationLevel } from '../../types';
import { Modal } from '../common/Modal';
import {
  calculateTT43Scores,
  createStandardTT43Exams,
  TT43_COMMENTS_BANK,
} from '../../lib/tt43Evaluation';
import {
  ClipboardList,
  Plus,
  Printer,
  FileDown,
  Edit2,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Save,
  BookOpen,
  Sparkles,
  Info,
  Award,
  TrendingUp,
  MessageSquare,
  HelpCircle,
  FileSpreadsheet,
  Users,
  ChevronRight,
  UserPlus,
} from 'lucide-react';

export const Gradebook: React.FC = () => {
  const {
    students,
    classes,
    exams,
    addExam,
    deleteExam,
    updateStudentScore,
    batchUpdateScores,
    updateStudentComment,
    batchUpdateComments,
    initTT43ExamsForClass,
    setActiveTab,
    addStudent,
  } = useApp();

  // Class & Semester Selection
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [selectedSemester, setSelectedSemester] = useState<'HK2' | 'HK1' | 'ALL'>('HK2');

  // Modals
  const [isAddExamOpen, setIsAddExamOpen] = useState(false);
  const [isEditScoreModalOpen, setIsEditScoreModalOpen] = useState(false);
  const [isDeleteExamConfirmOpen, setIsDeleteExamConfirmOpen] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isRegulationInfoOpen, setIsRegulationInfoOpen] = useState(false);
  const [examToDelete, setExamToDelete] = useState<Exam | null>(null);

  // Score edit state
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [editingScoreVal, setEditingScoreVal] = useState<number>(0);
  const [editReason, setEditReason] = useState<string>('Chấm lại bài kiểm tra');

  // Comment edit state
  const [commentingStudent, setCommentingStudent] = useState<Student | null>(null);
  const [activeCommentText, setActiveCommentText] = useState<string>('');
  const [currentStudentLevel, setCurrentStudentLevel] = useState<EvaluationLevel>('Khá');

  // Batch input mode
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [batchExamId, setBatchExamId] = useState<string>('');
  const [batchScores, setBatchScores] = useState<Record<string, number>>({});
  const [notificationMsg, setNotificationMsg] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  // Add Exam form
  const [examFormData, setExamFormData] = useState({
    code: '',
    title: '',
    classId: classes[0]?.id || '',
    className: classes[0]?.code || '10A1',
    grade: (classes[0]?.grade || 10) as 10 | 11 | 12,
    date: new Date().toISOString().split('T')[0],
    type: '15 phút' as const,
    format: 'Trắc nghiệm' as const,
    maxScore: 10,
    weight: 1,
    tt43Category: 'TX1' as 'TX1' | 'TX2' | 'TX3' | 'GK' | 'CK' | 'OTHER',
    semester: 'HK2' as 'HK1' | 'HK2',
    description: '',
  });

  const showNotification = (text: string, type: 'success' | 'info' = 'success') => {
    setNotificationMsg({ text, type });
    setTimeout(() => setNotificationMsg(null), 3500);
  };

  const activeClass = classes.find((c) => c.id === selectedClassId) || classes[0];

  const classStudents = useMemo(() => {
    return students.filter(
      (s) => s.classId === activeClass?.id || s.className === activeClass?.code
    );
  }, [students, activeClass]);

  // Filter exams for active class & selected semester
  const classExams = useMemo(() => {
    return exams.filter((e) => {
      const matchClass = e.classId === activeClass?.id || e.className === activeClass?.code;
      if (!matchClass) return false;
      if (selectedSemester === 'ALL') return true;
      return e.semester === selectedSemester || !e.semester;
    });
  }, [exams, activeClass, selectedSemester]);

  // Categorized exams according to Circular 43
  const txExams = useMemo(() => {
    return classExams.filter(
      (e) => e.tt43Category === 'TX1' || e.tt43Category === 'TX2' || e.tt43Category === 'TX3' || e.weight === 1
    );
  }, [classExams]);

  const gkExams = useMemo(() => {
    return classExams.filter(
      (e) => e.tt43Category === 'GK' || e.type === 'Giữa kỳ' || (e.weight === 2 && e.tt43Category !== 'CK')
    );
  }, [classExams]);

  const ckExams = useMemo(() => {
    return classExams.filter(
      (e) => e.tt43Category === 'CK' || e.type === 'Cuối kỳ' || e.weight === 3
    );
  }, [classExams]);

  // Compute calculated results for all students in class
  const studentResults = useMemo(() => {
    const map = new Map<string, ReturnType<typeof calculateTT43Scores>>();
    classStudents.forEach((std) => {
      const res = calculateTT43Scores(std, classExams);
      map.set(std.id, res);
    });
    return map;
  }, [classStudents, classExams]);

  // Class statistics by Circular 43
  const classStats = useMemo(() => {
    if (classStudents.length === 0) {
      return { total: 0, tot: 0, kha: 0, dat: 0, chuaDat: 0, avg: 0 };
    }
    let tot = 0;
    let kha = 0;
    let dat = 0;
    let chuaDat = 0;
    let totalScore = 0;

    classStudents.forEach((std) => {
      const res = studentResults.get(std.id);
      if (res) {
        totalScore += res.averageScore;
        if (res.level === 'Tốt') tot++;
        else if (res.level === 'Khá') kha++;
        else if (res.level === 'Đạt') dat++;
        else chuaDat++;
      }
    });

    const avg = Number((totalScore / classStudents.length).toFixed(1));
    return {
      total: classStudents.length,
      tot,
      kha,
      dat,
      chuaDat,
      avg,
    };
  }, [classStudents, studentResults]);

  // Auto initialize 5 standard TT43 exams for class
  const handleInitStandardExams = () => {
    if (!activeClass) return;
    initTT43ExamsForClass(activeClass.id, selectedSemester === 'ALL' ? 'HK2' : selectedSemester);
    showNotification(
      `Đã khởi tạo đủ 5 cột điểm chuẩn môn Lịch sử (52 tiết/năm) cho lớp ${activeClass.name} theo Thông tư 43!`
    );
  };

  // Auto apply pedagogical comments to all students in class
  const handleAutoCommentAll = () => {
    if (classStudents.length === 0) return;
    const commentMap: Record<string, string> = {};
    classStudents.forEach((std) => {
      const res = studentResults.get(std.id);
      if (res) {
        commentMap[std.id] = res.comment;
      }
    });
    batchUpdateComments(commentMap);
    showNotification(
      `Đã áp dụng tự động nhận xét sư phạm môn Lịch sử theo 4 mức Thông tư 43 cho toàn bộ ${classStudents.length} học viên!`
    );
  };

  // Open add exam modal
  const handleOpenAddExam = () => {
    setExamFormData({
      code: `KT_${activeClass?.code || '10A1'}_${Date.now().toString().slice(-4)}`,
      title: 'Kiểm tra thường xuyên môn Lịch sử',
      classId: activeClass?.id || '',
      className: activeClass?.code || '10A1',
      grade: activeClass?.grade || 10,
      date: new Date().toISOString().split('T')[0],
      type: '15 phút',
      format: 'Trắc nghiệm',
      maxScore: 10,
      weight: 1,
      tt43Category: 'TX1',
      semester: selectedSemester === 'ALL' ? 'HK2' : selectedSemester,
      description: 'Đánh giá học viên theo Thông tư 43/2021/TT-BGDĐT',
    });
    setIsAddExamOpen(true);
  };

  const handleSaveExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examFormData.title) return;
    addExam(examFormData);
    setIsAddExamOpen(false);
    showNotification(`Đã tạo thành công cột điểm "${examFormData.title}"`);
  };

  // Open single score edit
  const handleOpenScoreEdit = (std: Student, ex: Exam) => {
    setEditingStudent(std);
    setEditingExam(ex);
    setEditingScoreVal(std.scores[ex.id] ?? 0);
    setEditReason('Chấm kiểm tra lại');
    setIsEditScoreModalOpen(true);
  };

  const handleSaveScoreEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent || !editingExam) return;

    if (editingScoreVal < 0 || editingScoreVal > 10) {
      alert('Điểm số phải nằm trong thang điểm từ 0 đến 10!');
      return;
    }

    updateStudentScore(editingStudent.id, editingExam.id, editingScoreVal, editReason);
    setIsEditScoreModalOpen(false);
    showNotification(`Đã cập nhật điểm học sinh ${editingStudent.fullName}: ${editingScoreVal}`);
  };

  // Open comment picker modal
  const handleOpenCommentModal = (std: Student) => {
    const res = studentResults.get(std.id);
    const level: EvaluationLevel = res?.level || 'Khá';
    setCommentingStudent(std);
    setCurrentStudentLevel(level);
    setActiveCommentText(std.teacherComment || std.notes || res?.comment || '');
    setIsCommentModalOpen(true);
  };

  const handleSaveComment = () => {
    if (!commentingStudent) return;
    updateStudentComment(commentingStudent.id, activeCommentText);
    setIsCommentModalOpen(false);
    showNotification(`Đã lưu lời nhận xét sư phạm cho học viên ${commentingStudent.fullName}`);
  };

  // Batch scoring mode initialization
  const startBatchScoring = (examId: string) => {
    setBatchExamId(examId);
    const initial: Record<string, number> = {};
    classStudents.forEach((s) => {
      initial[s.id] = s.scores[examId] ?? 0;
    });
    setBatchScores(initial);
    setIsBatchMode(true);
  };

  const handleSaveBatchScores = () => {
    for (const [, val] of Object.entries(batchScores)) {
      if (val < 0 || val > 10) {
        alert('Có điểm không hợp lệ (ngoài khoảng 0 - 10). Vui lòng kiểm tra lại!');
        return;
      }
    }
    batchUpdateScores(batchExamId, batchScores);
    showNotification('Đã lưu thành công điểm số cho toàn bộ lớp!');
    setIsBatchMode(false);
  };

  // Quick enroll sample students if class is empty
  const handleAddSampleStudents = () => {
    if (!activeClass) return;
    const samples = [
      { code: `HS${activeClass.code}01`, fullName: 'Trần Văn Minh', gender: 'Nam' as const, dob: '2008-04-12' },
      { code: `HS${activeClass.code}02`, fullName: 'Nguyễn Thị Thu Trang', gender: 'Nữ' as const, dob: '2008-08-25' },
      { code: `HS${activeClass.code}03`, fullName: 'Lê Hoàng Long', gender: 'Nam' as const, dob: '2008-02-18' },
      { code: `HS${activeClass.code}04`, fullName: 'Vũ Thùy Dương', gender: 'Nữ' as const, dob: '2008-11-05' },
      { code: `HS${activeClass.code}05`, fullName: 'Đặng Tuấn Anh', gender: 'Nam' as const, dob: '2008-06-30' },
    ];

    samples.forEach((s) => {
      addStudent({
        ...s,
        classId: activeClass.id,
        className: activeClass.code,
        grade: activeClass.grade,
        academicYear: activeClass.academicYear || '2024 - 2025',
        status: 'Đang học',
        scores: {},
        attendanceStats: { present: 20, late: 0, excused: 0, unexcused: 0 },
      });
    });

    handleInitStandardExams();
    showNotification(`Đã thêm 5 học viên mẫu vào lớp ${activeClass.name} để trải nghiệm sổ điểm!`);
  };

  // Export Excel Gradebook (.xlsx)
  const handleExportExcel = () => {
    if (!activeClass) return;

    const headers = [
      'STT',
      'Mã học sinh',
      'Họ và tên',
      'Giới tính',
      ...classExams.map((e) => `${e.title} (HS ${e.weight})`),
      'Điểm TB môn (ĐTBm)',
      'Mức đánh giá (TT 43)',
      'Nhận xét sư phạm môn Lịch sử',
    ];

    const rows = classStudents.map((std, idx) => {
      const res = studentResults.get(std.id);
      const examVals = classExams.map((e) => (typeof std.scores[e.id] === 'number' ? std.scores[e.id] : ''));
      return [
        idx + 1,
        std.code,
        std.fullName,
        std.gender,
        ...examVals,
        res?.averageScore ?? '',
        res?.level ?? '',
        std.teacherComment || std.notes || res?.comment || '',
      ];
    });

    const worksheet = XLSX.utils.aoa_to_sheet([
      [`SỔ ĐIỂM ĐIỆN TỬ MÔN LỊCH SỬ - LỚP ${activeClass.name}`],
      [`Quy chế: Thông tư 43/2021/TT-BGDĐT dành cho học viên GDTX cấp THPT (52 tiết/năm)`],
      [`Giáo viên bộ môn: Cô Cao Thị Thu | Học kỳ: ${selectedSemester} | Năm học: ${activeClass.academicYear}`],
      [],
      headers,
      ...rows,
    ]);

    worksheet['!cols'] = [
      { wch: 6 },
      { wch: 14 },
      { wch: 22 },
      { wch: 10 },
      ...classExams.map(() => ({ wch: 18 })),
      { wch: 14 },
      { wch: 15 },
      { wch: 45 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `SoDiem_${activeClass.code}`);
    XLSX.writeFile(workbook, `So_diem_LichSu_${activeClass.code}_TT43.xlsx`);
    showNotification('Đã xuất thành công file Excel Sổ điểm điện tử theo Thông tư 43!');
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 bg-blue-100 text-[#073B66] font-bold text-[11px] rounded-lg border border-blue-200">
              Thông tư 43/2021/TT-BGDĐT
            </span>
            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[11px] rounded-lg border border-emerald-200">
              Định mức: 52 tiết/năm (Khối 10, 11, 12 GDTX)
            </span>
            <button
              onClick={() => setIsRegulationInfoOpen(true)}
              className="text-xs text-[#0878C9] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
            >
              <Info className="w-3.5 h-3.5" />
              Xem quy chế tính điểm & nhận xét
            </button>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-[#073B66] font-serif flex items-center gap-2.5">
            <ClipboardList className="w-6 h-6 text-[#0878C9]" />
            Sổ điểm điện tử môn Lịch sử
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Quản lý điểm số, kiểm tra định kỳ (HS 2, 3), đánh giá thường xuyên (HS 1) và nhận xét theo 4 mức: <strong>Tốt • Khá • Đạt • Chưa đạt</strong>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleInitStandardExams}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            title="Tự động tạo đủ 5 cột điểm: 3 Thường xuyên + 1 Giữa kỳ + 1 Cuối kỳ"
          >
            <Sparkles className="w-4 h-4" />
            Khởi tạo 5 cột điểm chuẩn TT 43
          </button>

          <button
            onClick={handleOpenAddExam}
            className="px-3.5 py-2 bg-[#0878C9] hover:bg-[#073B66] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Tạo bài kiểm tra
          </button>

          <button
            onClick={handleExportExcel}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Xuất Excel
          </button>

          <button
            onClick={() => window.print()}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#073B66]" />
            In sổ điểm
          </button>
        </div>
      </div>

      {/* Class and Semester Selector */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        {/* Class switcher */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-slate-600 font-bold shrink-0">Chọn lớp:</span>
          <div className="flex items-center gap-1.5">
            {classes.map((cls) => (
              <button
                key={cls.id}
                onClick={() => {
                  setSelectedClassId(cls.id);
                  setIsBatchMode(false);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  cls.id === activeClass?.id
                    ? 'bg-[#073B66] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cls.name}
              </button>
            ))}
          </div>
        </div>

        {/* Semester selector & Quick Batch Scorer */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            {(['HK1', 'HK2', 'ALL'] as const).map((sem) => (
              <button
                key={sem}
                onClick={() => setSelectedSemester(sem)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedSemester === sem
                    ? 'bg-white text-[#073B66] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {sem === 'HK1' ? 'Học kỳ I' : sem === 'HK2' ? 'Học kỳ II' : 'Cả năm'}
              </button>
            ))}
          </div>

          {classExams.length > 0 && !isBatchMode && (
            <div className="flex items-center gap-1.5">
              <select
                value={batchExamId || classExams[0]?.id}
                onChange={(e) => startBatchScoring(e.target.value)}
                className="px-2.5 py-1.5 bg-sky-50 text-[#073B66] border border-sky-200 rounded-xl text-xs font-bold outline-none cursor-pointer"
              >
                <option value="">-- Nhập điểm hàng loạt --</option>
                {classExams.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.title} (HS {ex.weight})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Notifications */}
      {notificationMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          {notificationMsg.text}
        </div>
      )}

      {/* Statistics Cards based on Circular 43 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 no-print">
        <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500">Sĩ số lớp</div>
          <div className="text-xl font-bold text-slate-800 mt-1">{classStats.total} học viên</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Khối {activeClass?.grade || 10} GDTX</div>
        </div>

        <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-200 shadow-xs">
          <div className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            Mức Tốt (≥ 8.0)
          </div>
          <div className="text-xl font-bold text-emerald-800 mt-1">
            {classStats.tot}{' '}
            <span className="text-xs font-normal text-emerald-600">
              ({classStats.total ? Math.round((classStats.tot / classStats.total) * 100) : 0}%)
            </span>
          </div>
          <div className="text-[10px] text-emerald-600 mt-0.5">Định kỳ ≥ 6.5</div>
        </div>

        <div className="p-3 bg-sky-50/60 rounded-2xl border border-sky-200 shadow-xs">
          <div className="text-[11px] font-bold text-sky-700 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-sky-600"></span>
            Mức Khá (≥ 6.5)
          </div>
          <div className="text-xl font-bold text-[#073B66] mt-1">
            {classStats.kha}{' '}
            <span className="text-xs font-normal text-sky-600">
              ({classStats.total ? Math.round((classStats.kha / classStats.total) * 100) : 0}%)
            </span>
          </div>
          <div className="text-[10px] text-sky-600 mt-0.5">Định kỳ ≥ 5.0</div>
        </div>

        <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200 shadow-xs">
          <div className="text-[11px] font-bold text-amber-700 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-600"></span>
            Mức Đạt (≥ 5.0)
          </div>
          <div className="text-xl font-bold text-amber-800 mt-1">
            {classStats.dat}{' '}
            <span className="text-xs font-normal text-amber-600">
              ({classStats.total ? Math.round((classStats.dat / classStats.total) * 100) : 0}%)
            </span>
          </div>
          <div className="text-[10px] text-amber-600 mt-0.5">Định kỳ ≥ 3.5</div>
        </div>

        <div className="p-3 bg-rose-50/60 rounded-2xl border border-rose-200 shadow-xs">
          <div className="text-[11px] font-bold text-rose-700 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-600"></span>
            Chưa đạt (&lt; 5.0)
          </div>
          <div className="text-xl font-bold text-rose-800 mt-1">
            {classStats.chuaDat}{' '}
            <span className="text-xs font-normal text-rose-600">
              ({classStats.total ? Math.round((classStats.chuaDat / classStats.total) * 100) : 0}%)
            </span>
          </div>
          <div className="text-[10px] text-rose-600 mt-0.5">Cần phụ đạo thêm</div>
        </div>

        <div className="p-3 bg-indigo-50/60 rounded-2xl border border-indigo-200 shadow-xs">
          <div className="text-[11px] font-bold text-indigo-700 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
            ĐTB chung lớp
          </div>
          <div className="text-xl font-bold text-indigo-900 mt-1">{classStats.avg}</div>
          <div className="text-[10px] text-indigo-600 mt-0.5">Môn Lịch sử</div>
        </div>
      </div>

      {/* Main Gradebook Table Card */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        {/* Table Title Bar */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold text-[#073B66] text-sm font-serif">
              Bảng điểm môn Lịch sử lớp {activeClass?.name} ({classStudents.length} học viên)
            </h3>
            <span className="px-2 py-0.5 bg-blue-50 text-[#0878C9] rounded text-[11px] font-semibold border border-blue-200">
              TT 43/2021/TT-BGDĐT: ĐTBm = (TX1 + TX2 + TX3 + 2×GK + 3×CK) / 8
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAutoCommentAll}
              className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-[#073B66] border border-sky-200 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
              title="Tự động áp dụng nhận xét sư phạm môn Lịch sử theo 4 mức TT 43 cho toàn bộ học sinh"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#0878C9]" />
              Gợi ý nhận xét cả lớp
            </button>

            {isBatchMode && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveBatchScores}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  Lưu điểm
                </button>
                <button
                  onClick={() => setIsBatchMode(false)}
                  className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Thoát
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Gradebook Print Header (visible only when printing) */}
        <div className="hidden print-only p-4 text-center space-y-1">
          <h1 className="text-base font-bold uppercase font-serif text-black">
            TRUNG TÂM GDNN – GDTX THÀNH PHỐ QUẢNG NINH - PHÂN HIỆU TIÊN YÊN
          </h1>
          <h2 className="text-lg font-bold font-serif text-black">
            SỔ ĐIỂM ĐIỆN TỬ MÔN LỊCH SỬ - LỚP {activeClass?.name}
          </h2>
          <p className="text-xs text-slate-600">
            Theo Thông tư 43/2021/TT-BGDĐT | Giáo viên: Cô Cao Thị Thu | Định mức: 52 tiết/năm
          </p>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              {/* Group Header Row */}
              <tr className="bg-[#073B66] text-white text-[11px] font-bold border-b border-blue-900">
                <th colSpan={3} className="py-2 px-3 text-center border-r border-[#085a96]/40">
                  THÔNG TIN HỌC VIÊN
                </th>
                <th colSpan={txExams.length || 1} className="py-2 px-3 text-center border-r border-[#085a96]/40 bg-[#084b80]">
                  ĐÁNH GIÁ THƯỜNG XUYÊN (ĐĐGtx - Hệ số 1)
                </th>
                <th colSpan={(gkExams.length || 0) + (ckExams.length || 0) || 1} className="py-2 px-3 text-center border-r border-[#085a96]/40 bg-[#095591]">
                  ĐÁNH GIÁ ĐỊNH KỲ (ĐĐGđk)
                </th>
                <th colSpan={3} className="py-2 px-3 text-center bg-[#073B66]">
                  KẾT QUẢ ĐÁNH GIÁ MÔN SỬ (THÔNG TƯ 43/2021/TT-BGDĐT)
                </th>
              </tr>

              {/* Specific Columns Header Row */}
              <tr className="bg-[#084575] text-white font-semibold text-xs border-b border-slate-300">
                <th className="py-2.5 px-2.5 text-center w-10">STT</th>
                <th className="py-2.5 px-2.5 w-24">Mã HS</th>
                <th className="py-2.5 px-3 min-w-[140px] border-r border-[#085a96]/40">Họ và tên</th>

                {/* TX Columns */}
                {txExams.length === 0 ? (
                  <th className="py-2 px-2 text-center text-slate-300 text-[11px] border-r border-[#085a96]/40">
                    Chưa tạo cột TX
                  </th>
                ) : (
                  txExams.map((ex) => (
                    <th key={ex.id} className="py-2 px-2 text-center min-w-[85px] border-r border-[#085a96]/40">
                      <div className="flex flex-col items-center">
                        <span className="font-bold truncate max-w-[100px]" title={ex.title}>
                          {ex.title}
                        </span>
                        <span className="text-[10px] text-cyan-200">
                          {ex.tt43Category || 'TX'} (HS 1)
                        </span>
                        <button
                          onClick={() => {
                            setExamToDelete(ex);
                            setIsDeleteExamConfirmOpen(true);
                          }}
                          className="text-white/40 hover:text-rose-300 mt-0.5 no-print"
                          title="Xóa cột điểm này"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </th>
                  ))
                )}

                {/* GK & CK Columns */}
                {gkExams.map((ex) => (
                  <th key={ex.id} className="py-2 px-2 text-center min-w-[90px] border-r border-[#085a96]/40 bg-[#095591]/80">
                    <div className="flex flex-col items-center">
                      <span className="font-bold truncate max-w-[110px]" title={ex.title}>
                        {ex.title}
                      </span>
                      <span className="text-[10px] text-amber-200">Giữa kỳ (HS 2)</span>
                      <button
                        onClick={() => {
                          setExamToDelete(ex);
                          setIsDeleteExamConfirmOpen(true);
                        }}
                        className="text-white/40 hover:text-rose-300 mt-0.5 no-print"
                        title="Xóa cột điểm"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </th>
                ))}

                {ckExams.map((ex) => (
                  <th key={ex.id} className="py-2 px-2 text-center min-w-[90px] border-r border-[#085a96]/40 bg-[#095591]">
                    <div className="flex flex-col items-center">
                      <span className="font-bold truncate max-w-[110px]" title={ex.title}>
                        {ex.title}
                      </span>
                      <span className="text-[10px] text-emerald-200">Cuối kỳ (HS 3)</span>
                      <button
                        onClick={() => {
                          setExamToDelete(ex);
                          setIsDeleteExamConfirmOpen(true);
                        }}
                        className="text-white/40 hover:text-rose-300 mt-0.5 no-print"
                        title="Xóa cột điểm"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </th>
                ))}

                {/* TT 43 Result Columns */}
                <th className="py-2.5 px-3 text-center w-20 border-r border-[#085a96]/40 bg-[#073B66]">
                  ĐTB môn
                </th>
                <th className="py-2.5 px-3 text-center w-24 border-r border-[#085a96]/40 bg-[#073B66]">
                  Mức ĐG (TT 43)
                </th>
                <th className="py-2.5 px-3 min-w-[220px] bg-[#073B66]">
                  Nhận xét sư phạm môn Lịch sử
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {classStudents.length === 0 ? (
                <tr>
                  <td
                    colSpan={6 + txExams.length + gkExams.length + ckExams.length}
                    className="py-12 px-4 text-center"
                  >
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-sky-50 text-[#0878C9] mx-auto flex items-center justify-center">
                        <Users className="w-6 h-6" />
                      </div>
                      <div className="font-bold text-slate-800 text-sm">
                        Chưa có học sinh trong lớp {activeClass?.name}
                      </div>
                      <p className="text-xs text-slate-500">
                        Lớp học này hiện tại chưa có danh sách học sinh. Cô có thể thêm nhanh học sinh mẫu để trải nghiệm sổ điểm hoặc sang phân hệ Quản lý học sinh để nhập từ file Excel.
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                        <button
                          onClick={handleAddSampleStudents}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                        >
                          <UserPlus className="w-4 h-4" />
                          Thêm 5 học viên mẫu vào lớp
                        </button>
                        <button
                          onClick={() => setActiveTab('students')}
                          className="px-3.5 py-2 bg-[#0878C9] hover:bg-[#073B66] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                        >
                          <FileSpreadsheet className="w-4 h-4" />
                          Nhập danh sách học sinh (Excel)
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                classStudents.map((std, idx) => {
                  const res = studentResults.get(std.id);
                  const level = res?.level || 'Khá';
                  const currentComment = std.teacherComment || std.notes || res?.comment || '';

                  return (
                    <tr key={std.id} className="hover:bg-sky-50/40 transition-colors">
                      {/* STT, Code, Name */}
                      <td className="py-2.5 px-2.5 text-center font-bold text-slate-500">{idx + 1}</td>
                      <td className="py-2.5 px-2.5 font-mono font-bold text-[#073B66]">{std.code}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-800 border-r border-slate-100">
                        {std.fullName}
                      </td>

                      {/* TX Score Cells */}
                      {txExams.length === 0 ? (
                        <td className="py-2 px-2 text-center text-slate-400 border-r border-slate-100">-</td>
                      ) : (
                        txExams.map((ex) => {
                          const score = std.scores[ex.id];
                          const isBeingBatchEdited = isBatchMode && batchExamId === ex.id;

                          if (isBeingBatchEdited) {
                            return (
                              <td key={ex.id} className="py-1 px-1 text-center border-r border-slate-100 bg-amber-50">
                                <input
                                  type="number"
                                  min={0}
                                  max={10}
                                  step={0.1}
                                  value={batchScores[std.id] ?? ''}
                                  onChange={(e) =>
                                    setBatchScores({
                                      ...batchScores,
                                      [std.id]: parseFloat(e.target.value) || 0,
                                    })
                                  }
                                  className="w-14 px-1 py-1 text-center font-bold text-[#073B66] bg-white border border-amber-300 rounded-md outline-none focus:ring-2 focus:ring-[#0878C9]"
                                />
                              </td>
                            );
                          }

                          return (
                            <td
                              key={ex.id}
                              onClick={() => handleOpenScoreEdit(std, ex)}
                              className="py-2.5 px-2 text-center border-r border-slate-100 cursor-pointer hover:bg-sky-100/60 transition-colors"
                              title="Bấm để sửa điểm"
                            >
                              <span
                                className={`font-bold text-xs ${
                                  typeof score !== 'number'
                                    ? 'text-slate-300'
                                    : score >= 8
                                    ? 'text-[#0878C9]'
                                    : score >= 6.5
                                    ? 'text-emerald-600'
                                    : score >= 5
                                    ? 'text-amber-600'
                                    : 'text-rose-600'
                                }`}
                              >
                                {typeof score === 'number' ? score.toFixed(1) : '-'}
                              </span>
                            </td>
                          );
                        })
                      )}

                      {/* GK Score Cells */}
                      {gkExams.map((ex) => {
                        const score = std.scores[ex.id];
                        const isBeingBatchEdited = isBatchMode && batchExamId === ex.id;

                        if (isBeingBatchEdited) {
                          return (
                            <td key={ex.id} className="py-1 px-1 text-center border-r border-slate-100 bg-amber-50">
                              <input
                                type="number"
                                min={0}
                                max={10}
                                step={0.1}
                                value={batchScores[std.id] ?? ''}
                                onChange={(e) =>
                                  setBatchScores({
                                    ...batchScores,
                                    [std.id]: parseFloat(e.target.value) || 0,
                                  })
                                }
                                className="w-14 px-1 py-1 text-center font-bold text-[#073B66] bg-white border border-amber-300 rounded-md outline-none focus:ring-2 focus:ring-[#0878C9]"
                              />
                            </td>
                          );
                        }

                        return (
                          <td
                            key={ex.id}
                            onClick={() => handleOpenScoreEdit(std, ex)}
                            className="py-2.5 px-2 text-center border-r border-slate-100 cursor-pointer hover:bg-amber-50/60 transition-colors"
                            title="Bấm để sửa điểm giữa kỳ"
                          >
                            <span
                              className={`font-bold text-xs ${
                                typeof score !== 'number'
                                  ? 'text-slate-300'
                                  : score >= 8
                                  ? 'text-[#0878C9]'
                                  : score >= 6.5
                                  ? 'text-emerald-600'
                                  : score >= 5
                                  ? 'text-amber-600'
                                  : 'text-rose-600'
                              }`}
                            >
                              {typeof score === 'number' ? score.toFixed(1) : '-'}
                            </span>
                          </td>
                        );
                      })}

                      {/* CK Score Cells */}
                      {ckExams.map((ex) => {
                        const score = std.scores[ex.id];
                        const isBeingBatchEdited = isBatchMode && batchExamId === ex.id;

                        if (isBeingBatchEdited) {
                          return (
                            <td key={ex.id} className="py-1 px-1 text-center border-r border-slate-100 bg-amber-50">
                              <input
                                type="number"
                                min={0}
                                max={10}
                                step={0.1}
                                value={batchScores[std.id] ?? ''}
                                onChange={(e) =>
                                  setBatchScores({
                                    ...batchScores,
                                    [std.id]: parseFloat(e.target.value) || 0,
                                  })
                                }
                                className="w-14 px-1 py-1 text-center font-bold text-[#073B66] bg-white border border-amber-300 rounded-md outline-none focus:ring-2 focus:ring-[#0878C9]"
                              />
                            </td>
                          );
                        }

                        return (
                          <td
                            key={ex.id}
                            onClick={() => handleOpenScoreEdit(std, ex)}
                            className="py-2.5 px-2 text-center border-r border-slate-100 cursor-pointer hover:bg-emerald-50/60 transition-colors"
                            title="Bấm để sửa điểm cuối kỳ"
                          >
                            <span
                              className={`font-bold text-xs ${
                                typeof score !== 'number'
                                  ? 'text-slate-300'
                                  : score >= 8
                                  ? 'text-[#0878C9]'
                                  : score >= 6.5
                                  ? 'text-emerald-600'
                                  : score >= 5
                                  ? 'text-amber-600'
                                  : 'text-rose-600'
                              }`}
                            >
                              {typeof score === 'number' ? score.toFixed(1) : '-'}
                            </span>
                          </td>
                        );
                      })}

                      {/* Average Score */}
                      <td className="py-2.5 px-3 text-center font-extrabold text-sm text-[#073B66] border-r border-slate-200 bg-sky-50/20">
                        {res ? res.averageScore.toFixed(1) : '-'}
                      </td>

                      {/* Level Badge according to Circular 43 */}
                      <td className="py-2.5 px-3 text-center border-r border-slate-200">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-block shadow-2xs ${
                            level === 'Tốt'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : level === 'Khá'
                              ? 'bg-sky-100 text-[#073B66] border border-sky-300'
                              : level === 'Đạt'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}
                        >
                          {level}
                        </span>
                      </td>

                      {/* Pedagogical History Remark */}
                      <td
                        onClick={() => handleOpenCommentModal(std)}
                        className="py-2 px-3 text-slate-700 italic cursor-pointer hover:bg-sky-100/40 transition-colors group"
                        title="Bấm để chọn từ ngân hàng nhận xét hoặc tự chỉnh sửa"
                      >
                        <div className="flex items-start justify-between gap-1.5">
                          <span className="line-clamp-2 text-[11px] leading-relaxed">
                            {currentComment}
                          </span>
                          <button className="text-slate-400 group-hover:text-[#0878C9] shrink-0 p-1 rounded-md hover:bg-white transition-colors no-print">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Regulation Info Modal */}
      <Modal
        isOpen={isRegulationInfoOpen}
        onClose={() => setIsRegulationInfoOpen(false)}
        title="Quy chế đánh giá môn Lịch sử theo Thông tư 43/2021/TT-BGDĐT"
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
            <h4 className="font-bold text-[#073B66] text-sm">
              1. Khung thời lượng môn Lịch sử GDTX cấp THPT (Khối 10, 11, 12):
            </h4>
            <p className="text-slate-700 leading-relaxed">
              Môn Lịch sử ở mỗi khối 10, 11, 12 đều có định mức <strong>52 tiết/năm</strong> (khoảng 26 tiết/học kỳ).
              Thuộc nhóm môn học có từ trên 35 tiết đến 70 tiết/năm học (Khoản 1 Điều 7 Thông tư 43/2021/TT-BGDĐT).
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <h4 className="font-bold text-[#073B66] text-sm">
              2. Số lượng đầu điểm kiểm tra trong mỗi học kỳ:
            </h4>
            <ul className="list-disc list-inside space-y-1 text-slate-700">
              <li>
                <strong>03 điểm Đánh giá thường xuyên (ĐĐGtx):</strong> Kiểm tra miệng, viết 15 phút, bài tập, thuyết trình, sơ đồ tư duy hoặc sản phẩm học tập lịch sử (Hệ số 1).
              </li>
              <li>
                <strong>01 điểm Đánh giá giữa kỳ (ĐĐGgk):</strong> Kiểm tra viết tự luận hoặc trắc nghiệm kết hợp tự luận (Hệ số 2).
              </li>
              <li>
                <strong>01 điểm Đánh giá cuối kỳ (ĐĐGck):</strong> Kiểm tra học kỳ đánh giá tổng hợp kiến thức kỹ năng (Hệ số 3).
              </li>
            </ul>
          </div>

          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
            <h4 className="font-bold text-emerald-800 text-sm">
              3. Công thức tính Điểm trung bình môn học kỳ (ĐTBmhk):
            </h4>
            <code className="block bg-white p-2.5 rounded-lg border border-emerald-300 font-mono text-emerald-900 font-bold text-xs text-center">
              ĐTBmhk = (ĐĐGtx1 + ĐĐGtx2 + ĐĐGtx3 + 2×ĐĐGgk + 3×ĐĐGck) / 8
            </code>
            <p className="text-slate-600 text-[11px]">
              Điểm trung bình cả năm (ĐTBmcn) = (ĐTBmhk1 + 2×ĐTBmhk2) / 3. Làm tròn đến chữ số thập phân thứ nhất.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <h4 className="font-bold text-[#073B66] text-sm">
              4. Đánh giá kết quả học tập môn học theo 4 mức (Điều 9 & Điều 12):
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 bg-emerald-100/60 rounded-lg border border-emerald-300">
                <span className="font-bold text-emerald-800 block mb-1">Mức Tốt:</span>
                ĐTBm đạt từ <strong>8.0 trở lên</strong> và các bài kiểm tra định kỳ (giữa kỳ, cuối kỳ) đều đạt từ <strong>6.5 trở lên</strong>.
              </div>
              <div className="p-2.5 bg-sky-100/60 rounded-lg border border-sky-300">
                <span className="font-bold text-sky-800 block mb-1">Mức Khá:</span>
                ĐTBm đạt từ <strong>6.5 trở lên</strong> và các bài kiểm tra định kỳ đều đạt từ <strong>5.0 trở lên</strong>.
              </div>
              <div className="p-2.5 bg-amber-100/60 rounded-lg border border-amber-300">
                <span className="font-bold text-amber-800 block mb-1">Mức Đạt:</span>
                ĐTBm đạt từ <strong>5.0 trở lên</strong> và các bài kiểm tra định kỳ đạt từ <strong>3.5 trở lên</strong>.
              </div>
              <div className="p-2.5 bg-rose-100/60 rounded-lg border border-rose-300">
                <span className="font-bold text-rose-800 block mb-1">Mức Chưa đạt:</span>
                ĐTBm <strong>dưới 5.0</strong> hoặc không đáp ứng các tiêu chuẩn của mức Đạt.
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              onClick={() => setIsRegulationInfoOpen(false)}
              className="px-4 py-2 bg-[#073B66] hover:bg-[#0878C9] text-white rounded-xl font-bold cursor-pointer transition-colors"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal: Select & Edit Pedagogical History Comment */}
      <Modal
        isOpen={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
        title="Nhận xét sư phạm môn Lịch sử (Thông tư 43/2021/TT-BGDĐT)"
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs">
          {/* Student Profile Overview */}
          <div className="p-3 bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl border border-sky-200 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-slate-500">Học viên:</div>
              <div className="text-sm font-bold text-[#073B66]">
                {commentingStudent?.fullName} ({commentingStudent?.code}) - Lớp {activeClass?.name}
              </div>
            </div>
            <div className="text-right">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold inline-block shadow-2xs ${
                  currentStudentLevel === 'Tốt'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : currentStudentLevel === 'Khá'
                    ? 'bg-sky-100 text-[#073B66] border border-sky-300'
                    : currentStudentLevel === 'Đạt'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}
              >
                Mức {currentStudentLevel}
              </span>
            </div>
          </div>

          {/* Comment suggestions from Bank */}
          <div>
            <label className="block text-slate-700 font-bold mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#0878C9]" />
              Chọn nhanh nhận xét từ ngân hàng sư phạm môn Sử (Mức {currentStudentLevel}):
            </label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {TT43_COMMENTS_BANK[currentStudentLevel]?.map((comment, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveCommentText(comment)}
                  className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                    activeCommentText === comment
                      ? 'bg-sky-50 border-[#0878C9] text-[#073B66] font-semibold'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] shrink-0 font-bold">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{comment}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Editable Textarea */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Nội dung nhận xét sẽ lưu vào sổ điểm:
            </label>
            <textarea
              rows={3}
              value={activeCommentText}
              onChange={(e) => setActiveCommentText(e.target.value)}
              placeholder="Nhập lời nhận xét hoặc chọn một câu từ ngân hàng bên trên..."
              className="w-full p-3 font-serif border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0878C9] text-xs leading-relaxed"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCommentModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer transition-colors"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSaveComment}
              className="px-5 py-2 bg-[#0878C9] hover:bg-[#073B66] text-white rounded-xl font-bold cursor-pointer shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              Lưu nhận xét
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal: Create Exam */}
      <Modal
        isOpen={isAddExamOpen}
        onClose={() => setIsAddExamOpen(false)}
        title="Tạo bài kiểm tra môn Lịch sử mới"
        maxWidth="md"
      >
        <form onSubmit={handleSaveExam} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Tên bài kiểm tra (*)</label>
            <input
              type="text"
              required
              placeholder="Ví dụ: Kiểm tra 15 phút - Bài 14: Kháng chiến chống Mỹ"
              value={examFormData.title}
              onChange={(e) => setExamFormData({ ...examFormData, title: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0878C9]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Quy chuẩn theo TT 43</label>
              <select
                value={examFormData.tt43Category}
                onChange={(e) => {
                  const cat = e.target.value as any;
                  let weight = 1;
                  let type: any = '15 phút';
                  if (cat === 'GK') {
                    weight = 2;
                    type = 'Giữa kỳ';
                  } else if (cat === 'CK') {
                    weight = 3;
                    type = 'Cuối kỳ';
                  }
                  setExamFormData({
                    ...examFormData,
                    tt43Category: cat,
                    weight,
                    type,
                  });
                }}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0878C9]"
              >
                <option value="TX1">ĐĐGtx 1 (Thường xuyên - Hệ số 1)</option>
                <option value="TX2">ĐĐGtx 2 (Thường xuyên - Hệ số 1)</option>
                <option value="TX3">ĐĐGtx 3 (Thường xuyên - Hệ số 1)</option>
                <option value="GK">ĐĐGgk (Giữa kỳ - Hệ số 2)</option>
                <option value="CK">ĐĐGck (Cuối kỳ - Hệ số 3)</option>
                <option value="OTHER">Bài kiểm tra bổ trợ khác</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Học kỳ</label>
              <select
                value={examFormData.semester}
                onChange={(e) => setExamFormData({ ...examFormData, semester: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0878C9]"
              >
                <option value="HK1">Học kỳ I</option>
                <option value="HK2">Học kỳ II</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Hình thức</label>
              <select
                value={examFormData.format}
                onChange={(e) => setExamFormData({ ...examFormData, format: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0878C9]"
              >
                <option value="Trắc nghiệm">Trắc nghiệm</option>
                <option value="Tự luận">Tự luận</option>
                <option value="Kết hợp">Kết hợp (Trắc nghiệm + Tự luận)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Hệ số tính điểm</label>
              <input
                type="number"
                min={1}
                max={3}
                value={examFormData.weight}
                onChange={(e) => setExamFormData({ ...examFormData, weight: parseInt(e.target.value, 10) || 1 })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0878C9]"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Ngày kiểm tra</label>
            <input
              type="date"
              value={examFormData.date}
              onChange={(e) => setExamFormData({ ...examFormData, date: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0878C9]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddExamOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#0878C9] hover:bg-[#073B66] text-white rounded-xl font-bold cursor-pointer transition-colors"
            >
              Tạo cột điểm
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Single Score Edit */}
      <Modal
        isOpen={isEditScoreModalOpen}
        onClose={() => setIsEditScoreModalOpen(false)}
        title="Cập nhật điểm kiểm tra học sinh"
        maxWidth="sm"
      >
        <form onSubmit={handleSaveScoreEdit} className="space-y-4 text-xs">
          <div className="p-3 bg-sky-50 rounded-xl border border-sky-100">
            <div className="text-slate-500">Học sinh:</div>
            <div className="text-sm font-bold text-[#073B66] mt-0.5">
              {editingStudent?.fullName} ({editingStudent?.code})
            </div>
            <div className="text-xs text-slate-600 mt-1">
              Bài kiểm tra: {editingExam?.title} (Hệ số {editingExam?.weight})
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Điểm số mới (Thang điểm 0 - 10) (*):
            </label>
            <input
              type="number"
              required
              min={0}
              max={10}
              step={0.1}
              value={editingScoreVal}
              onChange={(e) => setEditingScoreVal(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 text-lg font-bold text-[#073B66] border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0878C9]"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Lý do chỉnh sửa điểm:
            </label>
            <input
              type="text"
              required
              value={editReason}
              onChange={(e) => setEditReason(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0878C9]"
            />
          </div>

          <div className="p-2.5 bg-amber-50 text-amber-800 rounded-lg text-[11px] border border-amber-200">
            Điểm số sau khi cập nhật sẽ được lưu vết lịch sử và tự động tính lại Điểm TB môn cùng Mức đánh giá theo Thông tư 43.
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditScoreModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer transition-colors"
            >
              Xác nhận lưu điểm
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Modal: Delete Exam Column */}
      <Modal
        isOpen={isDeleteExamConfirmOpen}
        onClose={() => setIsDeleteExamConfirmOpen(false)}
        title="Xác nhận xóa bài kiểm tra"
        maxWidth="sm"
      >
        <div className="space-y-4 text-xs">
          <div className="flex items-center gap-3 text-rose-600">
            <AlertTriangle className="w-8 h-8 shrink-0" />
            <p className="text-slate-700">
              Bạn có chắc chắn muốn xóa bài kiểm tra <strong>"{examToDelete?.title}"</strong>? Toàn bộ điểm số của học sinh trong cột này sẽ bị gỡ bỏ khỏi sổ điểm.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              onClick={() => setIsDeleteExamConfirmOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold cursor-pointer"
            >
              Hủy
            </button>
            <button
              onClick={() => {
                if (examToDelete) {
                  deleteExam(examToDelete.id);
                  setIsDeleteExamConfirmOpen(false);
                  setExamToDelete(null);
                  showNotification(`Đã xóa cột điểm "${examToDelete.title}"`);
                }
              }}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold cursor-pointer"
            >
              Xóa cột điểm
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
