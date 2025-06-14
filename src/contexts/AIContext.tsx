import React, { createContext, useState, useContext } from 'react';

type Message = {
  sender: 'user' | 'ai';
  text: string;
};

type AIContextType = {
  messages: Message[];
  sendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
};

const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIProvider = ({ children }: { children: React.ReactNode }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (text: string) => {
    setIsLoading(true);
    const userMessage: Message = { sender: 'user', text };
    setMessages(prev => [...prev, userMessage]);
    
    try {
      const response = await fetch('http://localhost:3000/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text })
      });
      const data = await response.json();
      setMessages(prev => [...prev, { sender: 'ai', text: data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        sender: 'ai', 
        text: 'Error: ' + (error instanceof Error ? error.message : 'Failed to get response')
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AIContext.Provider value={{ messages, sendMessage, isLoading }}>
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