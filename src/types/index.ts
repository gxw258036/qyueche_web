export interface DailyTaskHistory {
  id: string;
  date: string;
  grade: number;
  totalCount: number;
  correctCount: number;
  errorCount: number;
}

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
}

export interface DailyTask {
  id: string;
  date: string;
  grade: number;
  studentId?: string;
  completed: boolean;
  markedErrorWords: string[];
  newWords: Vocabulary[];
  reviewedWords: Vocabulary[];
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

export type Grade = 2 | 3 | 4 | 5 | 6;

export const GRADES: Grade[] = [2, 3, 4, 5, 6];

export const GRADE_CONFIGS: Record<number, { total: number; newCount: number; reviewCount: number }> = {
  2: { total: 30, newCount: 10, reviewCount: 20 },
  3: { total: 30, newCount: 10, reviewCount: 20 },
  4: { total: 30, newCount: 10, reviewCount: 20 },
  5: { total: 40, newCount: 15, reviewCount: 25 },
  6: { total: 40, newCount: 15, reviewCount: 25 },
};
