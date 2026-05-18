
import React, { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { CheckCircle2, XCircle, Download, Printer, RefreshCw } from 'lucide-react';
import { Vocabulary } from '@/types';
import { generatePDF, printPaper } from '@/utils/pdf';

const Daily: React.FC = () =&gt; {
  const {
    settings,
    initializeVocabulary,
    generateDailyTask,
    getTodayTask,
    markErrorWords,
    completeTodayTask,
  } = useStore();
  
  const [todayTask, setTodayTask] = useState&lt;ReturnType&lt;typeof getTodayTask&gt;&gt;(null);
  const [selectedErrors, setSelectedErrors] = useState&lt;string[]&gt;([]);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() =&gt; {
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

  const toggleErrorWord = (wordId: string) =&gt; {
    setSelectedErrors(prev =&gt; {
      if (prev.includes(wordId)) {
        return prev.filter(id =&gt; id !== wordId);
      } else {
        return [...prev, wordId];
      }
    });
  };

  const handleSaveErrors = () =&gt; {
    if (todayTask) {
      markErrorWords(todayTask.date, selectedErrors);
      completeTodayTask();
      setIsComplete(true);
    }
  };

  const handleGeneratePDF = async () =&gt; {
    if (todayTask) {
      await generatePDF([...todayTask.newWords, ...todayTask.reviewedWords], false);
    }
  };

  const handlePrint = async () =&gt; {
    if (todayTask) {
      await printPaper([...todayTask.newWords, ...todayTask.reviewedWords], false);
    }
  };

  const handleRegenerate = () =&gt; {
    if (window.confirm('确定要重新生成今日任务吗？')) {
      const newTask = generateDailyTask(settings.currentGrade);
      setTodayTask(newTask);
      setSelectedErrors([]);
      setIsComplete(false);
    }
  };

  if (!todayTask) {
    return (
      &lt;div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 flex items-center justify-center"&gt;
        &lt;div className="text-center"&gt;
          &lt;RefreshCw className="animate-spin mx-auto mb-4 text-orange-500" size={48} /&gt;
          &lt;p className="text-xl text-gray-600"&gt;正在生成今日任务...&lt;/p&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    );
  }

  return (
    &lt;div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50"&gt;
      &lt;div className="max-w-5xl mx-auto px-4 py-8"&gt;
        &lt;div className="bg-white rounded-2xl shadow-lg p-8 mb-8"&gt;
          &lt;div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6"&gt;
            &lt;div&gt;
              &lt;h1 className="text-3xl font-bold text-gray-800 mb-2"&gt;今日默写任务&lt;/h1&gt;
              &lt;p className="text-gray-600"&gt;
                {settings.currentGrade}年级 · {new Date().toLocaleDateString('zh-CN')}
              &lt;/p&gt;
            &lt;/div&gt;
            &lt;div className="flex gap-3"&gt;
              &lt;button
                onClick={handleRegenerate}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              &gt;
                &lt;RefreshCw size={18} /&gt;
                重新生成
              &lt;/button&gt;
              &lt;button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              &gt;
                &lt;Printer size={18} /&gt;
                打印
              &lt;/button&gt;
              &lt;button
                onClick={handleGeneratePDF}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              &gt;
                &lt;Download size={18} /&gt;
                下载PDF
              &lt;/button&gt;
            &lt;/div&gt;
          &lt;/div&gt;

          &lt;div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"&gt;
            &lt;div className="bg-orange-50 p-4 rounded-xl text-center"&gt;
              &lt;div className="text-3xl font-bold text-orange-600"&gt;{todayTask.newWords.length}&lt;/div&gt;
              &lt;div className="text-sm text-orange-700"&gt;新词&lt;/div&gt;
            &lt;/div&gt;
            &lt;div className="bg-blue-50 p-4 rounded-xl text-center"&gt;
              &lt;div className="text-3xl font-bold text-blue-600"&gt;{todayTask.reviewedWords.length}&lt;/div&gt;
              &lt;div className="text-sm text-blue-700"&gt;旧词&lt;/div&gt;
            &lt;/div&gt;
            &lt;div className="bg-green-50 p-4 rounded-xl text-center"&gt;
              &lt;div className="text-3xl font-bold text-green-600"&gt;{allWords.length - selectedErrors.length}&lt;/div&gt;
              &lt;div className="text-sm text-green-700"&gt;正确&lt;/div&gt;
            &lt;/div&gt;
            &lt;div className="bg-red-50 p-4 rounded-xl text-center"&gt;
              &lt;div className="text-3xl font-bold text-red-600"&gt;{selectedErrors.length}&lt;/div&gt;
              &lt;div className="text-sm text-red-700"&gt;错误&lt;/div&gt;
            &lt;/div&gt;
          &lt;/div&gt;

          &lt;div className="space-y-3"&gt;
            &lt;h2 className="text-xl font-semibold text-gray-800 mb-4"&gt;词汇列表&lt;/h2&gt;
            {allWords.map((word, index) =&gt; {
              const isError = selectedErrors.includes(word.id);
              const isNew = todayTask.newWords.some(w =&gt; w.id === word.id);
              return (
                &lt;div
                  key={word.id}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                    isError 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-200 bg-white hover:border-blue-300'
                  }`}
                &gt;
                  &lt;div className="flex items-center gap-4"&gt;
                    &lt;span className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-sm font-semibold text-gray-600"&gt;
                      {index + 1}
                    &lt;/span&gt;
                    &lt;div&gt;
                      &lt;div className="flex items-center gap-2"&gt;
                        &lt;span className="text-lg font-semibold text-gray-800"&gt;{word.meaning}&lt;/span&gt;
                        {isNew &amp;&amp; (
                          &lt;span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full"&gt;新词&lt;/span&gt;
                        )}
                      &lt;/div&gt;
                      &lt;span className="text-sm text-gray-500"&gt;{word.word}&lt;/span&gt;
                    &lt;/div&gt;
                  &lt;/div&gt;
                  {!isComplete &amp;&amp; (
                    &lt;button
                      onClick={() =&gt; toggleErrorWord(word.id)}
                      className={`p-2 rounded-lg transition-all ${
                        isError
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-500'
                      }`}
                    &gt;
                      {isError ? &lt;XCircle size={20} /&gt; : &lt;CheckCircle2 size={20} /&gt;}
                    &lt;/button&gt;
                  )}
                  {isComplete &amp;&amp; (
                    isError ? (
                      &lt;XCircle className="text-red-500" size={24} /&gt;
                    ) : (
                      &lt;CheckCircle2 className="text-green-500" size={24} /&gt;
                    )
                  )}
                &lt;/div&gt;
              );
            })}
          &lt;/div&gt;

          {!isComplete &amp;&amp; (
            &lt;div className="mt-8"&gt;
              &lt;button
                onClick={handleSaveErrors}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-teal-700 transition-all text-lg"
              &gt;
                保存并完成今日任务
              &lt;/button&gt;
            &lt;/div&gt;
          )}

          {isComplete &amp;&amp; (
            &lt;div className="mt-8 p-6 bg-green-50 rounded-xl border-2 border-green-200 text-center"&gt;
              &lt;CheckCircle2 className="mx-auto mb-4 text-green-600" size={48} /&gt;
              &lt;h3 className="text-2xl font-bold text-green-800 mb-2"&gt;太棒了！&lt;/h3&gt;
              &lt;p className="text-green-700"&gt;今日任务已完成，继续保持！&lt;/p&gt;
            &lt;/div&gt;
          )}
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  );
};

export default Daily;
