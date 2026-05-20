import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { BookOpen, Home, FileText, Users, BarChart3, ChevronDown, Plus, X, Menu } from 'lucide-react';
import { Student } from '@/types';
import { api } from '@/services/api';

const Navbar: React.FC = () => {
  const { currentStudent, students, loadStudents, setCurrentStudent } = useStore();
  const [showStudentMenu, setShowStudentMenu] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');

  useEffect(() => {
    loadStudents();
  }, []);

  const handleAddStudent = async () => {
    if (newStudentName.trim()) {
      try {
        await api.students.create({ 
          name: newStudentName
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
      await setCurrentStudent(student);
      setShowStudentMenu(false);
      setShowMobileMenu(false);
    } catch (error) {
      console.error('切换学生失败:', error);
    }
  };

  const navItems = [
    { path: '/', label: '首页', icon: Home },
    { path: '/daily', label: '每日默写', icon: BookOpen },
    { path: '/vocabulary', label: '词汇', icon: FileText },
    { path: '/papers', label: '试卷', icon: FileText },
    { path: '/statistics', label: '统计', icon: BarChart3 },
    { path: '/students', label: '学生', icon: Users },
  ];

  return (
    <>
      <nav className="bg-white shadow-lg sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo & Current Student */}
            <div className="flex items-center gap-2 sm:gap-3">
              <BookOpen className="text-orange-500" size={24} />
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-bold bg-gradient-to-r from-orange-500 to-blue-600 bg-clip-text text-transparent">
                  Daily English
                </span>
                {currentStudent && (
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    {currentStudent.name}
                  </span>
                )}
              </div>
            </div>

            {/* Desktop Student Selector */}
            <div className="hidden md:flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() => setShowStudentMenu(!showStudentMenu)}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Users size={18} className="text-gray-600" />
                  <span className="font-medium text-gray-700 text-sm">
                    {currentStudent?.name || '选择学生'}
                  </span>
                  <ChevronDown size={16} className="text-gray-500" />
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
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu size={24} className="text-gray-600" />
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block border-t border-gray-100">
            <div className="flex items-center gap-1 overflow-x-auto py-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = window.location.pathname === item.path;
                return (
                  <a
                    key={item.path}
                    href={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap text-sm ${
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

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden bg-white border-t border-gray-100">
            {/* Mobile Student Selector */}
            <div className="px-4 py-3 border-b border-gray-100">
              <button
                onClick={() => setShowStudentMenu(!showStudentMenu)}
                className="flex items-center justify-between w-full px-3 py-2 bg-gray-100 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <Users size={18} className="text-gray-600" />
                  <span className="font-medium text-gray-700">
                    {currentStudent?.name || '选择学生'}
                  </span>
                </div>
                <ChevronDown size={16} className={`text-gray-500 transition-transform ${showStudentMenu ? 'rotate-180' : ''}`} />
              </button>

              {showStudentMenu && (
                <div className="mt-2 bg-gray-50 rounded-lg overflow-hidden">
                  {students.map((student) => {
                    const isActive = currentStudent?.id === student.id;
                    return (
                      <button
                        key={student.id}
                        onClick={() => handleSelectStudent(student)}
                        className={`w-full px-4 py-3 text-left flex items-center justify-between border-b border-gray-100 last:border-0 ${
                          isActive
                            ? 'bg-gradient-to-r from-orange-50 to-blue-50 border-l-4 border-l-orange-500'
                            : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {isActive ? (
                            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">{student.name.charAt(0)}</span>
                            </div>
                          ) : (
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-gray-500 text-xs font-bold">{student.name.charAt(0)}</span>
                            </div>
                          )}
                          <div className="flex flex-col items-start">
                            <span className={`font-medium ${isActive ? 'text-gray-800' : 'text-gray-700'}`}>
                              {student.name}
                            </span>
                          </div>
                        </div>
                        {isActive && (
                          <div className="flex items-center gap-1 text-green-600">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            <span className="text-xs">当前</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => {
                      setShowStudentMenu(false);
                      setShowMobileMenu(false);
                      setShowAddStudentModal(true);
                    }}
                    className="w-full px-4 py-3 text-left flex items-center gap-2 text-green-600"
                  >
                    <Plus size={16} />
                    添加学生
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Navigation Links */}
            <div className="py-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = window.location.pathname === item.path;
                return (
                  <a
                    key={item.path}
                    href={item.path}
                    onClick={() => setShowMobileMenu(false)}
                    className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                      isActive
                        ? 'bg-gradient-to-r from-orange-500 to-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Add Student Modal */}
      {showAddStudentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
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
