import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ClassRoom, Student } from '../../types';
import { Modal } from '../common/Modal';
import {
  Building2,
  Plus,
  Users,
  Edit,
  Trash2,
  FileDown,
  ArrowRightLeft,
  GraduationCap,
  Award,
  BookOpen,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

export const ClassManagement: React.FC = () => {
  const { classes, students, exams, addClass, updateClass, deleteClass, updateStudent, setActiveTab, setViewingStudentId } = useApp();

  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  const [currentClass, setCurrentClass] = useState<ClassRoom | null>(null);
  const [classToDelete, setClassToDelete] = useState<ClassRoom | null>(null);
  const [noticeMessage, setNoticeMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [studentToTransfer, setStudentToTransfer] = useState<Student | null>(null);
  const [targetClassId, setTargetClassId] = useState<string>('');

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    grade: 10 as 10 | 11 | 12,
    academicYear: '2024 - 2025',
    headTeacher: 'Cô Cao Thị Thu',
    room: 'Phòng 102 - Phân hiệu Tiên Yên',
    notes: '',
  });


  const activeClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const classStudents = students.filter(
    (s) => s.classId === activeClass?.id || s.className === activeClass?.code
  );

  const classExams = exams.filter(
    (e) => e.classId === activeClass?.id || e.className === activeClass?.code
  );

  // Statistics for this class
  const classAvg = classStudents.length
    ? (
        classStudents.reduce((sum, s) => sum + (s.averageScore || 0), 0) / classStudents.length
      ).toFixed(1)
    : '0';

  const countGioi = classStudents.filter((s) => (s.averageScore || 0) >= 8.0).length;
  const countKha = classStudents.filter(
    (s) => (s.averageScore || 0) >= 6.5 && (s.averageScore || 0) < 8.0
  ).length;
  const countTB = classStudents.filter(
    (s) => (s.averageScore || 0) >= 5.0 && (s.averageScore || 0) < 6.5
  ).length;
  const countYeu = classStudents.filter((s) => (s.averageScore || 0) < 5.0).length;

  const handleOpenAdd = () => {
    setFormData({
      code: '10A3',
      name: 'Lớp 10A3 (GDTX)',
      grade: 10,
      academicYear: '2024 - 2025',
      headTeacher: 'Cô Cao Thị Thu',
      room: 'Phòng 104 - Phân hiệu Tiên Yên',
      notes: '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (cls: ClassRoom) => {
    setCurrentClass(cls);
    setFormData({
      code: cls.code,
      name: cls.name,
      grade: cls.grade,
      academicYear: cls.academicYear,
      headTeacher: cls.headTeacher,
      room: cls.room,
      notes: cls.notes || '',
    });
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (cls: ClassRoom) => {
    setClassToDelete(cls);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!classToDelete) return;
    const deletedId = classToDelete.id;
    const deletedName = classToDelete.name;

    deleteClass(deletedId);

    // If the deleted class was currently selected, pick another class
    if (selectedClassId === deletedId) {
      const remaining = classes.filter((c) => c.id !== deletedId);
      setSelectedClassId(remaining[0]?.id || '');
    }

    setIsDeleteDialogOpen(false);
    setClassToDelete(null);
    setNoticeMessage({
      text: `Đã xóa lớp "${deletedName}" thành công khỏi hệ thống!`,
      type: 'success',
    });
    setTimeout(() => setNoticeMessage(null), 4000);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.name) return;
    addClass({
      ...formData,
    });
    setIsAddModalOpen(false);
    setNoticeMessage({
      text: `Đã tạo lớp "${formData.name}" thành công!`,
      type: 'success',
    });
    setTimeout(() => setNoticeMessage(null), 4000);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentClass) return;
    updateClass(currentClass.id, {
      ...formData,
    });
    setIsEditModalOpen(false);
    setNoticeMessage({
      text: `Đã cập nhật thông tin lớp "${formData.name}" thành công!`,
      type: 'success',
    });
    setTimeout(() => setNoticeMessage(null), 4000);
  };


  const handleTransfer = () => {
    if (!studentToTransfer || !targetClassId) return;
    const targetCls = classes.find((c) => c.id === targetClassId);
    if (!targetCls) return;

    updateStudent(studentToTransfer.id, {
      classId: targetCls.id,
      className: targetCls.code,
      grade: targetCls.grade,
    });
    setIsTransferModalOpen(false);
    setStudentToTransfer(null);
  };

  // Export class roster
  const handleExportRoster = () => {
    if (!activeClass) return;
    const headers = ['STT', 'Mã học sinh', 'Họ và tên', 'Giới tính', 'Ngày sinh', 'Điểm TB', 'Xếp loại', 'Trạng thái'];
    const rows = classStudents.map((s, idx) => [
      idx + 1,
      s.code,
      `"${s.fullName}"`,
      s.gender,
      s.dob,
      s.averageScore || '0',
      s.rank || 'Trung bình',
      s.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [
        `Danh sách lớp: ${activeClass.name} - Năm học ${activeClass.academicYear}`,
        `Giáo viên: ${activeClass.headTeacher} - Địa điểm: ${activeClass.room}`,
        '',
        headers.join(','),
        ...rows.map((r) => r.join(',')),
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Danh_sach_lop_${activeClass.code}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#073B66] font-serif flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-[#0878C9]" />
            Quản lý lớp học môn Lịch sử
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Trung tâm GDNN - GDTX TP Quảng Ninh, Phân hiệu Tiên Yên
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-[#0878C9] hover:bg-[#073B66] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Tạo lớp học mới
        </button>
      </div>

      {/* Notice Banner */}
      {noticeMessage && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200 ${
            noticeMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {noticeMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          )}
          <span>{noticeMessage.text}</span>
        </div>
      )}

      {/* Class Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {classes.map((cls) => {
          const isSelected = cls.id === activeClass?.id;
          const count = students.filter((s) => s.classId === cls.id || s.className === cls.code).length;

          return (
            <div
              key={cls.id}
              onClick={() => setSelectedClassId(cls.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-gradient-to-b from-[#073B66] to-[#085a96] text-white border-[#0878C9] shadow-md scale-102 ring-2 ring-[#0878C9]/40'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-[#0878C9] hover:shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      isSelected ? 'bg-white/20 text-cyan-200' : 'bg-sky-100 text-[#073B66]'
                    }`}
                  >
                    Khối {cls.grade}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEdit(cls);
                      }}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        isSelected
                          ? 'text-white/90 hover:bg-white/25 hover:text-white'
                          : 'text-slate-400 hover:bg-sky-100 hover:text-[#0878C9]'
                      }`}
                      title="Chỉnh sửa tên / thông tin lớp"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDelete(cls);
                      }}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        isSelected
                          ? 'text-rose-200 hover:bg-rose-500/30 hover:text-white'
                          : 'text-slate-400 hover:bg-rose-50 hover:text-rose-600'
                      }`}
                      title="Xóa lớp học này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3
                  className={`text-lg font-bold font-serif mt-2.5 leading-snug ${
                    isSelected ? 'text-white' : 'text-[#073B66]'
                  }`}
                >
                  {cls.name}
                </h3>
                <p className={`text-xs mt-1 truncate ${isSelected ? 'text-cyan-100' : 'text-slate-500'}`} title={cls.room}>
                  {cls.room}
                </p>
              </div>

              <div className="mt-4">
                <div className="pt-2.5 border-t border-slate-200/40 flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1 opacity-90">
                    <Users className="w-3.5 h-3.5" />
                    Sĩ số:
                  </span>
                  <span className={`text-base font-bold ${isSelected ? 'text-cyan-300' : 'text-[#0878C9]'}`}>
                    {count} HS
                  </span>
                </div>

                {/* Card Action Buttons (Direct Quick Access) */}
                <div className="mt-3 pt-2 border-t border-slate-200/30 grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEdit(cls);
                    }}
                    className={`py-1 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white/20 hover:bg-white/30 text-white border border-white/30'
                        : 'bg-sky-50 hover:bg-sky-100 text-[#073B66] border border-sky-200'
                    }`}
                    title="Chỉnh sửa lại tên lớp học này"
                  >
                    <Edit className="w-3 h-3 text-[#0878C9]" />
                    <span>Sửa tên</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDelete(cls);
                    }}
                    className={`py-1 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-rose-500/30 hover:bg-rose-500/50 text-rose-100 border border-rose-300/40'
                        : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                    }`}
                    title="Xóa bỏ lớp học này"
                  >
                    <Trash2 className="w-3 h-3 text-rose-600" />
                    <span>Xóa lớp</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Class Details Dashboard */}
      {activeClass && (
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 space-y-5">
          {/* Top Bar of Class Details */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold text-[#073B66] font-serif">
                  {activeClass.name}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  Năm học: {activeClass.academicYear}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Mã lớp: <span className="font-mono font-bold text-[#073B66]">{activeClass.code}</span> | Giáo viên phụ trách: <span className="font-bold text-slate-700">{activeClass.headTeacher}</span> | Phòng học: {activeClass.room}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleOpenEdit(activeClass)}
                className="px-3.5 py-2 bg-[#0878C9] hover:bg-[#073B66] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                title="Chỉnh sửa lại tên lớp hoặc phòng học"
              >
                <Edit className="w-4 h-4" />
                Chỉnh sửa tên lớp
              </button>

              <button
                type="button"
                onClick={() => handleOpenDelete(activeClass)}
                className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                title="Xóa lớp học này khỏi hệ thống"
              >
                <Trash2 className="w-4 h-4" />
                Xóa lớp này
              </button>

              <button
                type="button"
                onClick={handleExportRoster}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
              >
                <FileDown className="w-4 h-4 text-emerald-600" />
                Xuất danh sách
              </button>
            </div>
          </div>



          {/* Quick Stats for this Class */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
            <div className="p-3 bg-sky-50 rounded-xl border border-sky-100">
              <span className="text-[11px] text-slate-500">Điểm TB Lớp</span>
              <div className="text-2xl font-extrabold text-[#073B66] font-serif mt-0.5">
                {classAvg}
              </div>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
              <span className="text-[11px] text-emerald-700 font-medium">Giỏi (8-10)</span>
              <div className="text-2xl font-bold text-emerald-700 mt-0.5">{countGioi} HS</div>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
              <span className="text-[11px] text-blue-700 font-medium">Khá (6.5-7.9)</span>
              <div className="text-2xl font-bold text-blue-700 mt-0.5">{countKha} HS</div>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
              <span className="text-[11px] text-amber-700 font-medium">Trung bình</span>
              <div className="text-2xl font-bold text-amber-700 mt-0.5">{countTB} HS</div>
            </div>
            <div className="p-3 bg-rose-50 rounded-xl border border-rose-100">
              <span className="text-[11px] text-rose-700 font-medium">Yếu (&lt; 5.0)</span>
              <div className="text-2xl font-bold text-rose-700 mt-0.5">{countYeu} HS</div>
            </div>
          </div>

          {/* Class Students Roster */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-[#073B66] text-sm flex items-center gap-1.5 font-serif">
                <Users className="w-4 h-4 text-[#0878C9]" />
                Danh sách học sinh lớp {activeClass.code} ({classStudents.length} học viên)
              </h4>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <th className="py-2.5 px-3 text-center w-12">STT</th>
                    <th className="py-2.5 px-3">Mã học sinh</th>
                    <th className="py-2.5 px-3">Họ và tên</th>
                    <th className="py-2.5 px-3 text-center">Giới tính</th>
                    <th className="py-2.5 px-3 text-center">Điểm TB Lịch sử</th>
                    <th className="py-2.5 px-3 text-center">Xếp loại</th>
                    <th className="py-2.5 px-3 text-center">Trạng thái</th>
                    <th className="py-2.5 px-3 text-center">Chuyển lớp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {classStudents.map((std, idx) => (
                    <tr key={std.id} className="hover:bg-sky-50/40 transition-colors">
                      <td className="py-2.5 px-3 text-center text-slate-500 font-bold">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-[#073B66]">{std.code}</td>
                      <td
                        onClick={() => {
                          setViewingStudentId(std.id);
                          setActiveTab('students');
                        }}
                        className="py-2.5 px-3 font-bold text-slate-800 hover:text-[#0878C9] cursor-pointer"
                      >
                        {std.fullName}
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-600">{std.gender}</td>
                      <td className="py-2.5 px-3 text-center font-extrabold text-[#073B66]">
                        {std.averageScore?.toFixed(1) || '-'}
                      </td>
                      <td className="py-2.5 px-3 text-center font-semibold">{std.rank || 'Trung bình'}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {std.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => {
                            setStudentToTransfer(std);
                            setTargetClassId(classes.find((c) => c.id !== activeClass.id)?.id || '');
                            setIsTransferModalOpen(true);
                          }}
                          className="px-2 py-1 bg-slate-100 hover:bg-sky-100 text-slate-700 hover:text-[#0878C9] rounded-lg text-[11px] font-medium flex items-center gap-1 mx-auto transition-colors cursor-pointer"
                          title="Chuyển lớp cho học sinh"
                        >
                          <ArrowRightLeft className="w-3 h-3" />
                          Chuyển
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Class */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Tạo lớp học Lịch sử mới"
        maxWidth="md"
      >
        <form onSubmit={handleSaveAdd} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Mã lớp (*)</label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0878C9]"
            />
          </div>
          <div>
            <label className="block text-slate-700 font-bold mb-1">Tên lớp học (*)</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0878C9]"
            />
          </div>
          <div>
            <label className="block text-slate-700 font-bold mb-1">Khối lớp</label>
            <select
              value={formData.grade}
              onChange={(e) => setFormData({ ...formData, grade: parseInt(e.target.value, 10) as any })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0878C9]"
            >
              <option value={10}>Khối 10 (GDTX THPT)</option>
              <option value={11}>Khối 11 (GDTX THPT)</option>
              <option value={12}>Khối 12 (GDTX THPT)</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-700 font-bold mb-1">Giáo viên phụ trách</label>
            <input
              type="text"
              value={formData.headTeacher}
              onChange={(e) => setFormData({ ...formData, headTeacher: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0878C9]"
            />
          </div>
          <div>
            <label className="block text-slate-700 font-bold mb-1">Phòng học</label>
            <input
              type="text"
              value={formData.room}
              onChange={(e) => setFormData({ ...formData, room: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0878C9]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#0878C9] hover:bg-[#073B66] text-white rounded-xl font-bold cursor-pointer transition-colors"
            >
              Tạo lớp
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Transfer Student */}
      <Modal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        title="Chuyển học sinh sang lớp khác"
        maxWidth="sm"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-700">
            Chuyển học sinh <strong>{studentToTransfer?.fullName}</strong> ({studentToTransfer?.code}) từ lớp{' '}
            <strong>{activeClass?.name}</strong> sang lớp mới:
          </p>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Chọn lớp đích:</label>
            <select
              value={targetClassId}
              onChange={(e) => setTargetClassId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0878C9]"
            >
              {classes
                .filter((c) => c.id !== activeClass?.id)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.grade} - {c.studentCount} HS)
                  </option>
                ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              onClick={() => setIsTransferModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold cursor-pointer"
            >
              Hủy
            </button>
            <button
              onClick={handleTransfer}
              className="px-5 py-2 bg-[#0878C9] hover:bg-[#073B66] text-white rounded-xl font-bold cursor-pointer transition-colors"
            >
              Xác nhận chuyển lớp
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal: Edit Class */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Chỉnh sửa lớp học: ${currentClass?.name || ''}`}
        maxWidth="md"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Tên lớp học (*) <span className="text-slate-400 font-normal">(Tên hiển thị đầy đủ)</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ví dụ: Lớp 11A3 (GDTX)"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0878C9] font-semibold text-[#073B66]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Mã lớp (*)</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="Ví dụ: 11A3"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0878C9] font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Khối lớp</label>
              <select
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: parseInt(e.target.value, 10) as any })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0878C9]"
              >
                <option value={10}>Khối 10 (GDTX THPT)</option>
                <option value={11}>Khối 11 (GDTX THPT)</option>
                <option value={12}>Khối 12 (GDTX THPT)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Năm học</label>
              <input
                type="text"
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0878C9]"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Phòng học</label>
              <input
                type="text"
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                placeholder="Ví dụ: Phòng 103 - Phân hiệu Tiên Yên"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0878C9]"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Giáo viên phụ trách</label>
            <input
              type="text"
              value={formData.headTeacher}
              onChange={(e) => setFormData({ ...formData, headTeacher: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0878C9]"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Ghi chú</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Ghi chú thêm về lớp học..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0878C9] resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold cursor-pointer hover:bg-slate-200 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#0878C9] hover:bg-[#073B66] text-white rounded-xl font-bold cursor-pointer transition-colors shadow-xs"
            >
              Lưu thay đổi
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Confirm Delete Class */}
      <Modal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Xác nhận xóa lớp học"
        maxWidth="sm"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5 text-sm text-rose-900">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              Bạn có chắc chắn muốn xóa lớp này?
            </div>
            <p className="text-slate-600">
              Lớp: <strong className="text-slate-900 font-bold">{classToDelete?.name}</strong> (Khối {classToDelete?.grade})
            </p>
          </div>

          {classToDelete && (() => {
            const studentCount = students.filter(
              (s) => s.classId === classToDelete.id || s.className === classToDelete.code
            ).length;

            return (
              <div className="text-slate-600 space-y-2">
                {studentCount > 0 ? (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs">
                    ⚠️ <strong>Lưu ý quan trọng:</strong> Lớp này đang có{' '}
                    <strong className="text-rose-600 font-bold">{studentCount} học sinh</strong>. Nếu xóa lớp, các học sinh này sẽ được chuyển về trạng thái <em>"Chưa xếp lớp"</em> để bạn có thể chuyển sang lớp khác.
                  </div>
                ) : (
                  <p className="text-emerald-700 font-medium">
                    ✓ Lớp học này hiện không có học sinh nào (Sĩ số: 0 HS). Xóa lớp sẽ không ảnh hưởng đến hồ sơ học sinh.
                  </p>
                )}
                <p className="text-[11px] text-slate-400 italic">
                  Dữ liệu lớp sẽ được tự động đồng bộ và xóa trên cơ sở dữ liệu Supabase.
                </p>
              </div>
            );
          })()}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer transition-colors"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold cursor-pointer transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Xác nhận xóa lớp
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

