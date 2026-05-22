import { create } from 'zustand';
import { Vocabulary, DailyTask, Settings, Statistics, Student, DailyTaskHistory, ErrorCollection, GrammarWeakness, GrammarQuestion } from '@/types';
import { api, ExportData } from '@/services/api';

interface Store {
  students: Student[];
  currentStudent: Student | null;
  vocabulary: Vocabulary[];
  dailyTask: DailyTask | null;
  dailyTaskHistory: DailyTaskHistory[];
  settings: Settings;
  statistics: Statistics | null;
  errorCollections: ErrorCollection[];
  grammarWeaknesses: GrammarWeakness[];
  grammarQuestions: GrammarQuestion[];
  isLoading: boolean;
  error: string | null;

  loadStudents: () => Promise<void>;
  addStudent: (name: string, dailyTaskCount?: number) => Promise<void>;
  updateStudent: (id: string, data?: { name?: string; dailyTaskCount?: number }) => Promise<void>;
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
  completeDailyTask: (errorWordIds: string[]) => Promise<DailyTask | null>;
  loadDailyTaskHistory: (limit?: number) => Promise<DailyTaskHistory[]>;

  loadSettings: () => Promise<void>;
  updateSettings: (currentStudentId?: string, dailyTaskCount?: number) => Promise<void>;

  loadStatistics: () => Promise<void>;

  loadErrorCollections: () => Promise<void>;
  addErrorCollection: (data: { title: string; question?: string; answer: string; imageData?: string; category?: string }) => Promise<void>;
  updateErrorCollection: (id: string, data: { title: string; question?: string; answer: string; imageData?: string; category?: string }) => Promise<void>;
  deleteErrorCollection: (id: string) => Promise<void>;

  loadGrammarWeaknesses: () => Promise<void>;
  addGrammarWeakness: (data: { title: string; description?: string; category?: string; example?: string }) => Promise<void>;
  updateGrammarWeakness: (id: string, data: { title: string; description?: string; category?: string; example?: string }) => Promise<void>;
  deleteGrammarWeakness: (id: string) => Promise<void>;

  loadGrammarQuestions: (weaknessId?: string) => Promise<void>;
  addGrammarQuestion: (data: { weaknessId?: string; question: string; answer: string; type?: string; options?: string }) => Promise<void>;
  updateGrammarQuestion: (id: string, data: { question: string; answer: string; type?: string; options?: string }) => Promise<void>;
  deleteGrammarQuestion: (id: string) => Promise<void>;

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
  errorCollections: [],
  grammarWeaknesses: [],
  grammarQuestions: [],
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

  updateStudent: async (id, data) => {
    try {
      await api.students.update(id, data || {});
      await get().loadStudents();
      const current = get().currentStudent;
      if (current && current.id === id) {
        set({ currentStudent: { ...current, ...data } });
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

  setCurrentStudent: async (student) => {
    if (!student) {
      set({ currentStudent: null, vocabulary: [] });
      return;
    }
    set({ currentStudent: student });
    await get().loadVocabulary(student.id);
    await get().loadDailyTask();
    await get().loadStatistics();
  },

  loadVocabulary: async (studentId) => {
    try {
      const effectiveStudentId = studentId ?? get().currentStudent?.id;
      if (effectiveStudentId) {
        const vocabulary = await api.vocabulary.getAll({ studentId: effectiveStudentId });
        set({ vocabulary });
      }
    } catch (error) {
      set({ error: '获取词汇列表失败' });
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

  updateVocabulary: async (id, word, meaning, status, type = 'word') => {
    try {
      await api.vocabulary.update(id, { word, meaning, status, type });
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
      for (const id of ids) {
        await api.vocabulary.delete(id);
      }
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
      const { currentStudent, generateDailyTask } = get();
      if (currentStudent) {
        const task = await api.dailyTask.get(currentStudent.id);
        
        // 获取本地日期而不是 UTC 日期
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const localToday = `${year}-${month}-${day}`;
        
        // 如果任务存在但不是今天的，或者任务不存在，都需要重新生成
        if (task && task.date !== localToday) {
          await generateDailyTask();
          return get().dailyTask;
        }
        
        set({ dailyTask: task });
        return task;
      }
      return null;
    } catch (error) {
      console.error('加载每日任务失败:', error);
      return null;
    }
  },

  generateDailyTask: async () => {
    try {
      const { currentStudent, loadDailyTask } = get();
      if (currentStudent) {
        await api.dailyTask.generate(currentStudent.id);
        await loadDailyTask();
      }
    } catch (error) {
      set({ error: '生成每日任务失败' });
    }
  },

  completeDailyTask: async (errorWordIds) => {
    try {
      const { dailyTask, currentStudent, loadDailyTask, loadVocabulary, loadStatistics } = get();
      if (dailyTask && currentStudent) {
        await api.dailyTask.complete(dailyTask.id, errorWordIds, currentStudent.id);
        await loadDailyTask();
        await loadVocabulary();
        await loadStatistics();
        return get().dailyTask;
      }
    } catch (error) {
      set({ error: '完成任务失败' });
    }
    return null;
  },

  loadDailyTaskHistory: async (limit = 10) => {
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
      set({ settings });
      const students = get().students;
      if (settings.currentStudentId && students.length > 0) {
        const currentStudent = students.find(s => s.id === settings.currentStudentId);
        if (currentStudent) {
          set({ currentStudent });
          await get().loadVocabulary(currentStudent.id);
          await get().loadDailyTask();
          await get().loadStatistics();
        }
      }
    } catch (error) {
      console.error('加载设置失败:', error);
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

  loadErrorCollections: async () => {
    try {
      const { currentStudent } = get();
      if (currentStudent) {
        const items = await api.errorCollections.getAll(currentStudent.id);
        set({ errorCollections: items });
      }
    } catch (error) {
      set({ error: '获取错题失败' });
    }
  },

  addErrorCollection: async (data) => {
    try {
      const { currentStudent } = get();
      if (!currentStudent) {
        set({ error: '请先选择学生' });
        return;
      }
      await api.errorCollections.create({ ...data, studentId: currentStudent.id });
      await get().loadErrorCollections();
    } catch (error) {
      set({ error: '添加错题失败' });
    }
  },

  updateErrorCollection: async (id, data) => {
    try {
      await api.errorCollections.update(id, data);
      await get().loadErrorCollections();
    } catch (error) {
      set({ error: '更新错题失败' });
    }
  },

  deleteErrorCollection: async (id) => {
    try {
      await api.errorCollections.delete(id);
      await get().loadErrorCollections();
    } catch (error) {
      set({ error: '删除错题失败' });
    }
  },

  loadGrammarWeaknesses: async () => {
    try {
      const { currentStudent } = get();
      if (currentStudent) {
        const items = await api.grammarWeaknesses.getAll(currentStudent.id);
        set({ grammarWeaknesses: items });
      }
    } catch (error) {
      set({ error: '获取语法短板失败' });
    }
  },

  addGrammarWeakness: async (data) => {
    try {
      const { currentStudent } = get();
      if (!currentStudent) {
        set({ error: '请先选择学生' });
        return;
      }
      await api.grammarWeaknesses.create({ ...data, studentId: currentStudent.id });
      await get().loadGrammarWeaknesses();
    } catch (error) {
      set({ error: '添加语法短板失败' });
    }
  },

  updateGrammarWeakness: async (id, data) => {
    try {
      await api.grammarWeaknesses.update(id, data);
      await get().loadGrammarWeaknesses();
    } catch (error) {
      set({ error: '更新语法短板失败' });
    }
  },

  deleteGrammarWeakness: async (id) => {
    try {
      await api.grammarWeaknesses.delete(id);
      await get().loadGrammarWeaknesses();
    } catch (error) {
      set({ error: '删除语法短板失败' });
    }
  },

  loadGrammarQuestions: async (weaknessId) => {
    try {
      const { currentStudent } = get();
      if (currentStudent) {
        const items = await api.grammarQuestions.getAll(currentStudent.id, weaknessId);
        set({ grammarQuestions: items });
      }
    } catch (error) {
      set({ error: '获取语法试题失败' });
    }
  },

  addGrammarQuestion: async (data) => {
    try {
      const { currentStudent } = get();
      if (!currentStudent) {
        set({ error: '请先选择学生' });
        return;
      }
      await api.grammarQuestions.create({ ...data, studentId: currentStudent.id });
      await get().loadGrammarQuestions();
    } catch (error) {
      set({ error: '添加语法试题失败' });
    }
  },

  updateGrammarQuestion: async (id, data) => {
    try {
      await api.grammarQuestions.update(id, data);
      await get().loadGrammarQuestions();
    } catch (error) {
      set({ error: '更新语法试题失败' });
    }
  },

  deleteGrammarQuestion: async (id) => {
    try {
      await api.grammarQuestions.delete(id);
      await get().loadGrammarQuestions();
    } catch (error) {
      set({ error: '删除语法试题失败' });
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
