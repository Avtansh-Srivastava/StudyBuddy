import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the backend URL
const BACKEND_URL = import.meta.env.VITE_API_URL;
console.log('BACKEND URL CONFIRMED:', BACKEND_URL);
console.log('All env vars:', import.meta.env);

interface AIContextType {
  response: string;
  isLoading: boolean;
  error: string | null;
  askQuestion: (question: string) => Promise<void>;
  clearConversation: () => void;
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
      console.log('[AIContext] Calling backend:', `${BACKEND_URL}/api/ask`, { question });
      
      const response = await fetch(`${BACKEND_URL}/api/ask`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || 
          errorData.message || 
          `Request failed with status ${response.status}`
        );
      }

      const data = await response.json();
      
      if (!data.response) {
        throw new Error('Received empty response from AI');
      }
      
      setResponse(data.response);
      return data.response;
    } catch (err) {
      console.error('[AIContext] API Error:', err);
      const errorMessage = err instanceof Error ? 
        err.message : 
        'Failed to get response from AI';
      
      setError(errorMessage);
      setResponse(`Error: ${errorMessage}`);
      throw errorMessage;
    } finally {
      setIsLoading(false);
    }
  };

  const clearConversation = () => {
    setResponse('');
    setError(null);
  };

  return (
    <AIContext.Provider value={{ 
      response, 
      isLoading, 
      error, 
      askQuestion,
      clearConversation 
    }}>
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