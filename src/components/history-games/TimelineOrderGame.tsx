// ============================================================================
// GAME 3: DÒNG THỜI GIAN LỊCH SỬ (CHRONOLOGICAL TIMELINE SORTER)
// Phân hệ Trò chơi Lịch sử Tương tác - Cô Cao Thị Thu (GDTX Tiên Yên)
// ============================================================================

import React, { useState, useEffect } from 'react';
import { TimelineEventItem, GamePlayMode } from '../../types/gameTypes';
import { DEFAULT_TIMELINE_SEQUENCES, playSoundEffect } from '../../data/historyGamesData';
import { Question } from '../../types';
import {
  ArrowUp,
  ArrowDown,
  RotateCcw,
  CheckCircle,
  XCircle,
  Sparkles,
  Award,
  BookOpen,
  HelpCircle,
  Volume2,
  VolumeX,
  Layers,
  ArrowRight,
  GripVertical,
} from 'lucide-react';

interface TimelineOrderGameProps {
  playMode: GamePlayMode;
  onTogglePlayMode: () => void;
  bankQuestions?: Question[];
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const TimelineOrderGame: React.FC<TimelineOrderGameProps> = ({
  playMode,
  onTogglePlayMode,
  bankQuestions = [],
  soundEnabled,
  onToggleSound,
}) => {
  const [selectedSequenceIndex, setSelectedSequenceIndex] = useState<number>(0);
  const activeSequence = DEFAULT_TIMELINE_SEQUENCES[selectedSequenceIndex];

  // Shuffled items in the timeline workspace
  const [orderedItems, setOrderedItems] = useState<TimelineEventItem[]>([]);
  const [isEvaluated, setIsEvaluated] = useState<boolean>(false);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [showCauseEffectModal, setShowCauseEffectModal] = useState<boolean>(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Shuffle sequence items when changing topic or resetting
  const initTimelineGame = (seqIdx: number = selectedSequenceIndex) => {
    const rawEvents = [...DEFAULT_TIMELINE_SEQUENCES[seqIdx].events];
    // Shuffle
    for (let i = rawEvents.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rawEvents[i], rawEvents[j]] = [rawEvents[j], rawEvents[i]];
    }
    setOrderedItems(rawEvents);
    setIsEvaluated(false);
    setCorrectCount(0);
    setShowCauseEffectModal(false);
  };

  useEffect(() => {
    initTimelineGame(selectedSequenceIndex);
  }, [selectedSequenceIndex]);

  // Move item up in the list
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    if (soundEnabled) playSoundEffect('flip');
    setOrderedItems((prev) => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
    setIsEvaluated(false);
  };

  // Move item down in the list
  const handleMoveDown = (index: number) => {
    if (index === orderedItems.length - 1) return;
    if (soundEnabled) playSoundEffect('flip');
    setOrderedItems((prev) => {
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
    setIsEvaluated(false);
  };

  // Drag and Drop reordering
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = (targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex) return;
    if (soundEnabled) playSoundEffect('flip');

    setOrderedItems((prev) => {
      const copy = [...prev];
      const [draggedItem] = copy.splice(draggedIndex, 1);
      copy.splice(targetIndex, 0, draggedItem);
      return copy;
    });

    setDraggedIndex(null);
    setIsEvaluated(false);
  };

  // Check Timeline Sequence
  const handleCheckSequence = () => {
    let correct = 0;
    orderedItems.forEach((item, idx) => {
      if (item.orderIndex === idx + 1) {
        correct++;
      }
    });

    setCorrectCount(correct);
    setIsEvaluated(true);

    if (correct === orderedItems.length) {
      if (soundEnabled) playSoundEffect('victory');
    } else {
      if (soundEnabled) playSoundEffect('wrong');
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200 font-sans">
      {/* ------------------------------------------------------------------- */}
      {/* TOP HEADER & CAMPAIGN SELECTOR                                      */}
      {/* ------------------------------------------------------------------- */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-gradient-to-r from-teal-900 via-emerald-950 to-slate-900 text-white rounded-3xl shadow-lg border border-teal-400/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-400 text-slate-950 flex items-center justify-center font-black text-xl shadow-md">
            ⏳
          </div>
          <div>
            <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
              Dòng Thời Gian Lịch Sử
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-400/20 text-teal-300 border border-teal-400/30">
                Tư Duy Nhân Quả & Mốc Tiến Trình
              </span>
            </h3>
            <p className="text-xs text-teal-200">
              Kéo thả hoặc dùng mũi tên để sắp xếp đúng thứ tự từ quá khứ đến hiện tại
            </p>
          </div>
        </div>

        {/* Campaign Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-white/10 rounded-xl p-1 border border-white/20 text-xs font-bold">
            {DEFAULT_TIMELINE_SEQUENCES.map((seq, idx) => (
              <button
                key={seq.id}
                onClick={() => setSelectedSequenceIndex(idx)}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  selectedSequenceIndex === idx
                    ? 'bg-teal-500 text-slate-950 font-black shadow-xs'
                    : 'text-teal-200 hover:text-white'
                }`}
              >
                {seq.period}
              </button>
            ))}
          </div>

          <button
            onClick={() => initTimelineGame(selectedSequenceIndex)}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-teal-200 cursor-pointer"
            title="Xáo trộn lại dòng thời gian"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* TIMELINE TRACK INSTRUCTIONS & ACTION BAR                            */}
      {/* ------------------------------------------------------------------- */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div>
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-teal-600" />
            {activeSequence.title}
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Sắp xếp từ mốc sớm nhất ở trên đỉnh ➔ mốc muộn nhất ở dưới đáy.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Cause and effect explanation trigger */}
          <button
            onClick={() => setShowCauseEffectModal(!showCauseEffectModal)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-teal-600" />
            <span>Tiến trình nhân quả</span>
          </button>

          {/* Check Button */}
          <button
            onClick={handleCheckSequence}
            className="px-5 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Kiểm tra kết quả</span>
          </button>
        </div>
      </div>

      {/* Evaluation Result Alert */}
      {isEvaluated && (
        <div
          className={`p-4 rounded-2xl border-2 flex items-center justify-between animate-in fade-in duration-200 ${
            correctCount === orderedItems.length
              ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
              : 'bg-amber-50 border-amber-300 text-amber-950'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
                correctCount === orderedItems.length
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-500 text-white'
              }`}
            >
              {correctCount === orderedItems.length ? '✓' : '!'}
            </div>
            <div>
              <h5 className="font-bold text-sm">
                {correctCount === orderedItems.length
                  ? 'Tuyệt vời! Bạn đã sắp xếp đúng 100% dòng thời gian lịch sử!'
                  : `Đúng ${correctCount} / ${orderedItems.length} mốc sự kiện.`}
              </h5>
              <p className="text-xs opacity-80">
                {correctCount === orderedItems.length
                  ? 'Mời bạn xem bản phân tích tiến trình nhân quả bên dưới.'
                  : 'Các thẻ viền đỏ đang ở sai vị trí, hãy dùng mũi tên để điều chỉnh lại nhé!'}
              </p>
            </div>
          </div>

          <span className="text-base font-black px-3 py-1 rounded-xl bg-white shadow-2xs">
            {Math.round((correctCount / orderedItems.length) * 10)} / 10 điểm
          </span>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* TIMELINE ITEMS LIST (DRAG OR MOVE UP / DOWN)                        */}
      {/* ------------------------------------------------------------------- */}
      <div className="relative pl-6 sm:pl-8 space-y-3">
        {/* Continuous Timeline Vertical Line */}
        <div className="absolute left-3 sm:left-4 top-4 bottom-4 w-1 bg-gradient-to-b from-teal-500 via-sky-500 to-indigo-500 rounded-full" />

        {orderedItems.map((item, index) => {
          const isItemCorrect = isEvaluated && item.orderIndex === index + 1;
          const isItemWrong = isEvaluated && item.orderIndex !== index + 1;

          let cardBorder = 'border-slate-200 hover:border-teal-400';
          let nodeBg = 'bg-slate-200 text-slate-700';

          if (isItemCorrect) {
            cardBorder = 'border-emerald-400 bg-emerald-50/60 ring-2 ring-emerald-300';
            nodeBg = 'bg-emerald-600 text-white';
          } else if (isItemWrong) {
            cardBorder = 'border-rose-300 bg-rose-50/40';
            nodeBg = 'bg-rose-500 text-white';
          }

          return (
            <div
              key={item.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={() => handleDrop(index)}
              className={`p-4 rounded-2xl border-2 bg-white transition-all shadow-2xs relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 group ${cardBorder}`}
            >
              {/* Timeline Pin Node on Left */}
              <div
                className={`absolute -left-[27px] sm:-left-[31px] w-6 h-6 rounded-full border-2 border-white flex items-center justify-center font-bold text-[11px] shadow-sm z-10 ${nodeBg}`}
              >
                {index + 1}
              </div>

              {/* Event Content */}
              <div className="flex items-start gap-3 flex-1">
                <span className="p-1.5 text-slate-300 hover:text-slate-600 cursor-grab active:cursor-grabbing shrink-0 hidden sm:block">
                  <GripVertical className="w-4 h-4" />
                </span>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-black text-sm text-[#073B66]">
                      {item.title}
                    </span>

                    {/* Reveal Year when evaluated or in hint */}
                    {isItemCorrect && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 font-black text-xs">
                        Năm: {item.year}
                      </span>
                    )}

                    {isItemWrong && (
                      <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[11px] font-bold">
                        Vị trí chưa đúng
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 font-serif leading-relaxed">
                    {item.description}
                  </p>

                  <div className="text-[11px] text-teal-800 font-medium">
                    🎯 Ý nghĩa: {item.significance}
                  </div>
                </div>
              </div>

              {/* Reordering Controls: Move Up / Down */}
              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => handleMoveUp(index)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 cursor-pointer transition-colors"
                  title="Di chuyển lên trên"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  disabled={index === orderedItems.length - 1}
                  onClick={() => handleMoveDown(index)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 cursor-pointer transition-colors"
                  title="Di chuyển xuống dưới"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* CAUSE AND EFFECT HISTORICAL PROGRESSION MODAL                       */}
      {/* ------------------------------------------------------------------- */}
      {showCauseEffectModal && (
        <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl shadow-xl space-y-4 animate-in fade-in border border-indigo-400/30">
          <div className="flex items-center justify-between pb-3 border-b border-white/20">
            <h4 className="font-bold text-sm sm:text-base text-amber-300 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-300" />
              Sơ Đồ Tiến Trình Nhân Quả Chuẩn: {activeSequence.title}
            </h4>
            <button
              onClick={() => setShowCauseEffectModal(false)}
              className="text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              Đóng sơ đồ
            </button>
          </div>

          <div className="space-y-3 text-xs">
            {activeSequence.events.map((ev, ei) => (
              <div key={ev.id} className="p-3 bg-white/10 rounded-2xl border border-white/10 flex items-start gap-3">
                <span className="w-7 h-7 rounded-xl bg-amber-400 text-slate-950 font-black flex items-center justify-center shrink-0">
                  {ev.orderIndex}
                </span>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <strong className="text-white text-sm">{ev.title}</strong>
                    <span className="px-2 py-0.5 rounded bg-amber-300/20 text-amber-300 font-black">
                      {ev.dateStr || ev.year}
                    </span>
                  </div>
                  <p className="text-slate-300 font-serif leading-relaxed">
                    {ev.description}
                  </p>
                  <p className="text-teal-300 italic pt-0.5">
                    ➔ Mối liên hệ tiếp theo: {ev.significance}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
