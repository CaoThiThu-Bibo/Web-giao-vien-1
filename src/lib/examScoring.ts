/**
 * BỘ MÁY TỰ ĐỘNG TÍNH ĐIỂM & BAREM ĐỀ THI TỐT NGHIỆP THPT MÔN LỊCH SỬ (TỪ NĂM 2025)
 * Căn cứ Quyết định số 764/QĐ-BGDĐT của Bộ Giáo dục và Đào tạo
 * Dành cho học sinh THPT và học viên Giáo dục thường xuyên (GDTX)
 * Thang điểm chuẩn: 10,0 điểm (Thời gian làm bài: 50 phút - 28 câu)
 */

import { Question, TrueFalseStatement, EvaluationLevel } from '../types';

export interface TrueFalseScoreResult {
  correctCount: number; // 0, 1, 2, 3, 4
  score: number; // 0.0, 0.1, 0.25, 0.5, 1.0
  breakdown: {
    id: 'a' | 'b' | 'c' | 'd';
    studentChoice?: boolean;
    correctAnswer: boolean;
    isCorrect: boolean;
  }[];
}

export interface GraduationExamScoreBreakdown {
  part1Score: number; // Tối đa 6.0 điểm
  part1Max: number; // 6.0
  part1CorrectCount: number; // x / 24 câu
  part1TotalQuestions: number; // 24

  part2Score: number; // Tối đa 4.0 điểm
  part2Max: number; // 4.0
  part2Details: Record<number, TrueFalseScoreResult>; // Câu 1..4

  totalScore: number; // Tối đa 10.0 điểm
  evaluationLevel: EvaluationLevel;
  evaluationText: string;
  pedagogicalComment: string;
}

/**
 * Barem tính điểm chuẩn của Bộ GD&ĐT cho câu hỏi trắc nghiệm Đúng/Sai (Phần II)
 * Tối đa 1.0 điểm / câu gồm 4 lệnh hỏi a, b, c, d
 */
export const MOET_TF_BAREM: Record<number, number> = {
  0: 0.0,
  1: 0.1, // Thí sinh chỉ lựa chọn chính xác 01 ý trong 1 câu hỏi được 0,1 điểm
  2: 0.25, // Thí sinh chỉ lựa chọn chính xác 02 ý trong 1 câu hỏi được 0,25 điểm
  3: 0.5, // Thí sinh chỉ lựa chọn chính xác 03 ý trong 1 câu hỏi được 0,5 điểm
  4: 1.0, // Thí sinh lựa chọn chính xác cả 04 ý trong 1 câu hỏi được 1,0 điểm
};

/**
 * Tính điểm cho 1 câu hỏi Đúng/Sai theo barem Bộ GD&ĐT
 */
export function calculateTrueFalseScore(
  studentAnswers: Record<'a' | 'b' | 'c' | 'd', boolean | undefined>,
  statements: TrueFalseStatement[]
): TrueFalseScoreResult {
  let correctCount = 0;
  const breakdown: TrueFalseScoreResult['breakdown'] = [];

  const validIds: ('a' | 'b' | 'c' | 'd')[] = ['a', 'b', 'c', 'd'];

  validIds.forEach((id) => {
    const stmt = statements.find((s) => s.id === id);
    const correctAnswer = stmt ? stmt.isCorrect : false;
    const studentChoice = studentAnswers[id];

    const isCorrect = studentChoice !== undefined && studentChoice === correctAnswer;
    if (isCorrect) {
      correctCount++;
    }

    breakdown.push({
      id,
      studentChoice,
      correctAnswer,
      isCorrect,
    });
  });

  const score = MOET_TF_BAREM[correctCount] ?? 0;

  return {
    correctCount,
    score,
    breakdown,
  };
}

/**
 * Tính điểm toàn bộ bài thi tốt nghiệp THPT Lớp 12 môn Lịch sử chuẩn Bộ GD&ĐT (24 câu Phần I + 4 câu Phần II)
 */
export function calculateGraduationExamScore(
  part1StudentAnswers: Record<number, string>, // index câu (0..23) -> 'A' | 'B' | 'C' | 'D'
  part1CorrectAnswers: string[], // mảng 24 đáp án đúng: ['A', 'B', 'C', ...]
  part2StudentAnswers: Record<number, Record<'a' | 'b' | 'c' | 'd', boolean | undefined>>, // index câu (0..3) -> { a: true, b: false, ... }
  part2Questions: { trueFalseStatements?: TrueFalseStatement[] }[]
): GraduationExamScoreBreakdown {
  // 1. Tính điểm Phần I (24 câu trắc nghiệm đơn, mỗi câu 0.25 điểm = 6.0 điểm)
  let part1CorrectCount = 0;
  const part1Total = Math.min(24, part1CorrectAnswers.length);

  for (let i = 0; i < part1Total; i++) {
    const studentAns = (part1StudentAnswers[i] || '').trim().toUpperCase();
    const correctAns = (part1CorrectAnswers[i] || '').trim().toUpperCase();
    if (studentAns && studentAns === correctAns) {
      part1CorrectCount++;
    }
  }

  const part1Score = Math.round(part1CorrectCount * 0.25 * 100) / 100;

  // 2. Tính điểm Phần II (4 câu Đúng/Sai theo barem bậc thang Bộ GD&ĐT)
  let part2Score = 0;
  const part2Details: Record<number, TrueFalseScoreResult> = {};

  const part2Total = Math.min(4, part2Questions.length);
  for (let i = 0; i < part2Total; i++) {
    const stmts = part2Questions[i]?.trueFalseStatements || [];
    const answers = part2StudentAnswers[i] || { a: undefined, b: undefined, c: undefined, d: undefined };
    const res = calculateTrueFalseScore(answers, stmts);
    part2Details[i] = res;
    part2Score += res.score;
  }

  part2Score = Math.round(part2Score * 100) / 100;

  // 3. Tổng điểm (Tối đa 10.0 điểm)
  const rawTotal = Math.round((part1Score + part2Score) * 100) / 100;
  const totalScore = Math.min(10.0, Math.max(0.0, rawTotal));

  // 4. Xếp loại & Nhận xét sư phạm theo Thông tư 43/2021 GDTX
  let evaluationLevel: EvaluationLevel = 'Chưa đạt';
  let evaluationText = 'Chưa đạt (Cần phụ đạo)';
  let pedagogicalComment = 'Chưa đạt yêu cầu kiến thức cốt lõi. Cần ôn tập lại các mốc lịch sử căn bản để đảm bảo tốt nghiệp.';

  if (totalScore >= 8.0) {
    evaluationLevel = 'Tốt';
    evaluationText = 'Mức Tốt (Giỏi)';
    pedagogicalComment = 'Nắm rất vững kiến thức Lịch sử 12, phân tích tư liệu xuất sắc và có tư duy liên hệ lịch sử sâu sắc. Sẵn sàng đạt điểm cao trong kỳ thi tốt nghiệp THPT!';
  } else if (totalScore >= 6.5) {
    evaluationLevel = 'Khá';
    evaluationText = 'Mức Khá';
    pedagogicalComment = 'Nắm vững kiến thức trọng tâm, kỹ năng trả lời câu hỏi trắc nghiệm tốt. Cần rèn luyện thêm kỹ năng đọc hiểu đoạn tư liệu lịch sử ở Phần II để bứt phá.';
  } else if (totalScore >= 5.0) {
    evaluationLevel = 'Đạt';
    evaluationText = 'Mức Đạt (Trung bình)';
    pedagogicalComment = 'Đạt yêu cầu chuẩn đầu ra môn Lịch sử GDTX, đủ điều kiện xét công nhận tốt nghiệp. Cần chú ý củng cố thêm các sự kiện giai đoạn 1945 - 1975.';
  }

  return {
    part1Score,
    part1Max: 6.0,
    part1CorrectCount,
    part1TotalQuestions: part1Total,

    part2Score,
    part2Max: 4.0,
    part2Details,

    totalScore,
    evaluationLevel,
    evaluationText,
    pedagogicalComment,
  };
}

/**
 * Tự động phân bổ và chuẩn hóa điểm số của một đề kiểm tra bất kỳ về thang điểm 10,0
 * (Dành cho các bài kiểm tra 15 phút, 1 tiết, giữa kỳ hoặc đề tự chọn trong ngân hàng đề)
 */
export function normalizeExamQuestionsTo10(questions: Question[]): {
  questionPoints: Record<string, number>;
  totalPoints: number;
} {
  const n = questions.length;
  if (n === 0) return { questionPoints: {}, totalPoints: 0 };

  // Phân loại dạng câu hỏi để tính trọng số hợp lý:
  // - Đúng/Sai và Tự luận có trọng số cao hơn
  // - Trắc nghiệm đơn và điền từ có trọng số tiêu chuẩn
  let totalWeights = 0;
  const weights: Record<string, number> = {};

  questions.forEach((q) => {
    let w = 1.0;
    if (q.type === 'Trắc nghiệm đúng sai') {
      w = 2.0; // Đúng sai thường 1.0đ hoặc trọng số gấp đôi câu đơn
    } else if (q.type === 'Tự luận') {
      w = 3.0; // Tự luận trọng số cao
    } else if (q.type === 'Điền từ' || q.type === 'Nối từ') {
      w = 1.5;
    } else {
      w = 1.0; // Trắc nghiệm đơn
    }
    weights[q.id] = w;
    totalWeights += w;
  });

  const questionPoints: Record<string, number> = {};
  let accumulated = 0;

  questions.forEach((q, idx) => {
    if (idx === questions.length - 1) {
      // Câu cuối cùng bù trừ làm tròn để tổng điểm chính xác 10.0
      questionPoints[q.id] = Math.round((10.0 - accumulated) * 100) / 100;
    } else {
      const pt = Math.round(((weights[q.id] / totalWeights) * 10.0) * 100) / 100;
      questionPoints[q.id] = pt;
      accumulated += pt;
    }
  });

  return {
    questionPoints,
    totalPoints: 10.0,
  };
}
