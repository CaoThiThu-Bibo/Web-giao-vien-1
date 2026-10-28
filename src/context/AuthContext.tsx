import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserAccount, UserRole } from '../types';

interface RegisterData {
  username: string;
  password: string;
  fullName: string;
  role: UserRole;
  email?: string;
  phone?: string;
  title?: string;
}

interface AuthContextType {
  currentUser: UserAccount | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  quickLogin: (role: UserRole) => Promise<{ success: boolean; message: string }>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  allUsers: UserAccount[];
  refreshUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_KEY = 'suhocso_auth_user_v1';
const AUTH_TOKEN_KEY = 'suhocso_auth_token_v1';
const LOCAL_USERS_KEY = 'suhocso_local_registered_users_v1';

// Initial pre-configured accounts
const DEFAULT_ACCOUNTS: UserAccount[] = [
  {
    id: 'usr_teacher_cothu',
    username: 'caothithu',
    fullName: 'Cao Thị Thu',
    role: 'teacher',
    title: 'Giáo viên Lịch sử - Tổ KHXH',
    email: 'caothithu@quangninh.edu.vn',
    phone: '0988 123 456',
    institution: 'Trung tâm GDNN - GDTX TP Quảng Ninh - Phân hiệu Tiên Yên',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&h=160&q=80',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'usr_admin',
    username: 'admin',
    fullName: 'Quản trị viên Hệ thống',
    role: 'admin',
    title: 'Quản trị viên Công nghệ giáo dục',
    email: 'admin.suhocso@quangninh.edu.vn',
    phone: '0203 387 654',
    institution: 'Trung tâm GDNN - GDTX TP Quảng Ninh - Phân hiệu Tiên Yên',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=160&h=160&q=80',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'usr_student_an',
    username: 'hocsinh',
    fullName: 'Nguyễn Văn An',
    role: 'student',
    title: 'Học viên Lớp 10A1 GDTX',
    email: 'nguyenvanan.k10@gmail.com',
    phone: '0971 234 567',
    institution: 'Trung tâm GDNN - GDTX TP Quảng Ninh - Phân hiệu Tiên Yên',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&h=160&q=80',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const savedUser = localStorage.getItem(AUTH_USER_KEY);
      if (savedUser) {
        return JSON.parse(savedUser);
      }
      // By default, start with Cô Cao Thị Thu logged in so user can explore right away, or allow them to test login/register seamlessly
      return DEFAULT_ACCOUNTS[0];
    } catch {
      return DEFAULT_ACCOUNTS[0];
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(AUTH_TOKEN_KEY) || 'demo_token_teacher_cothu';
  });

  const [isLoading, setIsLoading] = useState(false);
  const [allUsers, setAllUsers] = useState<UserAccount[]>(DEFAULT_ACCOUNTS);

  // Load all users from server or local
  const refreshUsers = async () => {
    try {
      const res = await fetch('/api/auth/users');
      if (res.ok) {
        const data = await res.json();
        if (data.users && Array.isArray(data.users)) {
          setAllUsers(data.users);
          return;
        }
      }
    } catch (e) {
      // Fallback to local
    }
    try {
      const local = localStorage.getItem(LOCAL_USERS_KEY);
      if (local) {
        const parsed = JSON.parse(local);
        setAllUsers([...DEFAULT_ACCOUNTS, ...parsed]);
      }
    } catch (e) {
      setAllUsers(DEFAULT_ACCOUNTS);
    }
  };

  useEffect(() => {
    refreshUsers();
  }, []);

  // Save current user & token
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(AUTH_USER_KEY);
    }
  }, [currentUser]);

  useEffect(() => {
    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  }, [token]);

  // Login handler
  const login = async (username: string, password: string): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    const cleanUser = username.trim().toLowerCase();

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanUser, password }),
      });

      const data = await response.json();
      if (response.ok && data.success && data.user) {
        setCurrentUser(data.user);
        setToken(data.token || `token_${Date.now()}`);
        setIsLoading(false);
        refreshUsers();
        return { success: true, message: data.message || 'Đăng nhập thành công!' };
      } else {
        setIsLoading(false);
        return { success: false, message: data.message || 'Tên đăng nhập hoặc mật khẩu không chính xác.' };
      }
    } catch (error) {
      // Offline fallback: check default accounts
      const matched = allUsers.find((u) => u.username.toLowerCase() === cleanUser);
      if (matched) {
        // Simple fallback check
        if (
          (cleanUser === 'caothithu' && password === '123456') ||
          (cleanUser === 'admin' && password === 'admin123') ||
          (cleanUser === 'hocsinh' && password === '123456')
        ) {
          setCurrentUser(matched);
          const fakeToken = `offline_token_${Date.now()}`;
          setToken(fakeToken);
          setIsLoading(false);
          return { success: true, message: `Đăng nhập thành công! Chào mừng ${matched.fullName}.` };
        }
      }

      setIsLoading(false);
      return { success: false, message: 'Tên đăng nhập hoặc mật khẩu không chính xác.' };
    }
  };

  // Register handler
  const register = async (data: RegisterData): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const resData = await response.json();
      if (response.ok && resData.success && resData.user) {
        setCurrentUser(resData.user);
        setToken(resData.token || `token_${Date.now()}`);
        setIsLoading(false);
        refreshUsers();
        return { success: true, message: resData.message || 'Đăng ký tài khoản thành công!' };
      } else {
        setIsLoading(false);
        return { success: false, message: resData.message || 'Đăng ký thất bại. Vui lòng thử lại.' };
      }
    } catch (error) {
      // Offline / fallback registration
      const cleanUser = data.username.trim().toLowerCase();
      const exists = allUsers.some((u) => u.username.toLowerCase() === cleanUser);
      if (exists) {
        setIsLoading(false);
        return { success: false, message: `Tên đăng nhập "${cleanUser}" đã được sử dụng.` };
      }

      const newUser: UserAccount = {
        id: `usr_${Date.now()}`,
        username: cleanUser,
        fullName: data.fullName.trim(),
        role: data.role,
        title: data.title || (data.role === 'teacher' ? 'Giáo viên Lịch sử' : data.role === 'admin' ? 'Quản trị viên' : 'Học sinh GDTX'),
        email: data.email,
        phone: data.phone,
        institution: 'Trung tâm GDNN - GDTX TP Quảng Ninh - Phân hiệu Tiên Yên',
        avatar: data.role === 'teacher'
          ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&h=160&q=80'
          : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&h=160&q=80',
        createdAt: new Date().toISOString(),
      };

      try {
        const local = localStorage.getItem(LOCAL_USERS_KEY);
        const list = local ? JSON.parse(local) : [];
        list.push(newUser);
        localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(list));
      } catch (e) {
        // ignore
      }

      setCurrentUser(newUser);
      setToken(`token_${Date.now()}`);
      setAllUsers((prev) => [...prev, newUser]);
      setIsLoading(false);
      return { success: true, message: 'Đăng ký tài khoản thành công!' };
    }
  };

  // Logout handler
  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
  };

  // Quick switch role/login helper
  const quickLogin = async (role: UserRole): Promise<{ success: boolean; message: string }> => {
    const target = allUsers.find((u) => u.role === role) || DEFAULT_ACCOUNTS.find((u) => u.role === role);
    if (target) {
      setCurrentUser(target);
      setToken(`quick_token_${target.id}_${Date.now()}`);
      return { success: true, message: `Đã chuyển sang tài khoản ${target.fullName} (${target.role})` };
    }
    return { success: false, message: 'Không tìm thấy tài khoản mẫu phù hợp.' };
  };

  // Change password
  const changePassword = async (oldPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) return { success: false, message: 'Chưa đăng nhập.' };
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: currentUser.username,
          oldPassword,
          newPassword,
        }),
      });
      const data = await response.json();
      return { success: data.success, message: data.message };
    } catch (e) {
      return { success: false, message: 'Không thể kết nối đến máy chủ.' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        isAuthenticated: !!currentUser,
        isLoading,
        login,
        register,
        logout,
        quickLogin,
        changePassword,
        allUsers,
        refreshUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
