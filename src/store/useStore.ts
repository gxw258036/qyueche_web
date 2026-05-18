import { create } from 'zustand';
import { api } from '@/services/api';
import { Vocabulary, Settings, DailyTask } from '@/types';

interface AppState {
  vocabulary: Vocabulary[];
  settings: Settings;
  dailyTask: DailyTask | null;
  loading: boolean;
  error: string | null;

  initialize: () => Promise<void>;
  loadVocabulary: (grade?: number, status?: string, search?: string) => Promise<void>;
  addVocabulary: (word: Omit<Vocabulary, 'id' | 'addedAt'>) => Promise<void>;
  updateVocabulary: (id: string, updates: Partial<Vocabulary>) => Promise<void>;
  deleteVocabulary: (id: string) => Promise<void>;
  bulkAddVocabulary: (words: { word: string; meaning: string; grade: number }[]) => Promise<void>;
  
  updateSettings: (updates: Partial<Settings>) => Promise<void>;
  generateDailyTask: (grade: number) => Promise<DailyTask>;
  completeDailyTask: (taskId: string, errorWordIds: string[]) => Promise<void>;
  loadStatistics: (grade: number) => Promise<any>;
}

export const useStore = create<AppState>((set, get) => ({
  vocabulary: [],
  settings: { currentGrade: 4, lastStudyDate: '' },
  dailyTask: null,
  loading: false,
  error: null,

  initialize: async () => {
    set({ loading: true, error: null });
    try {
      await api.init();
      const settings = await api.settings.get();
      set({ settings, loading: false });
    } catch (error) {
      set({ error: '初始化失败', loading: false });
    }
  },

  loadVocabulary: async (grade?: number, status?: string, search?: string) => {
    set({ loading: true, error: null });
    try {
      const { settings } = get();
      const vocab = await api.vocabulary.list({
        grade: grade || settings.currentGrade,
        status,
        search,
      });
      set({ vocabulary: vocab, loading: false });
    } catch (error) {
      set({ error: '加载词汇失败', loading: false });
    }
  },

  addVocabulary: async (word) => {
    set({ loading: true, error: null });
    try {
      await api.vocabulary.create(word);
      await get().loadVocabulary();
    } catch (error) {
      set({ error: '添加词汇失败', loading: false });
    }
  },

  updateVocabulary: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      await api.vocabulary.update(id, updates as any);
      await get().loadVocabulary();
    } catch (error) {
      set({ error: '更新词汇失败', loading: false });
    }
  },

  deleteVocabulary: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.vocabulary.delete(id);
      await get().loadVocabulary();
    } catch (error) {
      set({ error: '删除词汇失败', loading: false });
    }
  },

  bulkAddVocabulary: async (words) => {
    set({ loading: true, error: null });
    try {
      await api.vocabulary.bulkCreate(words);
      await get().loadVocabulary();
    } catch (error) {
      set({ error: '批量导入失败', loading: false });
    }
  },

  updateSettings: async (updates) => {
    set({ loading: true, error: null });
    try {
      if (updates.currentGrade !== undefined) {
        await api.settings.update({ currentGrade: updates.currentGrade });
      }
      set((state) => ({
        settings: { ...state.settings, ...updates },
        loading: false,
      }));
    } catch (error) {
      set({ error: '更新设置失败', loading: false });
    }
  },

  generateDailyTask: async (grade: number) => {
    set({ loading: true, error: null });
    try {
      const task = await api.dailyTask.generate(grade);
      set({ dailyTask: task, loading: false });
      return task;
    } catch (error) {
      set({ error: '生成任务失败', loading: false });
      throw error;
    }
  },

  completeDailyTask: async (taskId: string, errorWordIds: string[]) => {
    set({ loading: true, error: null });
    try {
      await api.dailyTask.complete(taskId, errorWordIds);
      set((state) => ({
        dailyTask: state.dailyTask ? { ...state.dailyTask, completed: true, markedErrorWords: errorWordIds } : null,
        loading: false,
      }));
    } catch (error) {
      set({ error: '完成任务失败', loading: false });
    }
  },

  loadStatistics: async (grade: number) => {
    try {
      return await api.statistics.get(grade);
    } catch (error) {
      set({ error: '加载统计失败' });
      throw error;
    }
  },
}));
