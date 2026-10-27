import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Question } from '../../types';
import { Modal } from '../common/Modal';
import {
  FileQuestion,
  Plus,
  Search,
  Filter,
  CheckCircle,
  FileDown,
  Printer,
  Trash2,
  Edit2,
  BookOpen,
  Eye,
  Layers,
} from 'lucide-react';

export const QuestionBank: React.FC = () => {
  const { questions, addQuestion, updateQuestion, deleteQuestion } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedCognitive, setSelectedCognitive] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isBuildExamModalOpen, setIsBuildExamModalOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);

  // Selected questions for custom exam generation
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [generatedExamTitle, setGeneratedExamTitle] = useState('Đề kiểm tra định kỳ Lịch sử');

  // Form State
  const [formData, setFormData] = useState({
    grade: 10 as 10 | 11 | 12,
    topic: 'Chương I: Lịch sử và Sử học',
    lesson: 'Bài 1: Hiện thực lịch sử và nhận thức lịch sử',
    knowledgeDomain: 'Khái niệm hiện thực lịch sử',
    type: 'Trắc nghiệm' as 'Trắc nghiệm' | 'Tự luận',
    cognitiveLevel: 'Nhận biết' as 'Nhận biết' | 'Thông hiểu' | 'Vận dụng' | 'Vận dụng cao',
    content: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 'A',
    explanation: '',
    source: 'SGK Lịch sử GDPT 2018',
    author: 'Cao Thị Thu',
  });

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchSearch =
        q.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.knowledgeDomain.toLowerCase().includes(searchQuery.toLowerCase());
      const matchGrade = selectedGrade === 'all' || q.grade.toString() === selectedGrade;
      const matchCognitive = selectedCognitive === 'all' || q.cognitiveLevel === selectedCognitive;
      const matchType = selectedType === 'all' || q.type === selectedType;
      return matchSearch && matchGrade && matchCognitive && matchType;
    });
  }, [questions, searchQuery, selectedGrade, selectedCognitive, selectedType]);

  const handleOpenAdd = () => {
    setFormData({
      grade: 10,
      topic: 'Lịch sử Việt Nam',
      lesson: 'Bài học trọng tâm',
      knowledgeDomain: 'Kiến thức cốt lõi',
      type: 'Trắc nghiệm',
      cognitiveLevel: 'Nhận biết',
      content: '',
      optionA: 'Lựa chọn A',
      optionB: 'Lựa chọn B',
      optionC: 'Lựa chọn C',
      optionD: 'Lựa chọn D',
      correctAnswer: 'A',
      explanation: 'Căn cứ vào SGK và tư liệu lịch sử chính thống.',
      source: 'SGK Lịch sử 10 - Bộ GD&ĐT',
      author: 'Cao Thị Thu',
    });
    setIsAddModalOpen(true);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.content.trim()) return;

    addQuestion({
      grade: formData.grade,
      topic: formData.topic,
      lesson: formData.lesson,
      knowledgeDomain: formData.knowledgeDomain,
      type: formData.type,
      cognitiveLevel: formData.cognitiveLevel,
      content: formData.content,
      options:
        formData.type === 'Trắc nghiệm'
          ? [
              `A. ${formData.optionA}`,
              `B. ${formData.optionB}`,
              `C. ${formData.optionC}`,
              `D. ${formData.optionD}`,
            ]
          : undefined,
      correctAnswer: formData.correctAnswer,
      explanation: formData.explanation,
      source: formData.source,
      author: formData.author,
    });

    setIsAddModalOpen(false);
  };

  const toggleSelectQuestion = (id: string) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAllFiltered = () => {
    setSelectedQuestionIds(filteredQuestions.map((q) => q.id));
  };

  const clearSelection = () => {
    setSelectedQuestionIds([]);
  };

  // Exam printing
  const handlePrintExam = () => {
    window.print();
  };

  const selectedQuestions = useMemo(() => {
    return questions.filter((q) => selectedQuestionIds.includes(q.id));
  }, [questions, selectedQuestionIds]);

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#073B66] font-serif flex items-center gap-2.5">
            <FileQuestion className="w-6 h-6 text-[#0878C9]" />
            Ngân hàng câu hỏi & Đề kiểm tra
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kho ngữ liệu câu hỏi phân hóa theo 4 mức độ nhận thức Bloom chuẩn GDPT 2018
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {selectedQuestionIds.length > 0 && (
            <button
              onClick={() => setIsBuildExamModalOpen(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              Tạo đề thi từ {selectedQuestionIds.length} câu đã chọn
            </button>
          )}

          <button
            onClick={handleOpenAdd}
            className="px-3.5 py-2 bg-[#0878C9] hover:bg-[#073B66] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Thêm câu hỏi mới
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo nội dung câu hỏi, chủ đề hoặc từ khóa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0878C9]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Khối lớp:</span>
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-[#0878C9]"
          >
            <option value="all">Tất cả khối lớp</option>
            <option value="10">Lớp 10</option>
            <option value="11">Lớp 11</option>
            <option value="12">Lớp 12</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Mức độ:</span>
          <select
            value={selectedCognitive}
            onChange={(e) => setSelectedCognitive(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-[#0878C9]"
          >
            <option value="all">Tất cả mức độ</option>
            <option value="Nhận biết">Nhận biết</option>
            <option value="Thông hiểu">Thông hiểu</option>
            <option value="Vận dụng">Vận dụng</option>
            <option value="Vận dụng cao">Vận dụng cao</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Dạng:</span>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-[#0878C9]"
          >
            <option value="all">Tất cả dạng</option>
            <option value="Trắc nghiệm">Trắc nghiệm</option>
            <option value="Tự luận">Tự luận</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={selectAllFiltered}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
          >
            Chọn tất cả ({filteredQuestions.length})
          </button>
          {selectedQuestionIds.length > 0 && (
            <button
              onClick={clearSelection}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-rose-600 rounded-lg text-xs font-semibold cursor-pointer"
            >
              Bỏ chọn
            </button>
          )}
        </div>
      </div>

      {/* Question List */}
      <div className="space-y-3.5">
        {filteredQuestions.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200">
            Không tìm thấy câu hỏi nào phù hợp với bộ lọc hiện tại.
          </div>
        ) : (
          filteredQuestions.map((q, idx) => {
            const isSelected = selectedQuestionIds.includes(q.id);

            return (
              <div
                key={q.id}
                className={`bg-white rounded-2xl p-4 sm:p-5 shadow-xs border transition-all ${
                  isSelected ? 'border-[#0878C9] bg-sky-50/20 shadow-sm' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectQuestion(q.id)}
                      className="w-4 h-4 rounded-md text-[#0878C9] border-slate-300 focus:ring-[#0878C9] cursor-pointer"
                    />
                    <span className="px-2 py-0.5 rounded-md bg-sky-100 text-[#073B66] text-xs font-bold">
                      Lớp {q.grade}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                        q.cognitiveLevel === 'Nhận biết'
                          ? 'bg-slate-100 text-slate-700'
                          : q.cognitiveLevel === 'Thông hiểu'
                          ? 'bg-blue-100 text-blue-700'
                          : q.cognitiveLevel === 'Vận dụng'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {q.cognitiveLevel}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 text-xs font-bold">
                      {q.type}
                    </span>
                    <span className="text-xs text-slate-500 font-serif italic truncate max-w-[200px]">
                      {q.topic}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => deleteQuestion(q.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Xóa câu hỏi"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Question content */}
                <h4 className="text-xs sm:text-sm font-bold text-slate-800 leading-relaxed font-serif mt-2">
                  <span className="text-[#073B66] mr-1.5">Câu {idx + 1}:</span>
                  {q.content}
                </h4>

                {/* Multiple choice options */}
                {q.type === 'Trắc nghiệm' && q.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-2 border-t border-slate-100 text-xs">
                    {q.options.map((opt, i) => {
                      const letter = opt.trim().slice(0, 1);
                      const isCorrect = letter === q.correctAnswer;
                      return (
                        <div
                          key={i}
                          className={`p-2 rounded-xl border flex items-start gap-2 ${
                            isCorrect
                              ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-900'
                              : 'bg-slate-50/60 border-slate-200 text-slate-700'
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold ${
                              isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {letter}
                          </span>
                          <span className="flex-1">{opt.replace(/^[A-D]\.\s*/, '')}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Essay Answer */}
                {q.type === 'Tự luận' && (
                  <div className="mt-2.5 p-3 rounded-xl bg-sky-50/50 border border-sky-100 text-xs">
                    <span className="font-bold text-[#073B66]">Gợi ý đáp án & Biểu điểm:</span>
                    <p className="text-slate-700 mt-1 italic font-serif">{q.correctAnswer}</p>
                  </div>
                )}

                {/* Footer metadata */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2 font-serif italic">
                  <span>Nguồn: {q.source}</span>
                  <span>Người biên soạn: Cô {q.author}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Add New Question */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Thêm câu hỏi mới vào ngân hàng đề"
        maxWidth="xl"
      >
        <form onSubmit={handleSaveAdd} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Khối lớp</label>
              <select
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: parseInt(e.target.value, 10) as any })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0878C9]"
              >
                <option value={10}>Lớp 10</option>
                <option value={11}>Lớp 11</option>
                <option value={12}>Lớp 12</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Dạng câu hỏi</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0878C9]"
              >
                <option value="Trắc nghiệm">Trắc nghiệm 4 lựa chọn</option>
                <option value="Tự luận">Tự luận</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Mức độ nhận thức</label>
              <select
                value={formData.cognitiveLevel}
                onChange={(e) => setFormData({ ...formData, cognitiveLevel: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0878C9]"
              >
                <option value="Nhận biết">Nhận biết</option>
                <option value="Thông hiểu">Thông hiểu</option>
                <option value="Vận dụng">Vận dụng</option>
                <option value="Vận dụng cao">Vận dụng cao</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Chủ đề / Chương bài (*)</label>
              <input
                type="text"
                required
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0878C9]"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Nội dung kiến thức</label>
              <input
                type="text"
                value={formData.knowledgeDomain}
                onChange={(e) => setFormData({ ...formData, knowledgeDomain: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0878C9]"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Nội dung câu hỏi (*)</label>
            <textarea
              rows={3}
              required
              placeholder="Nhập đề bài hoặc đoạn trích tư liệu lịch sử..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0878C9]"
            />
          </div>

          {formData.type === 'Trắc nghiệm' ? (
            <div className="space-y-2">
              <label className="block text-slate-700 font-bold">Các phương án lựa chọn:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Phương án A"
                  value={formData.optionA}
                  onChange={(e) => setFormData({ ...formData, optionA: e.target.value })}
                  className="px-3 py-1.5 border border-slate-200 rounded-xl outline-none"
                />
                <input
                  type="text"
                  placeholder="Phương án B"
                  value={formData.optionB}
                  onChange={(e) => setFormData({ ...formData, optionB: e.target.value })}
                  className="px-3 py-1.5 border border-slate-200 rounded-xl outline-none"
                />
                <input
                  type="text"
                  placeholder="Phương án C"
                  value={formData.optionC}
                  onChange={(e) => setFormData({ ...formData, optionC: e.target.value })}
                  className="px-3 py-1.5 border border-slate-200 rounded-xl outline-none"
                />
                <input
                  type="text"
                  placeholder="Phương án D"
                  value={formData.optionD}
                  onChange={(e) => setFormData({ ...formData, optionD: e.target.value })}
                  className="px-3 py-1.5 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div className="mt-2">
                <label className="block text-slate-700 font-bold mb-1">Đáp án đúng</label>
                <select
                  value={formData.correctAnswer}
                  onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                  className="w-32 px-3 py-1.5 border border-slate-200 rounded-xl outline-none font-bold text-emerald-700"
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-slate-700 font-bold mb-1">Đáp án và Hướng dẫn chấm (*)</label>
              <textarea
                rows={3}
                required
                value={formData.correctAnswer}
                onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none"
              />
            </div>
          )}

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
              Lưu vào ngân hàng đề
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Assembled Exam Preview & Print */}
      <Modal
        isOpen={isBuildExamModalOpen}
        onClose={() => setIsBuildExamModalOpen(false)}
        title="Xem trước & Xuất đề kiểm tra hoàn chỉnh"
        maxWidth="4xl"
      >
        <div className="space-y-5 text-xs">
          <div className="flex items-center justify-between no-print pb-3 border-b border-slate-200">
            <div>
              <label className="block text-slate-500 font-medium mb-1">Tiêu đề đề thi:</label>
              <input
                type="text"
                value={generatedExamTitle}
                onChange={(e) => setGeneratedExamTitle(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-xl font-bold text-sm text-[#073B66] w-80 outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrintExam}
                className="px-4 py-2 bg-[#073B66] hover:bg-[#0878C9] text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Printer className="w-4 h-4" />
                In đề kiểm tra & Đáp án
              </button>
            </div>
          </div>

          {/* Exam Paper for Student */}
          <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-200 space-y-4">
            <div className="text-center space-y-1 pb-4 border-b border-slate-300">
              <div className="font-bold uppercase tracking-wider text-xs">
                SỞ GD&ĐT QUẢNG NINH – TRUNG TÂM GDNN - GDTX TP QUẢNG NINH
              </div>
              <div className="font-bold uppercase tracking-wider text-sm text-[#073B66]">
                PHÂN HIỆU TIÊN YÊN
              </div>
              <h3 className="text-base font-extrabold uppercase font-serif text-slate-900 mt-2">
                {generatedExamTitle}
              </h3>
              <p className="text-xs text-slate-600 italic">
                Thời gian làm bài: 45 phút (Không kể thời gian giao đề)
              </p>
              <p className="text-xs text-slate-600">Giáo viên ra đề: Cô Cao Thị Thu</p>
            </div>

            <div className="space-y-4 pt-2">
              <h4 className="font-bold text-[#073B66] uppercase">Phần nội dung câu hỏi ({selectedQuestions.length} câu):</h4>
              {selectedQuestions.map((q, idx) => (
                <div key={q.id} className="space-y-1.5 font-serif">
                  <div className="font-bold text-slate-900">
                    Câu {idx + 1}: {q.content}
                  </div>
                  {q.type === 'Trắc nghiệm' && q.options && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-4 text-slate-700">
                      {q.options.map((opt, i) => (
                        <div key={i}>{opt}</div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Answer Key Separator */}
            <div className="pt-6 border-t-2 border-dashed border-slate-300 space-y-3">
              <h4 className="font-bold text-emerald-800 uppercase font-serif text-sm">
                ĐÁP ÁN VÀ HƯỚNG DẪN CHẤM CHI TIẾT (DÀNH CHO GIÁO VIÊN):
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {selectedQuestions.map((q, idx) => (
                  <div key={q.id} className="p-2 bg-white rounded-lg border border-slate-200">
                    <span className="font-bold text-[#073B66]">Câu {idx + 1}: </span>
                    <span className="font-extrabold text-emerald-600">{q.correctAnswer}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
