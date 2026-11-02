# Kế Hoạch Triển Khai: Phân Hệ Trò Chơi Lịch Sử Tương Tác
*(Dành riêng cho Cô Cao Thị Thu - Trung tâm GDNN – GDTX Tiên Yên)*

---

## 1. Giới Thiệu & Mục Tiêu Sư Phạm

Phân hệ **Trò chơi Lịch sử Tương tác (Interactive History Games Hub)** được xây dựng nhằm đổi mới phương pháp dạy học môn Lịch sử cấp THPT (chương trình GDTX), biến các mốc niên đại, nhân vật và sự kiện lịch sử vốn khô khan thành trải nghiệm học tập sinh động, trực quan và giàu tính phản xạ.

### Mục tiêu chính:
1. **Khắc phục tâm lý ngại nhớ mốc thời gian:** Tận dụng cơ chế trò chơi (gamification) để học sinh ghi nhớ tự nhiên qua tương tác tay - mắt.
2. **Linh hoạt 2 hình thức sử dụng:**
   - **Chế độ Lớp học (Classroom Projector Mode):** Giáo viên chiếu lên máy chiếu / Tivi thông minh trên lớp, chia tổ/đội thi đua tính điểm trong 5–7 phút đầu giờ (khởi động) hoặc cuối giờ (củng cố).
   - **Chế độ Tự học (Student Solo Mode):** Học sinh tự chơi trên điện thoại / máy tính tại nhà để củng cố bài cũ.
3. **Đồng bộ dữ liệu thông minh:**
   - Tự động lấy câu hỏi, thuật ngữ, sự kiện từ **Ngân hàng câu hỏi sẵn có** của hệ thống.
   - Cung cấp **Bảng soạn nhanh thẻ game** để Cô Thu dễ dàng thêm các mốc sự kiện mới theo đúng bài giảng trong tuần.

---

## 2. Chi Tiết Thiết Kế 3 Trò Chơi Tương Tác

### 🎯 Trò chơi 1: Vòng Quay Lịch Sử (History Spin The Wheel)
- **Cơ chế hoạt động:**
  - Một vòng quay màu sắc phong cách cổ điển/hiện đại gồm 8–12 ô: Các mốc lịch sử trọng tâm (*1945, 1954, 1975, Ianta, Hiệp định Paris, v.v.*) xen kẽ ô *Cơ hội nhân đôi điểm, Ô may mắn, Thử thách tốc độ*.
  - Người chơi bấm nút quay với hiệu ứng âm thanh và kim chỉ chân thực.
  - Khi dừng ở ô nào, hộp câu hỏi tương ứng sẽ xuất hiện (trắc nghiệm A-B-C-D hoặc giải mã từ khóa) trong thời gian giới hạn (15s - 30s).
- **Tính năng đặc biệt:**
  - Bảng điểm chia 2 Đội: **Đội Đỏ (Sao Vàng)** vs **Đội Xanh (Quyết Thắng)** có nút cộng/trừ điểm và hiệu ứng pháo hoa khi trả lời đúng.
  - Hỗ trợ câu hỏi tự chọn từ Ngân hàng câu hỏi hoặc Cô tự nạp danh sách sự kiện cần kiểm tra đầu giờ.

---

### 🎯 Trò chơi 2: Lật Thẻ Ghi Nhớ (History Memory Flip & Match)
- **Cơ chế hoạt động:**
  - Bàn cờ gồm 12 hoặc 16 thẻ bài úp mặt (xếp thành lưới 3x4 hoặc 4x4).
  - Nhiệm vụ của học sinh: Lật mở 2 thẻ bất kỳ để tìm cặp tương ứng:
    - *Cặp Thời gian - Sự kiện:* Thẻ `Năm 1954` ghép với Thẻ `Chiến thắng Điện Biên Phủ`.
    - *Cặp Nhân vật - Cống hiến:* Thẻ `Nguyễn Ái Quốc` ghép với Thẻ `Tìm ra con đường cứu nước (1911)`.
    - *Cặp Hội nghị - Quyết định:* Thẻ `Hội nghị Ianta (1945)` ghép với Thẻ `Thỏa thuận khu vực đóng quân & chia vùng ảnh hưởng`.
  - Nếu đúng: 2 thẻ phát sáng viền xanh lá, hiển thị chú giải lịch sử và giữ nguyên mặt ngửa.
  - Nếu sai: Thẻ tự động úp lại sau 1.2 giây để người chơi ghi nhớ vị trí.
- **Tính năng đặc biệt:**
  - Bộ đếm thời gian và đếm số lượt lật (Turns counter).
  - Ba cấp độ: Dễ (8 thẻ / 4 cặp), Trung bình (12 thẻ / 6 cặp), Nâng cao (16 thẻ / 8 cặp).
  - Tự động xáo trộn ngẫu nhiên mỗi lần chơi mới, không bao giờ trùng lặp vị trí.

---

### 🎯 Trò chơi 3: Dòng Thời Gian Lịch Sử (Chronological Timeline Sorter)
- **Cơ chế hoạt động:**
  - Hệ thống đưa ra 4 đến 6 thẻ sự kiện lịch sử bị xáo trộn thứ tự thời gian.
  - Học sinh dùng thao tác **Kéo - Thả (Drag & Drop)** hoặc bấm mũi tên chuyển vị trí để sắp xếp các sự kiện theo đúng tiến trình từ quá khứ đến hiện tại trên trục dòng thời gian (Timeline Axis).
  - *Ví dụ chuỗi sự kiện:*
    1. CMT8 thành công (1945)
    2. Toàn quốc kháng chiến bùng nổ (1946)
    3. Chiến dịch Biên giới Thu - Đông (1950)
    4. Chiến dịch Điện Biên Phủ (1954)
    5. Phong trào Đồng Khởi (1960)
    6. Đại thắng mùa Xuân (1975)
- **Tính năng đặc biệt:**
  - Nút **[ Kiểm tra dòng thời gian ]**: Các sự kiện xếp đúng chuyển màu xanh lục kèm năm xuất hiện; sự kiện xếp sai rung lắc nhẹ màu đỏ để học sinh kéo lại.
  - Nút **[ Xem giải thích tiến trình nhân quả ]**: Hiển thị tóm tắt mối liên hệ lịch sử logic giữa các sự kiện vừa xếp.

---

## 3. Kiến Trúc Dữ Liệu & Bộ Công Cụ Quản Lý Dành Cho Giáo Viên

```
[Ngân hàng câu hỏi Lịch sử (Bank)] 
             │
             ├──► [Bộ chuyển đổi tự động sang Game Data Engine]
             │         │
             │         ├──► Trò chơi 1: Vòng quay lịch sử
             │         ├──► Trò chơi 2: Lật thẻ ghi nhớ
             │         └──► Trò chơi 3: Dòng thời gian lịch sử
             │
[Form Soạn Thẻ Game Nhanh] ──► [Lưu trữ vào Local/Supabase & Đồng bộ Ngân hàng]
```

### Các thành phần kỹ thuật dự kiến bổ sung:
1. **Component chính:** `src/components/history-games/HistoryGamesHubModal.tsx`
   - Bảng điều khiển chọn trò chơi, thiết lập chế độ (Chơi đơn / Đấu đội trên lớp) và cài đặt thời gian/âm thanh.
2. **Component từng game:**
   - `src/components/history-games/SpinWheelGame.tsx` (Canvas quay mượt mà, kim chỉ, âm thanh tick).
   - `src/components/history-games/MemoryMatchGame.tsx` (Hiệu ứng lật 3D CSS `transform-style: preserve-3d`).
   - `src/components/history-games/TimelineOrderGame.tsx` (Trục thời gian tương tác kéo thả mượt mà trên cả máy tính & điện thoại).
3. **Component Quản lý & Soạn thẻ Game:**
   - `src/components/history-games/CustomGameDataEditor.tsx` (Cô Thu có thể tạo nhanh danh sách câu hỏi / cặp từ khóa riêng chỉ trong 1 phút).

---

## 4. Kế Hoạch Xác Nhận & Tiến Trình Triển Khai

- [x] **Bước 1 (Đã hoàn thành):** Thu thập ý kiến định hướng từ Cô Thu qua câu hỏi tương tác.
- [ ] **Bước 2 (Đang chờ Cô duyệt):** Cô Thu duyệt qua phương án 3 trò chơi nêu trên. Cô có thể góp ý chỉnh sửa bất kỳ chi tiết nào (thêm luật chơi, giao diện, âm thanh, v.v.).
- [ ] **Bước 3 (Triển khai mã nguồn):** Sau khi Cô bấm nút **"Proceed"** hoặc gửi tin nhắn đồng ý, em sẽ bắt đầu tạo các component mã nguồn hoàn chỉnh và tích hợp nút truy cập vào trang chính.
- [ ] **Bước 4 (Kiểm thử & Bàn giao):** Chạy kiểm thử TypeScript, kiểm tra giao diện hiển thị trên máy chiếu lớp học và báo cáo Cô nghiệm thu.
