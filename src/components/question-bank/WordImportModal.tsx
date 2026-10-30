import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Question } from '../../types';
import {
  downloadWordTemplate,
  extractTextFromFile,
  parseQuestionsFromText,
  ParsedQuestionResult,
} from '../../lib/wordQuestionParser';
import {
  FileText,
  Download,
  Upload,
  CheckCircle,
  CheckSquare,
  AlertCircle,
  FileCheck,
  RefreshCw,
  Sparkles,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';

interface WordImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportQuestions: (questions: Omit<Question, 'id' | 'updatedAt'>[]) => void;
}

export const WordImportModal: React.FC<WordImportModalProps> = ({
  isOpen,
  onClose,
  onImportQuestions,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState('');
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [grade, setGrade] = useState<10 | 11 | 12>(10);
  const [topic, setTopic] = useState('Lịch sử Việt Nam');
  const [lesson, setLesson] = useState('Chương trình GDNN - GDTX');
  const [parseResult, setParseResult] = useState<ParsedQuestionResult | null>(null);
  const [isSuccessImport, setIsSuccessImport] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setIsLoadingFile(true);
    setParseResult(null);

    try {
      const text = await extractTextFromFile(file);
      setRawText(text);
      // Auto parse
      const res = parseQuestionsFromText(text, grade, topic, lesson);
      setParseResult(res);
    } catch (err: any) {
      alert('Không thể đọc file Word này: ' + (err.message || 'Lỗi không xác định'));
    } finally {
      setIsLoadingFile(false);
    }
  };

  const handleParseNow = () => {
    if (!rawText.trim()) return;
    const res = parseQuestionsFromText(rawText, grade, topic, lesson);
    setParseResult(res);
  };

  const handleConfirmImport = () => {
    if (!parseResult || parseResult.questions.length === 0) return;
    onImportQuestions(parseResult.questions);
    setIsSuccessImport(true);
    setTimeout(() => {
      setIsSuccessImport(false);
      onClose();
      // Reset
      setSelectedFile(null);
      setRawText('');
      setParseResult(null);
    }, 1200);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nhập câu hỏi tự động từ file Word (.docx, .doc)"
      maxWidth="4xl"
    >
      <div className="space-y-4 text-xs">
        {/* Banner download template */}
        <div className="p-3.5 bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#0878C9] text-white">
                <FileText className="w-4 h-4" />
              </span>
              <h4 className="font-bold text-[#073B66] text-sm">
                File Word mẫu chuẩn Lịch sử (Trắc nghiệm 1 đáp án & Đúng/Sai)
              </h4>
            </div>
            <p className="text-slate-600 text-xs pl-8 font-serif leading-relaxed">
              Tải file mẫu về máy, chỉ việc sao chép hoặc dán câu hỏi của cô vào đúng định dạng rồi tải lên lại.
            </p>
          </div>

          <button
            type="button"
            onClick={downloadWordTemplate}
            className="px-4 py-2.5 bg-[#0878C9] hover:bg-[#073B66] text-white rounded-xl font-bold flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            Tải file Word mẫu (.doc)
          </button>
        </div>

        {/* Global Settings: Grade & Topic */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Áp dụng cho Khối lớp:</label>
            <select
              value={grade}
              onChange={(e) => {
                const g = parseInt(e.target.value, 10) as 10 | 11 | 12;
                setGrade(g);
                if (rawText) {
                  setParseResult(parseQuestionsFromText(rawText, g, topic, lesson));
                }
              }}
              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg outline-none font-medium"
            >
              <option value={10}>Lớp 10 (GDTX)</option>
              <option value={11}>Lớp 11 (GDTX)</option>
              <option value={12}>Lớp 12 (GDTX)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Chương / Chủ đề:</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg outline-none font-medium"
              placeholder="Ví dụ: Kháng chiến chống Pháp"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Bài học:</label>
            <input
              type="text"
              value={lesson}
              onChange={(e) => setLesson(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg outline-none font-medium"
              placeholder="Ví dụ: Ôn tập định kỳ GDTX"
            />
          </div>
        </div>

        {/* Method Switch: File Upload vs Copy-Paste */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'upload'
                ? 'bg-[#073B66] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Cách 1: Tải lên file Word (.docx, .doc, .txt)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('paste')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'paste'
                ? 'bg-[#073B66] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Cách 2: Dán trực tiếp nội dung văn bản (Copy - Paste)
          </button>
        </div>

        {/* Tab 1: Upload File */}
        {activeTab === 'upload' && (
          <div className="p-6 border-2 border-dashed border-sky-300 bg-sky-50/30 rounded-2xl text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-sky-100 text-[#0878C9] flex items-center justify-center mx-auto">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm">
                Chọn file Word chứa danh sách câu hỏi từ máy tính
              </p>
              <p className="text-slate-500 text-xs mt-0.5">
                Hỗ trợ định dạng Microsoft Word: <strong className="text-slate-700">.docx, .doc, .txt</strong>
              </p>
            </div>

            <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0878C9] hover:bg-[#073B66] text-white rounded-xl font-bold cursor-pointer shadow-xs transition-colors">
              <Upload className="w-4 h-4" />
              <span>{selectedFile ? `Đã chọn: ${selectedFile.name}` : 'Chọn file từ máy tính'}</span>
              <input
                type="file"
                accept=".docx,.doc,.txt"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {isLoadingFile && (
              <div className="flex items-center justify-center gap-2 text-slate-600 text-xs">
                <RefreshCw className="w-4 h-4 animate-spin text-[#0878C9]" />
                Đang đọc và phân tích cấu trúc file Word...
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Paste Raw Text */}
        {activeTab === 'paste' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700">
                Dán toàn bộ văn bản câu hỏi từ Word vào đây:
              </label>
              <button
                type="button"
                onClick={handleParseNow}
                className="px-3 py-1 bg-[#0878C9] hover:bg-[#073B66] text-white rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Phân tích câu hỏi
              </button>
            </div>
            <textarea
              rows={8}
              value={rawText}
              onChange={(e) => {
                setRawText(e.target.value);
                setParseResult(null);
              }}
              placeholder={`Ví dụ định dạng dán vào:

Câu 1: Hiện thực lịch sử là gì?
A. Tất cả những gì đã diễn ra trong quá khứ...
B. Những câu chuyện truyền thuyết...
C. Toàn bộ nhận thức chủ quan...
D. Những dự đoán của con người...
Đáp án: A

Câu 2: Đọc đoạn tư liệu sau trích trong Tuyên ngôn Độc lập...
a) Tuyên ngôn Độc lập mở đầu bằng việc trích dẫn bản Tuyên ngôn của Mỹ - Đúng
b) Bản Tuyên ngôn được đọc tại Tân Trào - Sai
c) Văn kiện phát triển quyền con người thành quyền dân tộc - Đúng
d) Tuyên bố chấm dứt chế độ phong kiến - Đúng`}
              className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0878C9] font-serif text-xs leading-relaxed"
            />
          </div>
        )}

        {/* PARSE RESULTS & PREVIEW */}
        {parseResult && (
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-100 rounded-xl">
              <div className="flex items-center gap-3">
                <span className="font-extrabold text-slate-900 text-sm">
                  Kết quả phân tích:
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Tìm thấy {parseResult.totalParsed} câu hỏi hợp lệ
                </span>
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[11px]">
                  {parseResult.singleCount} câu trắc nghiệm 1 đáp án
                </span>
                <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold text-[11px]">
                  {parseResult.tfCount} câu Đúng/Sai (2025)
                </span>
              </div>

              {parseResult.totalParsed > 0 && (
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <FileCheck className="w-4 h-4" />
                  Nhập {parseResult.totalParsed} câu vào ngân hàng đề
                </button>
              )}
            </div>

            {/* Error alerts if any */}
            {parseResult.errors.length > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] space-y-1">
                <div className="font-bold flex items-center gap-1 text-amber-950">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Một số câu chưa nhận diện được (có thể bỏ qua hoặc kiểm tra lại cú pháp):
                </div>
                {parseResult.errors.slice(0, 3).map((err, ei) => (
                  <div key={ei} className="pl-4">• {err}</div>
                ))}
              </div>
            )}

            {/* Question Preview List */}
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {parseResult.questions.map((q, qi) => (
                <div
                  key={qi}
                  className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5 font-serif text-xs"
                >
                  <div className="flex items-center justify-between font-sans">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-slate-100 font-bold text-[#073B66]">
                        Câu {qi + 1}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          q.type === 'Trắc nghiệm đơn'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {q.type}
                      </span>
                    </div>
                    <span className="font-bold text-emerald-700 text-[11px]">
                      Đáp án: {q.correctAnswer}
                    </span>
                  </div>

                  <p className="text-slate-900 font-medium whitespace-pre-line leading-relaxed">
                    {q.content}
                  </p>

                  {/* Single Choice Options */}
                  {q.type === 'Trắc nghiệm đơn' && q.options && (
                    <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-700 pl-2">
                      {q.options.map((opt, oi) => (
                        <div key={oi} className={opt.startsWith(q.correctAnswer) ? 'font-bold text-emerald-800' : ''}>
                          {opt}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* True/False Statements */}
                  {q.type === 'Trắc nghiệm đúng sai' && q.trueFalseStatements && (
                    <div className="space-y-1 pl-2 text-[11px]">
                      {q.trueFalseStatements.map((stmt) => (
                        <div key={stmt.id} className="flex items-center justify-between text-slate-700">
                          <span>
                            <strong>{stmt.id})</strong> {stmt.statement}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                              stmt.isCorrect
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {stmt.isCorrect ? 'Đúng' : 'Sai'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Success Banner */}
        {isSuccessImport && (
          <div className="p-3 bg-emerald-600 text-white rounded-xl text-center font-bold text-xs flex items-center justify-center gap-2 animate-in fade-in">
            <CheckCircle className="w-4 h-4" />
            Đã nhập thành công toàn bộ câu hỏi vào Ngân hàng đề kiểm tra!
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </Modal>
  );
};
