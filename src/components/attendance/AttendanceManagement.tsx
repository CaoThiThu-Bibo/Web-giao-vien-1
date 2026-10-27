import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { AttendanceStatus } from '../../types';
import {
  CalendarCheck,
  Check,
  Clock,
  FileCheck,
  AlertOctagon,
  FileDown,
  Calendar,
  Save,
  CheckCircle2,
} from 'lucide-react';

export const AttendanceManagement: React.FC = () => {
  const { students, classes, attendanceRecords, batchMarkAttendance } = useApp();

  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [searchName, setSearchName] = useState('');
  const [sessionNotes, setSessionNotes] = useState<Record<string, string>>({});
  const [tempStatus, setTempStatus] = useState<Record<string, AttendanceStatus>>({});
  const [savedNotice, setSavedNotice] = useState(false);

  const activeClass = classes.find((c) => c.id === selectedClassId) || classes[0];

  const classStudents = useMemo(() => {
    return students.filter(
      (s) => s.classId === activeClass?.id || s.className === activeClass?.code
    );
  }, [students, activeClass]);

  // Current session statuses
  const studentStatuses = useMemo(() => {
    const map: Record<string, AttendanceStatus> = {};
    classStudents.forEach((std) => {
      // Check existing record in DB
      const existing = attendanceRecords.find(
        (r) => r.date === selectedDate && r.studentId === std.id
      );
      if (tempStatus[std.id] !== undefined) {
        map[std.id] = tempStatus[std.id];
      } else if (existing) {
        map[std.id] = existing.status;
      } else {
        map[std.id] = 'present'; // default present
      }
    });
    return map;
  }, [classStudents, attendanceRecords, selectedDate, tempStatus]);

  const setStatus = (studentId: string, status: AttendanceStatus) => {
    setTempStatus((prev) => ({ ...prev, [studentId]: status }));
  };

  const markAllPresent = () => {
    const updated: Record<string, AttendanceStatus> = {};
    classStudents.forEach((std) => {
      updated[std.id] = 'present';
    });
    setTempStatus(updated);
  };

  const handleSaveAttendance = () => {
    const records = classStudents.map((std) => ({
      date: selectedDate,
      classId: activeClass.id,
      studentId: std.id,
      studentName: std.fullName,
      status: studentStatuses[std.id] || 'present',
      note: sessionNotes[std.id] || '',
    }));

    batchMarkAttendance(records);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  // Export attendance report
  const handleExportCSV = () => {
    const headers = ['STT', 'Mã HS', 'Họ và tên', 'Trạng thái ngày ' + selectedDate, 'Ghi chú'];
    const rows = classStudents.map((s, idx) => {
      const st = studentStatuses[s.id];
      const textStatus =
        st === 'present'
          ? 'Có mặt'
          : st === 'late'
          ? 'Đi muộn'
          : st === 'excused'
          ? 'Nghỉ có phép'
          : 'Nghỉ không phép';
      return [idx + 1, s.code, `"${s.fullName}"`, textStatus, `"${sessionNotes[s.id] || ''}"`];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [
        `BÁO CÁO ĐIỂM DANH CHUYÊN CẦN MÔN LỊCH SỬ - LỚP ${activeClass.name}`,
        `Ngày điểm danh: ${selectedDate} | Giáo viên: Cao Thị Thu`,
        '',
        headers.join(','),
        ...rows.map((r) => r.join(',')),
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Diem_danh_${activeClass.code}_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Attendance summary counts for today
  const presentCount = Object.values(studentStatuses).filter((s) => s === 'present').length;
  const lateCount = Object.values(studentStatuses).filter((s) => s === 'late').length;
  const excusedCount = Object.values(studentStatuses).filter((s) => s === 'excused').length;
  const unexcusedCount = Object.values(studentStatuses).filter((s) => s === 'unexcused').length;

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#073B66] font-serif flex items-center gap-2.5">
            <CalendarCheck className="w-6 h-6 text-[#0878C9]" />
            Theo dõi chuyên cần môn Lịch sử
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Điểm danh từng buổi học, quản lý vắng có phép và không phép của học viên
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={markAllPresent}
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Check className="w-4 h-4 text-emerald-600" />
            Tất cả có mặt
          </button>

          <button
            onClick={handleSaveAttendance}
            className="px-4 py-2 bg-[#0878C9] hover:bg-[#073B66] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Lưu điểm danh buổi này
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileDown className="w-4 h-4 text-slate-600" />
            Xuất báo cáo
          </button>
        </div>
      </div>

      {savedNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Đã lưu thông tin điểm danh ngày {selectedDate} thành công!
        </div>
      )}

      {/* Class and Date Controls */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        {/* Class Selection */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600 font-bold">Lớp:</span>
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {classes.map((cls) => (
              <button
                key={cls.id}
                onClick={() => setSelectedClassId(cls.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  cls.id === activeClass?.id
                    ? 'bg-[#073B66] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cls.name}
              </button>
            ))}
          </div>
        </div>

        {/* Date Selection */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600 font-bold flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-[#0878C9]" />
            Ngày học:
          </span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setTempStatus({});
            }}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-bold outline-none focus:ring-2 focus:ring-[#0878C9]"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-center">
        <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200">
          <div className="text-2xl font-black text-emerald-700 font-serif">{presentCount}</div>
          <div className="text-xs font-bold text-emerald-800 mt-0.5">Có mặt đầy đủ</div>
        </div>
        <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200">
          <div className="text-2xl font-black text-amber-700 font-serif">{lateCount}</div>
          <div className="text-xs font-bold text-amber-800 mt-0.5">Đi muộn</div>
        </div>
        <div className="p-3.5 bg-sky-50 rounded-2xl border border-sky-200">
          <div className="text-2xl font-black text-[#0878C9] font-serif">{excusedCount}</div>
          <div className="text-xs font-bold text-sky-800 mt-0.5">Nghỉ có phép</div>
        </div>
        <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-200">
          <div className="text-2xl font-black text-rose-700 font-serif">{unexcusedCount}</div>
          <div className="text-xs font-bold text-rose-800 mt-0.5">Nghỉ không phép</div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#073B66] text-white font-semibold">
                <th className="py-3 px-3 text-center w-12">STT</th>
                <th className="py-3 px-3 w-28">Mã HS</th>
                <th className="py-3 px-3 min-w-[150px]">Họ và tên học sinh</th>
                <th className="py-3 px-3 text-center min-w-[280px]">Trạng thái điểm danh</th>
                <th className="py-3 px-3 min-w-[180px]">Ghi chú / Lý do vắng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classStudents.map((std, idx) => {
                const currentSt = studentStatuses[std.id];

                return (
                  <tr key={std.id} className="hover:bg-sky-50/30 transition-colors">
                    <td className="py-3 px-3 text-center font-bold text-slate-500">{idx + 1}</td>
                    <td className="py-3 px-3 font-mono font-bold text-[#073B66]">{std.code}</td>
                    <td className="py-3 px-3 font-bold text-slate-800">{std.fullName}</td>

                    {/* Status Button Group */}
                    <td className="py-3 px-3 text-center">
                      <div className="inline-flex rounded-xl p-1 bg-slate-100 gap-1 border border-slate-200">
                        <button
                          type="button"
                          onClick={() => setStatus(std.id, 'present')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            currentSt === 'present'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-emerald-700'
                          }`}
                        >
                          Có mặt
                        </button>
                        <button
                          type="button"
                          onClick={() => setStatus(std.id, 'late')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            currentSt === 'late'
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'text-slate-600 hover:text-amber-700'
                          }`}
                        >
                          Đi muộn
                        </button>
                        <button
                          type="button"
                          onClick={() => setStatus(std.id, 'excused')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            currentSt === 'excused'
                              ? 'bg-[#0878C9] text-white shadow-xs'
                              : 'text-slate-600 hover:text-[#0878C9]'
                          }`}
                        >
                          Có phép
                        </button>
                        <button
                          type="button"
                          onClick={() => setStatus(std.id, 'unexcused')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            currentSt === 'unexcused'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-rose-700'
                          }`}
                        >
                          Không phép
                        </button>
                      </div>
                    </td>

                    {/* Note input */}
                    <td className="py-3 px-3">
                      <input
                        type="text"
                        placeholder="Lý do, liên hệ phụ huynh..."
                        value={sessionNotes[std.id] ?? ''}
                        onChange={(e) =>
                          setSessionNotes({ ...sessionNotes, [std.id]: e.target.value })
                        }
                        className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:ring-1 focus:ring-[#0878C9]"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
