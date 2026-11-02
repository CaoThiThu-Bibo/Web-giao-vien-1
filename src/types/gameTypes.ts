// ============================================================================
// HISTORY INTERACTIVE GAMES TYPE DEFINITIONS
// Hệ thống Trò chơi Lịch sử Tương tác GDNN - GDTX Tiên Yên (Cô Cao Thị Thu)
// ============================================================================

export type HistoryGameType = 'spin-wheel' | 'golden-bell' | 'timeline-order';

export type GamePlayMode = 'classroom' | 'solo';

// Supporting Memory Card types
export interface MemoryPairData {
  id: string;
  left: string;
  right: string;
  category: string;
  explanation: string;
}

export interface MemoryCardItem {
  id: string;
  pairId: string;
  side: 'left' | 'right';
  text: string;
  category: string;
  isFlipped: boolean;
  isMatched: boolean;
  uid?: string;
  content?: string;
  explanation?: string;
}

// ----------------------------------------------------------------------------
// 1. VÒNG QUAY LỊCH SỬ (SPIN THE WHEEL)
// ----------------------------------------------------------------------------
export interface WheelSegment {
  id: string;
  label: string;
  color: string;
  textColor: string;
  points: number;
  questionId?: string;
  isSpecial?: 'double' | 'lucky' | 'turn-loss' | 'bonus';
  specialLabel?: string;
}

export interface WheelQuestion {
  id: string;
  topic: string;
  question: string;
  options: string[];
  correctAnswer: string; // 'A' | 'B' | 'C' | 'D'
  explanation: string;
  historicalContext?: string;
  timeLimitSeconds?: number;
}

// ----------------------------------------------------------------------------
// 2. ĐẤU TRƯỜNG TRI THỨC - RUNG CHUÔNG VÀNG (GOLDEN BELL ARENA)
// ----------------------------------------------------------------------------
export interface GoldenBellQuestion {
  id: string;
  level: number; // 1 to 10
  tierName: 'Khởi Động' | 'Vượt Chướng Ngại Vật' | 'Tăng Tốc' | 'Rung Chuông Vàng';
  topic: string;
  question: string;
  options: string[];
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  hintText: string;
  points: number;
}

export interface GoldenBellLifelines {
  fiftyFiftyUsed: boolean;
  hintUsed: boolean;
  swapUsed: boolean;
}

// ----------------------------------------------------------------------------
// 3. DÒNG THỜI GIAN LỊCH SỬ (TIMELINE ORDER)
// ----------------------------------------------------------------------------
export interface TimelineEventItem {
  id: string;
  year: number | string;
  dateStr?: string;
  title: string;
  description: string;
  significance: string;
  category: 'KhangChienChongPhap' | 'KhangChienChongMy' | 'CachMangThangTam' | 'LichSuTheGioi' | 'DauTranhDauTheKy20';
  orderIndex: number; // 1, 2, 3, 4, 5...
}

// ----------------------------------------------------------------------------
// CLASSROOM TEAM SCORES (CHẾ ĐỘ LỚP HỌC CHIẾU TI-VI)
// ----------------------------------------------------------------------------
export interface ClassroomTeamScores {
  teamRedName: string;
  teamRedScore: number;
  teamBlueName: string;
  teamBlueScore: number;
  currentTurn: 'red' | 'blue';
  roundNumber: number;
}
