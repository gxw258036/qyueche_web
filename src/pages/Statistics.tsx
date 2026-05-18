import React, { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { TrendingUp, BookOpen, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';

const Statistics: React.FC = () => {
  const { settings, vocabulary, statistics, loadVocabulary, loadStatistics } = useStore();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      await loadVocabulary();
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (!loading) {
      loadStatistics();
    }
  }, [settings.currentGrade, vocabulary, loading]);

  useEffect(() => {
    if (statistics) {
      setStats(statistics);
    }
  }, [statistics]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mx-auto mb-4 text-orange-500">加载中...</div>
        </div>
      </div>
    );
  }

  const percentage = {
    new: Math.round(((stats?.new || 0) / (stats?.total || 1)) * 100),
    reviewed: Math.round(((stats?.reviewed || 0) / (stats?.total || 1)) * 100),
    mastered: Math.round(((stats?.mastered || 0) / (stats?.total || 1)) * 100),
    error: Math.round(((stats?.error || 0) / (stats?.total || 1)) * 100),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">学习统计</h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <BookOpen className="text-orange-500" size={32} />
              <span className="text-2xl font-bold text-gray-800">{stats?.total || 0}</span>
            </div>
            <p className="text-gray-600">总词汇量</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle2 className="text-green-500" size={32} />
              <span className="text-2xl font-bold text-gray-800">{stats?.mastered || 0}</span>
            </div>
            <p className="text-gray-600">已掌握</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <Calendar className="text-blue-500" size={32} />
              <span className="text-2xl font-bold text-gray-800">{stats?.completedDays || 0}</span>
            </div>
            <p className="text-gray-600">学习天数</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="text-purple-500" size={32} />
              <span className="text-2xl font-bold text-gray-800">{percentage.mastered}%</span>
            </div>
            <p className="text-gray-600">掌握率</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">词汇掌握分布</h2>
          
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-orange-500" />
                  <span className="text-gray-700">未学习</span>
                </div>
                <span className="text-gray-600 font-medium">{stats?.new || 0} ({percentage.new}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-orange-500 h-3 rounded-full transition-all"
                  style={{ width: `${percentage.new}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-gray-700">已学习</span>
                </div>
                <span className="text-gray-600 font-medium">{stats?.reviewed || 0} ({percentage.reviewed}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all"
                  style={{ width: `${percentage.reviewed}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-gray-700">已掌握</span>
                </div>
                <span className="text-gray-600 font-medium">{stats?.mastered || 0} ({percentage.mastered}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full transition-all"
                  style={{ width: `${percentage.mastered}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-gray-700">需复习</span>
                </div>
                <span className="text-gray-600 font-medium">{stats?.error || 0} ({percentage.error}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-red-500 h-3 rounded-full transition-all"
                  style={{ width: `${percentage.error}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <CheckCircle2 className="text-green-500" />
              练习记录
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                <span className="text-gray-700">正确次数</span>
                <span className="text-2xl font-bold text-green-600">{stats?.totalCorrect || 0}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl">
                <span className="text-gray-700">错误次数</span>
                <span className="text-2xl font-bold text-red-600">{stats?.totalError || 0}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                <span className="text-gray-700">正确率</span>
                <span className="text-2xl font-bold text-blue-600">
                  {((stats?.totalCorrect || 0) + (stats?.totalError || 0)) > 0
                    ? Math.round(((stats?.totalCorrect || 0) / ((stats?.totalCorrect || 0) + (stats?.totalError || 0))) * 100)
                    : 0}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <AlertCircle className="text-orange-500" />
              重点关注
            </h2>
            <div className="space-y-3">
              {vocabulary
                .filter(v => v.errorCount > 0)
                .sort((a, b) => b.errorCount - a.errorCount)
                .slice(0, 5)
                .map((word) => (
                  <div key={word.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <div className="font-medium text-gray-800">{word.word}</div>
                      <div className="text-sm text-gray-500">{word.meaning}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-red-600 font-semibold">{word.errorCount} 次错误</div>
                      <div className="text-xs text-gray-500">{word.correctCount} 次正确</div>
                    </div>
                  </div>
                ))}
              {vocabulary.filter(v => v.errorCount > 0).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  暂无错题数据
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
