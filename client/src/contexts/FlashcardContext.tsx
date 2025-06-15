// client/src/contexts/FlashcardContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  createdAt: Date;
}

interface FlashcardContextType {
  flashcards: Flashcard[];
  addFlashcard: (question: string, answer: string) => void;
  updateFlashcard: (id: string, question: string, answer: string) => void;
  deleteFlashcard: (id: string) => void;
}

const FlashcardContext = createContext<FlashcardContextType | undefined>(undefined);

export const FlashcardProvider = ({ children }: { children: React.ReactNode }) => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>(() => {
    // Load from localStorage on initial render
    const saved = localStorage.getItem('flashcards');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Convert string dates back to Date objects
        return parsed.map((card: any) => ({
          ...card,
          createdAt: new Date(card.createdAt)
        }));
      } catch (error) {
        console.error('Failed to parse flashcards', error);
        return [];
      }
    }
    return [];
  });

  // Save to localStorage whenever flashcards change
  useEffect(() => {
    localStorage.setItem('flashcards', JSON.stringify(flashcards));
  }, [flashcards]);

  const addFlashcard = (question: string, answer: string) => {
    const newFlashcard: Flashcard = {
      id: Date.now().toString(),
      question,
      answer,
      createdAt: new Date()
    };
    setFlashcards(prev => [...prev, newFlashcard]);
    toast.success('Flashcard created!');
  };

  const updateFlashcard = (id: string, question: string, answer: string) => {
    setFlashcards(prev =>
      prev.map(card =>
        card.id === id ? { ...card, question, answer } : card
      )
    );
    toast.success('Flashcard updated!');
  };

  const deleteFlashcard = (id: string) => {
    setFlashcards(prev => prev.filter(card => card.id !== id));
    toast.success('Flashcard deleted!');
  };

  return (
    <FlashcardContext.Provider 
      value={{ flashcards, addFlashcard, updateFlashcard, deleteFlashcard }}
    >
      {children}
    </FlashcardContext.Provider>
  );
};

export const useFlashcards = () => {
  const context = useContext(FlashcardContext);
  if (!context) {
    throw new Error('useFlashcards must be used within a FlashcardProvider');
  }
  return context;
};