import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ---------------- SUPABASE CLIENT SETUP ----------------
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://gtwmtexqygqshjanxvyb.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_lQDO7Hz33QUj8LSgS4miWg_G5G3RqAr';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
console.log(`[Supabase] Initialized client for ${SUPABASE_URL}`);


// ---------------- AUTHENTICATION & USERS STORAGE ----------------
interface StoredUser {
  id: string;
  username: string;
  passwordHash: string;
  salt: string;
  fullName: string;
  role: 'teacher' | 'student' | 'admin';
  title?: string;
  email?: string;
  phone?: string;
  institution?: string;
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
}

const DATA_DIR = path.resolve(__dirname, 'data');
const USERS_FILE = path.resolve(DATA_DIR, 'users.json');

function hashPassword(password: string, salt: string): string {
  return crypto.createHmac('sha256', salt).update(password).digest('hex');
}

function initializeUsers(): StoredUser[] {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(USERS_FILE)) {
    try {
      const data = fs.readFileSync(USERS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {
      console.warn('Error reading users file, resetting to defaults:', e);
    }
  }

  // Pre-seed standard accounts
  const seedUsers: StoredUser[] = [
    {
      id: 'usr_teacher_cothu',
      username: 'caothithu',
      salt: 'salt_cothu_tienyen',
      passwordHash: hashPassword('123456', 'salt_cothu_tienyen'),
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
      salt: 'salt_admin_tienyen',
      passwordHash: hashPassword('admin123', 'salt_admin_tienyen'),
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
      salt: 'salt_student_an',
      passwordHash: hashPassword('123456', 'salt_student_an'),
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

  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(seedUsers, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save default users:', err);
  }
  return seedUsers;
}

let usersStore: StoredUser[] = initializeUsers();

function saveUsersToDisk() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(USERS_FILE, JSON.stringify(usersStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving users to disk:', err);
  }
}

function sanitizeUser(user: StoredUser) {
  const { passwordHash, salt, ...safeUser } = user;
  return safeUser;
}

// Generate simple mock token
function generateToken(user: StoredUser) {
  const payload = {
    userId: user.id,
    username: user.username,
    role: user.role,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

// Helper: sync seed users to Supabase if not present
async function seedDefaultUsersToSupabase() {
  try {
    for (const u of usersStore) {
      await supabase.from('users').upsert(
        {
          id: u.id,
          username: u.username,
          password_hash: u.passwordHash,
          salt: u.salt,
          full_name: u.fullName,
          role: u.role,
          title: u.title,
          email: u.email,
          phone: u.phone,
          institution: u.institution,
          avatar: u.avatar,
          created_at: u.createdAt,
          last_login: u.lastLogin,
        },
        { onConflict: 'username' }
      );
    }
    console.log('[Supabase] Initial user accounts synced to Supabase.');
  } catch (err: any) {
    console.warn('[Supabase] Note on initial user sync:', err?.message);
  }
}

// Supabase Status Endpoint
app.get('/api/supabase/status', async (req, res) => {
  try {
    const { data, error } = await supabase.from('users').select('id').limit(1);
    if (error) {
      if (error.code === '42P01') {
        return res.json({
          connected: true,
          tableReady: false,
          url: SUPABASE_URL,
          message: 'Đã kết nối máy chủ Supabase. Bảng "users" chưa được tạo trong SQL Editor.',
        });
      }
      return res.json({
        connected: false,
        tableReady: false,
        url: SUPABASE_URL,
        message: error.message,
      });
    }
    return res.json({
      connected: true,
      tableReady: true,
      url: SUPABASE_URL,
      message: 'Cơ sở dữ liệu Supabase đang hoạt động bình thường.',
    });
  } catch (err: any) {
    return res.json({
      connected: false,
      tableReady: false,
      url: SUPABASE_URL,
      message: err?.message || 'Không thể kết nối Supabase.',
    });
  }
});

// Auth API: Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, fullName, role = 'student', email, phone, title } = req.body;

    if (!username || typeof username !== 'string' || username.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Tên đăng nhập phải có ít nhất 3 ký tự (chỉ gồm chữ cái, số và dấu gạch dưới).',
      });
    }

    const cleanUsername = username.trim().toLowerCase();

    // Check valid username format
    if (!/^[a-zA-Z0-9_.-]+$/.test(cleanUsername)) {
      return res.status(400).json({
        success: false,
        message: 'Tên đăng nhập không được chứa ký tự đặc biệt hoặc khoảng trắng.',
      });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu phải có độ dài tối thiểu 6 ký tự.',
      });
    }

    if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập họ và tên đầy đủ của bạn.',
      });
    }

    // Check existing username in Supabase
    try {
      const { data: suExisting } = await supabase
        .from('users')
        .select('id')
        .eq('username', cleanUsername)
        .maybeSingle();

      if (suExisting) {
        return res.status(409).json({
          success: false,
          message: `Tên đăng nhập "${cleanUsername}" đã tồn tại trên Supabase. Vui lòng chọn tên khác!`,
        });
      }
    } catch (e) {
      // Supabase table may not exist yet, fallback to local check
    }

    // Check existing username in local
    const exists = usersStore.some((u) => u.username.toLowerCase() === cleanUsername);
    if (exists) {
      return res.status(409).json({
        success: false,
        message: `Tên đăng nhập "${cleanUsername}" đã tồn tại. Vui lòng chọn tên khác!`,
      });
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPassword(password, salt);

    const newUser: StoredUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      username: cleanUsername,
      passwordHash,
      salt,
      fullName: fullName.trim(),
      role: role === 'teacher' || role === 'admin' ? role : 'student',
      title: title || (role === 'teacher' ? 'Giáo viên Lịch sử' : role === 'admin' ? 'Quản trị viên' : 'Học sinh GDTX'),
      email: email ? String(email).trim() : undefined,
      phone: phone ? String(phone).trim() : undefined,
      institution: 'Trung tâm GDNN - GDTX TP Quảng Ninh - Phân hiệu Tiên Yên',
      avatar:
        role === 'teacher'
          ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&h=160&q=80'
          : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&h=160&q=80',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    // Save to Supabase
    try {
      await supabase.from('users').upsert({
        id: newUser.id,
        username: newUser.username,
        password_hash: newUser.passwordHash,
        salt: newUser.salt,
        full_name: newUser.fullName,
        role: newUser.role,
        title: newUser.title,
        email: newUser.email,
        phone: newUser.phone,
        institution: newUser.institution,
        avatar: newUser.avatar,
        created_at: newUser.createdAt,
        last_login: newUser.lastLogin,
      });
    } catch (e) {
      console.warn('[Supabase] Could not insert new user to Supabase:', e);
    }

    // Save to local backup
    usersStore.push(newUser);
    saveUsersToDisk();

    const token = generateToken(newUser);
    return res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công và đã lưu trữ!',
      user: sanitizeUser(newUser),
      token,
    });
  } catch (error: any) {
    console.error('Register error:', error);
    return res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra trên máy chủ trong quá trình đăng ký.',
    });
  }
});

// Auth API: Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập cả tên đăng nhập và mật khẩu.',
      });
    }

    const cleanUsername = String(username).trim().toLowerCase();
    let user = usersStore.find((u) => u.username.toLowerCase() === cleanUsername);

    // Try finding in Supabase first
    try {
      const { data: suUser, error: suErr } = await supabase
        .from('users')
        .select('*')
        .eq('username', cleanUsername)
        .maybeSingle();

      if (suUser && !suErr) {
        user = {
          id: suUser.id,
          username: suUser.username,
          passwordHash: suUser.password_hash,
          salt: suUser.salt,
          fullName: suUser.full_name,
          role: suUser.role,
          title: suUser.title,
          email: suUser.email,
          phone: suUser.phone,
          institution: suUser.institution,
          avatar: suUser.avatar,
          createdAt: suUser.created_at,
          lastLogin: suUser.last_login,
        };
      }
    } catch (e) {
      // Supabase fallback to local usersStore
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Tên đăng nhập không tồn tại trong hệ thống.',
      });
    }

    const testHash = hashPassword(String(password), user.salt);
    if (testHash !== user.passwordHash) {
      return res.status(401).json({
        success: false,
        message: 'Mật khẩu không chính xác. Vui lòng kiểm tra lại!',
      });
    }

    // Update last login
    user.lastLogin = new Date().toISOString();
    saveUsersToDisk();

    try {
      await supabase.from('users').update({ last_login: user.lastLogin }).eq('username', user.username);
    } catch (e) {}

    const token = generateToken(user);
    return res.json({
      success: true,
      message: `Đăng nhập thành công! Chào mừng ${user.fullName}.`,
      user: sanitizeUser(user),
      token,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra trên máy chủ khi đăng nhập.',
    });
  }
});

// Auth API: Get Current User (Me)
app.get('/api/auth/me', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));

    if (!decoded.userId || decoded.exp < Date.now()) {
      return res.status(401).json({ success: false, message: 'Phiên đăng nhập đã hết hạn.' });
    }

    const user = usersStore.find((u) => u.id === decoded.userId || u.username === decoded.username);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Người dùng không tồn tại.' });
    }

    return res.json({
      success: true,
      user: sanitizeUser(user),
    });
  } catch (e) {
    return res.status(401).json({ success: false, message: 'Token không hợp lệ.' });
  }
});

// Auth API: List all accounts
app.get('/api/auth/users', async (req, res) => {
  try {
    const { data: suUsers } = await supabase.from('users').select('*');
    if (suUsers && Array.isArray(suUsers) && suUsers.length > 0) {
      const mapped = suUsers.map((u: any) => ({
        id: u.id,
        username: u.username,
        fullName: u.full_name,
        role: u.role,
        title: u.title,
        email: u.email,
        phone: u.phone,
        institution: u.institution,
        avatar: u.avatar,
        createdAt: u.created_at,
        lastLogin: u.last_login,
      }));
      return res.json({
        success: true,
        users: mapped,
        source: 'supabase',
      });
    }
  } catch (e) {}

  return res.json({
    success: true,
    users: usersStore.map(sanitizeUser),
    source: 'local',
  });
});

// Auth API: Change Password
app.post('/api/auth/change-password', async (req, res) => {
  try {
    const { username, oldPassword, newPassword } = req.body;
    if (!username || !oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ các thông tin.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Mật khẩu mới phải từ 6 ký tự trở lên.' });
    }

    const cleanUsername = String(username).trim().toLowerCase();
    let user = usersStore.find((u) => u.username.toLowerCase() === cleanUsername);

    // Try finding from Supabase
    try {
      const { data: suUser } = await supabase.from('users').select('*').eq('username', cleanUsername).maybeSingle();
      if (suUser) {
        user = {
          id: suUser.id,
          username: suUser.username,
          passwordHash: suUser.password_hash,
          salt: suUser.salt,
          fullName: suUser.full_name,
          role: suUser.role,
          createdAt: suUser.created_at,
        };
      }
    } catch (e) {}

    if (!user) {
      return res.status(404).json({ success: false, message: 'Tài khoản không tồn tại.' });
    }

    const oldHash = hashPassword(oldPassword, user.salt);
    if (oldHash !== user.passwordHash) {
      return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không chính xác.' });
    }

    const newSalt = user.salt;
    const newHash = hashPassword(newPassword, newSalt);
    user.passwordHash = newHash;
    saveUsersToDisk();

    // Update in Supabase
    try {
      await supabase.from('users').update({ password_hash: newHash }).eq('username', user.username);
    } catch (e) {}

    return res.json({ success: true, message: 'Đổi mật khẩu thành công trên hệ thống!' });
  } catch (e: any) {
    return res.status(500).json({ success: false, message: 'Lỗi cập nhật mật khẩu.' });
  }
});


// Initialize Google Gen AI
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Health & Status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    appName: 'SỬ HỌC SỐ',
    school: 'Trung tâm GDNN – GDTX thành phố Quảng Ninh - Phân hiệu Tiên Yên',
    teacher: 'Cao Thị Thu',
    hasApiKey: !!apiKey,
    model: 'gemini-3.8-flash',
  });
});

// API: Lesson Plan Generator (Kế hoạch bài dạy GDPT 2018)
app.post('/api/gemini/generate-plan', async (req, res) => {
  const { grade, topic, lessonName, duration, bookSeries, studentLevel, specificNotes } = req.body;

  const prompt = `
Bạn là chuyên gia sư phạm Lịch sử Việt Nam, nắm vững Chương trình Giáo dục phổ thông (GDPT) 2018 môn Lịch sử và Chương trình GDTX cấp THPT.
Hãy soạn KẾ HOẠCH BÀI DẠY (Giáo án) chi tiết, chuẩn mực cho:
- Khối lớp: Lớp ${grade || 10} (Chương trình GDTX cấp THPT)
- Bộ sách: ${bookSeries || 'Kết nối tri thức với cuộc sống / Cánh Diều'}
- Tên bài: ${lessonName || topic || 'Chủ đề Lịch sử Việt Nam'}
- Thời lượng: ${duration || '2 tiết (90 phút)'}
- Đối tượng học sinh: Học viên GDTX Tiên Yên (trình độ: ${studentLevel || 'đa dạng, cần trực quan, dễ hiểu'})
- Ghi chú giáo viên: ${specificNotes || 'Không có'}

Cấu trúc giáo án bắt buộc gồm các phần:
I. MỤC TIÊU BÀI HỌC
1. Năng lực lịch sử (Tìm hiểu lịch sử, Nhận thức và tư duy lịch sử, Vận dụng kiến thức, kỹ năng đã học)
2. Phẩm chất chủ yếu (Yêu nước, Trách nhiệm, Trung thực)

II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU
- Giáo viên chuẩn bị (Bản đồ, sơ đồ tư duy, tư liệu ảnh, máy chiếu/phiếu học tập)
- Học viên chuẩn bị (SGK, vở ghi)

III. TIẾN TRÌNH DẠY HỌC (Chuẩn Công văn hướng dẫn GDPT 2018)
1. Hoạt động 1: Khởi động (Mục tiêu, Nội dung, Sản phẩm, Tổ chức thực hiện hấp dẫn)
2. Hoạt động 2: Hình thành kiến thức mới (Chia thành các mục rõ ràng, phân định rõ: Hoạt động của GV - Hoạt động của HS - Sản phẩm cần đạt)
3. Hoạt động 3: Luyện tập (Hệ thống câu hỏi trắc nghiệm/tự luận ngắn củng cố kiến thức trọng tâm)
4. Hoạt động 4: Vận dụng (Nhiệm vụ thực tế, liên hệ quê hương Quảng Ninh hoặc liên hệ thời đại)

IV. HỒ SƠ DẠY HỌC VÀ PHIẾU HỌC TẬP (Kèm mẫu 1 phiếu học tập chi tiết).

Yêu cầu: Viết tiếng Việt chuẩn xác về mốc thời gian, nhân vật, sự kiện lịch sử, không tự bịa đặt niên đại, văn phong sư phạm trang trọng, rõ ràng.
`;

  try {
    if (!ai) {
      throw new Error('Chưa cấu hình GEMINI_API_KEY trên server.');
    }
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });
    res.json({ success: true, text: response.text });
  } catch (err: any) {
    console.warn('Gemini API call failed or not configured, returning curricular template:', err?.message);
    res.json({
      success: true,
      text: getFallbackLessonPlan(grade, lessonName || topic),
      isFallback: true,
      note: 'Dữ liệu được tạo từ khung Kế hoạch bài dạy chuẩn Chương trình Lịch sử GDTX cấp THPT.',
    });
  }
});

// API: Graduation Exam Generator (Chuẩn Bộ GD&ĐT 2025 - Quyết định 764/QĐ-BGDĐT)
app.post('/api/gemini/generate-graduation-exam', async (req, res) => {
  const {
    topic = 'Lịch sử Việt Nam thế kỷ XX và Thế giới hiện đại',
    sourceText = '',
    grade = 12,
    numPart1 = 24,
    numPart2 = 4,
    examTitle = 'Đề luyện thi tốt nghiệp THPT 2025 môn Lịch sử',
    notes = '',
  } = req.body;

  const prompt = `
Bạn là chuyên gia thẩm định và biên soạn đề thi tốt nghiệp THPT môn Lịch sử theo chương trình GDPT 2018 và Quyết định 764/QĐ-BGDĐT của Bộ Giáo dục và Đào tạo Việt Nam.
Hãy biên soạn một ĐỀ LUYỆN THI TỐT NGHIỆP THPT MÔN LỊCH SỬ CHUẨN 2025:
- Khối lớp: Lớp ${grade} (Chương trình GDTX cấp THPT)
- Chủ đề trọng tâm: ${topic}
- Tiêu đề đề thi: ${examTitle}
${sourceText ? `- TƯ LIỆU / DỮ LIỆU CÔ GIÁO CAO THỊ THU CUNG CẤP ĐỂ TỰ SOẠN ĐỀ:\n"""\n${sourceText}\n"""\n(BẮT BUỘC: Hãy khai thác triệt để các dữ kiện, niên đại, sự kiện và trích đoạn trong tư liệu trên để xây dựng câu hỏi!)` : ''}
${notes ? `- Yêu cầu bổ sung của giáo viên: ${notes}` : ''}

CẤU TRÚC ĐỀ THI BẮT BUỘC THEO QUY ĐỊNH CHÍNH THỨC CỦA BỘ GD&ĐT:
1. PHẦN I: ${numPart1} CÂU HỎI TRẮC NGHIỆM NHIỀU PHƯƠNG ÁN LỰA CHỌN (4 chọn 1)
- Mỗi câu gồm: Lời dẫn rõ ràng, 4 phương án A, B, C, D (trong đó chỉ 1 phương án đúng), đáp án đúng (A/B/C/D), mức độ nhận thức (Nhận biết, Thông hiểu, Vận dụng) và giải thích ngắn gọn.
- Điểm: Mỗi câu đúng 0,25 điểm (tổng 6,0 điểm nếu 24 câu).

2. PHẦN II: ${numPart2} CÂU HỎI TRẮC NGHIỆM ĐÚNG SAI DỰA TRÊN TƯ LIỆU LỊCH SỬ
- Mỗi câu gồm:
  + Đoạn trích tư liệu lịch sử (văn kiện, chỉ thị, nhận định của lãnh tụ/nhà sử học hoặc số liệu lịch sử) dài 3 - 6 dòng làm chất liệu.
  + 4 nhận định a, b, c, d xoay quanh tư liệu đó.
  + Mỗi nhận định xác định rõ là ĐÚNG hay SAI (true/false) và giải thích vì sao.
  + Đảm bảo có cả ý Đúng và ý Sai để kiểm tra tư duy phản biện lịch sử của học sinh.
- Điểm: Tính theo barem bậc thang chính thức của Bộ: 1 ý đúng = 0,10đ; 2 ý đúng = 0,25đ; 3 ý đúng = 0,50đ; 4 ý đúng = 1,00đ (tổng 4,0 điểm).

Hãy trả về định dạng JSON hợp lệ tuân thủ đúng cấu trúc.
`;

  try {
    if (!ai) {
      throw new Error('Chưa cấu hình GEMINI_API_KEY trên server.');
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            examTitle: { type: Type.STRING },
            topic: { type: Type.STRING },
            part1: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  content: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctAnswer: { type: Type.STRING },
                  cognitiveLevel: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                },
                required: ['content', 'options', 'correctAnswer', 'cognitiveLevel'],
              },
            },
            part2: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  content: { type: Type.STRING },
                  topic: { type: Type.STRING },
                  knowledgeDomain: { type: Type.STRING },
                  cognitiveLevel: { type: Type.STRING },
                  trueFalseStatements: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        statement: { type: Type.STRING },
                        isCorrect: { type: Type.BOOLEAN },
                        explanation: { type: Type.STRING },
                      },
                      required: ['id', 'statement', 'isCorrect'],
                    },
                  },
                },
                required: ['content', 'trueFalseStatements'],
              },
            },
          },
          required: ['examTitle', 'part1', 'part2'],
        },
      },
    });

    const parsedData = JSON.parse(response.text || '{}');
    return res.json({
      success: true,
      data: parsedData,
      isAiGenerated: true,
    });
  } catch (err: any) {
    console.warn('Gemini API call failed, generating fallback standard 2025 graduation exam:', err?.message);
    const fallbackData = getFallbackGraduationExam(topic, sourceText, examTitle);
    return res.json({
      success: true,
      data: fallbackData,
      isAiGenerated: false,
      fallbackReason: err?.message || 'Sử dụng bộ tạo cấu trúc đề chuẩn Bộ GD&ĐT nội bộ.',
    });
  }
});

// API: Student Support & Remedial Recommendation
app.post('/api/gemini/support-recommendation', async (req, res) => {
  const { studentName, grade, averageScore, attendanceNotes, difficultAreas } = req.body;

  const prompt = `
Là chuyên gia tâm lý sư phạm và giáo viên Lịch sử giàu kinh nghiệm tại Trung tâm GDNN - GDTX, hãy đưa ra:
KẾ HOẠCH HỖ TRỢ VÀ TƯ VẤN HỌC TẬP CÁ NHÂN HÓA:
- Học sinh: ${studentName || 'Học viên'} (Lớp ${grade || 10})
- Điểm trung bình môn Lịch sử hiện tại: ${averageScore || 'Dưới 5.0'}
- Tình trạng chuyên cần: ${attendanceNotes || 'Thỉnh thoảng vắng, tiếp thu chậm'}
- Khó khăn cụ thể: ${difficultAreas || 'Khó nhớ mốc thời gian, khó phân tích ý nghĩa lịch sử'}

Hãy đề xuất cho cô giáo Cao Thị Thu:
1. Đánh giá nguyên nhân cốt lõi (Không phán xét tiêu cực, chỉ rõ rào cản học tập)
2. Kế hoạch hành động 4 tuần (Mục tiêu từng tuần, bài tập vi mô, phương pháp trực quan/sơ đồ tư duy)
3. Biện pháp khích lệ tâm lý và phối hợp cùng gia đình/chủ nhiệm
4. Mẫu bài tập củng cố vừa sức giúp học sinh lấy lại hứng thú học Lịch sử.
`;

  try {
    if (!ai) {
      throw new Error('Chưa cấu hình GEMINI_API_KEY trên server.');
    }
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });
    res.json({ success: true, text: response.text });
  } catch (err: any) {
    res.json({
      success: true,
      text: getFallbackSupportPlan(studentName, averageScore),
      isFallback: true,
    });
  }
});

// Fallback high-quality curriculum generators
function getFallbackLessonPlan(grade = 10, topic = 'Cách mạng tháng Tám năm 1945'): string {
  return `TRUNG TÂM GDNN - GDTX TP QUẢNG NINH - PHÂN HIỆU TIÊN YÊN
GIÁO VIÊN: CAO THỊ THU - TỔ KHXH

KẾ HOẠCH BÀI DẠY (GIÁO ÁN ĐIỆN TỬ THEO GDPT 2018)
BÀI HỌC: ${topic.toUpperCase()} (LỚP ${grade} - CHƯƠNG TRÌNH GDTX CẤP THPT)
Thời lượng: 2 tiết (90 phút)

I. MỤC TIÊU BÀI HỌC
1. Năng lực lịch sử:
- Tìm hiểu lịch sử: Biết cách khai thác tư liệu hình ảnh, lược đồ và trích đoạn văn kiện lịch sử.
- Nhận thức và tư duy lịch sử: Trình bày được bối cảnh lịch sử, diễn biến chính, nguyên nhân thắng lợi và ý nghĩa lịch sử sâu sắc của sự kiện.
- Vận dụng: Vận dụng bài học lịch sử về nắm bắt thời cơ vào cuộc sống và rèn luyện bản thân.
2. Phẩm chất:
- Bồi dưỡng lòng yêu nước, niềm tự hào dân tộc, lòng biết ơn đối với thế hệ cha anh đã hy sinh vì nền độc lập tự do của Tổ quốc.

II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU
1. Giáo viên:
- Máy chiếu, máy tính có kết nối hệ thống SỬ HỌC SỐ.
- Bản đồ/Lược đồ khởi nghĩa, ảnh tư liệu (Quảng trường Ba Đình 2/9/1945, lệnh Tổng khởi nghĩa).
- Phiếu học tập số 1 và số 2 cho các nhóm học viên.
2. Học viên:
- SGK Lịch sử, vở ghi chép, điện thoại/thiết bị truy cập phòng học trực tuyến SỬ HỌC SỐ.

III. TIẾN TRÌNH DẠY HỌC
1. Hoạt động 1: KHỞI ĐỘNG (7 phút)
- Mục tiêu: Kích hoạt sự tò mò và hiểu biết ban đầu của học viên về sự kiện.
- Nội dung: Cho học viên nghe đoạn âm thanh trích Tuyên ngôn Độc lập ngày 2/9/1945 và quan sát bức ảnh Bác Hồ đọc Tuyên ngôn.
- Câu hỏi định hướng: "Giọng đọc thiêng liêng ấy cất lên vào ngày nào, và dân tộc ta đã phải trải qua những cuộc đấu tranh hào hùng nào để có được giây phút độc lập đó?"
- Sản phẩm: Câu trả lời hào hứng của học viên, GV dẫn dắt vào bài mới.

2. Hoạt động 2: HÌNH THÀNH KIẾN THỨC MỚI (55 phút)
- Mục 1: Bối cảnh lịch sử và Thời cơ cách mạng chín muồi.
  + GV hướng dẫn học viên đọc tư liệu, thảo luận cặp đôi về khái niệm "ngàn năm có một".
  + HS hoàn thành bảng so sánh điều kiện khách quan và chủ quan.
- Mục 2: Diễn biến cuộc khởi nghĩa giành chính quyền.
  + Sử dụng lược đồ động trên màn hình lớp học: Hà Nội (19/8), Huế (23/8), Sài Gòn (25/8).
  + Học viên thảo luận nhóm theo bàn ghi lại các mốc thời gian mấu chốt.
- Mục 3: Nguyên nhân thắng lợi, ý nghĩa lịch sử và bài học kinh nghiệm.
  + Đúc kết 4 bài học lớn: Phát huy sức mạnh đại đoàn kết toàn dân, dự đoán thời cơ chính xác, kết hợp khởi nghĩa nông thôn với thành thị, xây dựng lực lượng vũ trang và chính trị.

3. Hoạt động 3: LUYỆN TẬP (18 phút)
- Học viên truy cập mục "Phòng học trực tuyến" trên hệ thống SỬ HỌC SỐ tham gia trò chơi trắc nghiệm 8 câu hỏi củng cố.
- Giáo viên quan sát màn hình tổng hợp điểm số tức thì, tuyên dương học viên làm nhanh và chính xác nhất.

4. Hoạt động 4: VẬN DỤNG VÀ MỞ RỘNG (10 phút)
- Nhiệm vụ: "Là thế hệ trẻ tại Quảng Ninh hôm nay, em rút ra được bài học gì về việc chủ động chuẩn bị năng lực để nắm bắt 'thời cơ' trong học tập và lập nghiệp?"
- Bài tập nộp qua mục Bài tập trực tuyến trên hệ thống trước tiết học tuần sau.

IV. PHIẾU HỌC TẬP SỐ 1
- Câu 1: Nêu 3 sự kiện quốc tế tạo nên thời cơ thuận lợi cho cách mạng Việt Nam năm 1945?
- Câu 2: Vì sao Đảng ta khẳng định: "Dù phải đốt cháy cả dãy Trường Sơn cũng phải kiên quyết giành cho được độc lập"?`;
}

function getFallbackExam(grade = 10, topic = 'Lịch sử Việt Nam thế kỷ XX'): string {
  return `SỞ GD&ĐT TỈNH QUẢNG NINH
TRUNG TÂM GDNN - GDTX THÀNH PHỐ QUẢNG NINH - PHÂN HIỆU TIÊN YÊN
ĐỀ KIỂM TRA ĐỊNH KỲ MÔN LỊCH SỬ - LỚP ${grade}
Thời gian làm bài: 45 phút (Không kể thời gian phát đề)
Giáo viên ra đề: Cao Thị Thu

A. MA TRẬN ĐỀ KIỂM TRA
- Nhận biết: 40% (4 điểm) - 8 câu trắc nghiệm
- Thông hiểu: 30% (3 điểm) - 4 câu trắc nghiệm + 1 ý tự luận
- Vận dụng: 20% (2 điểm) - 1 câu tự luận
- Vận dụng cao: 10% (1 điểm) - 1 ý tự luận liên hệ thực tế

B. ĐỀ BÀI
I. PHẦN TRẮC NGHIỆM (6.0 điểm - Mỗi câu đúng 0.5 điểm)
Câu 1: Bản chỉ thị "Nhật - Pháp bắn nhau và hành động của chúng ta" được Ban Thường vụ Trung ương Đảng ban hành vào thời gian nào?
A. Ngày 9/3/1945
B. Ngày 12/3/1945
C. Ngày 15/4/1945
D. Ngày 14/8/1945

Câu 2: Bốn tỉnh giành được chính quyền ở tỉnh lỵ sớm nhất trong Cách mạng tháng Tám năm 1945 là:
A. Hà Nội, Huế, Sài Gòn, Hải Phòng
B. Bắc Giang, Hải Dương, Hà Tĩnh, Quảng Nam
C. Thái Nguyên, Tuyên Quang, Cao Bằng, Lạng Sơn
D. Quảng Ninh, Hải Phòng, Nam Định, Thanh Hóa

Câu 3: Ngày 2/9/1945, tại Quảng trường Ba Đình (Hà Nội), Chủ tịch Hồ Chí Minh đã:
A. Ra Lời kêu gọi toàn quốc kháng chiến
B. Đọc bản Tuyên ngôn Độc lập khai sinh nước Việt Nam Dân chủ Cộng hòa
C. Thành lập Mặt trận Việt Minh
D. Ký Hiệp định Sơ bộ

Câu 4: Thắng lợi nào của quân và dân ta đã làm phá sản hoàn toàn kế hoạch Na-va của thực dân Pháp?
A. Chiến dịch Việt Bắc thu - đông 1947
B. Chiến dịch Biên giới thu - đông 1950
C. Chiến dịch Điện Biên Phủ 1954
D. Chiến dịch Tây Bắc 1952

II. PHẦN TỰ LUẬN (4.0 điểm)
Câu 1 (2.5 điểm): Phân tích nguyên nhân thắng lợi và ý nghĩa lịch sử của Cách mạng tháng Tám năm 1945?
Câu 2 (1.5 điểm): Từ bài học "chớp thời cơ" trong Cách mạng tháng Tám năm 1945, hãy liên hệ trách nhiệm của học sinh GDTX hiện nay trong việc chủ động học tập, nắm bắt cơ hội chuyển đổi số và phát triển quê hương Tiên Yên - Quảng Ninh?

C. HƯỚNG DẪN CHẤM VÀ THANG ĐIỂM
- Trắc nghiệm: 1-B, 2-B, 3-B, 4-C.
- Tự luận:
  + Câu 1: Nêu đủ nguyên nhân chủ quan (1.0đ), nguyên nhân khách quan (0.5đ), ý nghĩa đối với dân tộc (0.5đ), ý nghĩa đối với phong trào giải phóng dân tộc trên thế giới (0.5đ).
  + Câu 2: Liên hệ logic, thực tế, thể hiện tinh thần chủ động tự học và trách nhiệm công dân trẻ (1.5đ).`;
}

function getFallbackGraduationExam(
  topic = 'Lịch sử Việt Nam và Thế giới hiện đại',
  sourceText = '',
  examTitle = 'Đề luyện thi tốt nghiệp THPT Lịch sử 2025'
) {
  const p1 = [
    {
      id: 'fb_p1_1',
      content: 'Hội nghị I-an-ta (tháng 2/1945) có sự tham gia của nguyên thủ ba cường quốc nào sau đây?',
      options: [
        'A. Liên Xô, Mỹ, Anh.',
        'B. Mỹ, Anh, Pháp.',
        'C. Liên Xô, Trung Quốc, Mỹ.',
        'D. Mỹ, Pháp, Đức.'
      ],
      correctAnswer: 'A',
      cognitiveLevel: 'Nhận biết',
      explanation: 'Hội nghị I-an-ta diễn ra từ ngày 4 đến 11/2/1945 với sự tham dự của I. Xta-lin (Liên Xô), Ph. Ru-dơ-ven (Mỹ) và O. Sơ-chin (Anh).'
    },
    {
      id: 'fb_p1_2',
      content: 'Mục tiêu hàng đầu của tổ chức Liên hợp quốc được ghi nhận trong Hiến chương là gì?',
      options: [
        'A. Duy trì hòa bình và an ninh quốc tế.',
        'B. Thúc đẩy hợp tác thương mại tự do toàn cầu.',
        'C. Giải quyết xung đột bằng sức mạnh quân sự.',
        'D. Thiết lập liên minh quân sự xuyên lục địa.'
      ],
      correctAnswer: 'A',
      cognitiveLevel: 'Nhận biết',
      explanation: 'Mục đích chính của Liên hợp quốc là duy trì hòa bình và an ninh thế giới, phát triển các mối quan hệ hữu nghị giữa các dân tộc.'
    },
    {
      id: 'fb_p1_3',
      content: 'Quốc gia nào ở Đông Nam Á tuyên bố độc lập sớm nhất trong năm 1945 sau khi Nhật Bản đầu hàng Đồng minh?',
      options: [
        'A. In-đô-nê-xi-a.',
        'B. Việt Nam.',
        'C. Lào.',
        'D. Phi-líp-pin.'
      ],
      correctAnswer: 'A',
      cognitiveLevel: 'Nhận biết',
      explanation: 'In-đô-nê-xi-a tuyên bố độc lập ngày 17/8/1945, là quốc gia đầu tiên ở Đông Nam Á giành độc lập trong năm 1945.'
    },
    {
      id: 'fb_p1_4',
      content: 'Hiệp hội các quốc gia Đông Nam Á (ASEAN) được thành lập vào năm 1967 tại quốc gia nào?',
      options: [
        'A. Thái Lan.',
        'B. In-đô-nê-xi-a.',
        'C. Ma-lai-xi-a.',
        'D. Xin-ga-po.'
      ],
      correctAnswer: 'A',
      cognitiveLevel: 'Nhận biết',
      explanation: 'Ngày 8/8/1967, Hiệp hội các quốc gia Đông Nam Á (ASEAN) được thành lập tại Băng Cốc (Thái Lan) với 5 nước sáng lập.'
    },
    {
      id: 'fb_p1_5',
      content: 'Kế hoạch Mác-san (1947) của Mỹ thực chất nhằm mục đích gì đối với các nước Tây Âu?',
      options: [
        'A. Viện trợ kinh tế nhằm tập hợp Tây Âu vào liên minh chống Liên Xô.',
        'B. Giúp Tây Âu xây dựng nền kinh tế độc lập tự chủ hoàn toàn.',
        'C. Bồi thường thiệt hại chiến tranh cho nhân dân các nước Tây Âu.',
        'D. Hỗ trợ Tây Âu phục hồi để cạnh tranh trực tiếp với kinh tế Mỹ.'
      ],
      correctAnswer: 'A',
      cognitiveLevel: 'Thông hiểu',
      explanation: 'Kế hoạch Mác-san giúp phục hưng kinh tế Tây Âu nhưng đồng thời buộc Tây Âu phụ thuộc vào Mỹ và đối đầu với phe xã hội chủ nghĩa.'
    },
    {
      id: 'fb_p1_6',
      content: 'Xu thế chủ đạo trong quan hệ quốc tế sau Chiến tranh Lạnh là gì?',
      options: [
        'A. Hòa hoãn, đối thoại và hợp tác phát triển kinh tế.',
        'B. Chạy đua vũ trang và cạnh tranh hạt nhân gay gắt.',
        'C. Đơn cực hóa tuyệt đối dưới sự chi phối duy nhất của Mỹ.',
        'D. Phân cực sâu sắc giữa các khối quân sự đối đầu.'
      ],
      correctAnswer: 'A',
      cognitiveLevel: 'Thông hiểu',
      explanation: 'Sau Chiến tranh Lạnh, xu thế hòa hoãn, đối thoại, lấy hợp tác kinh tế làm trọng tâm trở thành xu thế lớn của thế giới.'
    },
    {
      id: 'fb_p1_7',
      content: 'Trong cuộc khai thác thuộc địa lần thứ hai (1919 - 1929), tư bản Pháp đầu tư nhiều nhất vào ngành kinh tế nào ở Đông Dương?',
      options: [
        'A. Nông nghiệp (đồn điền cao su) và khai mỏ (than).',
        'B. Công nghiệp luyện kim chế tạo máy móc hạng nặng.',
        'C. Giao thông vận tải viễn thông hiện đại.',
        'D. Tài chính ngân hàng và chứng khoán quốc tế.'
      ],
      correctAnswer: 'A',
      cognitiveLevel: 'Nhận biết',
      explanation: 'Pháp tập trung vốn nhiều nhất vào nông nghiệp (đồn điền cao su) và khai mỏ than để thu lợi nhuận nhanh và tận dụng nguồn nhân công rẻ mạt.'
    },
    {
      id: 'fb_p1_8',
      content: 'Giai cấp nào ở Việt Nam ra đời muộn nhưng nhanh chóng vươn lên nắm ngọn cờ lãnh đạo cách mạng Việt Nam?',
      options: [
        'A. Giai cấp công nhân.',
        'B. Giai cấp tư sản dân tộc.',
        'C. Giai cấp nông dân.',
        'D. Tầng lớp tiểu tư sản trí thức.'
      ],
      correctAnswer: 'A',
      cognitiveLevel: 'Nhận biết',
      explanation: 'Giai cấp công nhân Việt Nam sớm tiếp thu chủ nghĩa Mác - Lênin và đóng vai trò lãnh đạo cách mạng thông qua đội tiên phong là Đảng Cộng sản.'
    },
    {
      id: 'fb_p1_9',
      content: 'Tổ chức cách mạng nào do Nguyễn Ái Quốc sáng lập vào tháng 6/1925 tại Quảng Châu (Trung Quốc)?',
      options: [
        'A. Hội Việt Nam Cách mạng Thanh niên.',
        'B. Tân Việt Cách mạng đảng.',
        'C. Việt Nam Quốc dân đảng.',
        'D. Việt Nam Thanh niên Cách mạng đồng chí Hội.'
      ],
      correctAnswer: 'A',
      cognitiveLevel: 'Nhận biết',
      explanation: 'Tháng 6/1925, Nguyễn Ái Quốc thành lập Hội Việt Nam Cách mạng Thanh niên nhằm chuẩn bị về tổ chức và tư tưởng cho việc lập Đảng.'
    },
    {
      id: 'fb_p1_10',
      content: 'Hội nghị thành lập Đảng Cộng sản Việt Nam đầu năm 1930 diễn ra tại địa điểm nào?',
      options: [
        'A. Cửu Long (Hương Cảng, Trung Quốc).',
        'B. Quảng Châu (Trung Quốc).',
        'C. Băng Cốc (Thái Lan).',
        'D. Pác Bó (Cao Bằng, Việt Nam).'
      ],
      correctAnswer: 'A',
      cognitiveLevel: 'Nhận biết',
      explanation: 'Hội nghị hợp nhất các tổ chức cộng sản họp tại bán đảo Cửu Long (Hương Cảng, Trung Quốc) từ ngày 6/1/1930 do Nguyễn Ái Quốc chủ trì.'
    },
    {
      id: 'fb_p1_11',
      content: 'Văn kiện nào được thông qua tại Hội nghị thành lập Đảng năm 1930 được xem là Cương lĩnh chính trị đầu tiên của Đảng?',
      options: [
        'A. Chính cương vắn tắt và Sách lược vắn tắt do Nguyễn Ái Quốc soạn thảo.',
        'B. Luận cương chính trị tháng 10/1930 do Trần Phú soạn thảo.',
        'C. Tuyên ngôn của Đảng Cộng sản Đông Dương.',
        'D. Đề cương văn hóa Việt Nam năm 1943.'
      ],
      correctAnswer: 'A',
      cognitiveLevel: 'Nhận biết',
      explanation: 'Chính cương vắn tắt, Sách lược vắn tắt do Nguyễn Ái Quốc soạn thảo được thông qua tháng 2/1930 chính là Cương lĩnh chính trị đầu tiên.'
    },
    {
      id: 'fb_p1_12',
      content: 'Đỉnh cao của phong trào cách mạng 1930 - 1931 ở Việt Nam được đánh dấu bằng sự kiện nào?',
      options: [
        'A. Sự ra đời của chính quyền Xô viết Nghệ - Tĩnh.',
        'B. Cuộc bãi công của công nhân đồn điền cao su Phú Riềng.',
        'C. Khởi nghĩa Nam Kỳ và Bắc Sơn bùng nổ.',
        'D. Tổng bãi công của công nhân nhà máy sợi Nam Định.'
      ],
      correctAnswer: 'A',
      cognitiveLevel: 'Nhận biết',
      explanation: 'Xô viết Nghệ - Tĩnh ra đời vào tháng 9/1930 tại Nghệ An và Hà Tĩnh là đỉnh cao của phong trào cách mạng 1930 - 1931.'
    },
    {
      id: 'fb_p1_13',
      content: 'Nhiệm vụ hàng đầu của cách mạng Việt Nam được Đảng ta xác định trong giai đoạn 1936 - 1939 là gì?',
      options: [
        'A. Đấu tranh đòi tự do, dân chủ, cơm áo, hòa bình và chống phát xít.',
        'B. Đánh đổ đế quốc Pháp và phong kiến tay sai để giành độc lập dân tộc.',
        'C. Đánh đuổi phát xít Nhật và tay sai bù nhìn giải phóng hoàn toàn đất nước.',
        'D. Tịch thu ruộng đất của toàn bộ địa chủ chia cho nông dân nghèo.'
      ],
      correctAnswer: 'A',
      cognitiveLevel: 'Thông hiểu',
      explanation: 'Trong phong trào 1936 - 1939, Đảng chủ trương tạm gác khẩu hiệu độc lập dân tộc và cách mạng ruộng đất, tập trung đòi dân sinh, dân chủ.'
    },
    {
      id: 'fb_p1_14',
      content: 'Hội nghị lần thứ 8 Ban Chấp hành Trung ương Đảng (5/1941) đã quyết định thành lập mặt trận dân tộc thống nhất nào?',
      options: [
        'A. Mặt trận Việt Minh (Việt Nam Độc lập Đồng minh).',
        'B. Mặt trận Thống nhất nhân dân phản đế Đông Dương.',
        'C. Mặt trận Dân chủ Đông Dương.',
        'D. Mặt trận Liên Việt.'
      ],
      correctAnswer: 'A',
      cognitiveLevel: 'Nhận biết',
      explanation: 'Hội nghị Trung ương 8 (tháng 5/1941) tại Pác Bó đã thành lập Mặt trận Việt Nam Độc lập Đồng minh (gọi tắt là Mặt trận Việt Minh).'
    },
    {
      id: 'fb_p1_15',
      content: 'Chỉ thị "Nhật - Pháp bắn nhau và hành động của chúng ta" (12/3/1945) đã xác định kẻ thù cụ thể trước mắt của nhân dân Đông Dương là ai?',
      options: [
        'A. Phát xít Nhật.',
        'B. Thực dân Pháp.',
        'C. Thực dân Anh.',
        'D. Quân đội Tưởng Giới Thạch.'
      ],
      correctAnswer: 'A',
      cognitiveLevel: 'Nhận biết',
      explanation: 'Sau sự kiện Nhật đảo chính Pháp (9/3/1945), Đảng xác định phát xít Nhật trở thành kẻ thù chính, cụ thể trước mắt của cách mạng Đông Dương.'
    },
    {
      id: 'fb_p1_16',
      content: 'Ý nghĩa lịch sử quan trọng nhất của Cách mạng tháng Tám năm 1945 đối với dân tộc Việt Nam là gì?',
      options: [
        'A. Lật đổ ách thống trị của thực dân - phát xít, mở ra kỷ nguyên độc lập, tự do.',
        'B. Đánh bại hoàn toàn chủ nghĩa đế quốc thực dân trên phạm vi thế giới.',
        'C. Hoàn thành trọn vẹn cuộc cách mạng ruộng đất cho giai cấp nông dân.',
        'D. Đưa Việt Nam trở thành một trong những cường quốc công nghiệp hàng đầu.'
      ],
      correctAnswer: 'A',
      cognitiveLevel: 'Thông hiểu',
      explanation: 'Cách mạng tháng Tám phá tan xiềng xích thực dân - phát xít, lập nên nước Việt Nam Dân chủ Cộng hòa, mở ra kỷ nguyên độc lập tự do.'
    },
    {
      id: 'fb_p1_17',
      content: 'Chủ tịch Hồ Chí Minh ra "Lời kêu gọi toàn quốc kháng chiến" chống thực dân Pháp vào thời điểm nào?',
      options: [
        'A. Tối ngày 19/12/1946.',
        'B. Sáng ngày 2/9/1945.',
        'C. Đêm ngày 23/9/1945.',
        'D. Ngày 6/3/1946.'
      ],
      correctAnswer: 'A',
      cognitiveLevel: 'Nhận biết',
      explanation: 'Tối 19/12/1946, Chủ tịch Hồ Chí Minh thay mặt Trung ương Đảng và Chính phủ ra Lời kêu gọi toàn quốc kháng chiến.'
    },
    {
      id: 'fb_p1_18',
      content: 'Chiến thắng nào của quân dân ta đã làm thất bại âm mưu "đánh nhanh thắng nhanh" của thực dân Pháp?',
      options: [
        'A. Chiến dịch Việt Bắc thu - đông 1947.',
        'B. Chiến dịch Biên giới thu - đông 1950.',
        'C. Chiến dịch Tây Bắc 1952.',
        'D. Chiến dịch Điện Biên Phủ 1954.'
      ],
      correctAnswer: 'A',
      cognitiveLevel: 'Nhận biết',
      explanation: 'Chiến thắng Việt Bắc thu - đông 1947 đã bẻ gãy cuộc tấn công lên căn cứ địa của Pháp, buộc Pháp phải chuyển từ đánh nhanh thắng nhanh sang đánh lâu dài.'
    },
    {
      id: 'fb_p1_19',
      content: 'Ý nghĩa chiến lược to lớn của chiến thắng Biên giới thu - đông 1950 là gì?',
      options: [
        'A. Quân đội ta giành được quyền chủ động chiến lược trên chiến trường chính Bắc Bộ.',
        'B. Đánh bại hoàn toàn ý chí xâm lược của thực dân Pháp tại Việt Nam.',
        'C. Buộc Pháp phải ký ngay Hiệp định Giơ-ne-vơ công nhận độc lập.',
        'D. Giải phóng toàn bộ lãnh thổ Việt Nam từ vĩ tuyến 17 trở ra Bắc.'
      ],
      correctAnswer: 'A',
      cognitiveLevel: 'Thông hiểu',
      explanation: 'Với chiến thắng Biên giới 1950, ta đã mở đường liên lạc với các nước XHCN và giành thế chủ động chiến lược trên chiến trường chính.'
    },
    {
      id: 'fb_p1_20',
      content: 'Chiến dịch lịch sử Điện Biên Phủ (1954) toàn thắng đã trực tiếp dẫn tới kết quả ngoại giao nào sau đây?',
      options: [
        'A. Buộc Pháp phải ký Hiệp định Giơ-ne-vơ chấm dứt chiến tranh ở Đông Dương.',
        'B. Ký kết Hiệp định Pa-ri lập lại hòa bình tại miền Nam Việt Nam.',
        'C. Buộc Mỹ phải tuyên bố ngừng ném bom bắn phá miền Bắc Việt Nam.',
        'D. Gia nhập tổ chức Hiệp ước phòng thủ Đông Nam Á (SEATO).'
      ],
      correctAnswer: 'A',
      cognitiveLevel: 'Thông hiểu',
      explanation: 'Chiến thắng Điện Biên Phủ giáng đòn quyết định đập tan kế hoạch Na-va, buộc Pháp phải ký Hiệp định Giơ-ne-vơ năm 1954.'
    },
    {
      id: 'fb_p1_21',
      content: 'Phong trào "Đồng khởi" (1959 - 1960) nổ ra tiêu biểu nhất tại địa phương nào ở miền Nam?',
      options: [
        'A. Bến Tre.',
        'B. Quảng Nam.',
        'C. Tây Ninh.',
        'D. Bình Định.'
      ],
      correctAnswer: 'A',
      cognitiveLevel: 'Nhận biết',
      explanation: 'Phong trào Đồng khởi bắt đầu từ các cuộc nổi dậy lẻ tẻ và bùng nổ thành cao trào mạnh mẽ ở huyện Mỏ Cày, tỉnh Bến Tre ngày 17/1/1960.'
    },
    {
      id: 'fb_p1_22',
      content: 'Chiến lược "Chiến tranh cục bộ" (1965 - 1968) của Mỹ ở miền Nam có điểm khác biệt căn bản nào so với "Chiến tranh đặc biệt"?',
      options: [
        'A. Sử dụng trực tiếp lực lượng quân viễn chinh Mỹ và quân đồng minh tham chiến quy mô lớn.',
        'B. Hoàn toàn không dùng quân đội Sài Gòn trên tuyến đầu tác chiến.',
        'C. Không sử dụng hỏa lực pháo binh và không quân yểm trợ hỏa lực.',
        'D. Chỉ giới hạn phạm vi tác chiến ở các vùng đô thị miền Nam.'
      ],
      correctAnswer: 'A',
      cognitiveLevel: 'Thông hiểu',
      explanation: 'Trong Chiến tranh cục bộ, Mỹ đưa ồ ạt quân viễn chinh Mỹ và đồng minh trực tiếp tham chiến, giữ vai trò chủ đạo trên chiến trường.'
    },
    {
      id: 'fb_p1_23',
      content: 'Thắng lợi nào của quân dân miền Bắc cuối năm 1972 được coi là trận "Điện Biên Phủ trên không"?',
      options: [
        'A. Đánh bại cuộc tập kích chiến lược đường không bằng máy bay B-52 vào Hà Nội, Hải Phòng.',
        'B. Đánh chìm các tàu chiến hạm đội 7 của Mỹ trên vùng biển Vịnh Bắc Bộ.',
        'C. Phá hủy toàn bộ căn cứ quân sự Khe Sanh và Đường 9 - Nam Lào.',
        'D. Đập tan cuộc hành quân Lam Sơn 719 của quân đội Sài Gòn.'
      ],
      correctAnswer: 'A',
      cognitiveLevel: 'Nhận biết',
      explanation: 'Trận 12 ngày đêm cuối tháng 12/1972 đập tan cuộc tập kích B-52 của Mỹ vào Hà Nội, Hải Phòng, buộc Mỹ phải ký Hiệp định Pa-ri 1973.'
    },
    {
      id: 'fb_p1_24',
      content: 'Chiến dịch quân sự quyết định đỉnh cao trong cuộc Tổng tiến công và nổi dậy mùa Xuân năm 1975 là:',
      options: [
        'A. Chiến dịch Hồ Chí Minh lịch sử.',
        'B. Chiến dịch Tây Nguyên.',
        'C. Chiến dịch Huế - Đà Nẵng.',
        'D. Chiến dịch Đường 14 - Phước Long.'
      ],
      correctAnswer: 'A',
      cognitiveLevel: 'Nhận biết',
      explanation: 'Chiến dịch Hồ Chí Minh (từ ngày 26 đến 30/4/1975) giải phóng hoàn toàn Sài Gòn - Gia Định, kết thúc thắng lợi cuộc kháng chiến chống Mỹ.'
    }
  ];

  const p2 = [
    {
      id: 'fb_p2_1',
      topic: 'Phong trào cách mạng giải phóng dân tộc (1930 - 1945)',
      knowledgeDomain: 'Cách mạng tháng Tám và Tuyên ngôn Độc lập',
      cognitiveLevel: 'Thông hiểu',
      content: `Đọc đoạn trích sau trong Tuyên ngôn Độc lập của Chủ tịch Hồ Chí Minh (ngày 2/9/1945):
"Pháp chạy, Nhật hàng, vua Bảo Đại thoái vị. Dân ta đã đánh đổ các xiềng xích thực dân gần 100 năm nay để gây dựng nên nước Việt Nam độc lập. Dân ta lại đánh đổ chế độ quân chủ mấy mươi thế kỷ mà lập nên chế độ Dân chủ Cộng hòa... Nước Việt Nam có quyền hưởng tự do và độc lập, và sự thật đã thành một nước tự do, độc lập. Toàn thể dân tộc Việt Nam quyết đem tất cả tinh thần và lực lượng, tính mạng và của cải để giữ vững quyền tự do, độc lập ấy."`,
      trueFalseStatements: [
        {
          id: 'a',
          statement: 'Tuyên ngôn Độc lập khẳng định cuộc Cách mạng tháng Tám năm 1945 đã lật đổ cùng lúc ách thống trị của thực dân, phát xít và chế độ phong kiến quân chủ.',
          isCorrect: true,
          explanation: 'Đoạn trích nêu rõ: đánh đổ xiềng xích thực dân gần 100 năm và chế độ quân chủ mấy mươi thế kỷ.'
        },
        {
          id: 'b',
          statement: 'Nền độc lập của dân tộc Việt Nam năm 1945 là kết quả do quân Đồng minh trực tiếp trao trả sau khi đánh bại phát xít Nhật.',
          isCorrect: false,
          explanation: 'Độc lập là thành quả do toàn thể nhân dân Việt Nam dưới sự lãnh đạo của Đảng và Mặt trận Việt Minh đứng lên tự giành lấy trước khi Đồng minh vào.'
        },
        {
          id: 'c',
          statement: 'Bản Tuyên ngôn Độc lập đánh dấu sự ra đời của nhà nước dân chủ nhân dân đầu tiên ở Đông Nam Á: nước Việt Nam Dân chủ Cộng hòa.',
          isCorrect: true,
          explanation: 'Bản tuyên ngôn chính thức khai sinh nước Việt Nam Dân chủ Cộng hòa ngày 2/9/1945.'
        },
        {
          id: 'd',
          statement: 'Lời thề "quyết đem tất cả tinh thần và lực lượng..." thể hiện ý chí quyết tâm sắt đá của nhân dân ta bảo vệ nền độc lập vừa giành được trước nguy cơ xâm lược mới.',
          isCorrect: true,
          explanation: 'Khẳng định ý chí kiên quyết giữ vững thành quả cách mạng của toàn thể dân tộc Việt Nam.'
        }
      ]
    },
    {
      id: 'fb_p2_2',
      topic: 'Cuộc kháng chiến chống thực dân Pháp (1945 - 1954)',
      knowledgeDomain: 'Chiến dịch Điện Biên Phủ và Hiệp định Giơ-ne-vơ',
      cognitiveLevel: 'Thông hiểu',
      content: `Đọc tư liệu lịch sử sau đây về Chiến dịch Điện Biên Phủ (1954):
"Tập đoàn cứ điểm Điện Biên Phủ gồm 49 cứ điểm, được chia thành 3 phân khu liên hoàn: Phân khu Bắc, Phân khu Trung tâm và Phân khu Nam. Thực dân Pháp và can thiệp Mỹ coi Điện Biên Phủ là 'pháo đài bất khả xâm phạm', một 'cối xay thịt' nghiền nát bộ đội chủ lực Việt Minh. Với quyết tâm 'tất cả cho tiền tuyến, tất cả để chiến thắng', sau 56 ngày đêm khoét núi ngủ hầm, quân và dân ta đã đập tan tập đoàn cứ điểm này, bắt sống toàn bộ bộ chỉ huy Pháp do tướng Đờ Ca-xtơ-ri cầm đầu vào ngày 7/5/1954."`,
      trueFalseStatements: [
        {
          id: 'a',
          statement: 'Điện Biên Phủ vốn là điểm tập trung quân được định sẵn từ trước trong kế hoạch Na-va ban hành giữa năm 1953.',
          isCorrect: false,
          explanation: 'Điện Biên Phủ không có trong kế hoạch ban đầu của Na-va, mà do các cuộc tiến công chiến lược của ta trong đông - xuân 1953 - 1954 buộc Pháp phải biến Điện Biên Phủ thành nơi tập trung quân thứ hai.'
        },
        {
          id: 'b',
          statement: 'Thắng lợi của Chiến dịch Điện Biên Phủ gắn liền với quyết định lịch sử chuyển phương châm từ "đánh nhanh, thắng nhanh" sang "đánh chắc, tiến chắc" của Đại tướng Võ Nguyên Giáp.',
          isCorrect: true,
          explanation: 'Chuyển phương châm sang đánh chắc tiến chắc là quyết định sáng suốt mang tính quyết định thắng lợi của chiến dịch.'
        },
        {
          id: 'c',
          statement: 'Chiến thắng Điện Biên Phủ đã làm sụp đổ hoàn toàn chế độ chủ nghĩa thực dân mới của đế quốc Mỹ ở miền Nam Việt Nam.',
          isCorrect: false,
          explanation: 'Điện Biên Phủ giáng đòn quyết định kết thúc chủ nghĩa thực dân cũ của Pháp; lúc này Mỹ mới chỉ can thiệp giúp Pháp, chưa thiết lập chủ nghĩa thực dân mới ở miền Nam.'
        },
        {
          id: 'd',
          statement: 'Chiến dịch Điện Biên Phủ là đòn giáng quân sự quyết định dẫn tới việc ký kết Hiệp định Giơ-ne-vơ năm 1954 về Đông Dương.',
          isCorrect: true,
          explanation: 'Thắng lợi quân sự tạo tiền đề quyết định buộc Pháp phải ngồi vào bàn đàm phán ký Hiệp định Giơ-ne-vơ công nhận độc lập, chủ quyền, thống nhất của 3 nước Đông Dương.'
        }
      ]
    },
    {
      id: 'fb_p2_3',
      topic: 'Cuộc kháng chiến chống Mỹ, cứu nước (1954 - 1975)',
      knowledgeDomain: 'Hiệp định Pa-ri năm 1973',
      cognitiveLevel: 'Vận dụng',
      content: `Đọc đoạn trích trong Điều 1 và Điều 5 của Hiệp định Pa-ri về Việt Nam (ngày 27/1/1973):
"Điều 1: Hoa Kỳ và các nước khác tôn trọng độc lập, chủ quyền, thống nhất, toàn vẹn lãnh thổ của nước Việt Nam như Hiệp định Giơ-ne-vơ năm một nghìn chín trăm năm mươi tư về Việt Nam đã công nhận.
Điều 5: Trong thời hạn sáu mươi ngày kể từ khi ký Hiệp định này, sẽ hoàn thành việc rút hoàn toàn khỏi miền Nam Việt Nam quân đội, cố vấn quân sự, và nhân viên quân sự của Hoa Kỳ và của các nước ngoài khác..."`,
      trueFalseStatements: [
        {
          id: 'a',
          statement: 'Hiệp định Pa-ri năm 1973 buộc Hoa Kỳ phải cam kết tôn trọng các quyền dân tộc cơ bản của nhân dân Việt Nam.',
          isCorrect: true,
          explanation: 'Điều 1 nêu rõ Hoa Kỳ và các nước tôn trọng độc lập, chủ quyền, thống nhất, toàn vẹn lãnh thổ của nước Việt Nam.'
        },
        {
          id: 'b',
          statement: 'Sau khi ký Hiệp định Pa-ri, quân đội miền Bắc cũng phải rút hoàn toàn lực lượng vũ trang khỏi chiến trường miền Nam.',
          isCorrect: false,
          explanation: 'Hiệp định chỉ quy định quân Mỹ và quân đồng minh nước ngoài rút lui; lực lượng vũ trang cách mạng của ta vẫn hợp pháp ở lại miền Nam.'
        },
        {
          id: 'c',
          statement: 'Hiệp định Pa-ri năm 1973 đã hoàn thành mục tiêu chiến lược "Đánh cho Mỹ cút", tạo so sánh lực lượng có lợi để tiến tới "Đánh cho ngụy nhào".',
          isCorrect: true,
          explanation: 'Đây là thắng lợi ngoại giao to lớn kết hợp quân sự, buộc quân viễn chinh Mỹ phải rút về nước theo tư tưởng chỉ đạo của Chủ tịch Hồ Chí Minh.'
        },
        {
          id: 'd',
          statement: 'Hiệp định Pa-ri năm 1973 chấm dứt ngay lập tức mọi hoạt động tác chiến và mang lại hòa bình trọn vẹn trên toàn lãnh thổ Việt Nam.',
          isCorrect: false,
          explanation: 'Sau Hiệp định Pa-ri, chính quyền Sài Gòn do Mỹ hậu thuẫn tiếp tục tiến hành các chiến dịch "tràn ngập lãnh thổ", ta phải tiếp tục chiến đấu đến mùa Xuân 1975 mới giải phóng hoàn toàn.'
        }
      ]
    },
    {
      id: 'fb_p2_4',
      topic: 'Đất nước trọn niềm vui & Công cuộc Đổi mới (1975 đến nay)',
      knowledgeDomain: 'Đường lối Đổi mới của Đảng Cộng sản Việt Nam',
      cognitiveLevel: 'Vận dụng cao',
      content: `Đọc trích đoạn trong Văn kiện Đại hội đại biểu toàn quốc lần thứ VI của Đảng (tháng 12/1986):
"Đại hội VI của Đảng là mốc lịch sử quan trọng, mở ra thời kỳ đổi mới toàn diện đất nước. Đảng ta đã thẳng thắn 'nhìn thẳng vào sự thật, đánh giá đúng sự thật, nói rõ sự thật', thừa nhận những sai lầm khuyết điểm chủ quan, duy ý chí trong cải tạo xã hội chủ nghĩa và quản lý kinh tế. Trọng tâm của công cuộc đổi mới là đổi mới về kinh tế, phát triển nền kinh tế hàng hóa nhiều thành phần vận hành theo cơ chế thị trường có sự quản lý của Nhà nước, đồng thời từng bước đổi mới về chính trị và mở rộng quan hệ đối ngoại."`,
      trueFalseStatements: [
        {
          id: 'a',
          statement: 'Đại hội lần thứ VI (1986) xác định trọng tâm hàng đầu của công cuộc đổi mới đất nước là đổi mới hệ thống chính trị.',
          isCorrect: false,
          explanation: 'Đại hội VI xác định trọng tâm là đổi mới về kinh tế, đổi mới chính trị phải từng bước, vững chắc, giữ vững ổn định chính trị.'
        },
        {
          id: 'b',
          statement: 'Chủ trương phát triển nền kinh tế hàng hóa nhiều thành phần đã xóa bỏ cơ chế tập trung quan liêu, bao cấp tồn tại trước đó.',
          isCorrect: true,
          explanation: 'Kinh tế nhiều thành phần theo cơ chế thị trường định hướng XHCN thay thế cơ chế bao cấp trì trệ cũ.'
        },
        {
          id: 'c',
          statement: 'Tinh thần "nhìn thẳng vào sự thật, nói rõ sự thật" thể hiện bản lĩnh dũng cảm và tinh thần tự phê bình nghiêm túc của Đảng Cộng sản Việt Nam.',
          isCorrect: true,
          explanation: 'Văn kiện Đại hội khẳng định sự dũng cảm nhìn thẳng vào khuyết điểm chủ quan để tìm ra lối thoát cho khủng hoảng kinh tế - xã hội.'
        },
        {
          id: 'd',
          statement: 'Đường lối đổi mới đất nước khởi xướng từ năm 1986 đồng nghĩa với việc từ bỏ mục tiêu con đường đi lên chủ nghĩa xã hội ở Việt Nam.',
          isCorrect: false,
          explanation: 'Đổi mới không phải là thay đổi mục tiêu chủ nghĩa xã hội, mà là làm cho chủ nghĩa xã hội được nhận thức đúng đắn và xây dựng có hiệu quả hơn.'
        }
      ]
    }
  ];

  return {
    examTitle: examTitle || `Đề ôn thi tốt nghiệp THPT 2025 môn Lịch sử - Chủ đề: ${topic}`,
    topic: topic || 'Tổng hợp Lịch sử Việt Nam và Thế giới',
    grade: 12,
    part1: p1,
    part2: p2,
  };
}

function getFallbackSupportPlan(studentName = 'Học sinh', score = '4.5'): string {
  return `KẾ HOẠCH BỒI DƯỠNG VÀ HỖ TRỢ HỌC VIÊN CẦN QUAN TÂM
Đối tượng: ${studentName} | Điểm hiện tại: ${score}
Người lập kế hoạch: Cô Cao Thị Thu - Giáo viên Lịch sử

1. NHẬN ĐỊNH VÀ PHÂN TÍCH KHÓ KHĂN:
- Học viên còn lúng túng trong việc ghi nhớ các mốc sự kiện liên hoàn, dễ nhầm lẫn giữa các giai đoạn lịch sử.
- Thói quen học thụ động, chưa biết cách lập sơ đồ tư duy (Mindmap) hoặc dòng thời gian (Timeline).

2. BIỆN PHÁP HỖ TRỢ TRỌNG TÂM TRONG 4 TUẦN:
- Tuần 1: Rà soát lại kiến thức nền tảng; giao phiếu học tập điền khuyết với các mốc năm quan trọng nhất (thời gian làm bài ngắn: 10 phút/ngày).
- Tuần 2: Hướng dẫn vẽ "Dòng thời gian sự kiện" bằng các từ khóa ngắn gọn; ứng dụng câu hỏi trắc nghiệm trực quan trên SỬ HỌC SỐ.
- Tuần 3: Phân công bạn học khá trong tổ (Phương pháp "Đôi bạn cùng tiến") cùng ôn luyện, thảo luận câu hỏi tự luận ngắn.
- Tuần 4: Cho học viên làm bài kiểm tra thử 15 phút, động viên kịp thời khi có tiến bộ dù chỉ 0.5 - 1.0 điểm.

3. LỜI NHẮN NHỦ DÀNH CHO HỌC VIÊN:
"Lịch sử không phải là học thuộc lòng máy móc những con số, mà là hiểu về cội nguồn và niềm tự hào dân tộc. Cô luôn tin em sẽ tiến bộ từng ngày!"`;
}

// Development or Production handling
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SỬ HỌC SỐ] Server running at http://0.0.0.0:${PORT}`);
    seedDefaultUsersToSupabase();
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
