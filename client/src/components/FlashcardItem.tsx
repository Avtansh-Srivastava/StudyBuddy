import React, { useState } from 'react';
import { Flashcard } from '../contexts/FlashcardContext';

type FlashcardItemProps = {
  flashcard: Flashcard;
  onEdit: (id: string, question: string, answer: string) => void;
  onDelete: (id: string) => void;
};

const FlashcardItem = ({ flashcard, onEdit, onDelete }: FlashcardItemProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showActions, setShowActions] = useState(false);

  return (
    <div 
      className="relative h-64"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Flashcard with flip animation */}
      <div 
        className={`absolute w-full h-full rounded-xl shadow-md transition-all duration-500 transform cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}
        style={{ transformStyle: 'preserve-3d' }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Front of card */}
        <div 
          className={`absolute w-full h-full backface-hidden flex flex-col justify-between p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl ${isFlipped ? 'opacity-0' : 'opacity-100'}`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="text-center flex-grow flex items-center justify-center">
            <p className="text-xl font-medium text-gray-800">{flashcard.question}</p>
          </div>
          <p className="text-sm text-gray-500 text-center mt-2">Click to flip</p>
        </div>
        
        {/* Back of card */}
        <div 
          className={`absolute w-full h-full backface-hidden flex flex-col justify-between p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl ${isFlipped ? 'opacity-100' : 'opacity-0'}`}
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)' 
          }}
        >
          <div className="text-center flex-grow flex items-center justify-center">
            <p className="text-lg text-gray-700">{flashcard.answer}</p>
          </div>
          <p className="text-sm text-gray-500 text-center mt-2">Click to flip back</p>
        </div>
      </div>
      
      {/* Action buttons (edit/delete) */}
      {showActions && (
        <div className="absolute top-3 right-3 flex gap-2 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(flashcard.id, flashcard.question, flashcard.answer);
            }}
            className="p-2 bg-white rounded-full shadow-md text-blue-500 hover:bg-blue-50 transition-colors"
            title="Edit flashcard"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(flashcard.id);
            }}
            className="p-2 bg-white rounded-full shadow-md text-red-500 hover:bg-red-50 transition-colors"
            title="Delete flashcard"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default FlashcardItem;