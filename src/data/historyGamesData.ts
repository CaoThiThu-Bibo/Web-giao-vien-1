// ============================================================================
// HISTORY GAMES DATA & AUDIO ENGINE
// Bộ Dữ Liệu Trò Chơi Lịch Sử GDNN - GDTX Tiên Yên (Cô Cao Thị Thu)
// ============================================================================

import {
  WheelSegment,
  WheelQuestion,
  MemoryPairData,
  TimelineEventItem,
  GoldenBellQuestion,
} from '../types/gameTypes';
import { Question } from '../types';

// ----------------------------------------------------------------------------
// 1. DEFAULT WHEEL SEGMENTS & QUESTIONS
// ----------------------------------------------------------------------------
export const DEFAULT_WHEEL_SEGMENTS: WheelSegment[] = [
  {
    id: 'seg-1',
    label: 'Mốc 1945',
    color: '#E11D48', // Rose
    textColor: '#FFFFFF',
    points: 100,
    questionId: 'wq-1945',
  },
  {
    id: 'seg-2',
    label: 'Cơ Hội Vàng',
    color: '#F59E0B', // Amber
    textColor: '#1E293B',
    points: 200,
    isSpecial: 'double',
    specialLabel: 'x2 Điểm Thưởng!',
    questionId: 'wq-cohoivang',
  },
  {
    id: 'seg-3',
    label: 'Mốc 1954',
    color: '#0878C9', // Sky Blue
    textColor: '#FFFFFF',
    points: 100,
    questionId: 'wq-1954',
  },
  {
    id: 'seg-4',
    label: 'Hội Nghị Ianta',
    color: '#8B5CF6', // Purple
    textColor: '#FFFFFF',
    points: 150,
    questionId: 'wq-ianta',
  },
  {
    id: 'seg-5',
    label: 'Hộp Quà May Mắn',
    color: '#10B981', // Emerald
    textColor: '#FFFFFF',
    points: 300,
    isSpecial: 'lucky',
    specialLabel: '+300đ Miễn Trả Lời!',
  },
  {
    id: 'seg-6',
    label: 'Mốc 1975',
    color: '#D97706', // Gold Amber
    textColor: '#FFFFFF',
    points: 100,
    questionId: 'wq-1975',
  },
  {
    id: 'seg-7',
    label: 'Hiệp Định Paris',
    color: '#0D9488', // Teal
    textColor: '#FFFFFF',
    points: 150,
    questionId: 'wq-paris',
  },
  {
    id: 'seg-8',
    label: 'Thử Thách Nhanh',
    color: '#4F46E5', // Indigo
    textColor: '#FFFFFF',
    points: 250,
    questionId: 'wq-thuthach',
  },
];

export const DEFAULT_WHEEL_QUESTIONS: Record<string, WheelQuestion> = {
  'wq-1945': {
    id: 'wq-1945',
    topic: 'Cách mạng tháng Tám 1945',
    question: 'Sự kiện nào đánh dấu chế độ phong kiến Việt Nam hoàn toàn sụp đổ năm 1945?',
    options: [
      'A. Nhật đảo chính Pháp ngày 9-3-1945',
      'B. Khởi nghĩa thắng lợi ở Hà Nội ngày 19-8-1945',
      'C. Vua Bảo Đại thoái vị và trao ấn kiếm ngày 30-8-1945',
      'D. Bác Hồ đọc Tuyên ngôn Độc lập ngày 2-9-1945',
    ],
    correctAnswer: 'C',
    explanation: 'Ngày 30-8-1945, tại Ngọ Môn (Huế), vua Bảo Đại thoái vị và tuyên bố: "Thà làm dân một nước độc lập hơn làm vua một nước nô lệ", chấm dứt vĩnh viễn chế độ phong kiến Việt Nam.',
    historicalContext: 'Thắng lợi trọn vẹn của Tổng khởi nghĩa tháng Tám.',
  },
  'wq-cohoivang': {
    id: 'wq-cohoivang',
    topic: 'Thời cơ Cách mạng',
    question: '"Thời cơ ngàn năm có một" của Cách mạng tháng Tám năm 1945 tồn tại trong khoảng thời gian nào?',
    options: [
      'A. Từ khi Nhật đảo chính Pháp đến khi Hồng quân Liên Xô đánh Mãn Châu',
      'B. Từ khi Nhật tuyên bố đầu hàng Đồng minh đến trước khi quân Đồng minh vào Đông Dương',
      'C. Từ khi Bác Hồ về nước Pác Bó đến Hội nghị Tân Trào',
      'D. Từ ngày 2-9-1945 đến ngày 6-1-1946',
    ],
    correctAnswer: 'B',
    explanation: 'Thời cơ ngàn năm có một xuất hiện từ ngày 15-8-1945 (Nhật đầu hàng) và kéo dài đến trước khi quân Anh, quân Tưởng đổ bộ vào Đông Dương (đầu tháng 9-1945). Đảng ta đã chớp thời cơ chớp nhoáng giành chính quyền.',
    historicalContext: 'Nghệ thuật chớp thời cơ độc đáo của Chủ tịch Hồ Chí Minh và Đảng ta.',
  },
  'wq-1954': {
    id: 'wq-1954',
    topic: 'Chiến thắng Điện Biên Phủ',
    question: 'Khẩu hiệu nào sau đây gắn liền với ý chí của quân dân ta trong chiến dịch Điện Biên Phủ 1954?',
    options: [
      'A. "Quyết tử để Tổ quốc quyết sinh"',
      'B. "Tất cả cho tiền tuyến, tất cả để chiến thắng!"',
      'C. "Nhằm thẳng quân thù mà bắn!"',
      'D. "Đánh chắc, tiến chắc" sang "Đánh nhanh, thắng nhanh"',
    ],
    correctAnswer: 'B',
    explanation: 'Với tinh thần "Tất cả cho tiền tuyến, tất cả để chiến thắng", toàn dân ta đã huy động hàng chục vạn dân công, xe đạp thồ phục vụ đại thắng Điện Biên Phủ "lừng lẫy năm châu, chấn động địa cầu".',
    historicalContext: 'Điện Biên Phủ là chiến thắng quân sự lớn nhất trong kháng chiến chống Pháp.',
  },
  'wq-ianta': {
    id: 'wq-ianta',
    topic: 'Lịch sử thế giới hiện đại',
    question: 'Hội nghị Ianta (2-1945) có sự tham gia của nguyên thủ 3 cường quốc nào?',
    options: [
      'A. Liên Xô, Mỹ, Anh',
      'B. Liên Xô, Mỹ, Pháp',
      'C. Mỹ, Anh, Trung Quốc',
      'D. Liên Xô, Anh, Pháp',
    ],
    correctAnswer: 'A',
    explanation: 'Hội nghị diễn ra tại thành phố Ianta (Liên Xô) từ ngày 4 đến 11-2-1945 với sự tham gia của I. Xtalin (Liên Xô), Ph. Rudơven (Mỹ) và O. Sớcsin (Anh).',
    historicalContext: 'Khuôn khổ trật tự hai cực Ianta chi phối quan hệ quốc tế thời kỳ Chiến tranh Lạnh.',
  },
  'wq-1975': {
    id: 'wq-1975',
    topic: 'Tổng tiến công và nổi dậy Xuân 1975',
    question: 'Chiến dịch nào đã mở màn cho cuộc Tổng tiến công và nổi dậy mùa Xuân năm 1975?',
    options: [
      'A. Chiến dịch Huế - Đà Nẵng',
      'B. Chiến dịch Tây Nguyên',
      'C. Chiến dịch Đường 14 - Phước Long',
      'D. Chiến dịch Hồ Chí Minh',
    ],
    correctAnswer: 'B',
    explanation: 'Chiến dịch Tây Nguyên (bắt đầu bằng trận đánh then chốt Buôn Ma Thuột ngày 10-3-1975) đã mở màn thắng lợi, chuyển cuộc kháng chiến chống Mỹ từ tiến công chiến lược sang tổng tiến công chiến lược trên toàn miền Nam.',
    historicalContext: 'Đòn điểm huyệt chiến lược làm rung chuyển toàn bộ hệ thống phòng thủ ngụy quyền.',
  },
  'wq-paris': {
    id: 'wq-paris',
    topic: 'Hiệp định Paris 1973',
    question: 'Ý nghĩa quan trọng nhất của Hiệp định Paris (27-1-1973) đối với cách mạng miền Nam là gì?',
    options: [
      'A. Chấm dứt hoàn toàn sự can thiệp của Mỹ ở Đông Dương',
      'B. Buộc Mỹ phải rút hết quân đội về nước, tạo so sánh lực lượng có lợi cho ta',
      'C. Ngụy quyền Sài Gòn tuyên bố đầu hàng vô điều kiện',
      'D. Miền Bắc bắt đầu bước vào thời kỳ quá độ lên CNXH',
    ],
    correctAnswer: 'B',
    explanation: 'Hiệp định Paris đã thực hiện trọn vẹn lời dạy của Bác Hồ: "Đánh cho Mỹ cút", tạo tiền đề quyết định để tiến lên "Đánh cho Ngụy nhào" giải phóng hoàn toàn miền Nam năm 1975.',
    historicalContext: 'Đỉnh cao thắng lợi của mặt trận ngoại giao Việt Nam thời kỳ chống Mỹ.',
  },
  'wq-thuthach': {
    id: 'wq-thuthach',
    topic: 'Thử thách phản xạ Lịch sử',
    question: 'Chiến thắng nào của quân dân ta được coi là "Trận Điện Biên Phủ trên không" năm 1972?',
    options: [
      'A. Đánh bại cuộc hành quân Lam Sơn 719',
      'B. Đánh bại cuộc tập kích chiến lược 12 ngày đêm bằng B-52 vào Hà Nội, Hải Phòng',
      'C. Cuộc tiến công chiến lược Xuân - Hè 1972',
      'D. Trận phục kích tại cầu Ái Nghĩa',
    ],
    correctAnswer: 'B',
    explanation: 'Trận 12 ngày đêm cuối tháng 12-1972 đánh bại cuộc tập kích bằng pháo đài bay B-52 của đế quốc Mỹ vào Hà Nội, Hải Phòng được ví như "Điện Biên Phủ trên không", buộc Mỹ phải ký Hiệp định Paris.',
    historicalContext: 'Ý chí kiên cường và tầm nhìn chiến lược của Bộ Tổng tư lệnh quân đội ta.',
  },
};

// ----------------------------------------------------------------------------
// 2. DEFAULT MEMORY MATCH PAIRS (LẬT THẺ GHI NHỚ)
// ----------------------------------------------------------------------------
export const DEFAULT_MEMORY_PAIRS: MemoryPairData[] = [
  {
    id: 'mp-1',
    left: '1945',
    right: 'Cách mạng tháng Tám thành công, lập nước VNDCCH',
    category: 'Mốc niên đại',
    explanation: 'Ngày 2-9-1945, Chủ tịch Hồ Chí Minh đọc bản Tuyên ngôn Độc lập khai sinh nước Việt Nam Dân chủ Cộng hòa.',
  },
  {
    id: 'mp-2',
    left: '1954',
    right: 'Chiến thắng lịch sử Điện Biên Phủ',
    category: 'Mốc niên đại',
    explanation: 'Chiến thắng ngày 7-5-1954 đập tan hoàn toàn tập đoàn cứ điểm Điện Biên Phủ, buộc Pháp ký Hiệp định Genève.',
  },
  {
    id: 'mp-3',
    left: '1975',
    right: 'Đại thắng mùa Xuân, giải phóng hoàn toàn miền Nam',
    category: 'Mốc niên đại',
    explanation: '11h30 ngày 30-4-1975, lá cờ cách mạng tung bay trên nóc Dinh Độc Lập, non sông thu về một mối.',
  },
  {
    id: 'mp-4',
    left: 'Nguyễn Ái Quốc',
    right: 'Tìm ra con đường cứu nước (1911) & Sáng lập Đảng (1930)',
    category: 'Nhân vật lịch sử',
    explanation: 'Người đã tiếp thu chủ nghĩa Mác - Lênin và truyền bá vào Việt Nam, chuẩn bị chu đáo về tư tưởng và tổ chức.',
  },
  {
    id: 'mp-5',
    left: 'Hội nghị Ianta (1945)',
    right: 'Phân chia khu vực ảnh hưởng giữa các cường quốc Đồng minh',
    category: 'Hội nghị quốc tế',
    explanation: 'Định hình trật tự thế giới hai cực Ianta chi phối toàn cầu trong giai đoạn Chiến tranh Lạnh.',
  },
  {
    id: 'mp-6',
    left: 'Hiệp định Genève (1954)',
    right: 'Công nhận độc lập, chủ quyền, thống nhất của 3 nước Đông Dương',
    category: 'Văn kiện ngoại giao',
    explanation: 'Pháp rút quân, lấy vĩ tuyến 17 làm giới tuyến quân sự tạm thời trước khi tổng tuyển cử.',
  },
  {
    id: 'mp-7',
    left: 'Phong trào Đồng Khởi (1960)',
    right: 'Bến Tre khởi xướng, chuyển cách mạng miền Nam sang thế tiến công',
    category: 'Phong trào quần chúng',
    explanation: 'Làm phá sản chiến lược "chiến tranh đơn phương" của Mỹ - Diệm và dẫn tới sự ra đời của Mặt trận Dân tộc Giải phóng.',
  },
  {
    id: 'mp-8',
    left: 'Hiệp định Paris (1973)',
    right: 'Buộc quân đội Mỹ và đồng minh rút hoàn toàn khỏi miền Nam',
    category: 'Văn kiện ngoại giao',
    explanation: 'Hoàn thành nhiệm vụ "Đánh cho Mỹ cút", tạo so sánh lực lượng có lợi cho ngày đại thắng 1975.',
  },
];

// ----------------------------------------------------------------------------
// 3. DEFAULT TIMELINE EVENT SEQUENCES (DÒNG THỜI GIAN)
// ----------------------------------------------------------------------------
export const DEFAULT_TIMELINE_SEQUENCES: {
  id: string;
  title: string;
  period: string;
  events: TimelineEventItem[];
}[] = [
  {
    id: 'seq-khang-chien-phap',
    title: 'Tiến Trình Cuộc Kháng Chiến Chống Thực Dân Pháp (1945 - 1954)',
    period: '1945 - 1954',
    events: [
      {
        id: 'ev-1',
        year: '1945',
        dateStr: '02-09-1945',
        title: 'Tuyên ngôn Độc lập',
        description: 'Bác Hồ đọc Tuyên ngôn Độc lập tại Quảng trường Ba Đình khai sinh nước Việt Nam Dân chủ Cộng hòa.',
        significance: 'Mở ra kỷ nguyên độc lập tự do cho dân tộc.',
        category: 'CachMangThangTam',
        orderIndex: 1,
      },
      {
        id: 'ev-2',
        year: '1946',
        dateStr: '19-12-1946',
        title: 'Toàn quốc kháng chiến bùng nổ',
        description: 'Chủ tịch Hồ Chí Minh ra Lời kêu gọi Toàn quốc kháng chiến: "Chúng ta thà hy sinh tất cả chứ nhất định không chịu mất nước...".',
        significance: 'Khởi đầu cuộc kháng chiến trường kỳ chống thực dân Pháp.',
        category: 'KhangChienChongPhap',
        orderIndex: 2,
      },
      {
        id: 'ev-3',
        year: '1947',
        dateStr: 'Thu - Đông 1947',
        title: 'Chiến dịch Việt Bắc Thu - Đông',
        description: 'Quân dân ta đập tan cuộc hành quân bao vây căn cứ địa Việt Bắc của thực dân Pháp.',
        significance: 'Làm thất bại chiến lược "đánh nhanh thắng nhanh", buộc Pháp chuyển sang đánh lâu dài.',
        category: 'KhangChienChongPhap',
        orderIndex: 3,
      },
      {
        id: 'ev-4',
        year: '1950',
        dateStr: 'Thu - Đông 1950',
        title: 'Chiến dịch Biên giới Thu - Đông',
        description: 'Chiến dịch tiến công lớn đầu tiên do ta chủ động mở, khai thông biên giới Việt - Trung.',
        significance: 'Giành quyền chủ động chiến lược trên chiến trường chính Bắc Bộ.',
        category: 'KhangChienChongPhap',
        orderIndex: 4,
      },
      {
        id: 'ev-5',
        year: '1953',
        dateStr: '12-1953',
        title: 'Kế hoạch Nava & Cuộc tiến công Đông - Xuân 1953 - 1954',
        description: 'Ta chủ động phân tán lực lượng địch ra 5 nơi: Điện Biên Phủ, Seno, Luông Pha-băng, Plâyku.',
        significance: 'Bước đầu làm phá sản Kế hoạch Nava của Pháp - Mỹ.',
        category: 'KhangChienChongPhap',
        orderIndex: 5,
      },
      {
        id: 'ev-6',
        year: '1954',
        dateStr: '07-05-1954',
        title: 'Đại thắng Điện Biên Phủ',
        description: 'Sau 56 ngày đêm "khoét núi, ngủ hầm, mưa dầm, cơm vắt", tướng Đờ Cát cùng toàn bộ bộ tham mưu Pháp đầu hàng.',
        significance: 'Lừng lẫy năm châu, chấn động địa cầu, buộc Pháp ký Hiệp định Genève.',
        category: 'KhangChienChongPhap',
        orderIndex: 6,
      },
    ],
  },
  {
    id: 'seq-khang-chien-my',
    title: 'Tiến Trình Cuộc Kháng Chiến Chống Mỹ Cứu Nước (1954 - 1975)',
    period: '1954 - 1975',
    events: [
      {
        id: 'ev-m1',
        year: '1960',
        dateStr: '1959 - 1960',
        title: 'Phong trào Đồng Khởi',
        description: 'Bùng nổ mạnh mẽ tại Định Thủy, Phước Hiệp, Bình Khánh (Mỏ Cày, Bến Tre) rồi lan rộng khắp Nam Bộ.',
        significance: 'Chuyển cách mạng miền Nam từ thế giữ gìn lực lượng sang thế tiến công.',
        category: 'KhangChienChongMy',
        orderIndex: 1,
      },
      {
        id: 'ev-m2',
        year: '1963',
        dateStr: '02-01-1963',
        title: 'Chiến thắng Ấp Bắc',
        description: 'Chiến thắng mở đầu đánh bại chiến thuật "trực thăng vận" và "thiết xa vận" của Mỹ.',
        significance: 'Báo hiệu sự phá sản của chiến lược "Chiến tranh đặc biệt".',
        category: 'KhangChienChongMy',
        orderIndex: 2,
      },
      {
        id: 'ev-m3',
        year: '1968',
        dateStr: 'Xuân Mậu Thân 1968',
        title: 'Tổng tiến công và nổi dậy Mậu Thân',
        description: 'Tiến công đồng loạt vào các cơ quan đầu não của Mỹ và ngụy quyền ở 37 thị xã, 4 thành phố lớn.',
        significance: 'Làm phá sản "Chiến tranh cục bộ", buộc Mỹ xuống thang và ngồi vào bàn đàm phán Paris.',
        category: 'KhangChienChongMy',
        orderIndex: 3,
      },
      {
        id: 'ev-m4',
        year: '1972',
        dateStr: '12-1972',
        title: 'Điện Biên Phủ trên không',
        description: 'Quân dân miền Bắc bắn rơi 81 máy bay (trong đó có 34 pháo đài bay B-52) trong 12 ngày đêm.',
        significance: 'Đập tan cuộc tập kích chiến lược của Mỹ, buộc Mỹ ký Hiệp định Paris.',
        category: 'KhangChienChongMy',
        orderIndex: 4,
      },
      {
        id: 'ev-m5',
        year: '1973',
        dateStr: '27-01-1973',
        title: 'Ký kết Hiệp định Paris',
        description: 'Hoa Kỳ cam kết tôn trọng độc lập, chủ quyền, thống nhất và toàn vẹn lãnh thổ của Việt Nam.',
        significance: 'Hoàn thành mục tiêu "Đánh cho Mỹ cút", tạo so sánh lực lượng quyết định.',
        category: 'KhangChienChongMy',
        orderIndex: 5,
      },
      {
        id: 'ev-m6',
        year: '1975',
        dateStr: '30-04-1975',
        title: 'Chiến dịch Hồ Chí Minh toàn thắng',
        description: 'Chiến dịch quyết chiến chiến lược cuối cùng giải phóng hoàn toàn Sài Gòn - Gia Định.',
        significance: 'Kết thúc thắng lợi 21 năm kháng chiến chống Mỹ, thống nhất giang sơn.',
        category: 'KhangChienChongMy',
        orderIndex: 6,
      },
    ],
  },
];

// ----------------------------------------------------------------------------
// 4. WEB AUDIO SYNTHESIZER (ZERO EXTERNAL ASSETS, 100% OFFLINE RELIABILITY)
// ----------------------------------------------------------------------------
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export const playSoundEffect = (
  type: 'tick' | 'flip' | 'correct' | 'wrong' | 'victory' | 'double' | 'bell' | 'spin'
): void => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    if (type === 'spin') {
      // Magic shimmer / spin effect
      [440, 554.37, 659.25, 880].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);
        gain.gain.setValueAtTime(0.15, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.15);
      });
    } else if (type === 'tick') {
      // Wood click / gear tick sound for spinning wheel
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(480, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.04);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    } else if (type === 'flip') {
      // Swoosh sound for card flip
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(250, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.08);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'correct') {
      // Cheerful chime (Do - Mi - Sol arpeggio)
      [523.25, 659.25, 783.99].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.2, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.25);
      });
    } else if (type === 'wrong') {
      // Low buzz for wrong guess
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.setValueAtTime(140, now + 0.1);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'double' || type === 'victory') {
      // Trumpet victory fanfare (C - E - G - High C)
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);
        gain.gain.setValueAtTime(0.25, now + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.35);
      });
    } else if (type === 'bell') {
      // Resonant Golden Bell chime sound
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(880, now);
      osc2.frequency.setValueAtTime(1760, now);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 1.5);
      osc2.stop(now + 1.5);
    }
  } catch (err) {
    // Audio context may be restricted by autoplay policy
  }
};

// ----------------------------------------------------------------------------
// 5. HELPER: CONVERT QUESTION BANK QUESTIONS INTO GAME FORMAT
// ----------------------------------------------------------------------------
export const convertQuestionsToWheelQuestions = (
  questions: Question[]
): Record<string, WheelQuestion> => {
  const map: Record<string, WheelQuestion> = {};
  const singleQuestions = questions.filter(
    (q) => (q.type === 'Trắc nghiệm đơn' || q.type === 'Trắc nghiệm') && q.options && q.options.length >= 4
  );

  singleQuestions.forEach((q, idx) => {
    map[q.id || `bank-wq-${idx}`] = {
      id: q.id || `bank-wq-${idx}`,
      topic: q.topic || 'Kiến thức cốt lõi',
      question: q.content,
      options: q.options || [],
      correctAnswer: q.correctAnswer || 'A',
      explanation: q.explanation || 'Căn cứ vào SGK Lịch sử GDPT 2018.',
      historicalContext: q.lesson,
    };
  });

  return map;
};

export const convertMatchingQuestionsToMemoryPairs = (
  questions: Question[]
): MemoryPairData[] => {
  const result: MemoryPairData[] = [];
  const matchQuestions = questions.filter(
    (q) => q.type === 'Nối từ' && q.matchingPairs && q.matchingPairs.length > 0
  );

  matchQuestions.forEach((q) => {
    q.matchingPairs?.forEach((pair) => {
      const cleanLeft = pair.left.replace(/^[0-9]+\.\s*/, '').trim();
      const cleanRight = pair.right.replace(/^[A-Z]\.\s*/, '').trim();
      if (cleanLeft && cleanRight) {
        result.push({
          id: `mp-${pair.id}-${Date.now()}`,
          left: cleanLeft,
          right: cleanRight,
          category: q.topic || 'Nối cặp sự kiện',
          explanation: q.explanation || `Cặp ghép đúng: ${cleanLeft} - ${cleanRight}`,
        });
      }
    });
  });

  return result;
};

// ----------------------------------------------------------------------------
// 6. DEFAULT GOLDEN BELL ARENA QUESTIONS (10 TIERS - CHUẨN KIẾN THỨC BỘ GD&ĐT)
// ----------------------------------------------------------------------------
export const DEFAULT_GOLDEN_BELL_QUESTIONS: GoldenBellQuestion[] = [
  {
    id: 'gb-q1',
    level: 1,
    tierName: 'Khởi Động',
    topic: 'Cách mạng tháng Tám 1945',
    question: 'Ngày 2 tháng 9 năm 1945, Chủ tịch Hồ Chí Minh thay mặt Chính phủ lâm thời đọc bản Tuyên ngôn Độc lập tại địa điểm lịch sử nào?',
    options: [
      'A. Quảng trường Ba Đình (Hà Nội)',
      'B. Nhà hát Lớn Hà Nội',
      'C. Cột cờ Hà Nội',
      'D. Phủ Chủ tịch',
    ],
    correctAnswer: 'A',
    explanation: 'Ngày 2-9-1945, tại Quảng trường Ba Đình (Hà Nội), Chủ tịch Hồ Chí Minh đọc bản Tuyên ngôn Độc lập khai sinh ra nước Việt Nam Dân chủ Cộng hòa.',
    hintText: 'Nơi diễn ra các sự kiện chính trị trọng đại nhất của Thủ đô Hà Nội.',
    points: 50,
  },
  {
    id: 'gb-q2',
    level: 2,
    tierName: 'Khởi Động',
    topic: 'Lịch sử thế giới hiện đại',
    question: 'Hội nghị Ianta (tháng 2-1945) có sự tham gia của nguyên thủ ba cường quốc trụ cột nào thuộc phe Đồng minh?',
    options: [
      'A. Liên Xô, Mỹ, Anh',
      'B. Mỹ, Anh, Pháp',
      'C. Liên Xô, Trung Quốc, Mỹ',
      'D. Liên Xô, Pháp, Đức',
    ],
    correctAnswer: 'A',
    explanation: 'Hội nghị Ianta (tháng 2-1945) họp tại Liên Xô với sự tham gia của Xtalin (Liên Xô), Rudơven (Mỹ) và Sớcsin (Anh).',
    hintText: 'Ba cường quốc giữ vai trò quyết định tiêu diệt chủ nghĩa phát xít.',
    points: 100,
  },
  {
    id: 'gb-q3',
    level: 3,
    tierName: 'Khởi Động',
    topic: 'Hành trình cứu nước của Nguyễn Ái Quốc',
    question: 'Nguyễn Ái Quốc ra đi tìm con đường cứu nước giải phóng dân tộc vào ngày tháng năm nào và xuất phát từ đâu?',
    options: [
      'A. Ngày 5-6-1911 từ bến Nhà Rồng (Sài Gòn)',
      'B. Ngày 19-5-1890 từ Nam Đàn (Nghệ An)',
      'C. Ngày 3-2-1930 từ Hương Cảng (Trung Quốc)',
      'D. Ngày 28-1-1941 từ Pác Bó (Cao Bằng)',
    ],
    correctAnswer: 'A',
    explanation: 'Ngày 5-6-1911, người thanh niên yêu nước Nguyễn Tất Thành lấy tên Văn Ba ra đi tìm đường cứu nước từ bến cảng Nhà Rồng trên tàu Đô đốc Latouche-Tréville.',
    hintText: 'Người thanh niên Văn Ba lên tàu Amiral Latouche-Tréville xuất phát từ miền Nam.',
    points: 150,
  },
  {
    id: 'gb-q4',
    level: 4,
    tierName: 'Vượt Chướng Ngại Vật',
    topic: 'Kháng chiến chống thực dân Pháp (1945 - 1954)',
    question: 'Chiến dịch nào trong cuộc kháng chiến chống Pháp đã giúp quân ta giành được thế chủ động chiến lược trên chiến trường chính Bắc Bộ?',
    options: [
      'A. Chiến dịch Biên giới thu - đông 1950',
      'B. Chiến dịch Việt Bắc thu - đông 1947',
      'C. Chiến dịch Tây Bắc thu - đông 1952',
      'D. Chiến dịch Điện Biên Phủ 1954',
    ],
    correctAnswer: 'A',
    explanation: 'Với thắng lợi của Chiến dịch Biên giới 1950, ta đã đập tan hành lang Đông - Tây của Pháp, khai thông đường liên lạc quốc tế và giành quyền chủ động chiến lược trên chiến trường chính Bắc Bộ.',
    hintText: 'Chiến dịch tiến công lớn đầu tiên do bộ đội chủ lực ta chủ động mở trên tuyến biên giới Việt - Trung.',
    points: 200,
  },
  {
    id: 'gb-q5',
    level: 5,
    tierName: 'Vượt Chướng Ngại Vật',
    topic: 'Chiến dịch Điện Biên Phủ 1954',
    question: 'Trong chiến dịch Điện Biên Phủ 1954, Đại tướng Tổng tư lệnh Võ Nguyên Giáp đã quyết định chuyển phương châm tác chiến lịch sử từ gì sang gì?',
    options: [
      'A. Từ "Đánh nhanh thắng nhanh" sang "Đánh chắc tiến chắc"',
      'B. Từ "Đánh chắc tiến chắc" sang "Đánh nhanh thắng nhanh"',
      'C. Từ "Đánh du kích" sang "Vận động chiến quy mô lớn"',
      'D. Từ "Bao vây cô lập" sang "Tổng công kích chớp nhoáng"',
    ],
    correctAnswer: 'A',
    explanation: 'Đại tướng Võ Nguyên Giáp nhận định tình hình địch đã thay đổi, tập đoàn cứ điểm Điện Biên Phủ được củng cố kiên cố nên đã đưa ra quyết định chuyển sang "Đánh chắc tiến chắc", được coi là quyết định khó khăn nhất trong cuộc đời chỉ huy.',
    hintText: '"Quyết định khó khăn nhất trong cuộc đời chỉ huy quân sự của tôi" - Đại tướng Võ Nguyên Giáp.',
    points: 250,
  },
  {
    id: 'gb-q6',
    level: 6,
    tierName: 'Vượt Chướng Ngại Vật',
    topic: 'Phong trào Đồng khởi (1959 - 1960)',
    question: 'Phong trào "Đồng khởi" (1959 - 1960) mở đầu giòn giã và nổ ra tiêu biểu nhất tại địa phương nào ở miền Nam?',
    options: [
      'A. Mỏ Cày, Định Thủy, Bình Khánh (tỉnh Bến Tre)',
      'B. Trảng Bàng, Bến Cầu (tỉnh Tây Ninh)',
      'C. Củ Chi, Hóc Môn (Gia Định)',
      'D. Bác Ái, Ninh Phước (Ninh Thuận)',
    ],
    correctAnswer: 'A',
    explanation: 'Ngày 17-1-1960, dưới sự lãnh đạo của Tỉnh ủy Bến Tre và đồng chí Nguyễn Thị Định, nhân dân các xã Định Thủy, Phước Hiệp, Bình Khánh (huyện Mỏ Cày) đồng loạt nổi dậy, mở đầu cho cao trào Đồng khởi trên toàn miền Nam.',
    hintText: 'Quê hương xứ dừa và gắn liền với tên tuổi của Đội quân tóc dài.',
    points: 300,
  },
  {
    id: 'gb-q7',
    level: 7,
    tierName: 'Tăng Tốc',
    topic: 'Kháng chiến chống Mỹ cứu nước (1954 - 1975)',
    question: 'Thắng lợi quân sự nào của ta đã làm lung lay ý chí xâm lược của đế quốc Mỹ, buộc Tổng thống Lyndon B. Johnson phải tuyên bố "phi Mỹ hóa" chiến tranh và chấp nhận ngồi vào bàn đàm phán Paris?',
    options: [
      'A. Cuộc Tổng tiến công và nổi dậy Xuân Mậu Thân 1968',
      'B. Chiến thắng Ấp Bắc ngày 2-1-1963',
      'C. Chiến thắng Vạn Tường ngày 18-8-1965',
      'D. Cuộc Tiến công chiến lược năm 1972',
    ],
    correctAnswer: 'A',
    explanation: 'Cuộc Tổng tiến công và nổi dậy Xuân Mậu Thân 1968 giáng đòn bất ngờ vào đầu não chính quyền Mỹ - Sài Gòn, làm đảo lộn chiến lược của Mỹ, buộc Mỹ tuyên bố ngừng ném bom miền Bắc từ vĩ tuyến 20 trở ra và cử đại diện đàm phán tại Paris.',
    hintText: 'Đòn sấm sét đánh vào các cơ quan đầu não đối phương ngay trong đêm Giao thừa.',
    points: 400,
  },
  {
    id: 'gb-q8',
    level: 8,
    tierName: 'Tăng Tốc',
    topic: 'Trận Điện Biên Phủ trên không 1972',
    question: 'Chiến thắng "Điện Biên Phủ trên không" trong 12 ngày đêm cuối năm 1972 của quân dân miền Bắc đã đập tan hoàn toàn cuộc tập kích chiến lược bằng loại máy bay ném bom tối tân nào của không quân Mỹ?',
    options: [
      'A. Pháo đài bay chiến lược B-52',
      'B. Tiêm kích tàng hình F-117',
      'C. Cường kích cánh cụp cánh xòe F-111',
      'D. Trực thăng vũ trang Huey UH-1',
    ],
    correctAnswer: 'A',
    explanation: 'Trong 12 ngày đêm (từ 18 đến 29-12-1972), quân dân miền Bắc bắn rơi 81 máy bay Mỹ, trong đó có 34 siêu pháo đài bay B-52, lập nên kỳ tích "Điện Biên Phủ trên không".',
    hintText: '"Pháo đài bay" - biểu tượng sức mạnh răn đe không lực chiến lược toàn cầu của Hoa Kỳ lúc bấy giờ.',
    points: 500,
  },
  {
    id: 'gb-q9',
    level: 9,
    tierName: 'Tăng Tốc',
    topic: 'Hiệp định Paris năm 1973',
    question: 'Hiệp định Paris về chấm dứt chiến tranh, lập lại hòa bình ở Việt Nam được ký kết chính thức vào ngày nào, tạo thời cơ thuận lợi đưa cách mạng miền Nam tiến lên?',
    options: [
      'A. Ngày 27 tháng 01 năm 1973',
      'B. Ngày 21 tháng 07 năm 1954',
      'C. Ngày 30 tháng 04 năm 1975',
      'D. Ngày 06 tháng 03 năm 1946',
    ],
    correctAnswer: 'A',
    explanation: 'Ngày 27-01-1973, Hiệp định Paris được ký chính thức tại Trung tâm hội nghị quốc tế Kléber (Paris), buộc Mỹ phải rút hết quân đội viễn chinh và quân đồng minh khỏi miền Nam Việt Nam.',
    hintText: 'Sự kiện mở ra thời kỳ "đánh cho Mỹ cút", tạo tiền đề chiến lược quyết định để "đánh cho Ngụy nhào".',
    points: 600,
  },
  {
    id: 'gb-q10',
    level: 10,
    tierName: 'Rung Chuông Vàng',
    topic: 'Đại thắng mùa Xuân 1975',
    question: 'Ngày 14 tháng 4 năm 1975, Bộ Chính trị Trung ương Đảng ta đã quyết định phê chuẩn đổi tên chiến dịch giải phóng Sài Gòn - Gia Định thành chiến dịch mang tên gì?',
    options: [
      'A. Chiến dịch Hồ Chí Minh',
      'B. Chiến dịch Tây Nguyên',
      'C. Chiến dịch Huế - Đà Nẵng',
      'D. Chiến dịch Quyết thắng Nam Bộ',
    ],
    correctAnswer: 'A',
    explanation: 'Thể theo nguyện vọng tha thiết của toàn dân và toàn quân, ngày 14-4-1975, Bộ Chính trị quyết định lấy tên vị lãnh tụ kính yêu đặt tên cho chiến dịch giải phóng Sài Gòn - Gia Định: "Chiến dịch Hồ Chí Minh".',
    hintText: 'Tên người cha già muôn vàn kính yêu của dân tộc Việt Nam.',
    points: 1000,
  },
];

// ----------------------------------------------------------------------------
// 7. SWAP BACKUP QUESTIONS FOR GOLDEN BELL (KHI DÙNG QUYỀN ĐỔI CÂU HỎI)
// ----------------------------------------------------------------------------
export const SWAP_GOLDEN_BELL_QUESTIONS: GoldenBellQuestion[] = [
  {
    id: 'gb-swap-1',
    level: 2,
    tierName: 'Khởi Động',
    topic: 'Thành lập Đảng Cộng sản Việt Nam 1930',
    question: 'Hội nghị thành lập Đảng Cộng sản Việt Nam đầu năm 1930 do đồng chí Nguyễn Ái Quốc chủ trì diễn ra tại địa danh nào?',
    options: [
      'A. Cửu Long (Hương Cảng, Trung Quốc)',
      'B. Quảng Châu (Trung Quốc)',
      'C. Ma Cao (Trung Quốc)',
      'D. Pác Bó (Cao Bằng, Việt Nam)',
    ],
    correctAnswer: 'A',
    explanation: 'Từ ngày 6-1-1930 đến ngày 7-2-1930, Hội nghị hợp nhất ba tổ chức cộng sản họp tại Cửu Long (Hương Cảng, Trung Quốc) do Nguyễn Ái Quốc chủ trì.',
    hintText: 'Khu vực bán đảo Cửu Long thuộc vùng Hương Cảng (Hong Kong).',
    points: 100,
  },
  {
    id: 'gb-swap-2',
    level: 5,
    tierName: 'Vượt Chướng Ngại Vật',
    topic: 'Kế hoạch quân sự của thực dân Pháp',
    question: 'Thắng lợi quân sự nào của quân và dân ta đã làm thất bại hoàn toàn Kế hoạch Nava của thực dân Pháp có sự chi viện tối đa của Mỹ?',
    options: [
      'A. Chiến dịch Điện Biên Phủ năm 1954',
      'B. Chiến dịch Việt Bắc năm 1947',
      'C. Chiến dịch Biên giới năm 1950',
      'D. Chiến dịch Thượng Lào năm 1953',
    ],
    correctAnswer: 'A',
    explanation: 'Chiến dịch Điện Biên Phủ toàn thắng vào chiều ngày 7-5-1954 đã đập tan cứ điểm kiên cố nhất Đông Dương, chôn vùi hoàn toàn Kế hoạch quân sự Nava.',
    hintText: 'Chiến thắng "Lừng lẫy năm châu, chấn động địa cầu".',
    points: 250,
  },
  {
    id: 'gb-swap-3',
    level: 8,
    tierName: 'Tăng Tốc',
    topic: 'Mặt trận ngoại giao chống Mỹ',
    question: 'Trưởng phái đoàn đàm phán của Chính phủ Cách mạng lâm thời Cộng hòa miền Nam Việt Nam tại Hội nghị Paris là ai?',
    options: [
      'A. Bà Nguyễn Thị Bình (Bộ trưởng Ngoại giao)',
      'B. Đồng chí Xuân Thủy (Trưởng đoàn VNDCCH)',
      'C. Đồng chí Lê Đức Thọ (Cố vấn đặc biệt)',
      'D. Đồng chí Nguyễn Duy Trinh (Bộ trưởng Ngoại giao VNDCCH)',
    ],
    correctAnswer: 'A',
    explanation: 'Bà Nguyễn Thị Bình, Bộ trưởng Ngoại giao Chính phủ Cách mạng lâm thời CHMNVN, là người phụ nữ duy nhất đặt bút ký vào bản Hiệp định Paris 1973 lịch sử.',
    hintText: 'Nữ chính khách kiệt xuất của nền ngoại giao cách mạng Việt Nam.',
    points: 500,
  },
  {
    id: 'gb-swap-4',
    level: 10,
    tierName: 'Rung Chuông Vàng',
    topic: 'Khắc ghi mốc toàn thắng 30-4-1975',
    question: 'Lá cờ giải phóng tung bay trên nóc Dinh Độc Lập, đánh dấu thời khắc Chiến dịch Hồ Chí Minh toàn thắng vào lúc mấy giờ ngày 30 tháng 4 năm 1975?',
    options: [
      'A. Đúng 11 giờ 30 phút ngày 30-4-1975',
      'B. Đúng 9 giờ 00 phút ngày 30-4-1975',
      'C. Đúng 12 giờ 00 phút ngày 30-4-1975',
      'D. Đúng 10 giờ 45 phút ngày 30-4-1975',
    ],
    correctAnswer: 'A',
    explanation: 'Vào lúc 11 giờ 30 phút ngày 30-4-1975, lá cờ Mặt trận Dân tộc Giải phóng miền Nam Việt Nam tung bay trên nóc Dinh Độc Lập. Tổng thống Dương Văn Minh tuyên bố đầu hàng không điều kiện.',
    hintText: 'Khoảnh khắc trưa ngày 30-4-1975 khi đài phát thanh phát tin toàn thắng.',
    points: 1000,
  },
];

// Helper to convert questions from bank to Golden Bell questions
export const convertQuestionsToGoldenBell = (
  questions: Question[]
): GoldenBellQuestion[] => {
  const singleQuestions = questions.filter(
    (q) => (q.type === 'Trắc nghiệm đơn' || q.type === 'Trắc nghiệm') && q.options && q.options.length >= 4
  );

  if (singleQuestions.length === 0) return DEFAULT_GOLDEN_BELL_QUESTIONS;

  return singleQuestions.slice(0, 10).map((q, idx) => {
    const level = idx + 1;
    let tierName: GoldenBellQuestion['tierName'] = 'Khởi Động';
    let points = 50 * level;
    if (level <= 3) {
      tierName = 'Khởi Động';
      points = level * 50;
    } else if (level <= 6) {
      tierName = 'Vượt Chướng Ngại Vật';
      points = 150 + (level - 3) * 50;
    } else if (level <= 9) {
      tierName = 'Tăng Tốc';
      points = 300 + (level - 6) * 100;
    } else {
      tierName = 'Rung Chuông Vàng';
      points = 1000;
    }

    return {
      id: q.id || `bank-gb-${level}`,
      level,
      tierName,
      topic: q.topic || 'Kiến thức Lịch sử',
      question: q.content,
      options: q.options || [],
      correctAnswer: (q.correctAnswer as 'A' | 'B' | 'C' | 'D') || 'A',
      explanation: q.explanation || 'Đáp án chính xác theo chương trình Lịch sử GDPT 2018.',
      hintText: q.lesson ? `Tham khảo bài học: ${q.lesson}` : 'Chú ý phân tích ngữ cảnh sự kiện lịch sử.',
      points,
    };
  });
};

