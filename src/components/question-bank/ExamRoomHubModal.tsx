import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { QuestionType } from '../../types';
import {
  Clock,
  Layers,
  FileText,
  CheckSquare,
  ArrowRightLeft,
  Award,
  Sparkles,
  Users,
  ChevronRight,
  X,
  BookOpen,
  Info,
  CheckCircle2,
  GraduationCap,
  Play,
  RotateCcw,
} from 'lucide-react';

export type ExamRoomKey = 'Trắc nghiệm đơn' | 'Trắc nghiệm đúng sai' | 'Điền từ' | 'Nối từ' | 'Tự luận' | 'all';

export interface ExamRoomInfo {
  key: ExamRoomKey;
  roomNumber: number | string;
  name: string;
  subtitle: string;
  description: string;
  pedagogicalGoal: string;
  defaultMinutes: number;
  badge: string;
  badgeColor: string;
  cardGradient: string;
  borderColor: string;
  accentColor: string;
  icon: React.ReactNode;
  tags: string[];
}

export const EXAM_ROOMS_DATA: ExamRoomInfo[] = [
  {
    key: 'Trắc nghiệm đơn',
    roomNumber: 1,
    name: 'Phòng 1: Đấu Trường Trắc Nghiệm Đơn',
    subtitle: 'Nhiều phương án lựa chọn (A - B - C - D)',
    description: 'Rèn luyện tốc độ phản xạ nhận diện mốc niên đại, nhân vật, sự kiện và hiệp định lịch sử trọng tâm.',
    pedagogicalGoal: 'Rèn kỹ năng giải nhanh, loại trừ phương án nhiễu, ghi nhớ chuẩn xác kiến thức cốt lõi SGK Sử 12.',
    defaultMinutes: 15,
    badge: 'Phản Xạ Tốc Độ',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    cardGradient: 'from-blue-50/80 via-white to-sky-50/50 hover:from-blue-50',
    borderColor: 'border-blue-200 hover:border-blue-400',
    accentColor: 'text-[#0878C9]',
    icon: <Layers className="w-6 h-6 text-blue-600" />,
    tags: ['Phím tắt A-B-C-D', '15 phút', 'Chấm điểm tức thì', '24-40 câu'],
  },
  {
    key: 'Trắc nghiệm đúng sai',
    roomNumber: 2,
    name: 'Phòng 2: Phân Tích Tư Liệu Đúng / Sai',
    subtitle: 'Ngữ liệu & Trích đoạn tư liệu chuẩn Bộ GD&ĐT 2025',
    description: 'Đọc hiểu sâu các đoạn văn kiện, sắc lệnh, hồi ký và trích đoạn lịch sử để xác thực 4 mệnh đề a, b, c, d.',
    pedagogicalGoal: 'Nâng cao năng lực giải mã sử liệu, đối chiếu thông tin và làm quen barem điểm bậc thang của Bộ.',
    defaultMinutes: 20,
    badge: 'Chuẩn Bộ 2025',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-200',
    cardGradient: 'from-amber-50/80 via-white to-orange-50/50 hover:from-amber-50',
    borderColor: 'border-amber-200 hover:border-amber-400',
    accentColor: 'text-amber-700',
    icon: <FileText className="w-6 h-6 text-amber-600" />,
    tags: ['Bút dạ quang highlight', 'Barem 0.1 - 1.0đ', 'Split-view ngữ liệu', '20 phút'],
  },
  {
    key: 'Điền từ',
    roomNumber: 3,
    name: 'Phòng 3: Điền Khuyết Sự Kiện Lịch Sử',
    subtitle: 'Văn bản lịch sử & Thuật ngữ, Địa danh then chốt',
    description: 'Điền chính xác các từ khóa, mốc năm hoặc tên hội nghị lịch sử còn thiếu vào các chỗ trống trong đoạn văn.',
    pedagogicalGoal: 'Chống nhầm lẫn khái niệm lịch sử, rèn tính cẩn thận và chính xác trong diễn đạt thuật ngữ.',
    defaultMinutes: 15,
    badge: 'Khắc Sâu Thuật Ngữ',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-200',
    cardGradient: 'from-emerald-50/80 via-white to-teal-50/50 hover:from-emerald-50',
    borderColor: 'border-emerald-200 hover:border-emerald-400',
    accentColor: 'text-emerald-700',
    icon: <CheckSquare className="w-6 h-6 text-emerald-600" />,
    tags: ['Word Bank gợi ý', 'Click điền siêu nhanh', 'Nhận diện từ khóa', '15 phút'],
  },
  {
    key: 'Nối từ',
    roomNumber: 4,
    name: 'Phòng 4: Ghép Đôi & Nối Cặp Sự Kiện',
    subtitle: 'Ghép Nhân vật / Mốc thời gian với Ý nghĩa lịch sử',
    description: 'Nối logic giữa 2 cột: Cột A (Sự kiện/nhân vật) và Cột B (Ý nghĩa/kết quả/địa danh tương ứng).',
    pedagogicalGoal: 'Tăng cường tư duy nhân quả, liên kết mạch lạc tiến trình phát triển của lịch sử Việt Nam và thế giới.',
    defaultMinutes: 15,
    badge: 'Tư Duy Nhân Quả',
    badgeColor: 'bg-purple-100 text-purple-900 border-purple-200',
    cardGradient: 'from-purple-50/80 via-white to-indigo-50/50 hover:from-purple-50',
    borderColor: 'border-purple-200 hover:border-purple-400',
    accentColor: 'text-purple-700',
    icon: <ArrowRightLeft className="w-6 h-6 text-purple-600" />,
    tags: ['Nối cặp trực quan', 'Thẻ màu phân biệt', 'Chống nhầm lẫn', '15 phút'],
  },
  {
    key: 'Tự luận',
    roomNumber: 5,
    name: 'Phòng 5: Diễn Đàn Tự Luận Chuyên Sâu',
    subtitle: 'Viết đoạn văn phân tích, nhận định & liên hệ thực tiễn',
    description: 'Trình bày quan điểm lịch sử, phân tích nguyên nhân thắng lợi, ý nghĩa lịch sử hoặc bài học kinh nghiệm.',
    pedagogicalGoal: 'Phát triển năng lực ngôn ngữ, tư duy phản biện lịch sử và vận dụng vào công cuộc xây dựng đất nước.',
    defaultMinutes: 35,
    badge: 'Tư Duy Sâu & Rubric',
    badgeColor: 'bg-rose-100 text-rose-900 border-rose-200',
    cardGradient: 'from-rose-50/80 via-white to-red-50/50 hover:from-rose-50',
    borderColor: 'border-rose-200 hover:border-rose-400',
    accentColor: 'text-rose-700',
    icon: <Award className="w-6 h-6 text-rose-600" />,
    tags: ['Đếm số từ live', 'Tự động lưu nháp 15s', 'Rubric 3 tiêu chí', 'AI chấm sơ bộ'],
  },
];

interface ExamRoomHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRoom: (roomKey: ExamRoomKey, durationMinutes?: number, classId?: string, studentId?: string) => void;
}

export const ExamRoomHubModal: React.FC<ExamRoomHubModalProps> = ({
  isOpen,
  onClose,
  onSelectRoom,
}) => {
  const { classes, students, questions } = useApp();

  // Selected student context for exam
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const classStudents = students.filter((s) => s.classId === selectedClassId);
  const [selectedStudentId, setSelectedStudentId] = useState<string>(classStudents[0]?.id || '');

  // Calculate question stats per type
  const countSingle = questions.filter(
    (q) => q.type === 'Trắc nghiệm đơn' || q.type === 'Trắc nghiệm'
  ).length;
  const countTF = questions.filter((q) => q.type === 'Trắc nghiệm đúng sai').length;
  const countBlank = questions.filter((q) => q.type === 'Điền từ').length;
  const countMatch = questions.filter((q) => q.type === 'Nối từ').length;
  const countEssay = questions.filter((q) => q.type === 'Tự luận').length;

  const getQuestionCountForRoom = (key: ExamRoomKey): number => {
    switch (key) {
      case 'Trắc nghiệm đơn':
        return countSingle;
      case 'Trắc nghiệm đúng sai':
        return countTF;
      case 'Điền từ':
        return countBlank;
      case 'Nối từ':
        return countMatch;
      case 'Tự luận':
        return countEssay;
      default:
        return questions.length;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto font-sans animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-5xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-[#073B66] via-[#0878C9] to-teal-700 text-white p-5 sm:p-6 shrink-0 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            title="Đóng"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold tracking-wide">
                  HỆ THỐNG PHÒNG THI TRỰC TUYẾN 5 DẠNG
                </span>
                <span className="text-sky-200 text-xs hidden sm:inline">•</span>
                <span className="text-sky-100 text-xs font-medium hidden sm:inline">
                  Trung tâm GDNN - GDTX TP Quảng Ninh • Phân hiệu Tiên Yên
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-serif tracking-tight flex items-center gap-2.5">
                <GraduationCap className="w-7 h-7 text-amber-300 shrink-0" />
                Không Gian Luyện Thi Lịch Sử Chuyên Biệt Theo Từng Dạng
              </h2>
              <p className="text-xs sm:text-sm text-sky-100/90 font-sans max-w-3xl">
                Giáo viên: <strong>Cô Cao Thị Thu</strong> • Tách riêng 5 phòng thi chuyên sâu giúp học viên rèn luyện đúng kỹ năng, phản xạ tốc độ và thành thạo barem điểm thi chuẩn Bộ GD&ĐT.
              </p>
            </div>
          </div>

          {/* Student Selector Toolbar */}
          <div className="mt-4 pt-3 border-t border-white/20 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-white/80 font-bold flex items-center gap-1.5">
                <Users className="w-4 h-4 text-amber-300" /> Chọn học viên dự thi:
              </span>
              <select
                value={selectedClassId}
                onChange={(e) => {
                  setSelectedClassId(e.target.value);
                  const st = students.filter((s) => s.classId === e.target.value);
                  setSelectedStudentId(st[0]?.id || '');
                }}
                className="bg-white/10 text-white border border-white/25 rounded-xl px-3 py-1 font-bold outline-none cursor-pointer focus:bg-[#073B66]"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id} className="text-slate-900">
                    {c.name} ({c.grade ? `Lớp ${c.grade}` : 'GDTX'})
                  </option>
                ))}
              </select>

              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="bg-white text-slate-900 rounded-xl px-3 py-1 font-bold outline-none cursor-pointer shadow-xs"
              >
                {classStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} ({s.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Quick All-in-One comprehensive test button */}
            <button
              onClick={() => onSelectRoom('all', 45, selectedClassId, selectedStudentId)}
              className="px-4 py-1.5 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-950 font-black rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer text-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-900" />
              Thi Tổng Hợp 5 Dạng (45 phút)
            </button>
          </div>
        </div>

        {/* 5 Rooms Cards Grid */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#073B66] uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#0878C9]" />
              Chọn 1 trong 5 phòng thi chuyên biệt để bắt đầu làm bài:
            </h3>
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              Tổng số câu hỏi trong ngân hàng: <strong>{questions.length} câu</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {EXAM_ROOMS_DATA.map((room) => {
              const count = getQuestionCountForRoom(room.key);
              return (
                <div
                  key={room.key}
                  className={`rounded-2xl border-2 transition-all p-5 flex flex-col justify-between bg-gradient-to-b ${room.cardGradient} ${room.borderColor} hover:shadow-lg group relative`}
                >
                  <div>
                    {/* Top Tag & Number */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-white shadow-xs border border-slate-200 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                          {room.icon}
                        </div>
                        <div>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${room.badgeColor}`}>
                            {room.badge}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-black text-slate-700 bg-white/80 px-2 py-1 rounded-lg border border-slate-200">
                          {count} câu
                        </span>
                      </div>
                    </div>

                    {/* Room Name & Subtitle */}
                    <h4 className="font-bold text-base text-[#073B66] font-serif group-hover:text-[#0878C9] transition-colors">
                      {room.name}
                    </h4>
                    <p className="text-xs font-medium text-slate-500 mb-2">
                      {room.subtitle}
                    </p>

                    {/* Description */}
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-3">
                      {room.description}
                    </p>

                    {/* Pedagogical Note */}
                    <div className="p-2.5 rounded-xl bg-white/70 border border-slate-200/80 mb-3 text-[11px] text-slate-600">
                      <span className="font-bold text-[#073B66] block mb-0.5">🎯 Mục tiêu rèn luyện:</span>
                      {room.pedagogicalGoal}
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {room.tags.map((tag, ti) => (
                        <span
                          key={ti}
                          className="text-[10px] bg-white/90 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200 font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Room Action Buttons */}
                  <div className="pt-3 border-t border-slate-200/80 flex items-center gap-2">
                    <button
                      onClick={() =>
                        onSelectRoom(room.key, room.defaultMinutes, selectedClassId, selectedStudentId)
                      }
                      className="flex-1 py-2.5 px-3 bg-[#0878C9] hover:bg-[#073B66] text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer group-hover:shadow-md"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      Vào phòng thi ({room.defaultMinutes}p)
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Card 6: Phòng Thi Tổng Hợp Toàn Diện */}
            <div className="rounded-2xl border-2 border-indigo-200 hover:border-indigo-400 transition-all p-5 flex flex-col justify-between bg-gradient-to-b from-indigo-50/80 via-white to-purple-50/50 hover:shadow-lg group">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-white shadow-xs border border-indigo-200 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Award className="w-6 h-6 text-indigo-600" />
                    </div>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full border bg-indigo-100 text-indigo-900 border-indigo-200">
                      Đề Thi Thử Toàn Diện
                    </span>
                  </div>
                  <span className="text-xs font-black text-indigo-700 bg-white/80 px-2 py-1 rounded-lg border border-indigo-200">
                    5 Dạng Gộp
                  </span>
                </div>

                <h4 className="font-bold text-base text-[#073B66] font-serif group-hover:text-indigo-600 transition-colors">
                  Phòng Tổng Hợp: Mô Phỏng Kỳ Thi Thực Tế
                </h4>
                <p className="text-xs font-medium text-slate-500 mb-2">
                  Kết hợp cả 5 phân hệ kiến thức Lịch sử
                </p>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-3">
                  Kiểm tra toàn diện cả trắc nghiệm đơn, trắc nghiệm đúng sai ngữ liệu, bài tập điền từ, ghép đôi sự kiện và viết bài tự luận.
                </p>

                <div className="p-2.5 rounded-xl bg-white/70 border border-indigo-200/80 mb-3 text-[11px] text-slate-600">
                  <span className="font-bold text-indigo-900 block mb-0.5">🎯 Mục tiêu:</span>
                  Đánh giá năng lực tổng thể, chuẩn bị tâm lý và rèn luyện phân bổ thời gian trước kỳ thi tốt nghiệp.
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  <span className="text-[10px] bg-white/90 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-200 font-medium">
                    Thời gian: 45 phút
                  </span>
                  <span className="text-[10px] bg-white/90 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-200 font-medium">
                    Thang điểm 10 chuẩn
                  </span>
                  <span className="text-[10px] bg-white/90 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-200 font-medium">
                    Đồng bộ Sổ Điểm
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-indigo-200/80">
                <button
                  onClick={() => onSelectRoom('all', 45, selectedClassId, selectedStudentId)}
                  className="w-full py-2.5 px-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer group-hover:shadow-md"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  Vào thi tổng hợp (45 phút)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#0878C9] shrink-0" />
            <span>
              Hệ thống tự động chấm điểm theo barem chuẩn của Bộ GD&ĐT và Thông tư 43/2021-BGDĐT đối với học viên GDTX.
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold cursor-pointer transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
