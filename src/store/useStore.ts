import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Vocabulary, Settings, DailyTask, GRADE_CONFIGS } from '@/types';
import { getInitialVocabulary } from '@/data/initialVocabulary';

interface AppState {
  vocabulary: Vocabulary[];
  settings: Settings;
  dailyTasks: DailyTask[];
  currentDailyTask: DailyTask | null;

  initializeVocabulary: () => void;
  addVocabulary: (word: Omit<Vocabulary, 'id' | 'addedAt'>) => void;
  updateVocabulary: (id: string, updates: Partial<Vocabulary>) => void;
  deleteVocabulary: (id: string) => void;
  updateSettings: (updates: Partial<Settings>) => void;
  
  generateDailyTask: (grade: number) => DailyTask;
  getTodayTask: () => DailyTask | null;
  markErrorWords: (taskId: string, errorWordIds: string[]) => void;
  completeTodayTask: () => void;
}

const today = new Date().toISOString().split('T')[0];
const defaultSettings: Settings = {
  currentGrade: 4,
  lastStudyDate: today,
};

const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      vocabulary: [],
      settings: defaultSettings,
      dailyTasks: [],
      currentDailyTask: null,

      initializeVocabulary: () => {
        const { vocabulary } = get();
        if (vocabulary.length === 0) {
          const initialVocab = getInitialVocabulary();
          set({ vocabulary: initialVocab });
        }
      },

      addVocabulary: (word) => {
        const newWord: Vocabulary = {
          ...word,
          id: Math.random().toString(36).substr(2, 9),
          addedAt: today,
        };
        set((state) => ({
          vocabulary: [...state.vocabulary, newWord],
        }));
      },

      updateVocabulary: (id, updates) => {
        set((state) => ({
          vocabulary: state.vocabulary.map((word) =>
            word.id === id ? { ...word, ...updates } : word
          ),
        }));
      },

      deleteVocabulary: (id) => {
        set((state) => ({
          vocabulary: state.vocabulary.filter((word) => word.id !== id),
        }));
      },

      updateSettings: (updates) => {
        set((state) => ({
          settings: { ...state.settings, ...updates },
        }));
      },

      generateDailyTask: (grade: number) => {
        const { vocabulary, dailyTasks } = get();
        const config = GRADE_CONFIGS[grade];
        
        const gradeVocab = vocabulary.filter((v) => v.grade === grade);
        
        const newWords = shuffleArray(
          gradeVocab.filter((v) => v.status === 'new')
        ).slice(0, config.newCount);
        
        const errorWords = shuffleArray(
          gradeVocab.filter((v) => v.status === 'error')
        );
        
        const reviewedWords = shuffleArray(
          gradeVocab.filter((v) => v.status === 'reviewed' || v.status === 'mastered')
        );
        
        let reviewPool = [...errorWords, ...reviewedWords];
        let selectedReviewWords = reviewPool.slice(0, config.reviewCount);
        
        if (selectedReviewWords.length < config.reviewCount) {
          const extraWords = shuffleArray(
            gradeVocab.filter((v) => 
              !newWords.some((nw) => nw.id === v.id) && 
              !selectedReviewWords.some((rw) => rw.id === v.id)
            )
          );
          selectedReviewWords = [
            ...selectedReviewWords,
            ...extraWords.slice(0, config.reviewCount - selectedReviewWords.length)
          ];
        }

        const allWords = shuffleArray([...newWords, ...selectedReviewWords]);

        const task: DailyTask = {
          date: today,
          grade,
          newWords: allWords.slice(0, config.newCount),
          reviewedWords: allWords.slice(config.newCount),
          completed: false,
        };

        const updatedTasks = dailyTasks.filter((t) => !(t.date === today && t.grade === grade));
        updatedTasks.push(task);

        set({ 
          dailyTasks: updatedTasks,
          currentDailyTask: task,
        });

        return task;
      },

      getTodayTask: () => {
        const { dailyTasks, settings } = get();
        const todayTask = dailyTasks.find(
          (t) => t.date === today && t.grade === settings.currentGrade
        );
        return todayTask || null;
      },

      markErrorWords: (taskId: string, errorWordIds: string[]) => {
        const { vocabulary, dailyTasks } = get();
        
        const updatedVocab = vocabulary.map((word) => {
          if (errorWordIds.includes(word.id)) {
            return {
              ...word,
              status: 'error' as const,
              errorCount: word.errorCount + 1,
              lastReviewedAt: today,
            };
          } else if (word.correctCount >= 3) {
            return {
              ...word,
              status: 'mastered' as const,
              correctCount: word.correctCount + 1,
              lastReviewedAt: today,
            };
          } else if (word.status === 'new') {
            return {
              ...word,
              status: 'reviewed' as const,
              correctCount: word.correctCount + 1,
              lastReviewedAt: today,
            };
          }
          return word;
        });

        const updatedTasks = dailyTasks.map((task) => {
          if (task.date === today) {
            return { ...task, markedErrorWords: errorWordIds };
          }
          return task;
        });

        set({
          vocabulary: updatedVocab,
          dailyTasks: updatedTasks,
        });
      },

      completeTodayTask: () => {
        const { dailyTasks, settings } = get();
        
        const updatedTasks = dailyTasks.map((task) => {
          if (task.date === today && task.grade === settings.currentGrade) {
            return { ...task, completed: true };
          }
          return task;
        });

        set({
          dailyTasks: updatedTasks,
          settings: {
            ...settings,
            lastStudyDate: today,
          },
        });
      },
    }),
    {
      name: 'english-vocabulary-storage',
    }
  )
);
