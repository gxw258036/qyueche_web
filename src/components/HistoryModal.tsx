import React, { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { X, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import { DailyTaskHistory } from '@/types';

interface HistoryModalProps {
  onClose: () => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ onClose }) => {
  const { loadDailyTaskHistory } = useStore();
  const [history, setHistory] = useState<DailyTaskHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      const data = await loadDailyTaskHistory(30);
      setHistory(data);
      setLoading(false);
    };
    fetchHistory();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Calendar className="text-purple-500" size={28} />
            默写历史记录
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(80vh-80px)] p-6">
          {loading ? (
            <div className="text-center py-12 text-gray-500">加载中...</div>
          ) : history.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              暂无历史记录
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((task) => (
                <div
                  key={task.id}
                  className="bg-gray-50 rounded-xl p-4 border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Calendar size={18} />
                      <span className="font-medium">{formatDate(task.date)}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {task.grade}年级
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-3 text-center border">
                      <div className="text-2xl font-bold text-gray-800">{task.totalCount}</div>
                      <div className="text-sm text-gray-500">总词汇</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 text-center border border-green-200">
                      <div className="text-2xl font-bold text-green-600 flex items-center justify-center gap-1">
                        <CheckCircle2 size={20} />
                        {task.correctCount}
                      </div>
                      <div className="text-sm text-green-600">正确</div>
                    </div>
                    <div className="bg-red-50 rounded-lg p-3 text-center border border-red-200">
                      <div className="text-2xl font-bold text-red-600 flex items-center justify-center gap-1">
                        <XCircle size={20} />
                        {task.errorCount}
                      </div>
                      <div className="text-sm text-red-600">错误</div>
                    </div>
                  </div>

                  <div className="mt-3 text-center">
                    <div className="inline-block px-4 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                      正确率: {task.totalCount > 0 ? Math.round((task.correctCount / task.totalCount) * 100) : 0}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;
