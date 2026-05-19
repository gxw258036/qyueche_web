import React, { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { Plus, Edit, Trash2, Search, Filter, BookOpen, CheckCircle2, XCircle, Clock, X } from 'lucide-react';
import { Vocabulary as VocabularyType } from '@/types';

const Vocabulary: React.FC = () => {
  const {
    settings,
    vocabulary,
    loadVocabulary,
    addVocabulary,
    updateVocabulary,
    deleteVocabulary,
    bulkDeleteVocabulary,
    bulkAddVocabulary,
  } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'reviewed' | 'mastered' | 'error'>('all');
  const [gradeFilter, setGradeFilter] = useState<number>(settings.currentGrade);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingWord, setEditingWord] = useState<VocabularyType | null>(null);
  const [formData, setFormData] = useState<{
    word: string;
    meaning: string;
    grade: number;
    status: 'new' | 'reviewed' | 'mastered' | 'error';
  }>({
    word: '',
    meaning: '',
    grade: settings.currentGrade,
    status: 'new',
  });
  const [bulkInput, setBulkInput] = useState('');
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    const init = async () => {
      await loadVocabulary();
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (!loading) {
      loadVocabulary(gradeFilter);
    }
  }, [gradeFilter, loading]);

  useEffect(() => {
    setGradeFilter(settings.currentGrade);
  }, [settings.currentGrade]);

  const filteredVocabulary = vocabulary.filter(word => {
    const matchesSearch = !searchTerm || 
      word.word.toLowerCase().includes(searchTerm.toLowerCase()) || 
      word.meaning.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || word.status === statusFilter;
    const matchesGrade = word.grade === gradeFilter;
    return matchesSearch && matchesStatus && matchesGrade;
  });

  useEffect(() => {
    if (selectAll) {
      setSelectedIds(new Set(filteredVocabulary.map(w => w.id)));
    } else {
      setSelectedIds(new Set());
    }
  }, [selectAll, filteredVocabulary]);

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) {
      alert('请先选择要删除的词汇');
      return;
    }
    if (window.confirm(`确定要删除选中的 ${selectedIds.size} 个词汇吗？`)) {
      await bulkDeleteVocabulary(Array.from(selectedIds));
      setSelectedIds(new Set());
      setSelectAll(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingWord) {
      await updateVocabulary(editingWord.id, formData.word, formData.meaning, formData.grade, formData.status);
    } else {
      await addVocabulary(formData.word, formData.meaning, formData.grade);
    }
    resetForm();
    setShowAddModal(false);
  };

  const handleEdit = (word: VocabularyType) => {
    setEditingWord(word);
    setFormData({
      word: word.word,
      meaning: word.meaning,
      grade: word.grade,
      status: word.status,
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('确定要删除这个词汇吗？')) {
      await deleteVocabulary(id);
    }
  };

  const resetForm = () => {
    setFormData({
      word: '',
      meaning: '',
      grade: settings.currentGrade,
      status: 'new',
    });
    setEditingWord(null);
  };

  const handleBulkImport = async () => {
    const lines = bulkInput.trim().split('\n');
    const words: { word: string; meaning: string; grade: number }[] = [];
    
    lines.forEach((line) => {
      const parts = line.split(/[,，\t]/);
      if (parts.length >= 2) {
        const word = parts[0].trim();
        const meaning = parts[1].trim();
        if (word && meaning) {
          words.push({ word, meaning, grade: settings.currentGrade });
        }
      }
    });
    
    if (words.length > 0) {
      await bulkAddVocabulary(words);
      alert(`成功导入 ${words.length} 个词汇！`);
      setBulkInput('');
      setShowBulkModal(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      new: { text: '新词', color: 'bg-orange-100 text-orange-700', icon: Clock },
      reviewed: { text: '旧词', color: 'bg-blue-100 text-blue-700', icon: BookOpen },
      mastered: { text: '已掌握', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
      error: { text: '需复习', color: 'bg-red-100 text-red-700', icon: XCircle },
    };
    return badges[status as keyof typeof badges] || badges.new;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mx-auto mb-4 text-orange-500">加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">词汇管理</h1>
              <p className="text-gray-600">共 {filteredVocabulary.length} 个词汇</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowBulkModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200"
              >
                批量导入
              </button>
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={selectedIds.size === 0}
              >
                <Trash2 size={18} />
                批量删除 {selectedIds.size > 0 && `(${selectedIds.size})`}
              </button>
              <button
                onClick={() => {
                  resetForm();
                  setShowAddModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-blue-600 text-white rounded-xl hover:from-orange-600 hover:to-blue-700"
              >
                <Plus size={18} />
                添加词汇
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex items-center gap-2">
              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(parseInt(e.target.value))}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {[2, 3, 4, 5, 6].map((grade) => (
                  <option key={grade} value={grade}>{grade}年级</option>
                ))}
              </select>
            </div>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="搜索词汇..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400" size={20} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">全部</option>
                <option value="new">新词</option>
                <option value="reviewed">旧词</option>
                <option value="mastered">已掌握</option>
                <option value="error">需复习</option>
              </select>
            </div>
          </div>

          <div className="mb-4 flex items-center gap-2">
            <input
              type="checkbox"
              id="selectAll"
              checked={selectAll}
              onChange={(e) => setSelectAll(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
            />
            <label htmlFor="selectAll" className="text-gray-700">全选</label>
            {selectedIds.size > 0 && (
              <button
                onClick={() => {
                  setSelectedIds(new Set());
                  setSelectAll(false);
                }}
                className="ml-auto text-gray-500 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            )}
          </div>

          <div className="space-y-3">
            {filteredVocabulary.map((word) => {
              const badge = getStatusBadge(word.status);
              const Icon = badge.icon;
              const isSelected = selectedIds.has(word.id);
              return (
                <div
                  key={word.id}
                  className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                    isSelected ? 'bg-blue-50 border-2 border-blue-500' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(word.id)}
                      className="w-5 h-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                    />
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-semibold text-gray-800">{word.word}</span>
                        <span className={`px-2 py-0.5 text-sm rounded-full flex items-center gap-1 ${badge.color}`}>
                          <Icon size={12} />
                          {badge.text}
                        </span>
                        {word.isCustom && (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">自定义</span>
                        )}
                      </div>
                      <div className="text-gray-600 mt-1">{word.meaning}</div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>年级: {word.grade}</span>
                        <span>正确: {word.correctCount}</span>
                        <span>错误: {word.errorCount}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(word)}
                      className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(word.id)}
                      className="p-2 text-red-500 hover:bg-red-100 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
            {filteredVocabulary.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                没有找到匹配的词汇
              </div>
            )}
          </div>
        </div>

        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {editingWord ? '编辑词汇' : '添加词汇'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">英文单词</label>
                  <input
                    type="text"
                    value={formData.word}
                    onChange={(e) => setFormData({ ...formData, word: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">中文释义</label>
                  <input
                    type="text"
                    value={formData.meaning}
                    onChange={(e) => setFormData({ ...formData, meaning: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">年级</label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {[2, 3, 4, 5, 6].map((grade) => (
                      <option key={grade} value={grade}>{grade}年级</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="new">新词</option>
                    <option value="reviewed">旧词</option>
                    <option value="mastered">已掌握</option>
                    <option value="error">需复习</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-100"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-blue-600 text-white rounded-xl hover:from-orange-600 hover:to-blue-700"
                  >
                    {editingWord ? '保存' : '添加'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showBulkModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">批量导入词汇</h2>
              <p className="text-gray-600 mb-4">
                每行一个词汇，格式：英文,中文（英文和中文之间用逗号或空格分隔）
              </p>
              <textarea
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                placeholder="apple,苹果
banana,香蕉
cat,猫"
                className="w-full h-48 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowBulkModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-100"
                >
                  取消
                </button>
                <button
                  onClick={handleBulkImport}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-blue-600 text-white rounded-xl hover:from-orange-600 hover:to-blue-700"
                >
                  导入
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Vocabulary;
