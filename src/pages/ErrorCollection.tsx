import React, { useEffect, useState, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { Camera, Plus, Edit, Trash2, Eye, EyeOff, Printer, Image, User } from 'lucide-react';
import { ErrorCollection as ErrorCollectionType } from '@/types';

const ErrorCollection: React.FC = () => {
  const {
    errorCollections,
    loadErrorCollections,
    addErrorCollection,
    updateErrorCollection,
    deleteErrorCollection,
    currentStudent,
  } = useStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ErrorCollectionType | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    question: string;
    answer: string;
    category: string;
    imageData: string;
  }>({
    title: '',
    question: '',
    answer: '',
    category: 'general',
    imageData: '',
  });
  const [loading, setLoading] = useState(true);
  const [visibleAnswers, setVisibleAnswers] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const init = async () => {
      await loadErrorCollections();
      setLoading(false);
    };
    init();
  }, [currentStudent]);

  const categoryLabels: Record<string, string> = {
    general: '综合',
    grammar: '语法',
    vocabulary: '词汇',
    writing: '写作',
  };

  const categoryColors: Record<string, string> = {
    general: 'bg-gray-100 text-gray-700',
    grammar: 'bg-blue-100 text-blue-700',
    vocabulary: 'bg-green-100 text-green-700',
    writing: 'bg-purple-100 text-purple-700',
  };

  const toggleAnswer = (id: string) => {
    const newSet = new Set(visibleAnswers);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setVisibleAnswers(newSet);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      await updateErrorCollection(editingItem.id, {
        title: formData.title,
        question: formData.question || undefined,
        answer: formData.answer,
        imageData: formData.imageData || undefined,
        category: formData.category,
      });
    } else {
      await addErrorCollection({
        title: formData.title,
        question: formData.question || undefined,
        answer: formData.answer,
        imageData: formData.imageData || undefined,
        category: formData.category,
      });
    }
    resetForm();
    setShowAddModal(false);
  };

  const handleEdit = (item: ErrorCollectionType) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      question: item.question || '',
      answer: item.answer,
      category: item.category,
      imageData: item.imageData || '',
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('确定要删除这个错题吗？')) {
      await deleteErrorCollection(id);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      question: '',
      answer: '',
      category: 'general',
      imageData: '',
    });
    setEditingItem(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, imageData: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setFormData({ ...formData, imageData: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="animate-spin mx-auto mb-4 text-orange-500 w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full" />
          <p className="text-xl text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!currentStudent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md">
          <User className="mx-auto mb-4 text-gray-400" size={64} />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">请先选择学生</h2>
          <p className="text-gray-600 mb-6">
            错题归集需要先选择一个学生。<br />
            请在首页选择或添加学生。
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-gradient-to-r from-orange-500 to-blue-600 text-white rounded-lg hover:from-orange-600 hover:to-blue-700 font-medium"
          >
            前往首页选择学生
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 lg:p-6 mb-4 sm:mb-5">
          <div className="flex flex-col gap-3 mb-4 sm:mb-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-1">错题归集</h1>
                <p className="text-gray-600 text-xs sm:text-sm">共 {errorCollections.length} 道错题</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
              >
                <Printer size={16} />
                打印
              </button>
              <button
                onClick={() => {
                  resetForm();
                  setShowAddModal(true);
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-orange-500 to-blue-600 text-white rounded-lg hover:from-orange-600 hover:to-blue-700 text-sm"
              >
                <Plus size={16} />
                添加错题
              </button>
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3">
            {errorCollections.map((item) => {
              const isVisible = visibleAnswers.has(item.id);
              const catColor = categoryColors[item.category] || categoryColors.general;
              return (
                <div
                  key={item.id}
                  className="flex flex-col p-3 sm:p-4 rounded-xl border-2 border-gray-100 bg-gray-50 transition-all gap-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-base sm:text-lg font-semibold text-gray-800">{item.title}</span>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${catColor}`}>
                          {categoryLabels[item.category] || item.category}
                        </span>
                      </div>
                      {item.question && (
                        <p className="text-gray-600 text-sm">{item.question}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => toggleAnswer(item.id)}
                        className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg"
                        title={isVisible ? '隐藏答案' : '查看答案'}
                      >
                        {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  {isVisible && (
                    <div className="bg-white rounded-lg p-3 border border-orange-200">
                      <p className="text-orange-700 font-medium text-sm sm:text-base">{item.answer}</p>
                    </div>
                  )}

                  {item.imageData && (
                    <div className="relative">
                      <img
                        src={item.imageData}
                        alt={item.title}
                        className="max-h-48 rounded-lg object-contain border border-gray-200"
                      />
                    </div>
                  )}
                </div>
              );
            })}
            {errorCollections.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Camera className="mx-auto mb-3 text-gray-300" size={48} />
                <p>暂无错题记录</p>
                <p className="text-sm mt-1">点击"添加错题"开始记录</p>
              </div>
            )}
          </div>
        </div>

        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">
                {editingItem ? '编辑错题' : '添加错题'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">标题</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">题目（可选）</label>
                  <input
                    type="text"
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">答案</label>
                  <textarea
                    value={formData.answer}
                    onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  >
                    <option value="general">综合</option>
                    <option value="grammar">语法</option>
                    <option value="vocabulary">词汇</option>
                    <option value="writing">写作</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">图片（可选）</label>
                  {formData.imageData ? (
                    <div className="relative">
                      <img
                        src={formData.imageData}
                        alt="预览"
                        className="max-h-40 rounded-lg object-contain border border-gray-200 mb-2"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ) : null}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-orange-400 hover:text-orange-500 cursor-pointer text-sm"
                  >
                    <Image size={18} />
                    点击上传图片
                  </label>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 sm:py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100 text-sm"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 sm:py-3 bg-gradient-to-r from-orange-500 to-blue-600 text-white rounded-lg hover:from-orange-600 hover:to-blue-700 text-sm"
                  >
                    {editingItem ? '保存' : '添加'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorCollection;