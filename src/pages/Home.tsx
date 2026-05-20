import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { Calendar, Book, CheckCircle, AlertCircle, Settings2, User } from 'lucide-react';
import { useEffect, useState } from 'react';

const Home = () => {
  const navigate = useNavigate();
  const { settings, vocabulary, updateSettings, dailyTask, statistics, loadVocabulary, currentStudent, students, loadStudents, setCurrentStudent } = useStore();
  const [stats, setStats] = useState<any>(null);
  const [dailyTaskCount, setDailyTaskCount] = useState<number>(settings.dailyTaskCount || 30);

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    if (currentStudent) {
      loadVocabulary();
      setStats(statistics);
    }
  }, [currentStudent]);

  useEffect(() => {
    if (statistics) {
      setStats(statistics);
    }
  }, [statistics]);

  useEffect(() => {
    setDailyTaskCount(settings.dailyTaskCount || 30);
  }, [settings.dailyTaskCount]);

  const handleDailyTaskCountChange = async (count: number) => {
    setDailyTaskCount(count);
    await updateSettings(undefined, count);
  };

  const handleGenerateToday = async () => {
    navigate('/daily');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2 sm:mb-3">
            👋 欢迎使用 Daily English
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            每日坚持，词汇量天天涨！
          </p>
        </div>

        {/* Student Selection */}
        <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
            <User size={20} />
            选择学生
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
            {students.map((student) => (
              <button
                key={student.id}
                onClick={() => setCurrentStudent(student)}
                className={`p-3 sm:p-4 lg:p-5 rounded-lg text-center transition-all ${
                  currentStudent?.id === student.id
                    ? 'bg-gradient-to-br from-orange-500 to-blue-600 text-white shadow-md scale-105'
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

        {/* Daily Task Count Configuration */}
        {currentStudent && (
          <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
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
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
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

        {/* Stats Cards */}
        {currentStudent && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
            {/* Today's Task */}
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2">
                <Calendar className="text-orange-500" size={24} />
                今日任务
              </h2>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm sm:text-base">今日新词数量</span>
                  <span className="text-xl sm:text-2xl font-bold text-orange-500">{Math.floor(dailyTaskCount / 3)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm sm:text-base">复习旧词数量</span>
                  <span className="text-xl sm:text-2xl font-bold text-blue-500">{Math.ceil(dailyTaskCount * 2 / 3)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm sm:text-base">总数量</span>
                  <span className="text-xl sm:text-2xl font-bold text-gray-800">{dailyTaskCount}</span>
                </div>
                <button
                  onClick={handleGenerateToday}
                  className="w-full py-3 sm:py-4 bg-gradient-to-r from-orange-500 to-blue-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-blue-700 transition-all text-sm sm:text-base"
                >
                  {dailyTask ? '查看今日任务' : '开始今日默写'}
                </button>
              </div>
            </div>

            {/* Vocabulary Stats */}
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2">
                <Book className="text-blue-500" size={24} />
                词汇统计
              </h2>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm sm:text-base">总词汇量</span>
                  <span className="text-lg sm:text-xl font-semibold text-gray-800">{stats?.total || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm sm:text-base">未学习</span>
                  <span className="text-lg sm:text-xl font-semibold text-orange-500">{stats?.new || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm sm:text-base">已掌握</span>
                  <span className="text-lg sm:text-xl font-semibold text-green-500">{stats?.mastered || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm sm:text-base">需复习</span>
                  <span className="text-lg sm:text-xl font-semibold text-red-500">{stats?.error || 0}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 sm:p-6">
            <CheckCircle className="text-green-600 mb-3 sm:mb-4" size={28} />
            <h3 className="text-lg sm:text-xl font-bold text-green-800 mb-2">科学记忆</h3>
            <p className="text-green-700 text-sm sm:text-base">基于艾宾浩斯遗忘曲线，智能安排复习</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 sm:p-6">
            <Book className="text-blue-600 mb-3 sm:mb-4" size={28} />
            <h3 className="text-lg sm:text-xl font-bold text-blue-800 mb-2">个性化定制</h3>
            <p className="text-blue-700 text-sm sm:text-base">支持自定义词汇，满足不同需求</p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
            <AlertCircle className="text-orange-600 mb-3 sm:mb-4" size={28} />
            <h3 className="text-lg sm:text-xl font-bold text-orange-800 mb-2">错题复习</h3>
            <p className="text-orange-700 text-sm sm:text-base">错题智能循环，重点突破难点</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
