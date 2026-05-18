import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { BookOpen, Home, FileText, Users, BarChart3, ChevronDown, Plus, X } from 'lucide-react';
import { Student } from '@/types';
import { api } from '@/services/api';

const Navbar: React.FC = () => {
  const { currentStudent, students, settings, loadStudents, loadSettings } = useStore();
  const [showStudentMenu, setShowStudentMenu] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentGrade, setNewStudentGrade] = useState('2');

  useEffect(() => {
    loadStudents();
    loadSettings();
  }, []);

  const handleAddStudent = async () => {
    if (newStudentName.trim()) {
      try {
        await api.students.create({ 
          name: newStudentName, 
          grade: parseInt(newStudentGrade) 
        });
        setNewStudentName('');
        setShowAddStudentModal(false);
        await loadStudents();
      } catch (error) {
        console.error('添加学生失败:', error);
      }
    }
  };

  const handleSelectStudent = async (student: Student) => {
    try {
      await api.settings.update({ currentStudentId: student.id, currentGrade: student.grade });
      window.location.reload();
    } catch (error) {
      console.error('切换学生失败:', error);
    }
  };

  const navItems = [
    { path: '/', label: '首页', icon: Home },
    { path: '/daily', label: '每日默写', icon: BookOpen },
    { path: '/vocabulary', label: '词汇管理', icon: FileText },
    { path: '/papers', label: '试卷中心', icon: FileText },
    { path: '/statistics', label: '学习统计', icon: BarChart3 },
    { path: '/students', label: '学生管理', icon: Users },
  ];

  return (
    <>
      <nav className="bg-white shadow-lg">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <BookOpen className="text-orange-500" size={28} />
                <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-blue-600 bg-clip-text text-transparent">
                  英语默写助手
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() => setShowStudentMenu(!showStudentMenu)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Users size={20} className="text-gray-600" />
                  <span className="font-medium text-gray-700">
                    {currentStudent?.name || '选择学生'}
                  </span>
                  <ChevronDown size={18} className="text-gray-500" />
                </button>

                {showStudentMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                    <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
                      选择学生
                    </div>
                    {students.map((student) => (
                      <button
                        key={student.id}
                        onClick={() => handleSelectStudent(student)}
                        className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between ${
                          currentStudent?.id === student.id ? 'bg-blue-50' : ''
                        }`}
                      >
                        <span className="font-medium text-gray-700">{student.name}</span>
                        <span className="text-sm text-gray-500">{student.grade}年级</span>
                      </button>
                    ))}
                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button
                        onClick={() => {
                          setShowStudentMenu(false);
                          setShowAddStudentModal(true);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-green-600"
                      >
                        <Plus size={16} />
                        添加学生
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {currentStudent && (
                <span className="text-sm text-gray-500">
                  {currentStudent.grade}年级
                </span>
              )}
            </div>
          </div>

          <div className="border-t border-gray-100">
            <div className="flex items-center gap-1 overflow-x-auto py-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = window.location.pathname === item.path;
                return (
                  <a
                    key={item.path}
                    href={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                      isActive
                        ? 'bg-gradient-to-r from-orange-500 to-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="font-medium">{item.label}</span>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {showAddStudentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">添加学生</h2>
              <button
                onClick={() => setShowAddStudentModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  学生姓名
                </label>
                <input
                  type="text"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="请输入学生姓名"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  年级
                </label>
                <select
                  value={newStudentGrade}
                  onChange={(e) => setNewStudentGrade(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="2">二年级</option>
                  <option value="3">三年级</option>
                  <option value="4">四年级</option>
                  <option value="5">五年级</option>
                  <option value="6">六年级</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddStudentModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={handleAddStudent}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-blue-600 text-white rounded-lg hover:from-orange-600 hover:to-blue-700"
                >
                  添加
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
