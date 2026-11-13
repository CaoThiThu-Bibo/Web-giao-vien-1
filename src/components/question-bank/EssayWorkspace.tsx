import React, { useState, useMemo } from 'react';
import { Question, RubricCriteria } from '../../types';
import {
  FileText,
  Award,
  BookOpen,
  Plus,
  Trash2,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ListChecks,
  PenTool,
  Eye,
  EyeOff,
  Lock,
  Lightbulb,
  RotateCcw,
  ClipboardCheck,
  Check,
  Wand2,
} from 'lucide-react';

// Helper: Normalize Vietnamese text for keyword matching
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const STOP_WORDS = new Set([
  'cua', 'va', 'cac', 'nhung', 'trong', 'la', 'cho', 've', 'den', 'nam',
  'voi', 'theo', 'nay', 'sau', 'tu', 'khi', 'tai', 'duoc', 'mot', 'hai',
  'ba', 'bon', 'neu', 'dung', 'phan', 'tich', 'trinh', 'bay', 'y', 'nghia',
  'lich', 'su', 'bai', 'hoc', 'noi', 'chinh', 'diem', 'ro', 'thuc', 'te',
]);

export interface EssayRubricMatchResult {
  score: number;
  wordCount: number;
  paragraphCount: number;
  matchedCriteriaCount: number;
  totalCriteriaCount: number;
  criteriaMatches: { criteria: string; points: number; matched: boolean }[];
}

export function scoreEssayByRubric(q: Question, rawAnswer: string): EssayRubricMatchResult {
  const trimmed = (rawAnswer || '').trim();
  const wordCount = trimmed ? trimmed.split(/\s+/).length : 0;
  const paragraphCount = trimmed
    ? trimmed
        .split(/\n+/)
        .map((p) => p.trim())
        .filter(Boolean).length
    : 0;

  const rubric = q.rubricPoints && q.rubricPoints.length > 0
    ? q.rubricPoints
    : [{ criteria: q.correctAnswer || 'Trình bày đúng trọng tâm câu hỏi', points: 10 }];

  if (!trimmed || wordCount < 5) {
    return {
      score: 0,
      wordCount,
      paragraphCount,
      matchedCriteriaCount: 0,
      totalCriteriaCount: rubric.length,
      criteriaMatches: rubric.map((r) => ({ ...r, matched: false })),
    };
  }

  const normAns = normalizeText(trimmed);
  let matchedScore = 0;
  let totalRubricPoints = 0;
  let matchedCriteriaCount = 0;

  const criteriaMatches = rubric.map((r) => {
    totalRubricPoints += r.points || 0;
    const tokens = normalizeText(r.criteria)
      .split(' ')
      .filter((t) => t.length >= 3 && !STOP_WORDS.has(t));

    if (tokens.length === 0) {
      const matched = wordCount >= 30;
      if (matched) {
        matchedScore += r.points;
        matchedCriteriaCount++;
      }
      return { criteria: r.criteria, points: r.points, matched };
    }

    const hits = tokens.filter((t) => normAns.includes(t)).length;
    const ratio = hits / tokens.length;
    const matched = ratio >= 0.25 || hits >= 2;
    if (matched) {
      matchedScore += r.points * Math.min(1, 0.6 + ratio * 0.6);
      matchedCriteriaCount++;
    } else if (hits >= 1 && wordCount >= 40) {
      matchedScore += r.points * 0.35;
    }
    return { criteria: r.criteria, points: r.points, matched };
  });

  // Normalize to 10.0 scale and factor minimum length sanity
  let scaled = totalRubricPoints > 0 ? (matchedScore / totalRubricPoints) * 10.0 : 0;
  if (wordCount < 25) scaled = Math.min(scaled, 3.5);
  else if (wordCount < 55) scaled = Math.min(scaled, 6.5);

  const finalScore = Math.min(10, Math.max(0, Math.round(scaled * 4) / 4));

  return {
    score: finalScore,
    wordCount,
    paragraphCount,
    matchedCriteriaCount,
    totalCriteriaCount: rubric.length,
    criteriaMatches,
  };
}

// ===========================================================================
// 1. TEACHER ESSAY AUTHORING STUDIO
// ===========================================================================
interface EssayTeacherEditorProps {
  question: Question;
  index: number;
  onUpdateQuestion: (qId: string, updates: Partial<Question>) => void;
  onPreviewStudentCard?: () => void;
}

const PROMPT_STEM_TEMPLATES = [
  {
    label: 'Phân tích nguyên nhân & ý nghĩa',
    template:
      'Phân tích những nguyên nhân thắng lợi và ý nghĩa lịch sử của sự kiện ... Từ đó, nêu bài học kinh nghiệm rút ra cho công cuộc xây dựng và bảo vệ Tổ quốc hiện nay?',
  },
  {
    label: 'Đọc tư liệu & trả lời',
    template:
      'Đọc đoạn tư liệu sau:\n"..."\nDựa vào đoạn tư liệu và kiến thức đã học, em hãy trình bày hoàn cảnh ra đời và vai trò lịch sử của văn kiện/sự kiện trên?',
  },
  {
    label: 'So sánh 2 sự kiện / giai đoạn',
    template:
      'So sánh điểm giống và khác nhau giữa ... và ... về mục tiêu, lực lượng lãnh đạo và kết quả?',
  },
  {
    label: 'Liên hệ Lịch sử Quảng Ninh',
    template:
      'Trình bày đóng góp tiêu biểu của quân và dân vùng mỏ Quảng Ninh trong sự kiện ... và ý nghĩa đối với truyền thống "Kỷ luật và Đồng tâm"?',
  },
];

export const EssayTeacherEditor: React.FC<EssayTeacherEditorProps> = ({
  question,
  index,
  onUpdateQuestion,
  onPreviewStudentCard,
}) => {
  const rubricList: RubricCriteria[] = useMemo(() => {
    if (question.rubricPoints && question.rubricPoints.length > 0) {
      return question.rubricPoints;
    }
    return [
      { criteria: 'Ý 1: Nêu đúng hoàn cảnh lịch sử và bối cảnh ra đời', points: 3.0 },
      { criteria: 'Ý 2: Phân tích nội dung trọng tâm / ý nghĩa lịch sử', points: 4.0 },
      { criteria: 'Ý 3: Rút ra bài học kinh nghiệm & liên hệ thực tế', points: 3.0 },
    ];
  }, [question.rubricPoints]);

  const totalRubricPoints = useMemo(
    () => Math.round(rubricList.reduce((acc, r) => acc + (Number(r.points) || 0), 0) * 100) / 100,
    [rubricList]
  );

  const isSumTen = Math.abs(totalRubricPoints - 10) < 0.01;

  const handleUpdateRubricItem = (
    rIdx: number,
    patch: Partial<RubricCriteria>
  ) => {
    const updated = rubricList.map((item, i) => (i === rIdx ? { ...item, ...patch } : item));
    onUpdateQuestion(question.id, { rubricPoints: updated });
  };

  const handleAddRubricItem = () => {
    const remaining = Math.max(0.5, Math.round((10 - totalRubricPoints) * 4) / 4);
    const updated = [
      ...rubricList,
      {
        criteria: `Ý ${rubricList.length + 1}: Tiêu chí bổ sung...`,
        points: totalRubricPoints < 10 ? remaining : 1.0,
      },
    ];
    onUpdateQuestion(question.id, { rubricPoints: updated });
  };

  const handleDeleteRubricItem = (rIdx: number) => {
    if (rubricList.length <= 1) return;
    const updated = rubricList.filter((_, i) => i !== rIdx);
    onUpdateQuestion(question.id, { rubricPoints: updated });
  };

  const handleNormalizeRubricToTen = () => {
    if (rubricList.length === 0) return;
    if (totalRubricPoints <= 0) {
      const equal = Math.round((10 / rubricList.length) * 100) / 100;
      onUpdateQuestion(question.id, {
        rubricPoints: rubricList.map((r) => ({ ...r, points: equal })),
      });
      return;
    }
    const factor = 10 / totalRubricPoints;
    let runningSum = 0;
    const scaled = rubricList.map((r, i) => {
      if (i === rubricList.length - 1) {
        const lastPts = Math.max(0.25, Math.round((10 - runningSum) * 100) / 100);
        return { ...r, points: lastPts };
      }
      const pts = Math.max(0.25, Math.round(r.points * factor * 4) / 4);
      runningSum += pts;
      return { ...r, points: pts };
    });
    onUpdateQuestion(question.id, { rubricPoints: scaled });
  };

  const handleGenerateRubricFromOutline = () => {
    const raw = (question.essayOutline || '').trim();
    if (!raw) return;
    const candidateLines = raw
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => /^(\d+[.)]|[-+*•]|[IVX]+\.)\s+/i.test(l))
      .map((l) => l.replace(/^(\d+[.)]|[-+*•]|[IVX]+\.)\s+/i, '').trim())
      .filter((l) => l.length > 5 && !l.toUpperCase().startsWith('DÀN Ý'));

    if (candidateLines.length === 0) return;

    const chosen = candidateLines.slice(0, 6);
    const parsedItems: RubricCriteria[] = chosen.map((line) => {
      const ptMatch = line.match(/\((\d+(?:[.,]\d+)?)\s*(?:đ|điểm)\)/i);
      const pts = ptMatch ? parseFloat(ptMatch[1].replace(',', '.')) : 0;
      const cleanCriteria = line.replace(/\(\d+(?:[.,]\d+)?\s*(?:đ|điểm)\)/i, '').trim();
      return { criteria: cleanCriteria, points: pts };
    });

    const hasExplicitPts = parsedItems.some((p) => p.points > 0);
    if (!hasExplicitPts) {
      const basePt = Math.floor((10 / parsedItems.length) * 4) / 4;
      let sum = 0;
      const balanced = parsedItems.map((p, idx) => {
        if (idx === parsedItems.length - 1) {
          return { ...p, points: Math.round((10 - sum) * 100) / 100 };
        }
        sum += basePt;
        return { ...p, points: basePt };
      });
      onUpdateQuestion(question.id, { rubricPoints: balanced });
    } else {
      onUpdateQuestion(question.id, {
        rubricPoints: parsedItems.map((p) => ({
          ...p,
          points: p.points > 0 ? p.points : 1.0,
        })),
      });
    }
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Top Pedagogical Settings Row */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/70">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-rose-950 dark:text-rose-200">Mức độ:</span>
            <select
              value={question.cognitiveLevel || 'Vận dụng'}
              onChange={(e) =>
                onUpdateQuestion(question.id, {
                  cognitiveLevel: e.target.value as Question['cognitiveLevel'],
                })
              }
              className="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-rose-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none cursor-pointer"
            >
              <option value="Nhận biết">Nhận biết</option>
              <option value="Thông hiểu">Thông hiểu</option>
              <option value="Vận dụng">Vận dụng</option>
              <option value="Vận dụng cao">Vận dụng cao</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-bold text-rose-950 dark:text-rose-200">Nguồn / Tư liệu:</span>
            <input
              type="text"
              value={question.source || ''}
              onChange={(e) => onUpdateQuestion(question.id, { source: e.target.value })}
              placeholder="VD: SGK Lịch sử 12, Lịch sử Quảng Ninh..."
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-rose-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 outline-none w-48 sm:w-64"
            />
          </div>
        </div>

        {onPreviewStudentCard && (
          <button
            type="button"
            onClick={onPreviewStudentCard}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-200 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap shrink-0"
            title="Chuyển sang xem thử giao diện làm bài của học sinh cho câu này"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Xem thử góc nhìn Học sinh</span>
          </button>
        )}
      </div>

      {/* 1. Essay Prompt Editor + Quick Stems */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
            <PenTool className="w-3.5 h-3.5 text-rose-600" />
            <span>1. Đề bài Tự luận (Câu {index + 1}):</span>
          </label>
          <div className="flex flex-wrap items-center gap-1">
            {PROMPT_STEM_TEMPLATES.map((tpl) => (
              <button
                key={tpl.label}
                type="button"
                onClick={() =>
                  onUpdateQuestion(question.id, {
                    content: tpl.template,
                  })
                }
                className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-sky-100 dark:bg-slate-800 dark:hover:bg-sky-900/40 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold cursor-pointer transition-colors"
                title="Áp dụng mẫu câu hỏi Tự luận chuẩn GDPT 2018"
              >
                + {tpl.label}
              </button>
            ))}
          </div>
        </div>

        <textarea
          rows={3}
          value={question.content}
          onChange={(e) => onUpdateQuestion(question.id, { content: e.target.value })}
          className="w-full p-3.5 bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 rounded-2xl font-serif text-sm leading-relaxed outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 dark:text-slate-100"
          placeholder="Nhập nội dung câu hỏi tự luận, câu lệnh yêu cầu phân tích / đánh giá / liên hệ..."
        />
      </div>

      {/* 2. Dàn ý gợi ý & Đáp án chi tiết + 3. Bảng Biểu điểm Rubric */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Essay Outline Editor */}
        <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-slate-800/70 border border-amber-200 dark:border-slate-700 space-y-2.5 flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-xs font-bold text-[#073B66] dark:text-sky-300 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-amber-600" />
              <span>2. Dàn ý gợi ý & Đáp án chi tiết:</span>
            </label>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  const base = question.essayOutline?.trim();
                  const template = `DÀN Ý GỢI Ý TRẢ LỜI:\n1. Mở bài / Bối cảnh lịch sử (2.0 điểm):\n- Nêu hoàn cảnh, thời gian và vấn đề trọng tâm...\n2. Thân bài / Nội dung phân tích chính (5.0 điểm):\n- Luận điểm 1: ...\n- Luận điểm 2: ...\n3. Kết bài / Ý nghĩa & Bài học liên hệ (3.0 điểm):\n- Khẳng định giá trị lịch sử và liên hệ thực tiễn hiện nay...`;
                  onUpdateQuestion(question.id, {
                    essayOutline: base ? `${base}\n\n${template}` : template,
                  });
                }}
                className="px-2 py-1 rounded-lg bg-white dark:bg-slate-700 border border-amber-300 dark:border-slate-600 text-[11px] font-bold text-amber-900 dark:text-amber-200 hover:bg-amber-100 cursor-pointer"
              >
                + Khung 3 phần
              </button>
              <button
                type="button"
                onClick={handleGenerateRubricFromOutline}
                className="px-2 py-1 rounded-lg bg-[#073B66] hover:bg-[#0878C9] text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                title="Tự động trích các ý chính từ Dàn ý sang Bảng Biểu điểm Rubric bên cạnh"
              >
                <Wand2 className="w-3 h-3 text-amber-300" />
                <span>Tạo Rubric từ dàn ý</span>
              </button>
            </div>
          </div>

          <textarea
            rows={8}
            value={question.essayOutline || ''}
            onChange={(e) => onUpdateQuestion(question.id, { essayOutline: e.target.value })}
            className="w-full flex-1 p-3 bg-white dark:bg-slate-900 border border-amber-200 dark:border-slate-700 rounded-xl font-serif text-xs sm:text-sm leading-relaxed outline-none focus:ring-2 focus:ring-amber-400 text-slate-900 dark:text-slate-100"
            placeholder="Nhập dàn ý gợi ý từng phần (Mở bài, các ý phân tích chính, bài học lịch sử...) để học sinh đối chiếu sau khi nộp bài."
          />
        </div>

        {/* Right: Interactive Rubric Criteria Table */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-3 flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                3. Biểu điểm chấm chi tiết (Rubric)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border tabular-nums ${
                  isSumTen
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-700'
                    : 'bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-700'
                }`}
              >
                Tổng: {totalRubricPoints.toFixed(2)} / 10.0đ
              </span>

              {!isSumTen && (
                <button
                  type="button"
                  onClick={handleNormalizeRubricToTen}
                  className="px-2 py-0.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold cursor-pointer"
                  title="Tự động chia lại tỷ lệ các tiêu chí về đúng tổng 10.0 điểm"
                >
                  Quy chuẩn 10đ
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2 flex-1 max-h-64 overflow-y-auto pr-1">
            {rubricList.map((r, rIdx) => (
              <div
                key={rIdx}
                className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start gap-2"
              >
                <span className="w-6 h-6 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 tabular-nums">
                  {rIdx + 1}
                </span>
                <textarea
                  rows={2}
                  value={r.criteria}
                  onChange={(e) => handleUpdateRubricItem(rIdx, { criteria: e.target.value })}
                  placeholder="Nội dung tiêu chí đạt điểm..."
                  className="flex-1 bg-transparent border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-rose-500 text-slate-900 dark:text-slate-100"
                />
                <div className="flex items-center gap-1 shrink-0">
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    max="10"
                    value={r.points}
                    onChange={(e) =>
                      handleUpdateRubricItem(rIdx, {
                        points: Math.max(0, Math.min(10, parseFloat(e.target.value) || 0)),
                      })
                    }
                    className="w-16 px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-bold text-[#073B66] dark:text-sky-300 text-right tabular-nums outline-none"
                  />
                  <span className="text-[11px] font-semibold text-slate-500">đ</span>
                </div>
                {rubricList.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleDeleteRubricItem(rIdx)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                    title="Xóa tiêu chí này"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddRubricItem}
            className="w-full py-2 rounded-xl border border-dashed border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm tiêu chí chấm điểm</span>
          </button>
        </div>
      </div>

      {/* 4. Core Summary Answer & Teacher Pedagogical Explanation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
              4. Chốt ý cốt lõi (hiển thị tóm tắt & bảng đáp án Word):
            </label>
            <button
              type="button"
              onClick={() => {
                const summary = rubricList.map((r) => `${r.criteria} (${r.points}đ)`).join('; ');
                onUpdateQuestion(question.id, { correctAnswer: summary });
              }}
              className="text-[11px] font-bold text-[#0878C9] hover:underline cursor-pointer"
            >
              Đồng bộ từ Rubric
            </button>
          </div>
          <input
            type="text"
            value={question.correctAnswer}
            onChange={(e) => onUpdateQuestion(question.id, { correctAnswer: e.target.value })}
            placeholder="Tóm tắt các ý bắt buộc phải có..."
            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0878C9]"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
            5. Lưu ý sư phạm / Dẫn chứng gợi nhớ cho học sinh:
          </label>
          <input
            type="text"
            value={question.explanation || ''}
            onChange={(e) => onUpdateQuestion(question.id, { explanation: e.target.value })}
            placeholder="Ví dụ: Học sinh cần nêu đúng mốc năm 1945, dẫn chứng thực tế..."
            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0878C9]"
          />
        </div>
      </div>
    </div>
  );
};

// ===========================================================================
// 2. STUDENT ESSAY STUDY & WRITING WORKSPACE
// ===========================================================================
interface EssayStudentWorkspaceProps {
  question: Question;
  answerText: string;
  onChangeAnswer: (text: string) => void;
  lastAutoSavedTime: string;
  isProctoringLocked: boolean; // True when in active exam before submission: never reveal answer/outline
  isTeacherUser?: boolean;
}

const QUICK_HISTORY_SECTIONS = [
  { label: '+ Mở bài', snippet: '\n1. Khái quát vấn đề:\n' },
  { label: '+ Hoàn cảnh lịch sử', snippet: '\n- Hoàn cảnh lịch sử: ' },
  { label: '+ Nội dung / Diễn biến', snippet: '\n2. Phân tích nội dung trọng tâm:\n- ' },
  { label: '+ Ý nghĩa lịch sử', snippet: '\n- Ý nghĩa lịch sử: ' },
  { label: '+ Bài học liên hệ', snippet: '\n3. Bài học kinh nghiệm và liên hệ hiện nay:\n- ' },
];

export const EssayStudentWorkspace: React.FC<EssayStudentWorkspaceProps> = ({
  question,
  answerText,
  onChangeAnswer,
  lastAutoSavedTime,
  isProctoringLocked,
  isTeacherUser = false,
}) => {
  const [showScratchpad, setShowScratchpad] = useState(false);
  const [scratchOpenNote, setScratchOpenNote] = useState('');
  const [scratchBodyNote, setScratchBodyNote] = useState('');
  const [scratchCloseNote, setScratchCloseNote] = useState('');
  const [showRubricStructure, setShowRubricStructure] = useState(false);
  const [showStudyOutline, setShowStudyOutline] = useState(false);

  const trimmed = answerText.trim();
  const wordCount = trimmed ? trimmed.split(/\s+/).length : 0;
  const paragraphCount = trimmed
    ? trimmed
        .split(/\n+/)
        .map((p) => p.trim())
        .filter(Boolean).length
    : 0;

  const rubricList = question.rubricPoints || [];
  const totalPoints = useMemo(() => {
    if (rubricList.length === 0) return 10;
    return Math.round(rubricList.reduce((acc, r) => acc + (r.points || 0), 0) * 100) / 100;
  }, [rubricList]);

  const depthInfo =
    wordCount >= 120
      ? {
          label: 'Phân tích chuyên sâu',
          barWidth: 100,
          badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          barClass: 'bg-emerald-600',
        }
      : wordCount >= 50
      ? {
          label: 'Đủ ý cơ bản — viết thêm dẫn chứng',
          barWidth: Math.min(90, Math.round((wordCount / 120) * 100)),
          badgeClass: 'bg-sky-100 text-sky-800 border-sky-300',
          barClass: 'bg-[#0878C9]',
        }
      : {
          label: wordCount > 0 ? 'Đang khởi động dàn ý' : 'Chưa viết bài',
          barWidth: Math.min(40, Math.round((wordCount / 120) * 100)),
          badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
          barClass: 'bg-amber-500',
        };

  const handleAppendSnippet = (snippet: string) => {
    const next = answerText ? `${answerText.trimEnd()}${snippet}` : snippet.trimStart();
    onChangeAnswer(next);
  };

  const handleInsertScratchpadToEssay = () => {
    const parts: string[] = [];
    if (scratchOpenNote.trim()) parts.push(scratchOpenNote.trim());
    if (scratchBodyNote.trim()) parts.push(scratchBodyNote.trim());
    if (scratchCloseNote.trim()) parts.push(scratchCloseNote.trim());
    if (parts.length === 0) return;
    const draft = parts.join('\n\n');
    onChangeAnswer(answerText.trim() ? `${answerText.trim()}\n\n${draft}` : draft);
    setShowScratchpad(false);
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Study & Prompt Metadata Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-1 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 font-bold border border-rose-200 dark:border-rose-800 tabular-nums flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-rose-600" />
            Thang điểm: {totalPoints.toFixed(1)}đ
          </span>
          {rubricList.length > 0 && (
            <span className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold tabular-nums">
              Gồm {rubricList.length} ý trọng tâm
            </span>
          )}
          {question.source && (
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Nguồn: {question.source}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowScratchpad(!showScratchpad)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 cursor-pointer transition-colors ${
              showScratchpad
                ? 'bg-sky-100 border-sky-300 text-[#073B66]'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100'
            }`}
          >
            <PenTool className="w-3.5 h-3.5 text-[#0878C9]" />
            <span>{showScratchpad ? 'Ẩn nháp dàn ý 3 phần' : 'Lập nháp dàn ý 3 phần'}</span>
          </button>

          {rubricList.length > 0 && (
            <button
              type="button"
              onClick={() => setShowRubricStructure(!showRubricStructure)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 cursor-pointer transition-colors ${
                showRubricStructure
                  ? 'bg-amber-100 border-amber-300 text-amber-950'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100'
              }`}
            >
              <ListChecks className="w-3.5 h-3.5 text-amber-600" />
              <span>{isProctoringLocked ? 'Phân bổ điểm' : 'Xem Rubric điểm'}</span>
            </button>
          )}

          {/* Only allow expanding full study outline when NOT in locked exam */}
          {!isProctoringLocked && question.essayOutline && (
            <button
              type="button"
              onClick={() => setShowStudyOutline(!showStudyOutline)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 cursor-pointer transition-colors ${
                showStudyOutline
                  ? 'bg-emerald-100 border-emerald-300 text-emerald-950'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100'
              }`}
            >
              {showStudyOutline ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showStudyOutline ? 'Ẩn dàn ý học bài' : 'Học bài: Xem Dàn ý mẫu'}</span>
            </button>
          )}

          {isProctoringLocked && (
            <span
              className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 flex items-center gap-1"
              title="Đáp án và dàn ý chi tiết sẽ hiển thị sau khi em nộp bài"
            >
              <Lock className="w-3 h-3" />
              <span>Đáp án mở sau khi nộp bài</span>
            </span>
          )}
        </div>
      </div>

      {/* Rubric Structure Panel (safe during exam: if locked, shows only point allocation skeleton, not answer text) */}
      {showRubricStructure && rubricList.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 space-y-2 text-xs">
          <div className="font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-600" />
            <span>
              {isProctoringLocked
                ? 'Cấu trúc phân bổ điểm bài viết (Dàn ý chi tiết được bảo mật khi đang thi):'
                : 'Biểu điểm chấm (Rubric của Cô Cao Thị Thu):'}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {rubricList.map((r, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-amber-200/80 dark:border-slate-700 flex items-center justify-between gap-2"
              >
                <span className="text-slate-700 dark:text-slate-200 font-medium">
                  {isProctoringLocked ? `Luận điểm phần ${idx + 1} (Cần triển khai rõ ý & dẫn chứng)` : `${idx + 1}. ${r.criteria}`}
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-900 font-bold tabular-nums shrink-0">
                  {r.points.toFixed(2)}đ
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full Study Outline Panel (Teacher preview or non-proctored study mode only) */}
      {!isProctoringLocked && showStudyOutline && question.essayOutline && (
        <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/25 border border-emerald-200 dark:border-emerald-800 space-y-2 text-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-emerald-600" />
              <span>
                {isTeacherUser
                  ? 'Dàn ý chuẩn & Đáp án gợi ý (Cô Cao Thị Thu):'
                  : 'Dàn ý học bài & Ghi nhớ trọng tâm:'}
              </span>
            </span>
          </div>
          <div className="font-serif text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-100 whitespace-pre-line bg-white/80 dark:bg-slate-900/60 p-3.5 rounded-xl border border-emerald-200/70 dark:border-emerald-800/50">
            {question.essayOutline}
          </div>
        </div>
      )}

      {/* Optional 3-Part Brainstorming Scratchpad */}
      {showScratchpad && (
        <div className="p-4 rounded-2xl bg-sky-50/70 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-[#073B66] dark:text-sky-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#0878C9]" />
              <span>Phiếu nháp lập dàn ý nhanh (Mở bài · Thân bài · Kết bài)</span>
            </span>
            <button
              type="button"
              onClick={handleInsertScratchpadToEssay}
              className="px-3 py-1 rounded-xl bg-[#073B66] hover:bg-[#0878C9] text-white text-[11px] font-bold cursor-pointer transition-colors"
            >
              Chuyển nháp xuống bài làm ↓
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            <textarea
              rows={3}
              value={scratchOpenNote}
              onChange={(e) => setScratchOpenNote(e.target.value)}
              placeholder="1. Mở bài: Giới thiệu sự kiện, mốc thời gian..."
              className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-sky-200 dark:border-slate-700 text-xs font-serif outline-none focus:ring-2 focus:ring-[#0878C9] select-text"
            />
            <textarea
              rows={3}
              value={scratchBodyNote}
              onChange={(e) => setScratchBodyNote(e.target.value)}
              placeholder="2. Thân bài: Liệt kê các ý chính & dẫn chứng SGK..."
              className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-sky-200 dark:border-slate-700 text-xs font-serif outline-none focus:ring-2 focus:ring-[#0878C9] select-text"
            />
            <textarea
              rows={3}
              value={scratchCloseNote}
              onChange={(e) => setScratchCloseNote(e.target.value)}
              placeholder="3. Kết bài: Khẳng định ý nghĩa & bài học liên hệ..."
              className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-sky-200 dark:border-slate-700 text-xs font-serif outline-none focus:ring-2 focus:ring-[#0878C9] select-text"
            />
          </div>
        </div>
      )}

      {/* Main Writing Area */}
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-bold text-xs text-slate-800 dark:text-slate-100">
            Bài làm tự luận của em:
          </span>

          {/* Quick structure insertion buttons */}
          <div className="flex flex-wrap items-center gap-1">
            {QUICK_HISTORY_SECTIONS.map((sec) => (
              <button
                key={sec.label}
                type="button"
                onClick={() => handleAppendSnippet(sec.snippet)}
                className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-sky-100 dark:bg-slate-800 dark:hover:bg-sky-900/40 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold cursor-pointer transition-colors"
                title="Chèn nhanh tiêu đề mục vào bài viết"
              >
                {sec.label}
              </button>
            ))}
          </div>
        </div>

        <textarea
          value={answerText}
          onChange={(e) => onChangeAnswer(e.target.value)}
          rows={11}
          placeholder={`Em hãy trình bày bài viết tự luận mạch lạc tại đây...\n\nGợi ý bố cục đạt điểm cao:\n• Mở bài: Nêu bối cảnh, mốc thời gian sự kiện.\n• Thân bài: Phân tích rõ từng luận điểm và dẫn chứng lịch sử.\n• Kết bài: Khẳng định ý nghĩa và rút ra bài học liên hệ.`}
          className="w-full p-4 sm:p-5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl text-sm sm:text-base font-serif leading-relaxed outline-none focus:ring-2 focus:ring-[#0878C9] select-text text-slate-900 dark:text-slate-100 shadow-2xs"
        />

        {/* Word Count, Paragraph Count & Depth Meter */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-1 pt-1 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-slate-600 dark:text-slate-300 tabular-nums">
              Số từ: <strong className="text-[#073B66] dark:text-sky-300">{wordCount}</strong>
            </span>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <span className="text-slate-600 dark:text-slate-300 tabular-nums">
              Số đoạn: <strong>{paragraphCount}</strong>
            </span>
            <span
              className={`px-2 py-0.5 rounded-lg border text-[11px] font-semibold ${depthInfo.badgeClass}`}
            >
              {depthInfo.label}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-[11px] text-slate-400">Độ dài gợi ý (120+ từ):</span>
              <div className="w-24 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${depthInfo.barClass}`}
                  style={{ width: `${depthInfo.barWidth}%` }}
                />
              </div>
            </div>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Lưu nháp: {lastAutoSavedTime}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ===========================================================================
// 3. POST-SUBMISSION ESSAY SCORECARD & STUDY REVIEW CARD
// ===========================================================================
interface EssayScorecardReviewCardProps {
  question: Question;
  studentAnswer: string;
  onPracticeAgain?: () => void;
}

export const EssayScorecardReviewCard: React.FC<EssayScorecardReviewCardProps> = ({
  question,
  studentAnswer,
  onPracticeAgain,
}) => {
  const analysis = useMemo(
    () => scoreEssayByRubric(question, studentAnswer),
    [question, studentAnswer]
  );

  // Interactive self-check state initialized from keyword matching
  const [checkedMap, setCheckedMap] = useState<Record<number, boolean>>(() => {
    const init: Record<number, boolean> = {};
    analysis.criteriaMatches.forEach((c, idx) => {
      init[idx] = c.matched;
    });
    return init;
  });

  const selfCheckScore = useMemo(() => {
    const earned = analysis.criteriaMatches.reduce(
      (sum, c, idx) => sum + (checkedMap[idx] ? c.points : 0),
      0
    );
    return Math.round(earned * 100) / 100;
  }, [analysis.criteriaMatches, checkedMap]);

  return (
    <div className="space-y-4 pt-2 font-sans">
      {/* Side-by-side Student Essay vs Teacher Model Outline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        {/* Left: Student Writing */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2.5">
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-[#073B66] dark:text-sky-300 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#0878C9]" />
              <span>Bài viết của em</span>
            </span>
            <span className="text-[11px] font-semibold text-slate-500 tabular-nums">
              {analysis.wordCount} từ · {analysis.paragraphCount} đoạn
            </span>
          </div>

          {studentAnswer.trim() ? (
            <div className="font-serif text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-100 whitespace-pre-line max-h-64 overflow-y-auto pr-1">
              {studentAnswer}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-800 dark:text-rose-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Em chưa nhập nội dung cho câu tự luận này.</span>
            </div>
          )}
        </div>

        {/* Right: Teacher's Standard Outline */}
        <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 space-y-2.5">
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-emerald-200/70 dark:border-emerald-800/60">
            <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>Dàn ý chuẩn & Đáp án (Cô Cao Thị Thu)</span>
            </span>
            {onPracticeAgain && (
              <button
                type="button"
                onClick={onPracticeAgain}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 text-[11px] font-bold text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Luyện viết lại</span>
              </button>
            )}
          </div>

          <div className="font-serif text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-100 whitespace-pre-line max-h-64 overflow-y-auto pr-1">
            {question.essayOutline || question.correctAnswer}
          </div>
        </div>
      </div>

      {/* Interactive Rubric Self-Assessment Checklist */}
      <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-slate-800/70 border border-amber-200 dark:border-slate-700 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
            <ClipboardCheck className="w-4 h-4 text-amber-600" />
            <span>Tự đối chiếu theo Biểu điểm Rubric (Tích vào các ý em đã viết đúng):</span>
          </span>
          <span className="px-2.5 py-0.5 rounded-lg bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 text-xs font-bold text-[#073B66] dark:text-sky-300 tabular-nums">
            Tự đối chiếu: {selfCheckScore.toFixed(2)}đ · Tham khảo máy chấm: {analysis.score.toFixed(2)}đ
          </span>
        </div>

        <div className="space-y-1.5">
          {analysis.criteriaMatches.map((item, idx) => {
            const isChecked = !!checkedMap[idx];
            return (
              <button
                key={idx}
                type="button"
                onClick={() =>
                  setCheckedMap((prev) => ({ ...prev, [idx]: !prev[idx] }))
                }
                className={`w-full text-left p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-colors text-xs ${
                  isChecked
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950 dark:bg-emerald-950/40 dark:border-emerald-700 dark:text-emerald-100'
                    : 'bg-white border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-5 h-5 rounded-md flex items-center justify-center border shrink-0 ${
                      isChecked
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {isChecked && <Check className="w-3.5 h-3.5" />}
                  </span>
                  <span className="font-medium">{item.criteria}</span>
                </div>
                <span className="font-bold tabular-nums shrink-0 text-emerald-800 dark:text-emerald-300">
                  +{item.points.toFixed(2)}đ
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Key Takeaway Summary */}
      {question.correctAnswer && (
        <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200">
          <strong className="text-[#073B66] dark:text-sky-300">📌 Ý chốt ghi nhớ:</strong>{' '}
          {question.correctAnswer}
        </div>
      )}
    </div>
  );
};
