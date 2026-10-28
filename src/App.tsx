import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { Footer } from './components/common/Footer';
import { Dashboard } from './components/dashboard/Dashboard';
import { StudentManagement } from './components/students/StudentManagement';
import { ClassManagement } from './components/classes/ClassManagement';
import { Gradebook } from './components/gradebook/Gradebook';
import { AttendanceManagement } from './components/attendance/AttendanceManagement';
import { ReportsAnalytics } from './components/reports/ReportsAnalytics';
import { AiAssistant } from './components/ai-assistant/AiAssistant';
import { QuestionBank } from './components/question-bank/QuestionBank';
import { DigitalLibrary } from './components/materials/DigitalLibrary';
import { OnlineClassroom } from './components/online-room/OnlineClassroom';
import { StudentSupport } from './components/support/StudentSupport';
import { SystemSettings } from './components/settings/SystemSettings';
import { AuthLanding } from './components/auth/AuthLanding';
import { Menu, X } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeTab, setUserRole, systemConfig, updateSystemConfig } = useApp();
  const { currentUser, isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);

  // Sync role and teacher name from logged in user
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role && currentUser.role !== systemConfig.activeRole) {
        setUserRole(currentUser.role);
      }
      if (currentUser.role === 'teacher' && currentUser.fullName && currentUser.fullName !== systemConfig.teacherName) {
        updateSystemConfig({ teacherName: currentUser.fullName });
      }
    }
  }, [currentUser]);

  // If user is not logged in and hasn't chosen guest preview mode, show the full AuthLanding
  if (!isAuthenticated && !isGuestMode) {
    return <AuthLanding onBypassAsGuest={() => setIsGuestMode(true)} />;
  }

  const renderActiveModule = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'students':
        return <StudentManagement />;
      case 'classes':
        return <ClassManagement />;
      case 'gradebook':
        return <Gradebook />;
      case 'attendance':
        return <AttendanceManagement />;
      case 'reports':
        return <ReportsAnalytics />;
      case 'ai-assistant':
        return <AiAssistant />;
      case 'question-bank':
        return <QuestionBank />;
      case 'materials':
        return <DigitalLibrary />;
      case 'online-room':
        return <OnlineClassroom />;
      case 'student-support':
        return <StudentSupport />;
      case 'settings':
        return <SystemSettings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F8FC] font-serif text-slate-800">
      {/* Top Header */}
      <Header />

      {/* Guest warning banner if viewing as guest */}
      {!isAuthenticated && isGuestMode && (
        <div className="bg-amber-500 text-white text-xs py-1.5 px-4 text-center font-sans font-bold flex items-center justify-center gap-2 shadow-sm">
          <span>Bạn đang xem hệ thống với tư cách Khách trải nghiệm.</span>
          <button
            onClick={() => setIsGuestMode(false)}
            className="underline hover:text-amber-100 cursor-pointer ml-1"
          >
            Đăng nhập / Đăng ký tài khoản ngay
          </button>
        </div>
      )}

      {/* Mobile Menu Bar Toggle */}
      <div className="lg:hidden flex items-center justify-between px-4 py-2.5 bg-[#073B66] text-white border-b border-[#085a96]/40">
        <span className="text-xs font-bold font-serif tracking-wider text-cyan-200">
          MENU ĐIỀU HƯỚNG 12 PHÂN HỆ
        </span>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-1 rounded-md text-cyan-200 hover:text-white transition-colors cursor-pointer"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Main Body with Sidebar + Content */}
      <div className="flex-1 flex flex-col lg:flex-row relative">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Mobile Slide-over Sidebar */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 flex">
            <div
              className="fixed inset-0 bg-slate-900/60"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="relative z-50 w-72 max-w-[85vw] h-full shadow-2xl">
              <Sidebar />
            </div>
          </div>
        )}

        {/* Dynamic Main Workspace Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-7 overflow-y-auto max-w-[1700px] mx-auto w-full">
          {renderActiveModule()}
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <MainLayout />
      </AppProvider>
    </AuthProvider>
  );
}
