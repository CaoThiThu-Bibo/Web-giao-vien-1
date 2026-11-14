import React from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Maximize,
  AlertTriangle,
  Lock,
  EyeOff,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Volume2,
  FileWarning,
  ClipboardX,
} from 'lucide-react';

export type ProctoringViolationType =
  | 'fullscreen_exit'
  | 'tab_switch'
  | 'window_blur'
  | 'split_screen'
  | 'shortcut_block'
  | 'copy_attempt';

export interface ProctoringViolation {
  id: string;
  timestamp: string;
  type: ProctoringViolationType;
  label: string;
  detail: string;
  durationSeconds?: number;
}

export function playProctoringAlertBeep(isSevere: boolean): void {
  try {
    const AudioCtx =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = isSevere ? 'sawtooth' : 'triangle';
    osc.frequency.setValueAtTime(isSevere ? 620 : 520, now);
    osc.frequency.setValueAtTime(isSevere ? 440 : 640, now + 0.12);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  } catch {
    // Ignore audio context restrictions if autoplay policy blocks sound
  }
}

interface ExamProctoringPreStartGateProps {
  roomTitle: string;
  studentName: string;
  studentCode?: string;
  className: string;
  durationMinutes: number;
  questionCount: number;
  theme: 'sepia' | 'white' | 'dark';
  isTeacherPreview?: boolean;
  isMobileDevice?: boolean;
  onStartExam: () => void;
  onCancel: () => void;
}

export const ExamProctoringPreStartGate: React.FC<ExamProctoringPreStartGateProps> = ({
  roomTitle,
  studentName,
  studentCode,
  className,
  durationMinutes,
  questionCount,
  theme,
  isTeacherPreview,
  isMobileDevice = false,
  onStartExam,
  onCancel,
}) => {
  const surfaceClass =
    theme === 'dark'
      ? 'bg-[#1D222D] border-slate-700 text-slate-100'
      : theme === 'sepia'
      ? 'bg-[#FFFDF8] border-[#E4D9C0] text-[#2C2416]'
      : 'bg-white border-slate-200 text-slate-900';

  const ruleBoxClass =
    theme === 'dark'
      ? 'bg-slate-800/70 border-slate-700 text-slate-200'
      : 'bg-slate-50 border-slate-200 text-slate-700';

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex items-center justify-center font-sans">
      <div className={`max-w-3xl w-full rounded-3xl border p-6 sm:p-8 shadow-lg space-y-6 ${surfaceClass}`}>
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200/80 dark:border-slate-700/80 pb-5">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#073B66] text-white flex items-center justify-center shrink-0 shadow-sm">
              <ShieldCheck className="w-6 h-6 text-amber-300" />
            </div>
            <div className="space-y-1">
              <div className="text-xs font-semibold text-[#0878C9] dark:text-sky-400">
                Trung tâm GDNN - GDTX TP Quảng Ninh · Phân hiệu Tiên Yên
              </div>
              <h3 className="text-lg sm:text-xl font-bold leading-snug text-balance">
                Quy chế Giám sát Toàn màn hình trước khi vào phòng thi
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {roomTitle}
              </p>
            </div>
          </div>

          {isTeacherPreview && (
            <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 px-3 py-1.5 rounded-xl whitespace-nowrap shrink-0">
              Chế độ xem thử góc nhìn Thí sinh
            </span>
          )}
        </div>

        {/* Candidate Metadata Strip */}
        <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl border text-xs ${ruleBoxClass}`}>
          <div>
            <div className="text-slate-500 dark:text-slate-400">Thí sinh dự thi</div>
            <div className="font-bold mt-0.5 truncate">
              {studentName} {studentCode ? `(${studentCode})` : ''}
            </div>
          </div>
          <div>
            <div className="text-slate-500 dark:text-slate-400">Lớp</div>
            <div className="font-bold mt-0.5 truncate">{className}</div>
          </div>
          <div>
            <div className="text-slate-500 dark:text-slate-400">Thời gian làm bài</div>
            <div className="font-bold mt-0.5 tabular-nums">
              {durationMinutes > 0 ? `${durationMinutes} phút` : 'Không giới hạn'}
            </div>
          </div>
          <div>
            <div className="text-slate-500 dark:text-slate-400">Số lượng câu hỏi</div>
            <div className="font-bold mt-0.5 tabular-nums">{questionCount} câu</div>
          </div>
        </div>

        {/* 4 Core Proctoring Rules - Phương án 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className={`p-4 rounded-2xl border space-y-1.5 ${ruleBoxClass}`}>
            <div className="font-bold text-[#073B66] dark:text-sky-300 flex items-center gap-2">
              <Maximize className="w-4 h-4 text-[#0878C9] shrink-0" />
              <span>
                {isMobileDevice
                  ? '1. Giữ màn hình phòng thi tập trung'
                  : '1. Bắt buộc Toàn màn hình'}
              </span>
            </div>
            <p className="leading-relaxed opacity-90">
              {isMobileDevice ? (
                <>
                  Trên điện thoại, hệ thống khóa màn hình thi tập trung. Không thoát ra màn hình chính hoặc mở Zalo/Messenger khi chưa nộp bài.
                </>
              ) : (
                <>
                  Hệ thống tự động mở chế độ Toàn màn hình. Nếu nhấn <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-[11px]">ESC</kbd> hoặc thoát toàn màn hình, đề thi sẽ tạm khóa cho đến khi quay lại.
                </>
              )}
            </p>
          </div>

          <div className={`p-4 rounded-2xl border space-y-1.5 ${ruleBoxClass}`}>
            <div className="font-bold text-[#073B66] dark:text-sky-300 flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-[#0878C9] shrink-0" />
              <span>2. Không chuyển Tab / Chia đôi màn hình</span>
            </div>
            <p className="leading-relaxed opacity-90">
              Mọi thao tác chuyển tab trình duyệt, mở ứng dụng khác hoặc thu hẹp cửa sổ để tra cứu đều được ghi nhận kèm thời gian thực.
            </p>
          </div>

          <div className={`p-4 rounded-2xl border space-y-1.5 ${ruleBoxClass}`}>
            <div className="font-bold text-[#073B66] dark:text-sky-300 flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#0878C9] shrink-0" />
              <span>3. Khóa sao chép & Phím tắt</span>
            </div>
            <p className="leading-relaxed opacity-90">
              Vô hiệu hóa bôi đen đề, chuột phải, <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-[11px]">Ctrl+C</kbd>, dán văn bản ngoài, <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-[11px]">F12</kbd> và gắn mã định danh mờ trên bài thi.
            </p>
          </div>

          <div className={`p-4 rounded-2xl border space-y-1.5 ${ruleBoxClass}`}>
            <div className="font-bold text-[#073B66] dark:text-sky-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>4. Xử lý vi phạm sư phạm (Phương án 1)</span>
            </div>
            <p className="leading-relaxed opacity-90">
              <strong>Lần 1–2:</strong> Cảnh báo nhắc nhở. <strong>Từ lần 3:</strong> Gắn nhãn <em>Cảnh báo quy chế</em> trên phiếu điểm và gửi nhật ký về cho Cô Cao Thị Thu (không hủy bài đột ngột).
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </button>

          <button
            type="button"
            onClick={onStartExam}
            className="w-full sm:w-auto min-h-[44px] px-6 py-3 rounded-xl bg-[#073B66] hover:bg-[#0878C9] text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 sm:whitespace-nowrap shrink-0 active:scale-[0.99]"
          >
            <Maximize className="w-4 h-4 text-amber-300 shrink-0" />
            <span>
              {isMobileDevice
                ? 'Tôi hiểu quy chế & Bắt đầu làm bài'
                : 'Tôi hiểu quy chế & Bắt đầu làm bài (Toàn màn hình)'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

interface ExamProctoringWarningOverlayProps {
  violationCount: number;
  latestViolation: ProctoringViolation | null;
  fullscreenSupported: boolean;
  onResumeExam: () => void;
  onRequestSubmitEarly?: () => void;
}

export const ExamProctoringWarningOverlay: React.FC<ExamProctoringWarningOverlayProps> = ({
  violationCount,
  latestViolation,
  fullscreenSupported,
  onResumeExam,
  onRequestSubmitEarly,
}) => {
  const isCritical = violationCount >= 3;

  return (
    <div
      className="fixed inset-0 z-[70] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 font-sans"
      role="alertdialog"
      aria-modal="true"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
        <div className="flex items-start gap-3.5">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              isCritical
                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
            }`}
          >
            {isCritical ? (
              <ShieldAlert className="w-6 h-6" />
            ) : (
              <AlertTriangle className="w-6 h-6" />
            )}
          </div>
          <div className="space-y-1">
            <div
              className={`text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 ${
                isCritical
                  ? 'text-rose-700 dark:text-rose-400'
                  : 'text-amber-700 dark:text-amber-400'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>
                {isCritical
                  ? `Cảnh báo quy chế nghiêm trọng · Lần thứ ${violationCount}`
                  : `Nhắc nhở quy chế phòng thi · Lần ${violationCount} / 3`}
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
              {latestViolation?.label || 'Phát hiện rời khỏi vùng làm bài thi'}
            </h3>
          </div>
        </div>

        <div
          className={`p-4 rounded-2xl border text-xs space-y-2 ${
            isCritical
              ? 'bg-rose-50/80 border-rose-200 text-rose-950 dark:bg-rose-950/30 dark:border-rose-800 dark:text-rose-100'
              : 'bg-amber-50/80 border-amber-200 text-amber-950 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-100'
          }`}
        >
          <div className="flex items-center justify-between gap-2 font-semibold">
            <span>Chi tiết ghi nhận:</span>
            {latestViolation?.timestamp && (
              <span className="font-mono tabular-nums opacity-80">
                {latestViolation.timestamp}
              </span>
            )}
          </div>
          <p className="leading-relaxed">
            {latestViolation?.detail ||
              'Hệ thống đã tạm ẩn nội dung câu hỏi để đảm bảo tính công bằng của phòng thi.'}
          </p>
          {typeof latestViolation?.durationSeconds === 'number' && latestViolation.durationSeconds > 0 && (
            <div className="flex items-center gap-1.5 font-semibold tabular-nums pt-0.5">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>Thời gian rời khỏi màn hình thi: {latestViolation.durationSeconds} giây</span>
            </div>
          )}
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          {isCritical ? (
            <>
              Phiếu điểm của em đã được gắn nhãn <strong>Cảnh báo quy chế ({violationCount} lần)</strong> và nhật ký chi tiết sẽ được gửi về cho <strong>Cô Cao Thị Thu</strong>. Hãy tập trung hoàn thành nốt bài thi trên màn hình thi.
            </>
          ) : (
            <>
              Theo quy chế GDTX (Phương án 1), hệ thống <strong>không hủy bài</strong> để em tiếp tục hoàn thành, nhưng đã lưu lại sự kiện này. Nếu vi phạm từ <strong>lần thứ 3 trở lên</strong>, phiếu điểm sẽ bị gắn nhãn cảnh báo gửi giáo viên.
            </>
          )}
        </p>

        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-2.5 pt-1">
          {onRequestSubmitEarly && (
            <button
              type="button"
              onClick={onRequestSubmitEarly}
              className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer transition-colors whitespace-nowrap shrink-0"
            >
              Nộp bài ngay
            </button>
          )}
          <button
            type="button"
            onClick={onResumeExam}
            className={`w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-md cursor-pointer transition-all flex items-center justify-center gap-2 whitespace-nowrap shrink-0 ${
              isCritical
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-[#073B66] hover:bg-[#0878C9]'
            }`}
          >
            <Maximize className="w-4 h-4 shrink-0" />
            <span>
              {fullscreenSupported
                ? 'Quay lại Toàn màn hình & Tiếp tục làm bài'
                : 'Tôi cam kết & Tiếp tục làm bài'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

interface ExamProctoringWatermarkProps {
  studentName: string;
  studentCode?: string;
  className: string;
  roomLabel: string;
}

export const ExamProctoringWatermark: React.FC<ExamProctoringWatermarkProps> = ({
  studentName,
  studentCode,
  className,
  roomLabel,
}) => {
  const stamp = `${studentName}${studentCode ? ` · ${studentCode}` : ''} · ${className} · ${roomLabel}`;
  const rows = [0, 1, 2, 3, 4];

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none select-none absolute inset-0 overflow-hidden z-10 flex flex-col justify-around opacity-[0.045] dark:opacity-[0.06]"
    >
      {rows.map((r) => (
        <div
          key={r}
          className="flex items-center justify-around whitespace-nowrap -rotate-12 text-xs sm:text-sm font-sans font-bold tracking-wider text-slate-900 dark:text-slate-100 gap-12"
        >
          <span>{stamp}</span>
          <span>{stamp}</span>
          <span>{stamp}</span>
        </div>
      ))}
    </div>
  );
};

interface ExamProctoringScorecardReportProps {
  violations: ProctoringViolation[];
  wasProctored: boolean;
  themeCardClasses: string;
}

export const ExamProctoringScorecardReport: React.FC<ExamProctoringScorecardReportProps> = ({
  violations,
  wasProctored,
  themeCardClasses,
}) => {
  if (!wasProctored) return null;

  const count = violations.length;
  const statusInfo =
    count === 0
      ? {
          label: 'Hợp lệ · Nghiêm túc (0 vi phạm)',
          desc: 'Thí sinh giữ nguyên chế độ Toàn màn hình và không rời khỏi phòng thi trong suốt thời gian làm bài.',
          badgeClass: 'text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />,
        }
      : count < 3
      ? {
          label: `Nhắc nhở nhẹ · ${count} lần rời / thao tác bất thường`,
          desc: 'Thí sinh có rời khỏi trạng thái thi dưới ngưỡng cảnh báo (1–2 lần). Giáo viên cân nhắc nhắc nhở thêm.',
          badgeClass: 'text-amber-900 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800',
          icon: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />,
        }
      : {
          label: `Cảnh báo quy chế · ${count} lần vi phạm`,
          desc: 'Thí sinh vượt quá 2 lần cảnh báo quy chế phòng thi. Nhật ký vi phạm đã được đính kèm gửi Cô Cao Thị Thu.',
          badgeClass: 'text-rose-900 dark:text-rose-300 bg-rose-100 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800',
          icon: <FileWarning className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />,
        };

  return (
    <div className={`p-5 rounded-3xl border space-y-4 font-sans ${themeCardClasses}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-start gap-2.5">
          {statusInfo.icon}
          <div>
            <h4 className="font-bold text-sm text-[#073B66] dark:text-sky-300">
              Báo cáo Giám sát Phòng thi Toàn màn hình (Phương án 1)
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {statusInfo.desc}
            </p>
          </div>
        </div>

        <span className={`px-3 py-1 rounded-xl border text-xs font-bold tabular-nums whitespace-nowrap shrink-0 ${statusInfo.badgeClass}`}>
          {statusInfo.label}
        </span>
      </div>

      {violations.length === 0 ? (
        <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Không ghi nhận hành vi thoát toàn màn hình, chuyển tab hoặc sao chép đề thi nào.</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                <th className="py-2 pr-3 font-semibold">STT</th>
                <th className="py-2 pr-3 font-semibold">Thời điểm</th>
                <th className="py-2 pr-3 font-semibold">Hành vi ghi nhận</th>
                <th className="py-2 font-semibold">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {violations.map((v, i) => (
                <tr key={v.id}>
                  <td className="py-2 pr-3 font-mono tabular-nums text-slate-500">{i + 1}</td>
                  <td className="py-2 pr-3 font-mono tabular-nums font-semibold whitespace-nowrap">{v.timestamp}</td>
                  <td className="py-2 pr-3 font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5">
                      {v.type === 'copy_attempt' || v.type === 'shortcut_block' ? (
                        <ClipboardX className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      )}
                      {v.label}
                    </span>
                  </td>
                  <td className="py-2 text-slate-600 dark:text-slate-300">
                    {v.detail}
                    {typeof v.durationSeconds === 'number' && v.durationSeconds > 0
                      ? ` (${v.durationSeconds}s)`
                      : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
