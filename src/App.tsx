import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Home from "@/pages/Home";
import Daily from "@/pages/Daily";
import Vocabulary from "@/pages/Vocabulary";
import Papers from "@/pages/Papers";
import Statistics from "@/pages/Statistics";
import { useStore } from "@/store/useStore";

export default function App() {
  const { initializeVocabulary } = useStore();

  useEffect(() => {
    initializeVocabulary();
  }, [initializeVocabulary]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/daily" element={<Daily />} />
          <Route path="/vocabulary" element={<Vocabulary />} />
          <Route path="/papers" element={<Papers />} />
          <Route path="/statistics" element={<Statistics />} />
        </Routes>
      </div>
    </Router>
  );
}
