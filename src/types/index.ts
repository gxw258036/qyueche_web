export interface DailyTaskHistory {
  id: string;
  date: string;
  totalCount: number;
  correctCount: number;
  errorCount: number;
  newWords: Vocabulary[];
  reviewedWords: Vocabulary[];
  markedErrorWords: string[];
}

export interface Student {
  id: string;
  name: string;
  dailyTaskCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Vocabulary {
  id: string;
  word: string;
  meaning: string;
  studentId: string;
  type: 'word' | 'phrase' | 'sentence';
  status: 'new' | 'old' | 'review' | 'mastered';
  correctCount: number;
  errorCount: number;
  consecutiveCorrectCount: number;
  addedAt: string;
  lastReviewedAt?: string;
  lastErrorDate?: string;
  becomeMasteredAt?: string;
  lastAppearedDate?: string;
  isCustom: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface DailyTask {
  id: string | null;
  date: string;
  studentId: string;
  completed: boolean;
  markedErrorWords: string[];
  newWords: Vocabulary[];
  reviewedWords: Vocabulary[];
  message?: string;
}

export interface Settings {
  id: number;
  currentStudentId?: string;
  lastStudyDate?: string;
  dailyTaskCount?: number;
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

export interface ErrorCollection {
  id: string;
  studentId: string;
  title: string;
  question?: string;
  answer: string;
  imageData?: string;
  category: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GrammarWeakness {
  id: string;
  studentId: string;
  title: string;
  description?: string;
  category: string;
  example?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GrammarQuestion {
  id: string;
  studentId: string;
  weaknessId?: string;
  question: string;
  answer: string;
  type: 'fill_blank' | 'choice' | 'error_correction' | 'translation';
  options?: string;
  createdAt?: string;
  updatedAt?: string;
}
