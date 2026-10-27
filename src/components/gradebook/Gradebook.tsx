import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Exam, Student } from '../../types';
import { Modal } from '../common/Modal';
import {
  ClipboardList,
  Plus,
  Printer,
  FileDown,
  Edit2,
  Trash2,
  CheckCircle,
  AlertTriangle,
  History,
  TrendingUp,
  BarChart,
  Save,
} from 'lucide-react';

export const Gradebook: React.FC = () => {
  const {
    students,
    classes,
    exams,
    addExam,
    updateExam,
    deleteExam,
    updateStudentScore,
    batchUpdateScores,
  } = useApp();

  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [selectedExamId, setSelectedExamId] = useState<string>('all');

  // Modals
  const [isAddExamOpen, setIsAddExamOpen] = useState(false);
  const [isEditScoreModalOpen, setIsEditScoreModalOpen] = useState(false);
  const [isDeleteExamConfirmOpen, setIsDeleteExamConfirmOpen] = useState(false);
  const [examToDelete, setExamToDelete] = useState<Exam | null>(null);

  // Score edit state
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [editingScoreVal, setEditingScoreVal] = useState<number>(0);
  const [editReason, setEditReason] = useState<string>('Chấm lại bài tự luận');

  // Batch input mode
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [batchExamId, setBatchExamId] = useState<string>('');
  const [batchScores, setBatchScores] = useState<Record<string, number>>({});
  const [batchSuccessMsg, setBatchSuccessMsg] = useState('');

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
    description: '',
  });

  const activeClass = classes.find((c) => c.id === selectedClassId) || classes[0];

  const classStudents = useMemo(() => {
    return students.filter(
      (s) => s.classId === activeClass?.id || s.className === activeClass?.code
    );
  }, [students, activeClass]);

  const classExams = useMemo(() => {
    return exams.filter(
      (e) => e.classId === activeClass?.id || e.className === activeClass?.code
    );
  }, [exams, activeClass]);

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
      description: 'Đánh giá kiến thức bài học theo chuẩn GDPT 2018',
    });
    setIsAddExamOpen(true);
  };

  const handleSaveExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examFormData.title) return;
    addExam(examFormData);
    setIsAddExamOpen(false);
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
    setBatchSuccessMsg('');
  };

  const handleSaveBatchScores = () => {
    // Validate all scores between 0 and 10
    for (const [id, val] of Object.entries(batchScores)) {
      if (val < 0 || val > 10) {
        alert('Có điểm không hợp lệ (ngoài khoảng 0 - 10). Vui lòng kiểm tra lại!');
        return;
      }
    }
    batchUpdateScores(batchExamId, batchScores);
    setBatchSuccessMsg('Đã lưu thành công điểm số cho toàn bộ lớp!');
    setTimeout(() => setBatchSuccessMsg(''), 3000);
    setIsBatchMode(false);
  };

  // Print gradebook
  const handlePrint = () => {
    window.print();
  };

  // Export CSV Gradebook
  const handleExportCSV = () => {
    if (!activeClass) return;
    const examHeaders = classExams.map((e) => `"${e.title} (HS ${e.weight})"`);
    const headers = ['STT', 'Mã học sinh', 'Họ và tên', ...examHeaders, 'Điểm TB', 'Xếp loại', 'Nhận xét'];

    const rows = classStudents.map((s, idx) => {
      const studentExamScores = classExams.map((e) => s.scores[e.id] ?? '-');
      return [
        idx + 1,
        s.code,
        `"${s.fullName}"`,
        ...studentExamScores,
        s.averageScore || '0',
        s.rank || 'Trung bình',
        `"${s.notes || '-'}"`,
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [
        `SỔ ĐIỂM ĐIỆN TỬ MÔN LỊCH SỬ - LỚP ${activeClass.name}`,
        `Giáo viên: Cao Thị Thu | Đơn vị: Trung tâm GDNN - GDTX TP Quảng Ninh - Phân hiệu Tiên Yên`,
        '',
        headers.join(','),
        ...rows.map((r) => r.join(',')),
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `So_diem_${activeClass.code}_LichSu.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#073B66] font-serif flex items-center gap-2.5">
            <ClipboardList className="w-6 h-6 text-[#0878C9]" />
            Sổ điểm điện tử môn Lịch sử
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Quản lý điểm số, kiểm tra định kỳ và đánh giá thường xuyên theo quy định Bộ GD&ĐT & GDTX
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleOpenAddExam}
            className="px-3.5 py-2 bg-[#0878C9] hover:bg-[#073B66] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Tạo bài kiểm tra mới
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileDown className="w-4 h-4 text-emerald-600" />
            Xuất bảng điểm
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#073B66]" />
            In sổ điểm
          </button>
        </div>
      </div>

      {/* Filter and Class selector */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-600 font-bold">Chọn lớp học:</span>
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {classes.map((cls) => (
              <button
                key={cls.id}
                onClick={() => {
                  setSelectedClassId(cls.id);
                  setIsBatchMode(false);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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

        {classExams.length > 0 && !isBatchMode && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Nhập điểm nhanh cho bài:</span>
            <select
              value={batchExamId || classExams[0]?.id}
              onChange={(e) => startBatchScoring(e.target.value)}
              className="px-3 py-1.5 bg-sky-50 text-[#073B66] border border-sky-200 rounded-xl text-xs font-bold outline-none cursor-pointer"
            >
              <option value="">-- Chọn bài kiểm tra để nhập --</option>
              {classExams.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.title} (HS {ex.weight})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {batchSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          {batchSuccessMsg}
        </div>
      )}

      {/* Gradebook Print Header (only visible when printing) */}
      <div className="hidden print-only mb-6 text-center space-y-1">
        <h1 className="text-xl font-bold uppercase font-serif text-black">
          TRUNG TÂM GDNN – GDTX THÀNH PHỐ QUẢNG NINH - PHÂN HIỆU TIÊN YÊN
        </h1>
        <h2 className="text-lg font-bold font-serif text-black">
          SỔ ĐIỂM ĐIỆN TỬ MÔN LỊCH SỬ - LỚP {activeClass?.name}
        </h2>
        <p className="text-xs text-slate-600">
          Giáo viên giảng dạy: Cô Cao Thị Thu | Năm học: {activeClass?.academicYear}
        </p>
      </div>

      {/* Main Gradebook Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        {/* Table Title Bar */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-[#073B66] text-sm font-serif">
              Bảng điểm tổng hợp lớp {activeClass?.code} ({classStudents.length} học viên)
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">
              (Thang điểm: 0.0 - 10.0 | Hệ số theo Thông tư 22/2021)
            </span>
          </div>

          {isBatchMode && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-700 animate-pulse">
                Đang ở chế độ nhập điểm hàng loạt
              </span>
              <button
                onClick={handleSaveBatchScores}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                Lưu tất cả điểm
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

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#073B66] text-white font-semibold">
                <th className="py-3 px-3 text-center w-10">STT</th>
                <th className="py-3 px-3 w-24">Mã HS</th>
                <th className="py-3 px-3 min-w-[150px]">Họ và tên</th>

                {/* Exam Columns */}
                {classExams.map((ex) => (
                  <th key={ex.id} className="py-2 px-2 text-center min-w-[90px] border-l border-[#085a96]/40">
                    <div className="flex flex-col items-center">
                      <span className="font-bold truncate max-w-[110px]" title={ex.title}>
                        {ex.title}
                      </span>
                      <span className="text-[10px] text-cyan-200 mt-0.5">
                        {ex.type} (HS {ex.weight})
                      </span>
                      <div className="flex items-center gap-1 mt-1 no-print">
                        <button
                          onClick={() => {
                            setExamToDelete(ex);
                            setIsDeleteExamConfirmOpen(true);
                          }}
                          className="text-white/60 hover:text-rose-300"
                          title="Xóa cột điểm này"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </th>
                ))}

                <th className="py-3 px-3 text-center w-20 border-l border-[#085a96]/40">Điểm TB</th>
                <th className="py-3 px-3 text-center w-24">Xếp loại</th>
                <th className="py-3 px-3 min-w-[130px]">Nhận xét sư phạm</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classStudents.length === 0 ? (
                <tr>
                  <td colSpan={5 + classExams.length} className="py-12 text-center text-slate-400">
                    Chưa có học sinh trong lớp này. Vui lòng thêm học sinh ở phân hệ Quản lý học sinh.
                  </td>
                </tr>
              ) : (
                classStudents.map((std, idx) => {
                  return (
                    <tr key={std.id} className="hover:bg-sky-50/40 transition-colors">
                      <td className="py-2.5 px-3 text-center font-bold text-slate-500">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-[#073B66]">{std.code}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-800">{std.fullName}</td>

                      {/* Score cells */}
                      {classExams.map((ex) => {
                        const score = std.scores[ex.id];
                        const isBeingBatchEdited = isBatchMode && batchExamId === ex.id;

                        if (isBeingBatchEdited) {
                          return (
                            <td key={ex.id} className="py-1.5 px-2 text-center border-l border-slate-100 bg-amber-50/50">
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
                                className="w-14 px-1.5 py-1 text-center font-bold text-[#073B66] bg-white border border-amber-300 rounded-md outline-none focus:ring-2 focus:ring-[#0878C9]"
                              />
                            </td>
                          );
                        }

                        return (
                          <td
                            key={ex.id}
                            onClick={() => handleOpenScoreEdit(std, ex)}
                            className="py-2.5 px-2 text-center border-l border-slate-100 cursor-pointer hover:bg-sky-100/60 transition-colors group"
                            title="Nhấp để sửa điểm và lưu lịch sử"
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

                      {/* Average */}
                      <td className="py-2.5 px-3 text-center font-extrabold text-sm text-[#073B66] border-l border-slate-200">
                        {std.averageScore ? std.averageScore.toFixed(1) : '-'}
                      </td>

                      {/* Rank */}
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            std.rank === 'Giỏi'
                              ? 'bg-emerald-100 text-emerald-700'
                              : std.rank === 'Khá'
                              ? 'bg-sky-100 text-[#073B66]'
                              : std.rank === 'Trung bình'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {std.rank || 'Trung bình'}
                        </span>
                      </td>

                      {/* Notes */}
                      <td className="py-2.5 px-3 text-slate-600 italic">
                        {std.notes || 'Học lực ổn định'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Exam */}
      <Modal
        isOpen={isAddExamOpen}
        onClose={() => setIsAddExamOpen(false)}
        title="Tạo cột điểm / Bài kiểm tra mới"
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
              <label className="block text-slate-700 font-bold mb-1">Loại kiểm tra</label>
              <select
                value={examFormData.type}
                onChange={(e) => {
                  const type = e.target.value as any;
                  let weight = 1;
                  if (type === '1 tiết (45 phút)' || type === 'Giữa kỳ') weight = 2;
                  if (type === 'Cuối kỳ') weight = 3;
                  setExamFormData({ ...examFormData, type, weight });
                }}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0878C9]"
              >
                <option value="15 phút">15 phút (Đánh giá thường xuyên)</option>
                <option value="1 tiết (45 phút)">1 tiết (45 phút)</option>
                <option value="Giữa kỳ">Kiểm tra Giữa kỳ</option>
                <option value="Cuối kỳ">Kiểm tra Cuối kỳ</option>
              </select>
            </div>

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
          </div>

          <div className="grid grid-cols-2 gap-3">
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

            <div>
              <label className="block text-slate-700 font-bold mb-1">Ngày kiểm tra</label>
              <input
                type="date"
                value={examFormData.date}
                onChange={(e) => setExamFormData({ ...examFormData, date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0878C9]"
              />
            </div>
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

      {/* Modal: Single Score Edit with Confirmation & Reason */}
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
            <div className="text-xs text-slate-600 mt-1">Bài kiểm tra: {editingExam?.title}</div>
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
              Lý do chỉnh sửa điểm (Lưu vết kiểm toán sư phạm):
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
            Mọi thay đổi điểm số sẽ được tự động lưu vết lịch sử theo quy chế sổ điểm điện tử.
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
