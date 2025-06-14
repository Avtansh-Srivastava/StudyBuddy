import React, { useState, useRef } from 'react';
import { Send, Loader2, Plus } from 'lucide-react';
import { useAI } from '../contexts/AIContext';
import { useFlashcards } from '../contexts/FlashcardContext';
import ReactMarkdown from 'react-markdown';

const StudyAssistant: React.FC = () => {
  const [question, setQuestion] = useState('');
  const { isLoading, response, error, askQuestion } = useAI();
  const { addFlashcard } = useFlashcards();
  const responseRef = useRef<HTMLDivElement>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;
    
    await askQuestion(question);
    setQuestion('');
    
    // Scroll to response after a short delay to allow rendering
    setTimeout(() => {
      responseRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };
  
  const handleCreateFlashcard = () => {
    addFlashcard(question, response);
    alert('Flashcard created! You can view it in the Flashcards section.');
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="card bg-base-100 shadow-md">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-6">Study Assistant</h2>
          
          <form onSubmit={handleSubmit} className="mb-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text text-base">Ask any study question</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g., Explain Newton's laws of motion"
                  className="input input-bordered flex-grow"
                  disabled={isLoading}
                />
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={isLoading || !question.trim()}
                >
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                </button>
              </div>
            </div>
          </form>
          
          {error && (
            <div className="alert alert-error mb-4">
              <span>{error}</span>
            </div>
          )}
          
          {response && (
            <div ref={responseRef} className="mt-4">
              <div className="bg-primary-50 rounded-lg p-6">
                <div className="prose max-w-none">
                  <ReactMarkdown>{response}</ReactMarkdown>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleCreateFlashcard}
                    className="btn btn-outline btn-primary btn-sm"
                  >
                    <Plus size={16} className="mr-1" />
                    Create Flashcard
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-2">Example Questions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {['Explain photosynthesis', 'What is the law of conservation of energy?', 
                'Describe the water cycle', 'What are the key principles of quantum mechanics?'].map((q) => (
                <button
                  key={q}
                  onClick={() => setQuestion(q)}
                  className="btn btn-outline btn-sm"
                  disabled={isLoading}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyAssistant;