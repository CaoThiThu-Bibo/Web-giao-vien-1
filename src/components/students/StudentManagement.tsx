import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
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
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  Table,
  HelpCircle,
  FileCheck,
  X,
  Download,
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

  // Excel / CSV Import State
  const [importMode, setImportMode] = useState<'upload' | 'paste'>('upload');
  const [importText, setImportText] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [previewStudents, setPreviewStudents] = useState<Partial<Student>[]>([]);
  const [importResult, setImportResult] = useState<{ successCount: number; errors: string[] } | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);


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

  // Helper to normalize strings for flexible header matching
  const normalizeStr = (str: string) =>
    str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');

  // Helper to parse dates from Excel serial or common text formats
  const parseExcelDate = (val: any): string => {
    if (!val) return '2008-01-01';
    if (typeof val === 'number') {
      const d = new Date(Math.round((val - 25569) * 86400 * 1000));
      if (!isNaN(d.getTime())) {
        return d.toISOString().split('T')[0];
      }
    }
    const s = String(val).trim();
    // check DD/MM/YYYY
    const dmYMatch = s.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
    if (dmYMatch) {
      const day = dmYMatch[1].padStart(2, '0');
      const month = dmYMatch[2].padStart(2, '0');
      const year = dmYMatch[3];
      return `${year}-${month}-${day}`;
    }
    // check YYYY-MM-DD
    const ymDMatch = s.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/);
    if (ymDMatch) {
      const year = ymDMatch[1];
      const month = ymDMatch[2].padStart(2, '0');
      const day = ymDMatch[3].padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    return s || '2008-01-01';
  };

  // Download official Excel Template (.xlsx)
  const handleDownloadExcelTemplate = () => {
    const headers = [
      'STT',
      'Mã học sinh',
      'Họ và tên',
      'Giới tính',
      'Ngày sinh (YYYY-MM-DD hoặc DD/MM/YYYY)',
      'Lớp',
      'Số điện thoại',
      'Địa chỉ',
      'Họ tên phụ huynh',
      'SĐT phụ huynh',
      'Ghi chú',
    ];

    const sampleRows = [
      [1, 'HS10A114', 'Trần Văn Nam', 'Nam', '2008-03-15', '10A1', '0981122334', 'Tiên Yên, Quảng Ninh', 'Trần Văn Hùng', '0912233445', 'Học lực Khá, chăm chỉ'],
      [2, 'HS10A115', 'Nguyễn Thị Mai', 'Nữ', '2008-07-22', '10A1', '0982233445', 'Tiên Yên, Quảng Ninh', 'Nguyễn Thị Loan', '0913344556', 'Yêu thích môn Lịch sử'],
      [3, 'HS10A211', 'Lê Hoàng Long', 'Nam', '2008-11-05', '10A2', '0983344556', 'Hải Lạng, Tiên Yên', 'Lê Văn Cường', '0914455667', 'Cán sự môn'],
      [4, 'HS11A110', 'Phạm Quỳnh Anh', 'Nữ', '2007-02-18', '11A1', '0984455667', 'Yên Than, Tiên Yên', 'Phạm Văn Dũng', '0915566778', 'Thành viên đội tuyển HSG'],
      [5, 'HS11A401', 'Đặng Quốc Bảo', 'Nam', '2007-09-30', '11A4', '0985566778', 'Đồng Rui, Tiên Yên', 'Đặng Văn Thắng', '0916677889', 'Tích cực xây dựng bài'],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);

    // Set readable column widths
    worksheet['!cols'] = [
      { wch: 6 },
      { wch: 15 },
      { wch: 22 },
      { wch: 10 },
      { wch: 24 },
      { wch: 12 },
      { wch: 16 },
      { wch: 26 },
      { wch: 20 },
      { wch: 16 },
      { wch: 28 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'DanhSachHocSinh');
    XLSX.writeFile(workbook, 'Mau_Nhap_Danh_Sach_Hoc_Sinh_SuHocSo.xlsx');
  };

  // Download CSV Template (.csv)
  const handleDownloadCsvTemplate = () => {
    const headers = ['STT', 'Mã học sinh', 'Họ và tên', 'Giới tính', 'Ngày sinh', 'Lớp', 'Số điện thoại', 'Địa chỉ', 'Họ tên phụ huynh', 'SĐT phụ huynh', 'Ghi chú'];
    const sampleRows = [
      ['1', 'HS10A114', '"Trần Văn Nam"', 'Nam', '2008-03-15', '10A1', '0981122334', '"Tiên Yên, Quảng Ninh"', '"Trần Văn Hùng"', '0912233445', '"Học lực Khá, chăm chỉ"'],
      ['2', 'HS10A115', '"Nguyễn Thị Mai"', 'Nữ', '2008-07-22', '10A1', '0982233445', '"Tiên Yên, Quảng Ninh"', '"Nguyễn Thị Loan"', '0913344556', '"Yêu thích môn Lịch sử"'],
    ];
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...sampleRows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Mau_Nhap_Danh_Sach_Hoc_Sinh_SuHocSo.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle uploaded file selection & parsing
  const processSelectedFile = (file: File) => {
    setIsProcessingFile(true);
    setUploadedFileName(file.name);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        if (!rows || rows.length < 2) {
          setImportResult({ successCount: 0, errors: ['File không có dữ liệu hoặc thiếu dòng tiêu đề cột.'] });
          setIsProcessingFile(false);
          return;
        }

        // Detect header row index
        let headerRowIndex = 0;
        for (let i = 0; i < Math.min(rows.length, 5); i++) {
          const row = rows[i] || [];
          const hasNameOrCode = row.some((cell: any) => {
            const norm = normalizeStr(String(cell || ''));
            return norm.includes('hoten') || norm.includes('hovaten') || norm.includes('mahs') || norm.includes('mahocsinh');
          });
          if (hasNameOrCode) {
            headerRowIndex = i;
            break;
          }
        }

        const rawHeaders = rows[headerRowIndex] || [];
        const headerMap: { [key: string]: number } = {};
        rawHeaders.forEach((h: any, idx: number) => {
          const norm = normalizeStr(String(h || ''));
          if (norm.includes('mahs') || norm.includes('mahocsinh') || norm.includes('masohs') || norm.includes('sothe')) {
            headerMap['code'] = idx;
          } else if (norm.includes('hovaten') || norm.includes('hoten') || norm.includes('tenhs') || norm.includes('hocsinh')) {
            headerMap['fullName'] = idx;
          } else if (norm.includes('gioitinh') || norm.includes('namnu') || norm.includes('phai')) {
            headerMap['gender'] = idx;
          } else if (norm.includes('ngaysinh') || norm.includes('dob') || norm.includes('sinhngay')) {
            headerMap['dob'] = idx;
          } else if (norm.includes('lop') || norm.includes('lophoc') || norm.includes('tenlop')) {
            headerMap['className'] = idx;
          } else if (norm.includes('sdtphuhuynh') || norm.includes('phuhuynhsdt') || norm.includes('dienthoaiph')) {
            headerMap['parentPhone'] = idx;
          } else if (norm.includes('hotenphuhuynh') || norm.includes('phuhuynh') || norm.includes('tenbo') || norm.includes('tenme')) {
            headerMap['parentName'] = idx;
          } else if (norm.includes('sdt') || norm.includes('dienthoai') || norm.includes('phone')) {
            headerMap['phone'] = idx;
          } else if (norm.includes('diachi') || norm.includes('quequan') || norm.includes('noio')) {
            headerMap['address'] = idx;
          } else if (norm.includes('ghichu') || norm.includes('nhanxet') || norm.includes('luuy')) {
            headerMap['notes'] = idx;
          }
        });

        const getVal = (row: any[], field: string, defaultIdx: number) => {
          const idx = headerMap[field] !== undefined ? headerMap[field] : defaultIdx;
          return row[idx] !== undefined && row[idx] !== null ? String(row[idx]).trim() : '';
        };

        const parsed: Partial<Student>[] = [];
        for (let i = headerRowIndex + 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.length === 0) continue;

          const fullName =
            headerMap['fullName'] !== undefined
              ? String(row[headerMap['fullName']] || '').trim()
              : String(row[2] || row[1] || '').trim();

          if (!fullName || fullName.toLowerCase().includes('họ và tên') || fullName.toLowerCase().includes('hovaten')) {
            continue;
          }

          let code =
            headerMap['code'] !== undefined
              ? String(row[headerMap['code']] || '').trim()
              : String(row[1] || '').trim();

          if (!code || code === String(i)) {
            code = `HS${Date.now().toString().slice(-4)}${i}`;
          }

          const rawGender =
            headerMap['gender'] !== undefined
              ? String(row[headerMap['gender']] || '').trim()
              : String(row[3] || '').trim();
          const gender =
            rawGender.toLowerCase().includes('nữ') ||
            rawGender.toLowerCase() === 'nu' ||
            rawGender.toLowerCase() === 'f'
              ? 'Nữ'
              : 'Nam';

          const rawDob = headerMap['dob'] !== undefined ? row[headerMap['dob']] : row[4];
          const dob = parseExcelDate(rawDob);

          const className =
            headerMap['className'] !== undefined
              ? String(row[headerMap['className']] || '').trim()
              : String(row[5] || '10A1').trim();

          const phone = getVal(row, 'phone', 6);
          const address = getVal(row, 'address', 7);
          const parentName = getVal(row, 'parentName', 8);
          const parentPhone = getVal(row, 'parentPhone', 9);
          const notes = getVal(row, 'notes', 10);

          parsed.push({
            code,
            fullName,
            gender: gender as 'Nam' | 'Nữ',
            dob,
            className: className || '10A1',
            phone,
            address,
            parentName,
            parentPhone,
            notes,
          });
        }

        setPreviewStudents(parsed);
        if (parsed.length === 0) {
          setImportResult({
            successCount: 0,
            errors: ['Không tìm thấy dòng học sinh hợp lệ nào trong file. Vui lòng kiểm tra lại cấu trúc file mẫu.'],
          });
        }
      } catch (err: any) {
        console.error('Lỗi đọc file Excel:', err);
        setImportResult({
          successCount: 0,
          errors: ['Có lỗi khi đọc file: ' + (err?.message || 'Định dạng file không được hỗ trợ')],
        });
      } finally {
        setIsProcessingFile(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  // Execute import into system
  const handleExecuteImport = () => {
    if (importMode === 'upload') {
      if (previewStudents.length === 0) {
        setImportResult({
          successCount: 0,
          errors: ['Chưa có danh sách học sinh để nhập. Vui lòng chọn file Excel hoặc CSV.'],
        });
        return;
      }
      const res = importStudents(previewStudents);
      setImportResult(res);
      if (res.successCount > 0) {
        setPreviewStudents([]);
        setUploadedFileName(null);
      }
    } else {
      if (!importText.trim()) {
        setImportResult({
          successCount: 0,
          errors: ['Vui lòng dán dữ liệu học sinh vào ô văn bản.'],
        });
        return;
      }
      const lines = importText.trim().split('\n');
      const parsedRows: Partial<Student>[] = [];

      lines.forEach((line) => {
        const parts = line.split(/[,;\t]/).map((p) => p.trim().replace(/^["']|["']$/g, ''));
        if (parts.length >= 2) {
          parsedRows.push({
            code: parts[0] || `HS${Date.now().toString().slice(-4)}`,
            fullName: parts[1] || '',
            gender: parts[2] === 'Nữ' ? 'Nữ' : 'Nam',
            className: parts[3] || '10A1',
          });
        }
      });

      const res = importStudents(parsedRows);
      setImportResult(res);
    }
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

      {/* Modal 4: Import CSV & Excel */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => {
          setIsImportModalOpen(false);
          setPreviewStudents([]);
          setUploadedFileName(null);
          setImportResult(null);
        }}
        title="Nhập danh sách học sinh từ file CSV hoặc Excel"
        maxWidth="2xl"
      >
        <div className="space-y-4 text-xs">
          {/* Banner: Tải file mẫu Excel */}
          <div className="p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 rounded-2xl border border-emerald-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-[#073B66] text-sm">File mẫu nhập danh sách học sinh</h4>
                <p className="text-[11px] text-slate-600">
                  Tải file mẫu Excel chuẩn về máy, điền thông tin học sinh theo các cột rồi tải lên lại hệ thống.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <button
                onClick={handleDownloadExcelTemplate}
                className="flex-1 sm:flex-none px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                title="Tải file mẫu định dạng Microsoft Excel (.xlsx)"
              >
                <Download className="w-3.5 h-3.5" />
                Tải file mẫu Excel (.xlsx)
              </button>
              <button
                onClick={handleDownloadCsvTemplate}
                className="px-2.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold rounded-xl text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                title="Tải file mẫu định dạng CSV (.csv)"
              >
                <Download className="w-3.5 h-3.5 text-sky-600" />
                CSV
              </button>
            </div>
          </div>

          {/* Tab Selector: Upload file vs Dán văn bản */}
          <div className="flex border-b border-slate-200 gap-2">
            <button
              onClick={() => setImportMode('upload')}
              className={`pb-2 px-3 font-bold text-xs flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                importMode === 'upload'
                  ? 'border-[#0878C9] text-[#0878C9]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileUp className="w-4 h-4" />
              Tải lên file Excel / CSV (.xlsx, .xls, .csv)
            </button>
            <button
              onClick={() => setImportMode('paste')}
              className={`pb-2 px-3 font-bold text-xs flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                importMode === 'paste'
                  ? 'border-[#0878C9] text-[#0878C9]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Table className="w-4 h-4" />
              Dán văn bản thủ công
            </button>
          </div>

          {/* Mode 1: Upload File */}
          {importMode === 'upload' && (
            <div className="space-y-3">
              {/* Dropzone */}
              {!uploadedFileName ? (
                <label className="border-2 border-dashed border-sky-300 hover:border-[#0878C9] bg-sky-50/40 hover:bg-sky-50/70 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all group">
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-sky-100 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform text-[#0878C9]">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-slate-800 text-sm">
                    Bấm để chọn file hoặc kéo thả file Excel vào đây
                  </span>
                  <span className="text-[11px] text-slate-500 mt-1">
                    Chấp nhận file <strong>.xlsx</strong>, <strong>.xls</strong> hoặc <strong>.csv</strong>
                  </span>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">{uploadedFileName}</div>
                      <div className="text-[11px] text-slate-500">
                        {isProcessingFile
                          ? 'Đang phân tích dữ liệu...'
                          : `Đã đọc thành công ${previewStudents.length} học sinh`}
                      </div>
                    </div>
                  </div>

                  <label className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors">
                    Chọn file khác
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              {/* Preview Table if students found */}
              {previewStudents.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Xem trước danh sách ({previewStudents.length} học sinh):
                    </span>
                    <button
                      onClick={() => {
                        setPreviewStudents([]);
                        setUploadedFileName(null);
                      }}
                      className="text-xs text-rose-600 hover:underline cursor-pointer"
                    >
                      Xóa danh sách
                    </button>
                  </div>

                  <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-xl bg-white shadow-2xs">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50 sticky top-0 text-[11px] text-slate-600 border-b border-slate-200 font-bold">
                        <tr>
                          <th className="py-2 px-2.5">STT</th>
                          <th className="py-2 px-2.5">Mã HS</th>
                          <th className="py-2 px-2.5">Họ và tên</th>
                          <th className="py-2 px-2.5">Giới tính</th>
                          <th className="py-2 px-2.5">Ngày sinh</th>
                          <th className="py-2 px-2.5">Lớp</th>
                          <th className="py-2 px-2.5">Số ĐT</th>
                          <th className="py-2 px-2.5">Phụ huynh</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[11px]">
                        {previewStudents.map((std, idx) => (
                          <tr key={idx} className="hover:bg-sky-50/40">
                            <td className="py-1.5 px-2.5 text-slate-500">{idx + 1}</td>
                            <td className="py-1.5 px-2.5 font-mono font-bold text-[#073B66]">{std.code}</td>
                            <td className="py-1.5 px-2.5 font-semibold text-slate-800">{std.fullName}</td>
                            <td className="py-1.5 px-2.5">
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  std.gender === 'Nữ'
                                    ? 'bg-rose-50 text-rose-700'
                                    : 'bg-blue-50 text-blue-700'
                                }`}
                              >
                                {std.gender}
                              </span>
                            </td>
                            <td className="py-1.5 px-2.5 text-slate-600">{std.dob || '-'}</td>
                            <td className="py-1.5 px-2.5 font-bold text-[#0878C9]">{std.className}</td>
                            <td className="py-1.5 px-2.5 text-slate-600">{std.phone || '-'}</td>
                            <td className="py-1.5 px-2.5 text-slate-600">{std.parentName || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mode 2: Paste CSV */}
          {importMode === 'paste' && (
            <div className="space-y-3">
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
                rows={5}
                placeholder="Dán nội dung tại đây..."
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                className="w-full p-3 font-mono border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0878C9]"
              />
            </div>
          )}

          {/* Result Notification */}
          {importResult && (
            <div
              className={`p-3 rounded-xl border ${
                importResult.errors.length > 0 && importResult.successCount === 0
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : importResult.errors.length > 0
                  ? 'bg-amber-50 border-amber-200 text-amber-800'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}
            >
              <div className="font-bold flex items-center gap-1.5">
                {importResult.successCount > 0 && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                Đã thêm thành công {importResult.successCount} học sinh vào hệ thống.
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

          {/* Dialog Action Buttons */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              onClick={() => {
                setIsImportModalOpen(false);
                setPreviewStudents([]);
                setUploadedFileName(null);
                setImportResult(null);
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer transition-colors"
            >
              Đóng
            </button>
            <button
              onClick={handleExecuteImport}
              disabled={
                isProcessingFile ||
                (importMode === 'upload' && previewStudents.length === 0) ||
                (importMode === 'paste' && !importText.trim())
              }
              className={`px-5 py-2 rounded-xl font-bold transition-colors cursor-pointer flex items-center gap-2 ${
                isProcessingFile ||
                (importMode === 'upload' && previewStudents.length === 0) ||
                (importMode === 'paste' && !importText.trim())
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-[#0878C9] hover:bg-[#073B66] text-white shadow-xs'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              {importMode === 'upload' && previewStudents.length > 0
                ? `Tiến hành nhập (${previewStudents.length} HS)`
                : 'Tiến hành nhập'}
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
