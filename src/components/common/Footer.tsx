import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#073B66] text-slate-200 border-t border-[#085a96]/40 py-3 px-6 text-xs select-none">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
        <div>
          © 2025. <span className="font-bold text-white">SỬ HỌC SỐ</span> – Hệ thống hỗ trợ dạy học môn Lịch sử |{' '}
          <span className="text-cyan-200">
            Trung tâm GDNN – GDTX thành phố Quảng Ninh - Phân hiệu Tiên Yên
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-cyan-200 font-serif italic text-xs">
          <span>Kết nối tri thức - Lan tỏa giá trị lịch sử</span>
          <span className="text-sm">🍃</span>
        </div>
      </div>
    </footer>
  );
};
