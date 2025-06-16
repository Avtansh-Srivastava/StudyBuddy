import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AIContextType {
  response: string;
  isLoading: boolean;
  error: string | null;
  askQuestion: (question: string) => Promise<void>;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIProvider = ({ children }: { children: ReactNode }) => {
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const askQuestion = async (question: string) => {
    setIsLoading(true);
    setError(null);
    setResponse('');
    
    try {
      console.log('[AIContext] Calling backend:', `${import.meta.env.VITE_BACKEND_URL}/api/ask`);
      
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }

      const data = await response.json();
      setResponse(data.response);
    } catch (err) {
      console.error('[AIContext] API Error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      throw err; // Re-throw to allow component-level handling
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AIContext.Provider value={{ response, isLoading, error, askQuestion }}>
      {children}
    </AIContext.Provider>
  );
};

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};