import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import StudyAssistantPage from './pages/StudyAssistantPage';
import PDFSummaryPage from './pages/PDFSummaryPage';
import FlashcardsPage from './pages/FlashcardsPage';
import { AIProvider } from './contexts/AIContext';
import { FlashcardProvider } from './contexts/FlashcardContext';

function App() {
  // ===== CRITICAL DEBUG CODE =====
  useEffect(() => {
    console.log("=== BACKEND CONNECTION TEST ===");
    fetch("https://studybuddy-backend-8smv.onrender.com/health")
      .then(res => {
        console.log("Response status:", res.status);
        return res.json();
      })
      .then(data => console.log("BACKEND SUCCESS:", data))
      .catch(err => console.error("BACKEND ERROR:", err));
  }, []);
  // ==============================

  return (
    <AIProvider>
      <FlashcardProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="study-assistant" element={<StudyAssistantPage />} />
            <Route path="pdf-summary" element={<PDFSummaryPage />} />
            <Route path="flashcards" element={<FlashcardsPage />} />
          </Route>
        </Routes>
      </FlashcardProvider>
    </AIProvider>
  );
}

export default App;