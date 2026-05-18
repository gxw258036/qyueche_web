
import React from 'react';
import { useStore } from '@/store/useStore';
import { TrendingUp, BookOpen, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';

const Statistics: React.FC = () =&gt; {
  const {
    settings,
    vocabulary,
    dailyTasks,
  } = useStore();

  const gradeVocabulary = vocabulary.filter(v =&gt; v.grade === settings.currentGrade);
  
  const stats = {
    total: gradeVocabulary.length,
    new: gradeVocabulary.filter(v =&gt; v.status === 'new').length,
    reviewed: gradeVocabulary.filter(v =&gt; v.status === 'reviewed').length,
    mastered: gradeVocabulary.filter(v =&gt; v.status === 'mastered').length,
    error: gradeVocabulary.filter(v =&gt; v.status === 'error').length,
  };

  const totalCorrect = gradeVocabulary.reduce((sum, v) =&gt; sum + v.correctCount, 0);
  const totalError = gradeVocabulary.reduce((sum, v) =&gt; sum + v.errorCount, 0);
  
  const todayTasks = dailyTasks.filter(t =&gt; t.date === new Date().toISOString().split('T')[0]);
  const completedDays = new Set(dailyTasks.map(t =&gt; t.date)).size;

  const percentage = {
    new: Math.round((stats.new / stats.total) * 100) || 0,
    reviewed: Math.round((stats.reviewed / stats.total) * 100) || 0,
    mastered: Math.round((stats.mastered / stats.total) * 100) || 0,
    error: Math.round((stats.error / stats.total) * 100) || 0,
  };

  const getProgressColor = (percent: number) =&gt; {
    if (percent &gt;= 80) return 'bg-green-500';
    if (percent &gt;= 50) return 'bg-blue-500';
    if (percent &gt;= 20) return 'bg-orange-500';
    return 'bg-gray-300';
  };

  return (
    &lt;div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50"&gt;
      &lt;div className="max-w-5xl mx-auto px-4 py-8"&gt;
        &lt;h1 className="text-3xl font-bold text-gray-800 mb-8"&gt;学习统计&lt;/h1&gt;

        &lt;div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"&gt;
          &lt;div className="bg-white rounded-2xl shadow-lg p-6"&gt;
            &lt;div className="flex items-center justify-between mb-4"&gt;
              &lt;BookOpen className="text-orange-500" size={32} /&gt;
              &lt;span className="text-2xl font-bold text-gray-800"&gt;{stats.total}&lt;/span&gt;
            &lt;/div&gt;
            &lt;p className="text-gray-600"&gt;总词汇量&lt;/p&gt;
          &lt;/div&gt;

          &lt;div className="bg-white rounded-2xl shadow-lg p-6"&gt;
            &lt;div className="flex items-center justify-between mb-4"&gt;
              &lt;CheckCircle2 className="text-green-500" size={32} /&gt;
              &lt;span className="text-2xl font-bold text-gray-800"&gt;{stats.mastered}&lt;/span&gt;
            &lt;/div&gt;
            &lt;p className="text-gray-600"&gt;已掌握&lt;/p&gt;
          &lt;/div&gt;

          &lt;div className="bg-white rounded-2xl shadow-lg p-6"&gt;
            &lt;div className="flex items-center justify-between mb-4"&gt;
              &lt;Calendar className="text-blue-500" size={32} /&gt;
              &lt;span className="text-2xl font-bold text-gray-800"&gt;{completedDays}&lt;/span&gt;
            &lt;/div&gt;
            &lt;p className="text-gray-600"&gt;学习天数&lt;/p&gt;
          &lt;/div&gt;

          &lt;div className="bg-white rounded-2xl shadow-lg p-6"&gt;
            &lt;div className="flex items-center justify-between mb-4"&gt;
              &lt;TrendingUp className="text-purple-500" size={32} /&gt;
              &lt;span className="text-2xl font-bold text-gray-800"&gt;{percentage.mastered}%&lt;/span&gt;
            &lt;/div&gt;
            &lt;p className="text-gray-600"&gt;掌握率&lt;/p&gt;
          &lt;/div&gt;
        &lt;/div&gt;

        &lt;div className="bg-white rounded-2xl shadow-lg p-8 mb-8"&gt;
          &lt;h2 className="text-xl font-semibold text-gray-800 mb-6"&gt;词汇掌握分布&lt;/h2&gt;
          
          &lt;div className="space-y-6"&gt;
            &lt;div&gt;
              &lt;div className="flex items-center justify-between mb-2"&gt;
                &lt;div className="flex items-center gap-2"&gt;
                  &lt;span className="w-3 h-3 rounded-full bg-orange-500" /&gt;
                  &lt;span className="text-gray-700"&gt;未学习&lt;/span&gt;
                &lt;/div&gt;
                &lt;span className="text-gray-600 font-medium"&gt;{stats.new} ({percentage.new}%)&lt;/span&gt;
              &lt;/div&gt;
              &lt;div className="w-full bg-gray-200 rounded-full h-3"&gt;
                &lt;div
                  className="bg-orange-500 h-3 rounded-full transition-all"
                  style={{ width: `${percentage.new}%` }}
                /&gt;
              &lt;/div&gt;
            &lt;/div&gt;

            &lt;div&gt;
              &lt;div className="flex items-center justify-between mb-2"&gt;
                &lt;div className="flex items-center gap-2"&gt;
                  &lt;span className="w-3 h-3 rounded-full bg-blue-500" /&gt;
                  &lt;span className="text-gray-700"&gt;已学习&lt;/span&gt;
                &lt;/div&gt;
                &lt;span className="text-gray-600 font-medium"&gt;{stats.reviewed} ({percentage.reviewed}%)&lt;/span&gt;
              &lt;/div&gt;
              &lt;div className="w-full bg-gray-200 rounded-full h-3"&gt;
                &lt;div
                  className="bg-blue-500 h-3 rounded-full transition-all"
                  style={{ width: `${percentage.reviewed}%` }}
                /&gt;
              &lt;/div&gt;
            &lt;/div&gt;

            &lt;div&gt;
              &lt;div className="flex items-center justify-between mb-2"&gt;
                &lt;div className="flex items-center gap-2"&gt;
                  &lt;span className="w-3 h-3 rounded-full bg-green-500" /&gt;
                  &lt;span className="text-gray-700"&gt;已掌握&lt;/span&gt;
                &lt;/div&gt;
                &lt;span className="text-gray-600 font-medium"&gt;{stats.mastered} ({percentage.mastered}%)&lt;/span&gt;
              &lt;/div&gt;
              &lt;div className="w-full bg-gray-200 rounded-full h-3"&gt;
                &lt;div
                  className="bg-green-500 h-3 rounded-full transition-all"
                  style={{ width: `${percentage.mastered}%` }}
                /&gt;
              &lt;/div&gt;
            &lt;/div&gt;

            &lt;div&gt;
              &lt;div className="flex items-center justify-between mb-2"&gt;
                &lt;div className="flex items-center gap-2"&gt;
                  &lt;span className="w-3 h-3 rounded-full bg-red-500" /&gt;
                  &lt;span className="text-gray-700"&gt;需复习&lt;/span&gt;
                &lt;/div&gt;
                &lt;span className="text-gray-600 font-medium"&gt;{stats.error} ({percentage.error}%)&lt;/span&gt;
              &lt;/div&gt;
              &lt;div className="w-full bg-gray-200 rounded-full h-3"&gt;
                &lt;div
                  className="bg-red-500 h-3 rounded-full transition-all"
                  style={{ width: `${percentage.error}%` }}
                /&gt;
              &lt;/div&gt;
            &lt;/div&gt;
          &lt;/div&gt;
        &lt;/div&gt;

        &lt;div className="grid md:grid-cols-2 gap-6"&gt;
          &lt;div className="bg-white rounded-2xl shadow-lg p-8"&gt;
            &lt;h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2"&gt;
              &lt;CheckCircle2 className="text-green-500" /&gt;
              练习记录
            &lt;/h2&gt;
            &lt;div className="space-y-4"&gt;
              &lt;div className="flex items-center justify-between p-4 bg-green-50 rounded-xl"&gt;
                &lt;span className="text-gray-700"&gt;正确次数&lt;/span&gt;
                &lt;span className="text-2xl font-bold text-green-600"&gt;{totalCorrect}&lt;/span&gt;
              &lt;/div&gt;
              &lt;div className="flex items-center justify-between p-4 bg-red-50 rounded-xl"&gt;
                &lt;span className="text-gray-700"&gt;错误次数&lt;/span&gt;
                &lt;span className="text-2xl font-bold text-red-600"&gt;{totalError}&lt;/span&gt;
              &lt;/div&gt;
              &lt;div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl"&gt;
                &lt;span className="text-gray-700"&gt;正确率&lt;/span&gt;
                &lt;span className="text-2xl font-bold text-blue-600"&gt;
                  {totalCorrect + totalError &gt; 0
                    ? Math.round((totalCorrect / (totalCorrect + totalError)) * 100)
                    : 0}%
                &lt;/span&gt;
              &lt;/div&gt;
            &lt;/div&gt;
          &lt;/div&gt;

          &lt;div className="bg-white rounded-2xl shadow-lg p-8"&gt;
            &lt;h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2"&gt;
              &lt;AlertCircle className="text-orange-500" /&gt;
              重点关注
            &lt;/h2&gt;
            &lt;div className="space-y-3"&gt;
              {gradeVocabulary
                .sort((a, b) =&gt; b.errorCount - a.errorCount)
                .slice(0, 5)
                .map((word) =&gt; (
                  &lt;div key={word.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"&gt;
                    &lt;div&gt;
                      &lt;div className="font-medium text-gray-800"&gt;{word.word}&lt;/div&gt;
                      &lt;div className="text-sm text-gray-500"&gt;{word.meaning}&lt;/div&gt;
                    &lt;/div&gt;
                    &lt;div className="text-right"&gt;
                      &lt;div className="text-red-600 font-semibold"&gt;{word.errorCount} 次错误&lt;/div&gt;
                      &lt;div className="text-xs text-gray-500"&gt;{word.correctCount} 次正确&lt;/div&gt;
                    &lt;/div&gt;
                  &lt;/div&gt;
                ))}
              {gradeVocabulary.length === 0 &amp;&amp; (
                &lt;div className="text-center py-8 text-gray-500"&gt;
                  暂无词汇数据
                &lt;/div&gt;
              )}
            &lt;/div&gt;
          &lt;/div&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  );
};

export default Statistics;
