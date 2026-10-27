import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { LearningMaterial } from '../../types';
import { Modal } from '../common/Modal';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Map,
  Image,
  Video,
  FileText,
  Download,
  ExternalLink,
  Trash2,
  Eye,
  FolderOpen,
} from 'lucide-react';

export const DigitalLibrary: React.FC = () => {
  const { materials, addMaterial, deleteMaterial } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<LearningMaterial | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'Bản đồ lịch sử' as LearningMaterial['category'],
    grade: 10 as 10 | 11 | 12,
    topic: 'Kháng chiến chống thực dân Pháp',
    lesson: 'Chiến dịch Điện Biên Phủ 1954',
    description: '',
    url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    source: 'Bảo tàng Lịch sử Quân sự Việt Nam',
    copyright: 'Tài nguyên giáo dục mở',
    fileType: 'PNG / Bản đồ số',
    fileSize: '3.5 MB',
  });

  const categories = [
    'Sách giáo khoa & Tham khảo',
    'Bản đồ lịch sử',
    'Tranh ảnh tư liệu',
    'Video tư liệu',
    'Văn bản gốc',
    'Phiếu học tập',
    'Bài giảng điện tử',
  ];

  const filteredMaterials = useMemo(() => {
    return materials.filter((m) => {
      const matchSearch =
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = selectedCategory === 'all' || m.category === selectedCategory;
      const matchGrade = selectedGrade === 'all' || m.grade.toString() === selectedGrade;
      return matchSearch && matchCat && matchGrade;
    });
  }, [materials, searchQuery, selectedCategory, selectedGrade]);

  const handleOpenAdd = () => {
    setFormData({
      title: '',
      category: 'Bản đồ lịch sử',
      grade: 10,
      topic: 'Lịch sử Việt Nam',
      lesson: 'Bài học',
      description: '',
      url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
      source: 'Tổ KHXH - Phân hiệu Tiên Yên',
      copyright: 'Lưu hành nội bộ',
      fileType: 'PDF / Tư liệu',
      fileSize: '2.1 MB',
    });
    setIsAddModalOpen(true);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    addMaterial({
      ...formData,
    });
    setIsAddModalOpen(false);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Bản đồ lịch sử':
        return <Map className="w-5 h-5 text-[#0878C9]" />;
      case 'Tranh ảnh tư liệu':
        return <Image className="w-5 h-5 text-amber-500" />;
      case 'Video tư liệu':
        return <Video className="w-5 h-5 text-rose-500" />;
      case 'Văn bản gốc':
        return <FileText className="w-5 h-5 text-purple-600" />;
      case 'Bài giảng điện tử':
        return <BookOpen className="w-5 h-5 text-emerald-600" />;
      default:
        return <FolderOpen className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#073B66] font-serif flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-[#0878C9]" />
            Học liệu & Tư liệu Lịch sử số
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kho lưu trữ số hóa bản đồ, tranh ảnh hiện vật, văn bản gốc và bài giảng điện tử
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-[#0878C9] hover:bg-[#073B66] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Thêm học liệu mới
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm tư liệu, bản đồ, bài giảng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0878C9]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Danh mục:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-[#0878C9]"
          >
            <option value="all">Tất cả danh mục</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Khối lớp:</span>
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-[#0878C9]"
          >
            <option value="all">Tất cả khối lớp</option>
            <option value="10">Lớp 10</option>
            <option value="11">Lớp 11</option>
            <option value="12">Lớp 12</option>
          </select>
        </div>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMaterials.map((mat) => (
          <div
            key={mat.id}
            className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 hover:border-[#0878C9] hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  {getCategoryIcon(mat.category)}
                </div>

                <div className="flex items-center gap-1">
                  <span className="px-2 py-0.5 rounded-full bg-sky-100 text-[#073B66] text-[10px] font-bold">
                    Lớp {mat.grade}
                  </span>
                  <button
                    onClick={() => deleteMaterial(mat.id)}
                    className="p-1 text-slate-300 hover:text-rose-500 transition-colors cursor-pointer"
                    title="Xóa học liệu"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h4 className="text-sm font-bold text-[#073B66] font-serif line-clamp-2 group-hover:text-[#0878C9] transition-colors">
                {mat.title}
              </h4>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{mat.description}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-serif italic">
                <span className="truncate max-w-[160px]">Nguồn: {mat.source}</span>
                <span>{mat.fileSize}</span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => setPreviewItem(mat)}
                  className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Xem chi tiết
                </button>

                <a
                  href={mat.url}
                  target="_blank"
                  rel="noreferrer"
                  className="py-1.5 px-3 bg-[#073B66] hover:bg-[#0878C9] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Mở tư liệu
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Material Detail Preview */}
      {previewItem && (
        <Modal
          isOpen={!!previewItem}
          onClose={() => setPreviewItem(null)}
          title={`Chi tiết học liệu: ${previewItem.title}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Danh mục:</span>
                <span className="font-bold text-[#073B66]">{previewItem.category}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Khối lớp:</span>
                <span className="font-bold">Lớp {previewItem.grade}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Chủ đề:</span>
                <span className="font-bold">{previewItem.topic}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Định dạng file:</span>
                <span>{previewItem.fileType} ({previewItem.fileSize})</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Nguồn trích dẫn:</span>
                <span className="font-bold">{previewItem.source}</span>
              </div>
            </div>

            <div>
              <h5 className="font-bold text-slate-800 mb-1">Mô tả sư phạm:</h5>
              <p className="text-slate-700 leading-relaxed font-serif p-3 bg-white rounded-xl border border-slate-200">
                {previewItem.description}
              </p>
            </div>

            <div>
              <h5 className="font-bold text-slate-800 mb-1">Thông tin bản quyền & Bản quyền giáo dục:</h5>
              <p className="text-slate-500 italic text-[11px]">{previewItem.copyright}</p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setPreviewItem(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold cursor-pointer"
              >
                Đóng
              </button>
              <a
                href={previewItem.url}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2 bg-[#0878C9] hover:bg-[#073B66] text-white rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                Truy cập liên kết học liệu
              </a>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Add New Material */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Thêm học liệu lịch sử mới"
        maxWidth="md"
      >
        <form onSubmit={handleSaveAdd} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Tên tài liệu / Học liệu (*)</label>
            <input
              type="text"
              required
              placeholder="Ví dụ: Bản đồ Chiến dịch Việt Bắc thu - đông 1947"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0878C9]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Danh mục</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0878C9]"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Khối lớp</label>
              <select
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: parseInt(e.target.value, 10) as any })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0878C9]"
              >
                <option value={10}>Lớp 10</option>
                <option value={11}>Lớp 11</option>
                <option value={12}>Lớp 12</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Chủ đề bài học</label>
            <input
              type="text"
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0878C9]"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Đường dẫn tệp / Liên kết tư liệu</label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0878C9]"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Mô tả chi tiết</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0878C9]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#0878C9] hover:bg-[#073B66] text-white rounded-xl font-bold cursor-pointer transition-colors"
            >
              Lưu học liệu
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
