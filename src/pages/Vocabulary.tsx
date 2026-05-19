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
    type: 'word' | 'phrase' | 'sentence';
    status: 'new' | 'reviewed' | 'mastered' | 'error';
  }>({
    word: '',
    meaning: '',
    grade: settings.currentGrade,
    type: 'word',
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
      await updateVocabulary(editingWord.id, formData.word, formData.meaning, formData.grade, formData.status, formData.type);
    } else {
      await addVocabulary(formData.word, formData.meaning, formData.grade, formData.type);
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
      type: word.type || 'word',
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
      type: 'word',
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

  const getTypeBadge = (type: string) => {
    const badges = {
      word: { text: '单词', color: 'bg-gray-100 text-gray-700' },
      phrase: { text: '词组', color: 'bg-purple-100 text-purple-700' },
      sentence: { text: '句子', color: 'bg-indigo-100 text-indigo-700' },
    };
    return badges[type as keyof typeof badges] || badges.word;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="animate-spin mx-auto mb-4 text-orange-500">加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 mb-6">
          {/* Header */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-1">词汇管理</h1>
                <p className="text-gray-600 text-sm">共 {filteredVocabulary.length} 个词汇</p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <button
                onClick={() => setShowBulkModal(true)}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
              >
                批量导入
              </button>
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                disabled={selectedIds.size === 0}
              >
                <Trash2 size={16} />
                删除 {selectedIds.size > 0 && `(${selectedIds.size})`}
              </button>
              <button
                onClick={() => {
                  resetForm();
                  setShowAddModal(true);
                }}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-orange-500 to-blue-600 text-white rounded-lg hover:from-orange-600 hover:to-blue-700 text-sm"
              >
                <Plus size={16} />
                添加
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4 sm:mb-6">
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(parseInt(e.target.value))}
              className="px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
            >
              {[2, 3, 4, 5, 6].map((grade) => (
                <option key={grade} value={grade}>{grade}年级</option>
              ))}
            </select>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="搜索词汇..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
            >
              <option value="all">全部状态</option>
              <option value="new">新词</option>
              <option value="reviewed">旧词</option>
              <option value="mastered">已掌握</option>
              <option value="error">需复习</option>
            </select>
          </div>

          {/* Select All */}
          <div className="mb-4 flex items-center gap-2">
            <input
              type="checkbox"
              id="selectAll"
              checked={selectAll}
              onChange={(e) => setSelectAll(e.target.checked)}
              className="w-4 h-4 sm:w-5 sm:h-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
            />
            <label htmlFor="selectAll" className="text-gray-700 text-sm">全选</label>
            {selectedIds.size > 0 && (
              <button
                onClick={() => {
                  setSelectedIds(new Set());
                  setSelectAll(false);
                }}
                className="ml-auto text-gray-500 hover:text-gray-700 p-1"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Word List */}
          <div className="space-y-2 sm:space-y-3">
            {filteredVocabulary.map((word) => {
              const badge = getStatusBadge(word.status);
              const Icon = badge.icon;
              const isSelected = selectedIds.has(word.id);
              return (
                <div
                  key={word.id}
                  className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 rounded-xl border-2 transition-all gap-3 ${
                    isSelected ? 'bg-blue-50 border-blue-500' : 'bg-gray-50 hover:bg-gray-100 border-transparent'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-2 sm:gap-3 flex-1 min-w-0 w-full">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(word.id)}
                      className="w-4 h-4 sm:w-5 sm:h-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500 flex-shrink-0 mt-1 sm:mt-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1 sm:gap-2 flex-wrap mb-1">
                        <span className="text-base sm:text-lg font-semibold text-gray-800">{word.word}</span>
                        <span className={`px-2 py-0.5 text-xs rounded-full flex items-center gap-1 ${badge.color}`}>
                          <Icon size={10} />
                          {badge.text}
                        </span>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${getTypeBadge(word.type).color}`}>
                          {getTypeBadge(word.type).text}
                        </span>
                        {word.isCustom && (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">自定义</span>
                        )}
                      </div>
                      <div className="text-gray-600 text-sm mb-2 sm:mb-0">{word.meaning}</div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 sm:hidden">
                        <span>{word.grade}年级</span>
                        <span>✓{word.correctCount}</span>
                        <span>✗{word.errorCount}</span>
                      </div>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-2">
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

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-5 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">
                {editingWord ? '编辑词汇' : '添加词汇'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">英文</label>
                  <input
                    type="text"
                    value={formData.word}
                    onChange={(e) => setFormData({ ...formData, word: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">中文</label>
                  <input
                    type="text"
                    value={formData.meaning}
                    onChange={(e) => setFormData({ ...formData, meaning: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">年级</label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: parseInt(e.target.value) })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  >
                    {[2, 3, 4, 5, 6].map((grade) => (
                      <option key={grade} value={grade}>{grade}年级</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">类型</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  >
                    <option value="word">单词</option>
                    <option value="phrase">词组</option>
                    <option value="sentence">句子</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
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
                    className="flex-1 px-4 py-2 sm:py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100 text-sm"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 sm:py-3 bg-gradient-to-r from-orange-500 to-blue-600 text-white rounded-lg hover:from-orange-600 hover:to-blue-700 text-sm"
                  >
                    {editingWord ? '保存' : '添加'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Bulk Import Modal */}
        {showBulkModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg p-5 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">批量导入</h2>
              <p className="text-gray-600 mb-4 text-sm">
                格式：英文,中文（每行一组）
              </p>
              <textarea
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                placeholder="apple,苹果
banana,香蕉
cat,猫"
                className="w-full h-40 sm:h-48 px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              />
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowBulkModal(false)}
                  className="flex-1 px-4 py-2 sm:py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100 text-sm"
                >
                  取消
                </button>
                <button
                  onClick={handleBulkImport}
                  className="flex-1 px-4 py-2 sm:py-3 bg-gradient-to-r from-orange-500 to-blue-600 text-white rounded-lg hover:from-orange-600 hover:to-blue-700 text-sm"
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
