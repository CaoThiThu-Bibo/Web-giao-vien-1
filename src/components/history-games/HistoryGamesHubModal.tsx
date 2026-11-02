// ============================================================================
// MASTER MODAL: KHÔNG GIAN TRÒ CHƠI LỊCH SỬ TƯƠNG TÁC
// Trung tâm GDNN – GDTX Tiên Yên • Cô Cao Thị Thu
// ============================================================================

import React, { useState, useRef } from 'react';
import { HistoryGameType, GamePlayMode } from '../../types/gameTypes';
import { SpinWheelGame } from './SpinWheelGame';
import { GoldenBellGame } from './GoldenBellGame';
import { TimelineOrderGame } from './TimelineOrderGame';
import { CustomGameDataEditor } from './CustomGameDataEditor';
import { Question } from '../../types';
import {
  X,
  Maximize,
  Minimize,
  Volume2,
  VolumeX,
  Sparkles,
  Award,
  Users,
  User,
  Layers,
  Settings,
  HelpCircle,
} from 'lucide-react';

interface HistoryGamesHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  bankQuestions?: Question[];
}

export const HistoryGamesHubModal: React.FC<HistoryGamesHubModalProps> = ({
  isOpen,
  onClose,
  bankQuestions = [],
}) => {
  const [activeGame, setActiveGame] = useState<HistoryGameType | 'editor'>('spin-wheel');
  const [playMode, setPlayMode] = useState<GamePlayMode>('classroom');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  if (!isOpen) return null;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col bg-slate-950/80 backdrop-blur-md overflow-hidden font-sans"
    >
      <div className="flex-1 flex flex-col max-w-6xl w-full mx-auto my-auto max-h-[96vh] bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        {/* ----------------------------------------------------------------- */}
        {/* TOP HEADER: BRANDING, CONTROLS & PROJECTOR MODE                   */}
        {/* ----------------------------------------------------------------- */}
        <header className="px-5 py-3.5 bg-gradient-to-r from-[#073B66] via-[#0878C9] to-teal-700 text-white flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center font-black text-xl shadow-md shrink-0">
              🎮
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-white/20 text-white">
                  GDTX Tiên Yên
                </span>
                <span className="text-xs text-sky-200 font-medium hidden sm:inline">
                  Giáo viên: <strong>Cô Cao Thị Thu</strong>
                </span>
              </div>
              <h2 className="font-bold text-base sm:text-lg tracking-tight">
                Không Gian Trò Chơi Lịch Sử Tương Tác
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Classroom Mode Toggle */}
            <button
              onClick={() => setPlayMode(playMode === 'classroom' ? 'solo' : 'classroom')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                playMode === 'classroom'
                  ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              title="Chuyển đổi giữa chế độ thi đấu trên lớp và luyện cá nhân"
            >
              {playMode === 'classroom' ? <Users className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
              <span>{playMode === 'classroom' ? 'Chiếu Lớp Học (2 Đội)' : 'Luyện Cá Nhân'}</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                soundEnabled ? 'bg-white/20 text-amber-300' : 'bg-rose-500/30 text-rose-200'
              }`}
              title="Bật/Tắt âm thanh"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white cursor-pointer transition-colors"
              title="Toàn màn hình trình chiếu"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 bg-white/10 hover:bg-rose-600 rounded-xl text-white cursor-pointer transition-colors"
              title="Đóng trò chơi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* ----------------------------------------------------------------- */}
        {/* NAVIGATION TABS: 3 GAMES + DATA MANAGER                           */}
        {/* ----------------------------------------------------------------- */}
        <div className="px-5 py-2.5 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {/* Game 1: Vòng quay */}
            <button
              onClick={() => setActiveGame('spin-wheel')}
              className={`px-4 py-2 rounded-xl font-black text-xs flex items-center gap-2 cursor-pointer transition-all shadow-2xs shrink-0 ${
                activeGame === 'spin-wheel'
                  ? 'bg-[#073B66] text-white ring-2 ring-sky-300'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
              }`}
            >
              <span className="text-sm">🎡</span>
              <span>1. Vòng Quay Lịch Sử</span>
            </button>

            {/* Game 2: Rung chuông vàng */}
            <button
              onClick={() => setActiveGame('golden-bell')}
              className={`px-4 py-2 rounded-xl font-black text-xs flex items-center gap-2 cursor-pointer transition-all shadow-2xs shrink-0 ${
                activeGame === 'golden-bell'
                  ? 'bg-amber-600 text-white ring-2 ring-amber-300'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
              }`}
            >
              <span className="text-sm">🔔</span>
              <span>2. Rung Chuông Vàng</span>
            </button>

            {/* Game 3: Dòng thời gian */}
            <button
              onClick={() => setActiveGame('timeline-order')}
              className={`px-4 py-2 rounded-xl font-black text-xs flex items-center gap-2 cursor-pointer transition-all shadow-2xs shrink-0 ${
                activeGame === 'timeline-order'
                  ? 'bg-teal-700 text-white ring-2 ring-teal-300'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
              }`}
            >
              <span className="text-sm">⏳</span>
              <span>3. Dòng Thời Gian</span>
            </button>
          </div>

          {/* Teacher custom data editor tab */}
          <button
            onClick={() => setActiveGame('editor')}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all shrink-0 ${
              activeGame === 'editor'
                ? 'bg-amber-500 text-slate-950 font-black shadow-xs ring-2 ring-amber-300'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Settings className="w-3.5 h-3.5 text-amber-700" />
            <span>Soạn Thẻ Game & Đồng Bộ Đề</span>
          </button>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* GAME CONTENT CONTAINER                                            */}
        {/* ----------------------------------------------------------------- */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
          <div className="max-w-5xl mx-auto">
            {activeGame === 'spin-wheel' && (
              <SpinWheelGame
                playMode={playMode}
                onTogglePlayMode={() =>
                  setPlayMode(playMode === 'classroom' ? 'solo' : 'classroom')
                }
                bankQuestions={bankQuestions}
                soundEnabled={soundEnabled}
                onToggleSound={() => setSoundEnabled(!soundEnabled)}
              />
            )}

            {activeGame === 'golden-bell' && (
              <GoldenBellGame
                playMode={playMode}
                onTogglePlayMode={() =>
                  setPlayMode(playMode === 'classroom' ? 'solo' : 'classroom')
                }
                bankQuestions={bankQuestions}
                soundEnabled={soundEnabled}
                onToggleSound={() => setSoundEnabled(!soundEnabled)}
              />
            )}

            {activeGame === 'timeline-order' && (
              <TimelineOrderGame
                playMode={playMode}
                onTogglePlayMode={() =>
                  setPlayMode(playMode === 'classroom' ? 'solo' : 'classroom')
                }
                bankQuestions={bankQuestions}
                soundEnabled={soundEnabled}
                onToggleSound={() => setSoundEnabled(!soundEnabled)}
              />
            )}

            {activeGame === 'editor' && (
              <CustomGameDataEditor
                bankQuestions={bankQuestions}
                onSyncFromBank={() => {}}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
