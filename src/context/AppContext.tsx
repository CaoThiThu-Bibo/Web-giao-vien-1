import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ActiveTab,
  Student,
  ClassRoom,
  Exam,
  TeachingSchedule,
  SystemNotification,
  Question,
  LearningMaterial,
  OnlineAssignment,
  StudentSupportItem,
  SystemConfig,
  AttendanceRecord,
  UserRole,
} from '../types';
import {
  initialSystemConfig,
  initialClasses,
  initialStudents,
  initialExams,
  initialTeachingSchedule,
  initialNotifications,
  initialSupportItems,
  initialQuestions,
  initialMaterials,
  initialOnlineAssignments,
} from '../data/initialData';

interface AppContextType {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  systemConfig: SystemConfig;
  updateSystemConfig: (config: Partial<SystemConfig>) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  
  // Students
  students: Student[];
  addStudent: (student: Omit<Student, 'id'>) => void;
  updateStudent: (id: string, updated: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  importStudents: (newStudents: Partial<Student>[]) => { successCount: number; errors: string[] };

  // Classes
  classes: ClassRoom[];
  addClass: (cls: Omit<ClassRoom, 'id' | 'studentCount'>) => void;
  updateClass: (id: string, updated: Partial<ClassRoom>) => void;
  deleteClass: (id: string) => void;

  // Exams & Gradebook
  exams: Exam[];
  addExam: (exam: Omit<Exam, 'id'>) => void;
  updateExam: (id: string, updated: Partial<Exam>) => void;
  deleteExam: (id: string) => void;
  updateStudentScore: (studentId: string, examId: string, score: number, reason?: string) => void;
  batchUpdateScores: (examId: string, scoreMap: Record<string, number>) => void;

  // Attendance
  attendanceRecords: AttendanceRecord[];
  markAttendance: (record: Omit<AttendanceRecord, 'id'>) => void;
  batchMarkAttendance: (records: Omit<AttendanceRecord, 'id'>[]) => void;

  // Schedule & Notifications
  schedule: TeachingSchedule[];
  notifications: SystemNotification[];
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;

  // Support
  supportItems: StudentSupportItem[];
  addSupportItem: (item: Omit<StudentSupportItem, 'id' | 'updatedAt'>) => void;
  updateSupportItem: (id: string, updated: Partial<StudentSupportItem>) => void;
  deleteSupportItem: (id: string) => void;

  // Question Bank
  questions: Question[];
  addQuestion: (q: Omit<Question, 'id' | 'updatedAt'>) => void;
  updateQuestion: (id: string, updated: Partial<Question>) => void;
  deleteQuestion: (id: string) => void;

  // Materials
  materials: LearningMaterial[];
  addMaterial: (m: Omit<LearningMaterial, 'id' | 'updatedAt'>) => void;
  deleteMaterial: (id: string) => void;

  // Online assignments
  assignments: OnlineAssignment[];
  addAssignment: (a: Omit<OnlineAssignment, 'id'>) => void;
  submitAssignmentAnswers: (assignmentId: string, studentId: string, studentName: string, answers: Record<string, string>, score: number) => void;
  gradeSubmission: (assignmentId: string, studentId: string, score: number, feedback: string) => void;

  // Data reset & backup
  resetToDemoData: () => void;
  exportDatabaseJson: () => void;
  importDatabaseJson: (jsonString: string) => boolean;

  // Selected student for quick profile view
  viewingStudentId: string | null;
  setViewingStudentId: (id: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'suhocso_app_data_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [systemConfig, setSystemConfig] = useState<SystemConfig>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_config`);
      return saved ? JSON.parse(saved) : initialSystemConfig;
    } catch {
      return initialSystemConfig;
    }
  });

  const [classes, setClasses] = useState<ClassRoom[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_classes`);
      return saved ? JSON.parse(saved) : initialClasses;
    } catch {
      return initialClasses;
    }
  });

  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_students`);
      return saved ? JSON.parse(saved) : initialStudents;
    } catch {
      return initialStudents;
    }
  });

  const [exams, setExams] = useState<Exam[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_exams`);
      return saved ? JSON.parse(saved) : initialExams;
    } catch {
      return initialExams;
    }
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_attendance`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [schedule] = useState<TeachingSchedule[]>(initialTeachingSchedule);
  const [notifications, setNotifications] = useState<SystemNotification[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_notifs`);
      return saved ? JSON.parse(saved) : initialNotifications;
    } catch {
      return initialNotifications;
    }
  });

  const [supportItems, setSupportItems] = useState<StudentSupportItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_support`);
      return saved ? JSON.parse(saved) : initialSupportItems;
    } catch {
      return initialSupportItems;
    }
  });

  const [questions, setQuestions] = useState<Question[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_questions`);
      return saved ? JSON.parse(saved) : initialQuestions;
    } catch {
      return initialQuestions;
    }
  });

  const [materials, setMaterials] = useState<LearningMaterial[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_materials`);
      return saved ? JSON.parse(saved) : initialMaterials;
    } catch {
      return initialMaterials;
    }
  });

  const [assignments, setAssignments] = useState<OnlineAssignment[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_assignments`);
      return saved ? JSON.parse(saved) : initialOnlineAssignments;
    } catch {
      return initialOnlineAssignments;
    }
  });

  const [viewingStudentId, setViewingStudentId] = useState<string | null>(null);

  // Sync to local storage on change
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_config`, JSON.stringify(systemConfig));
  }, [systemConfig]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_classes`, JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_students`, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_exams`, JSON.stringify(exams));
  }, [exams]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_attendance`, JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_notifs`, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_support`, JSON.stringify(supportItems));
  }, [supportItems]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_questions`, JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_materials`, JSON.stringify(materials));
  }, [materials]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_assignments`, JSON.stringify(assignments));
  }, [assignments]);

  // Recalculate class student counts
  useEffect(() => {
    setClasses((prev) =>
      prev.map((c) => {
        const count = students.filter((s) => s.classId === c.id || s.className === c.code).length;
        return { ...c, studentCount: count };
      })
    );
  }, [students.length]);

  const updateSystemConfig = (cfg: Partial<SystemConfig>) => {
    setSystemConfig((prev) => ({ ...prev, ...cfg }));
  };

  const setUserRole = (role: UserRole) => {
    setSystemConfig((prev) => ({ ...prev, activeRole: role }));
  };

  // Student operations
  const addStudent = (studentData: Omit<Student, 'id'>) => {
    const newId = `std_${Date.now()}`;
    const newStudent: Student = {
      ...studentData,
      id: newId,
    };
    setStudents((prev) => [newStudent, ...prev]);
  };

  const updateStudent = (id: string, updated: Partial<Student>) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const merged = { ...s, ...updated };
        // Recalculate average if scores changed
        const scoreVals = Object.values(merged.scores || {}).filter((v) => typeof v === 'number');
        if (scoreVals.length > 0) {
          const avg = Number((scoreVals.reduce((a, b) => a + b, 0) / scoreVals.length).toFixed(1));
          merged.averageScore = avg;
          if (avg >= 8.0) merged.rank = 'Giỏi';
          else if (avg >= 6.5) merged.rank = 'Khá';
          else if (avg >= 5.0) merged.rank = 'Trung bình';
          else merged.rank = 'Yếu';
        }
        return merged;
      })
    );
  };

  const deleteStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
  };

  const importStudents = (imported: Partial<Student>[]) => {
    const errors: string[] = [];
    let successCount = 0;
    const newArr = [...students];

    imported.forEach((row, idx) => {
      if (!row.fullName || !row.fullName.trim()) {
        errors.push(`Dòng ${idx + 1}: Thiếu Họ và tên học sinh.`);
        return;
      }
      const existingCode = newArr.some((s) => s.code === row.code && !!row.code);
      if (existingCode) {
        errors.push(`Dòng ${idx + 1}: Mã học sinh "${row.code}" đã tồn tại.`);
        return;
      }

      const matchingClass = classes.find((c) => c.code === row.className || c.name === row.className) || classes[0];

      const newStudent: Student = {
        id: `std_${Date.now()}_${idx}`,
        code: row.code || `HS${matchingClass.code}${String(newArr.length + 1).padStart(2, '0')}`,
        fullName: row.fullName.trim(),
        gender: row.gender === 'Nữ' ? 'Nữ' : 'Nam',
        dob: row.dob || '2009-01-01',
        classId: matchingClass.id,
        className: matchingClass.code,
        grade: matchingClass.grade,
        academicYear: systemConfig.academicYear,
        status: row.status || 'Đang học',
        scores: {},
        averageScore: 0,
        rank: 'Trung bình',
        attendanceStats: { present: 0, late: 0, excused: 0, unexcused: 0 },
      };

      newArr.push(newStudent);
      successCount++;
    });

    setStudents(newArr);
    return { successCount, errors };
  };

  // Class operations
  const addClass = (clsData: Omit<ClassRoom, 'id' | 'studentCount'>) => {
    const newClass: ClassRoom = {
      ...clsData,
      id: `cls_${Date.now()}`,
      studentCount: 0,
    };
    setClasses((prev) => [...prev, newClass]);
  };

  const updateClass = (id: string, updated: Partial<ClassRoom>) => {
    setClasses((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
  };

  const deleteClass = (id: string) => {
    setClasses((prev) => prev.filter((c) => c.id !== id));
  };

  // Exam operations
  const addExam = (examData: Omit<Exam, 'id'>) => {
    const newExam: Exam = {
      ...examData,
      id: `ex_${Date.now()}`,
    };
    setExams((prev) => [newExam, ...prev]);
  };

  const updateExam = (id: string, updated: Partial<Exam>) => {
    setExams((prev) => prev.map((e) => (e.id === id ? { ...e, ...updated } : e)));
  };

  const deleteExam = (id: string) => {
    setExams((prev) => prev.filter((e) => e.id !== id));
    // Clean scores from students
    setStudents((prev) =>
      prev.map((s) => {
        const scores = { ...s.scores };
        delete scores[id];
        return { ...s, scores };
      })
    );
  };

  const updateStudentScore = (studentId: string, examId: string, score: number) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        const scores = { ...s.scores, [examId]: score };
        const scoreVals = Object.values(scores).filter((v) => typeof v === 'number');
        const avg = Number((scoreVals.reduce((a, b) => a + b, 0) / scoreVals.length).toFixed(1));
        let rank: 'Giỏi' | 'Khá' | 'Trung bình' | 'Yếu' = 'Trung bình';
        if (avg >= 8.0) rank = 'Giỏi';
        else if (avg >= 6.5) rank = 'Khá';
        else if (avg >= 5.0) rank = 'Trung bình';
        else rank = 'Yếu';

        return {
          ...s,
          scores,
          averageScore: avg,
          rank,
        };
      })
    );
  };

  const batchUpdateScores = (examId: string, scoreMap: Record<string, number>) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (scoreMap[s.id] === undefined) return s;
        const newScore = scoreMap[s.id];
        const scores = { ...s.scores, [examId]: newScore };
        const scoreVals = Object.values(scores).filter((v) => typeof v === 'number');
        const avg = Number((scoreVals.reduce((a, b) => a + b, 0) / scoreVals.length).toFixed(1));
        let rank: 'Giỏi' | 'Khá' | 'Trung bình' | 'Yếu' = 'Trung bình';
        if (avg >= 8.0) rank = 'Giỏi';
        else if (avg >= 6.5) rank = 'Khá';
        else if (avg >= 5.0) rank = 'Trung bình';
        else rank = 'Yếu';

        return {
          ...s,
          scores,
          averageScore: avg,
          rank,
        };
      })
    );
  };

  // Attendance
  const markAttendance = (rec: Omit<AttendanceRecord, 'id'>) => {
    const existingIndex = attendanceRecords.findIndex(
      (r) => r.date === rec.date && r.studentId === rec.studentId
    );
    if (existingIndex >= 0) {
      setAttendanceRecords((prev) =>
        prev.map((r, i) => (i === existingIndex ? { ...r, ...rec } : r))
      );
    } else {
      setAttendanceRecords((prev) => [...prev, { ...rec, id: `att_${Date.now()}` }]);
    }
  };

  const batchMarkAttendance = (records: Omit<AttendanceRecord, 'id'>[]) => {
    setAttendanceRecords((prev) => {
      const updated = [...prev];
      records.forEach((newRec) => {
        const idx = updated.findIndex((r) => r.date === newRec.date && r.studentId === newRec.studentId);
        if (idx >= 0) {
          updated[idx] = { ...updated[idx], ...newRec };
        } else {
          updated.push({ ...newRec, id: `att_${Date.now()}_${Math.random()}` });
        }
      });
      return updated;
    });
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearAllNotifications = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Support Items
  const addSupportItem = (item: Omit<StudentSupportItem, 'id' | 'updatedAt'>) => {
    const newItem: StudentSupportItem = {
      ...item,
      id: `sup_${Date.now()}`,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setSupportItems((prev) => [newItem, ...prev]);
  };

  const updateSupportItem = (id: string, updated: Partial<StudentSupportItem>) => {
    setSupportItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, ...updated, updatedAt: new Date().toISOString().split('T')[0] }
          : item
      )
    );
  };

  const deleteSupportItem = (id: string) => {
    setSupportItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Question Bank
  const addQuestion = (q: Omit<Question, 'id' | 'updatedAt'>) => {
    const newQ: Question = {
      ...q,
      id: `q_${Date.now()}`,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setQuestions((prev) => [newQ, ...prev]);
  };

  const updateQuestion = (id: string, updated: Partial<Question>) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === id
          ? { ...q, ...updated, updatedAt: new Date().toISOString().split('T')[0] }
          : q
      )
    );
  };

  const deleteQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  // Materials
  const addMaterial = (m: Omit<LearningMaterial, 'id' | 'updatedAt'>) => {
    const newM: LearningMaterial = {
      ...m,
      id: `mat_${Date.now()}`,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setMaterials((prev) => [newM, ...prev]);
  };

  const deleteMaterial = (id: string) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  };

  // Online assignments
  const addAssignment = (a: Omit<OnlineAssignment, 'id'>) => {
    const newA: OnlineAssignment = {
      ...a,
      id: `assign_${Date.now()}`,
    };
    setAssignments((prev) => [newA, ...prev]);
  };

  const submitAssignmentAnswers = (
    assignmentId: string,
    studentId: string,
    studentName: string,
    answers: Record<string, string>,
    score: number
  ) => {
    setAssignments((prev) =>
      prev.map((assign) => {
        if (assign.id !== assignmentId) return assign;
        const existingIdx = assign.submissions.findIndex((s) => s.studentId === studentId);
        const submission = {
          studentId,
          studentName,
          submittedAt: new Date().toLocaleString('vi-VN'),
          score,
          answers,
          teacherFeedback: 'Bài làm đã được chấm điểm tự động.',
          status: 'Đã chấm' as const,
        };
        const newSubs = [...assign.submissions];
        if (existingIdx >= 0) {
          newSubs[existingIdx] = submission;
        } else {
          newSubs.push(submission);
        }
        return { ...assign, submissions: newSubs };
      })
    );
  };

  const gradeSubmission = (
    assignmentId: string,
    studentId: string,
    score: number,
    feedback: string
  ) => {
    setAssignments((prev) =>
      prev.map((assign) => {
        if (assign.id !== assignmentId) return assign;
        return {
          ...assign,
          submissions: assign.submissions.map((sub) =>
            sub.studentId === studentId
              ? { ...sub, score, teacherFeedback: feedback, status: 'Đã chấm' }
              : sub
          ),
        };
      })
    );
  };

  // Database Reset & Export
  const resetToDemoData = () => {
    setSystemConfig(initialSystemConfig);
    setClasses(initialClasses);
    setStudents(initialStudents);
    setExams(initialExams);
    setAttendanceRecords([]);
    setNotifications(initialNotifications);
    setSupportItems(initialSupportItems);
    setQuestions(initialQuestions);
    setMaterials(initialMaterials);
    setAssignments(initialOnlineAssignments);
    localStorage.clear();
  };

  const exportDatabaseJson = () => {
    const fullDump = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      systemConfig,
      classes,
      students,
      exams,
      attendanceRecords,
      supportItems,
      questions,
      materials,
      assignments,
    };
    const blob = new Blob([JSON.stringify(fullDump, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `suhocso_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importDatabaseJson = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.students && Array.isArray(data.students)) setStudents(data.students);
      if (data.classes && Array.isArray(data.classes)) setClasses(data.classes);
      if (data.exams && Array.isArray(data.exams)) setExams(data.exams);
      if (data.attendanceRecords && Array.isArray(data.attendanceRecords)) setAttendanceRecords(data.attendanceRecords);
      if (data.supportItems && Array.isArray(data.supportItems)) setSupportItems(data.supportItems);
      if (data.questions && Array.isArray(data.questions)) setQuestions(data.questions);
      if (data.materials && Array.isArray(data.materials)) setMaterials(data.materials);
      if (data.assignments && Array.isArray(data.assignments)) setAssignments(data.assignments);
      if (data.systemConfig) setSystemConfig(data.systemConfig);
      return true;
    } catch (e) {
      console.error('Import database JSON failed:', e);
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        systemConfig,
        updateSystemConfig,
        userRole: systemConfig.activeRole,
        setUserRole,
        students,
        addStudent,
        updateStudent,
        deleteStudent,
        importStudents,
        classes,
        addClass,
        updateClass,
        deleteClass,
        exams,
        addExam,
        updateExam,
        deleteExam,
        updateStudentScore,
        batchUpdateScores,
        attendanceRecords,
        markAttendance,
        batchMarkAttendance,
        schedule,
        notifications,
        markNotificationRead,
        clearAllNotifications,
        supportItems,
        addSupportItem,
        updateSupportItem,
        deleteSupportItem,
        questions,
        addQuestion,
        updateQuestion,
        deleteQuestion,
        materials,
        addMaterial,
        deleteMaterial,
        assignments,
        addAssignment,
        submitAssignmentAnswers,
        gradeSubmission,
        resetToDemoData,
        exportDatabaseJson,
        importDatabaseJson,
        viewingStudentId,
        setViewingStudentId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
