import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import StudyAssistantPage from './pages/StudyAssistantPage';
import PDFSummaryPage from './pages/PDFSummaryPage';
import FlashcardsPage from './pages/FlashcardsPage';
import { AIProvider } from './contexts/AIContext';  // Fixed from ATProvider to AIProvider
import { FlashcardProvider } from './contexts/FlashcardContext';

function App() {
  return (
    <AIProvider>
      <FlashcardProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />  {/* Added closing /> */}
            <Route path="study-assistant" element={<StudyAssistantPage />} />  {/* Added closing /> */}
            <Route path="pdf-summary" element={<PDFSummaryPage />} />  {/* Added closing /> */}
            <Route path="flashcards" element={<FlashcardsPage />} />  {/* Added closing /> */}
          </Route>
        </Routes>
      </FlashcardProvider>
    </AIProvider>
  );
}

export default App;