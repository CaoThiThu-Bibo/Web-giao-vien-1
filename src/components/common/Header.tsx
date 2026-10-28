import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  Bell,
  Settings,
  BookOpen,
  GraduationCap,
  LogIn,
  UserPlus,
  LogOut,
  KeyRound,
  ShieldCheck,
  User,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { AuthModal } from '../auth/AuthModal';
import { ChangePasswordModal } from '../auth/ChangePasswordModal';

export const Header: React.FC = () => {
  const {
    systemConfig,
    notifications,
    markNotificationRead,
    clearAllNotifications,
    setActiveTab,
    setUserRole,
    supabaseStatus,
  } = useApp();

  const { currentUser, isAuthenticated, logout, quickLogin } = useAuth();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
    setShowUserMenu(false);
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'admin':
        return { label: 'Quản trị viên', bg: 'bg-purple-500/20 text-purple-200 border-purple-400/40' };
      case 'student':
        return { label: 'Học sinh GDTX', bg: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40' };
      case 'teacher':
      default:
        return { label: 'Giáo viên', bg: 'bg-[#0878C9] text-cyan-200 border-cyan-300/40' };
    }
  };

  const currentRole = currentUser?.role || systemConfig.activeRole;
  const roleBadge = getRoleBadge(currentRole);

  return (
    <>
      <header className="relative w-full bg-gradient-to-r from-[#073B66] via-[#085a96] to-[#073B66] text-white shadow-md border-b border-[#0878C9]/40 select-none overflow-visible z-30">
        {/* Subtle cultural landmark silhouette backdrop */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none bg-cover bg-center"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M0,120 L0,80 Q200,40 400,75 T800,60 T1200,80 L1200,120 Z' fill='%23ffffff'/%3E%3Cpath d='M580,75 L620,75 L610,45 L590,45 Z' fill='%23ffffff'/%3E%3Ccircle cx='600' cy='35' r='8' fill='%23ffffff'/%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative mx-auto px-4 lg:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
          {/* Left: Brand Identity */}
          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer group transition-transform active:scale-98"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#0878C9] to-[#073B66] border border-[#DDF1FF]/40 shadow-inner flex items-center justify-center p-2 text-white group-hover:border-white transition-colors">
              <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 text-[#DDF1FF]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-bold tracking-wider text-white drop-shadow-sm font-serif">
                  SỬ HỌC SỐ
                </span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-[#0878C9] border border-[#DDF1FF]/50 text-[#DDF1FF]">
                  Tiên Yên
                </span>
              </div>
              <span className="text-xs text-[#DDF1FF]/90 font-medium">
                Hệ thống hỗ trợ dạy học môn Lịch sử
              </span>
            </div>
          </div>

          {/* Center: Institution and Slogan */}
          <div className="hidden xl:flex flex-col items-center justify-center text-center px-4">
            <div className="text-[13px] font-bold tracking-wide uppercase text-white/95 drop-shadow-sm font-sans">
              {systemConfig.institution}
            </div>
            <div className="text-xs text-[#DDF1FF] font-semibold tracking-wider uppercase mt-0.5 font-sans">
              {systemConfig.branch}
            </div>
            <div className="text-[11px] text-cyan-200 italic font-serif mt-0.5 tracking-wide flex items-center gap-1.5">
              <span className="inline-block w-4 h-[1px] bg-cyan-300/60"></span>
              Hiểu lịch sử - Vững tương lai
              <span className="inline-block w-4 h-[1px] bg-cyan-300/60"></span>
            </div>
          </div>

          {/* Right: User Profile & Actions */}
          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            {isAuthenticated && currentUser ? (
              /* LOGGED IN USER SECTION */
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 sm:gap-2.5 px-2 py-1 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 transition-colors cursor-pointer group"
                >
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full border-2 border-cyan-300/80 overflow-hidden bg-slate-200 flex items-center justify-center shadow-md">
                      <img
                        src={currentUser.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&h=160&q=80'}
                        alt={currentUser.fullName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#073B66] rounded-full" />
                  </div>

                  <div className="hidden md:flex flex-col text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs sm:text-sm font-bold text-white leading-tight font-serif">
                        {currentUser.fullName}
                      </span>
                      <span className={`text-[9px] uppercase px-1.5 py-0.2 rounded border font-sans font-semibold ${roleBadge.bg}`}>
                        {roleBadge.label}
                      </span>
                    </div>
                    <span className="text-[10px] text-cyan-200 leading-tight font-sans">
                      @{currentUser.username}
                    </span>
                  </div>

                  <ChevronDown className="w-3.5 h-3.5 text-cyan-200 group-hover:text-white transition-transform" />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 text-slate-800 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 font-sans">
                    {/* User info banner */}
                    <div className="p-4 bg-gradient-to-r from-[#073B66] to-[#085a96] text-white">
                      <div className="flex items-center gap-3">
                        <img
                          src={currentUser.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&h=160&q=80'}
                          alt={currentUser.fullName}
                          className="w-12 h-12 rounded-full border-2 border-white/60 object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm truncate font-serif">{currentUser.fullName}</h4>
                          <p className="text-xs text-cyan-200 truncate">@{currentUser.username}</p>
                          <span className="inline-block mt-1 text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-semibold">
                            {currentUser.title || roleBadge.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick switch account */}
                    <div className="p-3 bg-slate-50 border-b border-slate-100">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        Chuyển nhanh tài khoản mẫu:
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            quickLogin('teacher');
                            setShowUserMenu(false);
                          }}
                          className={`p-1.5 rounded-lg border text-[11px] font-medium transition-colors cursor-pointer ${
                            currentUser.role === 'teacher'
                              ? 'bg-[#073B66] text-white border-[#073B66]'
                              : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          Cô Thu
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            quickLogin('admin');
                            setShowUserMenu(false);
                          }}
                          className={`p-1.5 rounded-lg border text-[11px] font-medium transition-colors cursor-pointer ${
                            currentUser.role === 'admin'
                              ? 'bg-purple-900 text-white border-purple-900'
                              : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          Admin
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            quickLogin('student');
                            setShowUserMenu(false);
                          }}
                          className={`p-1.5 rounded-lg border text-[11px] font-medium transition-colors cursor-pointer ${
                            currentUser.role === 'student'
                              ? 'bg-emerald-800 text-white border-emerald-800'
                              : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          Học sinh
                        </button>
                      </div>
                    </div>

                    {/* Menu actions */}
                    <div className="p-2 divide-y divide-slate-100 text-xs">
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            setActiveTab('settings');
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-700 font-medium transition-colors text-left cursor-pointer"
                        >
                          <Settings className="w-4 h-4 text-slate-500" />
                          <span>Thông tin hệ thống & Cài đặt</span>
                        </button>
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            setIsChangePasswordOpen(true);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-700 font-medium transition-colors text-left cursor-pointer"
                        >
                          <KeyRound className="w-4 h-4 text-[#0878C9]" />
                          <span>Đổi mật khẩu</span>
                        </button>
                        <button
                          onClick={() => handleOpenAuth('register')}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-700 font-medium transition-colors text-left cursor-pointer"
                        >
                          <UserPlus className="w-4 h-4 text-emerald-600" />
                          <span>Đăng ký tài khoản khác</span>
                        </button>
                      </div>

                      <div className="pt-1">
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-rose-50 text-rose-600 font-bold transition-colors text-left cursor-pointer"
                        >
                          <LogOut className="w-4 h-4 text-rose-500" />
                          <span>Đăng xuất tài khoản</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* GUEST STATE: SHOW LOGIN / REGISTER BUTTONS */
              <div className="flex items-center gap-2 font-sans">
                <button
                  type="button"
                  onClick={() => handleOpenAuth('login')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5 text-cyan-200" />
                  Đăng nhập
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenAuth('register')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0878C9] hover:bg-[#076bb3] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Đăng ký
                </button>
              </div>
            )}

            {/* Notification Button */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg bg-white/10 hover:bg-white/20 text-[#DDF1FF] hover:text-white transition-colors cursor-pointer"
                aria-label="Thông báo"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 text-slate-800 z-50 overflow-hidden font-sans">
                  <div className="flex items-center justify-between px-4 py-3 bg-[#073B66] text-white">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-cyan-300" />
                      <span className="font-bold text-sm">Thông báo hệ thống</span>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={clearAllNotifications}
                        className="text-xs text-cyan-200 hover:text-white underline cursor-pointer"
                      >
                        Đã đọc tất cả
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 text-sm">
                        Không có thông báo mới
                      </div>
                    ) : (
                      notifications.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => markNotificationRead(item.id)}
                          className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer ${
                            !item.read ? 'bg-sky-50/60 font-medium' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-xs font-bold text-[#073B66] leading-snug">
                              {item.title}
                            </h4>
                            <span className="text-[10px] text-slate-400 shrink-0">
                              {item.date}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                            {item.content}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-2.5 bg-slate-50 text-center border-t border-slate-200">
                    <button
                      onClick={() => {
                        setShowNotifications(false);
                        setActiveTab('dashboard');
                      }}
                      className="text-xs text-[#0878C9] font-bold hover:underline cursor-pointer"
                    >
                      Xem tất cả thông báo
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Supabase Status Pill */}
            <button
              onClick={() => setActiveTab('settings')}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 transition-colors text-xs cursor-pointer group"
              title={`Supabase: ${supabaseStatus.message}`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  supabaseStatus.connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span className="font-semibold text-[11px] text-[#DDF1FF] group-hover:text-white">
                Supabase
              </span>
            </button>

            {/* Settings Button */}
            <button
              onClick={() => setActiveTab('settings')}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-[#DDF1FF] hover:text-white transition-colors cursor-pointer"
              title="Cài đặt hệ thống"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Auth Modal (Login / Register) */}
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
    </>
  );
};
