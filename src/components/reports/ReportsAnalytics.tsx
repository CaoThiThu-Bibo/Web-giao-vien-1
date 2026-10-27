import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Award,
  AlertCircle,
  Printer,
  FileDown,
  PieChart,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

export const ReportsAnalytics: React.FC = () => {
  const { students, classes, exams, supportItems } = useApp();

  const [selectedClassId, setSelectedClassId] = useState<string>('all');

  const filteredStudents = useMemo(() => {
    if (selectedClassId === 'all') return students;
    return students.filter(
      (s) => s.classId === selectedClassId || s.className === selectedClassId
    );
  }, [students, selectedClassId]);

  const totalCount = filteredStudents.length;

  const countGioi = filteredStudents.filter((s) => (s.averageScore || 0) >= 8.0).length;
  const countKha = filteredStudents.filter(
    (s) => (s.averageScore || 0) >= 6.5 && (s.averageScore || 0) < 8.0
  ).length;
  const countTB = filteredStudents.filter(
    (s) => (s.averageScore || 0) >= 5.0 && (s.averageScore || 0) < 6.5
  ).length;
  const countYeu = filteredStudents.filter((s) => (s.averageScore || 0) < 5.0).length;

  const pctGioi = totalCount ? Math.round((countGioi / totalCount) * 100) : 0;
  const pctKha = totalCount ? Math.round((countKha / totalCount) * 100) : 0;
  const pctTB = totalCount ? Math.round((countTB / totalCount) * 100) : 0;
  const pctYeu = totalCount ? Math.round((countYeu / totalCount) * 100) : 0;

  const studentsWithScore = filteredStudents.filter(
    (s) => typeof s.averageScore === 'number' && s.averageScore > 0
  );
  const avgScore = studentsWithScore.length
    ? (
        studentsWithScore.reduce((sum, s) => sum + (s.averageScore || 0), 0) /
        studentsWithScore.length
      ).toFixed(2)
    : '0';

  // Declining students identification
  const decliningStudents = useMemo(() => {
    return filteredStudents.filter((s) => (s.averageScore || 0) < 5.0 || s.status === 'Cần hỗ trợ');
  }, [filteredStudents]);

  // Comparison between classes
  const classComparison = useMemo(() => {
    return classes.map((c) => {
      const clsStudents = students.filter((s) => s.classId === c.id || s.className === c.code);
      const scored = clsStudents.filter((s) => typeof s.averageScore === 'number');
      const avg = scored.length
        ? (scored.reduce((sum, s) => sum + (s.averageScore || 0), 0) / scored.length).toFixed(1)
        : '0';
      const countG = clsStudents.filter((s) => (s.averageScore || 0) >= 8.0).length;
      const countY = clsStudents.filter((s) => (s.averageScore || 0) < 5.0).length;
      return {
        class: c,
        studentCount: clsStudents.length,
        avg: parseFloat(avg),
        countGioi: countG,
        countYeu: countY,
      };
    });
  }, [classes, students]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportSummaryCSV = () => {
    const headers = ['Lớp', 'Sĩ số', 'Điểm TB', 'Số HS Giỏi', 'Số HS Yếu'];
    const rows = classComparison.map((r) => [
      `"${r.class.name}"`,
      r.studentCount,
      r.avg,
      r.countGioi,
      r.countYeu,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [
        'BÁO CÁO THỐNG KÊ KẾT QUẢ HỌC TẬP MÔN LỊCH SỬ',
        'Trung tâm GDNN - GDTX TP Quảng Ninh - Phân hiệu Tiên Yên',
        `Giáo viên: Cao Thị Thu | Ngày lập: ${new Date().toLocaleDateString('vi-VN')}`,
        '',
        headers.join(','),
        ...rows.map((row) => row.join(',')),
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Bao_cao_LichSu_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#073B66] font-serif flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-[#0878C9]" />
            Báo cáo & Thống kê chất lượng dạy học
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Phân tích số liệu học tập môn Lịch sử phục vụ sinh hoạt chuyên môn Tổ KHXH
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportSummaryCSV}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileDown className="w-4 h-4 text-emerald-600" />
            Xuất file báo cáo
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-[#073B66] hover:bg-[#0878C9] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            In báo cáo chuyên môn
          </button>
        </div>
      </div>

      {/* Filter by class */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 flex items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600 font-bold">Phạm vi thống kê:</span>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#0878C9]"
          >
            <option value="all">Toàn bộ 5 lớp phụ trách ({students.length} học viên)</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name} ({cls.studentCount} HS)
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-500 font-serif italic">
          Niên khóa 2024 - 2025 | Học kỳ II
        </div>
      </div>

      {/* Print-only heading */}
      <div className="hidden print-only mb-6 text-center space-y-1">
        <h1 className="text-xl font-bold uppercase font-serif text-black">
          TRUNG TÂM GDNN – GDTX THÀNH PHỐ QUẢNG NINH - PHÂN HIỆU TIÊN YÊN
        </h1>
        <h2 className="text-lg font-bold font-serif text-black">
          BÁO CÁO THỐNG KÊ KẾT QUẢ HỌC TẬP MÔN LỊCH SỬ
        </h2>
        <p className="text-xs text-slate-600">
          Người lập báo cáo: Giáo viên Cao Thị Thu | Ngày: {new Date().toLocaleDateString('vi-VN')}
        </p>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 text-center">
          <div className="text-xs font-semibold text-slate-500 uppercase">Tổng số học viên</div>
          <div className="text-3xl font-extrabold text-[#073B66] font-serif mt-1">
            {totalCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">tham gia đánh giá</div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 text-center">
          <div className="text-xs font-semibold text-slate-500 uppercase">Điểm trung bình</div>
          <div className="text-3xl font-extrabold text-[#0878C9] font-serif mt-1">
            {avgScore}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-0.5 flex items-center justify-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 inline" /> +0.3 điểm so với đầu năm
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 text-center">
          <div className="text-xs font-semibold text-slate-500 uppercase">Tỷ lệ Khá - Giỏi</div>
          <div className="text-3xl font-extrabold text-emerald-600 font-serif mt-1">
            {pctGioi + pctKha}%
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">({countGioi + countKha} học sinh)</div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 text-center">
          <div className="text-xs font-semibold text-slate-500 uppercase">Cần hỗ trợ (Yếu)</div>
          <div className="text-3xl font-extrabold text-rose-600 font-serif mt-1">
            {countYeu}
          </div>
          <div className="text-[11px] text-rose-600 font-medium mt-0.5">
            {pctYeu}% tổng số học sinh
          </div>
        </div>
      </div>

      {/* Charts & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Score Distribution Details */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-5 shadow-xs border border-slate-200 space-y-4">
          <h3 className="font-bold text-[#073B66] text-sm flex items-center gap-2 font-serif">
            <PieChart className="w-4 h-4 text-[#0878C9]" />
            Phân bố học lực môn Lịch sử theo mức điểm
          </h3>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-bold text-[#0878C9]">Giỏi (8.0 - 10.0 điểm)</span>
                <span className="font-bold text-[#0878C9]">
                  {countGioi} HS ({pctGioi}%)
                </span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  style={{ width: `${pctGioi}%` }}
                  className="h-full bg-[#0878C9] rounded-full transition-all duration-500"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-bold text-emerald-600">Khá (6.5 - 7.9 điểm)</span>
                <span className="font-bold text-emerald-600">
                  {countKha} HS ({pctKha}%)
                </span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  style={{ width: `${pctKha}%` }}
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-bold text-amber-600">Trung bình (5.0 - 6.4 điểm)</span>
                <span className="font-bold text-amber-600">
                  {countTB} HS ({pctTB}%)
                </span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  style={{ width: `${pctTB}%` }}
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-bold text-rose-600">Yếu (Dưới 5.0 điểm)</span>
                <span className="font-bold text-rose-600">
                  {countYeu} HS ({pctYeu}%)
                </span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  style={{ width: `${pctYeu}%` }}
                  className="h-full bg-rose-500 rounded-full transition-all duration-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Class-by-Class Comparative Table */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-5 shadow-xs border border-slate-200 space-y-3">
          <h3 className="font-bold text-[#073B66] text-sm flex items-center gap-2 font-serif">
            <Award className="w-4 h-4 text-amber-500" />
            So sánh kết quả giữa các lớp phụ trách
          </h3>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="py-2.5 px-3">Lớp học</th>
                  <th className="py-2.5 px-2 text-center">Sĩ số</th>
                  <th className="py-2.5 px-2 text-center">Điểm TB</th>
                  <th className="py-2.5 px-2 text-center">HS Giỏi</th>
                  <th className="py-2.5 px-2 text-center">HS Yếu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classComparison.map((item) => (
                  <tr key={item.class.id} className="hover:bg-sky-50/40">
                    <td className="py-2 px-3 font-bold text-[#073B66]">{item.class.name}</td>
                    <td className="py-2 px-2 text-center font-medium">{item.studentCount}</td>
                    <td className="py-2 px-2 text-center font-extrabold text-[#0878C9]">
                      {item.avg.toFixed(1)}
                    </td>
                    <td className="py-2 px-2 text-center font-bold text-emerald-600">
                      {item.countGioi}
                    </td>
                    <td className="py-2 px-2 text-center font-bold text-rose-600">
                      {item.countYeu}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Declining / Support Needed Students */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 space-y-3">
        <h3 className="font-bold text-[#073B66] text-sm flex items-center gap-2 font-serif">
          <AlertCircle className="w-4 h-4 text-rose-500" />
          Danh sách học sinh có kết quả học tập cần lưu ý & bồi dưỡng
        </h3>

        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <th className="py-2.5 px-3">Mã HS</th>
                <th className="py-2.5 px-3">Họ và tên</th>
                <th className="py-2.5 px-3 text-center">Lớp</th>
                <th className="py-2.5 px-3 text-center">Điểm TB</th>
                <th className="py-2.5 px-3">Khó khăn ghi nhận</th>
                <th className="py-2.5 px-3">Đề xuất sư phạm</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {decliningStudents.map((std) => (
                <tr key={std.id} className="hover:bg-rose-50/30">
                  <td className="py-2.5 px-3 font-mono font-bold text-[#073B66]">{std.code}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">{std.fullName}</td>
                  <td className="py-2.5 px-3 text-center font-bold text-[#0878C9]">
                    {std.className}
                  </td>
                  <td className="py-2.5 px-3 text-center font-extrabold text-rose-600">
                    {std.averageScore ? std.averageScore.toFixed(1) : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {std.notes || 'Chưa nắm chắc mốc thời gian sự kiện lịch sử'}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-[#073B66]">
                    Phụ đạo 1 buổi/tuần, giao sơ đồ tư duy tóm tắt bài học
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
