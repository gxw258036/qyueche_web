
import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { FileText, AlertCircle, Download, Printer, Eye } from 'lucide-react';
import { Vocabulary } from '@/types';
import { generatePDF, printPaper } from '@/utils/pdf';

const Papers: React.FC = () =&gt; {
  const {
    settings,
    vocabulary,
    getTodayTask,
    dailyTasks,
  } = useStore();

  const [paperType, setPaperType] = useState&lt;'daily' | 'error' | 'custom'&gt;('daily');
  const [showAnswers, setShowAnswers] = useState(false);
  const [previewWords, setPreviewWords] = useState&lt;Vocabulary[]&gt;([]);
  const [showPreview, setShowPreview] = useState(false);
  const [customWordCount, setCustomWordCount] = useState(20);

  const todayTask = getTodayTask();
  const gradeVocabulary = vocabulary.filter(v =&gt; v.grade === settings.currentGrade);
  const errorVocabulary = gradeVocabulary.filter(v =&gt; v.status === 'error');

  const getWordsForPaper = () =&gt; {
    switch (paperType) {
      case 'daily':
        return todayTask 
          ? [...todayTask.newWords, ...todayTask.reviewedWords]
          : [];
      case 'error':
        return errorVocabulary;
      case 'custom':
        const shuffled = [...gradeVocabulary].sort(() =&gt; Math.random() - 0.5);
        return shuffled.slice(0, customWordCount);
      default:
        return [];
    }
  };

  const handlePreview = () =&gt; {
    const words = getWordsForPaper();
    setPreviewWords(words);
    setShowPreview(true);
  };

  const handleGeneratePDF = async () =&gt; {
    const words = getWordsForPaper();
    await generatePDF(words, showAnswers);
  };

  const handlePrint = async () =&gt; {
    const words = getWordsForPaper();
    await printPaper(words, showAnswers);
  };

  const getPaperTitle = () =&gt; {
    const titles = {
      daily: '今日默写任务',
      error: '错题专项练习',
      custom: '自定义默写练习',
    };
    return titles[paperType];
  };

  const getPaperDescription = () =&gt; {
    switch (paperType) {
      case 'daily':
        return todayTask 
          ? `共 ${todayTask.newWords.length + todayTask.reviewedWords.length} 个词汇，含 ${todayTask.newWords.length} 个新词`
          : '请先生成今日任务';
      case 'error':
        return `共 ${errorVocabulary.length} 个错题需要复习`;
      case 'custom':
        return `从 ${gradeVocabulary.length} 个词汇中随机选择 ${customWordCount} 个`;
      default:
        return '';
    }
  };

  return (
    &lt;div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50"&gt;
      &lt;div className="max-w-5xl mx-auto px-4 py-8"&gt;
        &lt;div className="bg-white rounded-2xl shadow-lg p-8 mb-8"&gt;
          &lt;h1 className="text-3xl font-bold text-gray-800 mb-8"&gt;试卷中心&lt;/h1&gt;

          &lt;div className="mb-8"&gt;
            &lt;h2 className="text-xl font-semibold text-gray-800 mb-4"&gt;选择试卷类型&lt;/h2&gt;
            &lt;div className="grid md:grid-cols-3 gap-4"&gt;
              &lt;button
                onClick={() =&gt; setPaperType('daily')}
                className={`p-6 rounded-xl border-2 transition-all text-left ${
                  paperType === 'daily'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              &gt;
                &lt;FileText className="text-orange-500 mb-3" size={32} /&gt;
                &lt;h3 className="text-lg font-semibold text-gray-800 mb-1"&gt;今日任务&lt;/h3&gt;
                &lt;p className="text-sm text-gray-600"&gt;使用今日生成的默写任务&lt;/p&gt;
              &lt;/button&gt;

              &lt;button
                onClick={() =&gt; setPaperType('error')}
                className={`p-6 rounded-xl border-2 transition-all text-left ${
                  paperType === 'error'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              &gt;
                &lt;AlertCircle className="text-red-500 mb-3" size={32} /&gt;
                &lt;h3 className="text-lg font-semibold text-gray-800 mb-1"&gt;错题专项&lt;/h3&gt;
                &lt;p className="text-sm text-gray-600"&gt;只包含标记为错误的词汇&lt;/p&gt;
              &lt;/button&gt;

              &lt;button
                onClick={() =&gt; setPaperType('custom')}
                className={`p-6 rounded-xl border-2 transition-all text-left ${
                  paperType === 'custom'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              &gt;
                &lt;FileText className="text-blue-500 mb-3" size={32} /&gt;
                &lt;h3 className="text-lg font-semibold text-gray-800 mb-1"&gt;自定义&lt;/h3&gt;
                &lt;p className="text-sm text-gray-600"&gt;随机选择指定数量的词汇&lt;/p&gt;
              &lt;/button&gt;
            &lt;/div&gt;
          &lt;/div&gt;

          {paperType === 'custom' &amp;&amp; (
            &lt;div className="mb-8 p-6 bg-gray-50 rounded-xl"&gt;
              &lt;label className="block text-sm font-medium text-gray-700 mb-2"&gt;
                词汇数量: {customWordCount}
              &lt;/label&gt;
              &lt;input
                type="range"
                min="5"
                max={Math.min(100, gradeVocabulary.length)}
                value={customWordCount}
                onChange={(e) =&gt; setCustomWordCount(parseInt(e.target.value))}
                className="w-full"
              /&gt;
            &lt;/div&gt;
          )}

          &lt;div className="mb-8 p-6 bg-gray-50 rounded-xl"&gt;
            &lt;div className="flex items-center justify-between"&gt;
              &lt;label className="text-sm font-medium text-gray-700"&gt;包含答案&lt;/label&gt;
              &lt;button
                onClick={() =&gt; setShowAnswers(!showAnswers)}
                className={`w-14 h-7 rounded-full transition-colors ${
                  showAnswers ? 'bg-green-500' : 'bg-gray-300'
                }`}
              &gt;
                &lt;div
                  className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    showAnswers ? 'translate-x-7' : 'translate-x-1'
                  }`}
                /&gt;
              &lt;/button&gt;
            &lt;/div&gt;
          &lt;/div&gt;

          &lt;div className="mb-8 p-6 bg-blue-50 rounded-xl"&gt;
            &lt;h3 className="text-lg font-semibold text-blue-800 mb-2"&gt;{getPaperTitle()}&lt;/h3&gt;
            &lt;p className="text-blue-600"&gt;{getPaperDescription()}&lt;/p&gt;
          &lt;/div&gt;

          &lt;div className="flex flex-wrap gap-3"&gt;
            &lt;button
              onClick={handlePreview}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200"
            &gt;
              &lt;Eye size={20} /&gt;
              预览
            &lt;/button&gt;
            &lt;button
              onClick={handlePrint}
              className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
            &gt;
              &lt;Printer size={20} /&gt;
              打印
            &lt;/button&gt;
            &lt;button
              onClick={handleGeneratePDF}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-blue-600 text-white rounded-xl hover:from-orange-600 hover:to-blue-700"
            &gt;
              &lt;Download size={20} /&gt;
              下载PDF
            &lt;/button&gt;
          &lt;/div&gt;
        &lt;/div&gt;

        {showPreview &amp;&amp; (
          &lt;div className="bg-white rounded-2xl shadow-lg p-8"&gt;
            &lt;div className="flex items-center justify-between mb-6"&gt;
              &lt;h2 className="text-2xl font-bold text-gray-800"&gt;试卷预览&lt;/h2&gt;
              &lt;button
                onClick={() =&gt; setShowPreview(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              &gt;
                关闭
              &lt;/button&gt;
            &lt;/div&gt;

            &lt;div id="paper-preview" className="border-2 border-gray-200 rounded-xl p-8"&gt;
              &lt;div className="text-center mb-8"&gt;
                &lt;h1 className="text-2xl font-bold text-gray-800 mb-2"&gt;{getPaperTitle()}&lt;/h1&gt;
                &lt;p className="text-gray-600"&gt;
                  {settings.currentGrade}年级 · {new Date().toLocaleDateString('zh-CN')}
                &lt;/p&gt;
              &lt;/div&gt;

              &lt;div className="space-y-4"&gt;
                {previewWords.map((word, index) =&gt; (
                  &lt;div key={word.id} className="flex items-center gap-4 border-b border-gray-100 pb-4"&gt;
                    &lt;span className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-sm font-semibold text-gray-600"&gt;
                      {index + 1}
                    &lt;/span&gt;
                    &lt;div className="flex-1"&gt;
                      &lt;div className="text-lg font-medium text-gray-800 mb-1"&gt;{word.meaning}&lt;/div&gt;
                      &lt;div
                        className="h-8 border-b-2 border-gray-300"
                        style={{
                          color: showAnswers ? '#1f2937' : 'transparent',
                        }}
                      &gt;
                        {showAnswers &amp;&amp; word.word}
                      &lt;/div&gt;
                    &lt;/div&gt;
                  &lt;/div&gt;
                ))}
              &lt;/div&gt;
            &lt;/div&gt;
          &lt;/div&gt;
        )}
      &lt;/div&gt;
    &lt;/div&gt;
  );
};

export default Papers;
