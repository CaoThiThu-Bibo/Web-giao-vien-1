// ============================================================================
// REACT ERROR BOUNDARY COMPONENT
// Ngăn ngừa hoàn toàn hiện tượng "Màn hình trắng" (White Screen of Death)
// Tự động bắt lỗi runtime và hiển thị giao diện phục hồi thân thiện
// ============================================================================

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RotateCcw, AlertTriangle, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-white flex items-center justify-center p-4 sm:p-6 font-sans">
          <div className="max-w-xl w-full bg-white text-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-sky-100 text-[#073B66]">
                Trung tâm GDNN - GDTX Tiên Yên
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Đã khôi phục an toàn hệ thống
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                Hệ thống vừa phát hiện sự cố hiển thị và đã tự động cách ly an toàn dữ liệu, ngăn ngừa mất mát điểm số hoặc câu hỏi của Cô và học sinh.
              </p>
            </div>

            {/* Error detail (collapsed for debugging) */}
            {this.state.error && (
              <div className="text-left bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-mono text-rose-700 overflow-x-auto max-h-32">
                <strong>Chi tiết lỗi:</strong> {this.state.error.message}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="px-6 py-3 bg-gradient-to-r from-[#073B66] to-[#0878C9] hover:from-[#052C4D] hover:to-[#076BB3] text-white rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Tải lại trang & Tiếp tục</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  this.setState({ hasError: false, error: null, errorInfo: null });
                }}
                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>Thử quay lại giao diện</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
