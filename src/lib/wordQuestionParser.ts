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
  essayCount?: number;
  errors: string[];
}

/**
 * Converts HTML string (from HTML-saved .doc or mammoth convertToHtml) to clean newline-separated text
 */
function htmlToCleanText(html: string): string {
  const withoutNoise = html
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<xml[\s\S]*?<\/xml>/gi, ' ')
    .replace(/<head[\s\S]*?<\/head>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ');

  const withBreaks = withoutNoise
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|tr|li|h[1-6]|blockquote)>/gi, '\n')
    .replace(/<\/(td|th)>/gi, '    ');

  if (typeof DOMParser !== 'undefined') {
    const doc = new DOMParser().parseFromString(withBreaks, 'text/html');
    const text = doc.body?.textContent || '';
    return text
      .replace(/\r\n/g, '\n')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  return withBreaks
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .trim();
}

/**
 * Extracts plain text from an uploaded file (.docx, .doc, .txt, .rtf, .html)
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  // Detect ZIP/OOXML signature (PK\x03\x04) — handles real .docx even if renamed .doc
  const isZipOoxml =
    bytes.length >= 4 &&
    bytes[0] === 0x50 &&
    bytes[1] === 0x4b &&
    bytes[2] === 0x03 &&
    bytes[3] === 0x04;

  // Detect Legacy Binary OLE2 Compound Document (.doc Word 97-2003)
  const isBinaryOleDoc =
    bytes.length >= 8 &&
    bytes[0] === 0xd0 &&
    bytes[1] === 0xcf &&
    bytes[2] === 0x11 &&
    bytes[3] === 0xe0 &&
    bytes[4] === 0xa1 &&
    bytes[5] === 0xb1 &&
    bytes[6] === 0x1a &&
    bytes[7] === 0xe1;

  if (extension === 'pdf' || ['png', 'jpg', 'jpeg', 'webp'].includes(extension)) {
    throw new Error(
      `File "${file.name}" là định dạng ${extension.toUpperCase()}. Cô hãy bấm nút "AI Tự động tách câu hỏi (Ảnh / PDF / Văn bản)" để hệ thống đọc nội dung này nhé!`
    );
  }

  if (isZipOoxml || extension === 'docx') {
    if (!isZipOoxml && extension === 'docx') {
      throw new Error(
        `File "${file.name}" có đuôi .docx nhưng không phải cấu trúc Word hợp lệ (hoặc bị đổi tên từ file .doc cũ). Cô hãy mở file, chọn Ctrl+A → Ctrl+C và dán vào ô văn bản bên cạnh.`
      );
    }
    const rawResult = await mammoth.extractRawText({ arrayBuffer });
    const rawText = (rawResult.value || '').trim();

    // If raw text missed line breaks/lists/tables (common with Word auto-numbering or 2-column tables), also inspect HTML output
    const rawOptionMatches = (rawText.match(/(^|\n|\s)[A-D][.)]\s+/g) || []).length;
    if (!rawText || rawOptionMatches < 4) {
      try {
        const htmlResult = await mammoth.convertToHtml({ arrayBuffer });
        const htmlText = htmlToCleanText(htmlResult.value || '');
        const htmlOptionMatches = (htmlText.match(/(^|\n|\s)[A-D][.)]\s+/g) || []).length;
        if (htmlText && htmlOptionMatches >= rawOptionMatches) {
          return htmlText;
        }
      } catch {
        // Fallback to rawText
      }
    }
    return rawText;
  }

  if (isBinaryOleDoc) {
    throw new Error(
      `File "${file.name}" là định dạng Word cũ (.doc nhị phân 97–2003) nên trình duyệt không đọc trực tiếp được. Cô vui lòng dùng 1 trong 3 cách rất nhanh:\n` +
        `1) Mở file Word trên máy → bấm Ctrl + A rồi Ctrl + C → Dán vào ô "Dán toàn bộ văn bản đề thi" bên cạnh.\n` +
        `2) Hoặc trong Word chọn File → Save As → chọn "Word Document (*.docx)" rồi tải lại.\n` +
        `3) Hoặc xuất sang PDF / chụp ảnh đề thi rồi dùng nút "AI Tự động tách từ Ảnh / PDF".`
    );
  }

  // Handle UTF-16 BOM or standard UTF-8 text / HTML-Word (.doc exported by HTML) / RTF
  let decodedText = '';
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
    decodedText = new TextDecoder('utf-16le').decode(bytes);
  } else if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
    decodedText = new TextDecoder('utf-16be').decode(bytes);
  } else {
    decodedText = new TextDecoder('utf-8').decode(bytes);
  }

  // If HTML-saved .doc (including downloadWordTemplate output) or .html/.htm
  if (
    /<(html|body|w:worddocument|meta|table|div|p)\b/i.test(decodedText) ||
    extension === 'html' ||
    extension === 'htm'
  ) {
    const cleaned = htmlToCleanText(decodedText);
    if (cleaned.length > 0) {
      return cleaned;
    }
  }

  // Basic RTF stripping if .rtf file is uploaded
  if (extension === 'rtf' || decodedText.trimStart().startsWith('{\\rtf')) {
    return decodedText
      .replace(/\{\\\*\\[^}]+\}/g, '')
      .replace(/\\par\b|\\line\b/g, '\n')
      .replace(/\\tab\b/g, '  ')
      .replace(/\\u(-?\d+)\??/g, (_, code) => {
        const n = parseInt(code, 10);
        return String.fromCharCode(n < 0 ? n + 65536 : n);
      })
      .replace(/\\[a-z]+-?\d*\s?/gi, '')
      .replace(/[{}]/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  return decodedText.trim();
}

/**
 * Normalizes messy pasted/extracted Word text:
 * - Breaks inline multi-column options (A. ... B. ... C. ... D. ...) onto separate lines
 * - Breaks inline True/False items (a) ... b) ... c) ... d) ...) onto separate lines
 * - Extracts end-of-exam answer key table if present (e.g., "1.A 2.B 3.C" or "1A 2B")
 */
function preprocessExamText(rawText: string): {
  normalizedLines: string[];
  answerKeyMap: Record<number, string>;
} {
  let text = rawText.replace(/\r\n/g, '\n').replace(/\u00a0/g, ' ');

  // Extract trailing answer key table if clearly present (e.g. "BẢNG ĐÁP ÁN" / "ĐÁP ÁN THAM KHẢO")
  const answerKeyMap: Record<number, string> = {};
  const keySectionMatch = text.match(
    /\n\s*(?:BẢNG\s*ĐÁP\s*ÁN|ĐÁP\s*ÁN\s*(?:CHÍNH\s*THỨC|THAM\s*KHẢO|PHẦN\s*I|TRẮC\s*NGHIỆM)?)\s*[:\n]([\s\S]{10,2500})$/i
  );
  if (keySectionMatch) {
    const keyChunk = keySectionMatch[1];
    const pairRegex = /(?:^|[\s|,;])(?:Câu\s*)?(\d{1,2})\s*[.:)\-\s]\s*([A-D])(?=$|[\s|,;])/gi;
    let m: RegExpExecArray | null;
    let matchCount = 0;
    while ((m = pairRegex.exec(keyChunk)) !== null) {
      const qNum = parseInt(m[1], 10);
      if (qNum >= 1 && qNum <= 60) {
        answerKeyMap[qNum] = m[2].toUpperCase();
        matchCount++;
      }
    }
    if (matchCount >= 3 && keySectionMatch.index !== undefined) {
      text = text.slice(0, keySectionMatch.index);
    }
  }

  // Split inline "Câu 1:" if concatenated after text
  text = text.replace(/([^\n])\s+((?:Câu|Bài)\s+\d+\s*[:.])/gi, '$1\n$2');

  // Split inline multi-column options on a single line (e.g. "A. xxx   B. yyy" or "A. xxx B. yyy C. zzz D. ttt")
  const rawLines = text.split('\n');
  const expandedLines: string[] = [];

  for (const rawLine of rawLines) {
    let line = rawLine.trim();
    if (!line) continue;

    // Strip markdown bold markers like **Câu 1:** or **A.**
    line = line.replace(/\*\*/g, '');

    // If a line starts with an option A/B/C/D or contains multiple options separated by spaces/tabs
    if (/(?:^|\t|\s{2,}|\s)[A-D][.)]\s+/.test(line)) {
      // Only split B./C./D. if preceded by tab, 2+ spaces, or if A./B./C. appears earlier on the same line
      const hasA = /(?:^|\s)[*]?A[.)]\s+/.test(line);
      if (hasA || /\t|\s{2,}/.test(line)) {
        line = line
          .replace(/(?:\t+|\s{2,}|(?<=\S)\s+)(?=[*]?[B-D][.)]\s+)/g, '\n')
          .replace(/(?<=\S)(?:\t+|\s{2,})(?=[*]?[A-D][.)]\s+)/g, '\n');
      }
    }

    // Also split inline a) ... b) ... c) ... d) ...
    if (/(?:^|\s)a[.)]\s+/i.test(line) && /\s+[b-d][.)]\s+/i.test(line)) {
      line = line.replace(/\s+(?=[b-d][.)]\s+)/gi, '\n');
    }

    line.split('\n').forEach((sub) => {
      const cleaned = sub.trim();
      if (cleaned) expandedLines.push(cleaned);
    });
  }

  return { normalizedLines: expandedLines, answerKeyMap };
}

/**
 * Intelligent parser that reads text and parses both Single-Choice and True/False questions
 */
export function parseQuestionsFromText(
  rawText: string,
  defaultGrade: 10 | 11 | 12 = 10,
  defaultTopic: string = 'Lịch sử Việt Nam',
  defaultLesson: string = 'Chương trình GDNN - GDTX',
  defaultAuthor: string = 'Cao Thị Thu',
  preferredMode?: string
): ParsedQuestionResult {
  const { normalizedLines: lines, answerKeyMap } = preprocessExamText(rawText);

  const errors: string[] = [];
  const parsedQuestions: Omit<Question, 'id' | 'updatedAt'>[] = [];

  // Group text into raw question blocks based on markers like "Câu 1:", "Câu 2.", "Bài 1:"
  const blocks: { lines: string[]; qNumber?: number; sectionHint?: 'PART1' | 'PART2' }[] = [];
  let currentBlock: string[] = [];
  let currentQNumber: number | undefined;
  let currentSectionHint: 'PART1' | 'PART2' | undefined;
  let activeSection: 'PART1' | 'PART2' | undefined;

  const questionStartRegex = /^(?:Câu|Bài)\s*(\d+)\s*[:.)]/i;
  const fallbackNumberStartRegex = /^(\d{1,2})\s*[.)]\s+\S/;
  const part1HeaderRegex = /^PHẦN\s*(?:I|1)\b/i;
  const part2HeaderRegex = /^PHẦN\s*(?:II|2)\b/i;

  const hasExplicitCauPrefix = lines.some((l) => questionStartRegex.test(l));

  for (const line of lines) {
    if (part2HeaderRegex.test(line)) {
      activeSection = 'PART2';
      continue;
    }
    if (part1HeaderRegex.test(line)) {
      activeSection = 'PART1';
      continue;
    }

    const explicitMatch = line.match(questionStartRegex);
    const fallbackMatch = !hasExplicitCauPrefix ? line.match(fallbackNumberStartRegex) : null;
    const matched = explicitMatch || fallbackMatch;

    if (matched) {
      if (currentBlock.length > 0) {
        blocks.push({ lines: currentBlock, qNumber: currentQNumber, sectionHint: currentSectionHint });
      }
      currentBlock = [line];
      currentQNumber = parseInt(matched[1], 10);
      currentSectionHint = activeSection;
    } else {
      if (currentBlock.length > 0) {
        currentBlock.push(line);
      }
    }
  }

  if (currentBlock.length > 0) {
    blocks.push({ lines: currentBlock, qNumber: currentQNumber, sectionHint: currentSectionHint });
  }

  // If no "Câu X:" or "1." format found, try splitting by blank lines
  if (blocks.length === 0 && lines.length > 0) {
    const rawParagraphs = rawText.split(/\n\s*\n/);
    for (const p of rawParagraphs) {
      const pLines = preprocessExamText(p).normalizedLines;
      if (pLines.length >= 3) {
        blocks.push({ lines: pLines });
      }
    }
  }

  // Process each block
  for (let bIdx = 0; bIdx < blocks.length; bIdx++) {
    const { lines: block, qNumber, sectionHint } = blocks[bIdx];
    const fullText = block.join('\n');

    // Check if it's a True/False question
    const hasTFSubQuestions =
      /(\n|^)[a-d][.)]\s+/i.test(fullText) &&
      (sectionHint === 'PART2' ||
        /(đúng|sai|\[đúng\]|\[sai\]|a-đ|a-s)/i.test(fullText) ||
        /(\n|^)a\)\s+/i.test(fullText));

    // Check if it's Single Choice (contains A., B., ...)
    const hasSingleOptions =
      /(\n|^)[*]?A[.)]\s+/i.test(fullText) &&
      /(\n|^)[*]?B[.)]\s+/i.test(fullText);

    // Check if it's an Essay block
    const hasEssayMarkers =
      /(\n|^)(Dàn\s*ý|Gợi\s*ý\s*trả\s*lời|Hướng\s*dẫn\s*chấm|Biểu\s*điểm|Rubric)[:.]/i.test(fullText);

    if (hasTFSubQuestions && !hasSingleOptions) {
      const parsedTF = parseTrueFalseBlock(block, defaultGrade, defaultTopic, defaultLesson, defaultAuthor);
      if (parsedTF) {
        parsedQuestions.push(parsedTF);
      } else {
        errors.push(`Khối câu số ${bIdx + 1}: Chưa đủ 4 ý a, b, c, d hoặc không đúng định dạng Đúng/Sai.`);
      }
    } else if (hasSingleOptions) {
      const parsedSingle = parseSingleChoiceBlock(
        block,
        defaultGrade,
        defaultTopic,
        defaultLesson,
        defaultAuthor,
        qNumber ? answerKeyMap[qNumber] : undefined
      );
      if (parsedSingle) {
        parsedQuestions.push(parsedSingle);
      } else {
        errors.push(`Khối câu số ${bIdx + 1}: Thiếu phương án lựa chọn hoặc không tìm thấy nội dung.`);
      }
    } else if (preferredMode === 'Tự luận' || hasEssayMarkers) {
      const parsedEssay = parseEssayBlock(block, defaultGrade, defaultTopic, defaultLesson, defaultAuthor);
      if (parsedEssay) {
        parsedQuestions.push(parsedEssay);
      } else {
        errors.push(`Khối câu số ${bIdx + 1}: Chưa có nội dung đề bài Tự luận hợp lệ.`);
      }
    } else {
      errors.push(`Khối câu số ${bIdx + 1}: Không xác định được dạng (cần có các lựa chọn A, B, C, D hoặc các ý a, b, c, d).`);
    }
  }

  let singleCount = 0;
  let tfCount = 0;
  let essayCount = 0;
  parsedQuestions.forEach((q) => {
    if (q.type === 'Trắc nghiệm đơn') singleCount++;
    if (q.type === 'Trắc nghiệm đúng sai') tfCount++;
    if (q.type === 'Tự luận') essayCount++;
  });

  return {
    questions: parsedQuestions,
    totalParsed: parsedQuestions.length,
    singleCount,
    tfCount,
    essayCount,
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
  author: string,
  fallbackKeyFromTable?: string
): Omit<Question, 'id' | 'updatedAt'> | null {
  let content = '';
  const optionsMap: Record<string, string> = { A: '', B: '', C: '', D: '' };
  let correctAnswer = fallbackKeyFromTable || '';
  let explanation = '';

  let currentKey = 'CONTENT';

  for (const line of block) {
    const cleanLine = line.trim();

    // Check Answer line
    const ansMatch = cleanLine.match(/^(?:Đáp\s*án|ĐA|Key|Chọn)\s*[:.]?\s*([A-D])\b/i);
    if (ansMatch) {
      correctAnswer = ansMatch[1].toUpperCase();
      continue;
    }

    // Check Explanation line
    const expMatch = cleanLine.match(/^(Giải\s*thích|Hướng\s*dẫn|HD)[:.]?\s*(.*)$/i);
    if (expMatch) {
      explanation = expMatch[2];
      currentKey = 'EXP';
      continue;
    }

    // Check Option lines A., B., C., D. (also supports *A. marker)
    const optMatch = cleanLine.match(/^([*]?)([A-D])[.)]\s*(.*)$/i);
    if (optMatch) {
      const hasStar = optMatch[1] === '*';
      const optLetter = optMatch[2].toUpperCase();
      let optText = optMatch[3].trim();
      if (hasStar && !correctAnswer) {
        correctAnswer = optLetter;
      }
      // Check inline "(Đáp án đúng)" suffix
      if (/\(\s*đúng\s*\)|\[\s*x\s*\]$/i.test(optText)) {
        correctAnswer = optLetter;
        optText = optText.replace(/\(\s*đúng\s*\)|\[\s*x\s*\]$/i, '').trim();
      }
      optionsMap[optLetter] = optText;
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

  if (!correctAnswer) {
    correctAnswer = 'A';
  }

  // Clean title prefix like "Câu 1:" or "1."
  content = content
    .replace(/^(?:Câu|Bài)\s*\d+\s*[:.)]\s*/i, '')
    .replace(/^\d{1,2}\s*[.)]\s+/, '')
    .trim();

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
  const summaryKeyMap: Record<string, boolean> = {};

  const tfRegex = /^([a-d])[.)]\s*(.*)$/i;

  for (const line of block) {
    const cleanLine = line.trim();

    // Check Explanation line
    const expMatch = cleanLine.match(/^(Giải\s*thích|Hướng\s*dẫn|HD)[:.]?\s*(.*)$/i);
    if (expMatch) {
      explanation = expMatch[2];
      continue;
    }

    // Parse summary answer line if present (e.g., "Đáp án: a-Đ, b-S, c-Đ, d-Đ")
    if (/^(Đáp\s*án|ĐA|Key)[:.]?\s*[a-d]/i.test(cleanLine)) {
      const tfPairRegex = /([a-d])\s*[-:)]\s*(ĐÚNG|SAI|Đ|S|T|F)\b/gi;
      let m: RegExpExecArray | null;
      while ((m = tfPairRegex.exec(cleanLine)) !== null) {
        const val = m[2].toUpperCase();
        summaryKeyMap[m[1].toLowerCase()] = val === 'Đ' || val === 'ĐÚNG' || val === 'T';
      }
      continue;
    }

    const match = cleanLine.match(tfRegex);
    if (match) {
      const id = match[1].toLowerCase() as 'a' | 'b' | 'c' | 'd';
      let stmtText = match[2].trim();
      let isCorrect: boolean | undefined;

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
        isCorrect: isCorrect ?? summaryKeyMap[id] ?? true,
      });
    } else {
      if (statements.length === 0) {
        content += (content ? '\n' : '') + cleanLine;
      } else {
        // Multi-line continuation of the last statement
        statements[statements.length - 1].statement += ' ' + cleanLine;
      }
    }
  }

  // Apply summary key map if parsed after statements
  statements.forEach((s) => {
    if (summaryKeyMap[s.id] !== undefined) {
      s.isCorrect = summaryKeyMap[s.id];
    }
  });

  // Clean prompt prefix
  content = content
    .replace(/^(?:Câu|Bài)\s*\d+\s*[:.)]\s*/i, '')
    .replace(/^\d{1,2}\s*[.)]\s+/, '')
    .trim();

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

/**
 * Parse an Essay (Tự luận) question block with optional Dàn ý / Rubric / Giải thích
 */
function parseEssayBlock(
  block: string[],
  grade: 10 | 11 | 12,
  topic: string,
  lesson: string,
  author: string
): Omit<Question, 'id' | 'updatedAt'> | null {
  let contentLines: string[] = [];
  let outlineLines: string[] = [];
  let explanation = '';
  let section: 'CONTENT' | 'OUTLINE' | 'EXP' = 'CONTENT';

  for (const rawLine of block) {
    const cleanLine = rawLine.trim();
    if (!cleanLine) continue;

    const outlineMatch = cleanLine.match(
      /^(Dàn\s*ý|Gợi\s*ý\s*trả\s*lời|Hướng\s*dẫn\s*chấm|Biểu\s*điểm|Rubric|Đáp\s*án)[:.]?\s*(.*)$/i
    );
    if (outlineMatch) {
      section = 'OUTLINE';
      if (outlineMatch[2]?.trim()) {
        outlineLines.push(outlineMatch[2].trim());
      }
      continue;
    }

    const expMatch = cleanLine.match(/^(Giải\s*thích|Lưu\s*ý)[:.]?\s*(.*)$/i);
    if (expMatch) {
      section = 'EXP';
      if (expMatch[2]?.trim()) {
        explanation += (explanation ? ' ' : '') + expMatch[2].trim();
      }
      continue;
    }

    if (section === 'CONTENT') {
      contentLines.push(cleanLine);
    } else if (section === 'OUTLINE') {
      outlineLines.push(cleanLine);
    } else {
      explanation += (explanation ? ' ' : '') + cleanLine;
    }
  }

  const content = contentLines
    .join('\n')
    .replace(/^(Câu|Bài)\s*\d+[:.]\s*/i, '')
    .trim();

  if (!content) return null;

  const essayOutline =
    outlineLines.join('\n').trim() ||
    'DÀN Ý GỢI Ý TRẢ LỜI:\n1. Hoàn cảnh & vấn đề lịch sử trọng tâm (3.0 điểm)\n2. Phân tích nội dung chính & ý nghĩa lịch sử (4.0 điểm)\n3. Bài học kinh nghiệm & liên hệ thực tế (3.0 điểm)';

  const rubricItems = outlineLines
    .filter((l) => /^(\d+[.)]|[-+*•])\s+/.test(l) || /\(\d+(?:[.,]\d+)?\s*(?:đ|điểm)\)/i.test(l))
    .slice(0, 6)
    .map((l) => {
      const ptMatch = l.match(/\((\d+(?:[.,]\d+)?)\s*(?:đ|điểm)\)/i);
      const pts = ptMatch ? parseFloat(ptMatch[1].replace(',', '.')) : 0;
      const cleanCriteria = l
        .replace(/^(\d+[.)]|[-+*•])\s+/, '')
        .replace(/\(\d+(?:[.,]\d+)?\s*(?:đ|điểm)\)/i, '')
        .trim();
      return { criteria: cleanCriteria, points: pts };
    })
    .filter((r) => r.criteria.length > 2);

  let rubricPoints = rubricItems;
  if (rubricPoints.length === 0) {
    rubricPoints = [
      { criteria: 'Ý 1: Nêu đúng hoàn cảnh lịch sử và trọng tâm đề bài', points: 3.0 },
      { criteria: 'Ý 2: Phân tích sâu sắc nội dung chính và ý nghĩa lịch sử', points: 4.0 },
      { criteria: 'Ý 3: Rút ra bài học kinh nghiệm & liên hệ thực tiễn', points: 3.0 },
    ];
  } else if (!rubricPoints.some((r) => r.points > 0)) {
    const perItem = Math.floor((10 / rubricPoints.length) * 4) / 4;
    let sum = 0;
    rubricPoints = rubricPoints.map((r, i) => {
      if (i === rubricPoints.length - 1) {
        return { ...r, points: Math.round((10 - sum) * 100) / 100 };
      }
      sum += perItem;
      return { ...r, points: perItem };
    });
  } else {
    rubricPoints = rubricPoints.map((r) => ({
      ...r,
      points: r.points > 0 ? r.points : 1.0,
    }));
  }

  return {
    grade,
    topic,
    lesson,
    knowledgeDomain: 'Tự luận phân tích & vận dụng',
    type: 'Tự luận',
    cognitiveLevel: 'Vận dụng',
    content,
    essayOutline,
    rubricPoints,
    correctAnswer: rubricPoints.map((r) => `${r.criteria} (${r.points}đ)`).join('; '),
    explanation: explanation || 'Trình bày mạch lạc, lập luận chặt chẽ kèm dẫn chứng lịch sử chuẩn SGK.',
    source: `SGK Lịch sử ${grade} - Chương trình GDPT 2018`,
    author,
  };
}
