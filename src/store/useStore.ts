import { create } from 'zustand';
import { Vocabulary, DailyTask, Settings, Statistics, Student } from '@/types';
import { api } from '@/services/api';

interface Store {
  students: Student[];
  currentStudent: Student | null;
  vocabulary: Vocabulary[];
  dailyTask: DailyTask | null;
  settings: Settings;
  statistics: Statistics | null;
  isLoading: boolean;
  error: string | null;

  loadStudents: () => Promise<void>;
  addStudent: (name: string, grade: number) => Promise<void>;
  updateStudent: (id: string, name: string, grade: number) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  setCurrentStudent: (student: Student | null) => void;

  loadVocabulary: (grade?: number, studentId?: string) => Promise<void>;
  addVocabulary: (word: string, meaning: string, grade: number, studentId?: string) => Promise<void>;
  updateVocabulary: (id: string, word: string, meaning: string, grade: number, status: string) => Promise<void>;
  deleteVocabulary: (id: string) => Promise<void>;
  bulkDeleteVocabulary: (ids: string[]) => Promise<void>;
  bulkAddVocabulary: (words: { word: string; meaning: string; grade: number }[], studentId?: string) => Promise<void>;

  loadDailyTask: () => Promise<void>;
  generateDailyTask: () => Promise<void>;
  completeDailyTask: (errorWordIds: string[]) => Promise<void>;

  loadSettings: () => Promise<void>;
  updateSettings: (currentGrade?: number, currentStudentId?: string) => Promise<void>;

  loadStatistics: () => Promise<void>;

  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useStore = create<Store>((set, get) => ({
  students: [],
  currentStudent: null,
  vocabulary: [],
  dailyTask: null,
  settings: { id: 1, currentGrade: 4 },
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

  addStudent: async (name, grade) => {
    try {
      await api.students.create({ name, grade });
      await get().loadStudents();
    } catch (error) {
      set({ error: '添加学生失败' });
    }
  },

  updateStudent: async (id, name, grade) => {
    try {
      await api.students.update(id, { name, grade });
      await get().loadStudents();
      const current = get().currentStudent;
      if (current && current.id === id) {
        set({ currentStudent: { ...current, name, grade } });
        await api.settings.update({ currentGrade: grade });
        await get().loadSettings();
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
      get().updateSettings(student.grade, student.id);
    }
  },

  loadVocabulary: async (grade, studentId) => {
    try {
      const effectiveGrade = grade ?? get().settings.currentGrade;
      const effectiveStudentId = studentId ?? get().currentStudent?.id;
      const vocabulary = await api.vocabulary.getAll({ grade: effectiveGrade, studentId: effectiveStudentId });
      set({ vocabulary });
    } catch (error) {
      set({ error: '获取词汇失败' });
    }
  },

  addVocabulary: async (word, meaning, grade, studentId) => {
    try {
      const effectiveStudentId = studentId ?? get().currentStudent?.id;
      await api.vocabulary.create({ word, meaning, grade, studentId: effectiveStudentId });
      await get().loadVocabulary();
    } catch (error) {
      set({ error: '添加词汇失败' });
    }
  },

  updateVocabulary: async (id, word, meaning, grade, status) => {
    try {
      await api.vocabulary.update(id, { word, meaning, grade, status });
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
      await api.vocabulary.bulk(words, effectiveStudentId);
      await get().loadVocabulary();
    } catch (error) {
      set({ error: '批量添加词汇失败' });
    }
  },

  loadDailyTask: async () => {
    try {
      const { settings, currentStudent } = get();
      const task = await api.dailyTask.get(settings.currentGrade, currentStudent?.id);
      set({ dailyTask: task });
    } catch (error) {
      set({ error: '获取任务失败' });
    }
  },

  generateDailyTask: async () => {
    try {
      const { settings, currentStudent } = get();
      const task = await api.dailyTask.generate(settings.currentGrade, currentStudent?.id);
      set({ dailyTask: task });
    } catch (error) {
      set({ error: '生成任务失败' });
    }
  },

  completeDailyTask: async (errorWordIds) => {
    try {
      const { dailyTask, currentStudent } = get();
      if (dailyTask) {
        await api.dailyTask.complete(dailyTask.id, errorWordIds, currentStudent?.id);
        await get().loadDailyTask();
        await get().loadStatistics();
        await get().loadVocabulary();
      }
    } catch (error) {
      set({ error: '完成任务失败' });
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

  updateSettings: async (currentGrade, currentStudentId) => {
    try {
      await api.settings.update({ currentGrade, currentStudentId });
      await get().loadSettings();
    } catch (error) {
      set({ error: '更新设置失败' });
    }
  },

  loadStatistics: async () => {
    try {
      const { settings, currentStudent } = get();
      const stats = await api.statistics.get(settings.currentGrade, currentStudent?.id);
      set({ statistics: stats });
    } catch (error) {
      set({ error: '获取统计失败' });
    }
  },

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));
