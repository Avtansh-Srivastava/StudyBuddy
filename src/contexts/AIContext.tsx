import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AIContextType {
  response: string | null;
  isLoading: boolean;
  error: string | null;
  askQuestion: (question: string) => Promise<void>;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Debug VITE_API_URL
  const VITE_API_URL = import.meta.env.VITE_API_URL || 'https://studybuddy-backend-8smv.onrender.com';
  console.log('[AIContext] BACKEND_URL:', VITE_API_URL);
  console.log('[AIContext] env vars:', import.meta.env);

  const askQuestion = async (question: string) => {
    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      console.log('[AIContext] Calling backend:', `${VITE_API_URL}/api/ask`, { question });
      const res = await fetch(`${VITE_API_URL}/api/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'AI request failed');
      }

      setResponse(data.response);
    } catch (err: any) { // Explicitly type err as any
      console.error('[AIContext] API Error:', err);
      setError(err.message || 'AI processing failed');
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
    throw new Error('useAI must be used within AIProvider');
  }
  return context;
};