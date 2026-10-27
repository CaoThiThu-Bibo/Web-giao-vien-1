import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  Settings,
  BookOpen,
  UserCheck,
  CheckCircle,
  ExternalLink,
  ShieldCheck,
  GraduationCap,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    systemConfig,
    notifications,
    markNotificationRead,
    clearAllNotifications,
    setActiveTab,
    userRole,
    setUserRole,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="relative w-full bg-gradient-to-r from-[#073B66] via-[#085a96] to-[#073B66] text-white shadow-md border-b border-[#0878C9]/40 select-none overflow-hidden">
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
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0878C9] to-[#073B66] border border-[#DDF1FF]/40 shadow-inner flex items-center justify-center p-2 text-white group-hover:border-white transition-colors">
            <BookOpen className="w-7 h-7 text-[#DDF1FF]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold tracking-wider text-white drop-shadow-sm font-serif">
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
          <div className="text-[13px] font-bold tracking-wide uppercase text-white/95 drop-shadow-sm">
            {systemConfig.institution}
          </div>
          <div className="text-xs text-[#DDF1FF] font-semibold tracking-wider uppercase mt-0.5">
            {systemConfig.branch}
          </div>
          <div className="text-[11px] text-cyan-200 italic font-serif mt-0.5 tracking-wide flex items-center gap-1.5">
            <span className="inline-block w-4 h-[1px] bg-cyan-300/60"></span>
            Hiểu lịch sử - Vững tương lai
            <span className="inline-block w-4 h-[1px] bg-cyan-300/60"></span>
          </div>
        </div>

        {/* Right: User Profile & Actions */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Role selector dropdown */}
          <div className="hidden sm:flex items-center bg-[#073B66]/80 border border-[#0878C9] rounded-lg px-2.5 py-1 text-xs">
            <span className="text-slate-300 mr-1.5 font-medium">Vai trò:</span>
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value as any)}
              className="bg-transparent text-white font-semibold outline-none cursor-pointer text-xs"
            >
              <option value="teacher" className="bg-[#073B66] text-white">
                Giáo viên (Cô Thu)
              </option>
              <option value="student" className="bg-[#073B66] text-white">
                Học sinh (Demo)
              </option>
              <option value="admin" className="bg-[#073B66] text-white">
                Quản trị viên
              </option>
            </select>
          </div>

          {/* Teacher Avatar & Info */}
          <div
            onClick={() => setActiveTab('settings')}
            className="flex items-center gap-2.5 px-2 py-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            title="Xem thông tin giáo viên & cài đặt"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-full border-2 border-cyan-300/80 overflow-hidden bg-slate-200 flex items-center justify-center shadow-md">
                <img
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&h=160&q=80"
                  alt="Giáo viên Lịch sử"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#073B66] rounded-full" />
            </div>

            <div className="hidden md:flex flex-col text-left">
              <span className="text-sm font-bold text-white leading-tight font-serif">
                {systemConfig.teacherName}
              </span>
              <span className="text-[11px] text-[#DDF1FF] leading-tight flex items-center gap-1">
                <GraduationCap className="w-3 h-3 text-cyan-300 inline" />
                {systemConfig.teacherTitle}
              </span>
            </div>
          </div>

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
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 text-slate-800 z-50 overflow-hidden">
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
  );
};
