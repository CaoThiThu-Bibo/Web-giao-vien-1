// ============================================================================
// GAME 1: VÒNG QUAY LỊCH SỬ (SPIN THE WHEEL)
// Phân hệ Trò chơi Lịch sử Tương tác - Cô Cao Thị Thu (GDTX Tiên Yên)
// ============================================================================

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  WheelSegment,
  WheelQuestion,
  ClassroomTeamScores,
  GamePlayMode,
} from '../../types/gameTypes';
import {
  DEFAULT_WHEEL_SEGMENTS,
  DEFAULT_WHEEL_QUESTIONS,
  playSoundEffect,
} from '../../data/historyGamesData';
import { Question } from '../../types';
import {
  RotateCcw,
  Sparkles,
  Award,
  Users,
  User,
  Clock,
  CheckCircle,
  XCircle,
  Volume2,
  VolumeX,
  Play,
  HelpCircle,
  Flag,
  ChevronRight,
  Plus,
  Minus,
} from 'lucide-react';

interface SpinWheelGameProps {
  playMode: GamePlayMode;
  onTogglePlayMode: () => void;
  bankQuestions?: Question[];
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const SpinWheelGame: React.FC<SpinWheelGameProps> = ({
  playMode,
  onTogglePlayMode,
  bankQuestions = [],
  soundEnabled,
  onToggleSound,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Segments & Questions State
  const [segments, setSegments] = useState<WheelSegment[]>(DEFAULT_WHEEL_SEGMENTS);
  const [questionsMap, setQuestionsMap] = useState<Record<string, WheelQuestion>>(DEFAULT_WHEEL_QUESTIONS);

  // Wheel Rotation State
  const [currentRotation, setCurrentRotation] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [selectedSegment, setSelectedSegment] = useState<WheelSegment | null>(null);

  // Active Question Popup
  const [activeQuestion, setActiveQuestion] = useState<WheelQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState<boolean>(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(20);
  const [isQuestionTimerRunning, setIsQuestionTimerRunning] = useState<boolean>(false);

  // Team Scores for Classroom Projector Mode
  const [teamScores, setTeamScores] = useState<ClassroomTeamScores>({
    teamRedName: 'Đội Đỏ (Sao Vàng)',
    teamRedScore: 0,
    teamBlueName: 'Đội Xanh (Quyết Thắng)',
    teamBlueScore: 0,
    currentTurn: 'red',
    roundNumber: 1,
  });

  // Solo Mode High Score
  const [soloScore, setSoloScore] = useState<number>(0);
  const [streakCount, setStreakCount] = useState<number>(0);

  // Last sound tick tracker
  const lastSoundTickSegmentRef = useRef<number>(-1);

  // Draw Wheel on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 12;
    const totalSegments = segments.length;
    const arcSize = (2 * Math.PI) / totalSegments;

    ctx.clearRect(0, 0, size, size);

    // Save and rotate canvas
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate((currentRotation * Math.PI) / 180);

    // Draw segment slices
    segments.forEach((seg, i) => {
      const angle = i * arcSize;
      ctx.beginPath();
      ctx.fillStyle = seg.color;
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, angle, angle + arcSize);
      ctx.lineTo(0, 0);
      ctx.fill();

      // Inner divider line
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#FFFFFF';
      ctx.stroke();

      // Text label
      ctx.save();
      ctx.rotate(angle + arcSize / 2);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = seg.textColor || '#FFFFFF';
      ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 4;
      ctx.fillText(seg.label, radius - 20, 0);

      // Points badge
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#FEF08A'; // Pale yellow
      ctx.fillText(`+${seg.points}đ`, radius - 20, 16);
      ctx.restore();
    });

    // Outer wheel border ring
    ctx.restore();
    ctx.beginPath();
    ctx.arc(center, center, radius + 2, 0, 2 * Math.PI);
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#073B66';
    ctx.stroke();

    // Golden rim
    ctx.beginPath();
    ctx.arc(center, center, radius + 6, 0, 2 * Math.PI);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#F59E0B';
    ctx.stroke();

    // Center Hub Knob
    ctx.beginPath();
    ctx.arc(center, center, 28, 0, 2 * Math.PI);
    ctx.fillStyle = '#073B66';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#FDE047';
    ctx.stroke();

    // Center Star Icon
    ctx.fillStyle = '#FDE047';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('★', center, center);
  }, [currentRotation, segments]);

  // Spin Wheel Physics Animation
  const handleSpinWheel = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setSelectedSegment(null);
    setActiveQuestion(null);
    setIsAnswerRevealed(false);
    setSelectedOption(null);

    // Random rotations: between 5 and 9 full turns + random angle
    const additionalDegrees = Math.floor(1800 + Math.random() * 1440);
    const startAngle = currentRotation;
    const targetAngle = startAngle + additionalDegrees;
    const durationMs = 4500;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / durationMs, 1);

      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const angle = startAngle + (targetAngle - startAngle) * ease;
      setCurrentRotation(angle);

      // Sound Tick calculation (plays when needle passes a segment divider)
      const normalizedAngle = angle % 360;
      const totalSeg = segments.length;
      const segmentArc = 360 / totalSeg;
      const currentSegIndex = Math.floor(normalizedAngle / segmentArc);

      if (currentSegIndex !== lastSoundTickSegmentRef.current && soundEnabled) {
        playSoundEffect('tick');
        lastSoundTickSegmentRef.current = currentSegIndex;
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        // Identify winning segment at pointer (pointer is at Top: 270 degrees or 90 degrees depending on pointer orientation)
        // Our needle is at Top (270 deg / -90 deg from 0)
        const finalNormalized = (360 - (targetAngle % 360) + 270) % 360;
        const winIndex = Math.floor(finalNormalized / (360 / segments.length)) % segments.length;
        const winSeg = segments[winIndex];
        setSelectedSegment(winSeg);

        // Check if question exists
        if (winSeg.questionId && questionsMap[winSeg.questionId]) {
          const q = questionsMap[winSeg.questionId];
          setTimeout(() => {
            setActiveQuestion(q);
            setSecondsRemaining(q.timeLimitSeconds || 20);
            setIsQuestionTimerRunning(true);
            if (soundEnabled) playSoundEffect('flip');
          }, 600);
        } else if (winSeg.isSpecial === 'lucky') {
          // Lucky free points
          if (soundEnabled) playSoundEffect('victory');
          applyPointsToCurrentTurn(winSeg.points);
        }
      }
    };

    requestAnimationFrame(animate);
  };

  // Question Countdown Timer
  useEffect(() => {
    if (!isQuestionTimerRunning || secondsRemaining <= 0) return;
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          setIsQuestionTimerRunning(false);
          setIsAnswerRevealed(true);
          if (soundEnabled) playSoundEffect('wrong');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isQuestionTimerRunning, secondsRemaining, soundEnabled]);

  // Apply Points helper
  const applyPointsToCurrentTurn = (pts: number) => {
    if (playMode === 'classroom') {
      setTeamScores((prev) => {
        const isRed = prev.currentTurn === 'red';
        return {
          ...prev,
          teamRedScore: isRed ? prev.teamRedScore + pts : prev.teamRedScore,
          teamBlueScore: !isRed ? prev.teamBlueScore + pts : prev.teamBlueScore,
          currentTurn: isRed ? 'blue' : 'red',
          roundNumber: prev.roundNumber + 1,
        };
      });
    } else {
      setSoloScore((prev) => prev + pts);
      setStreakCount((prev) => prev + 1);
    }
  };

  // Option Click Handler
  const handleSelectOption = (letter: string) => {
    if (isAnswerRevealed || !activeQuestion) return;
    setSelectedOption(letter);
    setIsAnswerRevealed(true);
    setIsQuestionTimerRunning(false);

    const isCorrect = letter.toUpperCase() === activeQuestion.correctAnswer.toUpperCase();
    const pts = selectedSegment ? selectedSegment.points : 100;

    if (isCorrect) {
      if (soundEnabled) playSoundEffect('correct');
      applyPointsToCurrentTurn(pts);
    } else {
      if (soundEnabled) playSoundEffect('wrong');
      // Switch turn without points in classroom mode
      if (playMode === 'classroom') {
        setTeamScores((prev) => ({
          ...prev,
          currentTurn: prev.currentTurn === 'red' ? 'blue' : 'red',
        }));
      } else {
        setStreakCount(0);
      }
    }
  };

  // Manual Adjust Team Scores (Teacher classroom convenience)
  const handleAdjustTeamScore = (team: 'red' | 'blue', delta: number) => {
    setTeamScores((prev) => ({
      ...prev,
      teamRedScore: team === 'red' ? Math.max(0, prev.teamRedScore + delta) : prev.teamRedScore,
      teamBlueScore: team === 'blue' ? Math.max(0, prev.teamBlueScore + delta) : prev.teamBlueScore,
    }));
  };

  const handleResetScores = () => {
    if (confirm('Cô có muốn đặt lại bảng điểm thi đua của hai đội về 0 không?')) {
      setTeamScores({
        teamRedName: 'Đội Đỏ (Sao Vàng)',
        teamRedScore: 0,
        teamBlueName: 'Đội Xanh (Quyết Thắng)',
        teamBlueScore: 0,
        currentTurn: 'red',
        roundNumber: 1,
      });
      setSoloScore(0);
      setStreakCount(0);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200 font-sans">
      {/* ------------------------------------------------------------------- */}
      {/* TOP CONTROLS & SCOREBOARD                                           */}
      {/* ------------------------------------------------------------------- */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-gradient-to-r from-slate-900 via-[#073B66] to-slate-900 text-white rounded-3xl shadow-lg border border-sky-500/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md">
            🎡
          </div>
          <div>
            <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
              Vòng Quay Lịch Sử May Mắn
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                {playMode === 'classroom' ? 'Đấu Đội Trên Lớp' : 'Luyện Cá Nhân'}
              </span>
            </h3>
            <p className="text-xs text-sky-200">
              Quay vào mốc sự kiện nào sẽ mở hộp câu hỏi bí mật tương ứng!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              soundEnabled
                ? 'bg-white/10 hover:bg-white/20 text-amber-300 border-white/20'
                : 'bg-rose-500/20 text-rose-300 border-rose-400/30'
            }`}
            title="Bật/Tắt âm thanh hiệu ứng"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{soundEnabled ? 'Âm thanh' : 'Tắt âm'}</span>
          </button>

          {/* Mode Switcher */}
          <button
            onClick={onTogglePlayMode}
            className="px-3.5 py-2 bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 border border-sky-400/30 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            {playMode === 'classroom' ? <Users className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
            <span>{playMode === 'classroom' ? 'Đổi sang Chơi Cá Nhân' : 'Đổi sang Đấu Đội Lớp'}</span>
          </button>

          {/* Reset Score */}
          <button
            onClick={handleResetScores}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs text-slate-300 cursor-pointer"
            title="Đặt lại điểm số"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* CLASSROOM SCOREBOARD (2 TEAMS: RED VS BLUE)                         */}
      {/* ------------------------------------------------------------------- */}
      {playMode === 'classroom' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* TEAM RED */}
          <div
            className={`p-4 rounded-3xl border-2 transition-all flex items-center justify-between shadow-sm ${
              teamScores.currentTurn === 'red'
                ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-300'
                : 'bg-white border-slate-200 opacity-90'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-600 animate-pulse" />
                <h4 className="font-black text-rose-950 text-sm">
                  {teamScores.teamRedName}
                </h4>
                {teamScores.currentTurn === 'red' && (
                  <span className="text-[10px] bg-rose-600 text-white font-black px-2 py-0.5 rounded-full uppercase">
                    Đang đến lượt!
                  </span>
                )}
              </div>
              <div className="text-3xl font-black text-rose-700 tracking-tight">
                {teamScores.teamRedScore} <span className="text-sm font-bold text-slate-500">điểm</span>
              </div>
            </div>

            {/* Quick point adjustment buttons for Teacher */}
            <div className="flex flex-col gap-1 items-end">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleAdjustTeamScore('red', 50)}
                  className="px-2 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-xs font-bold cursor-pointer"
                >
                  +50
                </button>
                <button
                  onClick={() => handleAdjustTeamScore('red', 100)}
                  className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  +100
                </button>
              </div>
              <button
                onClick={() => handleAdjustTeamScore('red', -50)}
                className="px-2 py-0.5 text-[11px] text-slate-400 hover:text-rose-600 cursor-pointer"
              >
                Trừ 50đ
              </button>
            </div>
          </div>

          {/* TEAM BLUE */}
          <div
            className={`p-4 rounded-3xl border-2 transition-all flex items-center justify-between shadow-sm ${
              teamScores.currentTurn === 'blue'
                ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-300'
                : 'bg-white border-slate-200 opacity-90'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-600 animate-pulse" />
                <h4 className="font-black text-blue-950 text-sm">
                  {teamScores.teamBlueName}
                </h4>
                {teamScores.currentTurn === 'blue' && (
                  <span className="text-[10px] bg-blue-600 text-white font-black px-2 py-0.5 rounded-full uppercase">
                    Đang đến lượt!
                  </span>
                )}
              </div>
              <div className="text-3xl font-black text-blue-700 tracking-tight">
                {teamScores.teamBlueScore} <span className="text-sm font-bold text-slate-500">điểm</span>
              </div>
            </div>

            <div className="flex flex-col gap-1 items-end">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleAdjustTeamScore('blue', 50)}
                  className="px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg text-xs font-bold cursor-pointer"
                >
                  +50
                </button>
                <button
                  onClick={() => handleAdjustTeamScore('blue', 100)}
                  className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  +100
                </button>
              </div>
              <button
                onClick={() => handleAdjustTeamScore('blue', -50)}
                className="px-2 py-0.5 text-[11px] text-slate-400 hover:text-blue-600 cursor-pointer"
              >
                Trừ 50đ
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* SOLO STATS */
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-black text-amber-900">
              {soloScore} <span className="text-xs font-bold text-slate-500">Điểm tích lũy</span>
            </div>
            <div className="text-xs text-amber-800 font-bold bg-white px-3 py-1 rounded-full border border-amber-300">
              Chuỗi trả lời đúng: 🔥 {streakCount} câu
            </div>
          </div>
          <span className="text-xs text-slate-500">
            Hãy quay và giải đúng câu hỏi để ghi kỷ lục điểm mới!
          </span>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* MAIN GAME STAGE: WHEEL + CONTROLS                                   */}
      {/* ------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Wheel Canvas Stage */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-sky-50/50 to-indigo-50/30 rounded-3xl border border-sky-100 relative">
          {/* Pointer Needle at Top */}
          <div className="absolute top-3 z-20 flex flex-col items-center">
            <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[28px] border-t-rose-600 drop-shadow-md" />
            <div className="w-3.5 h-3.5 rounded-full bg-amber-400 -mt-1 shadow-md border-2 border-white" />
          </div>

          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            className="w-[300px] h-[300px] sm:w-[380px] sm:h-[380px] drop-shadow-2xl transition-transform"
          />

          {/* Spin CTA Button */}
          <div className="mt-5">
            <button
              onClick={handleSpinWheel}
              disabled={isSpinning || !!activeQuestion}
              className={`px-8 py-3.5 rounded-2xl font-black text-base uppercase tracking-wider flex items-center gap-2.5 shadow-xl transition-all cursor-pointer active:scale-95 ${
                isSpinning || !!activeQuestion
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 hover:from-amber-600 hover:to-red-700 text-white ring-4 ring-amber-300/50 hover:shadow-2xl hover:scale-105'
              }`}
            >
              <Sparkles className="w-5 h-5 text-amber-200" />
              <span>{isSpinning ? 'Đang quay...' : 'QUAY VÒNG QUAY NGAY'}</span>
            </button>
          </div>
        </div>

        {/* Right: Question Box / Active Challenge */}
        <div className="lg:col-span-5">
          {activeQuestion ? (
            <div className="p-6 bg-white rounded-3xl border-2 border-sky-300 shadow-xl space-y-4 animate-in slide-in-from-right duration-300">
              {/* Question Header & Timer */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-sky-100 text-[#073B66]">
                    {activeQuestion.topic}
                  </span>
                  <h4 className="font-bold text-sm text-slate-900 mt-1">
                    Thử Thách: +{selectedSegment?.points || 100} Điểm
                  </h4>
                </div>

                {/* Countdown Dial */}
                <div
                  className={`w-11 h-11 rounded-2xl flex flex-col items-center justify-center font-black text-sm border-2 transition-all ${
                    secondsRemaining <= 5
                      ? 'bg-rose-100 text-rose-700 border-rose-300 animate-pulse'
                      : 'bg-amber-50 text-amber-900 border-amber-300'
                  }`}
                >
                  <span className="text-[9px] font-bold text-slate-400 -mb-0.5 uppercase">Giây</span>
                  <span>{secondsRemaining}</span>
                </div>
              </div>

              {/* Question Content */}
              <p className="font-serif text-slate-900 text-sm sm:text-base font-semibold leading-relaxed">
                {activeQuestion.question}
              </p>

              {/* 4 Options Buttons */}
              <div className="space-y-2 pt-1 font-sans">
                {activeQuestion.options.map((opt, oi) => {
                  const letter = opt.trim().slice(0, 1).toUpperCase();
                  const isCorrect = letter === activeQuestion.correctAnswer.toUpperCase();
                  const isUserPick = selectedOption === letter;

                  let btnStyle = 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800';
                  if (isAnswerRevealed) {
                    if (isCorrect) {
                      btnStyle = 'bg-emerald-100 border-emerald-400 text-emerald-950 font-bold ring-2 ring-emerald-300';
                    } else if (isUserPick && !isCorrect) {
                      btnStyle = 'bg-rose-100 border-rose-400 text-rose-950 font-bold';
                    } else {
                      btnStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={oi}
                      type="button"
                      disabled={isAnswerRevealed}
                      onClick={() => handleSelectOption(letter)}
                      className={`w-full p-3 rounded-2xl border text-xs sm:text-sm text-left transition-all flex items-start gap-2.5 cursor-pointer ${btnStyle}`}
                    >
                      <span className="w-6 h-6 rounded-lg bg-white border border-slate-300 font-black text-xs flex items-center justify-center shrink-0">
                        {letter}
                      </span>
                      <span className="flex-1 leading-snug">{opt.slice(3)}</span>
                      {isAnswerRevealed && isCorrect && (
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      )}
                      {isAnswerRevealed && isUserPick && !isCorrect && (
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation on Answer Reveal */}
              {isAnswerRevealed && (
                <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-950 space-y-1 animate-in fade-in">
                  <div className="font-bold flex items-center gap-1 text-emerald-900">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    Đáp án đúng: {activeQuestion.correctAnswer}
                  </div>
                  <p className="text-slate-600 leading-relaxed font-serif">
                    {activeQuestion.explanation}
                  </p>
                </div>
              )}

              {/* Close / Next Turn Button */}
              {isAnswerRevealed && (
                <button
                  onClick={() => {
                    setActiveQuestion(null);
                    setSelectedOption(null);
                    setIsAnswerRevealed(false);
                  }}
                  className="w-full py-2.5 bg-[#073B66] hover:bg-[#0878C9] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <span>Tiếp tục vòng quay mới</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            /* Idle Instruction Box */
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto text-2xl shadow-xs">
                🎯
              </div>
              <h4 className="font-bold text-slate-800 text-base">
                {selectedSegment
                  ? `Kết quả: ${selectedSegment.label} (+${selectedSegment.points}đ)`
                  : 'Sẵn sàng quay vòng quay'}
              </h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                {playMode === 'classroom'
                  ? `Đang đến lượt quay của ${
                      teamScores.currentTurn === 'red' ? teamScores.teamRedName : teamScores.teamBlueName
                    }. Bấm nút quay để nhận mốc sự kiện!`
                  : 'Bấm nút quay để nhận mốc sự kiện và trả lời câu hỏi lịch sử tương ứng.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
