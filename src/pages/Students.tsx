import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Users, Plus, Edit2, Trash2, X, Save, Check } from 'lucide-react';
import { Student } from '@/types';
import { api } from '@/services/api';

const Students: React.FC = () => {
  const { students, loadStudents, addStudent, updateStudent, deleteStudent, currentStudent, settings } = useStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({ name: '', grade: 2, dailyTaskCount: 30 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      await loadStudents();
      setLoading(false);
    };
    init();
  }, []);

  const handleAdd = async () => {
    if (formData.name.trim()) {
      await api.students.create({ name: formData.name, grade: formData.grade, dailyTaskCount: formData.dailyTaskCount });
      setFormData({ name: '', grade: 2, dailyTaskCount: 30 });
      setShowAddModal(false);
      await loadStudents();
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({ name: student.name, grade: student.grade, dailyTaskCount: student.dailyTaskCount || 30 });
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    if (editingStudent && formData.name.trim()) {
      await api.students.update(editingStudent.id, { name: formData.name, grade: formData.grade, dailyTaskCount: formData.dailyTaskCount });
      setEditingStudent(null);
      setFormData({ name: '', grade: 2, dailyTaskCount: 30 });
      setShowEditModal(false);
      await loadStudents();
      window.location.reload();
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('确定要删除这个学生吗？所有相关数据将被删除。')) {
      await deleteStudent(id);
      await loadStudents();
    }
  };

  const handleSetCurrent = async (student: Student) => {
    try {
      await api.settings.update({ currentStudentId: student.id, currentGrade: student.grade });
      await loadStudents();
      window.location.reload();
    } catch (error) {
      console.error('设置当前学生失败:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="animate-spin mx-auto mb-4 text-orange-500">加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white rounded-xl shadow">
              <Users className="text-orange-500" size={20} />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">学生管理</h1>
              <p className="text-gray-600 text-xs sm:text-sm">管理学生信息和年级设置</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-blue-600 text-white rounded-lg hover:from-orange-600 hover:to-blue-700 transition-all shadow text-sm"
          >
            <Plus size={16} />
            添加学生
          </button>
        </div>

        {/* Student List - Mobile Cards */}
        <div className="sm:hidden space-y-2.5 mb-4 sm:mb-5">
          {students.map((student) => (
            <div key={student.id} className="bg-white rounded-xl shadow p-3">
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="w-9 h-9 bg-gradient-to-r from-orange-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  {student.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-800 text-sm">{student.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                      student.grade === 2 || student.grade === 3 || student.grade === 4
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-purple-100 text-purple-700'
                    }`}>
                      {student.grade}年级
                    </span>
                    <span className="text-xs text-gray-500">
                      {student.dailyTaskCount || 30}词/天
                    </span>
                  </div>
                </div>
                {currentStudent?.id === student.id && (
                  <span className="flex items-center gap-1 text-green-600 text-xs">
                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                    当前
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {currentStudent?.id !== student.id && (
                  <button
                    onClick={() => handleSetCurrent(student)}
                    className="flex-1 py-1.5 text-green-600 bg-green-50 rounded-lg text-xs font-medium"
                  >
                    设为当前
                  </button>
                )}
                <button
                  onClick={() => handleEdit(student)}
                  className="p-1.5 text-blue-500 bg-blue-50 rounded-lg"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => handleDelete(student.id)}
                  className="p-1.5 text-red-500 bg-red-50 rounded-lg"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          {students.length === 0 && (
            <div className="text-center py-10 bg-white rounded-xl shadow">
              <Users className="mx-auto text-gray-300 mb-3" size={40} />
              <p className="text-gray-500 text-sm">暂无学生信息，请添加学生</p>
            </div>
          )}
        </div>

        {/* Student List - Desktop Table */}
        <div className="hidden sm:block bg-white rounded-xl shadow-lg p-3 sm:p-4 mb-4 sm:mb-5">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2.5 px-3 text-gray-600 font-medium text-sm">姓名</th>
                  <th className="text-left py-2.5 px-3 text-gray-600 font-medium text-sm">年级</th>
                  <th className="text-left py-2.5 px-3 text-gray-600 font-medium text-sm">每日任务</th>
                  <th className="text-left py-2.5 px-3 text-gray-600 font-medium text-sm">当前状态</th>
                  <th className="text-right py-2.5 px-3 text-gray-600 font-medium text-sm">操作</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-gradient-to-r from-orange-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {student.name.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-800 text-sm">{student.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        student.grade === 2 || student.grade === 3 || student.grade === 4
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {student.grade}年级
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-sm text-gray-700">{student.dailyTaskCount || 30}词/天</span>
                    </td>
                    <td className="py-3 px-3">
                      {currentStudent?.id === student.id ? (
                        <span className="flex items-center gap-1 text-green-600 text-sm">
                          <span className="w-2 h-2 bg-green-500 rounded-full" />
                          当前使用
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">未选中</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {currentStudent?.id !== student.id && (
                          <button
                            onClick={() => handleSetCurrent(student)}
                            className="p-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                            title="设为当前学生"
                          >
                            <Check size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(student)}
                          className="p-1.5 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="编辑学生"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(student.id)}
                          className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="删除学生"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {students.length === 0 && (
              <div className="text-center py-10">
                <Users className="mx-auto text-gray-300 mb-3" size={40} />
                <p className="text-gray-500 text-sm">暂无学生信息，请添加学生</p>
              </div>
            )}
          </div>
        </div>

        {/* Grade Config Info */}
        <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">年级配置说明</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-1.5 text-sm">低年级 (2-4年级)</h3>
              <p className="text-blue-600 text-xs sm:text-sm">每日默写字数: 30个词汇</p>
              <p className="text-blue-600 text-xs sm:text-sm mt-0.5">包含基础词汇和常用短语</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <h3 className="font-medium text-purple-800 mb-1.5 text-sm">高年级 (5-6年级)</h3>
              <p className="text-purple-600 text-xs sm:text-sm">每日默写字数: 40个词汇</p>
              <p className="text-purple-600 text-xs sm:text-sm mt-0.5">包含进阶词汇和复杂短语</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">添加学生</h2>
              <button
                onClick={() => setShowAddModal(false)}
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
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  placeholder="请输入学生姓名"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  年级
                </label>
                <select
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: parseInt(e.target.value) })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                >
                  <option value="2">二年级</option>
                  <option value="3">三年级</option>
                  <option value="4">四年级</option>
                  <option value="5">五年级</option>
                  <option value="6">六年级</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  每日任务数量: <span className="text-orange-500 font-bold">{formData.dailyTaskCount}</span>词
                </label>
                <input
                  type="range"
                  min="10"
                  max="50"
                  step="5"
                  value={formData.dailyTaskCount}
                  onChange={(e) => setFormData({ ...formData, dailyTaskCount: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500 mt-2"
                />
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                  <span>10词</span>
                  <span>20词</span>
                  <span>30词</span>
                  <span>40词</span>
                  <span>50词</span>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 sm:py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100 text-sm"
                >
                  取消
                </button>
                <button
                  onClick={handleAdd}
                  className="flex-1 px-4 py-2 sm:py-3 bg-gradient-to-r from-orange-500 to-blue-600 text-white rounded-lg hover:from-orange-600 hover:to-blue-700 text-sm"
                >
                  添加
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">编辑学生</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingStudent(null);
                }}
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
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  placeholder="请输入学生姓名"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  年级
                </label>
                <select
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: parseInt(e.target.value) })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                >
                  <option value="2">二年级</option>
                  <option value="3">三年级</option>
                  <option value="4">四年级</option>
                  <option value="5">五年级</option>
                  <option value="6">六年级</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  每日任务数量: <span className="text-orange-500 font-bold">{formData.dailyTaskCount}</span>词
                </label>
                <input
                  type="range"
                  min="10"
                  max="50"
                  step="5"
                  value={formData.dailyTaskCount}
                  onChange={(e) => setFormData({ ...formData, dailyTaskCount: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500 mt-2"
                />
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                  <span>10词</span>
                  <span>20词</span>
                  <span>30词</span>
                  <span>40词</span>
                  <span>50词</span>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingStudent(null);
                  }}
                  className="flex-1 px-4 py-2 sm:py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100 text-sm"
                >
                  取消
                </button>
                <button
                  onClick={handleUpdate}
                  className="flex-1 px-4 py-2 sm:py-3 bg-gradient-to-r from-orange-500 to-blue-600 text-white rounded-lg hover:from-orange-600 hover:to-blue-700 flex items-center justify-center gap-2 text-sm"
                >
                  <Save size={16} />
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
