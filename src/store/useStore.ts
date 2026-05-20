import { create } from 'zustand';
import { Vocabulary, DailyTask, Settings, Statistics, Student, DailyTaskHistory } from '@/types';
import { api, ExportData } from '@/services/api';

interface Store {
  students: Student[];
  currentStudent: Student | null;
  vocabulary: Vocabulary[];
  dailyTask: DailyTask | null;
  dailyTaskHistory: DailyTaskHistory[];
  settings: Settings;
  statistics: Statistics | null;
  isLoading: boolean;
  error: string | null;

  loadStudents: () => Promise<void>;
  addStudent: (name: string, dailyTaskCount?: number) => Promise<void>;
  updateStudent: (id: string, name: string, dailyTaskCount?: number) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  setCurrentStudent: (student: Student | null) => void;

  loadVocabulary: (studentId?: string) => Promise<void>;
  addVocabulary: (word: string, meaning: string, type?: string, studentId?: string, status?: string) => Promise<void>;
  updateVocabulary: (id: string, word: string, meaning: string, status: string, type?: string) => Promise<void>;
  deleteVocabulary: (id: string) => Promise<void>;
  bulkDeleteVocabulary: (ids: string[]) => Promise<void>;
  bulkAddVocabulary: (words: { word: string; meaning: string; type?: string }[], studentId?: string) => Promise<void>;

  loadDailyTask: () => Promise<DailyTask | null>;
  generateDailyTask: () => Promise<void>;
  completeDailyTask: (errorWordIds: string[]) => Promise<void>;
  loadDailyTaskHistory: (limit?: number) => Promise<DailyTaskHistory[]>;

  loadSettings: () => Promise<void>;
  updateSettings: (currentStudentId?: string, dailyTaskCount?: number) => Promise<void>;

  loadStatistics: () => Promise<void>;

  exportData: () => Promise<ExportData | null>;
  importData: (data: ExportData) => Promise<void>;

  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useStore = create<Store>((set, get) => ({
  students: [],
  currentStudent: null,
  vocabulary: [],
  dailyTask: null,
  dailyTaskHistory: [],
  settings: { id: 1 },
  statistics: null,
  isLoading: false,
  error: null,

  loadStudents: async () => {
    try {
      const students = await api.students.getAll();
      set({ students });
    } catch (error) {
      set({ error: '获取学生列表失败' });
    }
  },

  addStudent: async (name, dailyTaskCount) => {
    try {
      await api.students.create({ name, dailyTaskCount });
      await get().loadStudents();
    } catch (error) {
      set({ error: '添加学生失败' });
    }
  },

  updateStudent: async (id, name, dailyTaskCount) => {
    try {
      await api.students.update(id, { name, dailyTaskCount });
      await get().loadStudents();
      const current = get().currentStudent;
      if (current && current.id === id) {
        set({ currentStudent: { ...current, name, dailyTaskCount } });
      }
    } catch (error) {
      set({ error: '更新学生失败' });
    }
  },

  deleteStudent: async (id) => {
    try {
      await api.students.delete(id);
      await get().loadStudents();
      const current = get().currentStudent;
      if (current && current.id === id) {
        set({ currentStudent: null });
      }
    } catch (error) {
      set({ error: '删除学生失败' });
    }
  },

  setCurrentStudent: (student) => {
    set({ currentStudent: student });
    if (student) {
      get().updateSettings(student.id);
    }
  },

  loadVocabulary: async (studentId) => {
    try {
      const effectiveStudentId = studentId ?? get().currentStudent?.id;
      if (effectiveStudentId) {
        const vocabulary = await api.vocabulary.getAll({ studentId: effectiveStudentId });
        set({ vocabulary });
      }
    } catch (error) {
      set({ error: '获取词汇失败' });
    }
  },

  addVocabulary: async (word, meaning, type = 'word', studentId, status = 'new') => {
    try {
      const effectiveStudentId = studentId ?? get().currentStudent?.id;
      if (!effectiveStudentId) {
        set({ error: '请先选择或添加学生' });
        return;
      }
      await api.vocabulary.create({ word, meaning, type, studentId: effectiveStudentId, status });
      await get().loadVocabulary();
    } catch (error) {
      set({ error: '添加词汇失败' });
    }
  },

  updateVocabulary: async (id, word, meaning, status, type) => {
    try {
      await api.vocabulary.update(id, { word, meaning, type, status });
      await get().loadVocabulary();
    } catch (error) {
      set({ error: '更新词汇失败' });
    }
  },

  deleteVocabulary: async (id) => {
    try {
      await api.vocabulary.delete(id);
      await get().loadVocabulary();
    } catch (error) {
      set({ error: '删除词汇失败' });
    }
  },

  bulkDeleteVocabulary: async (ids) => {
    try {
      await api.vocabulary.bulkDelete(ids);
      await get().loadVocabulary();
    } catch (error) {
      set({ error: '批量删除词汇失败' });
    }
  },

  bulkAddVocabulary: async (words, studentId) => {
    try {
      const effectiveStudentId = studentId ?? get().currentStudent?.id;
      if (!effectiveStudentId) {
        set({ error: '请先选择或添加学生' });
        return;
      }
      await api.vocabulary.bulk(words, effectiveStudentId);
      await get().loadVocabulary();
    } catch (error) {
      set({ error: '批量添加词汇失败' });
    }
  },

  loadDailyTask: async () => {
    try {
      const { currentStudent } = get();
      if (currentStudent) {
        const task = await api.dailyTask.get(currentStudent.id);
        set({ dailyTask: task });
        return task;
      }
      return null;
    } catch (error) {
      set({ error: '获取任务失败' });
      return null;
    }
  },

  generateDailyTask: async () => {
    try {
      const { currentStudent } = get();
      if (currentStudent) {
        const task = await api.dailyTask.generate(currentStudent.id);
        set({ dailyTask: task });
      }
    } catch (error) {
      set({ error: '生成任务失败' });
    }
  },

  completeDailyTask: async (errorWordIds) => {
    try {
      const { dailyTask, currentStudent } = get();
      if (dailyTask && currentStudent) {
        await api.dailyTask.complete(dailyTask.id, errorWordIds, currentStudent.id);
        await get().loadDailyTask();
        await get().loadStatistics();
        await get().loadVocabulary();
      }
    } catch (error) {
      set({ error: '完成任务失败' });
    }
  },

  loadDailyTaskHistory: async (limit = 30) => {
    try {
      const { currentStudent } = get();
      if (currentStudent) {
        const history = await api.dailyTask.getHistory(currentStudent.id, limit);
        set({ dailyTaskHistory: history });
        return history;
      }
      return [];
    } catch (error) {
      set({ error: '获取历史记录失败' });
      return [];
    }
  },

  loadSettings: async () => {
    try {
      const settings = await api.settings.get();
      let currentStudent: Student | null = null;
      
      if (settings.currentStudentId) {
        const students = await api.students.getAll();
        currentStudent = students.find(s => s.id === settings.currentStudentId) || null;
      }
      
      set({ settings, currentStudent });
    } catch (error) {
      set({ error: '获取设置失败' });
    }
  },

  updateSettings: async (currentStudentId, dailyTaskCount) => {
    try {
      await api.settings.update({ currentStudentId, dailyTaskCount });
      await get().loadSettings();
    } catch (error) {
      set({ error: '更新设置失败' });
    }
  },

  loadStatistics: async () => {
    try {
      const { currentStudent } = get();
      if (currentStudent) {
        const stats = await api.statistics.get(currentStudent.id);
        set({ statistics: stats });
      }
    } catch (error) {
      set({ error: '获取统计失败' });
    }
  },

  exportData: async () => {
    try {
      const data = await api.export();
      return data;
    } catch (error) {
      set({ error: '导出数据失败' });
      return null;
    }
  },

  importData: async (data) => {
    try {
      await api.import(data);
      await get().loadStudents();
      await get().loadSettings();
      await get().loadVocabulary();
      await get().loadDailyTask();
      await get().loadStatistics();
    } catch (error) {
      set({ error: '导入数据失败' });
    }
  },

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));
