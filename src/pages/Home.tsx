import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { Calendar, Book, CheckCircle, AlertCircle, Settings2, User, Sparkles, Trophy, Target } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const { settings, vocabulary, updateSettings, dailyTask, statistics, loadVocabulary, currentStudent, students, loadStudents, setCurrentStudent, updateStudent } = useStore();
  const [stats, setStats] = useState<any>(null);
  const [dailyTaskCount, setDailyTaskCount] = useState<number>(30);

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    if (currentStudent) {
      loadVocabulary();
      setStats(statistics);
      setDailyTaskCount(currentStudent.dailyTaskCount || 30);
    }
  }, [currentStudent]);

  useEffect(() => {
    if (statistics) {
      setStats(statistics);
    }
  }, [statistics]);

  const handleDailyTaskCountChange = async (count: number) => {
    if (!currentStudent) return;
    setDailyTaskCount(count);
    await updateStudent(currentStudent.id, { dailyTaskCount: count });
  };

  const handleGenerateToday = async () => {
    navigate('/daily');
  };

  const totalWords = stats?.total || 0;
  const learnedWords = stats?.mastered || 0;
  const progress = totalWords > 0 ? Math.round((learnedWords / totalWords) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-yellow-50">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-4xl">📚</span>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
              Daily English
            </h1>
          </div>
          <p className="text-gray-600 text-sm sm:text-base">
            每日坚持，词汇量天天涨！
          </p>
        </div>

        {/* Student Selection */}
        {currentStudent && (
          <div className="bg-white rounded-2xl shadow-lg p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">{currentStudent.name.charAt(0)}</span>
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-gray-800">{currentStudent.name}</h2>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-xs text-gray-500">正在学习</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => navigate('/students')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings2 size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">已学进度</span>
                <span className="text-orange-500 font-semibold">{learnedWords}/{totalWords} 词</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {!currentStudent && (
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <User size={20} />
              选择学生
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
              {students.map((student) => (
                <button
                  key={student.id}
                  onClick={() => setCurrentStudent(student)}
                  className={`p-3 sm:p-4 lg:p-5 rounded-xl text-center transition-all ${
                    currentStudent?.id === student.id
                      ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-md scale-105'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                  }`}
                >
                  <div className="text-lg sm:text-xl font-bold">{student.name}</div>
                </button>
              ))}
            </div>
            {students.length === 0 && (
              <div className="text-center py-6 text-gray-500">
                暂无学生，请先添加学生
              </div>
            )}
          </div>
        )}

        {/* Daily Task Count Configuration */}
        {currentStudent && (
          <div className="bg-white rounded-2xl shadow-lg p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Settings2 size={20} />
              每日任务数量设置
            </h2>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <input
                  type="range"
                  min="10"
                  max="50"
                  step="5"
                  value={dailyTaskCount}
                  onChange={(e) => handleDailyTaskCountChange(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                />
              </div>
              <div className="text-center sm:text-left">
                <span className="text-2xl font-bold text-orange-500">{dailyTaskCount}</span>
                <span className="text-gray-600 ml-1">词</span>
              </div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>10词</span>
              <span>20词</span>
              <span>30词</span>
              <span>40词</span>
              <span>50词</span>
            </div>
          </div>
        )}

        {/* Today's Task Card */}
        {currentStudent && (
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 text-white">
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <Calendar size={24} />
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">今日计划</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4 sm:mb-6">
              <div className="bg-white/20 rounded-xl p-3 sm:p-4 text-center">
                <div className="text-2xl sm:text-3xl font-bold">{Math.ceil(dailyTaskCount * 2 / 3)}</div>
                <div className="text-sm text-white/80">新词</div>
              </div>
              <div className="bg-white/20 rounded-xl p-3 sm:p-4 text-center">
                <div className="text-2xl sm:text-3xl font-bold">{Math.floor(dailyTaskCount / 3)}</div>
                <div className="text-sm text-white/80">复习</div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleGenerateToday}
                className="flex-1 py-3 sm:py-4 bg-white text-orange-500 rounded-xl font-semibold hover:bg-gray-50 transition-all text-sm sm:text-base shadow-lg"
              >
                {dailyTask ? '查看今日任务' : '新学'}
              </button>
              <button
                onClick={handleGenerateToday}
                className="flex-1 py-3 sm:py-4 bg-white/20 text-white rounded-xl font-semibold hover:bg-white/30 transition-all text-sm sm:text-base"
              >
                复习
              </button>
            </div>
          </div>
        )}

        {/* Vocabulary Stats */}
        {currentStudent && (
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6">
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <Book className="text-blue-500" size={24} />
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">词汇统计</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-xl">
                <div className="text-xl sm:text-2xl font-bold text-gray-800">{stats?.total || 0}</div>
                <div className="text-xs sm:text-sm text-gray-500">总词汇量</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-xl">
                <div className="text-xl sm:text-2xl font-bold text-orange-500">{stats?.new || 0}</div>
                <div className="text-xs sm:text-sm text-orange-600">未学习</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-xl">
                <div className="text-xl sm:text-2xl font-bold text-green-500">{stats?.mastered || 0}</div>
                <div className="text-xs sm:text-sm text-green-600">已掌握</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-xl">
                <div className="text-xl sm:text-2xl font-bold text-red-500">{stats?.error || 0}</div>
                <div className="text-xs sm:text-sm text-red-600">需复习</div>
              </div>
            </div>
          </div>
        )}

        {/* Feature Cards */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <button
            onClick={() => navigate('/error-collection')}
            className="bg-red-50 rounded-xl p-4 sm:p-5 text-left hover:bg-red-100 transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="text-red-600" size={20} />
              </span>
              <span className="text-red-600 font-semibold">错题</span>
            </div>
            <div className="text-gray-700 text-sm">错题巩固</div>
          </button>
          <button
            onClick={() => navigate('/paper-practice')}
            className="bg-orange-50 rounded-xl p-4 sm:p-5 text-left hover:bg-orange-100 transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <Target className="text-orange-600" size={20} />
              </span>
              <span className="text-orange-600 font-semibold">精练</span>
            </div>
            <div className="text-gray-700 text-sm">重点精练</div>
          </button>
          <button
            onClick={() => navigate('/grammar-weakness')}
            className="bg-blue-50 rounded-xl p-4 sm:p-5 text-left hover:bg-blue-100 transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Book className="text-blue-600" size={20} />
              </span>
              <span className="text-blue-600 font-semibold">语法</span>
            </div>
            <div className="text-gray-700 text-sm">语法练习</div>
          </button>
          <button
            onClick={() => navigate('/grammar-practice')}
            className="bg-green-50 rounded-xl p-4 sm:p-5 text-left hover:bg-green-100 transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-green-600" size={20} />
              </span>
              <span className="text-green-600 font-semibold">刷题</span>
            </div>
            <div className="text-gray-700 text-sm">刷题挑战</div>
          </button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-5 gap-2 sm:gap-4 mt-4 sm:mt-6">
          <button className="flex flex-col items-center gap-1 p-2 sm:p-3 hover:bg-gray-100 rounded-xl transition-colors">
            <span className="text-xl sm:text-2xl">📝</span>
            <span className="text-xs text-gray-600">列表刷词</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-2 sm:p-3 hover:bg-gray-100 rounded-xl transition-colors">
            <span className="text-xl sm:text-2xl">📹</span>
            <span className="text-xs text-gray-600">助记视频</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-2 sm:p-3 hover:bg-gray-100 rounded-xl transition-colors">
            <span className="text-xl sm:text-2xl">🎧</span>
            <span className="text-xs text-gray-600">随身听</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-2 sm:p-3 hover:bg-gray-100 rounded-xl transition-colors">
            <span className="text-xl sm:text-2xl">🔤</span>
            <span className="text-xs text-gray-600">自然拼读</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-2 sm:p-3 hover:bg-gray-100 rounded-xl transition-colors">
            <span className="text-xl sm:text-2xl">✏️</span>
            <span className="text-xs text-gray-600">单词听写</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
