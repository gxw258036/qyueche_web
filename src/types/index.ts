export interface Student {
  id: string;
  name: string;
  grade: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Vocabulary {
  id: string;
  word: string;
  meaning: string;
  grade: number;
  studentId?: string;
  status: 'new' | 'reviewed' | 'mastered' | 'error';
  correctCount: number;
  errorCount: number;
  addedAt: string;
  lastReviewedAt?: string;
  isCustom: number;
  createdAt?: string;
  updatedAt?: string;
  errorDates?: string[];
  totalErrors?: number;
}

export interface DailyTask {
  id: string;
  date: string;
  grade: number;
  studentId?: string;
  completed: boolean;
  markedErrorWords: string[];
  allWords: Vocabulary[];
  totalCount: number;
}

export interface DailyTaskHistory {
  id: string;
  date: string;
  grade: number;
  studentId?: string;
  completed: number;
  markedErrorWords: string;
  correctCount: number;
  errorCount: number;
  totalCount: number;
}

export interface Settings {
  id: number;
  currentGrade: number;
  currentStudentId?: string;
  lastStudyDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Statistics {
  total: number;
  new: number;
  reviewed: number;
  mastered: number;
  error: number;
  totalCorrect: number;
  totalError: number;
  completedDays: number;
}

export interface WordErrorLog {
  id: string;
  vocabularyId: string;
  date: string;
  createdAt?: string;
}

export type Grade = 2 | 3 | 4 | 5 | 6;

export const GRADES: Grade[] = [2, 3, 4, 5, 6];

export const GRADE_CONFIGS: Record<number, { total: number; newCount: number; reviewCount: number }> = {
  2: { total: 30, newCount: 10, reviewCount: 20 },
  3: { total: 30, newCount: 10, reviewCount: 20 },
  4: { total: 30, newCount: 10, reviewCount: 20 },
  5: { total: 30, newCount: 10, reviewCount: 20 },
  6: { total: 30, newCount: 10, reviewCount: 20 },
};
