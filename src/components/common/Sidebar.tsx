import React from 'react';
import { useApp } from '../../context/AppContext';
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
} from 'lucide-react';

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

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
              <span className="truncate text-left">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Inspirational Historical Quote from reference screenshot */}
      <div className="p-4 mx-3 mb-4 rounded-xl bg-gradient-to-b from-[#085a96]/40 to-[#073B66] border border-cyan-400/20 text-center text-[#DDF1FF] relative overflow-hidden shadow-inner">
        <div className="text-xl leading-none text-cyan-300 font-serif opacity-40 select-none">“</div>
        <p className="text-xs italic leading-relaxed text-slate-100 font-serif px-1 -mt-2">
          “Lịch sử là quá khứ của nhân loại, nhưng là tương lai của mỗi chúng ta.”
        </p>
        <div className="mt-2.5 flex items-center justify-center gap-1.5 opacity-60">
          <span className="w-8 h-[1px] bg-cyan-300"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-300"></span>
          <span className="w-8 h-[1px] bg-cyan-300"></span>
        </div>
      </div>
    </aside>
  );
};
