// ============================================================================
// TEACHER CUSTOM GAME DATA EDITOR
// Công cụ Soạn & Bổ sung Dữ liệu Trò chơi - Cô Cao Thị Thu
// ============================================================================

import React, { useState } from 'react';
import {
  GoldenBellQuestion,
  WheelQuestion,
  TimelineEventItem,
} from '../../types/gameTypes';
import {
  DEFAULT_GOLDEN_BELL_QUESTIONS,
  DEFAULT_WHEEL_QUESTIONS,
  convertQuestionsToGoldenBell,
  convertQuestionsToWheelQuestions,
} from '../../data/historyGamesData';
import { Question } from '../../types';
import {
  Plus,
  Save,
  Trash2,
  CheckCircle,
  Sparkles,
  Layers,
  BookOpen,
  Clock,
  Check,
  Bell,
  RefreshCw,
} from 'lucide-react';

interface CustomGameDataEditorProps {
  bankQuestions?: Question[];
  onSyncFromBank: () => void;
}

export const CustomGameDataEditor: React.FC<CustomGameDataEditorProps> = ({
  bankQuestions = [],
  onSyncFromBank,
}) => {
  const [activeTab, setActiveTab] = useState<'golden-bell' | 'wheel'>('golden-bell');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // 1. Golden Bell Questions List
  const [bellQuestions, setBellQuestions] = useState<GoldenBellQuestion[]>(
    DEFAULT_GOLDEN_BELL_QUESTIONS
  );

  // Sync from single choice questions in Bank
  const handleAutoSyncGoldenBell = () => {
    const synced = convertQuestionsToGoldenBell(bankQuestions);
    setBellQuestions(synced);
    showToast(`Đã đồng bộ ${synced.length} câu hỏi trắc nghiệm từ Ngân hàng đề vào Đấu Trường Rung Chuông Vàng!`);
  };

  return (
    <div className="space-y-4 font-sans text-xs">
      {/* Toast */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#073B66] text-white px-4 py-2.5 rounded-2xl shadow-xl border border-sky-400 flex items-center gap-2 font-bold animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Sub tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-100 rounded-2xl">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('golden-bell')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'golden-bell'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>🔔 10 Bậc Rung Chuông Vàng ({bellQuestions.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('wheel')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'wheel'
                ? 'bg-[#073B66] text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span>🎡 Câu Hỏi Vòng Quay</span>
          </button>
        </div>

        <button
          onClick={handleAutoSyncGoldenBell}
          className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
          title="Tự động trích xuất các câu trắc nghiệm từ Ngân hàng đề vào 10 Bậc Rung Chuông Vàng"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Đồng bộ từ Ngân hàng đề ({bankQuestions.length} câu)</span>
        </button>
      </div>

      {/* TAB 1: GOLDEN BELL QUESTIONS */}
      {activeTab === 'golden-bell' && (
        <div className="space-y-4">
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-center justify-between">
            <div>
              <h4 className="font-bold text-amber-950 text-sm flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-600" />
                <span>Hệ Thống 10 Bậc Thang Rung Chuông Vàng Lịch Sử</span>
              </h4>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Được phân chia khoa học từ Khởi Động (Bậc 1-3) đến Vượt Chướng Ngại Vật (Bậc 4-6), Tăng Tốc (Bậc 7-9) và Rung Chuông Vàng (Bậc 10).
              </p>
            </div>
            <button
              onClick={() => {
                setBellQuestions(DEFAULT_GOLDEN_BELL_QUESTIONS);
                showToast('Đã khôi phục 10 câu hỏi chuẩn Bộ GD&ĐT mặc định!');
              }}
              className="px-3 py-1.5 bg-white border border-amber-300 text-amber-900 rounded-xl hover:bg-amber-100 font-bold flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Khôi phục mặc định</span>
            </button>
          </div>

          {/* List of 10 tiered questions */}
          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {bellQuestions.map((q) => (
              <div
                key={q.id}
                className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-black text-[10px]">
                      BẬC {q.level} • {q.tierName}
                    </span>
                    <strong className="text-slate-800 text-xs">
                      {q.topic}
                    </strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Đáp án đúng: {q.correctAnswer}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">
                      +{q.points} điểm
                    </span>
                  </div>
                </div>

                <p className="text-xs font-semibold text-slate-900 leading-relaxed font-serif">
                  {q.question}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                  {q.options.map((opt) => (
                    <div
                      key={opt}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] border ${
                        opt.startsWith(q.correctAnswer)
                          ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-bold'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      {opt}
                    </div>
                  ))}
                </div>

                {q.hintText && (
                  <div className="text-[11px] text-amber-800 bg-amber-50/60 p-2 rounded-lg italic">
                    <strong>Gợi ý:</strong> {q.hintText}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: WHEEL QUESTIONS */}
      {activeTab === 'wheel' && (
        <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 text-sm">
              Bộ Câu Hỏi Dành Cho Vòng Quay Lịch Sử:
            </h4>
            <span className="text-[11px] text-slate-500">
              Đang có {Object.keys(DEFAULT_WHEEL_QUESTIONS).length} câu hỏi mặc định gắn với các ô mốc lịch sử
            </span>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {Object.values(DEFAULT_WHEEL_QUESTIONS).map((wq, i) => (
              <div
                key={wq.id || i}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#073B66]">
                    {i + 1}. Chủ đề: {wq.topic}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold text-[10px]">
                    Đáp án đúng: {wq.correctAnswer}
                  </span>
                </div>
                <p className="font-serif text-slate-800 font-medium">
                  {wq.question}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
