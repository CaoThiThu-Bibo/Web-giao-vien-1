// ============================================================================
// GAME 2: LẬT THẺ GHI NHỚ LỊCH SỬ (MEMORY FLIP & MATCH)
// Phân hệ Trò chơi Lịch sử Tương tác - Cô Cao Thị Thu (GDTX Tiên Yên)
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  MemoryCardItem,
  MemoryPairData,
  GamePlayMode,
} from '../../types/gameTypes';
import {
  DEFAULT_MEMORY_PAIRS,
  playSoundEffect,
} from '../../data/historyGamesData';
import { Question } from '../../types';
import {
  RotateCcw,
  Sparkles,
  Award,
  Clock,
  Eye,
  CheckCircle,
  HelpCircle,
  Trophy,
  Flame,
  Volume2,
  VolumeX,
  Layers,
} from 'lucide-react';

interface MemoryMatchGameProps {
  playMode: GamePlayMode;
  onTogglePlayMode: () => void;
  bankQuestions?: Question[];
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const MemoryMatchGame: React.FC<MemoryMatchGameProps> = ({
  playMode,
  onTogglePlayMode,
  bankQuestions = [],
  soundEnabled,
  onToggleSound,
}) => {
  // Difficulty Level: 4 pairs (8 cards), 6 pairs (12 cards), 8 pairs (16 cards)
  const [difficulty, setDifficulty] = useState<4 | 6 | 8>(6);
  const [cards, setCards] = useState<MemoryCardItem[]>([]);
  const [flippedCardIds, setFlippedCardIds] = useState<string[]>([]);
  const [matchedPairIds, setMatchedPairIds] = useState<string[]>([]);
  const [movesCount, setMovesCount] = useState<number>(0);
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [isGameActive, setIsGameActive] = useState<boolean>(false);
  const [isVictory, setIsVictory] = useState<boolean>(false);
  const [previewAllTime, setPreviewAllTime] = useState<number>(0);

  // Initialize Cards from dataset
  const initGame = (numPairs: number = difficulty) => {
    // Select pairs from defaults
    const selectedPairs = DEFAULT_MEMORY_PAIRS.slice(0, numPairs);

    const generatedCards: MemoryCardItem[] = [];
    selectedPairs.forEach((pair) => {
      // Left Card (e.g. Year / Character)
      generatedCards.push({
        id: `${pair.id}-left`,
        pairId: pair.id,
        side: 'left',
        text: pair.left,
        category: pair.category,
        isFlipped: false,
        isMatched: false,
      });

      // Right Card (e.g. Event / Significance)
      generatedCards.push({
        id: `${pair.id}-right`,
        pairId: pair.id,
        side: 'right',
        text: pair.right,
        category: pair.category,
        isFlipped: false,
        isMatched: false,
      });
    });

    // Shuffle cards with Fisher-Yates
    for (let i = generatedCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [generatedCards[i], generatedCards[j]] = [generatedCards[j], generatedCards[i]];
    }

    setCards(generatedCards);
    setFlippedCardIds([]);
    setMatchedPairIds([]);
    setMovesCount(0);
    setSecondsElapsed(0);
    setIsVictory(false);
    setIsGameActive(true);

    // Initial 2-second sneak peek
    setPreviewAllTime(2);
  };

  useEffect(() => {
    initGame(difficulty);
  }, [difficulty]);

  // Sneak peek timer countdown
  useEffect(() => {
    if (previewAllTime > 0) {
      const timer = setTimeout(() => setPreviewAllTime((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [previewAllTime]);

  // Game Stopwatch
  useEffect(() => {
    if (!isGameActive || isVictory || previewAllTime > 0) return;
    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isGameActive, isVictory, previewAllTime]);

  // Card Click Interaction
  const handleCardClick = (card: MemoryCardItem) => {
    if (
      !isGameActive ||
      previewAllTime > 0 ||
      card.isMatched ||
      card.isFlipped ||
      flippedCardIds.length >= 2 ||
      flippedCardIds.includes(card.id)
    ) {
      return;
    }

    if (soundEnabled) playSoundEffect('flip');

    const newFlipped = [...flippedCardIds, card.id];
    setFlippedCardIds(newFlipped);

    // Update flipped state in cards
    setCards((prev) =>
      prev.map((c) => (c.id === card.id ? { ...c, isFlipped: true } : c))
    );

    // Check match when 2 cards are flipped
    if (newFlipped.length === 2) {
      setMovesCount((prev) => prev + 1);
      const firstCard = cards.find((c) => c.id === newFlipped[0]);
      const secondCard = card;

      if (firstCard && firstCard.pairId === secondCard.pairId) {
        // MATCH FOUND!
        if (soundEnabled) playSoundEffect('correct');
        const pairId = firstCard.pairId;
        const newMatched = [...matchedPairIds, pairId];
        setMatchedPairIds(newMatched);

        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.pairId === pairId ? { ...c, isMatched: true, isFlipped: true } : c
            )
          );
          setFlippedCardIds([]);

          // Check for Victory!
          if (newMatched.length === difficulty) {
            setIsVictory(true);
            setIsGameActive(false);
            if (soundEnabled) playSoundEffect('victory');
          }
        }, 500);
      } else {
        // NO MATCH -> Flip back after delay
        if (soundEnabled) playSoundEffect('wrong');
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              newFlipped.includes(c.id) ? { ...c, isFlipped: false } : c
            )
          );
          setFlippedCardIds([]);
        }, 1100);
      }
    }
  };

  const formattedTime = useMemo(() => {
    const mins = Math.floor(secondsElapsed / 60);
    const secs = secondsElapsed % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, [secondsElapsed]);

  return (
    <div className="space-y-5 animate-in fade-in duration-200 font-sans">
      {/* ------------------------------------------------------------------- */}
      {/* HEADER & DIFFICULTY CONTROLS                                        */}
      {/* ------------------------------------------------------------------- */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 text-white rounded-3xl shadow-lg border border-purple-400/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-500 text-white flex items-center justify-center font-black text-xl shadow-md">
            🃏
          </div>
          <div>
            <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
              Lật Thẻ Ghi Nhớ Lịch Sử
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-400/20 text-purple-300 border border-purple-400/30">
                Khắc Sâu Mốc Năm & Sự Kiện
              </span>
            </h3>
            <p className="text-xs text-purple-200">
              Lật tìm từng cặp tương ứng: Mốc thời gian ⟷ Chiến thắng lịch sử
            </p>
          </div>
        </div>

        {/* Stats & Tools */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Difficulty selector */}
          <div className="flex items-center bg-white/10 rounded-xl p-1 border border-white/20 text-xs font-bold">
            <button
              onClick={() => setDifficulty(4)}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                difficulty === 4 ? 'bg-purple-600 text-white' : 'text-purple-200 hover:text-white'
              }`}
            >
              8 thẻ (Dễ)
            </button>
            <button
              onClick={() => setDifficulty(6)}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                difficulty === 6 ? 'bg-purple-600 text-white' : 'text-purple-200 hover:text-white'
              }`}
            >
              12 thẻ (Vừa)
            </button>
            <button
              onClick={() => setDifficulty(8)}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                difficulty === 8 ? 'bg-purple-600 text-white' : 'text-purple-200 hover:text-white'
              }`}
            >
              16 thẻ (Khó)
            </button>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-purple-300 cursor-pointer"
            title="Bật/Tắt âm thanh"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Reset */}
          <button
            onClick={() => initGame(difficulty)}
            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Chơi ván mới</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* STATUS BAR: TIME, MOVES & MATCHED PROGRESS                          */}
      {/* ------------------------------------------------------------------- */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-white rounded-2xl border border-slate-200 text-center shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Thời Gian</span>
          <span className="text-xl sm:text-2xl font-black text-[#073B66]">{formattedTime}</span>
        </div>

        <div className="p-3 bg-white rounded-2xl border border-slate-200 text-center shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Số Lượt Lật</span>
          <span className="text-xl sm:text-2xl font-black text-purple-700">{movesCount}</span>
        </div>

        <div className="p-3 bg-white rounded-2xl border border-slate-200 text-center shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Đã Ghép Đôi</span>
          <span className="text-xl sm:text-2xl font-black text-emerald-600">
            {matchedPairIds.length} / {difficulty}
          </span>
        </div>
      </div>

      {previewAllTime > 0 && (
        <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-xl text-center text-xs font-bold text-amber-900 animate-pulse">
          👀 Hãy ghi nhớ nhanh vị trí các thẻ trước khi bắt đầu ({previewAllTime}s)...
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 3D CARDS GRID                                                       */}
      {/* ------------------------------------------------------------------- */}
      <div
        className={`grid gap-3 sm:gap-4 ${
          difficulty === 4
            ? 'grid-cols-2 sm:grid-cols-4'
            : difficulty === 6
            ? 'grid-cols-3 sm:grid-cols-4'
            : 'grid-cols-4 sm:grid-cols-4'
        }`}
      >
        {cards.map((card) => {
          const isFaceUp = card.isFlipped || card.isMatched || previewAllTime > 0;
          const isLeft = card.side === 'left';

          return (
            <div
              key={card.id}
              onClick={() => handleCardClick(card)}
              className="h-28 sm:h-36 perspective-[1000px] cursor-pointer select-none group"
            >
              <div
                className={`relative w-full h-full rounded-2xl border-2 transition-transform duration-500 [transform-style:preserve-3d] shadow-sm hover:shadow-md ${
                  isFaceUp ? '[transform:rotateY(180deg)]' : ''
                } ${
                  card.isMatched
                    ? 'border-emerald-500 ring-2 ring-emerald-300/60'
                    : 'border-slate-200 hover:border-purple-400'
                }`}
              >
                {/* BACK OF CARD (FACE DOWN) */}
                <div className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br from-[#073B66] via-indigo-900 to-purple-900 text-white flex flex-col items-center justify-center p-3 [backface-visibility:hidden] shadow-inner border border-white/20">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-amber-300 font-serif font-black text-lg group-hover:scale-110 transition-transform">
                    ★
                  </div>
                  <span className="text-[10px] font-bold text-purple-200 uppercase tracking-widest mt-2">
                    LỊCH SỬ 12
                  </span>
                </div>

                {/* FRONT OF CARD (FACE UP) */}
                <div
                  className={`absolute inset-0 w-full h-full rounded-2xl p-3 flex flex-col justify-between [backface-visibility:hidden] [transform:rotateY(180deg)] ${
                    card.isMatched
                      ? 'bg-emerald-50 border-emerald-400'
                      : isLeft
                      ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300'
                      : 'bg-gradient-to-br from-sky-50 to-indigo-50 border-sky-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        isLeft ? 'bg-amber-200 text-amber-900' : 'bg-sky-200 text-sky-900'
                      }`}
                    >
                      {isLeft ? 'MỐC / NHÂN VẬT' : 'SỰ KIỆN / Ý NGHĨA'}
                    </span>
                    {card.isMatched && (
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                  </div>

                  <div className="flex-1 flex items-center justify-center text-center px-1">
                    <p
                      className={`font-serif leading-tight font-bold ${
                        isLeft
                          ? 'text-sm sm:text-base text-amber-950 font-black'
                          : 'text-xs sm:text-sm text-slate-800'
                      }`}
                    >
                      {card.text}
                    </p>
                  </div>

                  <div className="text-[9px] text-slate-400 text-center truncate">
                    {card.category}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* VICTORY MODAL & REVIEW                                              */}
      {/* ------------------------------------------------------------------- */}
      {isVictory && (
        <div className="p-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white rounded-3xl shadow-xl space-y-4 animate-in zoom-in-95 duration-300">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-300 text-slate-900 flex items-center justify-center text-3xl shadow-lg">
                🏆
              </div>
              <div>
                <h4 className="text-xl sm:text-2xl font-black">
                  Xuất Sắc! Đã Hoàn Thành Toàn Bộ {difficulty} Cặp Thẻ!
                </h4>
                <p className="text-xs sm:text-sm text-emerald-100">
                  Thời gian: <strong>{formattedTime}</strong> • Tổng số lượt lật: <strong>{movesCount}</strong> lượt
                </p>
              </div>
            </div>

            <button
              onClick={() => initGame(difficulty)}
              className="px-6 py-3 bg-white hover:bg-emerald-50 text-emerald-900 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg hover:shadow-xl transition-all cursor-pointer shrink-0"
            >
              Chơi Lại Ván Khác
            </button>
          </div>

          {/* Quick Review of Matched Historical Events */}
          <div className="pt-3 border-t border-white/20">
            <h5 className="font-bold text-xs uppercase text-amber-200 mb-2">
              Bảng Tổng Hợp Kiến Thức Vừa Ghép Đôi:
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {DEFAULT_MEMORY_PAIRS.slice(0, difficulty).map((pair) => (
                <div key={pair.id} className="p-2.5 rounded-xl bg-white/10 border border-white/15 space-y-0.5">
                  <div className="font-bold text-amber-200 flex items-center gap-1.5">
                    <span>{pair.left}</span>
                    <span>➔</span>
                    <span className="text-white">{pair.right}</span>
                  </div>
                  <p className="text-[11px] text-emerald-100 font-serif italic">
                    {pair.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
