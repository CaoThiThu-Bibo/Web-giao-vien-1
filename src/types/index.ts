export type ActiveTab =
  | 'dashboard'
  | 'students'
  | 'classes'
  | 'gradebook'
  | 'attendance'
  | 'reports'
  | 'ai-assistant'
  | 'question-bank'
  | 'materials'
  | 'online-room'
  | 'student-support'
  | 'settings';

export type UserRole = 'teacher' | 'student' | 'admin';

export interface Student {
  id: string;
  code: string;
  fullName: string;
  gender: 'Nam' | 'Nữ';
  dob: string;
  classId: string;
  className: string;
  grade: 10 | 11 | 12;
  academicYear: string;
  status: 'Đang học' | 'Cần hỗ trợ' | 'Nghỉ học' | 'Chuyển trường';
  phone?: string;
  address?: string;
  parentName?: string;
  parentPhone?: string;
  notes?: string;
  scores: Record<string, number>; // examId -> score
  averageScore?: number;
  rank?: 'Giỏi' | 'Khá' | 'Trung bình' | 'Yếu';
  attendanceStats: {
    present: number;
    late: number;
    excused: number;
    unexcused: number;
  };
}

export interface ClassRoom {
  id: string;
  code: string;
  name: string;
  grade: 10 | 11 | 12;
  academicYear: string;
  studentCount: number;
  headTeacher: string;
  room: string;
  notes?: string;
}

export type ExamType =
  | '15 phút'
  | '1 tiết (45 phút)'
  | 'Giữa kỳ'
  | 'Cuối kỳ'
  | 'Đánh giá thường xuyên';

export type ExamFormat = 'Trắc nghiệm' | 'Tự luận' | 'Kết hợp';

export interface Exam {
  id: string;
  code: string;
  title: string;
  classId: string;
  className: string;
  grade: 10 | 11 | 12;
  date: string;
  type: ExamType;
  format: ExamFormat;
  maxScore: number;
  weight: number; // hệ số: 1, 2, 3
  description?: string;
  averageScore?: number;
}

export interface ScoreHistoryEntry {
  date: string;
  oldScore: number;
  newScore: number;
  reason: string;
  changedBy: string;
}

export interface ScoreRecord {
  id: string;
  examId: string;
  studentId: string;
  studentCode: string;
  studentName: string;
  classId: string;
  score: number;
  comment?: string;
  updatedAt: string;
  history?: ScoreHistoryEntry[];
}

export type AttendanceStatus = 'present' | 'late' | 'excused' | 'unexcused';

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  classId: string;
  studentId: string;
  studentName: string;
  status: AttendanceStatus;
  note?: string;
  period?: string;
}

export interface TeachingSchedule {
  id: string;
  dayOfWeek: string;
  subject: string;
  className: string;
  period: string;
  note: string;
  room?: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  content: string;
  date: string;
  type: 'reminder' | 'exam' | 'material' | 'system';
  read: boolean;
}

export interface Question {
  id: string;
  grade: 10 | 11 | 12;
  topic: string;
  lesson: string;
  knowledgeDomain: string;
  type: 'Trắc nghiệm' | 'Tự luận';
  cognitiveLevel: 'Nhận biết' | 'Thông hiểu' | 'Vận dụng' | 'Vận dụng cao';
  content: string;
  options?: string[]; // for multiple choice [A, B, C, D]
  correctAnswer: string;
  explanation: string;
  source: string;
  author: string;
  updatedAt: string;
}

export interface LearningMaterial {
  id: string;
  title: string;
  category:
    | 'Sách giáo khoa & Tham khảo'
    | 'Bản đồ lịch sử'
    | 'Tranh ảnh tư liệu'
    | 'Video tư liệu'
    | 'Văn bản gốc'
    | 'Phiếu học tập'
    | 'Bài giảng điện tử';
  grade: 10 | 11 | 12;
  topic: string;
  lesson: string;
  description: string;
  url: string;
  source: string;
  copyright: string;
  updatedAt: string;
  fileType: string;
  fileSize: string;
}

export interface OnlineAssignment {
  id: string;
  title: string;
  classId: string;
  className: string;
  grade: 10 | 11 | 12;
  topic: string;
  deadline: string;
  durationMinutes: number;
  status: 'Đang mở' | 'Đã đóng';
  questions: {
    id: string;
    question: string;
    options: string[];
    correctAnswer: string;
    score: number;
  }[];
  submissions: {
    studentId: string;
    studentName: string;
    submittedAt: string;
    score: number;
    answers: Record<string, string>;
    teacherFeedback?: string;
    status: 'Đã chấm' | 'Chờ chấm';
  }[];
}

export interface StudentSupportItem {
  id: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  className: string;
  grade: 10 | 11 | 12;
  reason: string;
  difficulties: string;
  plan: string;
  tasks: string;
  deadline: string;
  result: string;
  status: 'Đang theo dõi' | 'Đã cải thiện' | 'Cần can thiệp sâu';
  teacherNotes: string;
  aiRecommendation?: string;
  updatedAt: string;
}

export interface SystemConfig {
  teacherName: string;
  teacherTitle: string;
  institution: string;
  branch: string;
  academicYear: string;
  semester: string;
  evaluationRule: string;
  activeRole: UserRole;
  currentStudentId?: string;
}
