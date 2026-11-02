// ============================================================================
// GAME 2: ĐẤU TRƯỜNG TRI THỨC – RUNG CHUÔNG VÀNG LỊCH SỬ
// Tối ưu trải nghiệm cho Máy tính/Máy chiếu lớp học và Điện thoại thông minh
// Trung tâm GDNN - GDTX Tiên Yên • Giáo viên: Cô Cao Thị Thu
// ============================================================================

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  GamePlayMode,
  GoldenBellQuestion,
  GoldenBellLifelines,
  ClassroomTeamScores,
} from '../../types/gameTypes';
import {
  DEFAULT_GOLDEN_BELL_QUESTIONS,
  SWAP_GOLDEN_BELL_QUESTIONS,
  convertQuestionsToGoldenBell,
  playSoundEffect,
} from '../../data/historyGamesData';
import { Question } from '../../types';
import {
  Bell,
  Sparkles,
  Users,
  User,
  RotateCcw,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Shuffle,
  Eye,
  ChevronRight,
  Flame,
  ArrowRight,
  Trophy,
} from 'lucide-react';

interface GoldenBellGameProps {
  playMode: GamePlayMode;
  onTogglePlayMode: () => void;
  bankQuestions?: Question[];
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const GoldenBellGame: React.FC<GoldenBellGameProps> = ({
  playMode,
  onTogglePlayMode,
  bankQuestions = [],
  soundEnabled,
  onToggleSound,
}) => {
  // Questions list (synced or default)
  const initialQuestions = useMemo(() => {
    if (bankQuestions && bankQuestions.length >= 10) {
      return convertQuestionsToGoldenBell(bankQuestions);
    }
    return DEFAULT_GOLDEN_BELL_QUESTIONS;
  }, [bankQuestions]);

  const [questions, setQuestions] = useState<GoldenBellQuestion[]>(initialQuestions);
  const [currentLevelIndex, setCurrentLevelIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState<boolean>(false);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  // Lifelines
  const [lifelines, setLifelines] = useState<GoldenBellLifelines>({
    fiftyFiftyUsed: false,
    hintUsed: false,
    swapUsed: false,
  });
  const [hiddenOptions, setHiddenOptions] = useState<string[]>([]);
  const [activeHint, setActiveHint] = useState<string | null>(null);

  // Timer: 20s per question
  const [timeLeft, setTimeLeft] = useState<number>(20);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Classroom team scores
  const [teams, setTeams] = useState<ClassroomTeamScores>({
    teamRedName: 'Đội Đỏ (Tiên Yên)',
    teamRedScore: 0,
    teamBlueName: 'Đội Xanh (Học Viên)',
    teamBlueScore: 0,
    currentTurn: 'red',
    roundNumber: 1,
  });

  // Solo score
  const [soloScore, setSoloScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);

  // Victory / Game over state
  const [isWon, setIsWon] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);

  // Reset question set when bank questions update
  useEffect(() => {
    setQuestions(initialQuestions);
  }, [initialQuestions]);

  const currentQ = questions[currentLevelIndex] || questions[0];

  // Timer countdown
  useEffect(() => {
    if (!isTimerRunning || isAnswerRevealed || isWon || isGameOver) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, isAnswerRevealed, isWon, isGameOver, currentLevelIndex]);

  const handleTimeOut = () => {
    setIsAnswerRevealed(true);
    setShowExplanation(true);
    if (soundEnabled) playSoundEffect('wrong');
  };

  // Select an option
  const handleSelectOption = (optLetter: string) => {
    if (isAnswerRevealed || isWon || isGameOver) return;

    setSelectedAnswer(optLetter);
    setIsAnswerRevealed(true);
    setShowExplanation(true);
    setIsTimerRunning(false);

    const isCorrect = optLetter === currentQ.correctAnswer;

    if (isCorrect) {
      if (soundEnabled) {
        if (currentQ.level === 10) {
          playSoundEffect('bell');
        } else {
          playSoundEffect('correct');
        }
      }

      setSoloScore((prev) => prev + currentQ.points);
      setStreak((prev) => prev + 1);

      // Award team score in classroom mode
      if (playMode === 'classroom') {
        setTeams((prev) => {
          if (prev.currentTurn === 'red') {
            return {
              ...prev,
              teamRedScore: prev.teamRedScore + currentQ.points,
            };
          } else {
            return {
              ...prev,
              teamBlueScore: prev.teamBlueScore + currentQ.points,
            };
          }
        });
      }

      // Check if reached Level 10
      if (currentLevelIndex === questions.length - 1) {
        setIsWon(true);
      }
    } else {
      if (soundEnabled) playSoundEffect('wrong');
      setStreak(0);
      if (playMode === 'solo') {
        setIsGameOver(true);
      }
    }
  };

  // Next level
  const handleNextQuestion = () => {
    if (currentLevelIndex < questions.length - 1) {
      setCurrentLevelIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswerRevealed(false);
      setShowExplanation(false);
      setHiddenOptions([]);
      setActiveHint(null);
      setTimeLeft(20);
      setIsTimerRunning(true);

      // In classroom mode, switch turns
      if (playMode === 'classroom') {
        setTeams((prev) => ({
          ...prev,
          currentTurn: prev.currentTurn === 'red' ? 'blue' : 'red',
          roundNumber: prev.roundNumber + 1,
        }));
      }
    }
  };

  // Reset entire arena
  const handleRestart = () => {
    setQuestions(initialQuestions);
    setCurrentLevelIndex(0);
    setSelectedAnswer(null);
    setIsAnswerRevealed(false);
    setShowExplanation(false);
    setHiddenOptions([]);
    setActiveHint(null);
    setTimeLeft(20);
    setIsTimerRunning(true);
    setIsWon(false);
    setIsGameOver(false);
    setSoloScore(0);
    setStreak(0);
    setLifelines({
      fiftyFiftyUsed: false,
      hintUsed: false,
      swapUsed: false,
    });
    setTeams({
      teamRedName: 'Đội Đỏ (Tiên Yên)',
      teamRedScore: 0,
      teamBlueName: 'Đội Xanh (Học Viên)',
      teamBlueScore: 0,
      currentTurn: 'red',
      roundNumber: 1,
    });
  };

  // --------------------------------------------------------------------------
  // LIFELINES (QUYỀN TRỢ GIÚP)
  // --------------------------------------------------------------------------
  const useFiftyFifty = () => {
    if (lifelines.fiftyFiftyUsed || isAnswerRevealed) return;
    const correct = currentQ.correctAnswer;
    const allOptions = ['A', 'B', 'C', 'D'];
    const wrongs = allOptions.filter((opt) => opt !== correct);
    // Shuffle and pick 2 wrongs to eliminate
    const toEliminate = wrongs.sort(() => 0.5 - Math.random()).slice(0, 2);

    setHiddenOptions(toEliminate);
    setLifelines((prev) => ({ ...prev, fiftyFiftyUsed: true }));
    if (soundEnabled) playSoundEffect('spin');
  };

  const useHint = () => {
    if (lifelines.hintUsed || isAnswerRevealed) return;
    setActiveHint(currentQ.hintText);
    setLifelines((prev) => ({ ...prev, hintUsed: true }));
    if (soundEnabled) playSoundEffect('spin');
  };

  const useSwap = () => {
    if (lifelines.swapUsed || isAnswerRevealed) return;
    // Find matching swap question or fallback
    const swapQ =
      SWAP_GOLDEN_BELL_QUESTIONS.find((q) => q.level === currentQ.level) ||
      SWAP_GOLDEN_BELL_QUESTIONS[0];

    const updated = [...questions];
    updated[currentLevelIndex] = {
      ...swapQ,
      level: currentQ.level,
      tierName: currentQ.tierName,
      points: currentQ.points,
    };

    setQuestions(updated);
    setHiddenOptions([]);
    setActiveHint(null);
    setTimeLeft(20);
    setLifelines((prev) => ({ ...prev, swapUsed: true }));
    if (soundEnabled) playSoundEffect('spin');
  };

  // Color theme by tier
  const getTierBadge = (tier: GoldenBellQuestion['tierName']) => {
    switch (tier) {
      case 'Khởi Động':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Vượt Chướng Ngại Vật':
        return 'bg-sky-100 text-sky-800 border-sky-300';
      case 'Tăng Tốc':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Rung Chuông Vàng':
        return 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse';
    }
  };

  return (
    <div className="flex flex-col gap-4 font-sans text-slate-800">
      {/* ----------------------------------------------------------------- */}
      {/* 1. TOP BAR: BANNER & CLASSROOM SCOREBOARD / STATS                 */}
      {/* ----------------------------------------------------------------- */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 rounded-2xl p-4 sm:p-5 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 text-center md:text-left">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shadow-inner shrink-0">
            🔔
          </div>
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-black/25 text-amber-200">
                10 Bậc Thang Lịch Sử
              </span>
              <span className="text-xs text-amber-100 hidden sm:inline">
                Chuẩn Bộ GD&ĐT 2025
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-black tracking-tight">
              Đấu Trường Tri Thức – Rung Chuông Vàng
            </h1>
          </div>
        </div>

        {/* Mode Switch & Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePlayMode}
            className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer transition-all shadow-xs ${
              playMode === 'classroom'
                ? 'bg-white text-slate-900 ring-2 ring-amber-300'
                : 'bg-black/20 hover:bg-black/30 text-white'
            }`}
          >
            {playMode === 'classroom' ? <Users className="w-4 h-4 text-rose-600" /> : <User className="w-4 h-4 text-amber-300" />}
            <span>{playMode === 'classroom' ? 'Đấu 2 Đội Lớp Học' : 'Chơi Tự Luyện'}</span>
          </button>

          <button
            onClick={handleRestart}
            className="p-2 bg-black/20 hover:bg-black/30 rounded-xl text-white cursor-pointer transition-colors"
            title="Bắt đầu lại từ Bậc 1"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={onToggleSound}
            className="p-2 bg-black/20 hover:bg-black/30 rounded-xl text-white cursor-pointer transition-colors"
            title="Bật/Tắt âm thanh"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-200" /> : <VolumeX className="w-4 h-4 text-rose-200" />}
          </button>
        </div>
      </div>

      {/* Classroom Scoreboard (Chiếu Ti-vi) */}
      {playMode === 'classroom' && (
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {/* Team Red */}
          <div
            className={`p-3.5 rounded-2xl border-2 transition-all shadow-xs ${
              teams.currentTurn === 'red'
                ? 'bg-rose-50 border-rose-500 shadow-md ring-2 ring-rose-200'
                : 'bg-white border-slate-200 opacity-80'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping"></span>
                <span className="font-black text-xs sm:text-sm text-rose-950">
                  {teams.teamRedName}
                </span>
              </div>
              {teams.currentTurn === 'red' && (
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-600 text-white">
                  Đang trả lời
                </span>
              )}
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-black text-rose-600">
                {teams.teamRedScore}
              </span>
              <span className="text-xs font-semibold text-rose-800">điểm tích lũy</span>
            </div>
          </div>

          {/* Team Blue */}
          <div
            className={`p-3.5 rounded-2xl border-2 transition-all shadow-xs ${
              teams.currentTurn === 'blue'
                ? 'bg-sky-50 border-sky-500 shadow-md ring-2 ring-sky-200'
                : 'bg-white border-slate-200 opacity-80'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-sky-600 animate-ping"></span>
                <span className="font-black text-xs sm:text-sm text-sky-950">
                  {teams.teamBlueName}
                </span>
              </div>
              {teams.currentTurn === 'blue' && (
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-sky-600 text-white">
                  Đang trả lời
                </span>
              )}
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-black text-sky-600">
                {teams.teamBlueScore}
              </span>
              <span className="text-xs font-semibold text-sky-800">điểm tích lũy</span>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* 2. MAIN BATTLE AREA: QUESTION CARD + PROGRESS LADDER              */}
      {/* ----------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* LEFT / CENTER: THE MAIN ARENA QUESTION CARD (3 cols on desktop) */}
        <div className="lg:col-span-3 flex flex-col gap-3">
          {/* Header of Arena Card: Level, Topic, Timer, Lifelines */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black border ${getTierBadge(
                    currentQ.tierName
                  )}`}
                >
                  BẬC {currentQ.level}/10 • {currentQ.tierName}
                </span>
                <span className="text-xs font-bold text-slate-500 hidden sm:inline">
                  +{currentQ.points} điểm
                </span>
              </div>

              {/* Timer Dial with Pause/Resume */}
              <div className="flex items-center gap-2">
                <div
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-mono font-black text-sm border ${
                    timeLeft <= 5
                      ? 'bg-rose-100 text-rose-700 border-rose-300 animate-pulse'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>{timeLeft < 10 ? `0${timeLeft}` : timeLeft}s</span>
                </div>

                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  disabled={isAnswerRevealed}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 rounded-lg cursor-pointer transition-colors"
                  title={isTimerRunning ? 'Tạm dừng đồng hồ' : 'Tiếp tục đếm ngược'}
                >
                  {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-emerald-600" />}
                </button>
              </div>
            </div>

            {/* Topic label */}
            <div className="text-xs font-bold text-sky-700 uppercase tracking-wide">
              📚 Chủ đề: {currentQ.topic}
            </div>

            {/* Question Text */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-[#073B66] to-[#042847] text-white shadow-inner">
              <p className="text-base sm:text-xl font-bold leading-relaxed">
                {currentQ.question}
              </p>
            </div>

            {/* Active Hint display if used */}
            {activeHint && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs sm:text-sm flex items-start gap-2.5 animate-fadeIn">
                <span className="text-base">📜</span>
                <div>
                  <strong>Gợi ý tư liệu:</strong> {activeHint}
                </div>
              </div>
            )}

            {/* Options List (4 big touch-friendly buttons) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {currentQ.options.map((opt) => {
                const letter = opt.trim().charAt(0);
                const isEliminated = hiddenOptions.includes(letter);
                const isSelected = selectedAnswer === letter;
                const isCorrect = letter === currentQ.correctAnswer;

                let btnStyle =
                  'bg-white border-2 border-slate-200 hover:border-[#0878C9] hover:bg-sky-50 text-slate-800';

                if (isAnswerRevealed) {
                  if (isCorrect) {
                    btnStyle =
                      'bg-emerald-600 border-2 border-emerald-700 text-white shadow-md ring-2 ring-emerald-300 font-bold';
                  } else if (isSelected && !isCorrect) {
                    btnStyle =
                      'bg-rose-600 border-2 border-rose-700 text-white shadow-md ring-2 ring-rose-300 font-bold';
                  } else {
                    btnStyle = 'bg-slate-100 border-slate-200 text-slate-400 opacity-60';
                  }
                } else if (isEliminated) {
                  btnStyle =
                    'bg-slate-100 border-dashed border-slate-200 text-slate-300 pointer-events-none line-through';
                }

                return (
                  <button
                    key={letter}
                    disabled={isAnswerRevealed || isEliminated}
                    onClick={() => handleSelectOption(letter)}
                    className={`min-h-[56px] sm:min-h-[64px] px-4 py-3 rounded-2xl flex items-center gap-3 text-left transition-all cursor-pointer text-sm sm:text-base ${btnStyle}`}
                  >
                    <span
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-2xs ${
                        isAnswerRevealed && isCorrect
                          ? 'bg-white text-emerald-700'
                          : isAnswerRevealed && isSelected && !isCorrect
                          ? 'bg-white text-rose-700'
                          : 'bg-slate-200 text-slate-800'
                      }`}
                    >
                      {letter}
                    </span>
                    <span className="flex-1 leading-snug font-medium">{opt}</span>
                    {isAnswerRevealed && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
                    )}
                    {isAnswerRevealed && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-white shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation card & Next Question action */}
            {showExplanation && (
              <div className="mt-2 p-4 rounded-2xl bg-sky-50 border border-sky-200 flex flex-col gap-3 animate-fadeIn">
                <div className="flex items-start gap-2.5">
                  <span className="text-xl">💡</span>
                  <div className="flex-1">
                    <h4 className="text-xs sm:text-sm font-black text-sky-950 uppercase tracking-wide">
                      Giải thích lịch sử chuẩn xác:
                    </h4>
                    <p className="text-xs sm:text-sm text-sky-900 mt-1 leading-relaxed">
                      {currentQ.explanation}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  {currentLevelIndex < questions.length - 1 ? (
                    <button
                      onClick={handleNextQuestion}
                      className="px-5 py-2.5 bg-gradient-to-r from-[#073B66] to-[#0878C9] hover:from-[#052C4D] hover:to-[#076BB3] text-white rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-md transition-all"
                    >
                      <span>Tiếp tục Bậc {currentLevelIndex + 2}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsWon(true)}
                      className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white rounded-xl font-black text-sm flex items-center gap-2 cursor-pointer shadow-lg animate-bounce"
                    >
                      <Bell className="w-5 h-5" />
                      <span>RUNG CHUÔNG VÀNG CHIẾN THẮNG!</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 3 LIFELINES CONTROLS (TỐI ƯU CẢ MOBILE & PROJECTOR) */}
          <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-black uppercase text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>3 Quyền Trợ Giúp:</span>
            </span>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* 50:50 */}
              <button
                disabled={lifelines.fiftyFiftyUsed || isAnswerRevealed}
                onClick={useFiftyFifty}
                className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                  lifelines.fiftyFiftyUsed
                    ? 'bg-slate-100 text-slate-400 border border-slate-200 line-through cursor-not-allowed'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                }`}
                title="Loại bỏ 2 phương án sai"
              >
                <span>🎯</span>
                <span>50 / 50</span>
              </button>

              {/* Hint */}
              <button
                disabled={lifelines.hintUsed || isAnswerRevealed}
                onClick={useHint}
                className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                  lifelines.hintUsed
                    ? 'bg-slate-100 text-slate-400 border border-slate-200 line-through cursor-not-allowed'
                    : 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100'
                }`}
                title="Xem gợi ý tư liệu SGK"
              >
                <span>📜</span>
                <span>Gợi ý</span>
              </button>

              {/* Swap */}
              <button
                disabled={lifelines.swapUsed || isAnswerRevealed}
                onClick={useSwap}
                className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                  lifelines.swapUsed
                    ? 'bg-slate-100 text-slate-400 border border-slate-200 line-through cursor-not-allowed'
                    : 'bg-purple-50 text-purple-900 border border-purple-300 hover:bg-purple-100'
                }`}
                title="Đổi sang câu hỏi dự phòng"
              >
                <span>🔄</span>
                <span>Đổi câu</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: 10-LEVEL LADDER PROGRESSION (1 col on desktop, compact on mobile) */}
        <div className="lg:col-span-1 bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-2.5">
              <span className="text-xs font-black uppercase text-slate-700 flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Bậc Thang Thử Thách</span>
              </span>
              <span className="text-[11px] font-bold text-slate-400">10 Bậc</span>
            </div>

            {/* List of 10 levels from 10 down to 1 */}
            <div className="flex flex-col gap-1.5">
              {[...questions].reverse().map((q, revIdx) => {
                const actualIndex = questions.length - 1 - revIdx;
                const isCurrent = actualIndex === currentLevelIndex;
                const isPassed = actualIndex < currentLevelIndex;
                const isGoldenBell = q.level === 10;
                const isMilestone = q.level === 3 || q.level === 6 || q.level === 9 || q.level === 10;

                let rowClass = 'bg-slate-50 text-slate-500 border-slate-100';
                if (isCurrent) {
                  rowClass =
                    'bg-amber-400 text-slate-950 font-black border-amber-300 shadow-md ring-2 ring-amber-200 scale-102';
                } else if (isPassed) {
                  rowClass =
                    'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold';
                } else if (isGoldenBell) {
                  rowClass =
                    'bg-gradient-to-r from-rose-500 to-amber-500 text-white font-black border-rose-300';
                } else if (isMilestone) {
                  rowClass = 'bg-sky-50 text-sky-900 font-bold border-sky-200';
                }

                return (
                  <div
                    key={q.id}
                    className={`px-3 py-1.5 rounded-xl border flex items-center justify-between text-xs transition-all ${rowClass}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold w-5">
                        {isPassed ? '✓' : q.level}
                      </span>
                      <span className="truncate max-w-[110px] text-[11px]">
                        {q.level === 10 ? '🔔 CHUÔNG VÀNG' : q.topic}
                      </span>
                    </div>
                    <span className="font-bold text-[11px]">{q.points}đ</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick stats at bottom */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-bold">
            <span className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              <span>Chuỗi: {streak} câu</span>
            </span>
            <span>Tổng: {soloScore}đ</span>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 3. VICTORY / RUNG CHUÔNG VÀNG MODAL                               */}
      {/* ----------------------------------------------------------------- */}
      {isWon && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 text-center shadow-2xl border-4 border-amber-400 animate-scaleUp">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-300 to-orange-500 text-slate-950 flex items-center justify-center text-5xl mx-auto shadow-lg animate-bounce">
              🔔
            </div>
            <h2 className="mt-4 text-2xl sm:text-3xl font-black text-amber-600 tracking-tight">
              RUNG CHUÔNG VÀNG THÀNH CÔNG!
            </h2>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Xuất sắc vượt qua trọn vẹn <strong>10 Bậc Thang Tri Thức Lịch Sử</strong> chuẩn Bộ Giáo dục & Đào tạo.
            </p>

            <div className="my-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-around">
              <div>
                <span className="text-xs text-amber-800 font-bold uppercase">Tổng Điểm</span>
                <div className="text-2xl font-black text-amber-700">{soloScore}đ</div>
              </div>
              <div className="h-8 w-px bg-amber-200"></div>
              <div>
                <span className="text-xs text-amber-800 font-bold uppercase">Chuỗi Đúng</span>
                <div className="text-2xl font-black text-emerald-600">10/10</div>
              </div>
              <div className="h-8 w-px bg-amber-200"></div>
              <div>
                <span className="text-xs text-amber-800 font-bold uppercase">Đơn vị</span>
                <div className="text-xs font-black text-slate-800 mt-1">GDTX Tiên Yên</div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleRestart}
                className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Thi đấu lượt mới</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* 4. GAME OVER (SOLO MODE WRONG ANSWER) MODAL                        */}
      {/* ----------------------------------------------------------------- */}
      {isGameOver && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center shadow-2xl border-2 border-rose-300 animate-scaleUp">
            <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-3xl mx-auto shadow-inner">
              ❌
            </div>
            <h3 className="mt-3 text-xl font-black text-slate-800">
              Dừng bước ở Bậc {currentLevelIndex + 1}!
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-600">
              Bạn đã tích lũy được <strong>{soloScore} điểm</strong>. Hãy ôn lại kiến thức và thử thách lại nhé!
            </p>

            <div className="mt-5 flex gap-2">
              <button
                onClick={handleRestart}
                className="flex-1 py-3 bg-gradient-to-r from-[#073B66] to-[#0878C9] text-white rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Thử Thách Lại Từ Đầu</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
