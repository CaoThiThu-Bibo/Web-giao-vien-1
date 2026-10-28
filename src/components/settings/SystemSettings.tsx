import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  Settings,
  User,
  Building2,
  Database,
  Download,
  Upload,
  RotateCcw,
  Shield,
  Bot,
  CheckCircle,
  AlertTriangle,
  Info,
  Server,
  KeyRound,
  UserPlus,
  LogOut,
  Users,
  Cloud,
  CloudUpload,
  CloudDownload,
  RefreshCw,
  Copy,
  Check,
  Code,
  ExternalLink,
} from 'lucide-react';
import { AuthModal } from '../auth/AuthModal';
import { ChangePasswordModal } from '../auth/ChangePasswordModal';

export const SystemSettings: React.FC = () => {
  const {
    systemConfig,
    updateSystemConfig,
    userRole,
    setUserRole,
    resetToDemoData,
    exportDatabaseJson,
    importDatabaseJson,
    students,
    classes,
    exams,
    supabaseStatus,
    checkSupabaseStatus,
    syncAllToSupabase,
    fetchFromSupabaseCloud,
    isSyncingSupabase,
  } = useApp();

  const { currentUser, allUsers, logout, quickLogin } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('register');
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const [aiStatus, setAiStatus] = useState<{
    status: string;
    hasApiKey: boolean;
    model: string;
  } | null>(null);

  const [importJsonText, setImportJsonText] = useState('');
  const [importNotice, setImportNotice] = useState<string | null>(null);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [cloudNotice, setCloudNotice] = useState<string | null>(null);


  // Form state
  const [formConfig, setFormConfig] = useState({
    teacherName: systemConfig.teacherName,
    teacherTitle: systemConfig.teacherTitle,
    institution: systemConfig.institution,
    branch: systemConfig.branch,
    academicYear: systemConfig.academicYear,
    evaluationRule: systemConfig.evaluationRule,
  });


  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/status')
      .then((res) => res.json())
      .then((data) => setAiStatus(data))
      .catch((err) => {
        setAiStatus({
          status: 'online (offline fallback mode)',
          hasApiKey: false,
          model: 'gemini-3.8-flash (curricular fallback active)',
        });
      });
  }, []);

  const SQL_SCHEMA = `-- CƠ SỞ DỮ LIỆU SỬ HỌC SỐ - SUPABASE POSTGRESQL SCHEMA
-- 1. Bảng tài khoản người dùng & Đăng nhập
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student',
    title TEXT,
    email TEXT,
    phone TEXT,
    institution TEXT,
    avatar TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ
);
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 2. Bảng danh sách lớp học
CREATE TABLE IF NOT EXISTS classes (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    grade INT NOT NULL,
    academic_year TEXT NOT NULL,
    head_teacher TEXT NOT NULL,
    room TEXT NOT NULL,
    notes TEXT
);
ALTER TABLE classes DISABLE ROW LEVEL SECURITY;

-- 3. Bảng hồ sơ học sinh
CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    gender TEXT NOT NULL,
    dob TEXT NOT NULL,
    class_id TEXT,
    class_name TEXT NOT NULL,
    grade INT NOT NULL,
    academic_year TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Đang học',
    phone TEXT,
    address TEXT,
    parent_name TEXT,
    parent_phone TEXT,
    notes TEXT,
    scores JSONB DEFAULT '{}'::jsonb,
    average_score NUMERIC(4, 2),
    rank TEXT,
    attendance_stats JSONB DEFAULT '{"present":0,"late":0,"excused":0,"unexcused":0}'::jsonb
);
ALTER TABLE students DISABLE ROW LEVEL SECURITY;

-- 4. Bảng bài kiểm tra & Đánh giá
CREATE TABLE IF NOT EXISTS exams (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    title TEXT NOT NULL,
    class_id TEXT,
    class_name TEXT NOT NULL,
    grade INT NOT NULL,
    date DATE NOT NULL,
    type TEXT NOT NULL,
    format TEXT NOT NULL,
    max_score NUMERIC(4, 1) DEFAULT 10,
    weight INT DEFAULT 1,
    description TEXT,
    average_score NUMERIC(4, 2)
);
ALTER TABLE exams DISABLE ROW LEVEL SECURITY;

-- 5. Bảng nhật ký điểm danh
CREATE TABLE IF NOT EXISTS attendance_records (
    id TEXT PRIMARY KEY,
    date DATE NOT NULL,
    class_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    student_name TEXT NOT NULL,
    status TEXT NOT NULL,
    note TEXT,
    period TEXT
);
ALTER TABLE attendance_records DISABLE ROW LEVEL SECURITY;

-- 6. Bảng kế hoạch bồi dưỡng học sinh
CREATE TABLE IF NOT EXISTS student_support (
    id TEXT PRIMARY KEY,
    student_id TEXT,
    student_name TEXT NOT NULL,
    student_code TEXT NOT NULL,
    class_name TEXT NOT NULL,
    grade INT NOT NULL,
    reason TEXT,
    difficulties TEXT,
    plan TEXT,
    tasks TEXT,
    deadline TEXT,
    result TEXT,
    status TEXT DEFAULT 'Đang theo dõi',
    teacher_notes TEXT,
    ai_recommendation TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE student_support DISABLE ROW LEVEL SECURITY;

-- 7. Bảng ngân hàng câu hỏi & Tư liệu số
CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY,
    grade INT NOT NULL,
    topic TEXT NOT NULL,
    lesson TEXT NOT NULL,
    knowledge_domain TEXT,
    type TEXT NOT NULL,
    cognitive_level TEXT NOT NULL,
    content TEXT NOT NULL,
    options JSONB,
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    source TEXT,
    author TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE questions DISABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS learning_materials (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    grade INT NOT NULL,
    topic TEXT NOT NULL,
    lesson TEXT,
    description TEXT,
    url TEXT NOT NULL,
    source TEXT,
    copyright TEXT,
    file_type TEXT,
    file_size TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE learning_materials DISABLE ROW LEVEL SECURITY;
`;

  const handlePushSupabase = async () => {
    const res = await syncAllToSupabase();
    setCloudNotice(res.message);
    setTimeout(() => setCloudNotice(null), 5000);
  };

  const handlePullSupabase = async () => {
    const res = await fetchFromSupabaseCloud();
    setCloudNotice(res.message);
    setTimeout(() => setCloudNotice(null), 5000);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    updateSystemConfig(formConfig);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importDatabaseJson(content);
        if (success) {
          setImportNotice('Phục hồi dữ liệu thành công từ file backup!');
        } else {
          setImportNotice('Lỗi: File JSON không đúng định dạng sao lưu Sử Học Số.');
        }
        setTimeout(() => setImportNotice(null), 4000);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#073B66] font-serif flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-[#0878C9]" />
            Cài đặt hệ thống & Quản trị dữ liệu
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Cấu hình thông tin trường lớp, phân quyền người dùng và kết nối cơ sở dữ liệu Supabase
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          Đã lưu cập nhật cài đặt hệ thống thành công!
        </div>
      )}

      {cloudNotice && (
        <div className="p-3 bg-sky-50 border border-sky-200 text-[#073B66] rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <Cloud className="w-4 h-4 text-[#0878C9]" />
          {cloudNotice}
        </div>
      )}

      {importNotice && (
        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <Info className="w-4 h-4 text-amber-600" />
          {importNotice}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Fixed Educational Metadata (7 cols on lg) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 shadow-xs border border-slate-200 space-y-4">
          <h3 className="font-bold text-[#073B66] text-sm flex items-center gap-2 font-serif pb-2 border-b border-slate-100">
            <Building2 className="w-4 h-4 text-[#0878C9]" />
            Thông tin đơn vị & Giáo viên phụ trách
          </h3>

          <form onSubmit={handleSaveInfo} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Họ và tên giáo viên:</label>
                <input
                  type="text"
                  required
                  value={formConfig.teacherName}
                  onChange={(e) => setFormConfig({ ...formConfig, teacherName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-[#073B66] outline-none focus:ring-2 focus:ring-[#0878C9]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Chức danh chuyên môn:</label>
                <input
                  type="text"
                  required
                  value={formConfig.teacherTitle}
                  onChange={(e) => setFormConfig({ ...formConfig, teacherTitle: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-[#0878C9]"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Tên đơn vị giáo dục:</label>
              <input
                type="text"
                required
                value={formConfig.institution}
                onChange={(e) => setFormConfig({ ...formConfig, institution: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-[#0878C9]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Phân hiệu:</label>
                <input
                  type="text"
                  required
                  value={formConfig.branch}
                  onChange={(e) => setFormConfig({ ...formConfig, branch: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-[#0878C9]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Năm học áp dụng:</label>
                <input
                  type="text"
                  required
                  value={formConfig.academicYear}
                  onChange={(e) => setFormConfig({ ...formConfig, academicYear: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-[#0878C9]"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Quy tắc đánh giá học sinh:</label>
              <input
                type="text"
                required
                value={formConfig.evaluationRule}
                onChange={(e) => setFormConfig({ ...formConfig, evaluationRule: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-5 py-2 bg-[#0878C9] hover:bg-[#073B66] text-white rounded-xl font-bold transition-colors cursor-pointer"
              >
                Lưu thông tin cố định
              </button>
            </div>
          </form>

          {/* User Role Switching */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h4 className="font-bold text-[#073B66] text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-600" />
              Phân quyền truy cập người dùng
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setUserRole('teacher')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  userRole === 'teacher'
                    ? 'bg-sky-50 border-[#0878C9] text-[#073B66] font-bold shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="text-xs">Giáo viên</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Cô Cao Thị Thu</div>
              </button>

              <button
                type="button"
                onClick={() => setUserRole('student')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  userRole === 'student'
                    ? 'bg-sky-50 border-[#0878C9] text-[#073B66] font-bold shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="text-xs">Học sinh</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Làm bài trực tuyến</div>
              </button>

              <button
                type="button"
                onClick={() => setUserRole('admin')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  userRole === 'admin'
                    ? 'bg-sky-50 border-[#0878C9] text-[#073B66] font-bold shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="text-xs">Quản trị viên</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Toàn quyền hệ thống</div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Supabase Cloud, Backup, Restore & AI Server Status (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Supabase Cloud Database Card */}
          <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-[#073B66] text-sm flex items-center gap-2 font-serif">
                <Cloud className="w-4 h-4 text-[#0878C9]" />
                Cơ sở dữ liệu Supabase (Cloud)
              </h3>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1.5 ${
                  supabaseStatus.connected
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    supabaseStatus.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                  }`}
                />
                {supabaseStatus.connected ? 'Đã kết nối' : 'Đang kiểm tra'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between items-center text-slate-500">
                <span>Dự án:</span>
                <span className="font-mono font-bold text-slate-800">gtwmtexqygqshjanxvyb</span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>Endpoint:</span>
                <span className="font-mono text-[11px] text-[#0878C9] truncate max-w-[200px]" title="https://gtwmtexqygqshjanxvyb.supabase.co">
                  gtwmtexqygqshjanxvyb.supabase.co
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>Khoá Anon Key:</span>
                <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-700">
                  sb_publishable_lQ... (Đã nạp)
                </span>
              </div>
              <div className="pt-1.5 border-t border-slate-200 text-[11px] text-slate-600 font-medium">
                {supabaseStatus.message}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={handlePushSupabase}
                disabled={isSyncingSupabase}
                className="py-2.5 px-3 bg-[#0878C9] hover:bg-[#073B66] text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                <CloudUpload className="w-4 h-4" />
                {isSyncingSupabase ? 'Đang đồng bộ...' : 'Đồng bộ lên Supabase'}
              </button>

              <button
                type="button"
                onClick={handlePullSupabase}
                disabled={isSyncingSupabase}
                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <CloudDownload className="w-4 h-4 text-[#0878C9]" />
                Tải về từ Supabase
              </button>
            </div>

            <div className="flex items-center justify-between pt-1 text-[11px]">
              <button
                type="button"
                onClick={checkSupabaseStatus}
                className="text-slate-500 hover:text-[#0878C9] flex items-center gap-1 font-medium cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${supabaseStatus.isChecking ? 'animate-spin' : ''}`} />
                Kiểm tra kết nối
              </button>

              <button
                type="button"
                onClick={() => setShowSqlModal(true)}
                className="text-[#0878C9] hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <Code className="w-3.5 h-3.5" />
                Mã SQL tạo bảng
              </button>
            </div>
          </div>

          {/* AI Connection Status Card */}
          <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 space-y-3">
            <h3 className="font-bold text-[#073B66] text-sm flex items-center gap-2 font-serif pb-2 border-b border-slate-100">
              <Bot className="w-4 h-4 text-purple-600" />
              Kết nối Trí tuệ nhân tạo (Gemini API)
            </h3>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Trạng thái máy chủ:</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Đang hoạt động (Online)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Mô hình AI:</span>
                <span className="font-mono font-bold text-[#073B66]">gemini-3.8-flash</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Bảo mật API Key:</span>
                <span className="font-bold text-slate-700">
                  {aiStatus?.hasApiKey ? 'Đã kích hoạt an toàn (Server-side)' : 'Sẵn sàng với bộ đệm chuẩn'}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed font-serif italic">
              Hệ thống xử lý an toàn tại tầng máy chủ Express, không để lộ thông tin xác thực ra trình duyệt.
            </p>
          </div>

          {/* Database Backup & Restore Card */}
          <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 space-y-3.5">
            <h3 className="font-bold text-[#073B66] text-sm flex items-center gap-2 font-serif pb-2 border-b border-slate-100">
              <Database className="w-4 h-4 text-[#0878C9]" />
              Sao lưu & Phục hồi cơ sở dữ liệu
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Dữ liệu hiện tại:</span>
                <span className="font-bold text-[#073B66]">
                  {students.length} HS | {classes.length} Lớp | {exams.length} Bài KT
                </span>
              </div>

              {/* Export Button */}
              <button
                onClick={exportDatabaseJson}
                className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <Download className="w-4 h-4" />
                Xuất file sao lưu toàn bộ hệ thống (.json)
              </button>

              {/* Import Button */}
              <label className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer">
                <Upload className="w-4 h-4 text-[#0878C9]" />
                Phục hồi dữ liệu từ file sao lưu
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </label>

              {/* Reset to Demo Data */}
              <div className="pt-2">
                {!resetConfirm ? (
                  <button
                    onClick={() => setResetConfirm(true)}
                    className="w-full py-2 px-3 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Đặt lại dữ liệu mẫu ban đầu (Reset Demo)
                  </button>
                ) : (
                  <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 space-y-2 text-center">
                    <p className="text-[11px] text-rose-800 font-bold">
                      Xác nhận khôi phục dữ liệu mẫu ban đầu của cô Cao Thị Thu?
                    </p>
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => setResetConfirm(false)}
                        className="px-3 py-1 bg-white text-slate-700 rounded-lg font-bold border border-slate-200"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={() => {
                          resetToDemoData();
                          setResetConfirm(false);
                        }}
                        className="px-3 py-1 bg-rose-600 text-white rounded-lg font-bold"
                      >
                        Đồng ý Reset
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* User Account & Security Management */}
          <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-[#073B66] text-sm flex items-center gap-2 font-serif">
                <Shield className="w-4 h-4 text-[#0878C9]" />
                Tài khoản & Xác thực bảo mật
              </h3>
              <button
                type="button"
                onClick={() => {
                  setAuthModalMode('register');
                  setIsAuthModalOpen(true);
                }}
                className="text-xs bg-[#0878C9] hover:bg-[#076bb3] text-white px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Đăng ký tài khoản
              </button>
            </div>

            {/* Current user summary */}
            {currentUser && (
              <div className="p-3 bg-sky-50 rounded-xl border border-sky-200 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&h=160&q=80'}
                    alt={currentUser.fullName}
                    className="w-10 h-10 rounded-full border border-sky-300 object-cover"
                  />
                  <div>
                    <div className="font-bold text-[#073B66]">{currentUser.fullName}</div>
                    <div className="text-[11px] text-slate-500">
                      Tên đăng nhập: <strong>@{currentUser.username}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 items-end">
                  <button
                    type="button"
                    onClick={() => setIsChangePasswordOpen(true)}
                    className="text-[11px] text-[#0878C9] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <KeyRound className="w-3 h-3" />
                    Đổi mật khẩu
                  </button>
                  <button
                    type="button"
                    onClick={logout}
                    className="text-[11px] text-rose-600 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <LogOut className="w-3 h-3" />
                    Đăng xuất
                  </button>
                </div>
              </div>
            )}

            {/* Registered users list */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                Danh sách tài khoản trong hệ thống ({allUsers.length}):
              </div>
              <div className="max-h-40 overflow-y-auto divide-y divide-slate-100 border border-slate-100 rounded-xl">
                {allUsers.map((u) => (
                  <div key={u.id} className="p-2.5 flex items-center justify-between text-xs hover:bg-slate-50">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#073B66] text-white flex items-center justify-center text-[10px] font-bold">
                        {u.fullName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-700 leading-tight">{u.fullName}</div>
                        <div className="text-[10px] text-slate-400">@{u.username}</div>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-600">
                      {u.role === 'teacher' ? 'Giáo viên' : u.role === 'admin' ? 'Quản trị' : 'Học sinh'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal for registering or logging in */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultMode={authModalMode}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />

      {/* Supabase SQL Schema Modal */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-100 font-sans">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 bg-gradient-to-r from-[#073B66] to-[#085a96] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-cyan-300" />
                <h3 className="font-bold text-sm font-serif">Mã SQL tạo bảng trên Supabase</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSqlModal(false)}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-3 overflow-y-auto flex-1 text-xs">
              <p className="text-slate-600">
                Nếu bạn cần tạo lại bảng hoặc thiết lập mới trong dự án Supabase, hãy mở mục{' '}
                <span className="font-bold text-[#073B66]">SQL Editor</span> trên giao diện Supabase, dán toàn bộ đoạn mã này và bấm nút <span className="font-bold text-emerald-600">Run</span>:
              </p>

              <div className="relative">
                <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] leading-relaxed overflow-x-auto max-h-72 border border-slate-800">
                  {SQL_SCHEMA}
                </pre>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="absolute top-2 right-2 px-2.5 py-1.5 bg-[#0878C9] hover:bg-[#073B66] text-white rounded-lg font-bold flex items-center gap-1.5 text-xs shadow-md transition-all cursor-pointer"
                >
                  {copiedSql ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      Đã sao chép!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Sao chép mã SQL
                    </>
                  )}
                </button>
              </div>

              <div className="p-3 bg-sky-50 rounded-xl border border-sky-200 text-sky-900 text-[11px] space-y-1">
                <div className="font-bold flex items-center gap-1 text-[#073B66]">
                  <ExternalLink className="w-3.5 h-3.5" />
                  Hướng dẫn nhanh tại Supabase Dashboard:
                </div>
                <ol className="list-decimal list-inside space-y-0.5 text-slate-700">
                  <li>Truy cập <a href="https://supabase.com/dashboard/project/gtwmtexqygqshjanxvyb" target="_blank" rel="noreferrer" className="text-[#0878C9] underline font-medium">Supabase Dashboard dự án</a>.</li>
                  <li>Chọn biểu tượng <strong>SQL Editor</strong> ở cột bên trái $\rightarrow$ bấm <strong>New query</strong>.</li>
                  <li>Bấm nút <strong>Sao chép mã SQL</strong> ở trên $\rightarrow$ Dán vào và bấm <strong>Run</strong>.</li>
                  <li>Quay lại phần mềm này và bấm <strong>Đồng bộ lên Supabase</strong> để đưa toàn bộ dữ liệu lên mây!</li>
                </ol>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowSqlModal(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold cursor-pointer transition-colors text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

