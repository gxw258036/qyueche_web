import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { FileText, AlertCircle, Download, Printer, Eye } from 'lucide-react';
import { Vocabulary } from '@/types';
import { generatePDF, printPaper } from '@/utils/pdf';

const Papers: React.FC = () => {
  const { settings, vocabulary, dailyTask, loadVocabulary, loadDailyTask } = useStore();

  const [paperType, setPaperType] = useState<'daily' | 'error' | 'custom'>('daily');
  const [showAnswers, setShowAnswers] = useState(false);
  const [previewWords, setPreviewWords] = useState<Vocabulary[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [customWordCount, setCustomWordCount] = useState(20);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      await loadVocabulary();
      await loadDailyTask();
      setLoading(false);
    };
    init();
  }, []);

  const gradeVocabulary = vocabulary;
  const errorVocabulary = gradeVocabulary.filter(v => v.status === 'error');

  const getWordsForPaper = (): Vocabulary[] => {
    switch (paperType) {
      case 'daily':
        return dailyTask?.allWords || [];
      case 'error':
        return errorVocabulary;
      case 'custom':
        const shuffled = [...gradeVocabulary].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, customWordCount);
      default:
        return [];
    }
  };

  const handlePreview = () => {
    const words = getWordsForPaper();
    setPreviewWords(words);
    setShowPreview(true);
  };

  const handleGeneratePDF = async () => {
    const words = getWordsForPaper();
    if (words.length > 0) {
      await generatePDF(words, showAnswers);
    }
  };

  const handlePrint = async () => {
    const words = getWordsForPaper();
    if (words.length > 0) {
      await printPaper(words, showAnswers);
    }
  };

  const getPaperTitle = () => {
    const titles = {
      daily: '今日默写任务',
      error: '错题专项练习',
      custom: '自定义默写练习',
    };
    return titles[paperType];
  };

  const getPaperDescription = () => {
    switch (paperType) {
      case 'daily':
        return dailyTask 
          ? `共 ${dailyTask.totalCount} 个词汇`
          : '请先生成今日任务';
      case 'error':
        return `共 ${errorVocabulary.length} 个错题需要复习`;
      case 'custom':
        return `从 ${gradeVocabulary.length} 个词汇中随机选择 ${customWordCount} 个`;
      default:
        return '';
    }
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
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">试卷中心</h1>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">选择试卷类型</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <button
                onClick={() => setPaperType('daily')}
                className={`p-6 rounded-xl border-2 transition-all text-left ${
                  paperType === 'daily'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <FileText className="text-orange-500 mb-3" size={32} />
                <h3 className="text-lg font-semibold text-gray-800 mb-1">今日任务</h3>
                <p className="text-sm text-gray-600">使用今日生成的默写任务</p>
              </button>

              <button
                onClick={() => setPaperType('error')}
                className={`p-6 rounded-xl border-2 transition-all text-left ${
                  paperType === 'error'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <AlertCircle className="text-red-500 mb-3" size={32} />
                <h3 className="text-lg font-semibold text-gray-800 mb-1">错题专项</h3>
                <p className="text-sm text-gray-600">只包含标记为错误的词汇</p>
              </button>

              <button
                onClick={() => setPaperType('custom')}
                className={`p-6 rounded-xl border-2 transition-all text-left ${
                  paperType === 'custom'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <FileText className="text-blue-500 mb-3" size={32} />
                <h3 className="text-lg font-semibold text-gray-800 mb-1">自定义</h3>
                <p className="text-sm text-gray-600">随机选择指定数量的词汇</p>
              </button>
            </div>
          </div>

          {paperType === 'custom' && (
            <div className="mb-8 p-6 bg-gray-50 rounded-xl">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                词汇数量: {customWordCount}
              </label>
              <input
                type="range"
                min="5"
                max={Math.min(100, gradeVocabulary.length)}
                value={customWordCount}
                onChange={(e) => setCustomWordCount(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          )}

          <div className="mb-8 p-6 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">包含答案</label>
              <button
                onClick={() => setShowAnswers(!showAnswers)}
                className={`w-14 h-7 rounded-full transition-colors ${
                  showAnswers ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    showAnswers ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="mb-8 p-6 bg-blue-50 rounded-xl">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">{getPaperTitle()}</h3>
            <p className="text-blue-600">{getPaperDescription()}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handlePreview}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200"
            >
              <Eye size={20} />
              预览
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
            >
              <Printer size={20} />
              打印
            </button>
            <button
              onClick={handleGeneratePDF}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-blue-600 text-white rounded-xl hover:from-orange-600 hover:to-blue-700"
            >
              <Download size={20} />
              下载PDF
            </button>
          </div>
        </div>

        {showPreview && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">试卷预览</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                关闭
              </button>
            </div>

            <div id="paper-preview" className="border-2 border-gray-200 rounded-xl p-8">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">{getPaperTitle()}</h1>
                <p className="text-gray-600">
                  {settings.currentGrade}年级 · {new Date().toLocaleDateString('zh-CN')}
                </p>
              </div>

              <div className="space-y-4">
                {previewWords.map((word, index) => (
                  <div key={word.id} className="flex items-center gap-4 border-b border-gray-100 pb-4">
                    <span className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-sm font-semibold text-gray-600">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <div className="text-lg font-medium text-gray-800 mb-1">{word.meaning}</div>
                      <div
                        className="h-8 border-b-2 border-gray-300"
                        style={{
                          color: showAnswers ? '#1f2937' : 'transparent',
                        }}
                      >
                        {showAnswers && word.word}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Papers;
