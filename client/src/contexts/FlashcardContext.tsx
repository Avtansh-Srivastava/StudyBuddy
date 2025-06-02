import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  createdAt: number;
  lastReviewed?: number;
}

interface FlashcardContextType {
  flashcards: Flashcard[];
  addFlashcard: (question: string, answer: string) => void;
  deleteFlashcard: (id: string) => void;
  clearAllFlashcards: () => void;
  exportFlashcards: () => string;
  importFlashcards: (jsonData: string) => boolean;
  updateLastReviewed: (id: string) => void;
}

const FlashcardContext = createContext<FlashcardContextType | undefined>(undefined);

export const FlashcardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);

  // Load flashcards from localStorage on mount
  useEffect(() => {
    const savedFlashcards = localStorage.getItem('flashcards');
    if (savedFlashcards) {
      try {
        setFlashcards(JSON.parse(savedFlashcards));
      } catch (e) {
        console.error('Failed to parse flashcards from localStorage', e);
      }
    }
  }, []);

  // Save flashcards to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('flashcards', JSON.stringify(flashcards));
  }, [flashcards]);

  const addFlashcard = (question: string, answer: string) => {
    const newFlashcard: Flashcard = {
      id: Date.now().toString(),
      question,
      answer,
      createdAt: Date.now(),
    };
    setFlashcards(prev => [...prev, newFlashcard]);
  };

  const deleteFlashcard = (id: string) => {
    setFlashcards(prev => prev.filter(card => card.id !== id));
  };

  const clearAllFlashcards = () => {
    if (window.confirm('Are you sure you want to delete all flashcards? This cannot be undone.')) {
      setFlashcards([]);
    }
  };

  const exportFlashcards = (): string => {
    return JSON.stringify(flashcards, null, 2);
  };

  const importFlashcards = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (Array.isArray(parsed) && parsed.every(isValidFlashcard)) {
        setFlashcards(parsed);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to import flashcards', e);
      return false;
    }
  };

  const updateLastReviewed = (id: string) => {
    setFlashcards(prev => 
      prev.map(card => 
        card.id === id ? { ...card, lastReviewed: Date.now() } : card
      )
    );
  };

  return (
    <FlashcardContext.Provider value={{
      flashcards,
      addFlashcard,
      deleteFlashcard,
      clearAllFlashcards,
      exportFlashcards,
      importFlashcards,
      updateLastReviewed
    }}>
      {children}
    </FlashcardContext.Provider>
  );
};

export const useFlashcards = (): FlashcardContextType => {
  const context = useContext(FlashcardContext);
  if (context === undefined) {
    throw new Error('useFlashcards must be used within a FlashcardProvider');
  }
  return context;
};

// Helper function to validate flashcard objects
function isValidFlashcard(card: any): card is Flashcard {
  return (
    typeof card === 'object' &&
    card !== null &&
    typeof card.id === 'string' &&
    typeof card.question === 'string' &&
    typeof card.answer === 'string' &&
    typeof card.createdAt === 'number' &&
    (card.lastReviewed === undefined || typeof card.lastReviewed === 'number')
  );
}