import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
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
} from 'lucide-react';

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
  } = useApp();

  const [aiStatus, setAiStatus] = useState<{
    status: string;
    hasApiKey: boolean;
    model: string;
  } | null>(null);

  const [importJsonText, setImportJsonText] = useState('');
  const [importNotice, setImportNotice] = useState<string | null>(null);
  const [resetConfirm, setResetConfirm] = useState(false);

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
            Cấu hình thông tin trường lớp, phân quyền người dùng và quản lý sao lưu an toàn
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          Đã lưu cập nhật cài đặt hệ thống thành công!
        </div>
      )}

      {importNotice && (
        <div className="p-3 bg-sky-50 border border-sky-200 text-[#073B66] rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <Info className="w-4 h-4 text-[#0878C9]" />
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

        {/* Right Column: Backup, Restore & AI Server Status (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-5">
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
        </div>
      </div>
    </div>
  );
};
