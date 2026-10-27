import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OnlineAssignment } from '../../types';
import { Modal } from '../common/Modal';
import {
  MonitorPlay,
  Plus,
  Clock,
  CheckCircle,
  HelpCircle,
  FileCheck,
  Send,
  Eye,
  Award,
  AlertCircle,
  PlayCircle,
  User,
} from 'lucide-react';

export const OnlineClassroom: React.FC = () => {
  const {
    assignments,
    classes,
    students,
    addAssignment,
    submitAssignmentAnswers,
    gradeSubmission,
    userRole,
    setUserRole,
  } = useApp();

  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>(
    assignments[0]?.id || ''
  );

  // Student test-taking state
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [activeTest, setActiveTest] = useState<OnlineAssignment | null>(null);
  const [selectedStudentForTest, setSelectedStudentForTest] = useState<string>(
    students[0]?.id || ''
  );
  const [studentAnswers, setStudentAnswers] = useState<Record<string, string>>({});
  const [testResult, setTestResult] = useState<{ score: number; total: number } | null>(null);

  // Teacher grading modal
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [submissionToGrade, setSubmissionToGrade] = useState<any>(null);
  const [gradeInput, setGradeInput] = useState<number>(10);
  const [feedbackInput, setFeedbackInput] = useState<string>('Bài làm rất tốt!');

  // Add Assignment Modal
  const [isAddAssignmentOpen, setIsAddAssignmentOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newClassId, setNewClassId] = useState(classes[0]?.id || '');
  const [newDeadline, setNewDeadline] = useState('2025-04-15 23:59');
  const [newDuration, setNewDuration] = useState(20);

  const activeAssignment = assignments.find((a) => a.id === selectedAssignmentId) || assignments[0];

  // Start online test
  const handleStartTest = (assign: OnlineAssignment) => {
    setActiveTest(assign);
    setStudentAnswers({});
    setTestResult(null);
    setIsTestModalOpen(true);
  };

  // Submit test answers
  const handleSubmitTest = () => {
    if (!activeTest) return;
    const currentStudent = students.find((s) => s.id === selectedStudentForTest) || students[0];

    // Auto-grade multiple choice questions
    let totalScore = 0;
    activeTest.questions.forEach((q) => {
      const selected = studentAnswers[q.id];
      if (selected && selected.startsWith(q.correctAnswer)) {
        totalScore += q.score;
      }
    });

    submitAssignmentAnswers(
      activeTest.id,
      currentStudent.id,
      currentStudent.fullName,
      studentAnswers,
      totalScore
    );

    setTestResult({
      score: totalScore,
      total: activeTest.questions.reduce((sum, q) => sum + q.score, 0),
    });
  };

  // Save teacher grading
  const handleSaveTeacherGrade = () => {
    if (!activeAssignment || !submissionToGrade) return;
    gradeSubmission(
      activeAssignment.id,
      submissionToGrade.studentId,
      gradeInput,
      feedbackInput
    );
    setIsGradeModalOpen(false);
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const cls = classes.find((c) => c.id === newClassId) || classes[0];
    addAssignment({
      title: newTitle,
      classId: cls.id,
      className: cls.code,
      grade: cls.grade,
      topic: 'Lịch sử Việt Nam trọng tâm',
      deadline: newDeadline,
      durationMinutes: newDuration,
      status: 'Đang mở',
      questions: [
        {
          id: `q_new_1`,
          question: 'Chiến thắng nào đã kết thúc thắng lợi cuộc kháng chiến chống thực dân Pháp (1945 - 1954)?',
          options: [
            'A. Chiến dịch Điện Biên Phủ 1954',
            'B. Chiến dịch Biên giới thu - đông 1950',
            'C. Chiến dịch Việt Bắc 1947',
            'D. Chiến dịch Tây Bắc 1952',
          ],
          correctAnswer: 'A',
          score: 5.0,
        },
        {
          id: `q_new_2`,
          question: 'Hiệp định Giơ-ne-vơ về chấm dứt chiến tranh ở Đông Dương được ký kết vào năm nào?',
          options: ['A. Năm 1953', 'B. Năm 1954', 'C. Năm 1955', 'D. Năm 1973'],
          correctAnswer: 'B',
          score: 5.0,
        },
      ],
      submissions: [],
    });

    setIsAddAssignmentOpen(false);
    setNewTitle('');
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#073B66] font-serif flex items-center gap-2.5">
            <MonitorPlay className="w-6 h-6 text-[#0878C9]" />
            Phòng học trực tuyến & Bài tập số
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Giao bài tập, trắc nghiệm ôn tập, học sinh làm bài trực tuyến và tự động chấm điểm
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddAssignmentOpen(true)}
            className="px-4 py-2 bg-[#0878C9] hover:bg-[#073B66] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Tạo bài tập mới
          </button>
        </div>
      </div>

      {/* Role Switch Banner */}
      <div className="p-4 bg-sky-50 rounded-2xl border border-sky-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-[#0878C9]" />
          <span className="text-slate-700">
            Bạn đang xem ở vai trò: <strong className="text-[#073B66] font-bold">{userRole === 'student' ? 'Học sinh' : 'Giáo viên (Cô Thu)'}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-500">Chuyển góc nhìn:</span>
          <button
            onClick={() => setUserRole(userRole === 'student' ? 'teacher' : 'student')}
            className="px-3 py-1 bg-white hover:bg-slate-100 text-[#073B66] border border-slate-200 rounded-lg font-bold transition-colors cursor-pointer"
          >
            Đổi sang góc nhìn {userRole === 'student' ? 'Giáo viên' : 'Học sinh'}
          </button>
        </div>
      </div>

      {/* Assignments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assignments.map((assign) => (
          <div
            key={assign.id}
            className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 hover:border-[#0878C9] transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2 py-0.5 rounded-full bg-sky-100 text-[#073B66] text-xs font-bold">
                  Lớp {assign.className}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                  {assign.status}
                </span>
              </div>

              <h4 className="text-sm font-bold text-[#073B66] font-serif leading-snug line-clamp-2">
                {assign.title}
              </h4>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{assign.topic}</p>

              <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Thời gian làm: <strong>{assign.durationMinutes} phút</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FileCheck className="w-3.5 h-3.5 text-[#0878C9]" />
                  <span>Số câu hỏi: <strong>{assign.questions.length} câu</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Đã nộp bài: <strong>{assign.submissions.length} học sinh</strong></span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
              <button
                onClick={() => handleStartTest(assign)}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <PlayCircle className="w-4 h-4" />
                Vào làm bài thi
              </button>
              <button
                onClick={() => setSelectedAssignmentId(assign.id)}
                className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Kết quả
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Submissions Management Panel */}
      {activeAssignment && (
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-[#073B66] font-serif">
                Danh sách nộp bài: {activeAssignment.title}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Lớp {activeAssignment.className} | Hạn nộp: {activeAssignment.deadline}
              </p>
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="py-2.5 px-3 text-center w-12">STT</th>
                  <th className="py-2.5 px-3">Họ và tên học sinh</th>
                  <th className="py-2.5 px-3 text-center">Thời gian nộp</th>
                  <th className="py-2.5 px-3 text-center">Điểm số</th>
                  <th className="py-2.5 px-3">Nhận xét của giáo viên</th>
                  <th className="py-2.5 px-3 text-center w-24">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeAssignment.submissions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Chưa có học sinh nào nộp bài tập này.
                    </td>
                  </tr>
                ) : (
                  activeAssignment.submissions.map((sub, idx) => (
                    <tr key={sub.studentId} className="hover:bg-sky-50/40">
                      <td className="py-2.5 px-3 text-center font-bold text-slate-500">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-800">{sub.studentName}</td>
                      <td className="py-2.5 px-3 text-center text-slate-500">{sub.submittedAt}</td>
                      <td className="py-2.5 px-3 text-center font-extrabold text-sm text-[#0878C9]">
                        {sub.score.toFixed(1)} / 10
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 italic">
                        {sub.teacherFeedback || 'Chưa có nhận xét'}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => {
                            setSubmissionToGrade(sub);
                            setGradeInput(sub.score);
                            setFeedbackInput(sub.teacherFeedback || '');
                            setIsGradeModalOpen(true);
                          }}
                          className="px-2.5 py-1 bg-[#0878C9] hover:bg-[#073B66] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          Chấm điểm
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Student Taking Online Test */}
      {activeTest && (
        <Modal
          isOpen={isTestModalOpen}
          onClose={() => setIsTestModalOpen(false)}
          title={`Phòng thi trực tuyến: ${activeTest.title}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            {!testResult ? (
              <>
                <div className="p-3 bg-sky-50 rounded-xl border border-sky-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700">Chọn tài khoản học sinh:</span>
                    <select
                      value={selectedStudentForTest}
                      onChange={(e) => setSelectedStudentForTest(e.target.value)}
                      className="px-2 py-1 bg-white border border-slate-200 rounded-lg font-bold text-[#073B66]"
                    >
                      {students.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.fullName} ({s.className})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-1 font-bold text-amber-600">
                    <Clock className="w-4 h-4" />
                    {activeTest.durationMinutes}:00 phút
                  </div>
                </div>

                {/* Questions */}
                <div className="space-y-4">
                  {activeTest.questions.map((q, idx) => (
                    <div key={q.id} className="p-4 bg-slate-50/60 rounded-xl border border-slate-200 space-y-2">
                      <div className="font-bold text-slate-800 font-serif">
                        Câu {idx + 1}: {q.question} ({q.score} điểm)
                      </div>
                      <div className="space-y-1.5 pl-2">
                        {q.options.map((opt, i) => (
                          <label
                            key={i}
                            className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 hover:border-[#0878C9] cursor-pointer"
                          >
                            <input
                              type="radio"
                              name={`question_${q.id}`}
                              value={opt}
                              checked={studentAnswers[q.id] === opt}
                              onChange={() => setStudentAnswers({ ...studentAnswers, [q.id]: opt })}
                              className="text-[#0878C9] focus:ring-[#0878C9]"
                            />
                            <span className="text-slate-700">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => setIsTestModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    onClick={handleSubmitTest}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    Nộp bài thi ngay
                  </button>
                </div>
              </>
            ) : (
              <div className="py-8 text-center space-y-4 animate-in zoom-in-95">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <Award className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#073B66] font-serif">
                    Nộp bài thi thành công!
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Điểm số tự động của bạn:
                  </p>
                  <div className="text-4xl font-black text-emerald-600 font-serif mt-2">
                    {testResult.score.toFixed(1)} / {testResult.total.toFixed(1)}
                  </div>
                </div>

                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Kết quả đã được ghi nhận vào sổ điểm của cô Cao Thị Thu. Chúc mừng em đã hoàn thành bài tập!
                </p>

                <button
                  onClick={() => setIsTestModalOpen(false)}
                  className="px-6 py-2 bg-[#073B66] text-white rounded-xl font-bold cursor-pointer"
                >
                  Đóng phòng thi
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Modal: Teacher Grading */}
      <Modal
        isOpen={isGradeModalOpen}
        onClose={() => setIsGradeModalOpen(false)}
        title="Chấm điểm & Nhận xét bài làm của học sinh"
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500">Học sinh:</span>
            <div className="text-sm font-bold text-[#073B66]">{submissionToGrade?.studentName}</div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Điểm số (Thang điểm 10):</label>
            <input
              type="number"
              min={0}
              max={10}
              step={0.1}
              value={gradeInput}
              onChange={(e) => setGradeInput(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-[#073B66] outline-none focus:ring-2 focus:ring-[#0878C9]"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Nhận xét sư phạm:</label>
            <textarea
              rows={3}
              value={feedbackInput}
              onChange={(e) => setFeedbackInput(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0878C9]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              onClick={() => setIsGradeModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold cursor-pointer"
            >
              Hủy
            </button>
            <button
              onClick={handleSaveTeacherGrade}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer transition-colors"
            >
              Lưu kết quả chấm
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal: Create Assignment */}
      <Modal
        isOpen={isAddAssignmentOpen}
        onClose={() => setIsAddAssignmentOpen(false)}
        title="Tạo bài tập trực tuyến mới"
        maxWidth="md"
      >
        <form onSubmit={handleCreateAssignment} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Tên bài tập (*)</label>
            <input
              type="text"
              required
              placeholder="Ví dụ: Ôn tập trắc nghiệm Lịch sử Việt Nam"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0878C9]"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Giao cho lớp</label>
            <select
              value={newClassId}
              onChange={(e) => setNewClassId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Thời gian làm bài (phút)</label>
              <input
                type="number"
                min={5}
                max={90}
                value={newDuration}
                onChange={(e) => setNewDuration(parseInt(e.target.value, 10) || 20)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Hạn nộp</label>
              <input
                type="text"
                value={newDeadline}
                onChange={(e) => setNewDeadline(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddAssignmentOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#0878C9] hover:bg-[#073B66] text-white rounded-xl font-bold cursor-pointer transition-colors"
            >
              Tạo bài tập
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
