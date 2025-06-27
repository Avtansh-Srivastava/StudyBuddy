// client/src/pages/FlashcardsPage.tsx
import React, { useState } from 'react';
import { useFlashcards } from '../contexts/FlashcardContext';
import { Trash2, Edit, Check, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';

const FlashcardsPage = () => {
  const { flashcards, addFlashcard, updateFlashcard, deleteFlashcard } = useFlashcards();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState('');
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim() || !answer.trim()) {
      toast.error('Please enter both question and answer');
      return;
    }

    if (isEditing) {
      updateFlashcard(currentId, question, answer);
    } else {
      addFlashcard(question, answer);
    }

    resetForm();
  };

  const handleEdit = (id: string) => {
    const cardToEdit = flashcards.find(card => card.id === id);
    if (cardToEdit) {
      setQuestion(cardToEdit.question);
      setAnswer(cardToEdit.answer);
      setCurrentId(id);
      setIsEditing(true);
      // Scroll to form
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this flashcard?')) {
      deleteFlashcard(id);
    }
  };

  const toggleFlip = (id: string) => {
    setFlippedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const resetForm = () => {
    setQuestion('');
    setAnswer('');
    setIsEditing(false);
    setCurrentId('');
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Flashcards</h1>
        <p className="text-gray-600">Create, study, and master your knowledge</p>
      </div>

      {/* Flashcard Form */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {isEditing ? 'Edit Flashcard' : 'Create New Flashcard'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Question</label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Enter your question"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Answer</label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Enter the answer"
              required
            />
          </div>
          
          <div className="flex gap-3">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-1"
            >
              {isEditing ? (
                <>
                  <Check size={18} />
                  Update
                </>
              ) : (
                <>
                  <Plus size={18} />
                  Add Flashcard
                </>
              )}
            </button>
            
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Flashcards Grid */}
      {flashcards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flashcards.map((card) => (
            <div 
              key={card.id} 
              className={`relative bg-white rounded-xl shadow-md overflow-hidden h-64 cursor-pointer transition-all duration-300 ${flippedCards[card.id] ? 'bg-blue-50' : ''}`}
              onClick={() => toggleFlip(card.id)}
            >
              {/* Front of Card (Question) */}
              <div className={`absolute inset-0 p-6 flex flex-col transition-all duration-500 ${flippedCards[card.id] ? 'opacity-0' : 'opacity-100'}`}>
                <h3 className="font-semibold text-lg mb-2">Question</h3>
                <div className="flex-grow overflow-auto">
                  <p className="whitespace-pre-wrap">{card.question}</p>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Created: {new Date(card.createdAt).toLocaleDateString()}
                </div>
              </div>
              
              {/* Back of Card (Answer) */}
              <div className={`absolute inset-0 p-6 flex flex-col transition-all duration-500 ${flippedCards[card.id] ? 'opacity-100' : 'opacity-0'}`}>
                <h3 className="font-semibold text-lg mb-2">Answer</h3>
                <div className="flex-grow overflow-auto">
                  <p className="whitespace-pre-wrap">{card.answer}</p>
                </div>
                <div className="flex justify-between mt-4">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(card.id);
                    }}
                    className="text-blue-500 hover:text-blue-700 p-1"
                    title="Edit"
                  >
                    <Edit size={18} />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(card.id);
                    }}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              
              <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                Click to flip
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <div className="mb-4 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-600 text-lg">No flashcards yet. Create your first one!</p>
        </div>
      )}
    </div>
  );
};

export default FlashcardsPage;