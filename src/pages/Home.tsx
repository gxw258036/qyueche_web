import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { Calendar, Book, CheckCircle, AlertCircle } from 'lucide-react';
import { GRADE_CONFIGS } from '@/types';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { settings, vocabulary, initialize, updateSettings, loadVocabulary, dailyTask, loadStatistics } = useStore();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    initialize().then(() => {
      loadVocabulary();
      loadStatistics(settings.currentGrade).then(setStats);
    });
  }, []);

  useEffect(() => {
    if (settings.currentGrade) {
      loadStatistics(settings.currentGrade).then(setStats);
    }
  }, [settings.currentGrade]);

  const handleGradeChange = async (grade: number) => {
    await updateSettings({ currentGrade: grade });
  };

  const handleGenerateToday = async () => {
    navigate('/daily');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            👋 欢迎使用小学英语默写工具
          </h1>
          <p className="text-gray-600 text-lg">
            每日坚持，词汇量天天涨！
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">选择年级</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[2, 3, 4, 5, 6].map((grade) => (
              <button
                key={grade}
                onClick={() => handleGradeChange(grade)}
                className={`p-6 rounded-xl text-center transition-all ${
                  settings.currentGrade === grade
                    ? 'bg-gradient-to-br from-orange-500 to-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                }`}
              >
                <div className="text-2xl font-bold">{grade}年级</div>
                <div className="text-sm opacity-90">
                  {GRADE_CONFIGS[grade].newCount}个新词 + {GRADE_CONFIGS[grade].reviewCount}个旧词
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Calendar className="text-orange-500" />
              今日任务
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">今日新词数量</span>
                <span className="text-2xl font-bold text-orange-500">{GRADE_CONFIGS[settings.currentGrade].newCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">复习旧词数量</span>
                <span className="text-2xl font-bold text-blue-500">{GRADE_CONFIGS[settings.currentGrade].reviewCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">总数量</span>
                <span className="text-2xl font-bold text-gray-800">{GRADE_CONFIGS[settings.currentGrade].total}</span>
              </div>
              <button
                onClick={handleGenerateToday}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-blue-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-blue-700 transition-all"
              >
                {dailyTask ? '查看今日任务' : '开始今日默写'}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Book className="text-blue-500" />
              词汇统计
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">总词汇量</span>
                <span className="text-xl font-semibold text-gray-800">{stats?.total || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">未学习</span>
                <span className="text-xl font-semibold text-orange-500">{stats?.new || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">已掌握</span>
                <span className="text-xl font-semibold text-green-500">{stats?.mastered || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">需复习</span>
                <span className="text-xl font-semibold text-red-500">{stats?.error || 0}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6">
            <CheckCircle className="text-green-600 mb-4" size={32} />
            <h3 className="text-xl font-bold text-green-800 mb-2">科学记忆</h3>
            <p className="text-green-700">基于艾宾浩斯遗忘曲线，智能安排复习</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6">
            <Book className="text-blue-600 mb-4" size={32} />
            <h3 className="text-xl font-bold text-blue-800 mb-2">个性化定制</h3>
            <p className="text-blue-700">支持自定义词汇，满足不同需求</p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6">
            <AlertCircle className="text-orange-600 mb-4" size={32} />
            <h3 className="text-xl font-bold text-orange-800 mb-2">错题复习</h3>
            <p className="text-orange-700">错题智能循环，重点突破难点</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
