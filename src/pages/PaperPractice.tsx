import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Printer, RefreshCw, User } from 'lucide-react';
import { ErrorCollection, Vocabulary } from '@/types';
import { api } from '@/services/api';

const PaperPractice: React.FC = () => {
  const { currentStudent } = useStore();
  const [practiceData, setPracticeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [revealedAnswers, setRevealedAnswers] = useState<Set<string>>(new Set());
  const [revealedWords, setRevealedWords] = useState<Set<string>>(new Set());

  const fetchPracticeData = async () => {
    if (!currentStudent) return;
    setLoading(true);
    try {
      const data = await api.paperPractice.get(currentStudent.id, 10);
      setPracticeData(data);
      setRevealedAnswers(new Set());
      setRevealedWords(new Set());
    } catch (error) {
      console.error('获取试卷数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentStudent) {
      fetchPracticeData();
    } else {
      setLoading(false);
    }
  }, [currentStudent]);

  const toggleAnswer = (id: string) => {
    setRevealedAnswers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleWord = (id: string) => {
    setRevealedWords((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleRegenerate = () => {
    fetchPracticeData();
  };

  const errorCollections: ErrorCollection[] = practiceData?.errorCollections || [];
  const vocabulary: Vocabulary[] = practiceData?.vocabulary || [];
  const totalItems = errorCollections.length + vocabulary.length;

  if (!currentStudent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 flex items-center justify-center">
        <div className="text-center px-4">
          <User size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-lg text-gray-600">请先选择学生</p>
        </div>
      </div>
    );
  }

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
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 lg:p-6 mb-4 sm:mb-5">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-1">试卷精练</h1>
          <p className="text-gray-600 text-xs sm:text-sm">基于错题和错词的强化练习</p>
        </div>

        <div className="flex items-center gap-3 mb-4 sm:mb-5">
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="text-2xl font-bold text-gray-800">{totalItems}</div>
            <div className="text-xs text-gray-600">练习题目总数</div>
          </div>
          <button
            onClick={handleRegenerate}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-blue-600 text-white rounded-lg hover:from-orange-600 hover:to-blue-700 transition-all font-semibold text-sm"
          >
            <RefreshCw size={18} />
            生成试卷
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all font-semibold text-sm"
          >
            <Printer size={18} />
            打印
          </button>
        </div>

        {totalItems === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 text-center text-gray-500">
            暂无错题或错词数据，请先完成练习积累错题
          </div>
        )}

        {errorCollections.length > 0 && (
          <div className="mb-4 sm:mb-5">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">错题练习</h2>
            <div className="space-y-3">
              {errorCollections.map((item, index) => (
                <div key={item.id} className="bg-white rounded-xl shadow-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-700 mb-1">
                        {index + 1}. {item.question || item.title}
                      </div>
                      {revealedAnswers.has(item.id) ? (
                        <div className="mt-2 p-3 bg-green-50 rounded-lg">
                          <div className="text-xs text-green-700 font-medium mb-1">答案：</div>
                          <div className="text-sm text-green-800">{item.answer}</div>
                        </div>
                      ) : (
                        <div className="mt-2 text-xs text-gray-400">点击右侧按钮查看答案</div>
                      )}
                    </div>
                    <button
                      onClick={() => toggleAnswer(item.id)}
                      className={`ml-3 px-3 py-1.5 text-xs rounded-lg transition-colors ${
                        revealedAnswers.has(item.id)
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {revealedAnswers.has(item.id) ? '隐藏答案' : '显示答案'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {vocabulary.length > 0 && (
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">错词默写</h2>
            <div className="space-y-3">
              {vocabulary.map((word, index) => (
                <div key={word.id} className="bg-white rounded-xl shadow-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-700 mb-1">
                        {index + 1}. {word.meaning}
                      </div>
                      {revealedWords.has(word.id) ? (
                        <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                          <div className="text-xs text-blue-700 font-medium mb-1">单词：</div>
                          <div className="text-lg font-bold text-blue-800">{word.word}</div>
                        </div>
                      ) : (
                        <div className="mt-2 text-xs text-gray-400">点击右侧按钮查看单词</div>
                      )}
                    </div>
                    <button
                      onClick={() => toggleWord(word.id)}
                      className={`ml-3 px-3 py-1.5 text-xs rounded-lg transition-colors ${
                        revealedWords.has(word.id)
                          ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {revealedWords.has(word.id) ? '隐藏单词' : '显示单词'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaperPractice;