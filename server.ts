import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize Google Gen AI
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Health & Status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    appName: 'SỬ HỌC SỐ',
    school: 'Trung tâm GDNN – GDTX thành phố Quảng Ninh - Phân hiệu Tiên Yên',
    teacher: 'Cao Thị Thu',
    hasApiKey: !!apiKey,
    model: 'gemini-3.8-flash',
  });
});

// API: Lesson Plan Generator (Kế hoạch bài dạy GDPT 2018)
app.post('/api/gemini/generate-plan', async (req, res) => {
  const { grade, topic, lessonName, duration, bookSeries, studentLevel, specificNotes } = req.body;

  const prompt = `
Bạn là chuyên gia sư phạm Lịch sử Việt Nam, nắm vững Chương trình Giáo dục phổ thông (GDPT) 2018 môn Lịch sử và Chương trình GDTX cấp THPT.
Hãy soạn KẾ HOẠCH BÀI DẠY (Giáo án) chi tiết, chuẩn mực cho:
- Khối lớp: Lớp ${grade || 10} (Chương trình GDTX cấp THPT)
- Bộ sách: ${bookSeries || 'Kết nối tri thức với cuộc sống / Cánh Diều'}
- Tên bài: ${lessonName || topic || 'Chủ đề Lịch sử Việt Nam'}
- Thời lượng: ${duration || '2 tiết (90 phút)'}
- Đối tượng học sinh: Học viên GDTX Tiên Yên (trình độ: ${studentLevel || 'đa dạng, cần trực quan, dễ hiểu'})
- Ghi chú giáo viên: ${specificNotes || 'Không có'}

Cấu trúc giáo án bắt buộc gồm các phần:
I. MỤC TIÊU BÀI HỌC
1. Năng lực lịch sử (Tìm hiểu lịch sử, Nhận thức và tư duy lịch sử, Vận dụng kiến thức, kỹ năng đã học)
2. Phẩm chất chủ yếu (Yêu nước, Trách nhiệm, Trung thực)

II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU
- Giáo viên chuẩn bị (Bản đồ, sơ đồ tư duy, tư liệu ảnh, máy chiếu/phiếu học tập)
- Học viên chuẩn bị (SGK, vở ghi)

III. TIẾN TRÌNH DẠY HỌC (Chuẩn Công văn hướng dẫn GDPT 2018)
1. Hoạt động 1: Khởi động (Mục tiêu, Nội dung, Sản phẩm, Tổ chức thực hiện hấp dẫn)
2. Hoạt động 2: Hình thành kiến thức mới (Chia thành các mục rõ ràng, phân định rõ: Hoạt động của GV - Hoạt động của HS - Sản phẩm cần đạt)
3. Hoạt động 3: Luyện tập (Hệ thống câu hỏi trắc nghiệm/tự luận ngắn củng cố kiến thức trọng tâm)
4. Hoạt động 4: Vận dụng (Nhiệm vụ thực tế, liên hệ quê hương Quảng Ninh hoặc liên hệ thời đại)

IV. HỒ SƠ DẠY HỌC VÀ PHIẾU HỌC TẬP (Kèm mẫu 1 phiếu học tập chi tiết).

Yêu cầu: Viết tiếng Việt chuẩn xác về mốc thời gian, nhân vật, sự kiện lịch sử, không tự bịa đặt niên đại, văn phong sư phạm trang trọng, rõ ràng.
`;

  try {
    if (!ai) {
      throw new Error('Chưa cấu hình GEMINI_API_KEY trên server.');
    }
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });
    res.json({ success: true, text: response.text });
  } catch (err: any) {
    console.warn('Gemini API call failed or not configured, returning curricular template:', err?.message);
    res.json({
      success: true,
      text: getFallbackLessonPlan(grade, lessonName || topic),
      isFallback: true,
      note: 'Dữ liệu được tạo từ khung Kế hoạch bài dạy chuẩn Chương trình Lịch sử GDTX cấp THPT.',
    });
  }
});

// API: Exam Matrix & Questions Generator
app.post('/api/gemini/generate-exam', async (req, res) => {
  const { grade, topic, examType, duration, numMC, numEssay, difficultyDistribution } = req.body;

  const prompt = `
Bạn là chuyên gia khảo thí và đánh giá môn Lịch sử THPT/GDTX.
Hãy xây dựng MA TRẬN, BẢN ĐẶC TẢ VÀ ĐỀ KIỂM TRA MÔN LỊCH SỬ:
- Khối lớp: Lớp ${grade || 10}
- Chủ đề kiểm tra: ${topic || 'Lịch sử Việt Nam'}
- Hình thức: ${examType || 'Kết hợp Trắc nghiệm và Tự luận'}
- Thời gian làm bài: ${duration || '45 phút'}
- Số câu trắc nghiệm: ${numMC || 12} câu
- Số câu tự luận: ${numEssay || 2} câu
- Tỉ lệ nhận thức: ${difficultyDistribution || '40% Nhận biết, 30% Thông hiểu, 20% Vận dụng, 10% Vận dụng cao'}

Nội dung xuất ra gồm 3 phần:
Phần I: MA TRẬN VÀ BẢN ĐẶC TẢ ĐỀ KIỂM TRA (Bảng phân bổ câu hỏi theo 4 mức độ nhận thức)
Phần II: ĐỀ BÀI KIỂM TRA
- A. PHẦN TRẮC NGHIỆM KHÁCH QUAN (${numMC || 12} câu, 4 lựa chọn A, B, C, D rõ ràng)
- B. PHẦN TỰ LUẬN (${numEssay || 2} câu hỏi phát triển năng lực tư duy lịch sử, khai thác tư liệu)
Phần III: ĐÁP ÁN, HƯỚNG DẪN CHẤM VÀ THANG ĐIỂM CHI TIẾT
- Bảng đáp án trắc nghiệm kèm giải thích ngắn
- Biểu điểm tự luận chi tiết từng ý (chuẩn xác mốc thời gian, ý nghĩa lịch sử).
`;

  try {
    if (!ai) {
      throw new Error('Chưa cấu hình GEMINI_API_KEY trên server.');
    }
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });
    res.json({ success: true, text: response.text });
  } catch (err: any) {
    console.warn('Gemini API call failed or not configured, returning exam template:', err?.message);
    res.json({
      success: true,
      text: getFallbackExam(grade, topic),
      isFallback: true,
    });
  }
});

// API: Student Support & Remedial Recommendation
app.post('/api/gemini/support-recommendation', async (req, res) => {
  const { studentName, grade, averageScore, attendanceNotes, difficultAreas } = req.body;

  const prompt = `
Là chuyên gia tâm lý sư phạm và giáo viên Lịch sử giàu kinh nghiệm tại Trung tâm GDNN - GDTX, hãy đưa ra:
KẾ HOẠCH HỖ TRỢ VÀ TƯ VẤN HỌC TẬP CÁ NHÂN HÓA:
- Học sinh: ${studentName || 'Học viên'} (Lớp ${grade || 10})
- Điểm trung bình môn Lịch sử hiện tại: ${averageScore || 'Dưới 5.0'}
- Tình trạng chuyên cần: ${attendanceNotes || 'Thỉnh thoảng vắng, tiếp thu chậm'}
- Khó khăn cụ thể: ${difficultAreas || 'Khó nhớ mốc thời gian, khó phân tích ý nghĩa lịch sử'}

Hãy đề xuất cho cô giáo Cao Thị Thu:
1. Đánh giá nguyên nhân cốt lõi (Không phán xét tiêu cực, chỉ rõ rào cản học tập)
2. Kế hoạch hành động 4 tuần (Mục tiêu từng tuần, bài tập vi mô, phương pháp trực quan/sơ đồ tư duy)
3. Biện pháp khích lệ tâm lý và phối hợp cùng gia đình/chủ nhiệm
4. Mẫu bài tập củng cố vừa sức giúp học sinh lấy lại hứng thú học Lịch sử.
`;

  try {
    if (!ai) {
      throw new Error('Chưa cấu hình GEMINI_API_KEY trên server.');
    }
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });
    res.json({ success: true, text: response.text });
  } catch (err: any) {
    res.json({
      success: true,
      text: getFallbackSupportPlan(studentName, averageScore),
      isFallback: true,
    });
  }
});

// Fallback high-quality curriculum generators
function getFallbackLessonPlan(grade = 10, topic = 'Cách mạng tháng Tám năm 1945'): string {
  return `TRUNG TÂM GDNN - GDTX TP QUẢNG NINH - PHÂN HIỆU TIÊN YÊN
GIÁO VIÊN: CAO THỊ THU - TỔ KHXH

KẾ HOẠCH BÀI DẠY (GIÁO ÁN ĐIỆN TỬ THEO GDPT 2018)
BÀI HỌC: ${topic.toUpperCase()} (LỚP ${grade} - CHƯƠNG TRÌNH GDTX CẤP THPT)
Thời lượng: 2 tiết (90 phút)

I. MỤC TIÊU BÀI HỌC
1. Năng lực lịch sử:
- Tìm hiểu lịch sử: Biết cách khai thác tư liệu hình ảnh, lược đồ và trích đoạn văn kiện lịch sử.
- Nhận thức và tư duy lịch sử: Trình bày được bối cảnh lịch sử, diễn biến chính, nguyên nhân thắng lợi và ý nghĩa lịch sử sâu sắc của sự kiện.
- Vận dụng: Vận dụng bài học lịch sử về nắm bắt thời cơ vào cuộc sống và rèn luyện bản thân.
2. Phẩm chất:
- Bồi dưỡng lòng yêu nước, niềm tự hào dân tộc, lòng biết ơn đối với thế hệ cha anh đã hy sinh vì nền độc lập tự do của Tổ quốc.

II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU
1. Giáo viên:
- Máy chiếu, máy tính có kết nối hệ thống SỬ HỌC SỐ.
- Bản đồ/Lược đồ khởi nghĩa, ảnh tư liệu (Quảng trường Ba Đình 2/9/1945, lệnh Tổng khởi nghĩa).
- Phiếu học tập số 1 và số 2 cho các nhóm học viên.
2. Học viên:
- SGK Lịch sử, vở ghi chép, điện thoại/thiết bị truy cập phòng học trực tuyến SỬ HỌC SỐ.

III. TIẾN TRÌNH DẠY HỌC
1. Hoạt động 1: KHỞI ĐỘNG (7 phút)
- Mục tiêu: Kích hoạt sự tò mò và hiểu biết ban đầu của học viên về sự kiện.
- Nội dung: Cho học viên nghe đoạn âm thanh trích Tuyên ngôn Độc lập ngày 2/9/1945 và quan sát bức ảnh Bác Hồ đọc Tuyên ngôn.
- Câu hỏi định hướng: "Giọng đọc thiêng liêng ấy cất lên vào ngày nào, và dân tộc ta đã phải trải qua những cuộc đấu tranh hào hùng nào để có được giây phút độc lập đó?"
- Sản phẩm: Câu trả lời hào hứng của học viên, GV dẫn dắt vào bài mới.

2. Hoạt động 2: HÌNH THÀNH KIẾN THỨC MỚI (55 phút)
- Mục 1: Bối cảnh lịch sử và Thời cơ cách mạng chín muồi.
  + GV hướng dẫn học viên đọc tư liệu, thảo luận cặp đôi về khái niệm "ngàn năm có một".
  + HS hoàn thành bảng so sánh điều kiện khách quan và chủ quan.
- Mục 2: Diễn biến cuộc khởi nghĩa giành chính quyền.
  + Sử dụng lược đồ động trên màn hình lớp học: Hà Nội (19/8), Huế (23/8), Sài Gòn (25/8).
  + Học viên thảo luận nhóm theo bàn ghi lại các mốc thời gian mấu chốt.
- Mục 3: Nguyên nhân thắng lợi, ý nghĩa lịch sử và bài học kinh nghiệm.
  + Đúc kết 4 bài học lớn: Phát huy sức mạnh đại đoàn kết toàn dân, dự đoán thời cơ chính xác, kết hợp khởi nghĩa nông thôn với thành thị, xây dựng lực lượng vũ trang và chính trị.

3. Hoạt động 3: LUYỆN TẬP (18 phút)
- Học viên truy cập mục "Phòng học trực tuyến" trên hệ thống SỬ HỌC SỐ tham gia trò chơi trắc nghiệm 8 câu hỏi củng cố.
- Giáo viên quan sát màn hình tổng hợp điểm số tức thì, tuyên dương học viên làm nhanh và chính xác nhất.

4. Hoạt động 4: VẬN DỤNG VÀ MỞ RỘNG (10 phút)
- Nhiệm vụ: "Là thế hệ trẻ tại Quảng Ninh hôm nay, em rút ra được bài học gì về việc chủ động chuẩn bị năng lực để nắm bắt 'thời cơ' trong học tập và lập nghiệp?"
- Bài tập nộp qua mục Bài tập trực tuyến trên hệ thống trước tiết học tuần sau.

IV. PHIẾU HỌC TẬP SỐ 1
- Câu 1: Nêu 3 sự kiện quốc tế tạo nên thời cơ thuận lợi cho cách mạng Việt Nam năm 1945?
- Câu 2: Vì sao Đảng ta khẳng định: "Dù phải đốt cháy cả dãy Trường Sơn cũng phải kiên quyết giành cho được độc lập"?`;
}

function getFallbackExam(grade = 10, topic = 'Lịch sử Việt Nam thế kỷ XX'): string {
  return `SỞ GD&ĐT TỈNH QUẢNG NINH
TRUNG TÂM GDNN - GDTX THÀNH PHỐ QUẢNG NINH - PHÂN HIỆU TIÊN YÊN
ĐỀ KIỂM TRA ĐỊNH KỲ MÔN LỊCH SỬ - LỚP ${grade}
Thời gian làm bài: 45 phút (Không kể thời gian phát đề)
Giáo viên ra đề: Cao Thị Thu

A. MA TRẬN ĐỀ KIỂM TRA
- Nhận biết: 40% (4 điểm) - 8 câu trắc nghiệm
- Thông hiểu: 30% (3 điểm) - 4 câu trắc nghiệm + 1 ý tự luận
- Vận dụng: 20% (2 điểm) - 1 câu tự luận
- Vận dụng cao: 10% (1 điểm) - 1 ý tự luận liên hệ thực tế

B. ĐỀ BÀI
I. PHẦN TRẮC NGHIỆM (6.0 điểm - Mỗi câu đúng 0.5 điểm)
Câu 1: Bản chỉ thị "Nhật - Pháp bắn nhau và hành động của chúng ta" được Ban Thường vụ Trung ương Đảng ban hành vào thời gian nào?
A. Ngày 9/3/1945
B. Ngày 12/3/1945
C. Ngày 15/4/1945
D. Ngày 14/8/1945

Câu 2: Bốn tỉnh giành được chính quyền ở tỉnh lỵ sớm nhất trong Cách mạng tháng Tám năm 1945 là:
A. Hà Nội, Huế, Sài Gòn, Hải Phòng
B. Bắc Giang, Hải Dương, Hà Tĩnh, Quảng Nam
C. Thái Nguyên, Tuyên Quang, Cao Bằng, Lạng Sơn
D. Quảng Ninh, Hải Phòng, Nam Định, Thanh Hóa

Câu 3: Ngày 2/9/1945, tại Quảng trường Ba Đình (Hà Nội), Chủ tịch Hồ Chí Minh đã:
A. Ra Lời kêu gọi toàn quốc kháng chiến
B. Đọc bản Tuyên ngôn Độc lập khai sinh nước Việt Nam Dân chủ Cộng hòa
C. Thành lập Mặt trận Việt Minh
D. Ký Hiệp định Sơ bộ

Câu 4: Thắng lợi nào của quân và dân ta đã làm phá sản hoàn toàn kế hoạch Na-va của thực dân Pháp?
A. Chiến dịch Việt Bắc thu - đông 1947
B. Chiến dịch Biên giới thu - đông 1950
C. Chiến dịch Điện Biên Phủ 1954
D. Chiến dịch Tây Bắc 1952

II. PHẦN TỰ LUẬN (4.0 điểm)
Câu 1 (2.5 điểm): Phân tích nguyên nhân thắng lợi và ý nghĩa lịch sử của Cách mạng tháng Tám năm 1945?
Câu 2 (1.5 điểm): Từ bài học "chớp thời cơ" trong Cách mạng tháng Tám năm 1945, hãy liên hệ trách nhiệm của học sinh GDTX hiện nay trong việc chủ động học tập, nắm bắt cơ hội chuyển đổi số và phát triển quê hương Tiên Yên - Quảng Ninh?

C. HƯỚNG DẪN CHẤM VÀ THANG ĐIỂM
- Trắc nghiệm: 1-B, 2-B, 3-B, 4-C.
- Tự luận:
  + Câu 1: Nêu đủ nguyên nhân chủ quan (1.0đ), nguyên nhân khách quan (0.5đ), ý nghĩa đối với dân tộc (0.5đ), ý nghĩa đối với phong trào giải phóng dân tộc trên thế giới (0.5đ).
  + Câu 2: Liên hệ logic, thực tế, thể hiện tinh thần chủ động tự học và trách nhiệm công dân trẻ (1.5đ).`;
}

function getFallbackSupportPlan(studentName = 'Học sinh', score = '4.5'): string {
  return `KẾ HOẠCH BỒI DƯỠNG VÀ HỖ TRỢ HỌC VIÊN CẦN QUAN TÂM
Đối tượng: ${studentName} | Điểm hiện tại: ${score}
Người lập kế hoạch: Cô Cao Thị Thu - Giáo viên Lịch sử

1. NHẬN ĐỊNH VÀ PHÂN TÍCH KHÓ KHĂN:
- Học viên còn lúng túng trong việc ghi nhớ các mốc sự kiện liên hoàn, dễ nhầm lẫn giữa các giai đoạn lịch sử.
- Thói quen học thụ động, chưa biết cách lập sơ đồ tư duy (Mindmap) hoặc dòng thời gian (Timeline).

2. BIỆN PHÁP HỖ TRỢ TRỌNG TÂM TRONG 4 TUẦN:
- Tuần 1: Rà soát lại kiến thức nền tảng; giao phiếu học tập điền khuyết với các mốc năm quan trọng nhất (thời gian làm bài ngắn: 10 phút/ngày).
- Tuần 2: Hướng dẫn vẽ "Dòng thời gian sự kiện" bằng các từ khóa ngắn gọn; ứng dụng câu hỏi trắc nghiệm trực quan trên SỬ HỌC SỐ.
- Tuần 3: Phân công bạn học khá trong tổ (Phương pháp "Đôi bạn cùng tiến") cùng ôn luyện, thảo luận câu hỏi tự luận ngắn.
- Tuần 4: Cho học viên làm bài kiểm tra thử 15 phút, động viên kịp thời khi có tiến bộ dù chỉ 0.5 - 1.0 điểm.

3. LỜI NHẮN NHỦ DÀNH CHO HỌC VIÊN:
"Lịch sử không phải là học thuộc lòng máy móc những con số, mà là hiểu về cội nguồn và niềm tự hào dân tộc. Cô luôn tin em sẽ tiến bộ từng ngày!"`;
}

// Development or Production handling
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SỬ HỌC SỐ] Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
