import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'react-hot-toast';

// Define and export Flashcard interface
export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  createdAt: string;
}

interface FlashcardContextType {
  flashcards: Flashcard[];
  addFlashcard: (question: string, answer: string) => Promise<void>;
  updateFlashcard: (id: string, question: string, answer: string) => Promise<void>;
  deleteFlashcard: (id: string) => Promise<void>;
  error: string | null;
  isLoading: boolean;
}

const FlashcardContext = createContext<FlashcardContextType | undefined>(undefined);

export const FlashcardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Hardcode backend URL to avoid undefined issues
  const VITE_API_URL = 'https://studybuddy-backend-8smv.onrender.com';

  console.log('[FlashcardContext] VITE_API_URL:', VITE_API_URL);

  useEffect(() => {
    const fetchFlashcards = async () => {
      setIsLoading(true);
      try {
        console.log('[FlashcardContext] Fetching flashcards:', `${VITE_API_URL}/api/flashcards`);
        const response = await fetch(`${VITE_API_URL}/api/flashcards`);
        const text = await response.text();
        console.log('[FlashcardContext] Raw response:', text);
        if (!response.ok) throw new Error(`Failed to fetch flashcards: ${response.status}`);
        const data = JSON.parse(text);
        setFlashcards(data);
      } catch (err: any) {
        console.error('[FlashcardContext] Fetch error:', err.message);
        setError(err.message || 'Failed to load flashcards');
        toast.error('Failed to load flashcards');
      } finally {
        setIsLoading(false);
      }
    };
    fetchFlashcards();
  }, []);

  const addFlashcard = async (question: string, answer: string) => {
    setIsLoading(true);
    try {
      console.log('[FlashcardContext] Adding flashcard:', { question, answer });
      const response = await fetch(`${VITE_API_URL}/api/flashcards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, answer }),
      });
      const text = await response.text();
      console.log('[FlashcardContext] Add response:', text);
      if (!response.ok) throw new Error(`Failed to add flashcard: ${response.status}`);
      const data = JSON.parse(text);
      setFlashcards([...flashcards, data]);
      toast.success('Flashcard created successfully!');
    } catch (err: any) {
      console.error('[FlashcardContext] Add error:', err.message);
      setError(err.message || 'Failed to add flashcard');
      toast.error('Failed to add flashcard');
    } finally {
      setIsLoading(false);
    }
  };

  const updateFlashcard = async (id: string, question: string, answer: string) => {
    setIsLoading(true);
    try {
      console.log('[FlashcardContext] Updating flashcard:', { id, question, answer });
      const response = await fetch(`${VITE_API_URL}/api/flashcards/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, answer }),
      });
      const text = await response.text();
      console.log('[FlashcardContext] Update response:', text);
      if (!response.ok) throw new Error(`Failed to update flashcard: ${response.status}`);
      const data = JSON.parse(text);
      setFlashcards(flashcards.map((card) => (card.id === id ? data : card)));
      toast.success('Flashcard updated successfully!');
    } catch (err: any) {
      console.error('[FlashcardContext] Update error:', err.message);
      setError(err.message || 'Failed to update flashcard');
      toast.error('Failed to update flashcard');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteFlashcard = async (id: string) => {
    setIsLoading(true);
    try {
      console.log('[FlashcardContext] Deleting flashcard:', id);
      const response = await fetch(`${VITE_API_URL}/api/flashcards/${id}`, {
        method: 'DELETE',
      });
      const text = await response.text();
      console.log('[FlashcardContext] Delete response:', text);
      if (!response.ok) throw new Error(`Failed to delete flashcard: ${response.status}`);
      setFlashcards(flashcards.filter((card) => (card.id !== id)));
      toast.success('Flashcard deleted successfully!');
    } catch (err: any) {
      console.error('[FlashcardContext] Delete error:', err.message);
      setError(err.message || 'Failed to delete flashcard');
      toast.error('Failed to delete flashcard');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FlashcardContext.Provider value={{ flashcards, addFlashcard, updateFlashcard, deleteFlashcard, error, isLoading }}>
      {children}
    </FlashcardContext.Provider>
  );
};

export const useFlashcards = () => {
  const context = useContext(FlashcardContext);
  if (!context) {
    throw new Error('useFlashcards must be used within FlashcardProvider');
  }
  return context;
};