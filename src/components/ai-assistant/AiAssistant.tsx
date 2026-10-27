import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  BookOpen,
  FileQuestion,
  HelpCircle,
  Copy,
  Check,
  Printer,
  Download,
  Loader2,
  RefreshCw,
  Sliders,
  Send,
  MessageSquare,
  Award,
} from 'lucide-react';

export const AiAssistant: React.FC = () => {
  const { classes } = useApp();

  const [activeMode, setActiveMode] = useState<
    'lesson_plan' | 'exam_matrix' | 'support_coach' | 'free_qa'
  >('lesson_plan');

  // Form Inputs
  const [grade, setGrade] = useState<number>(10);
  const [bookSeries, setBookSeries] = useState<string>('Kết nối tri thức với cuộc sống');
  const [topic, setTopic] = useState<string>(
    'Bài 12: Kháng chiến chống thực dân Pháp (1945 - 1954)'
  );
  const [duration, setDuration] = useState<string>('2 tiết (90 phút)');
  const [studentLevel, setStudentLevel] = useState<string>(
    'Học viên GDTX Tiên Yên, đa dạng lứa tuổi, cần phương pháp trực quan sinh động'
  );
  const [specificNotes, setSpecificNotes] = useState<string>(
    'Tập trung làm nổi bật ý nghĩa Chiến thắng Điện Biên Phủ 1954 và vai trò của Đại tướng Võ Nguyên Giáp'
  );

  // Exam generator specific state
  const [examType, setExamType] = useState<string>('Kết hợp Trắc nghiệm & Tự luận');
  const [numMC, setNumMC] = useState<number>(12);
  const [numEssay, setNumEssay] = useState<number>(2);

  // Free Q&A state
  const [chatPrompt, setChatPrompt] = useState<string>('');

  // Generation status
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generatedOutput, setGeneratedOutput] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isFallbackNotice, setIsFallbackNotice] = useState<boolean>(false);

  // Generate Lesson Plan
  const handleGeneratePlan = async () => {
    setIsLoading(true);
    setGeneratedOutput('');
    setIsFallbackNotice(false);

    try {
      const response = await fetch('/api/gemini/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade,
          topic,
          lessonName: topic,
          duration,
          bookSeries,
          studentLevel,
          specificNotes,
        }),
      });
      const data = await response.json();
      if (data.success && data.text) {
        setGeneratedOutput(data.text);
        if (data.isFallback) setIsFallbackNotice(true);
      } else {
        setGeneratedOutput('Không thể khởi tạo nội dung. Vui lòng thử lại sau.');
      }
    } catch (err: any) {
      console.error(err);
      setGeneratedOutput('Đã xảy ra lỗi khi kết nối máy chủ AI. Đang sử dụng mẫu giáo án chuẩn GDPT 2018.');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate Exam Matrix & Questions
  const handleGenerateExam = async () => {
    setIsLoading(true);
    setGeneratedOutput('');
    setIsFallbackNotice(false);

    try {
      const response = await fetch('/api/gemini/generate-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade,
          topic,
          examType,
          duration: '45 phút',
          numMC,
          numEssay,
          difficultyDistribution: '40% Nhận biết, 30% Thông hiểu, 20% Vận dụng, 10% Vận dụng cao',
        }),
      });
      const data = await response.json();
      if (data.success && data.text) {
        setGeneratedOutput(data.text);
        if (data.isFallback) setIsFallbackNotice(true);
      } else {
        setGeneratedOutput('Không thể tạo đề kiểm tra lúc này.');
      }
    } catch (err) {
      console.error(err);
      setGeneratedOutput('Đã xảy ra lỗi khi kết nối dịch vụ AI.');
    } finally {
      setIsLoading(false);
    }
  };

  // Free Q&A for Teacher
  const handleSendChat = async () => {
    if (!chatPrompt.trim()) return;
    setIsLoading(true);
    setGeneratedOutput('');

    try {
      const response = await fetch('/api/gemini/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade,
          topic: chatPrompt,
          lessonName: chatPrompt,
          specificNotes: 'Hãy trả lời câu hỏi chuyên môn lịch sử sư phạm của cô giáo Cao Thị Thu',
        }),
      });
      const data = await response.json();
      setGeneratedOutput(data.text || 'Đã nhận yêu cầu.');
      if (data.isFallback) setIsFallbackNotice(true);
    } catch {
      setGeneratedOutput('Hệ thống đang bận, vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedOutput) return;
    navigator.clipboard.writeText(generatedOutput);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!generatedOutput) return;
    const blob = new Blob([generatedOutput], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SuHocSo_${activeMode}_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#073B66] font-serif flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-purple-600" />
            Trợ lý AI Lịch sử – Soạn bài & Khảo thí
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Ứng dụng mô hình AI tiên tiến hỗ trợ cô Cao Thị Thu soạn giáo án GDPT 2018, lập ma trận đề và tư vấn sư phạm
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => {
              setActiveMode('lesson_plan');
              setGeneratedOutput('');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeMode === 'lesson_plan'
                ? 'bg-[#073B66] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Soạn giáo án
          </button>
          <button
            onClick={() => {
              setActiveMode('exam_matrix');
              setGeneratedOutput('');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeMode === 'exam_matrix'
                ? 'bg-[#073B66] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ma trận & Đề thi
          </button>
          <button
            onClick={() => {
              setActiveMode('free_qa');
              setGeneratedOutput('');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeMode === 'free_qa'
                ? 'bg-[#073B66] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Hỏi đáp lịch sử
          </button>
        </div>
      </div>

      {/* Main Form & Output Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Form Configuration */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 shadow-xs border border-slate-200 space-y-4 no-print">
          <h3 className="font-bold text-[#073B66] text-sm flex items-center gap-2 font-serif pb-2 border-b border-slate-100">
            <Sliders className="w-4 h-4 text-[#0878C9]" />
            Cấu hình nội dung bài giảng
          </h3>

          {/* Mode 1: Lesson Plan Form */}
          {activeMode === 'lesson_plan' && (
            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Khối lớp (GDTX THPT)</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-[#0878C9]"
                >
                  <option value={10}>Lịch sử Lớp 10</option>
                  <option value={11}>Lịch sử Lớp 11</option>
                  <option value={12}>Lịch sử Lớp 12</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Bộ sách giáo khoa</label>
                <select
                  value={bookSeries}
                  onChange={(e) => setBookSeries(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0878C9]"
                >
                  <option value="Kết nối tri thức với cuộc sống">Kết nối tri thức với cuộc sống</option>
                  <option value="Cánh Diều">Cánh Diều</option>
                  <option value="Chân trời sáng tạo">Chân trời sáng tạo</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Tên bài học / Chủ đề (*)</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-[#073B66] outline-none focus:ring-2 focus:ring-[#0878C9]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Thời lượng giảng dạy</label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0878C9]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Đặc điểm đối tượng học sinh</label>
                <input
                  type="text"
                  value={studentLevel}
                  onChange={(e) => setStudentLevel(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0878C9]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Ghi chú & Yêu cầu trọng tâm</label>
                <textarea
                  rows={3}
                  value={specificNotes}
                  onChange={(e) => setSpecificNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0878C9]"
                />
              </div>

              <button
                onClick={handleGeneratePlan}
                disabled={isLoading}
                className="w-full py-2.5 bg-gradient-to-r from-[#0878C9] to-[#073B66] hover:brightness-110 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang thiết kế giáo án GDPT 2018...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-cyan-200" />
                    Bắt đầu soạn kế hoạch bài dạy
                  </>
                )}
              </button>
            </div>
          )}

          {/* Mode 2: Exam Matrix Form */}
          {activeMode === 'exam_matrix' && (
            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Khối lớp kiểm tra</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-[#0878C9]"
                >
                  <option value={10}>Lớp 10</option>
                  <option value={11}>Lớp 11</option>
                  <option value={12}>Lớp 12</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Chủ đề kiểm tra</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-[#073B66] outline-none focus:ring-2 focus:ring-[#0878C9]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Hình thức kiểm tra</label>
                <select
                  value={examType}
                  onChange={(e) => setExamType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0878C9]"
                >
                  <option value="Kết hợp Trắc nghiệm & Tự luận">Kết hợp Trắc nghiệm & Tự luận</option>
                  <option value="100% Trắc nghiệm khách quan">100% Trắc nghiệm khách quan</option>
                  <option value="100% Tự luận phát triển tư duy">100% Tự luận phát triển tư duy</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Số câu trắc nghiệm</label>
                  <input
                    type="number"
                    min={4}
                    max={40}
                    value={numMC}
                    onChange={(e) => setNumMC(parseInt(e.target.value, 10) || 12)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0878C9]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Số câu tự luận</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={numEssay}
                    onChange={(e) => setNumEssay(parseInt(e.target.value, 10) || 2)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0878C9]"
                  />
                </div>
              </div>

              <button
                onClick={handleGenerateExam}
                disabled={isLoading}
                className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-[#073B66] hover:brightness-110 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang thiết lập ma trận & câu hỏi...
                  </>
                ) : (
                  <>
                    <FileQuestion className="w-4 h-4" />
                    Tạo ma trận & đề kiểm tra
                  </>
                )}
              </button>
            </div>
          )}

          {/* Mode 3: Free Chat / Q&A Form */}
          {activeMode === 'free_qa' && (
            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Đặt câu hỏi hoặc yêu cầu cho AI Lịch sử:
                </label>
                <textarea
                  rows={4}
                  placeholder="Ví dụ: Thiết kế trò chơi ô chữ 6 hàng ngang về Chiến dịch Điện Biên Phủ..."
                  value={chatPrompt}
                  onChange={(e) => setChatPrompt(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0878C9]"
                />
              </div>

              <button
                onClick={handleSendChat}
                disabled={isLoading || !chatPrompt.trim()}
                className="w-full py-2.5 bg-[#0878C9] hover:bg-[#073B66] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang xử lý phản hồi...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Gửi yêu cầu trợ lý
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Generated Output Document */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-5 shadow-xs border border-slate-200 flex flex-col justify-between min-h-[550px]">
          <div>
            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#073B66] text-sm font-serif">
                  Kết quả tạo bài giảng & Đề kiểm tra
                </span>
                {isFallbackNotice && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200">
                    Mẫu giáo án chuẩn GDPT 2018
                  </span>
                )}
              </div>

              {generatedOutput && (
                <div className="flex items-center gap-2 no-print">
                  <button
                    onClick={handleCopy}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        Đã sao chép
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Sao chép
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleDownload}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Tải file (.txt)
                  </button>

                  <button
                    onClick={handlePrint}
                    className="px-3 py-1.5 bg-[#073B66] hover:bg-[#0878C9] text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    In kết quả
                  </button>
                </div>
              )}
            </div>

            {/* Content Display */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 text-slate-400 space-y-3">
                <Loader2 className="w-10 h-10 animate-spin text-[#0878C9]" />
                <p className="text-sm font-serif italic text-slate-600">
                  Trợ lý AI đang tra cứu dữ liệu lịch sử chuẩn và biên soạn nội dung...
                </p>
              </div>
            ) : generatedOutput ? (
              <div className="prose max-w-none text-xs sm:text-sm text-slate-800 leading-relaxed font-serif whitespace-pre-wrap p-4 bg-slate-50/50 rounded-xl border border-slate-200/60 max-h-[600px] overflow-y-auto">
                {generatedOutput}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400 space-y-3">
                <Sparkles className="w-12 h-12 text-slate-300" />
                <div className="max-w-md">
                  <h4 className="font-bold text-slate-700 text-sm font-serif">
                    Chưa có nội dung được tạo
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Hãy điền thông tin bài học và bấm nút bắt đầu ở cột bên trái để trợ lý AI soạn kế hoạch bài dạy hoặc tạo ma trận đề kiểm tra.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between font-serif italic">
            <span>Dữ liệu tuân thủ chuẩn GDPT 2018 & Thông tư hướng dẫn GDTX</span>
            <span>Giáo viên: Cao Thị Thu</span>
          </div>
        </div>
      </div>
    </div>
  );
};
