import React, { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { X, Calendar, CheckCircle2, XCircle, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { DailyTaskHistory, Vocabulary } from '@/types';

interface HistoryModalProps {
  onClose: () => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ onClose }) => {
  const { loadDailyTaskHistory } = useStore();
  const [history, setHistory] = useState<DailyTaskHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [wordFilter, setWordFilter] = useState<'all' | 'correct' | 'error'>('all');

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      const data = await loadDailyTaskHistory(30);
      setHistory(data);
      setLoading(false);
    };
    fetchHistory();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getAllWords = (task: DailyTaskHistory): Vocabulary[] => {
    return [...task.newWords, ...task.reviewedWords];
  };

  const getFilteredWords = (task: DailyTaskHistory): Vocabulary[] => {
    const allWords = getAllWords(task);
    if (wordFilter === 'all') {
      return allWords;
    } else if (wordFilter === 'correct') {
      return allWords.filter(word => !isErrorWord(word.id, task));
    } else {
      return allWords.filter(word => isErrorWord(word.id, task));
    }
  };

  const isErrorWord = (wordId: string, task: DailyTaskHistory): boolean => {
    return task.markedErrorWords.includes(wordId);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Calendar className="text-purple-500" size={28} />
            默写历史记录
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(80vh-80px)] p-6">
          {loading ? (
            <div className="text-center py-12 text-gray-500">加载中...</div>
          ) : history.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              暂无历史记录
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((task) => (
                <div
                  key={task.id}
                  className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden"
                >
                  <div
                    className="p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => toggleExpand(task.id)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar size={18} />
                        <span className="font-medium">{formatDate(task.date)}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-500">
                          {task.grade}年级
                        </div>
                        <button className="p-1 hover:bg-gray-200 rounded">
                          {expandedId === task.id ? (
                            <ChevronUp size={20} />
                          ) : (
                            <ChevronDown size={20} />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4">
                      <div className="bg-white rounded-lg p-3 text-center border">
                        <div className="text-2xl font-bold text-gray-800">{task.totalCount}</div>
                        <div className="text-sm text-gray-500">总词汇</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3 text-center border border-green-200">
                        <div className="text-2xl font-bold text-green-600 flex items-center justify-center gap-1">
                          <CheckCircle2 size={20} />
                          {task.correctCount}
                        </div>
                        <div className="text-sm text-green-600">正确</div>
                      </div>
                      <div className="bg-red-50 rounded-lg p-3 text-center border border-red-200">
                        <div className="text-2xl font-bold text-red-600 flex items-center justify-center gap-1">
                          <XCircle size={20} />
                          {task.errorCount}
                        </div>
                        <div className="text-sm text-red-600">错误</div>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-200">
                        <div className="text-2xl font-bold text-blue-600">
                          {task.totalCount > 0 ? Math.round((task.correctCount / task.totalCount) * 100) : 0}%
                        </div>
                        <div className="text-sm text-blue-600">正确率</div>
                      </div>
                    </div>

                    {getAllWords(task).length > 0 && (
                      <div className="mt-3 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
                        <BookOpen size={16} />
                        点击查看 {getAllWords(task).length} 个默写单词
                      </div>
                    )}
                  </div>

                  {expandedId === task.id && getAllWords(task).length > 0 && (
                    <div className="px-4 pb-4 border-t border-gray-200">
                      <div className="pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-700">默写单词列表</h4>
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setWordFilter('all');
                              }}
                              className={`px-3 py-1 rounded-lg text-sm ${
                                wordFilter === 'all'
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              全部 ({getAllWords(task).length})
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setWordFilter('correct');
                              }}
                              className={`px-3 py-1 rounded-lg text-sm ${
                                wordFilter === 'correct'
                                  ? 'bg-green-500 text-white'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              正确 ({task.correctCount})
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setWordFilter('error');
                              }}
                              className={`px-3 py-1 rounded-lg text-sm ${
                                wordFilter === 'error'
                                  ? 'bg-red-500 text-white'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              错误 ({task.errorCount})
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                          {getFilteredWords(task).map((word) => (
                            <div
                              key={word.id}
                              className={`flex items-center justify-between p-2 rounded-lg ${
                                isErrorWord(word.id, task)
                                  ? 'bg-red-50 border border-red-200'
                                  : 'bg-green-50 border border-green-200'
                              }`}
                            >
                              <div>
                                <div className="font-medium text-gray-800">{word.word}</div>
                                <div className="text-sm text-gray-500">{word.meaning}</div>
                              </div>
                              {isErrorWord(word.id, task) ? (
                                <XCircle className="text-red-500" size={18} />
                              ) : (
                                <CheckCircle2 className="text-green-500" size={18} />
                              )}
                            </div>
                          ))}
                          {getFilteredWords(task).length === 0 && (
                            <div className="col-span-2 text-center py-8 text-gray-500 text-sm">
                              没有符合条件的单词
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;
