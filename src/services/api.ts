import { Vocabulary, DailyTask, Settings, Statistics, Student, DailyTaskHistory } from '@/types';

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
  }
};
