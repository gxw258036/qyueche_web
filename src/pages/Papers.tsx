import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { FileText, AlertCircle, Printer, Eye } from 'lucide-react';
import { Vocabulary } from '@/types';
import { printPaper } from '@/utils/pdf';

const Papers: React.FC = () => {
  const { settings, loadVocabulary, vocabulary } = useStore();
  const [loading, setLoading] = useState(true);
  const [paperConfig, setPaperConfig] = useState({
    grade: settings.currentGrade,
    newWordsCount: 5,
    reviewedWordsCount: 25,
  });
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const init = async () => {
      await loadVocabulary();
      setLoading(false);
    };
    init();
  }, []);

  const getFilteredVocabulary = () => {
    return vocabulary.filter(v => v.grade === paperConfig.grade);
  };

  const getWordsForPaper = (): Vocabulary[] => {
    const filtered = getFilteredVocabulary();
    const newWords = filtered.filter(v => v.status === 'new').slice(0, paperConfig.newWordsCount);
    const reviewedWords = filtered.filter(v => v.status !== 'new').slice(0, paperConfig.reviewedWordsCount);
    const shuffled = [...newWords, ...reviewedWords].sort(() => Math.random() - 0.5);
    return shuffled;
  };

  const handlePrint = async () => {
    const words = getWordsForPaper();
    if (words.length > 0) {
      await printPaper(words, false);
    } else {
      alert('没有可打印的词汇');
    }
  };

  const filteredVocabulary = getFilteredVocabulary();
  const stats = {
    total: filteredVocabulary.length,
    new: filteredVocabulary.filter(v => v.status === 'new').length,
    reviewed: filteredVocabulary.filter(v => v.status !== 'new').length,
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
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2">试卷生成</h1>
          <p className="text-gray-600 text-sm sm:text-base">生成个性化默写试卷</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
          <div className="bg-white rounded-xl p-3 sm:p-4 text-center shadow">
            <div className="text-2xl sm:text-3xl font-bold text-gray-800">{stats.total}</div>
            <div className="text-xs sm:text-sm text-gray-600">总词汇</div>
          </div>
          <div className="bg-orange-50 rounded-xl p-3 sm:p-4 text-center shadow">
            <div className="text-2xl sm:text-3xl font-bold text-orange-600">{stats.new}</div>
            <div className="text-xs sm:text-sm text-orange-700">新词</div>
          </div>
          <div className="bg-blue-50 rounded-xl p-3 sm:p-4 text-center shadow">
            <div className="text-2xl sm:text-3xl font-bold text-blue-600">{stats.reviewed}</div>
            <div className="text-xs sm:text-sm text-blue-700">旧词</div>
          </div>
        </div>

        {/* Configuration */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">试卷配置</h2>
          
          <div className="space-y-4 sm:space-y-6">
            {/* Grade Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">选择年级</label>
              <select
                value={paperConfig.grade}
                onChange={(e) => setPaperConfig({ ...paperConfig, grade: parseInt(e.target.value) })}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              >
                {[2, 3, 4, 5, 6].map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}年级
                  </option>
                ))}
              </select>
            </div>

            {/* New Words Count */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                新词数量: {paperConfig.newWordsCount}
              </label>
              <input
                type="range"
                min="0"
                max="30"
                value={paperConfig.newWordsCount}
                onChange={(e) => setPaperConfig({ ...paperConfig, newWordsCount: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0</span>
                <span>30</span>
              </div>
            </div>

            {/* Reviewed Words Count */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                旧词数量: {paperConfig.reviewedWordsCount}
              </label>
              <input
                type="range"
                min="0"
                max="30"
                value={paperConfig.reviewedWordsCount}
                onChange={(e) => setPaperConfig({ ...paperConfig, reviewedWordsCount: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0</span>
                <span>30</span>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">预览信息</h3>
              <p className="text-sm text-gray-600">
                共 <span className="font-bold text-orange-600">{paperConfig.newWordsCount + paperConfig.reviewedWordsCount}</span> 个词汇
              </p>
              {paperConfig.newWordsCount + paperConfig.reviewedWordsCount === 0 && (
                <div className="flex items-start gap-2 mt-3 text-orange-600 text-sm">
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                  <span>请至少选择一个新词或旧词数量</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-blue-600 text-white rounded-xl hover:from-orange-600 hover:to-blue-700 transition-all font-semibold text-sm sm:text-base"
          >
            <Printer size={20} />
            打印
          </button>
        </div>

        {/* Tips */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3">💡 打印提示</h3>
          <ul className="text-sm text-gray-600 space-y-1 sm:space-y-2">
            <li>• 生成的试卷为A4格式，适合直接打印</li>
            <li>• 试卷包含中文释义，方便学生默写英文</li>
            <li>• 打印后建议预览效果后再批量打印</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Papers;
