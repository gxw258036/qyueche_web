const API_BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(`API请求失败: ${response.status}`);
  }
  
  return response.json();
}

export const api = {
  init: () => request('/init', { method: 'POST' }),
  
  settings: {
    get: () => request<any>('/settings'),
    update: (data: { currentGrade: number }) => 
      request('/settings', { method: 'PUT', body: JSON.stringify(data) }),
  },
  
  vocabulary: {
    list: (params?: { grade?: number; status?: string; search?: string }) => {
      const query = new URLSearchParams();
      if (params?.grade) query.append('grade', String(params.grade));
      if (params?.status) query.append('status', params.status);
      if (params?.search) query.append('search', params.search);
      return request<any[]>(`/vocabulary?${query.toString()}`);
    },
    
    create: (data: { word: string; meaning: string; grade: number; status?: string }) =>
      request('/vocabulary', { method: 'POST', body: JSON.stringify(data) }),
    
    update: (id: string, data: { word: string; meaning: string; grade: number; status: string }) =>
      request(`/vocabulary/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    
    delete: (id: string) =>
      request(`/vocabulary/${id}`, { method: 'DELETE' }),
    
    bulkCreate: (words: { word: string; meaning: string; grade: number }[]) =>
      request('/vocabulary/bulk', { method: 'POST', body: JSON.stringify({ words }) }),
  },
  
  dailyTask: {
    get: (grade: number) => request<any>(`/daily-task?grade=${grade}`),
    
    generate: (grade: number) =>
      request<any>('/daily-task/generate', { method: 'POST', body: JSON.stringify({ grade }) }),
    
    complete: (taskId: string, errorWordIds: string[]) =>
      request('/daily-task/complete', { 
        method: 'POST', 
        body: JSON.stringify({ taskId, errorWordIds }) 
      }),
  },
  
  statistics: {
    get: (grade: number) => request<any>(`/statistics?grade=${grade}`),
  },
};
