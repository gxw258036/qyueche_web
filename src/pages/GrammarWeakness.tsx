import React, { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { Plus, Edit, Trash2, BookOpen, User } from 'lucide-react';
import { GrammarWeakness as GrammarWeaknessType } from '@/types';

const categoryLabels: Record<string, string> = {
  be_verbs: 'Be动词',
  tenses: '时态',
  prepositions: '介词',
  articles: '冠词',
  pronouns: '代词',
  questions: '疑问句',
  negation: '否定句',
  other: '其他',
};

const categoryColors: Record<string, string> = {
  be_verbs: 'bg-pink-100 text-pink-700',
  tenses: 'bg-blue-100 text-blue-700',
  prepositions: 'bg-purple-100 text-purple-700',
  articles: 'bg-green-100 text-green-700',
  pronouns: 'bg-yellow-100 text-yellow-700',
  questions: 'bg-orange-100 text-orange-700',
  negation: 'bg-red-100 text-red-700',
  other: 'bg-gray-100 text-gray-700',
};

const GrammarWeakness: React.FC = () => {
  const {
    grammarWeaknesses,
    loadGrammarWeaknesses,
    addGrammarWeakness,
    updateGrammarWeakness,
    deleteGrammarWeakness,
    currentStudent,
  } = useStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingWeakness, setEditingWeakness] = useState<GrammarWeaknessType | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    category: string;
    example: string;
  }>({
    title: '',
    description: '',
    category: 'be_verbs',
    example: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      await loadGrammarWeaknesses();
      setLoading(false);
    };
    init();
  }, [currentStudent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingWeakness) {
      await updateGrammarWeakness(editingWeakness.id, {
        title: formData.title,
        description: formData.description || undefined,
        category: formData.category,
        example: formData.example || undefined,
      });
    } else {
      await addGrammarWeakness({
        title: formData.title,
        description: formData.description || undefined,
        category: formData.category,
        example: formData.example || undefined,
      });
    }
    resetForm();
    setShowAddModal(false);
  };

  const handleEdit = (weakness: GrammarWeaknessType) => {
    setEditingWeakness(weakness);
    setFormData({
      title: weakness.title,
      description: weakness.description || '',
      category: weakness.category,
      example: weakness.example || '',
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('确定要删除这个语法短板吗？')) {
      await deleteGrammarWeakness(id);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'be_verbs',
      example: '',
    });
    setEditingWeakness(null);
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

  if (!currentStudent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md">
          <User className="mx-auto mb-4 text-gray-400" size={64} />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">请先选择学生</h2>
          <p className="text-gray-600 mb-6">
            语法短板管理需要先选择一个学生。<br />
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
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 lg:p-6 mb-4 sm:mb-5">
          <div className="flex flex-col gap-3 mb-4 sm:mb-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-1">语法短板</h1>
                <p className="text-gray-600 text-xs sm:text-sm">共 {grammarWeaknesses.length} 个语法短板</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  resetForm();
                  setShowAddModal(true);
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-orange-500 to-blue-600 text-white rounded-lg hover:from-orange-600 hover:to-blue-700 text-sm"
              >
                <Plus size={16} />
                添加
              </button>
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3">
            {grammarWeaknesses.map((weakness) => (
              <div
                key={weakness.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 sm:gap-2 flex-wrap mb-1">
                    <BookOpen size={16} className="text-gray-400" />
                    <span className="text-base sm:text-lg font-semibold text-gray-800">{weakness.title}</span>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${categoryColors[weakness.category] || categoryColors.other}`}>
                      {categoryLabels[weakness.category] || weakness.category}
                    </span>
                  </div>
                  {weakness.description && (
                    <div className="text-gray-600 text-sm mb-1">{weakness.description}</div>
                  )}
                  {weakness.example && (
                    <div className="text-gray-500 text-xs italic bg-gray-100 px-2 py-1 rounded mt-1 inline-block">
                      例句: {weakness.example}
                    </div>
                  )}
                </div>
                <div className="flex sm:hidden items-center gap-2 self-end">
                  <button
                    onClick={() => handleEdit(weakness)}
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(weakness.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(weakness)}
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(weakness.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
            {grammarWeaknesses.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                还没有添加语法短板，点击上方按钮添加
              </div>
            )}
          </div>
        </div>

        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-5 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">
                {editingWeakness ? '编辑语法短板' : '添加语法短板'}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  >
                    <option value="be_verbs">Be动词</option>
                    <option value="tenses">时态</option>
                    <option value="prepositions">介词</option>
                    <option value="articles">冠词</option>
                    <option value="pronouns">代词</option>
                    <option value="questions">疑问句</option>
                    <option value="negation">否定句</option>
                    <option value="other">其他</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">例句</label>
                  <input
                    type="text"
                    value={formData.example}
                    onChange={(e) => setFormData({ ...formData, example: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                    placeholder="可选：输入一个例句"
                  />
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
                    {editingWeakness ? '保存' : '添加'}
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

export default GrammarWeakness;