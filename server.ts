import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
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

// API: Exam Matrix & Questions Generator
app.post('/api/gemini/generate-exam', async (req, res) => {
  const { grade, topic, examType, duration, numMC, numEssay, difficultyDistribution } = req.body;

  const prompt = `
Bạn là chuyên gia khảo thí và đánh giá môn Lịch sử THPT/GDTX.
Hãy xây dựng MA TRẬN, BẢN ĐẶC TẢ VÀ ĐỀ KIỂM TRA MÔN LỊCH SỬ:
- Khối lớp: Lớp ${grade || 10}
- Chủ đề kiểm tra: ${topic || 'Lịch sử Việt Nam'}
- Hình thức: ${examType || 'Kết hợp Trắc nghiệm và Tự luận'}
- Thời gian làm bài: ${duration || '45 phút'}
- Số câu trắc nghiệm: ${numMC || 12} câu
- Số câu tự luận: ${numEssay || 2} câu
- Tỉ lệ nhận thức: ${difficultyDistribution || '40% Nhận biết, 30% Thông hiểu, 20% Vận dụng, 10% Vận dụng cao'}

Nội dung xuất ra gồm 3 phần:
Phần I: MA TRẬN VÀ BẢN ĐẶC TẢ ĐỀ KIỂM TRA (Bảng phân bổ câu hỏi theo 4 mức độ nhận thức)
Phần II: ĐỀ BÀI KIỂM TRA
- A. PHẦN TRẮC NGHIỆM KHÁCH QUAN (${numMC || 12} câu, 4 lựa chọn A, B, C, D rõ ràng)
- B. PHẦN TỰ LUẬN (${numEssay || 2} câu hỏi phát triển năng lực tư duy lịch sử, khai thác tư liệu)
Phần III: ĐÁP ÁN, HƯỚNG DẪN CHẤM VÀ THANG ĐIỂM CHI TIẾT
- Bảng đáp án trắc nghiệm kèm giải thích ngắn
- Biểu điểm tự luận chi tiết từng ý (chuẩn xác mốc thời gian, ý nghĩa lịch sử).
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
    console.warn('Gemini API call failed or not configured, returning exam template:', err?.message);
    res.json({
      success: true,
      text: getFallbackExam(grade, topic),
      isFallback: true,
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
