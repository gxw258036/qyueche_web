
export interface Vocabulary {
  id: string;
  word: string;
  meaning: string;
  grade: number;
  status: 'new' | 'reviewed' | 'mastered' | 'error';
  correctCount: number;
  errorCount: number;
  addedAt: string;
  lastReviewedAt?: string;
  isCustom: boolean;
}

export interface StudyRecord {
  id: string;
  vocabularyId: string;
  studyDate: string;
  isCorrect: boolean;
  reviewStatus: string;
}

export interface Settings {
  currentGrade: number;
  lastStudyDate: string;
}

export interface DailyTask {
  date: string;
  grade: number;
  newWords: Vocabulary[];
  reviewedWords: Vocabulary[];
  completed: boolean;
  markedErrorWords?: string[];
}

export interface GradeConfig {
  total: number;
  newCount: number;
  reviewCount: number;
}

export type PaperType = 'daily' | 'error' | 'custom';

export type PaperMode = 'blank' | 'answer';

export const GRADE_CONFIGS: Record<number, GradeConfig> = {
  2: { total: 30, newCount: 10, reviewCount: 20 },
  3: { total: 30, newCount: 10, reviewCount: 20 },
  4: { total: 30, newCount: 10, reviewCount: 20 },
  5: { total: 40, newCount: 15, reviewCount: 25 },
  6: { total: 40, newCount: 15, reviewCount: 25 },
};
