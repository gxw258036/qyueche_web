import { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import Navbar from '@/components/Navbar';
import Home from '@/pages/Home';
import Daily from '@/pages/Daily';
import Vocabulary from '@/pages/Vocabulary';
import Papers from '@/pages/Papers';
import Statistics from '@/pages/Statistics';
import Students from '@/pages/Students';

function App() {
  const { loadSettings, loadStudents, loadVocabulary, loadDailyTask, loadStatistics, error, clearError } = useStore();

  useEffect(() => {
    const init = async () => {
      await loadSettings();
      await loadStudents();
      await loadVocabulary();
      await loadDailyTask();
      await loadStatistics();
    };
    init();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {error && (
        <div className="fixed top-0 left-0 right-0 bg-red-500 text-white p-3 z-50 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={clearError} className="text-white hover:text-gray-200">×</button>
        </div>
      )}
      <Navbar />
      <main className="pt-16">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/daily" element={<Daily />} />
          <Route path="/vocabulary" element={<Vocabulary />} />
          <Route path="/papers" element={<Papers />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/students" element={<Students />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
