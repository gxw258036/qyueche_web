import React, { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { CheckCircle2, XCircle, Printer, RefreshCw, History } from 'lucide-react';
import { Vocabulary } from '@/types';
import { printPaper } from '@/utils/pdf';
import HistoryModal from '@/components/HistoryModal';

const Daily: React.FC = () => {
  const {
    dailyTask,
    generateDailyTask,
    completeDailyTask,
    loadDailyTask,
    currentStudent,
  } = useStore();
  
  const [selectedErrors, setSelectedErrors] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    const init = async () => {
      try {
        const task = await loadDailyTask();
        if (!mounted) return;
        
        if (!task) {
          await generateDailyTask();
        } else {
          if (task.markedErrorWords) {
            setSelectedErrors(task.markedErrorWords);
          }
          if (task.completed) {
            setIsComplete(true);
          }
        }
      } catch (error) {
        console.error('初始化任务失败:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    init();
    
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (dailyTask) {
      if (dailyTask.markedErrorWords) {
        setSelectedErrors(dailyTask.markedErrorWords);
      }
      if (dailyTask.completed) {
        setIsComplete(true);
      }
    }
  }, [dailyTask]);

  const allWords: Vocabulary[] = dailyTask 
    ? [...(dailyTask.newWords || []), ...(dailyTask.reviewedWords || [])] 
    : [];

  const toggleErrorWord = (wordId: string) => {
    setSelectedErrors(prev => {
      if (prev.includes(wordId)) {
        return prev.filter(id => id !== wordId);
      } else {
        return [...prev, wordId];
      }
    });
  };

  const handleSaveErrors = async () => {
    const newTask = await completeDailyTask(selectedErrors);
    if (newTask) {
      setSelectedErrors(newTask.markedErrorWords || []);
      setIsComplete(true);
    }
  };

  const handlePrint = async () => {
    if (allWords.length > 0) {
      await printPaper(allWords, false);
    }
  };

  const handleRegenerate = async (skipConfirm = false) => {
    console.log('点击生成任务按钮');
    console.log('当前学生:', currentStudent);
    
    if (!currentStudent) {
      alert('请先选择一个学生！');
      return;
    }
    
    const shouldGenerate = skipConfirm || window.confirm('确定要重新生成今日任务吗？');
    
    if (shouldGenerate) {
      console.log('用户确认生成任务');
      await generateDailyTask();
      setSelectedErrors([]);
      setIsComplete(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-yellow-50 flex items-center justify-center">
        <div className="text-center px-4">
          <RefreshCw className="animate-spin mx-auto mb-4 text-yellow-500" size={48} />
          <p className="text-xl text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!dailyTask || !dailyTask.id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-yellow-50 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="text-yellow-500 mb-4" style={{ fontSize: '48px' }}>📚</div>
          <p className="text-lg sm:text-xl text-gray-600 mb-4">
            {dailyTask?.message || '暂无今日任务'}
          </p>
          <button
            onClick={() => handleRegenerate(true)}
            className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg hover:from-yellow-500 hover:to-orange-600"
          >
            生成今日任务
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-yellow-50">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Header Card */}
        <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 lg:p-6 mb-4 sm:mb-5">
          {/* Title and Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 sm:mb-4">
            <div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-1">今日默写任务</h1>
              <p className="text-gray-600 text-xs sm:text-sm">
                {new Date().toLocaleDateString('zh-CN')}
              </p>
            </div>
          </div>

          {/* Action Buttons - Horizontal scroll on mobile */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 sm:overflow-visible sm:pb-0 sm:-mx-0 sm:px-0">
            <button
              onClick={() => setShowHistory(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 whitespace-nowrap text-sm"
            >
              <History size={16} />
              历史
            </button>
            <button
              onClick={handleRegenerate}
              className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 whitespace-nowrap text-sm"
            >
              <RefreshCw size={16} />
              重新生成
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg hover:from-yellow-500 hover:to-orange-600 whitespace-nowrap text-sm"
            >
              <Printer size={16} />
              打印
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 sm:mb-5">
          <div className="bg-yellow-50 p-2.5 sm:p-3 rounded-lg text-center">
            <div className="text-xl sm:text-2xl font-bold text-yellow-600">{(dailyTask.newWords || []).length}</div>
            <div className="text-xs text-yellow-700">新词</div>
          </div>
          <div className="bg-blue-50 p-2.5 sm:p-3 rounded-lg text-center">
            <div className="text-xl sm:text-2xl font-bold text-blue-600">{(dailyTask.reviewedWords || []).length}</div>
            <div className="text-xs text-blue-700">旧词</div>
          </div>
          <div className="bg-green-50 p-2.5 sm:p-3 rounded-lg text-center">
            <div className="text-xl sm:text-2xl font-bold text-green-600">{allWords.length - selectedErrors.length}</div>
            <div className="text-xs text-green-700">正确</div>
          </div>
          <div className="bg-red-50 p-2.5 sm:p-3 rounded-lg text-center">
            <div className="text-xl sm:text-2xl font-bold text-red-600">{selectedErrors.length}</div>
            <div className="text-xs text-red-700">错误</div>
          </div>
        </div>

        {/* Word List */}
        <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 lg:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">词汇列表</h2>
          <div className="space-y-1.5 sm:space-y-2.5">
            {allWords.map((word, index) => {
              const isError = selectedErrors.includes(word.id);
              const isNew = (dailyTask.newWords || []).some((w: any) => w.id === word.id);
              return (
                <div
                  key={word.id}
                  className={`flex items-center justify-between p-3 sm:p-4 rounded-xl border-2 transition-all ${
                    isError 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-200 bg-white hover:border-yellow-300'
                  }`}
                >
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <span className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-gray-100 rounded-full text-xs sm:text-sm font-semibold text-gray-600 flex-shrink-0">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                        <span className="text-base sm:text-lg font-semibold text-gray-800 truncate">{word.meaning}</span>
                        {isNew && (
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full flex-shrink-0">新词</span>
                        )}
                      </div>
                      <span className="text-xs sm:text-sm text-gray-500 truncate block">{word.word}</span>
                    </div>
                  </div>
                  {!isComplete && (
                    <button
                      onClick={() => toggleErrorWord(word.id)}
                      className={`p-2 rounded-lg transition-all flex-shrink-0 ${
                        isError
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-500'
                      }`}
                    >
                      {isError ? <XCircle size={18} /> : <CheckCircle2 size={18} />}
                    </button>
                  )}
                  {isComplete && (
                    isError ? (
                      <XCircle className="text-red-500 flex-shrink-0" size={20} />
                    ) : (
                      <CheckCircle2 className="text-green-500 flex-shrink-0" size={20} />
                    )
                  )}
                </div>
              );
            })}
          </div>

          {/* Complete Button */}
          {!isComplete && (
            <div className="mt-6 sm:mt-8">
              <button
                onClick={handleSaveErrors}
                className="w-full py-3 sm:py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl font-semibold hover:from-yellow-500 hover:to-orange-600 transition-all text-base sm:text-lg"
              >
                保存并完成今日任务
              </button>
            </div>
          )}

          {/* Success Message */}
          {isComplete && (
            <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-green-50 rounded-xl border-2 border-green-200 text-center">
              <CheckCircle2 className="mx-auto mb-2 sm:mb-4 text-green-600" size={40} />
              <h3 className="text-lg sm:text-2xl font-bold text-green-800 mb-1 sm:mb-2">太棒了！</h3>
              <p className="text-green-700 text-sm sm:text-base">今日任务已完成，继续保持！</p>
            </div>
          )}
        </div>
      </div>
      
      {showHistory && (
        <HistoryModal onClose={() => setShowHistory(false)} />
      )}
    </div>
  );
};

export default Daily;
