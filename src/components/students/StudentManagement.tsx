import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';
import { Modal } from '../common/Modal';
import {
  Users,
  Search,
  Filter,
  Plus,
  FileDown,
  FileUp,
  Eye,
  Edit2,
  Trash2,
  BookOpen,
  CalendarCheck,
  Award,
  AlertTriangle,
  ArrowUpDown,
  GraduationCap,
  HeartHandshake,
} from 'lucide-react';

export const StudentManagement: React.FC = () => {
  const {
    students,
    classes,
    addStudent,
    updateStudent,
    deleteStudent,
    importStudents,
    exams,
    supportItems,
    viewingStudentId,
    setViewingStudentId,
  } = useApp();

  // Search, filter, sorting state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'code' | 'score'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);

  // Form state for Add / Edit
  const [formData, setFormData] = useState({
    code: '',
    fullName: '',
    gender: 'Nam' as 'Nam' | 'Nữ',
    dob: '2009-01-01',
    classId: classes[0]?.id || '',
    className: classes[0]?.code || '10A1',
    grade: (classes[0]?.grade || 10) as 10 | 11 | 12,
    academicYear: '2024 - 2025',
    status: 'Đang học' as const,
    phone: '',
    address: '',
    parentName: '',
    parentPhone: '',
    notes: '',
  });

  // Profile Modal Tab state
  const [profileTab, setProfileTab] = useState<
    'basic' | 'history_scores' | 'exams' | 'attendance' | 'tasks' | 'support'
  >('basic');

  // CSV Import State
  const [importText, setImportText] = useState('');
  const [importResult, setImportResult] = useState<{ successCount: number; errors: string[] } | null>(null);

  // Filtered & sorted student list
  const filteredStudents = useMemo(() => {
    return students
      .filter((std) => {
        const matchesSearch =
          std.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          std.code.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesClass = selectedClass === 'all' || std.classId === selectedClass || std.className === selectedClass;
        const matchesStatus = selectedStatus === 'all' || std.status === selectedStatus;
        return matchesSearch && matchesClass && matchesStatus;
      })
      .sort((a, b) => {
        let cmp = 0;
        if (sortBy === 'name') {
          // Compare Vietnamese names by last word then full name
          const lastNameA = a.fullName.split(' ').pop() || '';
          const lastNameB = b.fullName.split(' ').pop() || '';
          cmp = lastNameA.localeCompare(lastNameB, 'vi');
        } else if (sortBy === 'code') {
          cmp = a.code.localeCompare(b.code);
        } else if (sortBy === 'score') {
          cmp = (a.averageScore || 0) - (b.averageScore || 0);
        }
        return sortOrder === 'asc' ? cmp : -cmp;
      });
  }, [students, searchQuery, selectedClass, selectedStatus, sortBy, sortOrder]);

  const selectedStudentProfile = useMemo(() => {
    if (!viewingStudentId) return null;
    return students.find((s) => s.id === viewingStudentId) || null;
  }, [students, viewingStudentId]);

  // Open Add modal with reset form
  const handleOpenAdd = () => {
    const nextNum = students.length + 1;
    const defaultClass = classes[0];
    setFormData({
      code: `HS${defaultClass?.code || '10A1'}${String(nextNum).padStart(2, '0')}`,
      fullName: '',
      gender: 'Nam',
      dob: '2009-01-01',
      classId: defaultClass?.id || '',
      className: defaultClass?.code || '10A1',
      grade: (defaultClass?.grade || 10) as 10 | 11 | 12,
      academicYear: '2024 - 2025',
      status: 'Đang học',
      phone: '',
      address: 'Tiên Yên, Quảng Ninh',
      parentName: '',
      parentPhone: '',
      notes: '',
    });
    setIsAddModalOpen(true);
  };

  // Open Edit modal
  const handleOpenEdit = (std: Student) => {
    setCurrentStudent(std);
    setFormData({
      code: std.code,
      fullName: std.fullName,
      gender: std.gender,
      dob: std.dob || '2009-01-01',
      classId: std.classId,
      className: std.className,
      grade: std.grade,
      academicYear: std.academicYear,
      status: std.status as any,
      phone: std.phone || '',
      address: std.address || '',
      parentName: std.parentName || '',
      parentPhone: std.parentPhone || '',
      notes: std.notes || '',
    });
    setIsEditModalOpen(true);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) return;

    const matchingClass = classes.find((c) => c.id === formData.classId) || classes[0];
    addStudent({
      ...formData,
      classId: matchingClass.id,
      className: matchingClass.code,
      grade: matchingClass.grade,
      scores: {},
      averageScore: 0,
      rank: 'Trung bình',
      attendanceStats: { present: 0, late: 0, excused: 0, unexcused: 0 },
    });
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudent || !formData.fullName.trim()) return;

    const matchingClass = classes.find((c) => c.id === formData.classId) || classes[0];
    updateStudent(currentStudent.id, {
      ...formData,
      classId: matchingClass.id,
      className: matchingClass.code,
      grade: matchingClass.grade,
    });
    setIsEditModalOpen(false);
    setCurrentStudent(null);
  };

  const handleDelete = () => {
    if (currentStudent) {
      deleteStudent(currentStudent.id);
      setIsDeleteConfirmOpen(false);
      setCurrentStudent(null);
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['STT', 'Mã học sinh', 'Họ và tên', 'Giới tính', 'Ngày sinh', 'Lớp', 'Điểm TB', 'Xếp loại', 'Trạng thái'];
    const rows = filteredStudents.map((s, idx) => [
      idx + 1,
      s.code,
      `"${s.fullName}"`,
      s.gender,
      s.dob,
      s.className,
      s.averageScore || '0',
      s.rank || 'Trung bình',
      s.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Danh_sach_hoc_sinh_SuHocSo_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Import handling
  const handleProcessImport = () => {
    if (!importText.trim()) return;
    const lines = importText.trim().split('\n');
    const parsedRows: Partial<Student>[] = [];

    lines.forEach((line) => {
      const parts = line.split(/[,;\t]/).map((p) => p.trim().replace(/^["']|["']$/g, ''));
      if (parts.length >= 2) {
        // format: Code, FullName, Gender, Class
        parsedRows.push({
          code: parts[0] || '',
          fullName: parts[1] || '',
          gender: parts[2] === 'Nữ' ? 'Nữ' : 'Nam',
          className: parts[3] || '10A1',
        });
      }
    });

    const res = importStudents(parsedRows);
    setImportResult(res);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#073B66] font-serif flex items-center gap-2.5">
            <Users className="w-6 h-6 text-[#0878C9]" />
            Quản lý học sinh Lịch sử
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tổng cộng <span className="font-bold text-[#073B66]">{students.length}</span> học viên thuộc các khối 10, 11 và 12 – Phân hiệu Tiên Yên
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleOpenAdd}
            className="px-3.5 py-2 bg-[#0878C9] hover:bg-[#073B66] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Thêm học sinh mới
          </button>

          <button
            onClick={() => {
              setImportText('');
              setImportResult(null);
              setIsImportModalOpen(true);
            }}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileUp className="w-4 h-4 text-[#0878C9]" />
            Nhập CSV / Excel
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileDown className="w-4 h-4 text-emerald-600" />
            Xuất danh sách
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo họ tên hoặc mã học sinh..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0878C9] focus:bg-white transition-all"
          />
        </div>

        {/* Filter by Class */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Lớp:</span>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#0878C9]"
          >
            <option value="all">Tất cả các lớp ({classes.length})</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Filter by Status */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Trạng thái:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#0878C9]"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Đang học">Đang học</option>
            <option value="Cần hỗ trợ">Cần hỗ trợ</option>
            <option value="Nghỉ học">Nghỉ học</option>
          </select>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Sắp xếp:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#0878C9]"
          >
            <option value="name">Tên học sinh</option>
            <option value="code">Mã học sinh</option>
            <option value="score">Điểm trung bình</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
            title="Đổi thứ tự"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#073B66] text-white font-semibold">
                <th className="py-3 px-3 text-center w-12">STT</th>
                <th className="py-3 px-3">Mã học sinh</th>
                <th className="py-3 px-3">Họ và tên</th>
                <th className="py-3 px-3 text-center">Giới tính</th>
                <th className="py-3 px-3 text-center">Lớp</th>
                <th className="py-3 px-3 text-center">Năm học</th>
                <th className="py-3 px-3 text-center">Điểm TB Lịch sử</th>
                <th className="py-3 px-3 text-center">Xếp loại</th>
                <th className="py-3 px-3 text-center">Trạng thái</th>
                <th className="py-3 px-3 text-center w-28">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-slate-400">
                    Không tìm thấy học sinh nào phù hợp với điều kiện tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((std, idx) => (
                  <tr
                    key={std.id}
                    className="hover:bg-sky-50/50 transition-colors group"
                  >
                    <td className="py-3 px-3 text-center font-bold text-slate-500">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-[#073B66]">
                      {std.code}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-800 group-hover:text-[#0878C9] transition-colors">
                      {std.fullName}
                    </td>
                    <td className="py-3 px-3 text-center text-slate-600">
                      {std.gender}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-md bg-sky-100 text-[#073B66] font-bold">
                        {std.className}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center text-slate-500">
                      {std.academicYear}
                    </td>
                    <td className="py-3 px-3 text-center font-extrabold text-sm text-[#073B66]">
                      {std.averageScore ? std.averageScore.toFixed(1) : '-'}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          std.rank === 'Giỏi'
                            ? 'bg-emerald-100 text-emerald-700'
                            : std.rank === 'Khá'
                            ? 'bg-blue-100 text-blue-700'
                            : std.rank === 'Trung bình'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {std.rank || 'Trung bình'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          std.status === 'Đang học'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : std.status === 'Cần hỗ trợ'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            std.status === 'Đang học'
                              ? 'bg-emerald-500'
                              : std.status === 'Cần hỗ trợ'
                              ? 'bg-amber-500'
                              : 'bg-slate-400'
                          }`}
                        />
                        {std.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setViewingStudentId(std.id)}
                          className="p-1.5 text-slate-500 hover:text-[#0878C9] hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                          title="Xem hồ sơ chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(std)}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          title="Sửa thông tin"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setCurrentStudent(std);
                            setIsDeleteConfirmOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Xóa học sinh"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Add New Student */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Thêm học sinh mới vào hệ thống"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveAdd} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Mã học sinh (*)</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0878C9] outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Họ và tên học sinh (*)</label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Nguyễn Văn An"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0878C9] outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Giới tính</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0878C9] outline-none"
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Ngày sinh</label>
              <input
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0878C9] outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Lớp học (*)</label>
              <select
                value={formData.classId}
                onChange={(e) => {
                  const sel = classes.find((c) => c.id === e.target.value);
                  setFormData({
                    ...formData,
                    classId: e.target.value,
                    className: sel?.code || '10A1',
                    grade: (sel?.grade || 10) as any,
                  });
                }}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0878C9] outline-none"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Trạng thái học tập</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0878C9] outline-none"
              >
                <option value="Đang học">Đang học</option>
                <option value="Cần hỗ trợ">Cần hỗ trợ</option>
                <option value="Nghỉ học">Nghỉ học</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Địa chỉ cư trú (Tiên Yên - Quảng Ninh)</label>
            <input
              type="text"
              placeholder="Ví dụ: Thị trấn Tiên Yên, Quảng Ninh"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0878C9] outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Ghi chú sư phạm</label>
            <textarea
              rows={2}
              placeholder="Ghi chú sở trường, phong cách tiếp thu môn Lịch sử..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0878C9] outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#0878C9] hover:bg-[#073B66] text-white rounded-xl font-bold cursor-pointer transition-colors"
            >
              Lưu học sinh
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal 2: Edit Student */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Chỉnh sửa thông tin học sinh: ${formData.fullName}`}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Mã học sinh</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0878C9] outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Họ và tên</label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0878C9] outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Giới tính</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0878C9] outline-none"
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Lớp</label>
              <select
                value={formData.classId}
                onChange={(e) => {
                  const sel = classes.find((c) => c.id === e.target.value);
                  setFormData({
                    ...formData,
                    classId: e.target.value,
                    className: sel?.code || '10A1',
                    grade: (sel?.grade || 10) as any,
                  });
                }}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0878C9] outline-none"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Trạng thái</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0878C9] outline-none"
              >
                <option value="Đang học">Đang học</option>
                <option value="Cần hỗ trợ">Cần hỗ trợ</option>
                <option value="Nghỉ học">Nghỉ học</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Điện thoại liên hệ</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0878C9] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Ghi chú</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0878C9] outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer transition-colors"
            >
              Cập nhật
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal 3: Detailed Student Profile Tabs */}
      {selectedStudentProfile && (
        <Modal
          isOpen={!!selectedStudentProfile}
          onClose={() => setViewingStudentId(null)}
          title={`Hồ sơ học tập: ${selectedStudentProfile.fullName} (${selectedStudentProfile.code})`}
          maxWidth="4xl"
        >
          <div className="space-y-4">
            {/* Tabs Bar */}
            <div className="flex flex-wrap border-b border-slate-200 gap-2">
              <button
                onClick={() => setProfileTab('basic')}
                className={`px-3 py-2 text-xs font-bold border-b-2 cursor-pointer transition-all ${
                  profileTab === 'basic'
                    ? 'border-[#0878C9] text-[#0878C9]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Thông tin cơ bản
              </button>
              <button
                onClick={() => setProfileTab('history_scores')}
                className={`px-3 py-2 text-xs font-bold border-b-2 cursor-pointer transition-all ${
                  profileTab === 'history_scores'
                    ? 'border-[#0878C9] text-[#0878C9]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Kết quả môn Lịch sử
              </button>
              <button
                onClick={() => setProfileTab('exams')}
                className={`px-3 py-2 text-xs font-bold border-b-2 cursor-pointer transition-all ${
                  profileTab === 'exams'
                    ? 'border-[#0878C9] text-[#0878C9]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Lịch sử kiểm tra
              </button>
              <button
                onClick={() => setProfileTab('attendance')}
                className={`px-3 py-2 text-xs font-bold border-b-2 cursor-pointer transition-all ${
                  profileTab === 'attendance'
                    ? 'border-[#0878C9] text-[#0878C9]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Chuyên cần
              </button>
              <button
                onClick={() => setProfileTab('support')}
                className={`px-3 py-2 text-xs font-bold border-b-2 cursor-pointer transition-all ${
                  profileTab === 'support'
                    ? 'border-[#0878C9] text-[#0878C9]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Kế hoạch hỗ trợ & Nhận xét
              </button>
            </div>

            {/* Tab 1: Thông tin cơ bản */}
            {profileTab === 'basic' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-2.5 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <h4 className="font-bold text-[#073B66] text-sm font-serif">Thông tin nhân thân</h4>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Mã học sinh:</span>
                    <span className="font-bold font-mono text-[#073B66]">{selectedStudentProfile.code}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Họ và tên:</span>
                    <span className="font-bold text-slate-800">{selectedStudentProfile.fullName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Giới tính:</span>
                    <span>{selectedStudentProfile.gender}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Ngày sinh:</span>
                    <span>{selectedStudentProfile.dob || '2009-01-01'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Địa chỉ:</span>
                    <span className="text-right">{selectedStudentProfile.address || 'Tiên Yên, Quảng Ninh'}</span>
                  </div>
                </div>

                <div className="space-y-2.5 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <h4 className="font-bold text-[#073B66] text-sm font-serif">Thông tin lớp học</h4>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Lớp hiện tại:</span>
                    <span className="font-bold text-[#0878C9]">{selectedStudentProfile.className}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Năm học:</span>
                    <span>{selectedStudentProfile.academicYear}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Trạng thái:</span>
                    <span className="font-bold text-emerald-600">{selectedStudentProfile.status}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Giáo viên phụ trách môn:</span>
                    <span className="font-bold text-[#073B66]">Cô Cao Thị Thu</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Kết quả môn Lịch sử */}
            {profileTab === 'history_scores' && (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-between">
                  <div>
                    <span className="text-slate-500">Điểm trung bình môn Lịch sử:</span>
                    <div className="text-3xl font-extrabold text-[#073B66] font-serif mt-1">
                      {selectedStudentProfile.averageScore ? selectedStudentProfile.averageScore.toFixed(1) : '-'} / 10
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500">Xếp loại học lực:</span>
                    <div className="text-lg font-bold text-emerald-600 mt-1">
                      {selectedStudentProfile.rank || 'Trung bình'}
                    </div>
                  </div>
                </div>

                <h4 className="font-bold text-[#073B66] font-serif">Bảng chi tiết điểm các bài kiểm tra</h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 font-semibold text-slate-700">
                      <tr>
                        <th className="p-2">Bài kiểm tra</th>
                        <th className="p-2 text-center">Hình thức</th>
                        <th className="p-2 text-center">Hệ số</th>
                        <th className="p-2 text-center">Điểm số</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {exams
                        .filter((e) => e.classId === selectedStudentProfile.classId || e.className === selectedStudentProfile.className)
                        .map((ex) => {
                          const sc = selectedStudentProfile.scores[ex.id];
                          return (
                            <tr key={ex.id}>
                              <td className="p-2 font-medium text-slate-800">{ex.title}</td>
                              <td className="p-2 text-center text-slate-600">{ex.format}</td>
                              <td className="p-2 text-center font-bold text-[#073B66]">{ex.weight}</td>
                              <td className="p-2 text-center font-extrabold text-sm text-[#0878C9]">
                                {typeof sc === 'number' ? sc : 'Chưa nhập'}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab 3: Lịch sử kiểm tra */}
            {profileTab === 'exams' && (
              <div className="p-4 bg-slate-50 rounded-xl text-xs space-y-2">
                <p className="text-slate-600">
                  Học sinh tham gia đầy đủ các bài khảo sát định kỳ theo hướng dẫn chuyên môn của Trung tâm GDNN - GDTX TP Quảng Ninh.
                </p>
                <div className="divide-y divide-slate-200 mt-2">
                  <div className="py-2 flex justify-between">
                    <span>Đánh giá thường xuyên 1:</span>
                    <span className="font-bold text-emerald-600">Đạt</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span>Kiểm tra giữa kỳ:</span>
                    <span className="font-bold text-[#0878C9]">Hoàn thành tốt</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Chuyên cần */}
            {profileTab === 'attendance' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                    <div className="text-2xl font-bold text-emerald-600">
                      {selectedStudentProfile.attendanceStats.present || 22}
                    </div>
                    <div className="text-[11px] text-slate-600 mt-1">Có mặt</div>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                    <div className="text-2xl font-bold text-amber-600">
                      {selectedStudentProfile.attendanceStats.late || 0}
                    </div>
                    <div className="text-[11px] text-slate-600 mt-1">Đi muộn</div>
                  </div>
                  <div className="p-3 bg-sky-50 rounded-xl border border-sky-200">
                    <div className="text-2xl font-bold text-[#0878C9]">
                      {selectedStudentProfile.attendanceStats.excused || 0}
                    </div>
                    <div className="text-[11px] text-slate-600 mt-1">Nghỉ phép</div>
                  </div>
                  <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
                    <div className="text-2xl font-bold text-rose-600">
                      {selectedStudentProfile.attendanceStats.unexcused || 0}
                    </div>
                    <div className="text-[11px] text-slate-600 mt-1">Không phép</div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 5: Kế hoạch hỗ trợ & Nhận xét */}
            {profileTab === 'support' && (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <h5 className="font-bold text-[#073B66] mb-1">Nhận xét của cô Cao Thị Thu:</h5>
                  <p className="text-slate-700 italic font-serif">
                    {selectedStudentProfile.notes ||
                      'Học sinh có ý thức học tập, cần rèn luyện thêm kỹ năng phân tích và tổng hợp sự kiện lịch sử.'}
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setViewingStudentId(null)}
                className="px-4 py-2 bg-[#073B66] hover:bg-[#0878C9] text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                Đóng hồ sơ
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal 4: Import CSV */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Nhập danh sách học sinh từ file CSV hoặc Excel"
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Dán dữ liệu học sinh theo định dạng phân tách bằng dấu phẩy hoặc tab:
            <br />
            <code className="text-[#0878C9] font-mono block mt-1 bg-slate-50 p-2 rounded-lg border border-slate-200">
              Mã_HS, Họ_và_tên, Giới_tính, Lớp
              <br />
              HS10A112, Vũ Minh Tuấn, Nam, 10A1
              <br />
              HS10A113, Đỗ Thị Thu, Nữ, 10A1
            </code>
          </p>

          <textarea
            rows={6}
            placeholder="Dán nội dung tại đây..."
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            className="w-full p-3 font-mono border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0878C9]"
          />

          {importResult && (
            <div
              className={`p-3 rounded-xl border ${
                importResult.errors.length > 0
                  ? 'bg-amber-50 border-amber-200 text-amber-800'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}
            >
              <div className="font-bold">
                Đã thêm thành công {importResult.successCount} học sinh.
              </div>
              {importResult.errors.length > 0 && (
                <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11px]">
                  {importResult.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              onClick={() => setIsImportModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
            >
              Đóng
            </button>
            <button
              onClick={handleProcessImport}
              className="px-5 py-2 bg-[#0878C9] hover:bg-[#073B66] text-white rounded-xl font-bold cursor-pointer transition-colors"
            >
              Tiến hành nhập
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirmation Modal for Delete */}
      <Modal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        title="Xác nhận xóa học sinh"
        maxWidth="sm"
      >
        <div className="space-y-4 text-xs">
          <div className="flex items-center gap-3 text-rose-600">
            <AlertTriangle className="w-8 h-8 shrink-0" />
            <p className="text-slate-700">
              Bạn có chắc chắn muốn xóa học sinh{' '}
              <strong className="text-slate-900">{currentStudent?.fullName}</strong> ({currentStudent?.code}) khỏi hệ thống? Dữ liệu điểm số liên quan cũng sẽ bị xóa.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              onClick={() => setIsDeleteConfirmOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
            >
              Hủy
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold cursor-pointer"
            >
              Xác nhận xóa
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
