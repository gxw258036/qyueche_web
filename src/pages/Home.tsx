
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { Calendar, Book, CheckCircle, AlertCircle } from 'lucide-react';
import { GRADE_CONFIGS } from '@/types';

const Home: React.FC = () =&gt; {
  const navigate = useNavigate();
  const {
    settings, vocabulary, dailyTasks, updateSettings, initializeVocabulary, generateDailyTask, getTodayTask } = useStore();
  const [todayTask, setTodayTask] = useState&lt;ReturnType&lt;typeof getTodayTask&gt;&gt;(null);

  useEffect(() =&gt; {
    initializeVocabulary();
  }, [initializeVocabulary]);

  useEffect(() =&gt; {
    const task = getTodayTask();
    setTodayTask(task);
  }, [getTodayTask, dailyTasks]);

  const handleGradeChange = (grade: number) =&gt; {
    updateSettings({ currentGrade: grade });
  };

  const handleGenerateToday = () =&gt; {
    if (!todayTask) {
      generateDailyTask(settings.currentGrade);
    }
    navigate('/daily');
  };

  const stats = {
    totalWords: vocabulary.filter(v =&gt; v.grade === settings.currentGrade).length,
    newWords: vocabulary.filter(v =&gt; v.grade === settings.currentGrade &amp;&amp; v.status === 'new').length,
    masteredWords: vocabulary.filter(v =&gt; v.grade === settings.currentGrade &amp;&amp; v.status === 'mastered').length,
    errorWords: vocabulary.filter(v =&gt; v.grade === settings.currentGrade &amp;&amp; v.status === 'error').length,
  };

  const config = GRADE_CONFIGS[settings.currentGrade];

  return (
    &lt;div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50"&gt;
      &lt;div className="max-w-6xl mx-auto px-4 py-8"&gt;
        &lt;div className="text-center mb-12"&gt;
          &lt;h1 className="text-4xl font-bold text-gray-800 mb-4"&gt;
            👋 欢迎使用小学英语默写工具
          &lt;/h1&gt;
          &lt;p className="text-gray-600 text-lg"&gt;
            每日坚持，词汇量天天涨！
          &lt;/p&gt;
        &lt;/div&gt;

        &lt;div className="bg-white rounded-2xl shadow-lg p-8 mb-8"&gt;
          &lt;h2 className="text-2xl font-bold text-gray-800 mb-6"&gt;选择年级&lt;/h2&gt;
          &lt;div className="grid grid-cols-2 md:grid-cols-5 gap-4"&gt;
            {[2, 3, 4, 5, 6].map((grade) =&gt; (
              &lt;button
                key={grade}
                onClick={() =&gt; handleGradeChange(grade)}
                className={`p-6 rounded-xl text-center transition-all ${
                  settings.currentGrade === grade
                    ? 'bg-gradient-to-br from-orange-500 to-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                }`}
              &gt;
                &lt;div className="text-2xl font-bold"&gt;{grade}年级&lt;/div&gt;
                &lt;div className="text-sm opacity-90"&gt;
                  {GRADE_CONFIGS[grade].newCount}个新词 + {GRADE_CONFIGS[grade].reviewCount}个旧词
                &lt;/div&gt;
              &lt;/button&gt;
            ))}
          &lt;/div&gt;
        &lt;/div&gt;

        &lt;div className="grid md:grid-cols-2 gap-8 mb-8"&gt;
          &lt;div className="bg-white rounded-2xl shadow-lg p-8"&gt;
            &lt;h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2"&gt;
              &lt;Calendar className="text-orange-500" /&gt;
              今日任务
            &lt;/h2&gt;
            &lt;div className="space-y-4"&gt;
              &lt;div className="flex items-center justify-between"&gt;
                &lt;span className="text-gray-600"&gt;今日新词数量&lt;/span&gt;
                &lt;span className="text-2xl font-bold text-orange-500"&gt;{config.newCount}&lt;/span&gt;
              &lt;/div&gt;
              &lt;div className="flex items-center justify-between"&gt;
                &lt;span className="text-gray-600"&gt;复习旧词数量&lt;/span&gt;
                &lt;span className="text-2xl font-bold text-blue-500"&gt;{config.reviewCount}&lt;/span&gt;
              &lt;/div&gt;
              &lt;div className="flex items-center justify-between"&gt;
                &lt;span className="text-gray-600"&gt;总数量&lt;/span&gt;
                &lt;span className="text-2xl font-bold text-gray-800"&gt;{config.total}&lt;/span&gt;
              &lt;/div&gt;
              &lt;button
                onClick={handleGenerateToday}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-blue-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-blue-700 transition-all"
              &gt;
                {todayTask ? '查看今日任务' : '开始今日默写'}
              &lt;/button&gt;
            &lt;/div&gt;
          &lt;/div&gt;

          &lt;div className="bg-white rounded-2xl shadow-lg p-8"&gt;
            &lt;h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2"&gt;
              &lt;Book className="text-blue-500" /&gt;
              词汇统计
            &lt;/h2&gt;
            &lt;div className="space-y-4"&gt;
              &lt;div className="flex items-center justify-between"&gt;
                &lt;span className="text-gray-600"&gt;总词汇量&lt;/span&gt;
                &lt;span className="text-xl font-semibold text-gray-800"&gt;{stats.totalWords}&lt;/span&gt;
              &lt;/div&gt;
              &lt;div className="flex items-center justify-between"&gt;
                &lt;span className="text-gray-600"&gt;未学习&lt;/span&gt;
                &lt;span className="text-xl font-semibold text-orange-500"&gt;{stats.newWords}&lt;/span&gt;
              &lt;/div&gt;
              &lt;div className="flex items-center justify-between"&gt;
                &lt;span className="text-gray-600"&gt;已掌握&lt;/span&gt;
                &lt;span className="text-xl font-semibold text-green-500"&gt;{stats.masteredWords}&lt;/span&gt;
              &lt;/div&gt;
              &lt;div className="flex items-center justify-between"&gt;
                &lt;span className="text-gray-600"&gt;需复习&lt;/span&gt;
                &lt;span className="text-xl font-semibold text-red-500"&gt;{stats.errorWords}&lt;/span&gt;
              &lt;/div&gt;
            &lt;/div&gt;
          &lt;/div&gt;
        &lt;/div&gt;

        &lt;div className="grid md:grid-cols-3 gap-6"&gt;
          &lt;div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6"&gt;
            &lt;CheckCircle className="text-green-600 mb-4" size={32} /&gt;
            &lt;h3 className="text-xl font-bold text-green-800 mb-2"&gt;科学记忆&lt;/h3&gt;
            &lt;p className="text-green-700"&gt;基于艾宾浩斯遗忘曲线，智能安排复习&lt;/p&gt;
          &lt;/div&gt;
          &lt;div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6"&gt;
            &lt;Book className="text-blue-600 mb-4" size={32} /&gt;
            &lt;h3 className="text-xl font-bold text-blue-800 mb-2"&gt;个性化定制&lt;/h3&gt;
            &lt;p className="text-blue-700"&gt;支持自定义词汇，满足不同需求&lt;/p&gt;
          &lt;/div&gt;
          &lt;div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6"&gt;
            &lt;AlertCircle className="text-orange-600 mb-4" size={32} /&gt;
            &lt;h3 className="text-xl font-bold text-orange-800 mb-2"&gt;错题复习&lt;/h3&gt;
            &lt;p className="text-orange-700"&gt;错题智能循环，重点突破难点&lt;/p&gt;
          &lt;/div&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  );
};

export default Home;
