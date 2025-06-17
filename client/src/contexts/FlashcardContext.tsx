import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

// Define the backend URL
const BACKEND_URL = import.meta.env.VITE_API_URL;
console.log('BACKEND URL CONFIRMED:', BACKEND_URL);
console.log('All env vars:', import.meta.env);

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  createdAt: string;
}

interface FlashcardContextType {
  flashcards: Flashcard[];
  isLoading: boolean;
  error: string | null;
  addFlashcard: (question: string, answer: string) => Promise<void>;
  updateFlashcard: (id: string, question: string, answer: string) => Promise<void>;
  deleteFlashcard: (id: string) => Promise<void>;
  fetchFlashcards: () => Promise<void>;
}

const FlashcardContext = createContext<FlashcardContextType | undefined>(undefined);

export const FlashcardProvider = ({ children }: { children: React.ReactNode }) => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFlashcards = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('=== BACKEND CONNECTION TEST ===');
      const healthResponse = await fetch(`${BACKEND_URL}/health`);
      if (!healthResponse.ok) {
        throw new Error(`Health check failed: ${healthResponse.status}`);
      }
      const healthData = await healthResponse.json();
      console.log('Health check:', healthData);

      console.log('[FlashcardContext] Fetching flashcards:', `${BACKEND_URL}/api/flashcards`);
      const response = await fetch(`${BACKEND_URL}/api/flashcards`);
      if (!response.ok) {
        throw new Error(`Failed to fetch flashcards: ${response.status}`);
      }

      const data = await response.json();
      setFlashcards(data);
    } catch (err) {
      console.error('Flashcard fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load flashcards');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFlashcards();
  }, []);

  const addFlashcard = async (question: string, answer: string) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('[FlashcardContext] Adding flashcard:', { question, answer });
      if (!question || !answer) {
        throw new Error('Question and answer are required');
      }

      const response = await fetch(`${BACKEND_URL}/api/flashcards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, answer }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to add flashcard: ${response.status}`);
      }

      const newFlashcard = await response.json();
      setFlashcards(prev => [...prev, newFlashcard]);
      toast.success('Flashcard created!');
    } catch (err) {
      console.error('Add flashcard error:', err);
      setError(err instanceof Error ? err.message : 'Failed to add flashcard');
      toast.error('Can\'t create flashcard');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateFlashcard = async (id: string, question: string, answer: string) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('[FlashcardContext] Updating flashcard:', { id, question, answer });
      const response = await fetch(`${BACKEND_URL}/api/flashcards/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, answer }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update flashcard: ${response.status}`);
      }

      const updatedFlashcard = await response.json();
      setFlashcards(prev =>
        prev.map(card => card.id === id ? updatedFlashcard : card)
      );
      toast.success('Flashcard updated!');
    } catch (err) {
      console.error('Update flashcard error:', err);
      setError(err instanceof Error ? err.message : 'Failed to update flashcard');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteFlashcard = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('[FlashcardContext] Deleting flashcard:', id);
      const response = await fetch(`${BACKEND_URL}/api/flashcards/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete flashcard: ${response.status}`);
      }

      setFlashcards(prev => prev.filter(card => card.id !== id));
      toast.success('Flashcard deleted!');
    } catch (err) {
      console.error('Delete flashcard error:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete flashcard');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FlashcardContext.Provider 
      value={{ 
        flashcards, 
        isLoading, 
        error,
        addFlashcard, 
        updateFlashcard, 
        deleteFlashcard,
        fetchFlashcards
      }}
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