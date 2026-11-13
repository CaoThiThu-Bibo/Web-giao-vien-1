// ============================================================================
// CHƯƠNG TRÌNH LỊCH SỬ THPT (GDPT 2018 - HỆ GDTX)
// Phân chia theo Khối 10, Khối 11, Khối 12: Chương / Chủ đề & Bài học
// Biên soạn phục vụ công tác giảng dạy & ra đề của Cô Cao Thị Thu (Phân hiệu Tiên Yên)
// ============================================================================

export interface TopicItem {
  id: string;
  name: string;
  lessons: string[];
}

export interface GradeCurriculum {
  grade: 10 | 11 | 12;
  title: string;
  topics: TopicItem[];
}

export const HISTORY_CURRICULUM: Record<10 | 11 | 12, GradeCurriculum> = {
  10: {
    grade: 10,
    title: 'Lịch sử 10 (Chương trình GDPT 2018 - GDTX)',
    topics: [
      {
        id: '10_cd1',
        name: 'Chủ đề 1: Lịch sử và Sử học',
        lessons: [
          'Bài 1: Hiện thực lịch sử và nhận thức lịch sử',
          'Bài 2: Tri thức lịch sử và cuộc sống',
          'Bài 3: Sử học với các lĩnh vực khoa học khác',
        ],
      },
      {
        id: '10_cd2',
        name: 'Chủ đề 2: Vai trò của Sử học',
        lessons: [
          'Bài 4: Sử học với công tác bảo tồn di sản văn hóa',
          'Bài 5: Khái niệm văn minh và sự tiến bộ nhân loại',
        ],
      },
      {
        id: '10_cd3',
        name: 'Chủ đề 3: Một số nền văn minh thế giới thời cổ - trung đại',
        lessons: [
          'Bài 6: Văn minh Ai Cập cổ đại',
          'Bài 7: Văn minh Ấn Độ cổ - trung đại',
          'Bài 8: Văn minh Trung Hoa cổ - trung đại',
          'Bài 9: Văn minh Hy Lạp - La Mã cổ đại',
          'Bài 10: Văn minh Tây Âu thời Phục hưng',
        ],
      },
      {
        id: '10_cd4',
        name: 'Chủ đề 4: Các cuộc cách mạng công nghiệp',
        lessons: [
          'Bài 11: Các cuộc cách mạng công nghiệp thời cận đại',
          'Bài 12: Các cuộc cách mạng công nghiệp thời hiện đại',
        ],
      },
      {
        id: '10_cd5',
        name: 'Chủ đề 5: Văn minh Đông Nam Á thời cổ - trung đại',
        lessons: [
          'Bài 13: Hành trình phát triển và thành tựu văn minh Đông Nam Á',
        ],
      },
      {
        id: '10_cd6',
        name: 'Chủ đề 6: Một số nền văn minh trên đất nước Việt Nam',
        lessons: [
          'Bài 14: Văn minh Văn Lang - Âu Lạc',
          'Bài 15: Văn minh Chăm-pa và văn minh Phù Nam',
          'Bài 16: Văn minh Đại Việt (Chính trị, Kinh tế, Văn hóa)',
        ],
      },
      {
        id: '10_cd7',
        name: 'Chủ đề 7: Cộng đồng các dân tộc Việt Nam',
        lessons: [
          'Bài 17: Các dân tộc trên đất nước Việt Nam và khối đại đoàn kết',
        ],
      },
    ],
  },

  11: {
    grade: 11,
    title: 'Lịch sử 11 (Chương trình GDPT 2018 - GDTX)',
    topics: [
      {
        id: '11_cd1',
        name: 'Chủ đề 1: Cách mạng tư sản và Chủ nghĩa tư bản',
        lessons: [
          'Bài 1: Một số vấn đề chung về cách mạng tư sản',
          'Bài 2: Sự xác lập và phát triển của chủ nghĩa tư bản',
          'Bài 3: Sự phát triển của chủ nghĩa tư bản hiện đại',
        ],
      },
      {
        id: '11_cd2',
        name: 'Chủ đề 2: Chủ nghĩa xã hội từ năm 1917 đến nay',
        lessons: [
          'Bài 4: Sự hình thành Liên bang Cộng hòa XHCN Xô viết',
          'Bài 5: Sự phát triển của CNXH từ sau CTTG II đến nay',
        ],
      },
      {
        id: '11_cd3',
        name: 'Chủ đề 3: Độc lập dân tộc ở Đông Nam Á',
        lessons: [
          'Bài 6: Hành trình đi đến độc lập dân tộc ở Đông Nam Á',
          'Bài 7: Phong trào đấu tranh giải phóng dân tộc Đông Nam Á',
        ],
      },
      {
        id: '11_cd4',
        name: 'Chủ đề 4: Chiến tranh bảo vệ Tổ quốc trong lịch sử Việt Nam',
        lessons: [
          'Bài 8: Khởi nghĩa và chiến tranh giải phóng dân tộc trước 1945',
          'Bài 9: Các cuộc kháng chiến chống Tống, Mông - Nguyên, Minh, Thanh',
        ],
      },
      {
        id: '11_cd5',
        name: 'Chủ đề 5: Một số cuộc cải cách lớn trong lịch sử Việt Nam',
        lessons: [
          'Bài 10: Cuộc cải cách của Hồ Quý Ly và triều Hồ',
          'Bài 11: Cuộc cải cách của vua Lê Thánh Tông (thế kỷ XV)',
          'Bài 12: Cuộc cải cách của vua Minh Mạng (nửa đầu thế kỷ XIX)',
        ],
      },
      {
        id: '11_cd6',
        name: 'Chủ đề 6: Bảo vệ chủ quyền hợp pháp ở Biển Đông',
        lessons: [
          'Bài 13: Vị trí địa lý và tầm quan trọng chiến lược của Biển Đông',
          'Bài 14: Lịch sử xác lập và đấu tranh bảo vệ chủ quyền Biển Đông',
        ],
      },
    ],
  },

  12: {
    grade: 12,
    title: 'Lịch sử 12 (Chương trình GDPT 2018 - GDTX)',
    topics: [
      {
        id: '12_cd1',
        name: 'Chủ đề 1: Thế giới trong và sau Chiến tranh lạnh',
        lessons: [
          'Bài 1: Liên hợp quốc - Mục tiêu, nguyên tắc và vai trò',
          'Bài 2: Trật tự thế giới hai cực I-an-ta và Chiến tranh lạnh',
          'Bài 3: Trật tự thế giới sau Chiến tranh lạnh và xu thế đa cực',
        ],
      },
      {
        id: '12_cd2',
        name: 'Chủ đề 2: ASEAN: Những chặng đường lịch sử',
        lessons: [
          'Bài 4: Sự ra đời và phát triển của Hiệp hội ASEAN',
          'Bài 5: Cộng đồng ASEAN: Tầm nhìn và triển vọng hợp tác',
        ],
      },
      {
        id: '12_cd3',
        name: 'Chủ đề 3: Cách mạng tháng Tám 1945 và Kháng chiến chống Pháp (1945 - 1954)',
        lessons: [
          'Bài 6: Cách mạng tháng Tám 1945 và khai sinh nước VNDCCH',
          'Bài 7: Kháng chiến chống thực dân Pháp (1945 - 1954)',
          'Bài 8: Chiến dịch Điện Biên Phủ và Hiệp định Giơ-ne-vơ 1954',
        ],
      },
      {
        id: '12_cd4',
        name: 'Chủ đề 4: Cuộc kháng chiến chống Mỹ, cứu nước (1954 - 1975)',
        lessons: [
          'Bài 9: Kháng chiến chống Mỹ cứu nước giai đoạn 1954 - 1965',
          'Bài 10: Kháng chiến chống Mỹ cứu nước giai đoạn 1965 - 1975',
          'Bài 11: Đại thắng mùa Xuân 1975 và ý nghĩa lịch sử',
        ],
      },
      {
        id: '12_cd5',
        name: 'Chủ đề 5: Công cuộc Đổi mới ở Việt Nam từ năm 1986 đến nay',
        lessons: [
          'Bài 12: Khái quát đường lối Đổi mới đất nước từ năm 1986',
          'Bài 13: Thành tựu tiêu biểu về kinh tế, văn hóa, xã hội và đối ngoại',
        ],
      },
      {
        id: '12_cd6',
        name: 'Chủ đề 6: Lịch sử đối ngoại và Chủ tịch Hồ Chí Minh',
        lessons: [
          'Bài 14: Hoạt động đối ngoại của Việt Nam thời kỳ cận - hiện đại',
          'Bài 15: Hồ Chí Minh - Anh hùng giải phóng dân tộc, Danh nhân văn hóa',
        ],
      },
    ],
  },
};

/**
 * Lấy danh sách tên tất cả các Chương / Chủ đề của 1 khối lớp
 */
export function getTopicsForGrade(grade: 10 | 11 | 12): string[] {
  const curr = HISTORY_CURRICULUM[grade];
  if (!curr) return [];
  return curr.topics.map((t) => t.name);
}

/**
 * Lấy danh sách bài học thuộc 1 Chương / Chủ đề của 1 khối lớp
 */
export function getLessonsForTopic(grade: 10 | 11 | 12, topicName: string): string[] {
  const curr = HISTORY_CURRICULUM[grade];
  if (!curr) return [];
  const found = curr.topics.find(
    (t) => t.name.toLowerCase().trim() === topicName.toLowerCase().trim()
  );
  if (found) return found.lessons;

  // Tìm kiếm tương đối nếu chuỗi không trùng khớp hoàn toàn
  const fuzzy = curr.topics.find(
    (t) =>
      topicName.toLowerCase().includes(t.name.toLowerCase()) ||
      t.name.toLowerCase().includes(topicName.toLowerCase())
  );
  if (fuzzy) return fuzzy.lessons;

  // Nếu không tìm thấy trong danh mục chuẩn thì trả về danh sách tất cả các bài của khối để Cô dễ chọn
  return curr.topics.flatMap((t) => t.lessons);
}

/**
 * Lấy danh sách tất cả bài học của một khối
 */
export function getAllLessonsForGrade(grade: 10 | 11 | 12): string[] {
  const curr = HISTORY_CURRICULUM[grade];
  if (!curr) return [];
  return curr.topics.flatMap((t) => t.lessons);
}
