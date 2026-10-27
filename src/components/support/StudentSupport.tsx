import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StudentSupportItem } from '../../types';
import { Modal } from '../common/Modal';
import {
  HeartHandshake,
  Plus,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Search,
  Filter,
  Edit2,
  Trash2,
  Calendar,
  Loader2,
  User,
} from 'lucide-react';

export const StudentSupport: React.FC = () => {
  const { supportItems, students, classes, addSupportItem, updateSupportItem, deleteSupportItem } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<StudentSupportItem | null>(null);

  // AI Recommendation State
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiResultText, setAiResultText] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    studentId: students[0]?.id || '',
    studentName: students[0]?.fullName || '',
    studentCode: students[0]?.code || '',
    className: students[0]?.className || '10A1',
    grade: (students[0]?.grade || 10) as 10 | 11 | 12,
    reason: '',
    difficulties: '',
    plan: '',
    tasks: '',
    deadline: '2025-04-10',
    result: 'Đang theo dõi tiến độ',
    status: 'Đang theo dõi' as 'Đang theo dõi' | 'Đã cải thiện' | 'Cần can thiệp sâu',
    teacherNotes: '',
    aiRecommendation: '',
  });

  const filteredItems = supportItems.filter((item) => {
    const matchSearch =
      item.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.studentCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.reason.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleOpenAdd = () => {
    const defStudent = students.find((s) => (s.averageScore || 0) < 5.0) || students[0];
    setFormData({
      studentId: defStudent.id,
      studentName: defStudent.fullName,
      studentCode: defStudent.code,
      className: defStudent.className,
      grade: defStudent.grade,
      reason: 'Điểm kiểm tra dưới 5.0, cần củng cố kiến thức cơ bản',
      difficulties: 'Khó ghi nhớ các mốc lịch sử, hay đi làm ca đêm',
      plan: 'Phụ đạo 1 buổi/tuần, giao sơ đồ tư duy tóm tắt bài học',
      tasks: 'Làm lại 2 bài kiểm tra 15 phút trên phòng học trực tuyến',
      deadline: '2025-04-15',
      result: 'Đang thực hiện kế hoạch',
      status: 'Đang theo dõi',
      teacherNotes: 'Động viên tinh thần học tập của học viên',
      aiRecommendation: '',
    });
    setAiResultText('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (item: StudentSupportItem) => {
    setCurrentItem(item);
    setFormData({
      studentId: item.studentId,
      studentName: item.studentName,
      studentCode: item.studentCode,
      className: item.className,
      grade: item.grade,
      reason: item.reason,
      difficulties: item.difficulties,
      plan: item.plan,
      tasks: item.tasks,
      deadline: item.deadline,
      result: item.result,
      status: item.status,
      teacherNotes: item.teacherNotes,
      aiRecommendation: item.aiRecommendation || '',
    });
    setIsEditModalOpen(true);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addSupportItem({
      ...formData,
      aiRecommendation: aiResultText || formData.aiRecommendation,
    });
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentItem) return;
    updateSupportItem(currentItem.id, {
      ...formData,
    });
    setIsEditModalOpen(false);
  };

  // Generate AI pedagogical advice
  const handleConsultAi = async () => {
    setIsGeneratingAi(true);
    setAiResultText('');

    try {
      const response = await fetch('/api/gemini/support-recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: formData.studentName,
          grade: formData.grade,
          averageScore: '4.5',
          attendanceNotes: 'Thiếu tập trung, hay đi làm ca đêm',
          difficultAreas: formData.difficulties || 'Khó nhớ mốc thời gian',
        }),
      });
      const data = await response.json();
      if (data.success && data.text) {
        setAiResultText(data.text);
      }
    } catch (e) {
      console.error(e);
      setAiResultText('Đã có kế hoạch mẫu từ hệ thống.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#073B66] font-serif flex items-center gap-2.5">
            <HeartHandshake className="w-6 h-6 text-purple-600" />
            Kế hoạch hỗ trợ & Đồng hành cùng học sinh
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Theo dõi học viên gặp khó khăn, lập kế hoạch phụ đạo cá nhân hóa và tư vấn sư phạm
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-[#0878C9] hover:bg-[#073B66] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Lập kế hoạch hỗ trợ mới
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên học sinh, mã HS hoặc lý do hỗ trợ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0878C9]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Trạng thái:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-[#0878C9]"
          >
            <option value="all">Tất cả ({supportItems.length})</option>
            <option value="Đang theo dõi">Đang theo dõi</option>
            <option value="Đã cải thiện">Đã cải thiện</option>
            <option value="Cần can thiệp sâu">Cần can thiệp sâu</option>
          </select>
        </div>
      </div>

      {/* Support Cards Grid */}
      <div className="space-y-3.5">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 hover:border-[#0878C9] transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
                  {item.studentName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-[#073B66] font-serif">
                      {item.studentName}
                    </h3>
                    <span className="font-mono text-xs text-slate-500 font-bold">
                      ({item.studentCode})
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-sky-100 text-[#073B66] text-xs font-bold">
                      {item.className}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Lý do: <strong className="text-rose-600">{item.reason}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    item.status === 'Đã cải thiện'
                      ? 'bg-emerald-100 text-emerald-800'
                      : item.status === 'Cần can thiệp sâu'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {item.status}
                </span>

                <button
                  onClick={() => handleOpenEdit(item)}
                  className="p-1.5 text-slate-400 hover:text-[#0878C9] hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                  title="Chỉnh sửa"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteSupportItem(item.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Xóa"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 text-xs">
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-700 block mb-1">Khó khăn của học sinh:</span>
                <p className="text-slate-600 italic font-serif">{item.difficulties}</p>
              </div>

              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200">
                <span className="font-bold text-[#073B66] block mb-1">Kế hoạch phụ đạo:</span>
                <p className="text-slate-700">{item.plan}</p>
                <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-500" />
                  Hạn hoàn thành: {item.deadline}
                </div>
              </div>

              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200">
                <span className="font-bold text-emerald-700 block mb-1">Kết quả ghi nhận:</span>
                <p className="text-slate-700">{item.result}</p>
                <p className="mt-1 text-[11px] text-slate-500 italic">
                  Ghi chú: {item.teacherNotes}
                </p>
              </div>
            </div>

            {/* AI Advice Box if available */}
            {item.aiRecommendation && (
              <div className="mt-3 p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-purple-900">
                    Khuyến nghị từ Trợ lý Sư phạm AI:
                  </span>
                  <p className="text-purple-800 mt-0.5 whitespace-pre-wrap leading-relaxed">
                    {item.aiRecommendation}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal: Add Support Item */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Lập kế hoạch hỗ trợ học sinh môn Lịch sử"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveAdd} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Chọn học sinh (*)</label>
            <select
              value={formData.studentId}
              onChange={(e) => {
                const s = students.find((std) => std.id === e.target.value);
                if (s) {
                  setFormData({
                    ...formData,
                    studentId: s.id,
                    studentName: s.fullName,
                    studentCode: s.code,
                    className: s.className,
                    grade: s.grade,
                  });
                }
              }}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-[#073B66] outline-none"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.fullName} ({s.code} - Lớp {s.className} - Điểm TB: {s.averageScore || '0'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Lý do cần hỗ trợ (*)</label>
            <input
              type="text"
              required
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0878C9]"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Khó khăn cụ thể của học viên</label>
            <textarea
              rows={2}
              value={formData.difficulties}
              onChange={(e) => setFormData({ ...formData, difficulties: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Kế hoạch hỗ trợ trọng tâm (*)</label>
            <textarea
              rows={2}
              required
              value={formData.plan}
              onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Hạn thực hiện</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Trạng thái theo dõi</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none font-bold"
              >
                <option value="Đang theo dõi">Đang theo dõi</option>
                <option value="Đã cải thiện">Đã cải thiện</option>
                <option value="Cần can thiệp sâu">Cần can thiệp sâu</option>
              </select>
            </div>
          </div>

          {/* AI Pedagogical Advice Button */}
          <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-purple-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-600" />
                Hỏi ý kiến tham khảo từ AI Sư phạm
              </span>
              <button
                type="button"
                onClick={handleConsultAi}
                disabled={isGeneratingAi}
                className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
              >
                {isGeneratingAi ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Đang phân tích...
                  </>
                ) : (
                  'Lấy gợi ý AI'
                )}
              </button>
            </div>

            {aiResultText && (
              <div className="p-2.5 bg-white rounded-lg border border-purple-200 text-slate-800 whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
                {aiResultText}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#0878C9] hover:bg-[#073B66] text-white rounded-xl font-bold cursor-pointer transition-colors"
            >
              Lưu kế hoạch
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Support Item */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Cập nhật tiến độ: ${formData.studentName}`}
        maxWidth="md"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Kết quả sau hỗ trợ</label>
            <input
              type="text"
              value={formData.result}
              onChange={(e) => setFormData({ ...formData, result: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Trạng thái</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none font-bold"
            >
              <option value="Đang theo dõi">Đang theo dõi</option>
              <option value="Đã cải thiện">Đã cải thiện</option>
              <option value="Cần can thiệp sâu">Cần can thiệp sâu</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Nhận xét của giáo viên</label>
            <textarea
              rows={3}
              value={formData.teacherNotes}
              onChange={(e) => setFormData({ ...formData, teacherNotes: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer transition-colors"
            >
              Lưu cập nhật
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
