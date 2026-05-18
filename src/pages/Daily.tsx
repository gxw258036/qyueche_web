import React, { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { CheckCircle2, XCircle, Download, Printer, RefreshCw } from 'lucide-react';
import { Vocabulary } from '@/types';
import { generatePDF, printPaper } from '@/utils/pdf';

const Daily: React.FC = () => {
  const {
    settings,
    initializeVocabulary,
    generateDailyTask,
    getTodayTask,
    markErrorWords,
    completeTodayTask,
  } = useStore();
  
  const [todayTask, setTodayTask] = useState<ReturnType<typeof getTodayTask>>(null);
  const [selectedErrors, setSelectedErrors] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    initializeVocabulary();
    const task = getTodayTask();
    if (!task) {
      const newTask = generateDailyTask(settings.currentGrade);
      setTodayTask(newTask);
    } else {
      setTodayTask(task);
      if (task.markedErrorWords) {
        setSelectedErrors(task.markedErrorWords);
      }
      if (task.completed) {
        setIsComplete(true);
      }
    }
  }, [initializeVocabulary, generateDailyTask, getTodayTask, settings.currentGrade]);

  const allWords: Vocabulary[] = todayTask 
    ? [...todayTask.newWords, ...todayTask.reviewedWords] 
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

  const handleSaveErrors = () => {
    if (todayTask) {
      markErrorWords(todayTask.date, selectedErrors);
      completeTodayTask();
      setIsComplete(true);
    }
  };

  const handleGeneratePDF = async () => {
    if (todayTask) {
      await generatePDF([...todayTask.newWords, ...todayTask.reviewedWords], false);
    }
  };

  const handlePrint = async () => {
    if (todayTask) {
      await printPaper([...todayTask.newWords, ...todayTask.reviewedWords], false);
    }
  };

  const handleRegenerate = () => {
    if (window.confirm('确定要重新生成今日任务吗？')) {
      const newTask = generateDailyTask(settings.currentGrade);
      setTodayTask(newTask);
      setSelectedErrors([]);
      setIsComplete(false);
    }
  };

  if (!todayTask) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-4 text-orange-500" size={48} />
          <p className="text-xl text-gray-600">正在生成今日任务...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">今日默写任务</h1>
              <p className="text-gray-600">
                {settings.currentGrade}年级 · {new Date().toLocaleDateString('zh-CN')}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRegenerate}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                <RefreshCw size={18} />
                重新生成
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                <Printer size={18} />
                打印
              </button>
              <button
                onClick={handleGeneratePDF}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                <Download size={18} />
                下载PDF
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-orange-50 p-4 rounded-xl text-center">
              <div className="text-3xl font-bold text-orange-600">{todayTask.newWords.length}</div>
              <div className="text-sm text-orange-700">新词</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl text-center">
              <div className="text-3xl font-bold text-blue-600">{todayTask.reviewedWords.length}</div>
              <div className="text-sm text-blue-700">旧词</div>
            </div>
            <div className="bg-green-50 p-4 rounded-xl text-center">
              <div className="text-3xl font-bold text-green-600">{allWords.length - selectedErrors.length}</div>
              <div className="text-sm text-green-700">正确</div>
            </div>
            <div className="bg-red-50 p-4 rounded-xl text-center">
              <div className="text-3xl font-bold text-red-600">{selectedErrors.length}</div>
              <div className="text-sm text-red-700">错误</div>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">词汇列表</h2>
            {allWords.map((word, index) => {
              const isError = selectedErrors.includes(word.id);
              const isNew = todayTask.newWords.some(w => w.id === word.id);
              return (
                <div
                  key={word.id}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                    isError 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-200 bg-white hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-sm font-semibold text-gray-600">
                      {index + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold text-gray-800">{word.meaning}</span>
                        {isNew && (
                          <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">新词</span>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">{word.word}</span>
                    </div>
                  </div>
                  {!isComplete && (
                    <button
                      onClick={() => toggleErrorWord(word.id)}
                      className={`p-2 rounded-lg transition-all ${
                        isError
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-500'
                      }`}
                    >
                      {isError ? <XCircle size={20} /> : <CheckCircle2 size={20} />}
                    </button>
                  )}
                  {isComplete && (
                    isError ? (
                      <XCircle className="text-red-500" size={24} />
                    ) : (
                      <CheckCircle2 className="text-green-500" size={24} />
                    )
                  )}
                </div>
              );
            })}
          </div>

          {!isComplete && (
            <div className="mt-8">
              <button
                onClick={handleSaveErrors}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-teal-700 transition-all text-lg"
              >
                保存并完成今日任务
              </button>
            </div>
          )}

          {isComplete && (
            <div className="mt-8 p-6 bg-green-50 rounded-xl border-2 border-green-200 text-center">
              <CheckCircle2 className="mx-auto mb-4 text-green-600" size={48} />
              <h3 className="text-2xl font-bold text-green-800 mb-2">太棒了！</h3>
              <p className="text-green-700">今日任务已完成，继续保持！</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Daily;
