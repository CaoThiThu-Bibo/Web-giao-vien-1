import { Question, QuestionType, TrueFalseStatement } from '../types';
import * as mammoth from 'mammoth';

/**
 * Generates and triggers download of a standardized Word document (.doc)
 * containing templates and examples for both Single Choice and True/False questions.
 */
export function downloadWordTemplate() {
  const content = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset="utf-8">
<title>File Word Mẫu Câu Hỏi Lịch Sử - GDNN GDTX</title>
<style>
  body { font-family: 'Times New Roman', serif; font-size: 13pt; line-height: 1.5; color: #000; }
  h1 { font-size: 16pt; font-weight: bold; text-align: center; color: #073B66; text-transform: uppercase; margin-bottom: 5px; }
  h2 { font-size: 14pt; font-weight: bold; color: #0878C9; margin-top: 20px; border-bottom: 2px solid #0878C9; padding-bottom: 4px; }
  .note { background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 10px; margin: 15px 0; font-size: 11pt; }
  .question-box { margin-bottom: 15px; padding: 8px 12px; background-color: #f8fafc; border: 1px solid #cbd5e1; }
  .q-title { font-weight: bold; }
  .q-opt { margin-left: 20px; }
  .q-ans { font-weight: bold; color: #15803d; margin-top: 4px; }
  .q-tf { margin-left: 20px; }
</style>
</head>
<body>
  <h1>MẪU SOẠN CÂU HỎI NGÂN HÀNG ĐỀ KIỂM TRA MÔN LỊCH SỬ</h1>
  <p style="text-align: center; font-style: italic; margin-top: 0;">(Dành cho giáo viên GDTX - Định dạng chuẩn tích hợp hệ thống)</p>

  <div class="note">
    <strong>HƯỚNG DẪN DÀNH CHO GIÁO VIÊN:</strong><br/>
    1. Cô chỉ việc copy câu hỏi trong tài liệu của mình và dán theo cú pháp dưới đây, hoặc gõ trực tiếp vào file này rồi lưu lại (.docx hoặc .doc).<br/>
    2. Mỗi câu bắt đầu bằng: <code>Câu 1:</code>, <code>Câu 2:</code>...<br/>
    3. <strong>Trắc nghiệm 1 đáp án:</strong> Các phương án bắt đầu bằng <code>A.</code>, <code>B.</code>, <code>C.</code>, <code>D.</code> Dòng đáp án ghi: <code>Đáp án: A</code> (hoặc B, C, D).<br/>
    4. <strong>Trắc nghiệm Đúng/Sai:</strong> Đoạn trích tư liệu ở trên, sau đó là 4 ý <code>a)</code>, <code>b)</code>, <code>c)</code>, <code>d)</code>. Cuối mỗi ý ghi rõ <code>- Đúng</code> hoặc <code>- Sai</code> (hoặc <code>[Đúng]</code>, <code>[Sai]</code>).
  </div>

  <h2>PHẦN I: CÂU HỎI TRẮC NGHIỆM CHỈ CHỌN MỘT ĐÁP ÁN</h2>

  <div class="question-box">
    <p class="q-title">Câu 1: Hiện thực lịch sử là gì?</p>
    <p class="q-opt">A. Tất cả những gì đã diễn ra trong quá khứ, tồn tại hoàn toàn khách quan, không phụ thuộc vào ý muốn con người.</p>
    <p class="q-opt">B. Những câu chuyện truyền thuyết do nhân dân dân gian sáng tạo ra.</p>
    <p class="q-opt">C. Toàn bộ nhận thức chủ quan của các nhà sử học về quá khứ.</p>
    <p class="q-opt">D. Những dự đoán của con người về tương lai dựa trên quy luật xã hội.</p>
    <p class="q-ans">Đáp án: A</p>
    <p style="font-style: italic; font-size: 11pt; color: #475569;">Giải thích: Hiện thực lịch sử diễn ra độc lập với ý thức của con người.</p>
  </div>

  <div class="question-box">
    <p class="q-title">Câu 2: Kế sách "Vườn không nhà trống" được quân dân nhà Trần áp dụng hiệu quả nhất nhằm mục đích gì?</p>
    <p class="q-opt">A. Tránh đụng độ trực diện khi địch còn mạnh, triệt tiêu nguồn tiếp tế lương thảo khiến giặc khốn đốn.</p>
    <p class="q-opt">B. Nhử địch vào sâu trong đất liền để tiêu diệt bằng phục kích rừng núi.</p>
    <p class="q-opt">C. Rút lui toàn bộ sang nước láng giềng bảo toàn sinh lực.</p>
    <p class="q-opt">D. Chờ đợi viện binh từ các quốc gia trong khu vực Đông Nam Á.</p>
    <p class="q-ans">Đáp án: A</p>
    <p style="font-style: italic; font-size: 11pt; color: #475569;">Giải thích: Kế sách triệt tiêu nguồn hậu cần tại chỗ của quân Mông - Nguyên.</p>
  </div>

  <div class="question-box">
    <p class="q-title">Câu 3: Thành tựu tiêu biểu nhất về kỹ thuật quân sự của cư dân Âu Lạc dưới thời An Dương Vương là gì?</p>
    <p class="q-opt">A. Kỹ thuật đúc súng thần cơ.</p>
    <p class="q-opt">B. Chế tạo nỏ Liên Cơ (nỏ bắn nhiều mũi tên) và xây dựng thành Cổ Loa kiên cố.</p>
    <p class="q-opt">C. Chế tạo thuyền bọc đồng chống chìm.</p>
    <p class="q-opt">D. Kỹ thuật đúc trống đồng Đông Sơn.</p>
    <p class="q-ans">Đáp án: B</p>
  </div>

  <h2>PHẦN II: CÂU HỎI TRẮC NGHIỆM ĐÚNG SAI (CHUẨN BỘ GD&ĐT 2025)</h2>

  <div class="question-box">
    <p class="q-title">Câu 4: Đọc đoạn tư liệu sau đây trích trong Tuyên ngôn Độc lập (ngày 2/9/1945):<br/>
    "Tất cả mọi người đều sinh ra có quyền bình đẳng. Tạo hóa cho họ những quyền không ai có thể xâm phạm được; trong những quyền ấy, có quyền được sống, quyền tự do và quyền mưu cầu hạnh phúc... Nước Việt Nam có quyền hưởng tự do và độc lập, và sự thật đã thành một nước tự do, độc lập. Toàn thể dân tộc Việt Nam quyết đem tất cả tinh thần và lực lượng, tính mạng và của cải để giữ vững quyền tự do, độc lập ấy."</p>
    <p class="q-tf">a) Tuyên ngôn Độc lập đã mở đầu bằng việc trích dẫn bản Tuyên ngôn Độc lập của nước Mỹ năm 1776 và Tuyên ngôn Nhân quyền và Dân quyền của Pháp năm 1789. - Đúng</p>
    <p class="q-tf">b) Bản Tuyên ngôn Độc lập được thông qua và tuyên đọc lần đầu tiên tại Đại hội Quốc dân Tân Trào. - Sai</p>
    <p class="q-tf">c) Văn kiện đã phát triển quyền tự nhiên của con người thành quyền tự quyết thiêng liêng của toàn thể các dân tộc. - Đúng</p>
    <p class="q-tf">d) Bản Tuyên ngôn Độc lập tuyên bố xóa bỏ chế độ phong kiến và chấm dứt ách thống trị của thực dân Pháp, phát xít Nhật. - Đúng</p>
    <p class="q-ans">Đáp án: a-Đ, b-S, c-Đ, d-Đ</p>
  </div>

  <div class="question-box">
    <p class="q-title">Câu 5: Đọc đoạn trích sau về phong trào Cần Vương cuối thế kỷ XIX:<br/>
    "Ngày 13/7/1885, tại căn cứ Tân Sở (Quảng Trị), Tôn Thất Thuyết nhân danh vua Hàm Nghi ban dụ Cần Vương kêu gọi văn thân, sĩ phu và nhân dân cả nước đứng lên phò vua cứu nước. Phong trào nhanh chóng bùng nổ, kéo dài hơn một thập kỷ, tiêu biểu là các cuộc khởi nghĩa Ba Đình, Bãi Sậy, Hương Khê..."</p>
    <p class="q-tf">a) Phong trào Cần Vương thực chất là phong trào đấu tranh yêu nước chống Pháp theo khuynh hướng phong kiến. - Đúng</p>
    <p class="q-tf">b) Khởi nghĩa Hương Khê (1885 - 1896) do Phan Đình Phùng lãnh đạo là cuộc khởi nghĩa tiêu biểu nhất của phong trào Cần Vương. - Đúng</p>
    <p class="q-tf">c) Cuộc khởi nghĩa nông dân Yên Thế do Hoàng Hoa Thám lãnh đạo là một bộ phận nằm trong phong trào Cần Vương. - Sai</p>
    <p class="q-tf">d) Sự thất bại của phong trào Cần Vương chứng tỏ hệ tư tưởng phong kiến không còn đủ sức lãnh đạo cách mạng giải phóng dân tộc. - Đúng</p>
    <p class="q-ans">Đáp án: a-Đ, b-Đ, c-S, d-Đ</p>
  </div>
</body>
</html>
  `;

  const blob = new Blob(['\ufeff', content], {
    type: 'application/msword',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Mau_Cau_Hoi_Trac_Nghiem_Va_Dung_Sai_Lich_Su.doc';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export interface ParsedQuestionResult {
  questions: Omit<Question, 'id' | 'updatedAt'>[];
  totalParsed: number;
  singleCount: number;
  tfCount: number;
  errors: string[];
}

/**
 * Extracts plain text from an uploaded file (.docx, .doc, .txt)
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (extension === 'docx') {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  }

  // Text file or fallback
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve((e.target?.result as string) || '');
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
}

/**
 * Intelligent parser that reads text and parses both Single-Choice and True/False questions
 */
export function parseQuestionsFromText(
  rawText: string,
  defaultGrade: 10 | 11 | 12 = 10,
  defaultTopic: string = 'Lịch sử Việt Nam',
  defaultLesson: string = 'Chương trình GDNN - GDTX',
  defaultAuthor: string = 'Cao Thị Thu'
): ParsedQuestionResult {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const errors: string[] = [];
  const parsedQuestions: Omit<Question, 'id' | 'updatedAt'>[] = [];

  // Group text into raw question blocks based on markers like "Câu 1:", "Câu 2.", "Bài 1:"
  const blocks: string[][] = [];
  let currentBlock: string[] = [];

  const questionStartRegex = /^(Câu|Bài)\s*(\d+)[:.]/i;

  for (const line of lines) {
    if (questionStartRegex.test(line)) {
      if (currentBlock.length > 0) {
        blocks.push(currentBlock);
      }
      currentBlock = [line];
    } else {
      if (currentBlock.length > 0) {
        currentBlock.push(line);
      }
    }
  }

  if (currentBlock.length > 0) {
    blocks.push(currentBlock);
  }

  // If no "Câu X:" format found, try splitting by blank lines
  if (blocks.length === 0 && lines.length > 0) {
    const rawParagraphs = rawText.split(/\n\s*\n/);
    for (const p of rawParagraphs) {
      const pLines = p.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
      if (pLines.length >= 3) {
        blocks.push(pLines);
      }
    }
  }

  // Process each block
  for (let bIdx = 0; bIdx < blocks.length; bIdx++) {
    const block = blocks[bIdx];
    const fullText = block.join('\n');

    // Check if it's a True/False question
    // Indicators: contains "a)", "b)", "c)", "d)" OR "a.", "b.", "c.", "d."
    const hasTFSubQuestions =
      /(\n|^)[a-d][.)]\s+/i.test(fullText) &&
      (/(đúng|sai|\[đúng\]|\[sai\]|đ|s)/i.test(fullText) || /a\)/i.test(fullText));

    // Check if it's Single Choice (contains A., B., C., D.)
    const hasSingleOptions =
      /(\n|^)A[.)]\s+/i.test(fullText) &&
      /(\n|^)B[.)]\s+/i.test(fullText);

    if (hasTFSubQuestions) {
      // Parse True/False question
      const parsedTF = parseTrueFalseBlock(block, defaultGrade, defaultTopic, defaultLesson, defaultAuthor);
      if (parsedTF) {
        parsedQuestions.push(parsedTF);
      } else {
        errors.push(`Khối câu số ${bIdx + 1}: Chưa đủ 4 ý a, b, c, d hoặc không đúng định dạng Đúng/Sai.`);
      }
    } else if (hasSingleOptions) {
      // Parse Single Choice question
      const parsedSingle = parseSingleChoiceBlock(block, defaultGrade, defaultTopic, defaultLesson, defaultAuthor);
      if (parsedSingle) {
        parsedQuestions.push(parsedSingle);
      } else {
        errors.push(`Khối câu số ${bIdx + 1}: Thiếu phương án lựa chọn hoặc không tìm thấy nội dung.`);
      }
    } else {
      // Check if it's a single question line with options or couldn't parse
      errors.push(`Khối câu số ${bIdx + 1}: Không xác định được dạng (cần có các lựa chọn A, B, C, D hoặc các ý a, b, c, d).`);
    }
  }

  let singleCount = 0;
  let tfCount = 0;
  parsedQuestions.forEach((q) => {
    if (q.type === 'Trắc nghiệm đơn') singleCount++;
    if (q.type === 'Trắc nghiệm đúng sai') tfCount++;
  });

  return {
    questions: parsedQuestions,
    totalParsed: parsedQuestions.length,
    singleCount,
    tfCount,
    errors,
  };
}

/**
 * Parse a single choice question block
 */
function parseSingleChoiceBlock(
  block: string[],
  grade: 10 | 11 | 12,
  topic: string,
  lesson: string,
  author: string
): Omit<Question, 'id' | 'updatedAt'> | null {
  let content = '';
  const optionsMap: Record<string, string> = { A: '', B: '', C: '', D: '' };
  let correctAnswer = 'A';
  let explanation = '';

  let currentKey = 'CONTENT';

  for (const line of block) {
    const cleanLine = line.trim();

    // Check Answer line
    const ansMatch = cleanLine.match(/^(Đáp\s*án|ĐA|Key)[:.]?\s*([A-D])/i);
    if (ansMatch) {
      correctAnswer = ansMatch[2].toUpperCase();
      continue;
    }

    // Check Explanation line
    const expMatch = cleanLine.match(/^(Giải\s*thích|Hướng\s*dẫn|HD)[:.]?\s*(.*)$/i);
    if (expMatch) {
      explanation = expMatch[2];
      currentKey = 'EXP';
      continue;
    }

    // Check Option lines A., B., C., D.
    const optMatch = cleanLine.match(/^([A-D])[.)]\s*(.*)$/i);
    if (optMatch) {
      const optLetter = optMatch[1].toUpperCase();
      optionsMap[optLetter] = optMatch[2].trim();
      currentKey = optLetter;
      continue;
    }

    // Append to current key
    if (currentKey === 'CONTENT') {
      content += (content ? '\n' : '') + cleanLine;
    } else if (['A', 'B', 'C', 'D'].includes(currentKey)) {
      optionsMap[currentKey] += ' ' + cleanLine;
    } else if (currentKey === 'EXP') {
      explanation += ' ' + cleanLine;
    }
  }

  // Clean title prefix like "Câu 1:"
  content = content.replace(/^(Câu|Bài)\s*\d+[:.]\s*/i, '').trim();

  // If options A and B don't exist, fail
  if (!optionsMap.A || !optionsMap.B) {
    return null;
  }

  // Determine cognitive level heuristically
  let cognitiveLevel: 'Nhận biết' | 'Thông hiểu' | 'Vận dụng' | 'Vận dụng cao' = 'Thông hiểu';
  if (content.toLowerCase().includes('là gì') || content.toLowerCase().includes('vào năm nào') || content.toLowerCase().includes('ai là người')) {
    cognitiveLevel = 'Nhận biết';
  } else if (content.toLowerCase().includes('ý nghĩa') || content.toLowerCase().includes('nhằm mục đích') || content.toLowerCase().includes('vì sao')) {
    cognitiveLevel = 'Vận dụng';
  } else if (content.toLowerCase().includes('rút ra') || content.toLowerCase().includes('bài học') || content.toLowerCase().includes('đỉnh cao')) {
    cognitiveLevel = 'Vận dụng cao';
  }

  return {
    grade,
    topic,
    lesson,
    knowledgeDomain: 'Trắc nghiệm kiến thức lịch sử',
    type: 'Trắc nghiệm đơn',
    cognitiveLevel,
    content,
    options: [
      `A. ${optionsMap.A || 'Phương án A'}`,
      `B. ${optionsMap.B || 'Phương án B'}`,
      `C. ${optionsMap.C || 'Phương án C'}`,
      `D. ${optionsMap.D || 'Phương án D'}`,
    ],
    correctAnswer,
    explanation: explanation || 'Căn cứ vào SGK Lịch sử và tài liệu hướng dẫn ôn tập GDPT 2018.',
    source: `SGK Lịch sử ${grade} - Bộ GD&ĐT`,
    author,
  };
}

/**
 * Parse a True/False question block
 */
function parseTrueFalseBlock(
  block: string[],
  grade: 10 | 11 | 12,
  topic: string,
  lesson: string,
  author: string
): Omit<Question, 'id' | 'updatedAt'> | null {
  let content = '';
  const statements: TrueFalseStatement[] = [];
  let explanation = '';

  const tfRegex = /^([a-d])[.)]\s*(.*)$/i;

  for (const line of block) {
    const cleanLine = line.trim();

    // Check Explanation line
    const expMatch = cleanLine.match(/^(Giải\s*thích|Hướng\s*dẫn|HD)[:.]?\s*(.*)$/i);
    if (expMatch) {
      explanation = expMatch[2];
      continue;
    }

    // Skip summary answer line if present (e.g., "Đáp án: a-Đ, b-S, c-Đ, d-Đ")
    if (/^(Đáp\s*án|Key)[:.]?\s*[a-d]/i.test(cleanLine)) {
      continue;
    }

    const match = cleanLine.match(tfRegex);
    if (match) {
      const id = match[1].toLowerCase() as 'a' | 'b' | 'c' | 'd';
      let stmtText = match[2].trim();
      let isCorrect = true; // default

      // Check if ends with "- Đúng", "- Sai", "(Đúng)", "[Sai]", etc.
      if (/(-\s*sai|:\s*sai|\[sai\]|\(sai\)|\s+sai$)/i.test(stmtText)) {
        isCorrect = false;
        stmtText = stmtText.replace(/(-\s*sai|:\s*sai|\[sai\]|\(sai\)|\s+sai$)/i, '').trim();
      } else if (/(-\s*đúng|:\s*đúng|\[đúng\]|\(đúng\)|\s+đúng$)/i.test(stmtText)) {
        isCorrect = true;
        stmtText = stmtText.replace(/(-\s*đúng|:\s*đúng|\[đúng\]|\(đúng\)|\s+đúng$)/i, '').trim();
      } else if (/(-\s*s|:\s*s|\[s\]|\(s\)|\s+s$)/i.test(stmtText)) {
        isCorrect = false;
        stmtText = stmtText.replace(/(-\s*s|:\s*s|\[s\]|\(s\)|\s+s$)/i, '').trim();
      } else if (/(-\s*đ|:\s*đ|\[đ\]|\(đ\)|\s+đ$)/i.test(stmtText)) {
        isCorrect = true;
        stmtText = stmtText.replace(/(-\s*đ|:\s*đ|\[đ\]|\(đ\)|\s+đ$)/i, '').trim();
      }

      statements.push({
        id,
        statement: stmtText,
        isCorrect,
      });
    } else {
      if (statements.length === 0) {
        content += (content ? '\n' : '') + cleanLine;
      }
    }
  }

  // Clean prompt prefix
  content = content.replace(/^(Câu|Bài)\s*\d+[:.]\s*/i, '').trim();

  if (statements.length < 2) {
    return null;
  }

  // Ensure all 4 letters a, b, c, d exist if possible
  const validStatements = statements.slice(0, 4);

  const formattedAnswer = validStatements
    .map((s) => `${s.id}-${s.isCorrect ? 'ĐÚNG' : 'SAI'}`)
    .join(', ');

  return {
    grade,
    topic,
    lesson,
    knowledgeDomain: 'Trắc nghiệm đúng sai theo năng lực',
    type: 'Trắc nghiệm đúng sai',
    cognitiveLevel: 'Thông hiểu',
    content,
    trueFalseStatements: validStatements,
    correctAnswer: formattedAnswer,
    explanation: explanation || 'Căn cứ vào tư liệu lịch sử chính thống và kiến thức SGK GDPT 2018.',
    source: `Tư liệu Lịch sử & SGK lớp ${grade}`,
    author,
  };
}
