import { EvaluationLevel, Exam, Student } from '../types';

/**
 * THÔNG TƯ 43/2021/TT-BGDĐT
 * Quy định về đánh giá học viên Chương trình Giáo dục thường xuyên cấp THCS và cấp THPT.
 * 
 * Áp dụng đối với môn Lịch sử cấp THPT GDTX (Khối 10, 11, 12):
 * - Định mức thời lượng: 52 tiết/năm học (Khoảng 26 tiết/học kỳ).
 * - Thuộc nhóm môn học có từ trên 35 tiết đến 70 tiết/năm học (Khoản 1 Điều 7):
 *   + Mỗi học kỳ có 03 điểm Đánh giá thường xuyên (ĐĐGtx1, ĐĐGtx2, ĐĐGtx3) - Hệ số 1.
 *   + Mỗi học kỳ có 01 điểm Đánh giá giữa kỳ (ĐĐGgk) - Hệ số 2.
 *   + Mỗi học kỳ có 01 điểm Đánh giá cuối kỳ (ĐĐGck) - Hệ số 3.
 * - Công thức tính Điểm trung bình môn học kỳ (ĐTBmhk):
 *     ĐTBmhk = (ĐĐGtx1 + ĐĐGtx2 + ĐĐGtx3 + 2*ĐĐGgk + 3*ĐĐGck) / 8
 * - Đánh giá kết quả học tập môn học theo 4 mức: Tốt, Khá, Đạt, Chưa đạt (Điều 9 & 12).
 */

// Ngân hàng nhận xét sư phạm môn Lịch sử theo 4 mức chuẩn Thông tư 43/2021/TT-BGDĐT
export const TT43_COMMENTS_BANK: Record<EvaluationLevel, string[]> = {
  'Tốt': [
    'Nắm vững kiến thức lịch sử, tư duy phân tích sự kiện sắc bén, tích cực phát biểu và liên hệ thực tiễn tốt.',
    'Hiểu sâu sắc các giai đoạn lịch sử, có kỹ năng tổng hợp và đánh giá nhân vật, sự kiện rất xuất sắc.',
    'Học tập chủ động, chăm chỉ, bài làm thể hiện tư duy sử học tốt và lập luận chặt chẽ.',
    'Nắm chắc tiến trình lịch sử dân tộc và thế giới, kỹ năng khai thác lược đồ và tư liệu lịch sử rất chuẩn xác.',
    'Có niềm say mê môn Lịch sử, tích cực tham gia xây dựng bài và hỗ trợ các bạn trong học tập.',
    'Khả năng xâu chuỗi sự kiện và phân tích nguyên nhân - kết quả lịch sử rất xuất sắc.',
    'Điểm kiểm tra định kỳ và thường xuyên đạt kết quả cao, bài làm trình bày khoa học và logic.',
  ],
  'Khá': [
    'Nắm chắc kiến thức cơ bản, có ý thức học tập tốt, cần rèn thêm kỹ năng so sánh và xâu chuỗi sự kiện.',
    'Hiểu bài tốt, hoàn thành đầy đủ bài kiểm tra, cần tích cực phát biểu xây dựng bài sôi nổi hơn trên lớp.',
    'Kỹ năng ghi nhớ mốc thời gian và sự kiện tốt, cần nâng cao khả năng phân tích ý nghĩa lịch sử.',
    'Có tinh thần học tập nghiêm túc, điểm số ổn định, cần chủ động hơn trong các bài tập nhóm và dự án môn học.',
    'Bài làm nắm được yêu cầu cơ bản, cần rèn luyện thêm kỹ năng làm câu hỏi tự luận vận dụng.',
    'Có nhiều tiến bộ trong quá trình học, cần duy trì phong độ và ôn luyện thường xuyên hơn.',
    'Ý thức học tập tốt, chuẩn bị bài chu đáo trước khi đến lớp, cần đào sâu bản chất các sự kiện sử học.',
  ],
  'Đạt': [
    'Nắm được các mốc sự kiện chính, cần dành thêm thời gian ôn tập để nhớ chính xác các niên đại lịch sử.',
    'Có cố gắng trong học tập, đã đạt yêu cầu cơ bản môn học, cần tập trung hơn trong giờ nghe giảng.',
    'Cần rèn luyện thêm kỹ năng làm bài trắc nghiệm và đọc hiểu tư liệu để cải thiện điểm số môn Sử.',
    'Đã hoàn thành các bài kiểm tra, cần tích cực trao đổi bài và ghi chép bài đầy đủ hơn.',
    'Hiểu được diễn biến cơ bản của các cuộc kháng chiến, cần lưu ý nguyên nhân thắng lợi và bài học lịch sử.',
    'Cần tự giác hơn trong giờ tự học và hoàn thành bài tập về nhà đúng thời hạn.',
  ],
  'Chưa đạt': [
    'Chưa nắm vững kiến thức trọng tâm, còn nhầm lẫn sự kiện lịch sử, cần giáo viên hỗ trợ ôn tập thêm.',
    'Hổng nhiều kiến thức cơ bản, kết quả các bài kiểm tra chưa đạt yêu cầu, cần chấn chỉnh ý thức học tập.',
    'Cần nỗ lực nhiều hơn, thường xuyên làm lại bài tập và tham gia đầy đủ các buổi phụ đạo môn Sử.',
    'Điểm kiểm tra định kỳ còn thấp, cần có kế hoạch ôn tập nghiêm túc và tập trung hơn trên lớp.',
    'Cần chủ động trao đổi với cô giáo để được hướng dẫn phương pháp ghi nhớ lịch sử theo sơ đồ tư duy.',
    'Còn lơ là trong giờ học, cần chăm chú nghe giảng và hoàn thành bài tập đầy đủ hơn.',
  ],
};

/**
 * Tính điểm trung bình môn học kỳ theo Thông tư 43/2021/TT-BGDĐT
 * Dựa vào 5 cột điểm chuẩn (hoặc danh sách các bài kiểm tra trong học kỳ)
 */
export interface TT43StudentScoreResult {
  tx1?: number;
  tx2?: number;
  tx3?: number;
  gk?: number;
  ck?: number;
  regularCount: number;
  averageScore: number;
  level: EvaluationLevel;
  comment: string;
  hasEnoughScores: boolean;
}

export const calculateTT43Scores = (
  student: Student,
  exams: Exam[],
  fallbackComment?: string
): TT43StudentScoreResult => {
  // Find scores by category or weight/type
  let txScores: number[] = [];
  let gkScore: number | undefined = undefined;
  let ckScore: number | undefined = undefined;

  exams.forEach((ex) => {
    const val = student.scores[ex.id];
    if (typeof val !== 'number') return;

    if (ex.tt43Category === 'TX1' || ex.tt43Category === 'TX2' || ex.tt43Category === 'TX3') {
      txScores.push(val);
    } else if (ex.tt43Category === 'GK' || ex.type === 'Giữa kỳ' || (ex.weight === 2 && !gkScore)) {
      gkScore = val;
    } else if (ex.tt43Category === 'CK' || ex.type === 'Cuối kỳ' || ex.weight === 3) {
      ckScore = val;
    } else if (ex.weight === 1) {
      txScores.push(val);
    } else if (ex.weight === 2 && !gkScore) {
      gkScore = val;
    } else if (ex.weight === 3 && !ckScore) {
      ckScore = val;
    }
  });

  const tx1 = txScores[0];
  const tx2 = txScores[1];
  const tx3 = txScores[2];

  // Calculate weighted average
  // Formula TT 43: (Sum(TX) + 2*GK + 3*CK) / (total weights)
  let totalWeightedScore = 0;
  let totalWeights = 0;

  txScores.forEach((s) => {
    totalWeightedScore += s * 1;
    totalWeights += 1;
  });

  if (typeof gkScore === 'number') {
    totalWeightedScore += gkScore * 2;
    totalWeights += 2;
  }

  if (typeof ckScore === 'number') {
    totalWeightedScore += ckScore * 3;
    totalWeights += 3;
  }

  let avg = 0;
  if (totalWeights > 0) {
    avg = Number((totalWeightedScore / totalWeights).toFixed(1));
  } else if (student.averageScore) {
    avg = student.averageScore;
  }

  // Determine Level according to Circular 43
  // Tốt: ĐTBm >= 8.0, định kỳ >= 6.5
  // Khá: ĐTBm >= 6.5, định kỳ >= 5.0
  // Đạt: ĐTBm >= 5.0, định kỳ >= 3.5
  // Chưa đạt: còn lại
  const periodicScores: number[] = [];
  if (typeof gkScore === 'number') periodicScores.push(gkScore);
  if (typeof ckScore === 'number') periodicScores.push(ckScore);
  const minPeriodic = periodicScores.length > 0 ? Math.min(...periodicScores) : avg;

  let level: EvaluationLevel = 'Chưa đạt';
  if (avg >= 8.0 && minPeriodic >= 6.5) {
    level = 'Tốt';
  } else if (avg >= 6.5 && minPeriodic >= 5.0) {
    level = 'Khá';
  } else if (avg >= 5.0 && minPeriodic >= 3.5) {
    level = 'Đạt';
  } else if (avg >= 8.0 && minPeriodic >= 5.0) {
    // ĐTB cao nhưng có điểm định kỳ kéo xuống Khá
    level = 'Khá';
  } else if (avg >= 6.5 && minPeriodic >= 3.5) {
    // ĐTB Khá nhưng điểm định kỳ kéo xuống Đạt
    level = 'Đạt';
  } else {
    level = 'Chưa đạt';
  }

  // Determine comment
  let comment = student.teacherComment || fallbackComment || '';
  if (!comment) {
    // Pick auto comment
    const list = TT43_COMMENTS_BANK[level];
    // Deterministic pick based on student ID to stay stable
    const charCodeSum = student.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    comment = list[charCodeSum % list.length];
  }

  return {
    tx1,
    tx2,
    tx3,
    gk: gkScore,
    ck: ckScore,
    regularCount: txScores.length,
    averageScore: avg,
    level,
    comment,
    hasEnoughScores: txScores.length >= 3 && typeof gkScore === 'number' && typeof ckScore === 'number',
  };
};

/**
 * Generate the 5 standard exams for History subject (52 periods/year) according to Circular 43
 */
export const createStandardTT43Exams = (
  classId: string,
  className: string,
  grade: 10 | 11 | 12,
  semester: 'HK1' | 'HK2' = 'HK2'
): Omit<Exam, 'id'>[] => {
  const yearSuffix = '2024-2025';
  const prefix = `TT43_${className}_${semester}`;

  return [
    {
      code: `${prefix}_TX1`,
      title: 'ĐĐGtx 1 (Miệng/15 phút)',
      classId,
      className,
      grade,
      date: semester === 'HK1' ? '2024-10-15' : '2025-02-15',
      type: '15 phút',
      format: 'Trắc nghiệm',
      maxScore: 10,
      weight: 1,
      tt43Category: 'TX1',
      semester,
      description: 'Đánh giá thường xuyên lần 1: Kiểm tra nhận thức mốc lịch sử ban đầu',
    },
    {
      code: `${prefix}_TX2`,
      title: 'ĐĐGtx 2 (15 phút/Tư liệu)',
      classId,
      className,
      grade,
      date: semester === 'HK1' ? '2024-11-20' : '2025-03-10',
      type: '15 phút',
      format: 'Kết hợp',
      maxScore: 10,
      weight: 1,
      tt43Category: 'TX2',
      semester,
      description: 'Đánh giá thường xuyên lần 2: Phân tích tư liệu lịch sử và diễn biến sự kiện',
    },
    {
      code: `${prefix}_TX3`,
      title: 'ĐĐGtx 3 (Dự án/Sản phẩm)',
      classId,
      className,
      grade,
      date: semester === 'HK1' ? '2024-12-10' : '2025-04-12',
      type: 'Đánh giá thường xuyên',
      format: 'Tự luận',
      maxScore: 10,
      weight: 1,
      tt43Category: 'TX3',
      semester,
      description: 'Đánh giá thường xuyên lần 3: Thuyết trình, vẽ sơ đồ tư duy hoặc báo cáo chuyên đề',
    },
    {
      code: `${prefix}_GK`,
      title: 'ĐĐGgk (Kiểm tra Giữa kỳ)',
      classId,
      className,
      grade,
      date: semester === 'HK1' ? '2024-11-05' : '2025-03-25',
      type: 'Giữa kỳ',
      format: 'Kết hợp',
      maxScore: 10,
      weight: 2,
      tt43Category: 'GK',
      semester,
      description: 'Kiểm tra đánh giá giữa học kỳ: 70% trắc nghiệm + 30% tự luận (Hệ số 2)',
    },
    {
      code: `${prefix}_CK`,
      title: 'ĐĐGck (Kiểm tra Cuối kỳ)',
      classId,
      className,
      grade,
      date: semester === 'HK1' ? '2024-12-28' : '2025-05-10',
      type: 'Cuối kỳ',
      format: 'Kết hợp',
      maxScore: 10,
      weight: 3,
      tt43Category: 'CK',
      semester,
      description: 'Kiểm tra đánh giá cuối học kỳ môn Lịch sử (Hệ số 3)',
    },
  ];
};
