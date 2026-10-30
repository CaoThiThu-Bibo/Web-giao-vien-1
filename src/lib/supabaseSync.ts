import { supabase, isSupabaseConfigured } from './supabase';
import {
  Student,
  ClassRoom,
  Exam,
  AttendanceRecord,
  StudentSupportItem,
  Question,
  LearningMaterial,
  OnlineAssignment,
} from '../types';

// ================= MAPPERS =================

export function mapStudentToDb(s: Student) {
  return {
    id: s.id,
    code: s.code,
    full_name: s.fullName,
    gender: s.gender,
    dob: s.dob,
    class_id: s.classId,
    class_name: s.className,
    grade: s.grade,
    academic_year: s.academicYear,
    status: s.status,
    phone: s.phone || null,
    address: s.address || null,
    parent_name: s.parentName || null,
    parent_phone: s.parentPhone || null,
    notes: s.notes || null,
    scores: s.scores || {},
    average_score: s.averageScore ?? null,
    rank: s.rank || null,
    attendance_stats: s.attendanceStats || { present: 0, late: 0, excused: 0, unexcused: 0 },
  };
}

export function mapDbToStudent(row: any): Student {
  return {
    id: row.id,
    code: row.code,
    fullName: row.full_name,
    gender: row.gender,
    dob: row.dob,
    classId: row.class_id,
    className: row.class_name,
    grade: row.grade,
    academicYear: row.academic_year,
    status: row.status,
    phone: row.phone || undefined,
    address: row.address || undefined,
    parentName: row.parent_name || undefined,
    parentPhone: row.parent_phone || undefined,
    notes: row.notes || undefined,
    scores: row.scores || {},
    averageScore: row.average_score !== null ? Number(row.average_score) : undefined,
    rank: row.rank || undefined,
    attendanceStats: row.attendance_stats || { present: 0, late: 0, excused: 0, unexcused: 0 },
  };
}

export function mapClassToDb(c: ClassRoom) {
  return {
    id: c.id,
    code: c.code,
    name: c.name,
    grade: c.grade,
    academic_year: c.academicYear,
    head_teacher: c.headTeacher,
    room: c.room,
    notes: c.notes || null,
  };
}

export function mapDbToClass(row: any): ClassRoom {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    grade: row.grade,
    academicYear: row.academic_year,
    studentCount: 0,
    headTeacher: row.head_teacher,
    room: row.room,
    notes: row.notes || undefined,
  };
}

export function mapExamToDb(e: Exam) {
  return {
    id: e.id,
    code: e.code,
    title: e.title,
    class_id: e.classId || null,
    class_name: e.className,
    grade: e.grade,
    date: e.date,
    type: e.type,
    format: e.format,
    max_score: e.maxScore,
    weight: e.weight,
    description: e.description || null,
    average_score: e.averageScore ?? null,
  };
}

export function mapDbToExam(row: any): Exam {
  return {
    id: row.id,
    code: row.code,
    title: row.title,
    classId: row.class_id || '',
    className: row.class_name,
    grade: row.grade,
    date: row.date,
    type: row.type,
    format: row.format,
    maxScore: Number(row.max_score || 10),
    weight: Number(row.weight || 1),
    description: row.description || undefined,
    averageScore: row.average_score !== null ? Number(row.average_score) : undefined,
  };
}

export function mapAttendanceToDb(a: AttendanceRecord) {
  return {
    id: a.id,
    date: a.date,
    class_id: a.classId,
    student_id: a.studentId,
    student_name: a.studentName,
    status: a.status,
    note: a.note || null,
    period: a.period || null,
  };
}

export function mapDbToAttendance(row: any): AttendanceRecord {
  return {
    id: row.id,
    date: row.date,
    classId: row.class_id,
    studentId: row.student_id,
    studentName: row.student_name,
    status: row.status,
    note: row.note || undefined,
    period: row.period || undefined,
  };
}

export function mapSupportToDb(s: StudentSupportItem) {
  return {
    id: s.id,
    student_id: s.studentId,
    student_name: s.studentName,
    student_code: s.studentCode,
    class_name: s.className,
    grade: s.grade,
    reason: s.reason,
    difficulties: s.difficulties,
    plan: s.plan,
    tasks: s.tasks,
    deadline: s.deadline,
    result: s.result,
    status: s.status,
    teacher_notes: s.teacherNotes,
    ai_recommendation: s.aiRecommendation || null,
    updated_at: s.updatedAt,
  };
}

export function mapDbToSupport(row: any): StudentSupportItem {
  return {
    id: row.id,
    studentId: row.student_id,
    studentName: row.student_name,
    studentCode: row.student_code,
    className: row.class_name,
    grade: row.grade,
    reason: row.reason,
    difficulties: row.difficulties,
    plan: row.plan,
    tasks: row.tasks,
    deadline: row.deadline,
    result: row.result,
    status: row.status,
    teacherNotes: row.teacher_notes,
    aiRecommendation: row.ai_recommendation || undefined,
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

export function mapQuestionToDb(q: Question) {
  // Store structured details inside JSONB options if present
  let optionsPayload: any = q.options || [];
  if (q.trueFalseStatements || q.blankItems || q.matchingPairs || q.rubricPoints || q.essayOutline || q.wordBank) {
    optionsPayload = {
      options: q.options || [],
      trueFalseStatements: q.trueFalseStatements,
      blankItems: q.blankItems,
      wordBank: q.wordBank,
      matchingPairs: q.matchingPairs,
      rubricPoints: q.rubricPoints,
      essayOutline: q.essayOutline,
    };
  }

  return {
    id: q.id,
    grade: q.grade,
    topic: q.topic,
    lesson: q.lesson,
    knowledge_domain: q.knowledgeDomain,
    type: q.type,
    cognitive_level: q.cognitiveLevel,
    content: q.content,
    options: optionsPayload,
    correct_answer: q.correctAnswer,
    explanation: q.explanation,
    source: q.source,
    author: q.author,
    updated_at: q.updatedAt,
  };
}

export function mapDbToQuestion(row: any): Question {
  const isObjectOptions = row.options && !Array.isArray(row.options) && typeof row.options === 'object';
  const optData = isObjectOptions ? row.options : {};

  return {
    id: row.id,
    grade: row.grade,
    topic: row.topic,
    lesson: row.lesson,
    knowledgeDomain: row.knowledge_domain,
    type: row.type,
    cognitiveLevel: row.cognitive_level,
    content: row.content,
    options: Array.isArray(row.options) ? row.options : (optData.options || []),
    trueFalseStatements: optData.trueFalseStatements,
    blankItems: optData.blankItems,
    wordBank: optData.wordBank,
    matchingPairs: optData.matchingPairs,
    rubricPoints: optData.rubricPoints,
    essayOutline: optData.essayOutline,
    correctAnswer: row.correct_answer,
    explanation: row.explanation,
    source: row.source,
    author: row.author,
    updatedAt: row.updated_at,
  };
}

export function mapMaterialToDb(m: LearningMaterial) {
  return {
    id: m.id,
    title: m.title,
    category: m.category,
    grade: m.grade,
    topic: m.topic,
    lesson: m.lesson,
    description: m.description,
    url: m.url,
    source: m.source,
    copyright: m.copyright,
    file_type: m.fileType,
    file_size: m.fileSize,
    updated_at: m.updatedAt,
  };
}

export function mapDbToMaterial(row: any): LearningMaterial {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    grade: row.grade,
    topic: row.topic,
    lesson: row.lesson,
    description: row.description,
    url: row.url,
    source: row.source,
    copyright: row.copyright,
    fileType: row.file_type,
    fileSize: row.file_size,
    updatedAt: row.updated_at,
  };
}

// ================= HIGH-LEVEL SYNC OPERATIONS =================

export interface SyncResult {
  success: boolean;
  message: string;
  counts?: {
    classes?: number;
    students?: number;
    exams?: number;
    attendance?: number;
    support?: number;
    questions?: number;
    materials?: number;
  };
}

/**
 * Upload all local in-memory/initial data to Supabase in one batch
 */
export async function pushAllToSupabase(payload: {
  classes: ClassRoom[];
  students: Student[];
  exams: Exam[];
  attendanceRecords: AttendanceRecord[];
  supportItems: StudentSupportItem[];
  questions: Question[];
  materials: LearningMaterial[];
}): Promise<SyncResult> {
  if (!isSupabaseConfigured) {
    return { success: false, message: 'Chưa cấu hình thông tin kết nối Supabase.' };
  }

  try {
    // 1. Classes
    if (payload.classes.length > 0) {
      const dbClasses = payload.classes.map(mapClassToDb);
      const { error: clsErr } = await supabase.from('classes').upsert(dbClasses);
      if (clsErr) throw new Error(`Lớp học: ${clsErr.message}`);
    }

    // 2. Students
    if (payload.students.length > 0) {
      const dbStudents = payload.students.map(mapStudentToDb);
      const { error: stuErr } = await supabase.from('students').upsert(dbStudents);
      if (stuErr) throw new Error(`Học sinh: ${stuErr.message}`);
    }

    // 3. Exams
    if (payload.exams.length > 0) {
      const dbExams = payload.exams.map(mapExamToDb);
      const { error: exErr } = await supabase.from('exams').upsert(dbExams);
      if (exErr) throw new Error(`Bài kiểm tra: ${exErr.message}`);
    }

    // 4. Attendance
    if (payload.attendanceRecords.length > 0) {
      const dbAtt = payload.attendanceRecords.map(mapAttendanceToDb);
      const { error: attErr } = await supabase.from('attendance_records').upsert(dbAtt);
      if (attErr) throw new Error(`Điểm danh: ${attErr.message}`);
    }

    // 5. Support items
    if (payload.supportItems.length > 0) {
      const dbSup = payload.supportItems.map(mapSupportToDb);
      const { error: supErr } = await supabase.from('student_support').upsert(dbSup);
      if (supErr) throw new Error(`Hồ sơ hỗ trợ: ${supErr.message}`);
    }

    // 6. Questions
    if (payload.questions.length > 0) {
      const dbQuestions = payload.questions.map(mapQuestionToDb);
      const { error: qErr } = await supabase.from('questions').upsert(dbQuestions);
      if (qErr) throw new Error(`Ngân hàng câu hỏi: ${qErr.message}`);
    }

    // 7. Materials
    if (payload.materials.length > 0) {
      const dbMat = payload.materials.map(mapMaterialToDb);
      const { error: matErr } = await supabase.from('learning_materials').upsert(dbMat);
      if (matErr) throw new Error(`Tư liệu số: ${matErr.message}`);
    }

    return {
      success: true,
      message: 'Đã đồng bộ toàn bộ dữ liệu lên cơ sở dữ liệu Supabase thành công!',
      counts: {
        classes: payload.classes.length,
        students: payload.students.length,
        exams: payload.exams.length,
        attendance: payload.attendanceRecords.length,
        support: payload.supportItems.length,
        questions: payload.questions.length,
        materials: payload.materials.length,
      },
    };
  } catch (err: any) {
    console.error('Error syncing to Supabase:', err);
    return {
      success: false,
      message: `Đồng bộ chưa hoàn tất: ${err.message || 'Lỗi không xác định'}. Hãy chắc chắn rằng bạn đã tạo bảng trong SQL Editor của Supabase.`,
    };
  }
}

/**
 * Fetch all records from Supabase
 */
export async function fetchAllFromSupabase(): Promise<{
  classes?: ClassRoom[];
  students?: Student[];
  exams?: Exam[];
  attendanceRecords?: AttendanceRecord[];
  supportItems?: StudentSupportItem[];
  questions?: Question[];
  materials?: LearningMaterial[];
  hasData: boolean;
  error?: string;
}> {
  if (!isSupabaseConfigured) {
    return { hasData: false };
  }

  try {
    const [clsRes, stuRes, exRes, attRes, supRes, qRes, matRes] = await Promise.all([
      supabase.from('classes').select('*'),
      supabase.from('students').select('*'),
      supabase.from('exams').select('*'),
      supabase.from('attendance_records').select('*'),
      supabase.from('student_support').select('*'),
      supabase.from('questions').select('*'),
      supabase.from('learning_materials').select('*'),
    ]);

    // Check if any error indicates tables do not exist
    if (clsRes.error && clsRes.error.code === '42P01') {
      return { hasData: false, error: 'Bảng cơ sở dữ liệu chưa được khởi tạo trên Supabase.' };
    }

    const classes = clsRes.data ? clsRes.data.map(mapDbToClass) : undefined;
    const students = stuRes.data ? stuRes.data.map(mapDbToStudent) : undefined;
    const exams = exRes.data ? exRes.data.map(mapDbToExam) : undefined;
    const attendanceRecords = attRes.data ? attRes.data.map(mapDbToAttendance) : undefined;
    const supportItems = supRes.data ? supRes.data.map(mapDbToSupport) : undefined;
    const questions = qRes.data ? qRes.data.map(mapDbToQuestion) : undefined;
    const materials = matRes.data ? matRes.data.map(mapDbToMaterial) : undefined;

    const hasData = Boolean(
      (students && students.length > 0) ||
      (classes && classes.length > 0)
    );

    return {
      classes,
      students,
      exams,
      attendanceRecords,
      supportItems,
      questions,
      materials,
      hasData,
    };
  } catch (err: any) {
    console.warn('Error fetching all from Supabase:', err);
    return { hasData: false, error: err.message };
  }
}

// Realtime helpers for individual operations
export async function syncStudentToSupabase(student: Student) {
  if (!isSupabaseConfigured) return;
  try {
    await supabase.from('students').upsert(mapStudentToDb(student));
  } catch (e) {
    console.warn('Supabase upsert student error:', e);
  }
}

export async function deleteStudentFromSupabase(studentId: string) {
  if (!isSupabaseConfigured) return;
  try {
    await supabase.from('students').delete().eq('id', studentId);
  } catch (e) {
    console.warn('Supabase delete student error:', e);
  }
}

export async function syncClassToSupabase(cls: ClassRoom) {
  if (!isSupabaseConfigured) return;
  try {
    await supabase.from('classes').upsert(mapClassToDb(cls));
  } catch (e) {
    console.warn('Supabase upsert class error:', e);
  }
}

export async function deleteClassFromSupabase(classId: string) {
  if (!isSupabaseConfigured) return;
  try {
    await supabase.from('classes').delete().eq('id', classId);
  } catch (e) {
    console.warn('Supabase delete class error:', e);
  }
}

export async function syncExamToSupabase(exam: Exam) {
  if (!isSupabaseConfigured) return;
  try {
    await supabase.from('exams').upsert(mapExamToDb(exam));
  } catch (e) {
    console.warn('Supabase upsert exam error:', e);
  }
}

export async function deleteExamFromSupabase(examId: string) {
  if (!isSupabaseConfigured) return;
  try {
    await supabase.from('exams').delete().eq('id', examId);
  } catch (e) {
    console.warn('Supabase delete exam error:', e);
  }
}

export async function syncAttendanceToSupabase(records: AttendanceRecord[]) {
  if (!isSupabaseConfigured || records.length === 0) return;
  try {
    await supabase.from('attendance_records').upsert(records.map(mapAttendanceToDb));
  } catch (e) {
    console.warn('Supabase upsert attendance error:', e);
  }
}

export async function syncSupportItemToSupabase(item: StudentSupportItem) {
  if (!isSupabaseConfigured) return;
  try {
    await supabase.from('student_support').upsert(mapSupportToDb(item));
  } catch (e) {
    console.warn('Supabase upsert support error:', e);
  }
}

export async function deleteSupportItemFromSupabase(id: string) {
  if (!isSupabaseConfigured) return;
  try {
    await supabase.from('student_support').delete().eq('id', id);
  } catch (e) {
    console.warn('Supabase delete support error:', e);
  }
}

export async function syncQuestionToSupabase(q: Question) {
  if (!isSupabaseConfigured) return;
  try {
    await supabase.from('questions').upsert(mapQuestionToDb(q));
  } catch (e) {
    console.warn('Supabase upsert question error:', e);
  }
}

export async function deleteQuestionFromSupabase(id: string) {
  if (!isSupabaseConfigured) return;
  try {
    await supabase.from('questions').delete().eq('id', id);
  } catch (e) {
    console.warn('Supabase delete question error:', e);
  }
}

export async function syncMaterialToSupabase(m: LearningMaterial) {
  if (!isSupabaseConfigured) return;
  try {
    await supabase.from('learning_materials').upsert(mapMaterialToDb(m));
  } catch (e) {
    console.warn('Supabase upsert material error:', e);
  }
}

export async function deleteMaterialFromSupabase(id: string) {
  if (!isSupabaseConfigured) return;
  try {
    await supabase.from('learning_materials').delete().eq('id', id);
  } catch (e) {
    console.warn('Supabase delete material error:', e);
  }
}
