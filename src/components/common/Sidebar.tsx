import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { ActiveTab } from '../../types';
import {
  Home,
  Users,
  Building2,
  ClipboardList,
  CalendarCheck,
  BarChart3,
  Sparkles,
  FileQuestion,
  BookOpen,
  MonitorPlay,
  HeartHandshake,
  Settings,
  LogOut,
  UserCheck,
  LogIn,
} from 'lucide-react';
import { AuthModal } from '../auth/AuthModal';

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();
  const { currentUser, isAuthenticated, logout } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Trang chủ', icon: Home },
    { id: 'students', label: 'Quản lý học sinh', icon: Users },
    { id: 'classes', label: 'Quản lý lớp học', icon: Building2 },
    { id: 'gradebook', label: 'Sổ điểm điện tử', icon: ClipboardList },
    { id: 'attendance', label: 'Chuyên cần', icon: CalendarCheck },
    { id: 'reports', label: 'Báo cáo - Thống kê', icon: BarChart3 },
    { id: 'ai-assistant', label: 'Trợ lý AI soạn bài', icon: Sparkles },
    { id: 'question-bank', label: 'Ngân hàng đề kiểm tra', icon: FileQuestion },
    { id: 'materials', label: 'Học liệu - Tư liệu', icon: BookOpen },
    { id: 'online-room', label: 'Phòng học trực tuyến', icon: MonitorPlay },
    { id: 'student-support', label: 'Hỗ trợ học sinh', icon: HeartHandshake },
    { id: 'settings', label: 'Cài đặt hệ thống', icon: Settings },
  ];

  return (
    <>
      <aside className="w-64 bg-[#073B66] text-white flex flex-col shrink-0 select-none border-r border-[#085a96]/40 min-h-[calc(100vh-64px)] shadow-lg">
        {/* Navigation List */}
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#0878C9] text-white shadow-md font-bold translate-x-1'
                    : 'text-slate-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform ${
                    isActive ? 'text-white scale-110' : 'text-cyan-200/80'
                  }`}
                />
                <span className="truncate text-left font-serif">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Account Quick Card at the bottom of sidebar */}
        <div className="p-3 mx-3 mb-2 rounded-xl bg-white/5 border border-white/10 text-white font-sans">
          {isAuthenticated && currentUser ? (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <img
                  src={currentUser.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&h=160&q=80'}
                  alt={currentUser.fullName}
                  className="w-8 h-8 rounded-full border border-cyan-300 object-cover shrink-0"
                />
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate text-white leading-tight">
                    {currentUser.fullName}
                  </div>
                  <div className="text-[10px] text-cyan-200 truncate">
                    @{currentUser.username}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={logout}
                title="Đăng xuất"
                className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white transition-colors cursor-pointer shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsAuthOpen(true)}
              className="w-full py-1.5 px-2 rounded-lg bg-[#0878C9] hover:bg-[#076bb3] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              Đăng nhập / Đăng ký
            </button>
          )}
        </div>

        {/* Inspirational Historical Quote */}
        <div className="p-3 mx-3 mb-4 rounded-xl bg-gradient-to-b from-[#085a96]/40 to-[#073B66] border border-cyan-400/20 text-center text-[#DDF1FF] relative overflow-hidden shadow-inner">
          <div className="text-lg leading-none text-cyan-300 font-serif opacity-40 select-none">“</div>
          <p className="text-[11px] italic leading-relaxed text-slate-100 font-serif px-1 -mt-2">
            “Dân ta phải biết sử ta, cho tường gốc tích nước nhà Việt Nam.”
          </p>
        </div>
      </aside>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
};
