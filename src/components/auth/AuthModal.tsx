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
  X,
  Phone,
  Mail,
} from 'lucide-react';
import { UserRole } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  defaultMode?: 'login' | 'register';
  isGatekeeper?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'login',
  isGatekeeper = false,
}) => {
  const { login, register, quickLogin, isLoading } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);

  // Login form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form state
  const [regUsername, setRegUsername] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('teacher');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Feedback states
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!loginUsername.trim()) {
      setErrorMsg('Vui lòng nhập tên đăng nhập.');
      return;
    }
    if (!loginPassword) {
      setErrorMsg('Vui lòng nhập mật khẩu.');
      return;
    }

    const res = await login(loginUsername, loginPassword);
    if (res.success) {
      setSuccessMsg(res.message);
      setTimeout(() => {
        if (onClose) onClose();
      }, 700);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (regUsername.trim().length < 3) {
      setErrorMsg('Tên đăng nhập phải có ít nhất 3 ký tự.');
      return;
    }
    if (!/^[a-zA-Z0-9_.-]+$/.test(regUsername.trim())) {
      setErrorMsg('Tên đăng nhập chỉ gồm chữ cái, số, dấu chấm hoặc gạch dưới (không dấu cách).');
      return;
    }
    if (!regFullName.trim()) {
      setErrorMsg('Vui lòng nhập họ và tên của bạn.');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMsg('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại!');
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

    if (res.success) {
      setSuccessMsg(res.message);
      setTimeout(() => {
        if (onClose) onClose();
      }, 900);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleQuickLogin = async (role: UserRole) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    const res = await quickLogin(role);
    if (res.success) {
      setSuccessMsg(res.message);
      setTimeout(() => {
        if (onClose) onClose();
      }, 600);
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
        isGatekeeper ? 'bg-[#041F38]/95 backdrop-blur-md' : 'bg-slate-900/70 backdrop-blur-sm'
      }`}
    >
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header Ribbon */}
        <div className="relative bg-gradient-to-r from-[#073B66] via-[#085a96] to-[#073B66] text-white px-6 py-5 text-center">
          {onClose && !isGatekeeper && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 border border-white/20 mb-2 shadow-inner">
            <BookOpen className="w-6 h-6 text-cyan-200" />
          </div>

          <h3 className="text-xl sm:text-2xl font-bold font-serif tracking-wide text-white">
            SỬ HỌC SỐ
          </h3>
          <p className="text-xs text-cyan-100 font-medium mt-0.5">
            Trung tâm GDNN – GDTX thành phố Quảng Ninh - Phân hiệu Tiên Yên
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors cursor-pointer ${
              mode === 'login'
                ? 'border-[#0878C9] text-[#073B66] bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <LogIn className="w-4 h-4 text-[#0878C9]" />
            ĐĂNG NHẬP
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors cursor-pointer ${
              mode === 'register'
                ? 'border-[#0878C9] text-[#073B66] bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <UserPlus className="w-4 h-4 text-[#0878C9]" />
            ĐĂNG KÝ TÀI KHOẢN
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-7 max-h-[75vh] overflow-y-auto">
          {/* Alerts */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Mode 1: Login Form */}
          {mode === 'login' ? (
            <div>
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Tên đăng nhập
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      placeholder="Ví dụ: caothithu hoặc admin hoặc hocsinh"
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
                      type={showLoginPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Nhập mật khẩu của bạn..."
                      className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-xl text-sm focus:border-[#0878C9] focus:ring-2 focus:ring-[#0878C9]/20 outline-none transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
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

              {/* Demo Accounts Quick Login */}
              <div className="mt-6 pt-5 border-t border-slate-200">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Đăng nhập nhanh với tài khoản mẫu:
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('teacher')}
                    className="p-2.5 rounded-xl border border-sky-200 bg-sky-50/70 hover:bg-sky-100 hover:border-sky-300 transition-all text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#073B66]">
                      <GraduationCap className="w-3.5 h-3.5 text-[#0878C9]" />
                      Cô Cao Thị Thu
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Giáo viên (caothithu)</div>
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
                    <div className="text-[11px] text-slate-500 mt-0.5">Admin hệ thống (admin)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('student')}
                    className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 hover:border-emerald-300 transition-all text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                      <User className="w-3.5 h-3.5 text-emerald-600" />
                      Học sinh An
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Học viên K10 (hocsinh)</div>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Mode 2: Register Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Tên đăng nhập <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      placeholder="vd: thu.lichsu"
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-[#0878C9] outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Vai trò tài khoản <span className="text-rose-500">*</span>
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
                  placeholder="Ví dụ: Cô giáo Nguyễn Thị Mai hoặc Học sinh Trần Văn Bình"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:border-[#0878C9] outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Mật khẩu <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Ít nhất 6 ký tự"
                      className="w-full pl-9 pr-8 py-2 border border-slate-300 rounded-xl text-sm focus:border-[#0878C9] outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Xác nhận mật khẩu <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu"
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-[#0878C9] outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">
                    Email liên hệ (tùy chọn)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-[#0878C9] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">
                    Số điện thoại (tùy chọn)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="0988..."
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-[#0878C9] outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <UserPlus className="w-4 h-4" />
                  {isLoading ? 'Đang tạo tài khoản...' : 'HOÀN TẤT ĐĂNG KÝ TÀI KHOẢN'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-500">
          Hệ thống bảo mật giáo dục – Dữ liệu được mã hóa và lưu trữ an toàn.
        </div>
      </div>
    </div>
  );
};
