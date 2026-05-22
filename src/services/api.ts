import { Vocabulary, DailyTask, Settings, Statistics, Student, DailyTaskHistory, ErrorCollection, GrammarWeakness, GrammarQuestion } from '@/types';

const API_BASE = '/api';

export interface ExportData {
  version: string;
  exportTime: string;
  students: Student[];
  vocabulary: Vocabulary[];
  dailyTasks: any[];
  settings: Settings[];
}

export const api = {
  init: () => fetch(`${API_BASE}/init`).then(res => res.json()),
  
  export: () => fetch(`${API_BASE}/export`).then(res => res.json()) as Promise<ExportData>,
  
  import: (data: ExportData) => 
    fetch(`${API_BASE}/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => res.json()),

  students: {
    getAll: () => fetch(`${API_BASE}/students`).then(res => res.json()) as Promise<Student[]>,
    create: (data: { name: string; dailyTaskCount?: number }) => 
      fetch(`${API_BASE}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(res => res.json()),
    update: (id: string, data: { name?: string; dailyTaskCount?: number }) =>
      fetch(`${API_BASE}/students/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(res => res.json()),
    delete: (id: string) =>
      fetch(`${API_BASE}/students/${id}`, { method: 'DELETE' }).then(res => res.json())
  },

  settings: {
    get: () => fetch(`${API_BASE}/settings`).then(res => res.json()) as Promise<Settings>,
    update: (data: { currentStudentId?: string; dailyTaskCount?: number }) =>
      fetch(`${API_BASE}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(res => res.json())
  },

  vocabulary: {
    getAll: (params?: { status?: string; search?: string; studentId?: string }) => {
      const query = new URLSearchParams();
      if (params?.status) query.set('status', params.status);
      if (params?.search) query.set('search', params.search);
      if (params?.studentId) query.set('studentId', params.studentId);
      return fetch(`${API_BASE}/vocabulary?${query}`).then(res => res.json()) as Promise<Vocabulary[]>;
    },
    create: (data: { word: string; meaning: string; type?: string; studentId?: string; status?: string }) =>
      fetch(`${API_BASE}/vocabulary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(res => res.json()),
    update: (id: string, data: { word: string; meaning: string; type?: string; status: string }) =>
      fetch(`${API_BASE}/vocabulary/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(res => res.json()),
    delete: (id: string) =>
      fetch(`${API_BASE}/vocabulary/${id}`, { method: 'DELETE' }).then(res => res.json()),
    bulkDelete: (ids: string[]) =>
      fetch(`${API_BASE}/vocabulary/bulk-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      }).then(res => res.json()),
    bulk: (words: { word: string; meaning: string; type?: string }[], studentId?: string) =>
      fetch(`${API_BASE}/vocabulary/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ words, studentId })
      }).then(res => res.json())
  },

  dailyTask: {
    get: (studentId: string) => {
      const query = new URLSearchParams();
      if (studentId) query.set('studentId', studentId);
      return fetch(`${API_BASE}/daily-task?${query}`).then(res => res.json()) as Promise<DailyTask | null>;
    },
    generate: (studentId: string) =>
      fetch(`${API_BASE}/daily-task/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId })
      }).then(res => res.json()) as Promise<DailyTask>,
    complete: (taskId: string, errorWordIds: string[], studentId?: string) =>
      fetch(`${API_BASE}/daily-task/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, errorWordIds, studentId })
      }).then(res => res.json()),
    getHistory: (studentId: string, limit?: number) => {
      const query = new URLSearchParams();
      if (studentId) query.set('studentId', studentId);
      if (limit) query.set('limit', limit.toString());
      return fetch(`${API_BASE}/daily-task/history?${query}`).then(res => res.json()) as Promise<DailyTaskHistory[]>;
    }
  },

  statistics: {
    get: (studentId: string) => {
      const query = new URLSearchParams();
      if (studentId) query.set('studentId', studentId);
      return fetch(`${API_BASE}/statistics?${query}`).then(res => res.json()) as Promise<Statistics>;
    }
  },

  errorCollections: {
    getAll: (studentId: string) => {
      const query = new URLSearchParams();
      if (studentId) query.set('studentId', studentId);
      return fetch(`${API_BASE}/error-collections?${query}`).then(res => res.json()) as Promise<ErrorCollection[]>;
    },
    create: (data: { studentId: string; title: string; question?: string; answer: string; imageData?: string; category?: string }) =>
      fetch(`${API_BASE}/error-collections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(res => res.json()),
    update: (id: string, data: { title: string; question?: string; answer: string; imageData?: string; category?: string }) =>
      fetch(`${API_BASE}/error-collections/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(res => res.json()),
    delete: (id: string) =>
      fetch(`${API_BASE}/error-collections/${id}`, { method: 'DELETE' }).then(res => res.json())
  },

  paperPractice: {
    get: (studentId: string, count?: number) => {
      const query = new URLSearchParams();
      if (studentId) query.set('studentId', studentId);
      if (count) query.set('count', count.toString());
      return fetch(`${API_BASE}/paper-practice?${query}`).then(res => res.json());
    }
  },

  grammarWeaknesses: {
    getAll: (studentId: string) => {
      const query = new URLSearchParams();
      if (studentId) query.set('studentId', studentId);
      return fetch(`${API_BASE}/grammar-weaknesses?${query}`).then(res => res.json()) as Promise<GrammarWeakness[]>;
    },
    create: (data: { studentId: string; title: string; description?: string; category?: string; example?: string }) =>
      fetch(`${API_BASE}/grammar-weaknesses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(res => res.json()),
    update: (id: string, data: { title: string; description?: string; category?: string; example?: string }) =>
      fetch(`${API_BASE}/grammar-weaknesses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(res => res.json()),
    delete: (id: string) =>
      fetch(`${API_BASE}/grammar-weaknesses/${id}`, { method: 'DELETE' }).then(res => res.json())
  },

  grammarQuestions: {
    getAll: (studentId: string, weaknessId?: string) => {
      const query = new URLSearchParams();
      if (studentId) query.set('studentId', studentId);
      if (weaknessId) query.set('weaknessId', weaknessId);
      return fetch(`${API_BASE}/grammar-questions?${query}`).then(res => res.json()) as Promise<GrammarQuestion[]>;
    },
    create: (data: { studentId: string; weaknessId?: string; question: string; answer: string; type?: string; options?: string }) =>
      fetch(`${API_BASE}/grammar-questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(res => res.json()),
    update: (id: string, data: { question: string; answer: string; type?: string; options?: string }) =>
      fetch(`${API_BASE}/grammar-questions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(res => res.json()),
    delete: (id: string) =>
      fetch(`${API_BASE}/grammar-questions/${id}`, { method: 'DELETE' }).then(res => res.json())
  },

  grammarPractice: {
    get: (studentId: string, count?: number) => {
      const query = new URLSearchParams();
      if (studentId) query.set('studentId', studentId);
      if (count) query.set('count', count.toString());
      return fetch(`${API_BASE}/grammar-practice?${query}`).then(res => res.json());
    }
  }
};
