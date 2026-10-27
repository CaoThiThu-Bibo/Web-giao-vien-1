import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  BookOpen,
  BarChart2,
  AlertCircle,
  Sun,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  UserPlus,
  Edit3,
  FileText,
  PieChart,
  FolderOpen,
  Gamepad2,
  CalendarCheck2,
  Sparkles,
  ClipboardCheck,
  CheckCircle2,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const {
    students,
    exams,
    classes,
    supportItems,
    schedule,
    notifications,
    setActiveTab,
    setViewingStudentId,
  } = useApp();

  const [currentWeek] = useState('Tuần 24 (10/03 - 16/03/2025)');

  // Dynamic calculations from actual data
  const totalStudents = students.length;
  const totalClasses = classes.length;
  const totalExams = exams.length;
  const needingSupportCount = supportItems.filter((s) => s.status !== 'Đã cải thiện').length;

  // Grade distributions
  const studentsWithAvg = students.filter((s) => typeof s.averageScore === 'number' && s.averageScore > 0);
  const classAvg = studentsWithAvg.length
    ? (studentsWithAvg.reduce((sum, s) => sum + (s.averageScore || 0), 0) / studentsWithAvg.length).toFixed(1)
    : '7.8';

  const countGioi = students.filter((s) => (s.averageScore || 0) >= 8.0).length;
  const countKha = students.filter((s) => (s.averageScore || 0) >= 6.5 && (s.averageScore || 0) < 8.0).length;
  const countTB = students.filter((s) => (s.averageScore || 0) >= 5.0 && (s.averageScore || 0) < 6.5).length;
  const countYeu = students.filter((s) => (s.averageScore || 0) < 5.0).length;

  const pctGioi = totalStudents ? Math.round((countGioi / totalStudents) * 100) : 25;
  const pctKha = totalStudents ? Math.round((countKha / totalStudents) * 100) : 42;
  const pctTB = totalStudents ? Math.round((countTB / totalStudents) * 100) : 23;
  const pctYeu = totalStudents ? Math.round((countYeu / totalStudents) * 100) : 10;

  // Featured top students
  const topStudents = [...students]
    .sort((a, b) => (b.averageScore || 0) - (a.averageScore || 0))
    .slice(0, 5);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* 1. Welcome Greeting Banner */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200 flex items-center gap-4 relative overflow-hidden">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
          <Sun className="w-7 h-7 text-amber-500 animate-pulse" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#073B66] font-serif tracking-tight">
            Xin chào cô Cao Thị Thu!
          </h2>
          <p className="text-sm text-slate-600 mt-0.5">
            Chào mừng cô đến với hệ thống Sử Học Số. Chúc cô có một ngày giảng dạy hiệu quả!
          </p>
        </div>
      </div>

      {/* 2. Four Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tổng số học sinh */}
        <div
          onClick={() => setActiveTab('students')}
          className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 hover:border-[#0878C9] hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
        >
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Tổng số học sinh
            </div>
            <div className="text-3xl font-extrabold text-[#073B66] mt-1 font-serif">
              {totalStudents}
            </div>
            <div className="text-xs text-slate-500 mt-1 font-medium">({totalClasses} lớp)</div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-sky-100 flex items-center justify-center text-[#0878C9]">
            <Users className="w-7 h-7" />
          </div>
        </div>

        {/* Card 2: Bài kiểm tra đã nhập */}
        <div
          onClick={() => setActiveTab('gradebook')}
          className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
        >
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Bài kiểm tra đã nhập
            </div>
            <div className="text-3xl font-extrabold text-[#073B66] mt-1 font-serif">
              {totalExams}
            </div>
            <div className="text-xs text-emerald-600 mt-1 font-medium">(trong học kỳ này)</div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
            <BookOpen className="w-7 h-7" />
          </div>
        </div>

        {/* Card 3: Kết quả học tập */}
        <div
          onClick={() => setActiveTab('reports')}
          className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 hover:border-amber-500 hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
        >
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Kết quả học tập
            </div>
            <div className="text-2xl font-extrabold text-[#073B66] mt-1 font-serif">
              TB lớp: {classAvg}
            </div>
            <div className="text-xs text-amber-600 mt-1 font-medium">(Tăng 0.3 so với kỳ trước)</div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600">
            <BarChart2 className="w-7 h-7" />
          </div>
        </div>

        {/* Card 4: Việc cần xử lý */}
        <div
          onClick={() => setActiveTab('student-support')}
          className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 hover:border-purple-500 hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
        >
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Việc cần xử lý
            </div>
            <div className="text-3xl font-extrabold text-[#073B66] mt-1 font-serif">
              {needingSupportCount}
            </div>
            <div className="text-xs text-purple-600 mt-1 font-medium">(Học sinh cần hỗ trợ)</div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600">
            <AlertCircle className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* 3. Middle Grid: Charts & Weekly Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Bar Chart (7 cols on lg) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 shadow-xs border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-[#073B66] text-base flex items-center gap-2 font-serif">
              <BarChart2 className="w-5 h-5 text-[#0878C9]" />
              Thống kê kết quả học tập môn Lịch sử
            </h3>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-48 w-full flex items-end justify-around pt-6 pb-2 px-2 border-b border-slate-200">
            {/* Giỏi */}
            <div className="flex flex-col items-center gap-1.5 w-1/5 group">
              <span className="text-xs font-bold text-[#0878C9]">{countGioi}</span>
              <div
                style={{ height: `${Math.min(100, Math.max(15, (countGioi / 20) * 120))}px` }}
                className="w-full max-w-[40px] bg-[#0878C9] rounded-t-md transition-all duration-300 group-hover:brightness-110 shadow-xs"
              />
              <span className="text-xs font-medium text-slate-600 mt-1">Giỏi</span>
            </div>

            {/* Khá */}
            <div className="flex flex-col items-center gap-1.5 w-1/5 group">
              <span className="text-xs font-bold text-emerald-600">{countKha}</span>
              <div
                style={{ height: `${Math.min(100, Math.max(15, (countKha / 20) * 120))}px` }}
                className="w-full max-w-[40px] bg-emerald-500 rounded-t-md transition-all duration-300 group-hover:brightness-110 shadow-xs"
              />
              <span className="text-xs font-medium text-slate-600 mt-1">Khá</span>
            </div>

            {/* Trung bình */}
            <div className="flex flex-col items-center gap-1.5 w-1/5 group">
              <span className="text-xs font-bold text-amber-600">{countTB}</span>
              <div
                style={{ height: `${Math.min(100, Math.max(15, (countTB / 20) * 120))}px` }}
                className="w-full max-w-[40px] bg-amber-500 rounded-t-md transition-all duration-300 group-hover:brightness-110 shadow-xs"
              />
              <span className="text-xs font-medium text-slate-600 mt-1 text-center truncate">Trung bình</span>
            </div>

            {/* Yếu */}
            <div className="flex flex-col items-center gap-1.5 w-1/5 group">
              <span className="text-xs font-bold text-rose-600">{countYeu}</span>
              <div
                style={{ height: `${Math.min(100, Math.max(15, (countYeu / 20) * 120))}px` }}
                className="w-full max-w-[40px] bg-rose-500 rounded-t-md transition-all duration-300 group-hover:brightness-110 shadow-xs"
              />
              <span className="text-xs font-medium text-slate-600 mt-1">Yếu</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 mt-3 px-1">
            <span>Thang phân loại GDPT 2018</span>
            <span className="font-semibold text-[#073B66]">Tổng: {totalStudents} HS</span>
          </div>
        </div>

        {/* Center: Donut Chart of Average Score Ratio (4 cols on lg) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 shadow-xs border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-[#073B66] text-base font-serif">Tỷ lệ điểm trung bình</h3>
            <button
              onClick={() => setActiveTab('reports')}
              className="text-xs text-[#0878C9] hover:underline flex items-center gap-1 font-medium cursor-pointer"
            >
              Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 my-auto py-2">
            {/* SVG Donut */}
            <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="15.9155"
                  fill="transparent"
                  stroke="#e2e8f0"
                  strokeWidth="3.8"
                />
                {/* Giỏi: 25% */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.9155"
                  fill="transparent"
                  stroke="#0878C9"
                  strokeWidth="3.8"
                  strokeDasharray={`${pctGioi} ${100 - pctGioi}`}
                  strokeDashoffset="0"
                />
                {/* Khá: 42% */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.9155"
                  fill="transparent"
                  stroke="#10b981"
                  strokeWidth="3.8"
                  strokeDasharray={`${pctKha} ${100 - pctKha}`}
                  strokeDashoffset={`${-pctGioi}`}
                />
                {/* Trung bình: 23% */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.9155"
                  fill="transparent"
                  stroke="#f59e0b"
                  strokeWidth="3.8"
                  strokeDasharray={`${pctTB} ${100 - pctTB}`}
                  strokeDashoffset={`${-(pctGioi + pctKha)}`}
                />
                {/* Yếu: 10% */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.9155"
                  fill="transparent"
                  stroke="#ef4444"
                  strokeWidth="3.8"
                  strokeDasharray={`${pctYeu} ${100 - pctYeu}`}
                  strokeDashoffset={`${-(pctGioi + pctKha + pctTB)}`}
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-[#073B66] font-serif leading-none">
                  {classAvg}
                </span>
                <span className="text-[11px] text-slate-500 font-medium mt-0.5">Điểm TB</span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0878C9]" />
                  <span className="text-slate-700">Giỏi (8-10)</span>
                </div>
                <span className="font-bold text-[#073B66]">{pctGioi}%</span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-slate-700">Khá (6,5-7,9)</span>
                </div>
                <span className="font-bold text-emerald-600">{pctKha}%</span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-slate-700">Trung bình (5-6,4)</span>
                </div>
                <span className="font-bold text-amber-600">{pctTB}%</span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="text-slate-700">Yếu (dưới 5)</span>
                </div>
                <span className="font-bold text-rose-600">{pctYeu}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Schedule & Notifications (4 cols on lg) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Lịch giảng dạy tuần này */}
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="font-bold text-[#073B66] text-sm flex items-center gap-1.5 font-serif">
                <CalendarCheck2 className="w-4 h-4 text-[#0878C9]" />
                Lịch giảng dạy tuần này
              </h3>
              <div className="flex items-center gap-1 text-[11px] text-slate-600 font-medium">
                <ChevronLeft className="w-3.5 h-3.5 cursor-pointer text-slate-400 hover:text-slate-700" />
                <span className="truncate max-w-[140px]">{currentWeek}</span>
                <ChevronRight className="w-3.5 h-3.5 cursor-pointer text-slate-400 hover:text-slate-700" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/60 font-semibold">
                    <th className="py-1.5 px-2">Thứ</th>
                    <th className="py-1.5 px-2">Môn học</th>
                    <th className="py-1.5 px-2">Lớp</th>
                    <th className="py-1.5 px-2">Tiết</th>
                    <th className="py-1.5 px-2">Ghi chú</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {schedule.map((row) => (
                    <tr key={row.id} className="hover:bg-sky-50/40 transition-colors">
                      <td className="py-1.5 px-2 font-bold text-[#073B66]">{row.dayOfWeek}</td>
                      <td className="py-1.5 px-2 text-slate-700">{row.subject}</td>
                      <td className="py-1.5 px-2 font-bold text-[#0878C9]">{row.className}</td>
                      <td className="py-1.5 px-2 text-slate-600">{row.period}</td>
                      <td className="py-1.5 px-2 text-slate-500">
                        {row.note === '-' ? (
                          '-'
                        ) : (
                          <span className="px-1.5 py-0.5 rounded-sm bg-amber-50 text-amber-700 text-[10px] font-medium border border-amber-200">
                            {row.note}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Thông báo mới */}
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-[#073B66] text-sm flex items-center gap-1.5 font-serif">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                Thông báo mới
              </h3>
              <button
                onClick={() => setActiveTab('settings')}
                className="text-xs text-[#0878C9] hover:underline flex items-center gap-1 font-medium cursor-pointer"
              >
                Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {notifications.slice(0, 4).map((notif) => (
                <div key={notif.id} className="flex items-start justify-between gap-2 text-xs">
                  <div className="flex items-start gap-1.5">
                    <span className="text-[#0878C9] mt-0.5 font-bold">❖</span>
                    <span className="text-slate-700 hover:text-[#0878C9] transition-colors line-clamp-1">
                      {notif.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                    {notif.date}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Lower Middle: Chức năng nhanh & Danh sách học sinh tiêu biểu & Quote card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Chức năng nhanh (6 cols on lg) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 shadow-xs border border-slate-200">
          <h3 className="font-bold text-[#073B66] text-base mb-4 flex items-center gap-2 font-serif">
            <Sparkles className="w-5 h-5 text-[#0878C9]" />
            Chức năng nhanh
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* 1. Thêm học sinh */}
            <button
              onClick={() => setActiveTab('students')}
              className="p-3 rounded-xl bg-sky-50 hover:bg-sky-100/80 border border-sky-100 hover:border-sky-300 transition-all text-left flex flex-col justify-between group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-[#0878C9] text-white flex items-center justify-center mb-2 shadow-xs group-hover:scale-105 transition-transform">
                <UserPlus className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#073B66] leading-tight">Thêm học sinh</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Cập nhật danh sách lớp</div>
              </div>
            </button>

            {/* 2. Nhập bảng điểm */}
            <button
              onClick={() => setActiveTab('gradebook')}
              className="p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-100 hover:border-emerald-300 transition-all text-left flex flex-col justify-between group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center mb-2 shadow-xs group-hover:scale-105 transition-transform">
                <Edit3 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800 leading-tight">Nhập bảng điểm</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Cập nhật kết quả</div>
              </div>
            </button>

            {/* 3. Tạo đề kiểm tra */}
            <button
              onClick={() => setActiveTab('question-bank')}
              className="p-3 rounded-xl bg-purple-50 hover:bg-purple-100/80 border border-purple-100 hover:border-purple-300 transition-all text-left flex flex-col justify-between group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-purple-600 text-white flex items-center justify-center mb-2 shadow-xs group-hover:scale-105 transition-transform">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800 leading-tight">Tạo đề kiểm tra</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Trợ lý AI Lịch sử</div>
              </div>
            </button>

            {/* 4. Xem báo cáo */}
            <button
              onClick={() => setActiveTab('reports')}
              className="p-3 rounded-xl bg-amber-50 hover:bg-amber-100/80 border border-amber-100 hover:border-amber-300 transition-all text-left flex flex-col justify-between group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center mb-2 shadow-xs group-hover:scale-105 transition-transform">
                <PieChart className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800 leading-tight">Xem báo cáo</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Theo dõi tiến bộ</div>
              </div>
            </button>

            {/* 5. Tạo bài giảng */}
            <button
              onClick={() => setActiveTab('ai-assistant')}
              className="p-3 rounded-xl bg-blue-50 hover:bg-blue-100/80 border border-blue-100 hover:border-blue-300 transition-all text-left flex flex-col justify-between group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center mb-2 shadow-xs group-hover:scale-105 transition-transform">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800 leading-tight">Tạo bài giảng</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Tài liệu & giáo án</div>
              </div>
            </button>

            {/* 6. Học liệu số */}
            <button
              onClick={() => setActiveTab('materials')}
              className="p-3 rounded-xl bg-cyan-50 hover:bg-cyan-100/80 border border-cyan-100 hover:border-cyan-300 transition-all text-left flex flex-col justify-between group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-cyan-600 text-white flex items-center justify-center mb-2 shadow-xs group-hover:scale-105 transition-transform">
                <FolderOpen className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800 leading-tight">Học liệu số</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Tư liệu lịch sử</div>
              </div>
            </button>

            {/* 7. Bài tập trực tuyến */}
            <button
              onClick={() => setActiveTab('online-room')}
              className="p-3 rounded-xl bg-rose-50 hover:bg-rose-100/80 border border-rose-100 hover:border-rose-300 transition-all text-left flex flex-col justify-between group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-rose-500 text-white flex items-center justify-center mb-2 shadow-xs group-hover:scale-105 transition-transform">
                <Gamepad2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800 leading-tight">Bài tập trực tuyến</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Ôn tập, củng cố</div>
              </div>
            </button>

            {/* 8. Chuyên cần */}
            <button
              onClick={() => setActiveTab('attendance')}
              className="p-3 rounded-xl bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-100 hover:border-indigo-300 transition-all text-left flex flex-col justify-between group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center mb-2 shadow-xs group-hover:scale-105 transition-transform">
                <CalendarCheck2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800 leading-tight">Chuyên cần</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Điểm danh học sinh</div>
              </div>
            </button>
          </div>
        </div>

        {/* Danh sách học sinh tiêu biểu (4 cols on lg) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 shadow-xs border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-[#073B66] text-base flex items-center gap-1.5 font-serif">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Danh sách học sinh tiêu biểu
            </h3>
            <button
              onClick={() => setActiveTab('students')}
              className="text-xs text-[#0878C9] hover:underline flex items-center gap-1 font-medium cursor-pointer"
            >
              Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/60 font-semibold">
                  <th className="py-2 px-2 text-center">STT</th>
                  <th className="py-2 px-2">Họ và tên</th>
                  <th className="py-2 px-2 text-center">Lớp</th>
                  <th className="py-2 px-2 text-center">Điểm TB</th>
                  <th className="py-2 px-2 text-center">Xếp loại</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topStudents.map((std, idx) => (
                  <tr
                    key={std.id}
                    onClick={() => {
                      setViewingStudentId(std.id);
                      setActiveTab('students');
                    }}
                    className="hover:bg-sky-50/50 cursor-pointer transition-colors"
                  >
                    <td className="py-2 px-2 text-center font-bold text-slate-500">{idx + 1}</td>
                    <td className="py-2 px-2 font-bold text-[#073B66] hover:text-[#0878C9]">
                      {std.fullName}
                    </td>
                    <td className="py-2 px-2 text-center font-semibold text-[#0878C9]">
                      {std.className}
                    </td>
                    <td className="py-2 px-2 text-center font-extrabold text-slate-800">
                      {std.averageScore?.toFixed(1) || '9.0'}
                    </td>
                    <td className="py-2 px-2 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          std.rank === 'Giỏi'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-sky-100 text-[#073B66]'
                        }`}
                      >
                        {std.rank}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Landmark Quote card (3 cols on lg) */}
        <div className="lg:col-span-3 rounded-2xl overflow-hidden shadow-xs border border-slate-200 relative flex flex-col justify-end p-5 min-h-[220px] bg-slate-900 group">
          <img
            src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80"
            alt="Di tích lịch sử Việt Nam"
            className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
          <div className="relative text-white z-10">
            <p className="text-xs italic leading-relaxed text-slate-100 font-serif">
              “Lịch sử không chỉ là những sự kiện đã qua, mà là bài học cho hiện tại và tương lai.”
            </p>
            <div className="text-right text-[11px] text-cyan-200 font-serif font-bold mt-2">
              - Cao Thị Thu -
            </div>
          </div>
        </div>
      </div>

      {/* 5. Bottom Highlight Feature Cards (6 modules) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 pt-2">
        {/* Module 1: Quản lý học sinh */}
        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-200 hover:border-[#0878C9] hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Users className="w-4 h-4 text-[#0878C9]" />
              <h4 className="text-xs font-bold text-[#073B66] font-serif">Quản lý học sinh</h4>
            </div>
            <p className="text-[11px] text-slate-500 line-clamp-2">
              Danh sách, hồ sơ, điểm số, chuyên cần
            </p>
          </div>
          <button
            onClick={() => setActiveTab('students')}
            className="mt-3 w-full py-1.5 px-2 bg-[#073B66] hover:bg-[#0878C9] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
          >
            Truy cập ngay <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Module 2: Sổ điểm điện tử */}
        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-200 hover:border-[#0878C9] hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <ClipboardCheck className="w-4 h-4 text-emerald-600" />
              <h4 className="text-xs font-bold text-[#073B66] font-serif">Sổ điểm điện tử</h4>
            </div>
            <p className="text-[11px] text-slate-500 line-clamp-2">
              Nhập điểm, thống kê, xuất báo cáo
            </p>
          </div>
          <button
            onClick={() => setActiveTab('gradebook')}
            className="mt-3 w-full py-1.5 px-2 bg-[#073B66] hover:bg-[#0878C9] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
          >
            Truy cập ngay <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Module 3: Trợ lý AI soạn bài */}
        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-200 hover:border-[#0878C9] hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <h4 className="text-xs font-bold text-[#073B66] font-serif">Trợ lý AI soạn bài</h4>
            </div>
            <p className="text-[11px] text-slate-500 line-clamp-2">
              Giáo án, câu hỏi, ma trận đề, đề kiểm tra
            </p>
          </div>
          <button
            onClick={() => setActiveTab('ai-assistant')}
            className="mt-3 w-full py-1.5 px-2 bg-[#073B66] hover:bg-[#0878C9] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
          >
            Truy cập ngay <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Module 4: Học liệu - Tư liệu */}
        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-200 hover:border-[#0878C9] hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <BookOpen className="w-4 h-4 text-cyan-600" />
              <h4 className="text-xs font-bold text-[#073B66] font-serif">Học liệu - Tư liệu</h4>
            </div>
            <p className="text-[11px] text-slate-500 line-clamp-2">
              Bản đồ, hình ảnh, video, tài liệu lịch sử
            </p>
          </div>
          <button
            onClick={() => setActiveTab('materials')}
            className="mt-3 w-full py-1.5 px-2 bg-[#073B66] hover:bg-[#0878C9] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
          >
            Truy cập ngay <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Module 5: Phòng học trực tuyến */}
        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-200 hover:border-[#0878C9] hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Gamepad2 className="w-4 h-4 text-rose-500" />
              <h4 className="text-xs font-bold text-[#073B66] font-serif">Phòng học trực tuyến</h4>
            </div>
            <p className="text-[11px] text-slate-500 line-clamp-2">
              Bài tập, trắc nghiệm, chấm điểm tự động
            </p>
          </div>
          <button
            onClick={() => setActiveTab('online-room')}
            className="mt-3 w-full py-1.5 px-2 bg-[#073B66] hover:bg-[#0878C9] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
          >
            Truy cập ngay <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Module 6: Hỗ trợ học sinh */}
        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-200 hover:border-[#0878C9] hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <h4 className="text-xs font-bold text-[#073B66] font-serif">Hỗ trợ học sinh</h4>
            </div>
            <p className="text-[11px] text-slate-500 line-clamp-2">
              Theo dõi tiến bộ, tư vấn, đồng hành
            </p>
          </div>
          <button
            onClick={() => setActiveTab('student-support')}
            className="mt-3 w-full py-1.5 px-2 bg-[#073B66] hover:bg-[#0878C9] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
          >
            Truy cập ngay <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
