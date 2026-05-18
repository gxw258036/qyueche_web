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
  const [formData, setFormData] = useState({ name: '', grade: 2 });
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
      await addStudent(formData.name, formData.grade);
      setFormData({ name: '', grade: 2 });
      setShowAddModal(false);
      await loadStudents();
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({ name: student.name, grade: student.grade });
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    if (editingStudent && formData.name.trim()) {
      await updateStudent(editingStudent.id, formData.name, formData.grade);
      setEditingStudent(null);
      setFormData({ name: '', grade: 2 });
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
        <div className="text-center">
          <div className="animate-spin mx-auto mb-4 text-orange-500">加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white rounded-xl shadow">
              <Users className="text-orange-500" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">学生管理</h1>
              <p className="text-gray-600">管理学生信息和年级设置</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-blue-600 text-white rounded-xl hover:from-orange-600 hover:to-blue-700 transition-all shadow-lg"
          >
            <Plus size={20} />
            添加学生
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">姓名</th>
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">年级</th>
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">当前状态</th>
                  <th className="text-right py-3 px-4 text-gray-600 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                          {student.name.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-800">{student.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        student.grade === 2 || student.grade === 3 || student.grade === 4
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {student.grade}年级
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {currentStudent?.id === student.id ? (
                        <span className="flex items-center gap-1 text-green-600">
                          <span className="w-2 h-2 bg-green-500 rounded-full" />
                          当前使用
                        </span>
                      ) : (
                        <span className="text-gray-400">未选中</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {currentStudent?.id !== student.id && (
                          <button
                            onClick={() => handleSetCurrent(student)}
                            className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                            title="设为当前学生"
                          >
                            <Check size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(student)}
                          className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="编辑学生"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(student.id)}
                          className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="删除学生"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {students.length === 0 && (
              <div className="text-center py-12">
                <Users className="mx-auto text-gray-300 mb-4" size={48} />
                <p className="text-gray-500">暂无学生信息，请添加学生</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">年级配置说明</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-4 bg-blue-50 rounded-xl">
              <h3 className="font-medium text-blue-800 mb-2">低年级 (2-4年级)</h3>
              <p className="text-blue-600 text-sm">每日默写字数: 30个词汇</p>
              <p className="text-blue-600 text-sm mt-1">包含基础词汇和常用短语</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-xl">
              <h3 className="font-medium text-purple-800 mb-2">高年级 (5-6年级)</h3>
              <p className="text-purple-600 text-sm">每日默写字数: 40个词汇</p>
              <p className="text-purple-600 text-sm mt-1">包含进阶词汇和复杂短语</p>
            </div>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={handleAdd}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-blue-600 text-white rounded-lg hover:from-orange-600 hover:to-blue-700"
                >
                  添加
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editingStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingStudent(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={handleUpdate}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-blue-600 text-white rounded-lg hover:from-orange-600 hover:to-blue-700 flex items-center justify-center gap-2"
                >
                  <Save size={18} />
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
