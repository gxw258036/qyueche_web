import React, { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { GrammarWeakness, GrammarQuestion } from '@/types';
import { api } from '@/services/api';
import { Printer, RefreshCw, Plus, Edit, Trash2, User, Eye, EyeOff } from 'lucide-react';

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

const typeLabels: Record<string, string> = {
  fill_blank: '填空题',
  choice: '选择题',
  error_correction: '改错题',
  translation: '翻译题',
};

const typeBadgeColors: Record<string, string> = {
  fill_blank: 'bg-blue-100 text-blue-700',
  choice: 'bg-purple-100 text-purple-700',
  error_correction: 'bg-red-100 text-red-700',
  translation: 'bg-green-100 text-green-700',
};

const GrammarPractice: React.FC = () => {
  const {
    currentStudent,
    grammarWeaknesses,
    loadGrammarWeaknesses,
    addGrammarQuestion,
    updateGrammarQuestion,
    deleteGrammarQuestion,
    error,
    clearError,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'practice' | 'bank'>('practice');

  const [practiceData, setPracticeData] = useState<any>(null);
  const [practiceLoading, setPracticeLoading] = useState(false);
  const [showAnswer, setShowAnswer] = useState<Set<string>>(new Set());
  const [selectedWeakness, setSelectedWeakness] = useState<string>('all');
  const [pageLoading, setPageLoading] = useState(true);

  const [allQuestions, setAllQuestions] = useState<GrammarQuestion[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<GrammarQuestion | null>(null);
  const [formData, setFormData] = useState<{
    question: string;
    answer: string;
    type: string;
    options: string;
    weaknessId: string;
  }>({
    question: '',
    answer: '',
    type: 'fill_blank',
    options: '',
    weaknessId: '',
  });

  useEffect(() => {
    const init = async () => {
      try {
        await loadGrammarWeaknesses();
      } catch (e) {
      }
      setPageLoading(false);
    };
    init();
  }, [currentStudent]);

  useEffect(() => {
    if (error) {
      alert(error);
      clearError();
    }
  }, [error]);

  const loadQuestions = async () => {
    if (!currentStudent) return;
    setQuestionsLoading(true);
    try {
      const questions = await api.grammarQuestions.getAll(currentStudent.id);
      setAllQuestions(questions);
    } catch (e) {
    } finally {
      setQuestionsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'bank' && currentStudent) {
      loadQuestions();
    }
  }, [activeTab, currentStudent]);

  const toggleAnswer = (id: string) => {
    const newSet = new Set(showAnswer);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setShowAnswer(newSet);
  };

  const handleGenerate = async () => {
    if (!currentStudent) return;
    setPracticeLoading(true);
    try {
      const data = await api.grammarPractice.get(currentStudent.id, 10);
      setPracticeData(data);
      setShowAnswer(new Set());
    } catch (e) {
    } finally {
      setPracticeLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleAdd = () => {
    setEditingQuestion(null);
    setFormData({
      question: '',
      answer: '',
      type: 'fill_blank',
      options: '',
      weaknessId: '',
    });
    setShowAddModal(true);
  };

  const handleEdit = (question: GrammarQuestion) => {
    setEditingQuestion(question);
    setFormData({
      question: question.question,
      answer: question.answer,
      type: question.type,
      options: question.options || '',
      weaknessId: question.weaknessId || '',
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('确定要删除这道试题吗？')) {
      await deleteGrammarQuestion(id);
      await loadQuestions();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingQuestion) {
      await updateGrammarQuestion(editingQuestion.id, {
        question: formData.question,
        answer: formData.answer,
        type: formData.type,
        options: formData.type === 'choice' ? formData.options : undefined,
      });
    } else {
      await addGrammarQuestion({
        question: formData.question,
        answer: formData.answer,
        type: formData.type,
        options: formData.type === 'choice' ? formData.options : undefined,
        weaknessId: formData.weaknessId || undefined,
      });
    }
    setShowAddModal(false);
    await loadQuestions();
  };

  const getWeaknessTitle = (weaknessId?: string) => {
    if (!weaknessId) return '';
    const weakness = grammarWeaknesses.find((w) => w.id === weaknessId);
    return weakness ? weakness.title : '';
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 flex items-center justify-center">
        <div className="text-center px-4">
          <RefreshCw className="animate-spin mx-auto mb-4 text-orange-500" size={48} />
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
            语法刷题需要先选择一个学生。<br />
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

  const practiceQuestions: GrammarQuestion[] =
    practiceData?.questions || practiceData?.data || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 lg:p-6 mb-4 sm:mb-5">
          <div className="flex gap-4 mb-4 sm:mb-5 border-b border-gray-200 pb-3">
            <button
              onClick={() => setActiveTab('practice')}
              className={`text-sm sm:text-base font-medium pb-2 px-1 transition-all ${
                activeTab === 'practice'
                  ? 'text-orange-500 border-b-2 border-orange-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              语法刷题
            </button>
            <button
              onClick={() => setActiveTab('bank')}
              className={`text-sm sm:text-base font-medium pb-2 px-1 transition-all ${
                activeTab === 'bank'
                  ? 'text-orange-500 border-b-2 border-orange-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              试题库管理
            </button>
          </div>

          {activeTab === 'practice' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">语法刷题</h2>
                  <p className="text-gray-600 text-xs sm:text-sm">
                    生成针对性语法练习试卷
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    value={selectedWeakness}
                    onChange={(e) => setSelectedWeakness(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  >
                    <option value="all">全部分类</option>
                    {grammarWeaknesses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.title}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleGenerate}
                    disabled={practiceLoading}
                    className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-500 to-blue-600 text-white rounded-lg hover:from-orange-600 hover:to-blue-700 text-sm disabled:opacity-50"
                  >
                    <RefreshCw size={16} className={practiceLoading ? 'animate-spin' : ''} />
                    生成试卷
                  </button>
                  {practiceData && (
                    <button
                      onClick={handlePrint}
                      className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                    >
                      <Printer size={16} />
                      打印
                    </button>
                  )}
                </div>
              </div>

              {practiceLoading && (
                <div className="text-center py-12">
                  <RefreshCw className="animate-spin mx-auto mb-4 text-orange-500" size={36} />
                  <p className="text-gray-600">正在生成试卷...</p>
                </div>
              )}

              {!practiceLoading && !practiceData && (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg mb-2">点击"生成试卷"开始刷题</p>
                  <p className="text-sm">系统将根据语法短板自动生成练习题</p>
                </div>
              )}

              {!practiceLoading && practiceData && practiceQuestions.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg mb-2">暂无可用试题</p>
                  <p className="text-sm">请先在试题库中添加题目</p>
                </div>
              )}

              {!practiceLoading && practiceQuestions.length > 0 && (
                <div className="space-y-2 sm:space-y-3">
                  {practiceQuestions
                    .filter((q) => selectedWeakness === 'all' || q.weaknessId === selectedWeakness)
                    .map((question, index) => {
                      const isVisible = showAnswer.has(question.id);
                      const weaknessTitle = getWeaknessTitle(question.weaknessId);
                      return (
                        <div
                          key={question.id || index}
                          className="flex flex-col p-3 sm:p-4 rounded-xl border-2 border-gray-100 bg-gray-50 transition-all gap-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className="w-7 h-7 flex items-center justify-center bg-gray-200 rounded-full text-xs font-semibold text-gray-600 flex-shrink-0">
                                  {index + 1}
                                </span>
                                <span className={`px-2 py-0.5 text-xs rounded-full ${typeBadgeColors[question.type] || 'bg-gray-100 text-gray-700'}`}>
                                  {typeLabels[question.type] || question.type}
                                </span>
                                {weaknessTitle && (
                                  <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">
                                    {weaknessTitle}
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-800 text-sm sm:text-base mt-1">
                                {question.question}
                              </p>
                            </div>
                            <button
                              onClick={() => toggleAnswer(question.id || String(index))}
                              className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg flex-shrink-0"
                              title={isVisible ? '隐藏答案' : '查看答案'}
                            >
                              {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>

                          {isVisible && (
                            <div className="bg-white rounded-lg p-3 border border-orange-200">
                              <p className="text-orange-700 font-medium text-sm sm:text-base">
                                答案：{question.answer}
                              </p>
                              {question.options && question.type === 'choice' && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {question.options.split(',').map((opt, i) => (
                                    <span
                                      key={i}
                                      className="px-3 py-1 bg-gray-100 rounded-lg text-sm text-gray-700"
                                    >
                                      {String.fromCharCode(65 + i)}. {opt.trim()}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'bank' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">试题库管理</h2>
                  <p className="text-gray-600 text-xs sm:text-sm">
                    共 {allQuestions.length} 道试题
                  </p>
                </div>
                <button
                  onClick={handleAdd}
                  className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-orange-500 to-blue-600 text-white rounded-lg hover:from-orange-600 hover:to-blue-700 text-sm"
                >
                  <Plus size={16} />
                  添加试题
                </button>
              </div>

              {questionsLoading && (
                <div className="text-center py-12">
                  <RefreshCw className="animate-spin mx-auto mb-4 text-orange-500" size={36} />
                  <p className="text-gray-600">加载试题中...</p>
                </div>
              )}

              {!questionsLoading && allQuestions.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg mb-2">暂无试题</p>
                  <p className="text-sm">点击"添加试题"开始录入</p>
                </div>
              )}

              {!questionsLoading && allQuestions.length > 0 && (
                <div className="space-y-2 sm:space-y-3">
                  {allQuestions.map((question) => {
                    const weaknessTitle = getWeaknessTitle(question.weaknessId);
                    return (
                      <div
                        key={question.id}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className={`px-2 py-0.5 text-xs rounded-full ${typeBadgeColors[question.type] || 'bg-gray-100 text-gray-700'}`}>
                              {typeLabels[question.type] || question.type}
                            </span>
                            {weaknessTitle && (
                              <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">
                                {weaknessTitle}
                              </span>
                            )}
                          </div>
                          <p className="text-gray-800 text-sm sm:text-base font-medium">
                            {question.question}
                          </p>
                          <p className="text-gray-500 text-xs sm:text-sm mt-1">
                            答案：{question.answer}
                          </p>
                          {question.options && question.type === 'choice' && (
                            <div className="mt-1 flex flex-wrap gap-1.5">
                              {question.options.split(',').map((opt, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 bg-gray-200 rounded text-xs text-gray-600"
                                >
                                  {String.fromCharCode(65 + i)}. {opt.trim()}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => handleEdit(question)}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(question.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">
                {editingQuestion ? '编辑试题' : '添加试题'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">题型</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  >
                    <option value="fill_blank">填空题</option>
                    <option value="choice">选择题</option>
                    <option value="error_correction">改错题</option>
                    <option value="translation">翻译题</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">关联语法短板</label>
                  <select
                    value={formData.weaknessId}
                    onChange={(e) => setFormData({ ...formData, weaknessId: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  >
                    <option value="">不关联</option>
                    {grammarWeaknesses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.title} ({categoryLabels[w.category] || w.category})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">题目</label>
                  <textarea
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">答案</label>
                  <input
                    type="text"
                    value={formData.answer}
                    onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                    required
                  />
                </div>
                {formData.type === 'choice' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">选项（逗号分隔）</label>
                    <input
                      type="text"
                      value={formData.options}
                      onChange={(e) => setFormData({ ...formData, options: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                      placeholder="A选项,B选项,C选项,D选项"
                    />
                  </div>
                )}
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
                    {editingQuestion ? '保存' : '添加'}
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

export default GrammarPractice;