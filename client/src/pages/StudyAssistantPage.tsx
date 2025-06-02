import React, { useState } from 'react';
import { useAI } from '../contexts/AIContext';

const StudyAssistantPage: React.FC = () => {
  const { messages, sendMessage, isLoading } = useAI();
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input);
      setInput('');
    }
  };

  return (
    <div>
      <div className="max-w-3xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-primary-900 mb-4">Study Assistant</h1>
        <p className="text-gray-600">
          Ask any academic question and get a concise, well-structured response from our AI study assistant.
          Perfect for clarifying concepts, preparing for exams, or deepening your understanding.
        </p>
      </div>
      
      {/* Chat Container */}
      <div className="max-w-3xl mx-auto border rounded-lg p-4 mb-4 h-96 overflow-y-auto bg-gray-50">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400">
            <p>Ask your first question to get started!</p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div 
              key={i} 
              className={`mb-3 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}
            >
              <div className={`inline-block px-4 py-2 rounded-lg max-w-xs md:max-w-md ${
                msg.sender === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-800'
              }`}>
                {msg.text}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="text-left p-2">
            <div className="inline-block px-4 py-2 bg-gray-200 rounded-lg text-gray-600">
              Thinking...
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="max-w-3xl mx-auto flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type your study question..."
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className={`px-4 py-2 rounded text-white ${
            isLoading || !input.trim() 
              ? 'bg-blue-300 cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default StudyAssistantPage;