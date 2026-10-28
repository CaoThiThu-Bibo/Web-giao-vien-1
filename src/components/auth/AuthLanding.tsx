import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  Sparkles,
  GraduationCap,
  History,
  Award,
  Users,
  Compass,
} from 'lucide-react';
import { UserRole } from '../../types';

interface AuthLandingProps {
  onBypassAsGuest?: () => void;
}

export const AuthLanding: React.FC<AuthLandingProps> = ({ onBypassAsGuest }) => {
  const { login, register, quickLogin, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register form state
  const [regUsername, setRegUsername] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('teacher');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Notifications
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!username.trim()) {
      setErrorMsg('Vui lòng nhập tên đăng nhập.');
      return;
    }
    if (!password) {
      setErrorMsg('Vui lòng nhập mật khẩu.');
      return;
    }

    const res = await login(username, password);
    if (!res.success) {
      setErrorMsg(res.message);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (regUsername.trim().length < 3) {
      setErrorMsg('Tên đăng nhập phải có ít nhất 3 ký tự.');
      return;
    }
    if (!/^[a-zA-Z0-9_.-]+$/.test(regUsername.trim())) {
      setErrorMsg('Tên đăng nhập chỉ gồm chữ cái, chữ số và dấu gạch dưới (không dấu cách).');
      return;
    }
    if (!regFullName.trim()) {
      setErrorMsg('Vui lòng nhập họ và tên của bạn.');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMsg('Mật khẩu tối thiểu 6 ký tự.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không khớp.');
      return;
    }

    const res = await register({
      username: regUsername,
      fullName: regFullName,
      role: regRole,
      password: regPassword,
      email: regEmail,
      phone: regPhone,
    });

    if (!res.success) {
      setErrorMsg(res.message);
    }
  };

  const handleQuickLogin = async (role: UserRole) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    await quickLogin(role);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#041F38] via-[#073B66] to-[#0a487c] flex flex-col justify-between text-slate-800 font-serif selection:bg-cyan-500 selection:text-white">
      {/* Top Bar Banner */}
      <header className="w-full border-b border-cyan-500/20 bg-slate-950/30 backdrop-blur-md px-4 py-3 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0878C9] to-[#073B66] border border-cyan-300/40 flex items-center justify-center text-white shadow-lg">
            <BookOpen className="w-6 h-6 text-cyan-200" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wider text-white">SỬ HỌC SỐ</h1>
            <p className="text-[11px] text-cyan-200 font-sans tracking-wide">
              Phân hiệu Tiên Yên – Trung tâm GDNN - GDTX TP Quảng Ninh
            </p>
          </div>
        </div>

        {onBypassAsGuest && (
          <button
            onClick={onBypassAsGuest}
            className="text-xs text-cyan-200 hover:text-white bg-white/10 hover:bg-white/20 px-3.5 py-1.5 rounded-lg border border-cyan-300/30 transition-all font-sans cursor-pointer"
          >
            Xem trước giao diện &rarr;
          </button>
        )}
      </header>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12">
        <div className="w-full max-w-5xl bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Left Column: Branding, Mission & Highlights */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#073B66] via-[#085a96] to-[#0878C9] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
            {/* Pattern Overlay */}
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(circle at 20% 20%, white 1px, transparent 1px)`,
                backgroundSize: '24px 24px',
              }}
            />

            <div className="relative z-10 space-y-6">
              <div>
                <span className="inline-block px-3 py-1 rounded-full text-[10px] font-sans font-bold uppercase tracking-widest bg-cyan-400/20 border border-cyan-300/40 text-cyan-200 mb-3">
                  Cổng Thông Tin Xác Thực
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold leading-tight drop-shadow-sm">
                  Hệ Thống Quản Lý & Dạy Học Lịch Sử
                </h2>
                <p className="text-xs sm:text-sm text-cyan-100/90 mt-2 font-sans leading-relaxed">
                  Đồng hành cùng cô giáo <strong>Cao Thị Thu</strong> và học viên trong hành trình tiếp cận tri thức lịch sử dân tộc thời đại số.
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="space-y-3 font-sans text-xs">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/10 border border-white/10 backdrop-blur-sm">
                  <div className="w-8 h-8 rounded-lg bg-cyan-400/20 flex items-center justify-center shrink-0">
                    <History className="w-4 h-4 text-cyan-200" />
                  </div>
                  <div>
                    <strong className="block text-white">Số hóa Kế hoạch & Học liệu</strong>
                    <span className="text-cyan-100/80 text-[11px]">Chuẩn GDPT 2018 môn Lịch sử</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/10 border border-white/10 backdrop-blur-sm">
                  <div className="w-8 h-8 rounded-lg bg-emerald-400/20 flex items-center justify-center shrink-0">
                    <Award className="w-4 h-4 text-emerald-300" />
                  </div>
                  <div>
                    <strong className="block text-white">Sổ điểm & Khảo thí Thông minh</strong>
                    <span className="text-cyan-100/80 text-[11px]">Đánh giá thường xuyên, xếp loại học lực</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/10 border border-white/10 backdrop-blur-sm">
                  <div className="w-8 h-8 rounded-lg bg-amber-400/20 flex items-center justify-center shrink-0">
                    <Compass className="w-4 h-4 text-amber-300" />
                  </div>
                  <div>
                    <strong className="block text-white">Phòng học & Trợ lý Sư phạm</strong>
                    <span className="text-cyan-100/80 text-[11px]">Tư vấn cá nhân hóa và đề thi trực tuyến</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quote Footer */}
            <div className="relative z-10 pt-6 mt-6 border-t border-cyan-400/20">
              <p className="text-xs italic text-cyan-100">
                &ldquo;Dân ta phải biết sử ta, cho tường gốc tích nước nhà Việt Nam.&rdquo;
              </p>
              <span className="block text-[11px] font-bold text-cyan-300 font-sans mt-1">
                — Chủ tịch Hồ Chí Minh
              </span>
            </div>
          </div>

          {/* Right Column: Auth Card (Login / Register) */}
          <div className="lg:col-span-7 p-6 sm:p-10 font-sans flex flex-col justify-center">
            {/* Tab Header */}
            <div className="flex border-b border-slate-200 mb-6">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 pb-3 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
                  activeTab === 'login'
                    ? 'border-[#0878C9] text-[#073B66]'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <LogIn className="w-4 h-4" />
                ĐĂNG NHẬP
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 pb-3 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
                  activeTab === 'register'
                    ? 'border-[#0878C9] text-[#073B66]'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                ĐĂNG KÝ TÀI KHOẢN
              </button>
            </div>

            {/* Alerts */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {activeTab === 'login' ? (
              /* LOGIN FORM */
              <div className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                      Tên đăng nhập
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Nhập tên đăng nhập (vd: caothithu, admin, hocsinh)"
                        className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:border-[#0878C9] focus:ring-2 focus:ring-[#0878C9]/20 outline-none transition-all"
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                      Mật khẩu
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Nhập mật khẩu..."
                        className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-xl text-sm focus:border-[#0878C9] focus:ring-2 focus:ring-[#0878C9]/20 outline-none transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                        aria-label="Ẩn hiện mật khẩu"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input type="checkbox" defaultChecked className="rounded border-slate-300 text-[#0878C9] focus:ring-[#0878C9]" />
                      Ghi nhớ đăng nhập
                    </label>
                    <span className="text-[#0878C9] hover:underline cursor-pointer">
                      Quên mật khẩu?
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-gradient-to-r from-[#073B66] to-[#0878C9] hover:from-[#062f52] hover:to-[#076bb3] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <LogIn className="w-4 h-4" />
                    {isLoading ? 'Đang xác thực...' : 'ĐĂNG NHẬP VÀO HỆ THỐNG'}
                  </button>
                </form>

                {/* Quick login cards */}
                <div className="pt-4 border-t border-slate-200">
                  <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 mb-2.5 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Tài khoản mẫu thử nghiệm (Click để vào ngay):
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('teacher')}
                      className="p-2.5 rounded-xl border border-sky-200 bg-sky-50/70 hover:bg-sky-100 hover:border-sky-300 transition-all text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#073B66]">
                        <GraduationCap className="w-3.5 h-3.5 text-[#0878C9]" />
                        Cô Cao Thị Thu
                      </div>
                      <div className="text-[10px] text-slate-500">Giáo viên (caothithu)</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickLogin('admin')}
                      className="p-2.5 rounded-xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100 hover:border-purple-300 transition-all text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900">
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                        Quản trị viên
                      </div>
                      <div className="text-[10px] text-slate-500">Admin (admin)</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickLogin('student')}
                      className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 hover:border-emerald-300 transition-all text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                        <Users className="w-3.5 h-3.5 text-emerald-600" />
                        Học sinh An
                      </div>
                      <div className="text-[10px] text-slate-500">Học viên K10 (hocsinh)</div>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* REGISTER FORM */
              <form onSubmit={handleRegister} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                      Tên đăng nhập <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      placeholder="vd: giaovien.lan, nam.k10"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-[#0878C9] outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                      Vai trò <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value as UserRole)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-[#0878C9] outline-none bg-white font-medium"
                    >
                      <option value="teacher">Giáo viên Lịch sử</option>
                      <option value="student">Học sinh / Học viên GDTX</option>
                      <option value="admin">Cán bộ Quản trị</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Họ và tên đầy đủ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Thị Mai"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-[#0878C9] outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                      Mật khẩu <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Tối thiểu 6 ký tự"
                        className="w-full pl-3 pr-8 py-2 border border-slate-300 rounded-xl text-sm focus:border-[#0878C9] outline-none"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      >
                        {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                      Xác nhận mật khẩu <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-[#0878C9] outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">
                      Email liên hệ
                    </label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="tuychon@example.com"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-[#0878C9] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="0988..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-[#0878C9] outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <UserPlus className="w-4 h-4" />
                    {isLoading ? 'Đang tạo tài khoản...' : 'HOÀN TẤT ĐĂNG KÝ VÀ ĐĂNG NHẬP'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full text-center py-3 text-cyan-200/80 text-xs font-sans border-t border-cyan-500/20 bg-slate-950/20">
        © 2026 SỬ HỌC SỐ – Bản quyền thuộc Trung tâm GDNN – GDTX thành phố Quảng Ninh, Phân hiệu Tiên Yên.
      </footer>
    </div>
  );
};
