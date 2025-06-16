import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Plus, Check } from 'lucide-react';
import { useAI } from '../contexts/AIContext';
import { useFlashcards } from '../contexts/FlashcardContext';
import ReactMarkdown from 'react-markdown';
import { toast } from 'react-hot-toast';

const StudyAssistantPage: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [flashcardCreated, setFlashcardCreated] = useState(false);
  const { isLoading, response, error, askQuestion } = useAI();
  const { addFlashcard } = useFlashcards();
  const responseRef = useRef<HTMLDivElement>(null);
  
  // Reset flashcard state when question changes
  useEffect(() => {
    setFlashcardCreated(false);
  }, [question]);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!question.trim() || isLoading) return;
  
  try {
    console.log("=== STUDY ASSISTANT DEBUG ===");
    console.log("Question:", question);
    console.log("Using backend URL:", import.meta.env.VITE_BACKEND_URL);
    console.log("Full API endpoint:", `${import.meta.env.VITE_BACKEND_URL}/api/ask`);
    
    await askQuestion(question);
    setQuestion('');
    setFlashcardCreated(false);
    
    setTimeout(() => {
      responseRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  } catch (err) {
    console.error("API Error Details:", err);
    
    // Type-safe error handling
    if (err instanceof Error) {
      console.error("Error message:", err.message);
      console.error("Error stack:", err.stack);
    } else if (typeof err === 'object' && err !== null) {
      console.error("Error keys:", Object.keys(err));
    } else {
      console.error("Error type:", typeof err);
    }
    
    toast.error('Failed to get response from AI');
  }
};
  const handleCreateFlashcard = async () => {
    if (!response) return;
    
    try {
      await addFlashcard(question, response);
      setFlashcardCreated(true);
      toast.success('Flashcard created! View in Flashcards section');
    } catch (err) {
      console.error("Flashcard Error:", err);
      toast.error('Failed to create flashcard');
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
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
              <div className="flex-1">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-6 h-6 mx-2 stroke-current">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path>
                </svg>
                <label>
                  {error.includes('404') 
                    ? "API endpoint not found - please check backend" 
                    : error}
                </label>
              </div>
            </div>
          )}
          
          {response && (
            <div ref={responseRef} className="mt-4 transition-all duration-300">
              <div className="bg-base-200 rounded-lg p-6 shadow-sm">
                <div className="prose max-w-none">
                  <ReactMarkdown>{response}</ReactMarkdown>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleCreateFlashcard}
                    className={`btn btn-sm ${
                      flashcardCreated 
                        ? 'btn-success' 
                        : 'btn-outline btn-primary'
                    }`}
                    disabled={flashcardCreated}
                  >
                    {flashcardCreated ? (
                      <>
                        <Check size={16} className="mr-1" />
                        Saved!
                      </>
                    ) : (
                      <>
                        <Plus size={16} className="mr-1" />
                        Create Flashcard
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-2">Example Questions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                'Explain photosynthesis in simple terms',
                'What is the law of conservation of energy?', 
                'Describe the water cycle process',
                'What are the key principles of quantum mechanics?'
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => setQuestion(q)}
                  className="btn btn-outline btn-sm truncate"
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

export default StudyAssistantPage;