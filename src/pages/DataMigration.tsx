import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Download, Upload, FileJson, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { ExportData } from '@/services/api';

const DataMigration: React.FC = () => {
  const { exportData, importData, students, vocabulary, dailyTaskHistory } = useStore();
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importText, setImportText] = useState('');
  const [showImportSuccess, setShowImportSuccess] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const data = await exportData();
      if (data) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vocabulary_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('导出失败:', error);
    }
    setExporting(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportFile(file);
      setImportText('');
    }
  };

  const handleImport = async () => {
    let data: ExportData | null = null;

    if (importFile) {
      try {
        const text = await importFile.text();
        data = JSON.parse(text);
      } catch (error) {
        alert('文件解析失败，请确保上传的是有效的JSON文件');
        return;
      }
    } else if (importText.trim()) {
      try {
        data = JSON.parse(importText);
      } catch (error) {
        alert('文本解析失败，请确保输入的是有效的JSON');
        return;
      }
    } else {
      alert('请选择文件或粘贴JSON数据');
      return;
    }

    if (!data.students || !Array.isArray(data.students)) {
      alert('无效的导入数据：缺少学生数据');
      return;
    }

    if (window.confirm('导入数据将覆盖现有数据，确定继续吗？')) {
      setImporting(true);
      try {
        await importData(data);
        setShowImportSuccess(true);
        setTimeout(() => setShowImportSuccess(false), 3000);
        setImportFile(null);
        setImportText('');
      } catch (error) {
        console.error('导入失败:', error);
      }
      setImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 lg:p-6 mb-4 sm:mb-5">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-1">数据迁移</h1>
          <p className="text-gray-600 text-xs sm:text-sm">导出/导入所有数据，支持不同环境间的数据迁移</p>
        </div>

        {/* 当前数据统计 */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">当前数据统计</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="text-2xl font-bold text-blue-600">{students.length}</div>
              <div className="text-sm text-blue-700">学生数量</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <div className="text-2xl font-bold text-green-600">{vocabulary.length}</div>
              <div className="text-sm text-green-700">词汇数量</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <div className="text-2xl font-bold text-purple-600">{dailyTaskHistory.length}</div>
              <div className="text-sm text-purple-700">学习记录</div>
            </div>
          </div>
        </div>

        {/* 导出功能 */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Download className="text-blue-600" size={24} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-800">导出数据</h2>
              <p className="text-sm text-gray-500">导出所有学生、词汇和学习记录</p>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FileJson size={16} className="text-gray-400" />
              <span>格式：JSON</span>
              <span className="text-gray-300">|</span>
              <span>包含：学生、词汇、学习记录、设置</span>
            </div>
          </div>

          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {exporting ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                导出中...
              </>
            ) : (
              <>
                <Download size={20} />
                导出数据
              </>
            )}
          </button>
        </div>

        {/* 导入功能 */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-orange-100 rounded-xl">
              <Upload className="text-orange-600" size={24} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-800">导入数据</h2>
              <p className="text-sm text-gray-500">导入之前导出的JSON数据文件</p>
            </div>
          </div>

          <div className="bg-red-50 rounded-xl p-4 mb-4">
            <div className="flex items-start gap-2">
              <AlertTriangle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-700">
                <strong>注意：</strong>导入操作将覆盖现有数据库中的所有数据，请确保已备份当前数据。
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* 文件上传 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">选择JSON文件</label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-orange-400 transition-colors cursor-pointer"
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <input
                  id="file-input"
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                <p className="text-gray-600 text-sm">点击或拖拽文件到此处</p>
                {importFile && (
                  <p className="text-green-600 text-sm mt-2">✓ 已选择: {importFile.name}</p>
                )}
              </div>
            </div>

            {/* 或者粘贴JSON */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">或粘贴JSON数据</label>
              <textarea
                value={importText}
                onChange={(e) => {
                  setImportText(e.target.value);
                  setImportFile(null);
                }}
                placeholder='{"version": "1.0", "students": [...], "vocabulary": [...], ...}'
                className="w-full h-32 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-mono"
              />
            </div>

            {/* 导入按钮 */}
            <button
              onClick={handleImport}
              disabled={importing}
              className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {importing ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  导入中...
                </>
              ) : (
                <>
                  <Upload size={20} />
                  导入数据
                </>
              )}
            </button>
          </div>

          {/* 成功提示 */}
          {showImportSuccess && (
            <div className="mt-4 flex items-center gap-2 p-3 bg-green-100 text-green-700 rounded-xl">
              <CheckCircle size={20} />
              数据导入成功！页面将自动刷新。
            </div>
          )}
        </div>

        {/* 使用说明 */}
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 sm:p-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">💡 使用说明</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• <strong>导出数据：</strong>点击"导出数据"按钮，将下载一个包含所有数据的JSON文件</li>
            <li>• <strong>导入数据：</strong>选择之前导出的JSON文件或粘贴JSON数据，然后点击"导入数据"</li>
            <li>• <strong>数据迁移：</strong>在源环境导出数据，然后在目标环境导入即可完成迁移</li>
            <li>• <strong>备份建议：</strong>在进行导入操作前，建议先导出当前数据作为备份</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DataMigration;
